import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { sendWelcomeEmail } from "@/helpers/bevo-send-email.utils";
import CONFIGURATIONS from "@/configurations/configurations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required." },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Check if OTP is valid
    if (!user.otpExpiry || user.otp !== otp || new Date() > user.otpExpiry) {
      return NextResponse.json(
        { message: "Invalid or expired OTP." },
        { status: 400 }
      );
    }

    // Update user status (mark email as verified)
    const saved = await prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otpExpiry: null,
        isAccountActivate: true,
        emailVerified: new Date(),
      },
    });

    // Check if welcome email is already sent
    if (saved && user && user.email && !user.isWelcomeEmailSent) {
      try {
        await Promise.all([
          sendWelcomeEmail(
            user.email,
            user.firstName ?? "",
            `${CONFIGURATIONS.APP.CLIENT_URL}/portal`
          ),
          prisma.user.update({
            where: { email: user.email },
            data: { isWelcomeEmailSent: true },
          }),
        ]);
      } catch (error) {
        console.error("Error sending welcome email:", error);
      }
    }

    return NextResponse.json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
