import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getValidatedBody } from "@/lib/utils/validation-middleware";
import { createRefrigerantUsageSchema } from "@/lib/validations/refrigerant-usage.schemas";

/**
 * POST /api/refrigerant-usage
 * Add refrigerant usage data (Scope 1)
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    // Validate request body
    const body = await getValidatedBody(request, createRefrigerantUsageSchema);
    console.log("Received refrigerant usage body:", body);

    const {
      emissionRecordId,
      equipmentId,
      refrigerantType,
      quantityLeaked,
      quantityPurchased,
      unit,
      entryDate,
      leakDetectionLog,
    } = body;

    // Validate refrigerant type (already done by schema, but keeping for reference)
    const validRefrigerantTypes = ["R_410A", "R_134a", "R_32", "R_404A"];
    if (!validRefrigerantTypes.includes(refrigerantType)) {
      return NextResponse.json(
        { error: "Invalid refrigerant type" },
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

    // Validate quantities
    if (quantityLeaked !== undefined && quantityLeaked !== null && parseFloat(quantityLeaked.toString()) < 0) {
      return NextResponse.json(
        { error: "Quantity leaked must be non-negative" },
        { status: 400 }
      );
    }

    if (quantityPurchased !== undefined && quantityPurchased !== null && parseFloat(quantityPurchased.toString()) < 0) {
      return NextResponse.json(
        { error: "Quantity purchased must be non-negative" },
        { status: 400 }
      );
    }

    // Create refrigerant usage
    const refrigerantUsage = await prisma.refrigerantUsage.create({
      data: {
        emissionRecordId,
        equipmentId: equipmentId || null,
        refrigerantType,
        quantityLeaked: quantityLeaked !== undefined && quantityLeaked !== null ? parseFloat(quantityLeaked.toString()) : null,
        quantityPurchased: quantityPurchased !== undefined && quantityPurchased !== null ? parseFloat(quantityPurchased.toString()) : null,
        unit,
        entryDate: new Date(entryDate),
        leakDetectionLog: (leakDetectionLog as Prisma.InputJsonValue) || undefined,
        // co2eCalculated will be set by calculation engine
      },
    });

    return NextResponse.json({
      success: true,
      refrigerantUsage,
    }, { status: 201 });
  } catch (error) {
    console.error("Create refrigerant usage error:", error);

    // Log detailed error info for debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Failed to create refrigerant usage",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
});

/**
 * GET /api/refrigerant-usage?emissionRecordId=xxx
 * Get all refrigerant usage for an emission record
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

    // Get refrigerant usage records
    const refrigerantUsage = await prisma.refrigerantUsage.findMany({
      where: { emissionRecordId },
      orderBy: {
        entryDate: "desc",
      },
    });

    return NextResponse.json({
      refrigerantUsage,
    });
  } catch (error) {
    console.error("Get refrigerant usage error:", error);
    return NextResponse.json(
      { error: "Failed to get refrigerant usage" },
      { status: 500 }
    );
  }
});