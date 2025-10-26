import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { getValidatedBody } from "@/lib/utils/validation-middleware";
import { createCommutingDataSchema } from "@/lib/validations/commuting-data.schemas";

/**
 * POST /api/commuting-data
 * Add employee commuting data (Scope 3)
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    // Validate request body
    const body = await getValidatedBody(request, createCommutingDataSchema);
    const {
      emissionRecordId,
      employeeCount,
      avgDistanceKm,
      transportMode,
      daysPerWeek,
      wfhDays,
      surveyDate,
    } = body;

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

    // Create commuting data
    const commutingData = await prisma.commutingData.create({
      data: {
        emissionRecordId,
        employeeCount: parseInt(employeeCount),
        avgDistanceKm: avgDistanceKm ? parseFloat(avgDistanceKm) : null,
        transportMode,
        daysPerWeek: daysPerWeek ? parseInt(daysPerWeek) : null,
        wfhDays: wfhDays ? parseInt(wfhDays) : null,
        surveyDate: surveyDate ? new Date(surveyDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      commutingData,
    }, { status: 201 });
  } catch (error) {
    console.error("Create commuting data error:", error);
    return NextResponse.json(
      { error: "Failed to create commuting data" },
      { status: 500 }
    );
  }
});

/**
 * GET /api/commuting-data?emissionRecordId=xxx
 * Get all commuting data for an emission record
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

    // Get commuting data records
    const commutingData = await prisma.commutingData.findMany({
      where: { emissionRecordId },
      orderBy: {
        surveyDate: "desc",
      },
    });

    return NextResponse.json({
      commutingData,
    });
  } catch (error) {
    console.error("Get commuting data error:", error);
    return NextResponse.json(
      { error: "Failed to get commuting data" },
      { status: 500 }
    );
  }
});
