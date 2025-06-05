"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  MAIN_ROUTES,
  SUPER_ADMIN_ROUTES,
  PUBLIC_ROUTES,
} from "@/constants/router.const";
import { UserRoleEnum } from "@/enums/user-role.enum";
import { Building2, Shield, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const getRolePower = (role: Role): number => {
  switch (role) {
    case UserRoleEnum.SUPER_ADMIN:
      return 100;
    case UserRoleEnum.TENANT_ADMIN:
      return 50;
    default:
      return 1;
  }
};

const getRoleIcon = (role: Role) => {
  switch (role) {
    case UserRoleEnum.SUPER_ADMIN:
      return <Shield className="h-6 w-6" />;
    case UserRoleEnum.TENANT_ADMIN:
      return <Building2 className="h-6 w-6" />;
    default:
      return <Users className="h-6 w-6" />;
  }
};

const getRoleTitle = (role: Role) => {
  switch (role) {
    case UserRoleEnum.SUPER_ADMIN:
      return "Super Admin Portal";
    case UserRoleEnum.TENANT_ADMIN:
      return "Tenant Admin Portal";
    default:
      return "User Portal";
  }
};

const getRoleDescription = (role: Role) => {
  switch (role) {
    case UserRoleEnum.SUPER_ADMIN:
      return "Access the super admin dashboard to manage all system settings";
    case UserRoleEnum.TENANT_ADMIN:
      return "Access the tenant admin dashboard to manage your organization";
    default:
      return "Access your user dashboard";
  }
};

export default function PortalSwitch() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const userRoles = (session?.user?.roles as Role[]) || [];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(PUBLIC_ROUTES.UNAUTHORIZED);
      return;
    }

    if (status === "authenticated" && userRoles.length <= 1) {
      router.push(PUBLIC_ROUTES.UNAUTHORIZED);
      return;
    }
  }, [status, userRoles.length, router]);

  const sortedRoles = [...userRoles].sort(
    (a, b) => getRolePower(b) - getRolePower(a)
  );

  const handlePortalSelect = async (role: Role) => {
    setIsLoading(role);
    try {
      switch (role) {
        case UserRoleEnum.SUPER_ADMIN:
          router.push(SUPER_ADMIN_ROUTES.DASHBOARD);
          break;
        case UserRoleEnum.TENANT_ADMIN:
          router.push(MAIN_ROUTES.DASHBOARD);
          break;
        default:
          router.push(MAIN_ROUTES.DASHBOARD);
          break;
      }
    } finally {
      setIsLoading(null);
    }
  };

  if (
    status === "loading" ||
    status === "unauthenticated" ||
    userRoles.length <= 1
  ) {
    return (
      <div className="container max-w-lg mt-10">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Select Portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mt-10">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Select Portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedRoles.map((role) => (
            <Button
              key={role}
              variant="outline"
              className="w-full h-auto min-h-[5rem] flex items-center justify-start gap-4 px-4"
              onClick={() => handlePortalSelect(role)}
              disabled={!!isLoading}
            >
              {getRoleIcon(role)}
              <div className="text-left flex-1">
                <h3 className="font-semibold">{getRoleTitle(role)}</h3>
                <p className="text-sm text-muted-foreground break-words whitespace-normal">
                  {getRoleDescription(role)}
                </p>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
