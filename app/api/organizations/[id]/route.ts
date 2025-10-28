import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { getValidatedBody } from "@/lib/utils/validation-middleware";
import { updateOrganizationSchema } from "@/lib/validations/organization.schemas";

/**
 * GET /api/organizations/:id
 * Get organization by ID
 */
export const GET = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params;

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        facilities: true,
        _count: {
          select: {
            emissionRecords: true,
            facilities: true,
            commuteSurveys: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if user owns this organization
    if (organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this organization" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      organization,
    });
  } catch (error) {
    console.error("Get organization error:", error);
    return NextResponse.json(
      { error: "Failed to get organization" },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/organizations/:id
 * Update organization
 */
export const PATCH = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params;

    // Validate request body
    const body = await getValidatedBody(request, updateOrganizationSchema);
    const {
      name,
      industrySector,
      occupancyType,
      reportingBoundaries,
      applicableScopes,
    } = body;

    // Check if organization exists and user owns it
    const existingOrg = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existingOrg) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (existingOrg.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this organization" },
        { status: 403 }
      );
    }

    // Update organization
    const organization = await prisma.organization.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(industrySector !== undefined && { industrySector }),
        ...(occupancyType && { occupancyType }),
        ...(reportingBoundaries !== undefined && { reportingBoundaries: reportingBoundaries as any }),
        ...(applicableScopes && { applicableScopes: applicableScopes as any }),
      },
    });

    return NextResponse.json({
      success: true,
      organization,
    });
  } catch (error) {
    console.error("Update organization error:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/organizations/:id
 * Delete organization (cascade deletes all related data)
 */
export const DELETE = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params;

    // Check if organization exists and user owns it
    const existingOrg = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existingOrg) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (existingOrg.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this organization" },
        { status: 403 }
      );
    }

    // Delete organization (cascade will delete all related data)
    await prisma.organization.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Organization deleted successfully",
    });
  } catch (error) {
    console.error("Delete organization error:", error);
    return NextResponse.json(
      { error: "Failed to delete organization" },
      { status: 500 }
    );
  }
});
