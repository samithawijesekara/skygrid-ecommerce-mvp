import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 }
      );
    }

    // Find user and check OTP
    const user = await prisma.user.findUnique({
      where: { email },
      select: { otp: true },
    });
    if (!user) {
      return NextResponse.json({ hasOtp: false });
    }

    const hasOtp = Boolean(user.otp);

    return NextResponse.json({ hasOtp });
  } catch (error) {
    console.error("Error during OTP resend:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
