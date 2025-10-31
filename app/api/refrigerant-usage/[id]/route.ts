import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getValidatedBody } from "@/lib/utils/validation-middleware";
import { updateRefrigerantUsageSchema } from "@/lib/validations/refrigerant-usage.schemas";

/**
 * GET /api/refrigerant-usage/:id
 * Get a single refrigerant usage entry
 */
export const GET = withAuth(async (request, { user, params }) => {
  try {
    if (!params) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }
    const { id } = params;

    // Check if refrigerant usage exists and user owns it
    const refrigerantUsage = await prisma.refrigerantUsage.findUnique({
      where: { id },
      include: {
        emissionRecord: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!refrigerantUsage) {
      return NextResponse.json(
        { error: "Refrigerant usage not found" },
        { status: 404 }
      );
    }

    if (refrigerantUsage.emissionRecord.organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

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

/**
 * PATCH /api/refrigerant-usage/:id
 * Update refrigerant usage entry
 */
export const PATCH = withAuth(async (request, { user, params }) => {
  try {
    if (!params) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }
    const { id } = params;
    const body = await getValidatedBody(request, updateRefrigerantUsageSchema);
    const {
      equipmentId,
      refrigerantType,
      quantityLeaked,
      quantityPurchased,
      unit,
      entryDate,
      leakDetectionLog,
    } = body;

    // Check if refrigerant usage exists and user owns it
    const existingRefrigerantUsage = await prisma.refrigerantUsage.findUnique({
      where: { id },
      include: {
        emissionRecord: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!existingRefrigerantUsage) {
      return NextResponse.json(
        { error: "Refrigerant usage not found" },
        { status: 404 }
      );
    }

    if (existingRefrigerantUsage.emissionRecord.organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Validate refrigerant type if provided
    if (refrigerantType) {
      const validRefrigerantTypes = ["R_410A", "R_134a", "R_32", "R_404A"];
      if (!validRefrigerantTypes.includes(refrigerantType)) {
        return NextResponse.json(
          { error: "Invalid refrigerant type" },
          { status: 400 }
        );
      }
    }

    // Validate quantities if provided
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

    // Update refrigerant usage
    const refrigerantUsage = await prisma.refrigerantUsage.update({
      where: { id },
      data: {
        ...(equipmentId !== undefined && { equipmentId }),
        ...(refrigerantType && { refrigerantType }),
        ...(quantityLeaked !== undefined && quantityLeaked !== null && {
          quantityLeaked: parseFloat(quantityLeaked.toString()),
        }),
        ...(quantityPurchased !== undefined && quantityPurchased !== null && {
          quantityPurchased: parseFloat(quantityPurchased.toString()),
        }),
        ...(unit && { unit }),
        ...(entryDate && { entryDate: new Date(entryDate) }),
        ...(leakDetectionLog !== undefined && { leakDetectionLog: (leakDetectionLog as Prisma.InputJsonValue) || undefined }),
      },
    });

    return NextResponse.json({
      success: true,
      refrigerantUsage,
    });
  } catch (error) {
    console.error("Update refrigerant usage error:", error);
    return NextResponse.json(
      { error: "Failed to update refrigerant usage" },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/refrigerant-usage/:id
 * Delete refrigerant usage entry
 */
export const DELETE = withAuth(async (request, { user, params }) => {
  try {
    if (!params) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }
    const { id } = params;

    // Check if refrigerant usage exists and user owns it
    const existingRefrigerantUsage = await prisma.refrigerantUsage.findUnique({
      where: { id },
      include: {
        emissionRecord: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!existingRefrigerantUsage) {
      return NextResponse.json(
        { error: "Refrigerant usage not found" },
        { status: 404 }
      );
    }

    if (existingRefrigerantUsage.emissionRecord.organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Delete refrigerant usage
    await prisma.refrigerantUsage.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Refrigerant usage deleted successfully",
    });
  } catch (error) {
    console.error("Delete refrigerant usage error:", error);
    return NextResponse.json(
      { error: "Failed to delete refrigerant usage" },
      { status: 500 }
    );
  }
});
