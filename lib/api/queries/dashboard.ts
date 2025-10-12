import { useQuery } from "@tanstack/react-query";
import { api } from "../client";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export type DashboardPeriod = "year" | "quarter" | "month";
export type TrendDirection = "increase" | "decrease" | "stable";

export interface DashboardSummary {
  totalCo2eYtd: number;
  totalScope1: number;
  totalScope2: number;
  totalScope3: number;
  emissionsPerEmployee: number;
  totalRecords: number;
  recordsWithCalculations: number;
  trend: {
    percentage: number;
    direction: TrendDirection;
    comparedTo: string;
  };
}

export interface MonthlyTrendData {
  month: string; // YYYY-MM format
  totalCo2e: number;
  scope1: number;
  scope2: number;
  scope3: number;
}

export interface CategoryBreakdown {
  fuel: number;
  vehicles: number;
  refrigerants: number;
  electricity: number;
  commuting: number;
}

export interface TopEmissionSource {
  category: string;
  value: number;
  percentage: number;
}

export interface DashboardOrganizationInfo {
  name: string;
  occupancyType: string | null;
  facilitiesCount: number;
  totalEmployees: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  trends: {
    monthly: MonthlyTrendData[];
  };
  breakdown: CategoryBreakdown;
  topSources: TopEmissionSource[];
  organization: DashboardOrganizationInfo;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch dashboard analytics data for an organization
 * @param organizationId - Required organization ID
 * @param period - Time period for analytics (year, quarter, month). Default: 'year'
 * @returns Dashboard data including summary stats, trends, breakdowns, and top sources
 *
 * @example
 * const { data: dashboard, isLoading } = useDashboard(orgId, 'year');
 *
 * if (dashboard) {
 *   console.log(`Total CO2e YTD: ${dashboard.summary.totalCo2eYtd}`);
 *   console.log(`Trend: ${dashboard.summary.trend.direction} ${dashboard.summary.trend.percentage}%`);
 * }
 */
export function useDashboard(
  organizationId: string,
  period: DashboardPeriod = "year"
) {
  return useQuery({
    queryKey: ["dashboard", organizationId, period],
    queryFn: async () => {
      const response = await api.get<DashboardData>(
        `/api/dashboard?organizationId=${organizationId}&period=${period}`
      );
      return response;
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard changes when calculations are run
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for quick navigation
  });
}

/**
 * Fetch dashboard analytics data with automatic refetching
 * Useful for dashboard pages that need to stay up-to-date
 * @param organizationId - Required organization ID
 * @param period - Time period for analytics (year, quarter, month). Default: 'year'
 * @param refetchInterval - Refetch interval in milliseconds. Default: 30 seconds
 */
export function useDashboardLive(
  organizationId: string,
  period: DashboardPeriod = "year",
  refetchInterval: number = 30000
) {
  return useQuery({
    queryKey: ["dashboard", organizationId, period],
    queryFn: async () => {
      const response = await api.get<DashboardData>(
        `/api/dashboard?organizationId=${organizationId}&period=${period}`
      );
      return response;
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval, // Auto-refetch every 30 seconds by default
    refetchIntervalInBackground: false, // Don't refetch when tab is not visible
  });
}
