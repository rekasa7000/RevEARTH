import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { calculateEmissionRecord } from "@/lib/services/calculation-engine";
import { getValidatedBody } from "@/lib/utils/validation-middleware";
import { calculateEmissionsSchema } from "@/lib/validations/calculation.schemas";
import { checkRateLimit } from "@/lib/utils/rate-limit-middleware";
import { RateLimits } from "@/lib/services/rate-limiter";

/**
 * POST /api/calculations
 * Trigger calculation for an emission record
 * Rate limited: 10 requests per minute (expensive operation)
 */
export const POST = withAuth(async (request, { user }) => {
  // Apply strict rate limiting for expensive calculations
  const rateLimit = await checkRateLimit(request, RateLimits.CALCULATION, user.id);
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }
  try {
    // Validate request body
    const body = await getValidatedBody(request, calculateEmissionsSchema);
    const { emissionRecordId } = body;

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
