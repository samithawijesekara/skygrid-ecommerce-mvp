import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "src/pages/api/auth/[...nextauth]";

/*
 * Get a single shipping address
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
        id: params.id,
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
  { params }: { params: { id: string } }
) {
  try {
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

    // Check if address exists and belongs to user
    const existingAddress = await prisma.shippingAddress.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { message: "Shipping address not found" },
        { status: 404 }
      );
    }

    // If this is going to be the default address, unset any existing default
    if (isDefault) {
      await prisma.shippingAddress.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
          id: { not: params.id }, // Don't update the current address
        },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.shippingAddress.update({
      where: { id: params.id },
      data: {
        street,
        city,
        state,
        country,
        postalCode,
        phone,
        isDefault: isDefault || false,
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
 * Delete a shipping address (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    const existingAddress = await prisma.shippingAddress.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!existingAddress) {
      return NextResponse.json(
        { message: "Shipping address not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting deletedAt
    await prisma.shippingAddress.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    // If the deleted address was the default, set another address as default
    if (existingAddress.isDefault) {
      const nextAddress = await prisma.shippingAddress.findFirst({
        where: {
          userId: user.id,
          deletedAt: null,
          id: { not: params.id },
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
