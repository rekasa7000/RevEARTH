import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";

/**
 * GET /api/analytics/trends?organizationId=xxx&months=12
 * Get emission trends over time
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const months = parseInt(searchParams.get("months") || "12");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Check if organization exists and user owns it
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
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

    // Calculate start date
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get emission records with calculations
    const records = await prisma.emissionRecord.findMany({
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

    // Build trend data
    const trendData = records
      .filter(r => r.calculation)
      .map(record => ({
        date: record.reportingPeriodStart.toISOString().substring(0, 10),
        month: record.reportingPeriodStart.toISOString().substring(0, 7),
        totalCo2e: parseFloat(record.calculation!.totalCo2e?.toString() || "0"),
        scope1: parseFloat(record.calculation!.totalScope1Co2e?.toString() || "0"),
        scope2: parseFloat(record.calculation!.totalScope2Co2e?.toString() || "0"),
        scope3: parseFloat(record.calculation!.totalScope3Co2e?.toString() || "0"),
        breakdown: record.calculation!.breakdownByCategory as Record<string, unknown>,
      }));

    // Calculate moving average (3-month)
    const movingAverage = trendData.map((item, index) => {
      if (index < 2) return null;
      const sum = trendData
        .slice(index - 2, index + 1)
        .reduce((acc, val) => acc + val.totalCo2e, 0);
      return parseFloat((sum / 3).toFixed(4));
    });

    // Calculate statistics
    const values = trendData.map(d => d.totalCo2e);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    return NextResponse.json({
      trends: trendData,
      movingAverage,
      statistics: {
        min: parseFloat(min.toFixed(4)),
        max: parseFloat(max.toFixed(4)),
        average: parseFloat(avg.toFixed(4)),
        dataPoints: trendData.length,
      },
    });
  } catch (error) {
    console.error("Trends error:", error);
    return NextResponse.json(
      { error: "Failed to get trends" },
      { status: 500 }
    );
  }
});
