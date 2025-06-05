import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // User & Authentication Metrics
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { emailVerified: { not: null } },
    });
    const newUsers30Days = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const activatedUsers = await prisma.user.count({
      where: { isAccountActivate: true },
    });
    const usersByRole = await prisma.user.groupBy({
      by: ["roles"],
      _count: { id: true },
    });
    // const socialLogins = await prisma.account.count({
    //   where: {
    //     provider: {
    //       not: null
    //     }
    //   },
    // });
    const loginProviders = await prisma.account.groupBy({
      by: ["provider"],
      _count: { id: true },
    });

    // Invitations & Onboarding Metrics
    const totalInvitations = await prisma.invitation.count();
    const acceptedInvitations = await prisma.invitation.count({
      where: { acceptedAt: { not: null } },
    });
    const pendingInvitations = await prisma.invitation.count({
      where: { acceptedAt: null },
    });
    const invitationsByRole = await prisma.invitation.groupBy({
      by: ["userRoleId"],
      _count: { id: true },
    });

    // Content & Engagement Metrics
    const totalBlogs = await prisma.blog.count();
    const newBlogs30Days = await prisma.blog.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const blogsPerUser = await prisma.blog.groupBy({
      by: ["createdById"],
      _count: { id: true },
    });
    const totalCategories = await prisma.category.count();
    const categoriesUsage = await prisma.category.findMany({
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
        createdAt: 'asc',
      },
    });

    // System & Activity Metrics
    const recentSignups = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });
    const usersWithoutProfilePic = await prisma.user.count({
      where: { profileImage: null },
    });
    const multipleAccounts = await prisma.account.groupBy({
      by: ["userId"],
      _count: { id: true },
      having: {
        id: {
          _count: { gt: 1 },
        },
      },
    });
    const deletedUsers = await prisma.user.count({
      where: { deletedAt: { not: null } },
    });
    const deletedBlogs = await prisma.blog.count({
      where: { deletedAt: { not: null } },
    });

    console.log(totalUsers);

    return NextResponse.json({
      success: true,
      data: {
        userMetrics: {
          totalUsers,
          activeUsers,
          newUsers30Days,
          activationRate: (activatedUsers / totalUsers) * 100,
          usersByRole,
          // socialLogins,
          loginProviders,
        },
        invitationMetrics: {
          totalInvitations,
          acceptedInvitations,
          pendingInvitations,
          acceptanceRate: totalInvitations
            ? (acceptedInvitations / totalInvitations) * 100
            : 0,
          invitationsByRole,
        },
        contentMetrics: {
          totalBlogs,
          newBlogs30Days,
          averageBlogsPerUser: totalUsers ? totalBlogs / totalUsers : 0,
          blogsPerUser,
          totalCategories,
          categoriesUsage,
          blogActivity,
        },
        systemMetrics: {
          recentSignups,
          usersWithoutProfilePic,
          usersWithMultipleAccounts: multipleAccounts.length,
          deletedUsers,
          deletedBlogs,
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
