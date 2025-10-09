import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";

/**
 * GET /api/analytics/comparison?organizationId=xxx&startDate=2025-01-01&endDate=2025-12-31
 * Compare emissions across different periods, facilities, or scopes
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const compareBy = searchParams.get("compareBy") || "scope"; // scope, facility, category

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Check if organization exists and user owns it
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        facilities: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (organization.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Build where clause
    const where: any = { organizationId };
    if (startDate && endDate) {
      where.reportingPeriodStart = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get emission records
    const records = await prisma.emissionRecord.findMany({
      where,
      include: {
        calculation: true,
        fuelUsage: true,
        vehicleUsage: true,
        electricityUsage: {
          include: {
            facility: true,
          },
        },
      },
    });

    let comparison: any = {};

    if (compareBy === "scope") {
      // Compare by scope
      const totalScope1 = records.reduce(
        (sum, r) => sum + parseFloat(r.calculation?.totalScope1Co2e?.toString() || "0"),
        0
      );
      const totalScope2 = records.reduce(
        (sum, r) => sum + parseFloat(r.calculation?.totalScope2Co2e?.toString() || "0"),
        0
      );
      const totalScope3 = records.reduce(
        (sum, r) => sum + parseFloat(r.calculation?.totalScope3Co2e?.toString() || "0"),
        0
      );
      const total = totalScope1 + totalScope2 + totalScope3;

      comparison = {
        type: "scope",
        data: [
          {
            name: "Scope 1 - Direct Emissions",
            value: parseFloat(totalScope1.toFixed(4)),
            percentage: total > 0 ? parseFloat(((totalScope1 / total) * 100).toFixed(2)) : 0,
          },
          {
            name: "Scope 2 - Electricity",
            value: parseFloat(totalScope2.toFixed(4)),
            percentage: total > 0 ? parseFloat(((totalScope2 / total) * 100).toFixed(2)) : 0,
          },
          {
            name: "Scope 3 - Indirect Emissions",
            value: parseFloat(totalScope3.toFixed(4)),
            percentage: total > 0 ? parseFloat(((totalScope3 / total) * 100).toFixed(2)) : 0,
          },
        ],
        total: parseFloat(total.toFixed(4)),
      };
    } else if (compareBy === "facility") {
      // Compare by facility
      const facilityData: any = {};

      records.forEach((record) => {
        record.electricityUsage.forEach((elec) => {
          if (elec.facility) {
            const facilityName = elec.facility.name;
            if (!facilityData[facilityName]) {
              facilityData[facilityName] = 0;
            }
            facilityData[facilityName] += parseFloat(elec.co2eCalculated?.toString() || "0");
          }
        });
      });

      const total = Object.values(facilityData).reduce((sum: number, val: any) => sum + val, 0);

      comparison = {
        type: "facility",
        data: Object.entries(facilityData).map(([name, value]) => ({
          name,
          value: parseFloat((value as number).toFixed(4)),
          percentage: total > 0 ? parseFloat((((value as number) / total) * 100).toFixed(2)) : 0,
        })),
        total: parseFloat(total.toFixed(4)),
      };
    } else if (compareBy === "category") {
      // Compare by category
      const categoryTotals: any = {
        fuel: 0,
        vehicles: 0,
        refrigerants: 0,
        electricity: 0,
        commuting: 0,
      };

      records.forEach((record) => {
        if (record.calculation?.breakdownByCategory) {
          const breakdown = record.calculation.breakdownByCategory as any;
          categoryTotals.fuel += breakdown.fuel || 0;
          categoryTotals.vehicles += breakdown.vehicles || 0;
          categoryTotals.refrigerants += breakdown.refrigerants || 0;
          categoryTotals.electricity += breakdown.electricity || 0;
          categoryTotals.commuting += breakdown.commuting || 0;
        }
      });

      const total = Object.values(categoryTotals).reduce((sum: number, val: any) => sum + val, 0);

      comparison = {
        type: "category",
        data: Object.entries(categoryTotals)
          .map(([name, value]) => ({
            name,
            value: parseFloat((value as number).toFixed(4)),
            percentage: total > 0 ? parseFloat((((value as number) / total) * 100).toFixed(2)) : 0,
          }))
          .filter(item => item.value > 0),
        total: parseFloat(total.toFixed(4)),
      };
    }

    return NextResponse.json({
      comparison,
      period: {
        startDate: startDate || records[0]?.reportingPeriodStart,
        endDate: endDate || records[records.length - 1]?.reportingPeriodEnd,
        recordsCount: records.length,
      },
    });
  } catch (error) {
    console.error("Comparison error:", error);
    return NextResponse.json(
      { error: "Failed to get comparison data" },
      { status: 500 }
    );
  }
});
