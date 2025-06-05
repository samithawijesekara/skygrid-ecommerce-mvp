import { getServerSession } from "next-auth/next";
import { authOptions } from "../../pages/api/auth/[...nextauth]";
import prisma from "@/lib/prismadb";

export async function getSession() {
  return await getServerSession(authOptions);
}

export default async function getCurrentUser() {
  try {
    // Getting the session
    const session = await getSession();
    if (!session?.user?.email) {
      return null;
    }

    // Getting the user from the database
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });
    if (!currentUser) {
      return null;
    }

    // Returning the userF
    return {
      ...currentUser,
      createdAt: currentUser.createdAt.toISOString(),
      updatedAt: currentUser.updatedAt.toISOString(),
      emailVerified: currentUser.isAccountActivate,
    };
  } catch (error) {
    console.log("Error wile occurring the getCurrentUser : ", error);
    return null;
  }
}
