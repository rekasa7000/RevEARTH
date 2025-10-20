import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { getValidatedBody } from "@/lib/utils/validation-middleware";
import { updateEmissionRecordSchema } from "@/lib/validations/emission-record.schemas";

/**
 * GET /api/emission-records/:id
 * Get emission record by ID with all data
 */
export const GET = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params;

    const record = await prisma.emissionRecord.findUnique({
      where: { id },
      include: {
        organization: true,
        fuelUsage: true,
        vehicleUsage: true,
        refrigerantUsage: true,
        electricityUsage: {
          include: {
            facility: true,
          },
        },
        commutingData: true,
        calculation: true,
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Emission record not found" },
        { status: 404 }
      );
    }

    // Check if user owns the organization
    if (record.organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this emission record" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      record,
    });
  } catch (error) {
    console.error("Get emission record error:", error);
    return NextResponse.json(
      { error: "Failed to get emission record" },
      { status: 500 }
    );
  }
});

/**
 * PATCH /api/emission-records/:id
 * Update emission record
 */
export const PATCH = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params;

    // Validate request body
    const body = await getValidatedBody(request, updateEmissionRecordSchema);
    const {
      reportingPeriodStart,
      reportingPeriodEnd,
      status,
      scopeSelection,
    } = body;

    // Check if record exists and user owns it
    const existingRecord = await prisma.emissionRecord.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Emission record not found" },
        { status: 404 }
      );
    }

    if (existingRecord.organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this emission record" },
        { status: 403 }
      );
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ["draft", "submitted", "validated", "archived"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
    }

    // Validate date range if provided
    if (reportingPeriodStart && reportingPeriodEnd) {
      const startDate = new Date(reportingPeriodStart);
      const endDate = new Date(reportingPeriodEnd);

      if (startDate >= endDate) {
        return NextResponse.json(
          { error: "Reporting period end must be after start date" },
          { status: 400 }
        );
      }
    }

    // Update record
    const record = await prisma.emissionRecord.update({
      where: { id },
      data: {
        ...(reportingPeriodStart && { reportingPeriodStart: new Date(reportingPeriodStart) }),
        ...(reportingPeriodEnd && { reportingPeriodEnd: new Date(reportingPeriodEnd) }),
        ...(status && { status }),
        ...(scopeSelection && { scopeSelection }),
      },
    });

    return NextResponse.json({
      success: true,
      record,
    });
  } catch (error) {
    console.error("Update emission record error:", error);
    return NextResponse.json(
      { error: "Failed to update emission record" },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/emission-records/:id
 * Delete emission record (cascade deletes all emission data)
 */
export const DELETE = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params;

    // Check if record exists and user owns it
    const existingRecord = await prisma.emissionRecord.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: "Emission record not found" },
        { status: 404 }
      );
    }

    if (existingRecord.organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You don't have access to this emission record" },
        { status: 403 }
      );
    }

    // Delete record (cascade will delete all related data)
    await prisma.emissionRecord.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Emission record deleted successfully",
    });
  } catch (error) {
    console.error("Delete emission record error:", error);
    return NextResponse.json(
      { error: "Failed to delete emission record" },
      { status: 500 }
    );
  }
});
