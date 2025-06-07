import bcrypt from "bcrypt";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prismadb";
import LinkedInProvider from "next-auth/providers/linkedin";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/constants/router.const";
import { UserRoleEnum } from "@/enums/user-role.enum";
import { Role } from "@prisma/client";
import CONFIGURATIONS from "@/configurations/configurations";
import { sendWelcomeEmail } from "@/helpers/bevo-send-email.utils";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: CONFIGURATIONS.SOCIAL_LOGINS.GOOGLE_CLIENT_ID as string,
      clientSecret: CONFIGURATIONS.SOCIAL_LOGINS.GOOGLE_CLIENT_SECRET as string,
      profile: async (profile, tokens) => {
        const defaultImage =
          "https://cdn-icons-png.flaticon.com/512/174/174857.png";

        // Split the name from the Google profile into first and last name
        const [firstName, ...lastNameParts] = profile.name.split(" ");
        const lastName = lastNameParts.join(" ");

        return {
          id: profile.sub,
          firstName,
          lastName,
          email: profile.email,
          emailVerified: profile.emailVerified,
          isAccountActivate: true,
          profileImage: profile.picture ?? defaultImage,
          roles: [UserRoleEnum.USER],
        };
      },
    }),
    // LinkedInProvider({
    //   clientId: process.env.LINKEDIN_CLIENT_ID as string,
    //   clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
    //   authorization: {
    //     params: { scope: "openid profile email" },
    //   },
    //   issuer: "https://www.linkedin.com",
    //   jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
    //   profile(profile, tokens) {
    //     const defaultImage =
    //       "https://cdn-icons-png.flaticon.com/512/174/174857.png";
    //     return {
    //       id: profile.sub,
    //       name: profile.name,
    //       email: profile.email,
    //       image: profile.picture ?? defaultImage,
    //     };
    //   },
    // }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user?.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        if (!user.isAccountActivate) {
          // Instead of returning a user object, return a custom error message
          throw new Error(`EMAIL_NOT_VERIFIED:${user.email}`);
        }

        // console.log("NEXT AUTH USER:", user);

        // Ensure returned object matches expected User structure
        return {
          id: user.id,
          email: user.email ?? "",
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          profileImage: user.profileImage ?? null,
          isAccountActivate: user.isAccountActivate,
          roles: user.roles,
        };
      },
    }),
  ],
  pages: {
    signIn: `${PUBLIC_ROUTES.HOME}?login=true`, // Callback URL for the log in page
    signOut: `${PUBLIC_ROUTES.HOME}`, // Callback URL for the log out page
  },
  debug: CONFIGURATIONS.ENVIRONMENT.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: CONFIGURATIONS.APP.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // console.log("01 CHECK THE USER INSIDE THE JWT : ", user);
        token.id = user.id;
        token.roles = user.roles;
        token.isAccountActivate = user.isAccountActivate;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // console.log("02 CHECK THE USER INSIDE THE SESSION : ", session.user);
        session.user.id = token.id as string;
        session.user.roles = token.roles as Role[];
        session.user.isAccountActivate = token.isAccountActivate as boolean;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
