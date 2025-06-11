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
