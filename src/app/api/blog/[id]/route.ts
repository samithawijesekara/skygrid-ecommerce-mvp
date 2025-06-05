import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { deleteFromS3, uploadToS3 } from "@/helpers/aws-s3-bucket.utils";
import { AwsS3PathsEnum } from "@/enums/aws-s3-paths.enum";

/*
 * Get a single blog article
 */
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const blogId = id;

    if (!blogId) {
      return NextResponse.json(
        { message: "Blog ID is required" },
        { status: 400 }
      );
    }

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
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

    if (!blog) {
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch blog",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/*
 * Update a blog article
 */
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const blogId = id;

    if (!blogId) {
      return NextResponse.json(
        { message: "Blog ID is required" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const categoryIds = formData.getAll("categoryIds[]") as string[];
    const file = formData.get("file") as File | null;
    const existingCoverImage = formData.get("coverImage") as string;
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

    // Get existing blog to check cover image
    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { coverImage: true },
    });

    let coverImageKey = existingBlog?.coverImage;

    // Handle cover image
    if (file) {
      // Delete existing cover image if it exists
      if (existingBlog?.coverImage) {
        try {
          await deleteFromS3(existingBlog.coverImage);
        } catch (error) {
          console.error("Error deleting old cover image:", error);
        }
      }

      // Upload new cover image
      const buffer = Buffer.from(await file.arrayBuffer());
      coverImageKey = await uploadToS3(
        buffer,
        file.name,
        AwsS3PathsEnum.BLOG_COVERS
      );
    } else if (existingCoverImage) {
      // Keep existing cover image if provided
      coverImageKey = existingCoverImage;
    } else {
      return NextResponse.json(
        { message: "Cover image is required" },
        { status: 400 }
      );
    }

    // Update blog and its categories
    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        title,
        content,
        coverImage: coverImageKey,
        isPublished,
        categories: {
          deleteMany: {}, // Remove all existing category connections
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

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      {
        message: "Failed to update blog",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/*
 * Delete a blog article (hard delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const blogId = id;

    if (!blogId) {
      return NextResponse.json(
        { message: "Blog ID is required" },
        { status: 400 }
      );
    }

    // First delete all category relationships
    await prisma.blogCategory.deleteMany({
      where: { blogId: blogId },
    });

    // Then delete the blog
    await prisma.blog.delete({
      where: { id: blogId },
    });

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      {
        message: "Failed to delete blog",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
