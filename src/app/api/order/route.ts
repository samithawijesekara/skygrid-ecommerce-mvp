import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismadb";
import { z } from "zod";
import { authOptions } from "src/pages/api/auth/[...nextauth]";
import { Prisma, OrderStatus, Cart, CartItem, Product } from "@prisma/client";

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

// POST /api/order - Create a new order from cart
export async function POST(request: NextRequest) {
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
export async function GET(request: NextRequest) {
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
