import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET(request: NextRequest) {
  try {
    // Normal parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const take = parseInt(searchParams.get("take") || "10");
    const searchValue = searchParams.get("searchValue") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // Array parameters
    const statusFilterValue = searchParams.getAll("statusFilterValue[]");
    const rolesFilterValue = searchParams.getAll("rolesFilterValue[]");

    const skip = (page - 1) * take;

    // Build the where clause for search and filters
    const whereClause: any = {};

    // Handle search
    if (searchValue) {
      whereClause.OR = [
        { firstName: { contains: searchValue, mode: "insensitive" } },
        { lastName: { contains: searchValue, mode: "insensitive" } },
        { email: { contains: searchValue, mode: "insensitive" } },
      ];
    }

    // Handle status filter
    if (statusFilterValue.length > 0) {
      whereClause.isAccountActivate = statusFilterValue.includes("active");
    }

    // Handle roles filter
    if (rolesFilterValue.length > 0) {
      whereClause.roles = {
        hasSome: rolesFilterValue,
      };
    }

    // Handle sorting
    let orderBy: any = {};

    if (sortBy) {
      switch (sortBy) {
        case "name":
          orderBy = [{ firstName: order }, { lastName: order }];
          break;
        case "email":
          orderBy = { email: order };
          break;
        case "createdAt":
          orderBy = { createdAt: order };
          break;
        default:
          orderBy = { [sortBy]: order };
      }
    }

    // Fetch users with filters, search, and sorting
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          roles: true,
          isAccountActivate: true,
          invitations: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    // Transform the response if needed
    const transformedUsers = users.map((user) => ({
      ...user,
      // Add any additional transformations here if needed
    }));

    return NextResponse.json({
      items: transformedUsers,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch users",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}