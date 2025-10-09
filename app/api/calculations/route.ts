import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { calculateEmissionRecord } from "@/lib/services/calculation-engine";

/**
 * POST /api/calculations
 * Trigger calculation for an emission record
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    const body = await request.json();
    const { emissionRecordId } = body;

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
        { error: "Forbidden - You don't have access to this emission record" },
        { status: 403 }
      );
    }

    // Run calculation engine
    const result = await calculateEmissionRecord(emissionRecordId);

    return NextResponse.json({
      success: true,
      calculation: result.calculation,
      summary: result.summary,
    });
  } catch (error) {
    console.error("Calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate emissions" },
      { status: 500 }
    );
  }
});
