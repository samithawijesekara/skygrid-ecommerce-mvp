import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import bcrypt from "bcrypt";
import { verifyJwtToken } from "@/helpers/jwt"; // Assuming you have a helper to verify the JWT token

export async function PUT(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { password, confirmPassword } = body;

    // Check if both password and confirmPassword are provided
    if (!password || !confirmPassword) {
      return NextResponse.json(
        { message: "Both password and confirm password are required." },
        { status: 400 }
      );
    }

    // Ensure password and confirmPassword match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Get the token from the Authorization header
    const authToken = request.headers.get("Authorization");
    const token = authToken?.split(" ")[1]; // "Bearer <token>"
    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      );
    }

    // Validate the token
    const decodedToken = verifyJwtToken(token);
    if (!decodedToken) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Find user by ID and check if the token matches
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.token || user.token !== token) {
      return NextResponse.json(
        { message: "Invalid or already used reset link." },
        { status: 400 }
      );
    }

    // Update the user's password and remove the reset token
    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword, token: null },
    });

    return NextResponse.json(
      { message: "Password reset successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
