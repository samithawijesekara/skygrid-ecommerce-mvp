import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "src/pages/api/auth/[...nextauth]";

/*
 * Get a single shipping address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const address = await prisma.shippingAddress.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!address) {
      return NextResponse.json(
        { message: "Shipping address not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error("Error fetching shipping address:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/*
 * Update a shipping address
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: addressId } = await params;
    if (!addressId) {
      return NextResponse.json(
        { message: "Address ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { street, city, state, country, postalCode, phone, isDefault } =
      await request.json();

    if (!street || !city || !country || !postalCode) {
      return NextResponse.json(
        { message: "Street, city, country, and postal code are required" },
        { status: 400 }
      );
    }

    // First check if the address exists at all
    const addressExists = await prisma.shippingAddress.findUnique({
      where: { id: addressId },
      select: {
        id: true,
        userId: true,
        deletedAt: true,
        street: true,
        city: true,
        country: true,
        isDefault: true,
      },
    });

    if (!addressExists) {
      return NextResponse.json(
        { message: "Shipping address not found" },
        { status: 404 }
      );
    }

    // Direct comparison of user IDs
    const userIdsMatch = addressExists.userId === user.id;
    if (!userIdsMatch || addressExists.deletedAt) {
      return NextResponse.json(
        {
          message: "You don't have permission to update this address",
          details: {
            addressExists: true,
            addressUserId: addressExists.userId,
            currentUserId: user.id,
            userIdsMatch,
            isDeleted: !!addressExists.deletedAt,
          },
        },
        { status: 403 }
      );
    }

    // Handle default address logic
    if (isDefault) {
      // First, unset any existing default address
      await prisma.shippingAddress.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
          id: { not: addressId },
          deletedAt: null,
        },
        data: { isDefault: false },
      });
    } else if (addressExists.isDefault) {
      // If this was the default address and we're unsetting it,
      // find another address to make default
      const nextAddress = await prisma.shippingAddress.findFirst({
        where: {
          userId: user.id,
          id: { not: addressId },
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
      });

      if (nextAddress) {
        await prisma.shippingAddress.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    // Update the address
    const updatedAddress = await prisma.shippingAddress.update({
      where: { id: addressId },
      data: {
        street,
        city,
        state,
        country,
        postalCode,
        phone,
        isDefault: isDefault ?? addressExists.isDefault, // Keep existing default status if not specified
      },
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error("Error updating shipping address:", error);
    return NextResponse.json(
      {
        message: "Failed to update shipping address",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/*
 * Delete a shipping address (hard delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: addressId } = await params;
    if (!addressId) {
      return NextResponse.json(
        { message: "Address ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if address exists and belongs to user
    const addressExists = await prisma.shippingAddress.findUnique({
      where: { id: addressId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!addressExists) {
      return NextResponse.json(
        { message: "Shipping address not found" },
        { status: 404 }
      );
    }

    // Check if address belongs to user
    const userIdsMatch = addressExists.userId === user.id;
    if (!userIdsMatch) {
      return NextResponse.json(
        {
          message: "You don't have permission to delete this address",
          details: {
            addressExists: true,
            addressUserId: addressExists.userId,
            currentUserId: user.id,
            userIdsMatch,
          },
        },
        { status: 403 }
      );
    }

    // Perform hard delete
    await prisma.shippingAddress.delete({
      where: { id: addressId },
    });

    return NextResponse.json({
      message: "Shipping address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting shipping address:", error);
    return NextResponse.json(
      {
        message: "Failed to delete shipping address",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
