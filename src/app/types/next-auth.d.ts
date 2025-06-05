import NextAuth from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    roles: Role[];
    isAccountActivate: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      roles: Role[];
      isAccountActivate: boolean;
    };
  }

  interface JWT {
    roles: Role[];
    isAccountActivate: boolean;
  }
}
