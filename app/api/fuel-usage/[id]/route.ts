import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";

/**
 * PATCH /api/fuel-usage/:id
 * Update fuel usage entry
 */
export const PATCH = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { fuelType, quantity, unit, entryDate, metadata } = body;

    // Check if fuel usage exists and user owns it
    const existingFuelUsage = await prisma.fuelUsage.findUnique({
      where: { id },
      include: {
        emissionRecord: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!existingFuelUsage) {
      return NextResponse.json(
        { error: "Fuel usage not found" },
        { status: 404 }
      );
    }

    if (existingFuelUsage.emissionRecord.organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Validate fuel type if provided
    if (fuelType) {
      const validFuelTypes = ["natural_gas", "heating_oil", "propane", "diesel", "gasoline"];
      if (!validFuelTypes.includes(fuelType)) {
        return NextResponse.json(
          { error: "Invalid fuel type" },
          { status: 400 }
        );
      }
    }

    // Validate quantity if provided
    if (quantity && parseFloat(quantity) <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than 0" },
        { status: 400 }
      );
    }

    // Update fuel usage
    const fuelUsage = await prisma.fuelUsage.update({
      where: { id },
      data: {
        ...(fuelType && { fuelType }),
        ...(quantity && { quantity: parseFloat(quantity) }),
        ...(unit && { unit }),
        ...(entryDate && { entryDate: new Date(entryDate) }),
        ...(metadata !== undefined && { metadata }),
      },
    });

    return NextResponse.json({
      success: true,
      fuelUsage,
    });
  } catch (error) {
    console.error("Update fuel usage error:", error);
    return NextResponse.json(
      { error: "Failed to update fuel usage" },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/fuel-usage/:id
 * Delete fuel usage entry
 */
export const DELETE = withAuth(async (request, { user, params }) => {
  try {
    const { id } = params;

    // Check if fuel usage exists and user owns it
    const existingFuelUsage = await prisma.fuelUsage.findUnique({
      where: { id },
      include: {
        emissionRecord: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!existingFuelUsage) {
      return NextResponse.json(
        { error: "Fuel usage not found" },
        { status: 404 }
      );
    }

    if (existingFuelUsage.emissionRecord.organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Delete fuel usage
    await prisma.fuelUsage.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Fuel usage deleted successfully",
    });
  } catch (error) {
    console.error("Delete fuel usage error:", error);
    return NextResponse.json(
      { error: "Failed to delete fuel usage" },
      { status: 500 }
    );
  }
});
