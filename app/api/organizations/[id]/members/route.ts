import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import {
  getOrganizationMembers,
  canManageOrganization,
  addOrganizationMember,
} from "@/lib/utils/permissions";
import { z } from "zod";

const addMemberSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
  role: z.enum(["admin", "editor", "viewer"] as const),
});

/**
 * GET /api/organizations/:id/members
 * Get all members of an organization
 */
export const GET = withAuth(async (request, { user, params }) => {
  try {
    if (!params) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }
    const { id: organizationId } = params;

    // Check if user can manage this organization
    const canManage = await canManageOrganization(user.id, organizationId);

    if (!canManage) {
      return NextResponse.json(
        { error: "Forbidden - You don't have permission to view members" },
        { status: 403 }
      );
    }

    // Get all members
    const members = await getOrganizationMembers(organizationId);

    return NextResponse.json({
      members,
    });
  } catch (error) {
    console.error("Get organization members error:", error);
    return NextResponse.json(
      { error: "Failed to get organization members" },
      { status: 500 }
    );
  }
});

/**
 * POST /api/organizations/:id/members
 * Add a new member to an organization
 */
export const POST = withAuth(async (request, { user, params }) => {
  try {
    if (!params) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }
    const { id: organizationId } = params;

    // Check if user can manage this organization
    const canManage = await canManageOrganization(user.id, organizationId);

    if (!canManage) {
      return NextResponse.json(
        { error: "Forbidden - You don't have permission to add members" },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = addMemberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { userId, role } = validation.data;

    // Add member
    try {
      const member = await addOrganizationMember(organizationId, userId, role);

      return NextResponse.json({
        success: true,
        member,
      }, { status: 201 });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes("already a member")) {
        return NextResponse.json(
          { error: "User is already a member of this organization" },
          { status: 400 }
        );
      }
      if (error instanceof Error && error.message.includes("already the owner")) {
        return NextResponse.json(
          { error: "User is already the owner of this organization" },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Add organization member error:", error);
    return NextResponse.json(
      { error: "Failed to add organization member" },
      { status: 500 }
    );
  }
});
