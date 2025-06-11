import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "src/pages/api/auth/[...nextauth]";

/*
 * Get a single contact form message
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const message = await prisma.contactFormMessage.findUnique({
      where: {
        id: params.id,
      },
      include: {
        category: true,
      },
    });

    if (!message) {
      return NextResponse.json(
        { message: "Contact form message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error fetching contact form message:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/*
 * Delete a contact form message (soft delete by setting deletedAt)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Message ID is required" },
        { status: 400 }
      );
    }

    // Soft delete by setting deletedAt
    await prisma.contactFormMessage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact form message:", error);
    return NextResponse.json(
      {
        message: "Failed to delete contact form message",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
