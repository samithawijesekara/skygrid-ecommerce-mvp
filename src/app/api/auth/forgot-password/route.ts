import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { generateJwtToken } from "@/helpers/jwt";
import CONFIGURATIONS from "@/configurations/configurations";
import { sendForgotPasswordEmail } from "@/helpers/bevo-send-email.utils";
import { AUTH_ROUTES } from "@/constants/router.const";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email } = body;

    // Check if email is provided
    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { message: "There is no user associated with this email." },
        { status: 400 }
      );
    }

    // Generate the reset token
    const tokenData = { id: user.id, email: user.email, roles: user.roles };
    const resetPasswordToken = generateJwtToken(tokenData, 60 * 60 * 1); // 1 hour

    // Generate reset password link
    const resetPasswordLink = `${CONFIGURATIONS.APP.CLIENT_URL}${AUTH_ROUTES.RESET_PASSWORD}?token=${resetPasswordToken}`;
    // console.log("RESET PASSWORD LINK:", resetPasswordLink);

    // Store the token in the database
    const saved = await prisma.user.update({
      where: { id: user.id },
      data: { token: resetPasswordToken },
    });

    if (saved) {
      // Send forgot password email
      await sendForgotPasswordEmail(
        user.email ?? "",
        user.firstName ?? "User",
        resetPasswordLink
      );
    }

    return NextResponse.json(
      {
        message: "Email has been sent. Please check your inbox.",
        resetPasswordLink,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
