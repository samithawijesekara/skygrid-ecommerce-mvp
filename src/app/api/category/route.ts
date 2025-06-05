import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

/*
 * Create a new category
 */
export async function POST(request: NextRequest) {
  try {
    const { name, description, createdById } = await request.json();

    if (!name || !createdById) {
      return NextResponse.json(
        { message: "Name and CreatedById are required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        createdById,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        message: "Failed to create category",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/*
 * Get all categories with pagination, search, and sorting
 */
export async function GET(request: NextRequest) {
  try {
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
        { description: { contains: searchValue, mode: "insensitive" } },
      ];
    }

    // Handle sorting
    let orderBy: any = {};
    orderBy = { [sortBy]: order };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where: whereClause,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          name: true,
          description: true,
          createdById: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      prisma.category.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      items: categories,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch categories",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
