import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { canManageOrganization } from "@/lib/utils/permissions";
import { sendEmail } from "@/lib/services/email";
import { z } from "zod";
import crypto from "crypto";

const createInvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "editor", "viewer"], {
    errorMap: () => ({ message: "Role must be admin, editor, or viewer" }),
  }),
});

/**
 * POST /api/organizations/:id/invitations
 * Create an invitation to join an organization
 */
export const POST = withAuth(async (request, { user, params }) => {
  try {
    const { id: organizationId } = params;

    // Check if user can manage this organization
    const canManage = await canManageOrganization(user.id, organizationId);

    if (!canManage) {
      return NextResponse.json(
        { error: "Forbidden - You don't have permission to invite members" },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = createInvitationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, role } = validation.data;

    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if user with this email already exists and is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Check if they're the owner
      if (organization.userId === existingUser.id) {
        return NextResponse.json(
          { error: "User is already the owner of this organization" },
          { status: 400 }
        );
      }

      // Check if they're already a member
      const existingMember = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: existingUser.id,
          },
        },
      });

      if (existingMember) {
        return NextResponse.json(
          { error: "User is already a member of this organization" },
          { status: 400 }
        );
      }
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await prisma.invitationToken.findFirst({
      where: {
        organizationId,
        email,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An active invitation for this email already exists" },
        { status: 400 }
      );
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Create invitation
    const invitation = await prisma.invitationToken.create({
      data: {
        organizationId,
        email,
        role,
        token,
        expiresAt,
        invitedBy: user.id,
      },
    });

    // Send invitation email
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${token}`;

    try {
      await sendEmail({
        to: email,
        subject: `You've been invited to join ${organization.name} on RevEarth`,
        html: `
          <h2>You've been invited!</h2>
          <p>${user.name || user.email} has invited you to join <strong>${organization.name}</strong> on RevEarth.</p>
          <p>Your role will be: <strong>${role}</strong></p>
          <p>Click the link below to accept the invitation:</p>
          <p><a href="${invitationUrl}">${invitationUrl}</a></p>
          <p>This invitation will expire in 7 days.</p>
          <p>If you don't have an account yet, you'll be prompted to create one.</p>
        `,
        text: `You've been invited to join ${organization.name} on RevEarth. Visit ${invitationUrl} to accept the invitation.`,
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create invitation error:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
});

/**
 * GET /api/organizations/:id/invitations
 * Get all pending invitations for an organization
 */
export const GET = withAuth(async (request, { user, params }) => {
  try {
    const { id: organizationId } = params;

    // Check if user can manage this organization
    const canManage = await canManageOrganization(user.id, organizationId);

    if (!canManage) {
      return NextResponse.json(
        { error: "Forbidden - You don't have permission to view invitations" },
        { status: 403 }
      );
    }

    // Get all pending invitations
    const invitations = await prisma.invitationToken.findMany({
      where: {
        organizationId,
        expiresAt: {
          gt: new Date(), // Only show non-expired invitations
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      invitations: invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get invitations error:", error);
    return NextResponse.json(
      { error: "Failed to get invitations" },
      { status: 500 }
    );
  }
});
