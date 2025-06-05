import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { deleteFromS3, uploadToS3 } from "@/helpers/aws-s3-bucket.utils";
import { AwsS3PathsEnum } from "@/enums/aws-s3-paths.enum";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Access params synchronously
    const { id } = await context.params;
    const userId = id;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        roles: true,
        isAccountActivate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        message: "Failed to fetch user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const userId = id;

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Get the existing user to check if there's a profile image to delete
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true },
    });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    let profileImageKey = existingUser?.profileImage;

    if (file) {
      // Delete existing profile image if it exists
      if (existingUser?.profileImage) {
        try {
          await deleteFromS3(existingUser.profileImage);
        } catch (error) {
          console.error("Error deleting old profile image:", error);
        }
      }

      // Upload new profile image
      const buffer = Buffer.from(await file.arrayBuffer());
      profileImageKey = await uploadToS3(
        buffer,
        file.name,
        AwsS3PathsEnum.PROFILE_IMAGES
      );
    }

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        profileImage: profileImageKey,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        roles: true,
        isAccountActivate: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        message: "Failed to update user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
