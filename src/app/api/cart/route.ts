import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismadb";
import { z } from "zod";
import { authOptions } from "src/pages/api/auth/[...nextauth]";
import { Prisma } from "@prisma/client";

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  isPublished: z.boolean().default(false),
  coverImage: z.string().nullable().optional(),
});

/*
 * Create a new blog article
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity } = await request.json();

    if (!productId || typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json(
        { message: "Invalid product ID or quantity" },
        { status: 400 }
      );
    }

    // Verify product exists and is published
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isPublished: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found or not available" },
        { status: 404 }
      );
    }

    // Get or create cart for the user
    const cart = await prisma.cart.upsert({
      where: {
        userId: session.user.id,
      },
      create: {
        userId: session.user.id,
      },
      update: {},
    });

    // Add or update cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
      create: {
        cartId: cart.id,
        productId: product.id,
        quantity,
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
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
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Error adding item to cart:", error);
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

    // Get or create cart for the user
    const cart = await prisma.cart.upsert({
      where: {
        userId: session.user.id,
      },
      create: {
        userId: session.user.id,
      },
      update: {},
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

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear the entire cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Delete all items in the cart
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json(
      { message: "Cart cleared successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
