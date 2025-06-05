import { getSession } from "next-auth/react";
import { UserRoleEnum } from "@/enums/user-role.enum";
import { MAIN_ROUTES, SUPER_ADMIN_ROUTES } from "@/constants/router.const";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Checks if a user has a session and redirects based on their role.
 * @param {AppRouterInstance} router - Next.js router instance
 * @param {Function} setIsLoading - Function to set loading state
 */
export const checkSessionRedirection = async (
  router: AppRouterInstance,
  setIsLoading: (loading: boolean) => void
) => {
  const session = await getSession();

  if (session) {
    const userRole = session?.user?.roles;
    if (userRole.includes(UserRoleEnum.SUPER_ADMIN)) {
      router.push(SUPER_ADMIN_ROUTES.DASHBOARD);
    } else {
      router.push(MAIN_ROUTES.DASHBOARD);
    }
  } else {
    setIsLoading(false); // Allow rendering if no session
  }
};
