import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prismadb";
import { z } from "zod";
import { authOptions } from "src/pages/api/auth/[...nextauth]";

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  categoryIds: z.array(z.string()).min(1, "At least one category is required"),
  isPublished: z.boolean().default(false),
  coverImage: z.string().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const isPublished = formData.get("isPublished") === "true";
    const categoryIds = formData.getAll("categoryIds[]") as string[];
    const coverImage = formData.get("coverImage") as string | null;

    const validatedData = productSchema.parse({
      title,
      content,
      categoryIds,
      isPublished,
      coverImage,
    });

    const { id } = await Promise.resolve(context.params);

    // First, delete existing category connections
    await prisma.productCategoryMapping.deleteMany({
      where: {
        product: {
          id: id,
        },
      },
    });

    // Then update the product
    const product = await prisma.product.update({
      where: {
        id: id,
      },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        isPublished: validatedData.isPublished,
        coverImage: validatedData.coverImage,
        categories: {
          create: validatedData.categoryIds.map((categoryId) => ({
            category: {
              connect: {
                id: categoryId,
              },
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
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await Promise.resolve(context.params);

    // First, delete all category connections
    await prisma.productCategoryMapping.deleteMany({
      where: {
        product: {
          id: id,
        },
      },
    });

    // Then delete the product
    await prisma.product.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
