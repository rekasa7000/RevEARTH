import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { getValidatedBody } from "@/lib/utils/validation-middleware";
import { createFuelUsageSchema } from "@/lib/validations/fuel-usage.schemas";

/**
 * POST /api/fuel-usage
 * Add fuel consumption data (Scope 1)
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    // Validate request body
    const body = await getValidatedBody(request, createFuelUsageSchema);
    const {
      emissionRecordId,
      fuelType,
      quantity,
      unit,
      entryDate,
      metadata,
    } = body;

    // Validate fuel type (already done by schema, but keeping for reference)
    const validFuelTypes = [
      "natural_gas",
      "heating_oil",
      "propane",
      "diesel",
      "gasoline",
      "coal",
      "wood",
      "biomass",
      "lpg",
      "kerosene",
      "fuel_oil",
      "biodiesel",
      "ethanol",
      "other"
    ];
    if (!validFuelTypes.includes(fuelType)) {
      return NextResponse.json(
        { error: "Invalid fuel type" },
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

    // Validate quantity
    if (quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than 0" },
        { status: 400 }
      );
    }

    // Create fuel usage
    const fuelUsage = await prisma.fuelUsage.create({
      data: {
        emissionRecordId,
        fuelType,
        quantity,
        unit,
        entryDate: new Date(entryDate),
        metadata: metadata as any,
        // co2eCalculated will be set by calculation engine
      },
    });

    return NextResponse.json({
      success: true,
      fuelUsage,
    }, { status: 201 });
  } catch (error) {
    console.error("Create fuel usage error:", error);
    return NextResponse.json(
      { error: "Failed to create fuel usage" },
      { status: 500 }
    );
  }
});

/**
 * GET /api/fuel-usage?emissionRecordId=xxx
 * Get all fuel usage for an emission record
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

    // Get fuel usage records
    const fuelUsage = await prisma.fuelUsage.findMany({
      where: { emissionRecordId },
      orderBy: {
        entryDate: "desc",
      },
    });

    return NextResponse.json({
      fuelUsage,
    });
  } catch (error) {
    console.error("Get fuel usage error:", error);
    return NextResponse.json(
      { error: "Failed to get fuel usage" },
      { status: 500 }
    );
  }
});
