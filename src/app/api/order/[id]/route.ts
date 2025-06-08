import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismadb";
import { authOptions } from "src/pages/api/auth/[...nextauth]";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { z } from "zod";

// Schema for order update
const orderUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  trackingNumber: z.string().optional(),
  estimatedDeliveryDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// GET /api/order/[id] - Get order details
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await Promise.resolve(context.params);

    const order = await prisma.order.findFirst({
      where: {
        id: id,
        userId: session.user.id,
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
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/order/[id] - Update order status and details
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await Promise.resolve(context.params);
    const data = await request.json();
    const validatedData = orderUpdateSchema.parse(data);

    // Verify order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: {
        id: id,
      },
      data: {
        ...validatedData,
        estimatedDeliveryDate: validatedData.estimatedDeliveryDate
          ? new Date(validatedData.estimatedDeliveryDate)
          : undefined,
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
        payment: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating order:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/order/[id] - Cancel an order
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await Promise.resolve(context.params);

    // Verify order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Only allow cancellation of pending orders
    if (order.status !== OrderStatus.PENDING) {
      return NextResponse.json(
        { message: "Only pending orders can be cancelled" },
        { status: 400 }
      );
    }

    // Update order status to cancelled
    const cancelledOrder = await prisma.order.update({
      where: {
        id: id,
      },
      data: {
        status: OrderStatus.CANCELLED,
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
        payment: true,
      },
    });

    return NextResponse.json(cancelledOrder);
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
