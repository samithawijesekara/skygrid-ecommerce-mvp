import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "src/pages/api/auth/[...nextauth]";

/*
 * Create a new contact form message
 */
export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, categoryId } = await request.json();

    if (!name || !email || !message || !categoryId) {
      return NextResponse.json(
        { message: "Name, email, message and categoryId are required" },
        { status: 400 }
      );
    }

    const contactMessage = await prisma.contactFormMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(contactMessage, { status: 201 });
  } catch (error) {
    console.error("Error creating contact message:", error);
    return NextResponse.json(
      {
        message: "Failed to create contact message",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/*
 * Get all contact form messages with pagination, search, and sorting
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Normal parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const take = parseInt(searchParams.get("take") || "10");
    const searchValue = searchParams.get("searchValue") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const skip = (page - 1) * take;

    // Build the where clause for search
    const whereClause: any = {};

    // Handle search
    if (searchValue) {
      whereClause.OR = [
        { name: { contains: searchValue, mode: "insensitive" } },
        { email: { contains: searchValue, mode: "insensitive" } },
        { subject: { contains: searchValue, mode: "insensitive" } },
        { message: { contains: searchValue, mode: "insensitive" } },
      ];
    }

    // Handle sorting
    let orderBy: any = {};
    orderBy = { [sortBy]: order };

    const [messages, total] = await Promise.all([
      prisma.contactFormMessage.findMany({
        where: whereClause,
        skip,
        take,
        orderBy,
        include: {
          category: true,
        },
      }),
      prisma.contactFormMessage.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      items: messages,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch contact messages",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/*
 * Update a contact form message's read status as bulk or single
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { messageIds, isRead } = await request.json();

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { message: "Message IDs array is required and must not be empty" },
        { status: 400 }
      );
    }

    if (typeof isRead !== "boolean") {
      return NextResponse.json(
        { message: "isRead status is required and must be a boolean" },
        { status: 400 }
      );
    }

    // First, check if the message exists at all
    const allMessages = await prisma.contactFormMessage.findMany({
      where: {
        id: {
          in: messageIds,
        },
      },
      select: {
        id: true,
        isRead: true,
        deletedAt: true,
      },
    });

    if (allMessages.length === 0) {
      return NextResponse.json(
        {
          message: "No messages found with the provided IDs",
          searchedIds: messageIds,
        },
        { status: 404 }
      );
    }

    // Update all messages in the array
    const updatedMessages = await prisma.contactFormMessage.updateMany({
      where: {
        id: {
          in: messageIds,
        },
        // deletedAt: null, // Only update non-deleted messages
      },
      data: {
        isRead,
        updatedAt: new Date(),
      },
    });

    // Verify the update
    const updatedMessagesAfter = await prisma.contactFormMessage.findMany({
      where: {
        id: {
          in: messageIds,
        },
        // deletedAt: null,
      },
      select: {
        id: true,
        isRead: true,
      },
    });

    console.log("Messages after update:", updatedMessagesAfter);

    return NextResponse.json({
      message: "Messages updated successfully",
      count: updatedMessages.count,
      updatedIds: messageIds,
      beforeUpdate: allMessages,
      afterUpdate: updatedMessagesAfter,
    });
  } catch (error) {
    console.error("Error bulk updating contact form messages:", error);
    return NextResponse.json(
      {
        message: "Failed to update contact form messages",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
