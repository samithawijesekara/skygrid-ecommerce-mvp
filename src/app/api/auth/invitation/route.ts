import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import {
  sendUserInvitationEmail,
  sendWelcomeEmail,
} from "@/helpers/bevo-send-email.utils";
import CONFIGURATIONS from "@/configurations/configurations";
import { generateJwtToken, verifyJwtToken } from "@/helpers/jwt";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { AUTH_ROUTES } from "@/constants/router.const";

/**
 * ****************************************************************
 * ================ Sending the user invitation ===================
 * ****************************************************************
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { firstName, lastName, email, roleId, tenantId } = body;
    const roleIdTransformed = parseInt(roleId);

    if (isNaN(roleIdTransformed)) {
      return NextResponse.json(
        { message: "Invalid roleId format" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !roleId) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    // Check if the user already exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Fetch user role type
      const userRoleType = await prisma.userRoleType.findUnique({
        where: { roleId: roleIdTransformed },
      });
      if (!userRoleType) {
        return NextResponse.json({ message: "Invalid role." }, { status: 400 });
      }

      // Create the user first
      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email: email ?? "",
          roles: [userRoleType.name as Role],
          isAccountActivate: false,
          profileImage:
            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
        },
      });

      // Create invitation separately
      const invitation = await prisma.invitation.create({
        data: {
          token: null,
          userId: user?.id,
          userRoleId: userRoleType?.id,
          tenantId: tenantId || null,
        },
      });

      if (invitation) {
        // Update invitation token including the invitation ID
        const invitationToken = await generateJwtToken(
          {
            email: user?.email,
            userId: user?.id,
            invitationId: invitation?.id,
          },
          60 * 60 * 24 * 7
        ); // 7 days in seconds
        if (invitationToken) {
          const updatedInvitation = await prisma.invitation.update({
            where: { id: invitation?.id },
            data: {
              token: invitationToken,
            },
          });

          if (updatedInvitation) {
            // Generate invitation link
            const invitationLink = `${CONFIGURATIONS.APP.CLIENT_URL}${AUTH_ROUTES.INVITATION}?token=${updatedInvitation.token}&firstName=${user.firstName}&lastName=${user.lastName}&email=${user.email}`;
            console.log("INVITATION LINK:", invitationLink);

            // Send invitation email (if needed)
            await sendUserInvitationEmail(
              user?.email ?? "",
              user.firstName ?? "",
              userRoleType.name,
              invitationLink
            );

            return NextResponse.json({
              message: "Invitation sent successfully.",
            });
          }
        }
      }
    } else {
      return NextResponse.json(
        { message: "User already exists." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * ****************************************************************
 * =============== Accepting the user invitation ==================
 * ****************************************************************
 */
export async function PUT(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { token, password } = body;

    // Validate required fields
    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required." },
        { status: 400 }
      );
    }

    // Verify the token
    const decodedToken = verifyJwtToken(token);
    if (
      !decodedToken?.email ||
      !decodedToken?.userId ||
      !decodedToken?.invitationId
    ) {
      return NextResponse.json(
        { message: "Invalid or expired token." },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: decodedToken.email },
    });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Find invitation by invitationId
    const invitation = await prisma.invitation.findUnique({
      where: { id: decodedToken.invitationId },
    });
    if (!invitation) {
      return NextResponse.json(
        { message: "Invitation not found." },
        { status: 404 }
      );
    }

    // Check if the invitation is older than 7 days
    const invitationAgeInDays =
      (new Date().getTime() - new Date(invitation.createdAt).getTime()) /
      (1000 * 3600 * 24);
    if (invitationAgeInDays > 7) {
      return NextResponse.json(
        { message: "Invitation has expired." },
        { status: 400 }
      );
    }

    // Check if user is already activated
    if (user.isAccountActivate) {
      return NextResponse.json(
        { message: "User has already accepted the invitation." },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user details in one query
    const updatedUser = await prisma.user.update({
      where: { email: user.email! },
      data: {
        hashedPassword,
        isAccountActivate: true,
        emailVerified: new Date(),
      },
    });

    // Update invitation acceptance
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        acceptedAt: new Date(),
      },
    });

    // Send welcome email only if not sent before
    if (!user.isWelcomeEmailSent) {
      try {
        await sendWelcomeEmail(
          updatedUser.email ?? "",
          updatedUser.firstName ?? "",
          `${CONFIGURATIONS.APP.CLIENT_URL}/portal`
        );

        // Mark welcome email as sent
        await prisma.user.update({
          where: { email: user.email! },
          data: { isWelcomeEmailSent: true },
        });
      } catch (error) {
        console.error("Error sending welcome email:", error);
      }
    }

    return NextResponse.json({
      message: "Invitation accepted successfully.",
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
