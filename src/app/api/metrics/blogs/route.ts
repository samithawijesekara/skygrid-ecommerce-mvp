import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Content & Engagement Metrics
    const totalBlogs = await prisma.blog.count();
    const newBlogs30Days = await prisma.blog.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const blogsPerUser = await prisma.blog.groupBy({
      by: ["createdById"],
      _count: { id: true },
    });
    const totalCategories = await prisma.blogCategory.count();
    const categoriesUsage = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: { blogs: true },
        },
      },
    });
    const blogActivity = await prisma.blog.findMany({
      select: {
        createdAt: true,
      },
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6)), // Last 6 months
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        contentMetrics: {
          totalBlogs,
          newBlogs30Days,
          totalCategories,
          categoriesUsage,
          blogActivity,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard metrics" },
      { status: 500 }
    );
  }
}
