import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "src/pages/api/auth/[...nextauth]";
import { PaymentStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get date range parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : new Date();

    // Get pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const take = parseInt(searchParams.get("take") || "10");
    const skip = (page - 1) * take;

    // Get all revenue data in parallel
    const [
      totalRevenue,
      orderCount,
      ordersByStatus,
      ordersByDay,
      recentOrders,
      totalOrders,
    ] = await Promise.all([
      // Total Revenue (sum of all paid orders)
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          paymentStatus: "PAID",
          deletedAt: null,
        },
        _sum: { totalAmount: true },
      }),

      // Order Count by Status
      prisma.order.groupBy({
        by: ["paymentStatus"],
        where: {
          createdAt: { gte: startDate, lte: endDate },
          deletedAt: null,
        },
        _count: true,
        _sum: { totalAmount: true },
      }),

      // Orders by Status (for status breakdown)
      prisma.order.groupBy({
        by: ["status"],
        where: {
          createdAt: { gte: startDate, lte: endDate },
          deletedAt: null,
        },
        _count: true,
        _sum: { totalAmount: true },
      }),

      // Orders by Day (for trend analysis)
      prisma.order.groupBy({
        by: "createdAt",
        where: {
          createdAt: { gte: startDate, lte: endDate },
          paymentStatus: "PAID",
          deletedAt: null,
        },
        _sum: { totalAmount: true },
        _count: true,
        orderBy: { createdAt: "asc" },
      }),

      // Recent Orders with Details
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          deletedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                },
              },
            },
          },
          payment: {
            select: {
              id: true,
              stripePaymentId: true,
              status: true,
              paymentMethod: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),

      // Total Orders Count (for pagination)
      prisma.order.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          deletedAt: null,
        },
      }),
    ]);

    // Calculate revenue metrics
    type PaymentStatusMetrics = {
      [K in PaymentStatus]?: {
        count: number;
        amount: number;
      };
    };

    const revenueMetrics = {
      total: totalRevenue._sum.totalAmount || 0,
      byPaymentStatus: orderCount.reduce<PaymentStatusMetrics>(
        (acc, curr) => ({
          ...acc,
          [curr.paymentStatus]: {
            count: curr._count,
            amount: curr._sum.totalAmount || 0,
          },
        }),
        {}
      ),
      byOrderStatus: ordersByStatus.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.status]: {
            count: curr._count,
            amount: curr._sum.totalAmount || 0,
          },
        }),
        {}
      ),
    };

    // Format daily revenue data
    const dailyRevenue = ordersByDay.map((day) => ({
      date: day.createdAt,
      revenue: day._sum.totalAmount || 0,
      orders: day._count,
    }));

    // Calculate summary statistics
    const summary = {
      totalRevenue: revenueMetrics.total,
      totalOrders: totalOrders,
      averageOrderValue:
        totalOrders > 0 ? revenueMetrics.total / totalOrders : 0,
      paidOrders: revenueMetrics.byPaymentStatus["PAID"]?.count || 0,
      pendingOrders: revenueMetrics.byPaymentStatus["PENDING"]?.count || 0,
      refundedOrders: revenueMetrics.byPaymentStatus["REFUNDED"]?.count || 0,
    };

    return NextResponse.json({
      summary,
      metrics: revenueMetrics,
      dailyRevenue,
      orders: {
        items: recentOrders,
        total: totalOrders,
        page,
        limit: take,
        totalPages: Math.ceil(totalOrders / take),
      },
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch revenue data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
