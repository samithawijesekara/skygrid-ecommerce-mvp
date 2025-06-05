import {
  AUTH_ROUTES,
  MAIN_ROUTES,
  PUBLIC_ROUTES,
  SUPER_ADMIN_ROUTES,
} from "@/constants/router.const";
import { UserRoleEnum } from "@/enums/user-role.enum";
import { Role } from "@prisma/client";
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const { pathname } = request.nextUrl;
    const userRoles = request.nextauth.token?.roles as unknown as Role[];

    // console.log("04 CHECK AUTH TOKEN DATA : ", request.nextauth.token);
    // console.log("05 CHECK URL PATH : ", pathname);
    // console.log("06 CHECK AUTH TOKEN USER ROLES : ", userRoles);

    // User with USER role access routes
    if (
      pathname.startsWith(AUTH_ROUTES.PORTAL_SWITCH) &&
      !request.nextauth.token &&
      userRoles.length <= 1
    ) {
      return NextResponse.rewrite(
        new URL(PUBLIC_ROUTES.UNAUTHORIZED, request.url)
      );
    }

    // User with USER role access routes
    if (
      pathname.startsWith(MAIN_ROUTES.DASHBOARD) &&
      !userRoles.includes(UserRoleEnum.USER)
    ) {
      return NextResponse.rewrite(
        new URL(PUBLIC_ROUTES.UNAUTHORIZED, request.url)
      );
    }

    // User with SUPER_ADMIN role access routes
    if (pathname.startsWith(SUPER_ADMIN_ROUTES.DASHBOARD)) {
      if (!userRoles.includes(UserRoleEnum.SUPER_ADMIN)) {
        return NextResponse.rewrite(
          new URL(PUBLIC_ROUTES.UNAUTHORIZED, request.url)
        );
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/super-admin/:path*", "/portal/:path*", "/portal-switch"],
};
