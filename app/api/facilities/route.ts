import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { getValidatedBody } from "@/lib/utils/validation-middleware";
import { createFacilitySchema } from "@/lib/validations/facility.schemas";

/**
 * POST /api/facilities
 * Create a new facility
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    // Validate request body
    const body = await getValidatedBody(request, createFacilitySchema);
    const {
      organizationId,
      name,
      location,
      address,
      areaSqm,
      employeeCount,
    } = body;

    // Check if organization exists and user owns it
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this organization" },
        { status: 403 }
      );
    }

    // Create facility
    const facility = await prisma.facility.create({
      data: {
        organizationId,
        name,
        location: location || null,
        address: address || null,
        areaSqm: areaSqm ? parseFloat(areaSqm.toString()) : null,
        employeeCount: employeeCount ? parseInt(employeeCount.toString()) : null,
      },
    });

    return NextResponse.json({
      success: true,
      facility,
    }, { status: 201 });
  } catch (error) {
    console.error("Create facility error:", error);
    return NextResponse.json(
      { error: "Failed to create facility" },
      { status: 500 }
    );
  }
});

/**
 * GET /api/facilities?organizationId=xxx
 * Get all facilities for an organization
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Check if organization exists and user owns it
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this organization" },
        { status: 403 }
      );
    }

    // Get facilities with emission records count
    const facilities = await prisma.facility.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: {
            electricityUsage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      facilities,
    });
  } catch (error) {
    console.error("Get facilities error:", error);
    return NextResponse.json(
      { error: "Failed to get facilities" },
      { status: 500 }
    );
  }
});
