import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "src/pages/api/auth/[...nextauth]";
import { AuditLogAction } from "@prisma/client";

/*
 * Create a new audit log
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { action, page, metadata } = await request.json();

    // Validate action
    if (!action || !Object.values(AuditLogAction).includes(action)) {
      return NextResponse.json(
        { message: "Invalid action type" },
        { status: 400 }
      );
    }

    // Get user agent and IP
    const userAgent = request.headers.get("user-agent") || undefined;
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      undefined;

    // Create audit log
    const auditLog = await prisma.auditLog.create({
      data: {
        userId: session?.user?.email
          ? (
              await prisma.user.findUnique({
                where: { email: session.user.email },
              })
            )?.id
          : null,
        action,
        page,
        metadata,
        userAgent,
        ipAddress,
        sessionId: session?.user?.email
          ? undefined
          : request.cookies.get("session")?.value,
      },
    });

    return NextResponse.json(auditLog, { status: 201 });
  } catch (error) {
    console.error("Error creating audit log:", error);
    return NextResponse.json(
      {
        message: "Failed to create audit log",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/*
 * Get all audit logs with pagination, search, and sorting
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user to check if super admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { roles: true },
    });

    if (!user?.roles.includes("SUPER_ADMIN")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const take = parseInt(searchParams.get("take") || "10");
    const action = searchParams.get("action") as AuditLogAction | null;
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;
    const skip = (page - 1) * take;

    // Build where clause
    const where: any = {};
    if (action) where.action = action;
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      };
    }

    // Get audit logs with pagination
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Get action counts for analytics
    const actionCounts = await prisma.auditLog.groupBy({
      by: ["action"],
      where,
      _count: true,
    });

    return NextResponse.json({
      items: logs,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
      analytics: {
        actionCounts: actionCounts.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.action]: curr._count,
          }),
          {}
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch audit logs",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
