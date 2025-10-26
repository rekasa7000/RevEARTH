import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";

/**
 * POST /api/electricity-usage
 * Add electricity consumption data (Scope 2)
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    const body = await request.json();
    const {
      emissionRecordId,
      facilityId,
      meterNumber,
      kwhConsumption,
      peakHoursKwh,
      offpeakHoursKwh,
      billingPeriodStart,
      billingPeriodEnd,
      utilityBillData,
    } = body;

    // Validate required fields
    if (!emissionRecordId || !kwhConsumption || !billingPeriodStart || !billingPeriodEnd) {
      return NextResponse.json(
        { error: "Emission record ID, kWh consumption, billing period start and end are required" },
        { status: 400 }
      );
    }

    // Check if emission record exists and user owns it
    const emissionRecord = await prisma.emissionRecord.findUnique({
      where: { id: emissionRecordId },
      include: {
        organization: true,
      },
    });

    if (!emissionRecord) {
      return NextResponse.json(
        { error: "Emission record not found" },
        { status: 404 }
      );
    }

    if (emissionRecord.organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Validate facility if provided
    if (facilityId) {
      const facility = await prisma.facility.findFirst({
        where: {
          id: facilityId,
          organizationId: emissionRecord.organizationId,
        },
      });

      if (!facility) {
        return NextResponse.json(
          { error: "Facility not found or doesn't belong to this organization" },
          { status: 404 }
        );
      }
    }

    // Validate kWh consumption
    if (parseFloat(kwhConsumption) <= 0) {
      return NextResponse.json(
        { error: "kWh consumption must be greater than 0" },
        { status: 400 }
      );
    }

    // Create electricity usage
    const electricityUsage = await prisma.electricityUsage.create({
      data: {
        emissionRecordId,
        facilityId: facilityId || null,
        meterNumber: meterNumber || null,
        kwhConsumption: parseFloat(kwhConsumption),
        peakHoursKwh: peakHoursKwh ? parseFloat(peakHoursKwh) : null,
        offpeakHoursKwh: offpeakHoursKwh ? parseFloat(offpeakHoursKwh) : null,
        billingPeriodStart: new Date(billingPeriodStart),
        billingPeriodEnd: new Date(billingPeriodEnd),
        utilityBillData: utilityBillData || null,
      },
    });

    return NextResponse.json({
      success: true,
      electricityUsage,
    }, { status: 201 });
  } catch (error) {
    console.error("Create electricity usage error:", error);
    return NextResponse.json(
      { error: "Failed to create electricity usage" },
      { status: 500 }
    );
  }
});

/**
 * GET /api/electricity-usage?emissionRecordId=xxx
 * Get all electricity usage for an emission record
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const emissionRecordId = searchParams.get("emissionRecordId");

    if (!emissionRecordId) {
      return NextResponse.json(
        { error: "Emission record ID is required" },
        { status: 400 }
      );
    }

    // Check if emission record exists and user owns it
    const emissionRecord = await prisma.emissionRecord.findUnique({
      where: { id: emissionRecordId },
      include: {
        organization: true,
      },
    });

    if (!emissionRecord) {
      return NextResponse.json(
        { error: "Emission record not found" },
        { status: 404 }
      );
    }

    if (emissionRecord.organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Get electricity usage records
    const electricityUsage = await prisma.electricityUsage.findMany({
      where: { emissionRecordId },
      include: {
        facility: true,
      },
      orderBy: {
        billingPeriodStart: "desc",
      },
    });

    return NextResponse.json({
      electricityUsage,
    });
  } catch (error) {
    console.error("Get electricity usage error:", error);
    return NextResponse.json(
      { error: "Failed to get electricity usage" },
      { status: 500 }
    );
  }
});
