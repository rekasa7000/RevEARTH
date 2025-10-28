import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { getValidatedBody } from "@/lib/utils/validation-middleware";
import { createEmissionRecordSchema } from "@/lib/validations/emission-record.schemas";

/**
 * POST /api/emission-records
 * Create a new emission record
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    // Validate request body
    const body = await getValidatedBody(request, createEmissionRecordSchema);
    const {
      organizationId,
      facilityId,
      reportingPeriodStart,
      reportingPeriodEnd,
      scopeSelection,
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

    // Validate facility if provided
    if (facilityId) {
      const facility = await prisma.facility.findFirst({
        where: {
          id: facilityId,
          organizationId,
        },
      });

      if (!facility) {
        return NextResponse.json(
          { error: "Facility not found or doesn't belong to this organization" },
          { status: 404 }
        );
      }
    }

    // Validate date range
    const startDate = new Date(reportingPeriodStart);
    const endDate = new Date(reportingPeriodEnd);

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "Reporting period end must be after start date" },
        { status: 400 }
      );
    }

    // Create emission record
    const emissionRecord = await prisma.emissionRecord.create({
      data: {
        organizationId,
        facilityId: facilityId || null,
        reportingPeriodStart: startDate,
        reportingPeriodEnd: endDate,
        status: "draft",
        scopeSelection: (scopeSelection || organization.applicableScopes) as any,
      },
    });

    return NextResponse.json({
      success: true,
      emissionRecord,
    }, { status: 201 });
  } catch (error) {
    console.error("Create emission record error:", error);
    return NextResponse.json(
      { error: "Failed to create emission record" },
      { status: 500 }
    );
  }
});

/**
 * GET /api/emission-records?organizationId=xxx&page=1&limit=10
 * Get emission records for an organization
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

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

    // Build where clause
    const where: Record<string, unknown> = { organizationId };
    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.emissionRecord.count({ where });

    // Get records with pagination
    const records = await prisma.emissionRecord.findMany({
      where,
      include: {
        calculation: true,
        _count: {
          select: {
            fuelUsage: true,
            vehicleUsage: true,
            refrigerantUsage: true,
            electricityUsage: true,
            commutingData: true,
          },
        },
      },
      orderBy: {
        reportingPeriodStart: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get emission records error:", error);
    return NextResponse.json(
      { error: "Failed to get emission records" },
      { status: 500 }
    );
  }
});
