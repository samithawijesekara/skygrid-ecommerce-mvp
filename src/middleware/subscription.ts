import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prismadb";

type PlanType = "FREE" | "PRO_MONTHLY" | "PRO_ANNUAL";

export async function withSubscription(
  request: NextRequest,
  requiredPlan: PlanType = "FREE"
) {
  try {
    const token = await getToken({ req: request });

    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Allow access to free routes
    if (requiredPlan === "FREE") {
      return NextResponse.next();
    }

    const user = await prisma.user.findUnique({
      where: { email: token.email! },
      include: {
        subscriptions: {
          where: {
            OR: [
              { status: "ACTIVE" },
              { status: "TRIAL" },
              {
                AND: [
                  { status: "CANCELED" },
                  { currentPeriodEnd: { gt: new Date() } },
                ],
              },
            ],
          },
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    const activeSubscription = user.subscriptions[0];

    // Redirect to pricing if no active subscription or wrong plan type
    if (
      !activeSubscription ||
      activeSubscription.plan.planType !== requiredPlan
    ) {
      return NextResponse.redirect(new URL("/pricing", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Subscription middleware error:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}

// Example usage in middleware.ts:
// export default function middleware(request: NextRequest) {
//   // Protect pro routes
//   if (request.nextUrl.pathname.startsWith('/pro')) {
//     return withSubscription(request, 'PRO_MONTHLY');
//   }
//   return NextResponse.next();
// }
