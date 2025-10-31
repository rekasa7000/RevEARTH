import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { canManageOrganization } from "@/lib/utils/permissions";

/**
 * DELETE /api/organizations/:id/invitations/:invitationId
 * Revoke an invitation
 */
export const DELETE = withAuth(async (request, { user, params }) => {
  try {
    if (!params) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }
    const { id: organizationId, invitationId } = params;

    // Check if user can manage this organization
    const canManage = await canManageOrganization(user.id, organizationId);

    if (!canManage) {
      return NextResponse.json(
        { error: "Forbidden - You don't have permission to revoke invitations" },
        { status: 403 }
      );
    }

    // Verify invitation belongs to this organization
    const invitation = await prisma.invitationToken.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.organizationId !== organizationId) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Delete invitation
    await prisma.invitationToken.delete({
      where: { id: invitationId },
    });

    return NextResponse.json({
      success: true,
      message: "Invitation revoked successfully",
    });
  } catch (error) {
    console.error("Revoke invitation error:", error);
    return NextResponse.json(
      { error: "Failed to revoke invitation" },
      { status: 500 }
    );
  }
});
