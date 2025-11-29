import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { getValidatedBody } from "@/lib/utils/validation-middleware";
import { updateFacilitySchema } from "@/lib/validations/facility.schemas";

/**
 * GET /api/facilities/:id
 * Get facility by ID
 */
export const GET = withAuth(async (request, { user, params }) => {
  try {
    if (!params) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }
    const { id } = params;

    const facility = await prisma.facility.findUnique({
      where: { id },
      include: {
        organization: true,
        _count: {
          select: {
            electricityUsage: true,
          },
        },
      },
    });

    if (!facility) {
      return NextResponse.json(
        { error: "Facility not found" },
        { status: 404 }
      );
    }

    // Check if user owns the organization
    if (facility.organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this facility" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      facility,
    });
  } catch (error) {
    console.error("Get facility error:", error);
    return NextResponse.json(
      { error: "Failed to get facility" },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/facilities/:id
 * Update facility
 */
export const PATCH = withAuth(async (request, { user, params }) => {
  try {
    if (!params) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }
    const { id } = params;

    // Validate request body
    const body = await getValidatedBody(request, updateFacilitySchema);
    const {
      name,
      location,
      address,
      areaSqm,
      employeeCount,
    } = body;

    // Check if facility exists and user owns it
    const existingFacility = await prisma.facility.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    if (!existingFacility) {
      return NextResponse.json(
        { error: "Facility not found" },
        { status: 404 }
      );
    }

    if (existingFacility.organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this facility" },
        { status: 403 }
      );
    }

    // Update facility
    const facility = await prisma.facility.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(location !== undefined && { location }),
        ...(address !== undefined && { address }),
        ...(areaSqm !== undefined && {
          areaSqm: areaSqm ? parseFloat(areaSqm.toString()) : null,
        }),
        ...(employeeCount !== undefined && {
          employeeCount: employeeCount ? parseInt(employeeCount.toString()) : null,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      facility,
    });
  } catch (error) {
    console.error("Update facility error:", error);
    return NextResponse.json(
      { error: "Failed to update facility" },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/facilities/:id
 * Delete facility
 */
export const DELETE = withAuth(async (request, { user, params }) => {
  try {
    if (!params) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }
    const { id } = params;

    // Check if facility exists and user owns it
    const existingFacility = await prisma.facility.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    if (!existingFacility) {
      return NextResponse.json(
        { error: "Facility not found" },
        { status: 404 }
      );
    }

    if (existingFacility.organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this facility" },
        { status: 403 }
      );
    }

    // Delete facility
    await prisma.facility.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Facility deleted successfully",
    });
  } catch (error) {
    console.error("Delete facility error:", error);
    return NextResponse.json(
      { error: "Failed to delete facility" },
      { status: 500 }
    );
  }
});
