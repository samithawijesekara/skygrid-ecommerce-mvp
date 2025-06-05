import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { uploadToS3 } from "@/helpers/aws-s3-bucket.utils";
import { AwsS3PathsEnum } from "@/enums/aws-s3-paths.enum";

/*
 * Create a new blog article
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const createdById = formData.get("createdById") as string;
    const categoryIds = formData.getAll("categoryIds[]") as string[];
    const file = formData.get("file") as File | null;
    const isPublished = formData.get("isPublished") === "true";

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { message: "Cover image is required" },
        { status: 400 }
      );
    }

    if (!createdById) {
      return NextResponse.json(
        { message: "CreatedById is required" },
        { status: 400 }
      );
    }

    let coverImageKey = null;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      coverImageKey = await uploadToS3(
        buffer,
        file.name,
        AwsS3PathsEnum.BLOG_COVERS
      );
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        coverImage: coverImageKey,
        createdById,
        isPublished,
        categories: {
          create: categoryIds.map((categoryId) => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      {
        message: "Failed to create blog",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/*
 * Get all blogs with pagination, search, and sorting
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
    const categoryId = searchParams.get("categoryId") || "";
    const isAdmin = searchParams.get("isAdmin") === "true";

    const skip = (page - 1) * take;

    // Build the where clause for search
    const whereClause: any = {
      // Only show published articles for public view
      ...(isAdmin ? {} : { isPublished: true }),
    };

    // Handle search
    if (searchValue) {
      whereClause.OR = [
        { title: { contains: searchValue, mode: "insensitive" } },
        { content: { contains: searchValue, mode: "insensitive" } },
      ];
    }

    // Handle category filter
    if (categoryId) {
      whereClause.categories = {
        some: {
          categoryId: categoryId,
        },
      };
    }

    // Handle sorting
    let orderBy: any = {};
    orderBy = { [sortBy]: order };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where: whereClause,
        skip,
        take,
        orderBy,
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.blog.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      items: blogs,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch blogs",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
