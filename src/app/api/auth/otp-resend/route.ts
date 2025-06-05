import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { sendOtpEmail } from "@/helpers/bevo-send-email.utils";
import { expiryOfOTP, generateOTP } from "@/helpers/otp-generation.utils";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Generate new OTP and expiry
    const otp = generateOTP();
    const otpExpiry = expiryOfOTP();

    // Update OTP in DB
    const saved = await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry },
    });

    if (saved) {
      // Send OTP via email
      await sendOtpEmail(user.email ?? "", user.firstName ?? "User", otp);
    }

    return NextResponse.json({ message: "OTP resent successfully." });
  } catch (error) {
    console.error("Error during OTP resend:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
