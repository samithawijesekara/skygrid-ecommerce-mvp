import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prismadb";
import { sendOtpEmail } from "@/helpers/bevo-send-email.utils";
import { expiryOfOTP, generateOTP } from "@/helpers/otp-generation.utils";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, firstName, lastName, password, agreeToTerms } = body;

    // Check if all required fields are provided
    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    // Check if the user already exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists." },
        { status: 400 }
      );
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate OTP and expiry time
    const otp = generateOTP();
    const otpExpiry = expiryOfOTP();

    // Create a new user
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        hashedPassword,
        otp,
        otpExpiry,
        profileImage:
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
        isAgreeToTerms: agreeToTerms,
      },
    });

    if (user) {
      // Send reset password email
      await sendOtpEmail(user.email ?? "", user.firstName ?? "User", otp);
    }

    // Return the newly created user
    return NextResponse.json({ email: user?.email });
  } catch (error) {
    // Improved error handling
    if (error instanceof Error) {
      console.error("Error during registration:", error.message);
    } else {
      console.error("Unknown error during registration:", error);
    }

    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
