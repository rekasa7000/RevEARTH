import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { getValidatedBody } from "@/lib/utils/validation-middleware";
import { createVehicleUsageSchema } from "@/lib/validations/vehicle-usage.schemas";

/**
 * POST /api/vehicle-usage
 * Add vehicle fleet data (Scope 1)
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    // Validate request body
    const body = await getValidatedBody(request, createVehicleUsageSchema);
    const {
      emissionRecordId,
      vehicleId,
      vehicleType,
      fuelType,
      fuelConsumed,
      mileage,
      unit,
      entryDate,
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

    // Create vehicle usage
    const vehicleUsage = await prisma.vehicleUsage.create({
      data: {
        emissionRecordId,
        vehicleId: vehicleId || null,
        vehicleType,
        fuelType,
        fuelConsumed: fuelConsumed || null,
        mileage: mileage || null,
        unit,
        entryDate: new Date(entryDate),
      },
    });

    return NextResponse.json({
      success: true,
      vehicleUsage,
    }, { status: 201 });
  } catch (error) {
    console.error("Create vehicle usage error:", error);
    return NextResponse.json(
      { error: "Failed to create vehicle usage" },
      { status: 500 }
    );
  }
});

/**
 * GET /api/vehicle-usage?emissionRecordId=xxx
 * Get all vehicle usage for an emission record
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

    // Get vehicle usage records
    const vehicleUsage = await prisma.vehicleUsage.findMany({
      where: { emissionRecordId },
      orderBy: {
        entryDate: "desc",
      },
    });

    return NextResponse.json({
      vehicleUsage,
    });
  } catch (error) {
    console.error("Get vehicle usage error:", error);
    return NextResponse.json(
      { error: "Failed to get vehicle usage" },
      { status: 500 }
    );
  }
});
