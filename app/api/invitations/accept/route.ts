import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { addOrganizationMember } from "@/lib/utils/permissions";
import { z } from "zod";

const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

/**
 * POST /api/invitations/accept
 * Accept an organization invitation
 * Requires authentication - user must be logged in
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    // Validate request body
    const body = await request.json();
    const validation = acceptInvitationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { token } = validation.data;

    // Find invitation
    const invitation = await prisma.invitationToken.findUnique({
      where: { token },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    // Check if invitation email matches user's email
    if (invitation.email !== user.email) {
      return NextResponse.json(
        { error: "This invitation was sent to a different email address" },
        { status: 400 }
      );
    }

    // Check if user is already the owner
    if (invitation.organization.userId === user.id) {
      // Delete invitation and return success (no need to add them)
      await prisma.invitationToken.delete({
        where: { id: invitation.id },
      });

      return NextResponse.json({
        success: true,
        message: "You are already the owner of this organization",
        organization: invitation.organization,
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: invitation.organizationId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      // Delete invitation and return success
      await prisma.invitationToken.delete({
        where: { id: invitation.id },
      });

      return NextResponse.json({
        success: true,
        message: "You are already a member of this organization",
        organization: invitation.organization,
      });
    }

    // Add user as member
    const member = await addOrganizationMember(
      invitation.organizationId,
      user.id,
      invitation.role
    );

    // Delete the invitation token after successful acceptance
    await prisma.invitationToken.delete({
      where: { id: invitation.id },
    });

    return NextResponse.json({
      success: true,
      message: `You have successfully joined ${invitation.organization.name}`,
      organization: invitation.organization,
      member,
    });
  } catch (error) {
    console.error("Accept invitation error:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
});
