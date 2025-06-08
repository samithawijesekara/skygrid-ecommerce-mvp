import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismadb";
import { z } from "zod";
import { authOptions } from "src/pages/api/auth/[...nextauth]";
import { Prisma } from "@prisma/client";

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  isPublished: z.boolean().default(false),
  coverImage: z.string().nullable().optional(),
});

/*
 * Create a new blog article
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const isPublished = formData.get("isPublished") === "true";
    const coverImage = formData.get("coverImage") as string | null;
    const categoryIds = formData.getAll("categoryIds[]") as string[];

    // Validate the data
    const validatedData = productSchema.parse({
      title,
      content,
      categoryIds,
      isPublished,
      coverImage,
    });

    const product = await prisma.product.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        isPublished: validatedData.isPublished,
        coverImage: validatedData.coverImage,
        createdById: session.user.id,
        categories: {
          create: validatedData.categoryIds.map((categoryId) => ({
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
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/*
 * Get all blogs with pagination, search, and sorting
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const take = parseInt(searchParams.get("take") || "5");
    const searchValue = searchParams.get("searchValue") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const isAdmin = searchParams.get("isAdmin") === "true";

    const skip = (page - 1) * take;

    const where: Prisma.ProductWhereInput = {
      AND: [
        searchValue
          ? {
              OR: [
                {
                  title: {
                    contains: searchValue,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  content: {
                    contains: searchValue,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            }
          : {},
        isAdmin ? {} : { isPublished: true },
      ],
    };

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / take);

    return NextResponse.json({
      items,
      total,
      page,
      limit: take,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
