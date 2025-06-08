import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismadb";
import { z } from "zod";
import { authOptions } from "src/pages/api/auth/[...nextauth]";
import { Prisma, OrderStatus, Cart, CartItem, Product } from "@prisma/client";

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  isPublished: z.boolean().default(false),
  coverImage: z.string().nullable().optional(),
});

// Schema for order creation
const orderSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    phone: z.string().optional(),
  }),
  billingAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    phone: z.string().optional(),
  }),
  notes: z.string().optional(),
});

type CartWithItems = Cart & {
  items: (CartItem & {
    product: Pick<Product, "id" | "title" | "price">;
  })[];
};

/*
 * Create a new blog article
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const isPublished = formData.get("isPublished") === "true";
    const coverImage = formData.get("coverImage") as string | null;
    const categoryIds = formData.getAll("categoryIds[]") as string[];

    // Validate the data
    const validatedData = productSchema.parse({
      title,
      content,
      categoryIds,
      isPublished,
      coverImage,
    });

    const product = await prisma.product.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        isPublished: validatedData.isPublished,
        coverImage: validatedData.coverImage,
        createdById: session.user.id,
        categories: {
          create: validatedData.categoryIds.map((categoryId) => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/*
 * Get all blogs with pagination, search, and sorting
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const take = parseInt(searchParams.get("take") || "5");
    const searchValue = searchParams.get("searchValue") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const isAdmin = searchParams.get("isAdmin") === "true";

    const skip = (page - 1) * take;

    const where: Prisma.ProductWhereInput = {
      AND: [
        searchValue
          ? {
              OR: [
                {
                  title: {
                    contains: searchValue,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  content: {
                    contains: searchValue,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            }
          : {},
        isAdmin ? {} : { isPublished: true },
      ],
    };

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / take);

    return NextResponse.json({
      items,
      total,
      page,
      limit: take,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/order - Create a new order from cart
export async function POSTOrder(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = orderSchema.parse(data);

    // Get user's cart with items
    const cart = (await prisma.cart.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
        },
      },
    })) as CartWithItems | null;

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce(
      (sum: number, item: CartWithItems["items"][0]) =>
        sum + item.quantity * (item.product.price || 0),
      0
    );

    // Generate unique order number (you might want to implement a more sophisticated system)
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          totalAmount,
          shippingAddress: validatedData.shippingAddress,
          billingAddress: validatedData.billingAddress,
          notes: validatedData.notes,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.price || 0,
              totalPrice: item.quantity * (item.product.price || 0),
            })),
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  categories: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return newOrder;
    });

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/order - Get user's orders with pagination and filtering
export async function GETOrder(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const take = parseInt(searchParams.get("take") || "10");
    const status = searchParams.get("status") as OrderStatus | null;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const skip = (page - 1) * take;

    const where: Prisma.OrderWhereInput = {
      userId: session.user.id,
      ...(status ? { status } : {}),
    };

    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order },
        include: {
          items: {
            include: {
              product: {
                include: {
                  categories: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
            },
          },
          payment: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / take);

    return NextResponse.json({
      items,
      total,
      page,
      limit: take,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
