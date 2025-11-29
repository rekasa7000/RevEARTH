import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";

/**
 * GET /api/dashboard?organizationId=xxx&period=year
 * Get dashboard analytics data
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const period = searchParams.get("period") || "year"; // year, quarter, month

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

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        break;
      case "year":
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Get all emission records for the period
    const emissionRecords = await prisma.emissionRecord.findMany({
      where: {
        organizationId,
        reportingPeriodStart: {
          gte: startDate,
        },
      },
      include: {
        calculation: true,
      },
      orderBy: {
        reportingPeriodStart: "asc",
      },
    });

    // Calculate summary statistics
    const totalRecords = emissionRecords.length;
    const recordsWithCalculations = emissionRecords.filter(r => r.calculation).length;

    let totalCo2eYtd = 0;
    let totalScope1 = 0;
    let totalScope2 = 0;
    let totalScope3 = 0;

    const monthlyData: Array<{ month: string; totalCo2e: number; scope1: number; scope2: number; scope3: number }> = [];
    const categoryBreakdown: Record<string, number> = {
      fuel: 0,
      vehicles: 0,
      refrigerants: 0,
      electricity: 0,
      commuting: 0,
    };

    emissionRecords.forEach((record) => {
      if (record.calculation) {
        const calc = record.calculation;
        totalCo2eYtd += parseFloat(calc.totalCo2e?.toString() || "0");
        totalScope1 += parseFloat(calc.totalScope1Co2e?.toString() || "0");
        totalScope2 += parseFloat(calc.totalScope2Co2e?.toString() || "0");
        totalScope3 += parseFloat(calc.totalScope3Co2e?.toString() || "0");

        // Add to monthly data
        monthlyData.push({
          month: record.reportingPeriodStart.toISOString().substring(0, 7), // YYYY-MM
          totalCo2e: parseFloat(calc.totalCo2e?.toString() || "0"),
          scope1: parseFloat(calc.totalScope1Co2e?.toString() || "0"),
          scope2: parseFloat(calc.totalScope2Co2e?.toString() || "0"),
          scope3: parseFloat(calc.totalScope3Co2e?.toString() || "0"),
        });

        // Add to category breakdown
        if (calc.breakdownByCategory) {
          const breakdown = calc.breakdownByCategory as Record<string, number>;
          categoryBreakdown.fuel += breakdown.fuel || 0;
          categoryBreakdown.vehicles += breakdown.vehicles || 0;
          categoryBreakdown.refrigerants += breakdown.refrigerants || 0;
          categoryBreakdown.electricity += breakdown.electricity || 0;
          categoryBreakdown.commuting += breakdown.commuting || 0;
        }
      }
    });

    // Calculate emissions per employee
    const totalEmployees = organization.facilities.reduce(
      (sum, facility) => sum + (facility.employeeCount || 0),
      0
    );
    const emissionsPerEmployee = totalEmployees > 0 ? totalCo2eYtd / totalEmployees : 0;

    // Identify top emission sources
    const topSources = Object.entries(categoryBreakdown)
      .map(([category, value]) => ({
        category,
        value: parseFloat((value as number).toFixed(4)),
        percentage: totalCo2eYtd > 0 ? parseFloat(((value as number / totalCo2eYtd) * 100).toFixed(2)) : 0,
      }))
      .filter(s => s.value > 0)
      .sort((a, b) => b.value - a.value);

    // Calculate trend (comparing to previous period)
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);

    const previousRecords = await prisma.emissionRecord.findMany({
      where: {
        organizationId,
        reportingPeriodStart: {
          gte: previousPeriodStart,
          lt: startDate,
        },
      },
      include: {
        calculation: true,
      },
    });

    const previousTotal = previousRecords.reduce(
      (sum, record) => sum + parseFloat(record.calculation?.totalCo2e?.toString() || "0"),
      0
    );

    const trend = previousTotal > 0
      ? parseFloat((((totalCo2eYtd - previousTotal) / previousTotal) * 100).toFixed(2))
      : 0;

    // Response
    return NextResponse.json({
      summary: {
        totalCo2eYtd: parseFloat(totalCo2eYtd.toFixed(4)),
        totalScope1: parseFloat(totalScope1.toFixed(4)),
        totalScope2: parseFloat(totalScope2.toFixed(4)),
        totalScope3: parseFloat(totalScope3.toFixed(4)),
        emissionsPerEmployee: parseFloat(emissionsPerEmployee.toFixed(4)),
        totalRecords,
        recordsWithCalculations,
        trend: {
          percentage: trend,
          direction: trend > 0 ? "increase" : trend < 0 ? "decrease" : "stable",
          comparedTo: "previous year",
        },
      },
      trends: {
        monthly: monthlyData,
      },
      breakdown: categoryBreakdown,
      topSources,
      organization: {
        name: organization.name,
        occupancyType: organization.occupancyType,
        facilitiesCount: organization.facilities.length,
        totalEmployees,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to get dashboard data" },
      { status: 500 }
    );
  }
});
