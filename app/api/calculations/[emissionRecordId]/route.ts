import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";

/**
 * GET /api/calculations/:emissionRecordId
 * Get calculation results for an emission record
 */
export const GET = withAuth(async (request, { user, params }) => {
  try {
    const { emissionRecordId } = params;

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

    // Get calculation
    const calculation = await prisma.emissionCalculation.findUnique({
      where: { emissionRecordId },
    });

    if (!calculation) {
      return NextResponse.json(
        { error: "Calculation not found - run calculations first" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      calculation,
    });
  } catch (error) {
    console.error("Get calculation error:", error);
    return NextResponse.json(
      { error: "Failed to get calculation" },
      { status: 500 }
    );
  }
});
