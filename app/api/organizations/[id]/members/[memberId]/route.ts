import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import {
  canManageOrganization,
  updateMemberRole,
  removeOrganizationMember,
} from "@/lib/utils/permissions";
import { z } from "zod";

const updateMemberSchema = z.object({
  role: z.enum(["admin", "editor", "viewer"] as const),
});

/**
 * PATCH /api/organizations/:id/members/:memberId
 * Update a member's role
 */
export const PATCH = withAuth(async (request, { user, params }) => {
  try {
    if (!params) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }
    const { id: organizationId, memberId } = params;

    // Check if user can manage this organization
    const canManage = await canManageOrganization(user.id, organizationId);

    if (!canManage) {
      return NextResponse.json(
        { error: "Forbidden - You don't have permission to update members" },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = updateMemberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { role } = validation.data;

    // Verify member belongs to this organization
    const member = await prisma.organizationMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.organizationId !== organizationId) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Prevent changing own role
    if (member.userId === user.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    // Update role
    const updatedMember = await updateMemberRole(memberId, role);

    return NextResponse.json({
      success: true,
      member: updatedMember,
    });
  } catch (error) {
    console.error("Update member role error:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/organizations/:id/members/:memberId
 * Remove a member from an organization
 */
export const DELETE = withAuth(async (request, { user, params }) => {
  try {
    if (!params) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }
    const { id: organizationId, memberId } = params;

    // Check if user can manage this organization
    const canManage = await canManageOrganization(user.id, organizationId);

    if (!canManage) {
      return NextResponse.json(
        { error: "Forbidden - You don't have permission to remove members" },
        { status: 403 }
      );
    }

    // Verify member belongs to this organization
    const member = await prisma.organizationMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.organizationId !== organizationId) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Prevent removing self (should leave organization instead)
    if (member.userId === user.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself. Use the leave organization endpoint instead" },
        { status: 400 }
      );
    }

    // Remove member
    await removeOrganizationMember(memberId);

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove organization member error:", error);
    return NextResponse.json(
      { error: "Failed to remove organization member" },
      { status: 500 }
    );
  }
});
