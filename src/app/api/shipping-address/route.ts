import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "src/pages/api/auth/[...nextauth]";

/*
 * Create a new shipping address
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { street, city, state, country, postalCode, phone, isDefault } =
      await request.json();

    if (!street || !city || !country || !postalCode) {
      return NextResponse.json(
        { message: "Street, city, country, and postal code are required" },
        { status: 400 }
      );
    }

    // Get user ID from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // If this is going to be the default address, unset any existing default
    if (isDefault) {
      await prisma.shippingAddress.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.shippingAddress.create({
      data: {
        userId: user.id,
        street,
        city,
        state,
        country,
        postalCode,
        phone,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error("Error creating shipping address:", error);
    return NextResponse.json(
      {
        message: "Failed to create shipping address",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/*
 * Get all shipping addresses for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("00 session", session);

    // Get user ID from session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    console.log("01 user", user);

    const addresses = await prisma.shippingAddress.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    console.log("02 addresses", addresses);

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching shipping addresses:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch shipping addresses",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
