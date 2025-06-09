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
