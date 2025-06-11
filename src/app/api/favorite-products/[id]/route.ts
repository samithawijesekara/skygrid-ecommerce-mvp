import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "src/pages/api/auth/[...nextauth]";

/*
 * Remove a product from favorites (soft delete)
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

    // Check if favorite exists and belongs to user
    const favorite = await prisma.favoriteProduct.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { message: "Favorite product not found" },
        { status: 404 }
      );
    }

    // Soft delete by setting deletedAt
    await prisma.favoriteProduct.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      message: "Product removed from favorites successfully",
    });
  } catch (error) {
    console.error("Error removing product from favorites:", error);
    return NextResponse.json(
      {
        message: "Failed to remove product from favorites",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
