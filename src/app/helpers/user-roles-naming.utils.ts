import { UserRoleEnum } from "@/enums/user-role.enum";

export const formatRole = (role: string) => {
  switch (role) {
    case UserRoleEnum.USER:
      return "User";
    case UserRoleEnum.TENANT_ADMIN:
      return "Tenant Admin";
    case UserRoleEnum.SUPER_ADMIN:
      return "Super Admin";
    default:
      return role;
  }
};
