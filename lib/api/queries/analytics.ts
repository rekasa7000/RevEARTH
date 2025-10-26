import { useQuery } from "@tanstack/react-query";
import { api } from "../client";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export type ComparisonType = "scope" | "facility" | "category";

export interface TrendDataPoint {
  date: string; // YYYY-MM-DD format
  month: string; // YYYY-MM format
  totalCo2e: number;
  scope1: number;
  scope2: number;
  scope3: number;
  breakdown: Record<string, any>;
}

export interface TrendStatistics {
  min: number;
  max: number;
  average: number;
  dataPoints: number;
}

export interface TrendsResponse {
  trends: TrendDataPoint[];
  movingAverage: (number | null)[];
  statistics: TrendStatistics;
}

export interface ComparisonDataItem {
  name: string;
  value: number;
  percentage: number;
}

export interface ComparisonResult {
  type: ComparisonType;
  data: ComparisonDataItem[];
  total: number;
}

export interface ComparisonPeriod {
  startDate: string | Date;
  endDate: string | Date;
  recordsCount: number;
}

export interface ComparisonResponse {
  comparison: ComparisonResult;
  period: ComparisonPeriod;
}

export interface ComparisonOptions {
  startDate?: string;
  endDate?: string;
  compareBy?: ComparisonType;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch emission trends over time
 * @param organizationId - Required organization ID
 * @param months - Number of months to fetch (default: 12)
 * @returns Trend data including monthly emissions, moving average, and statistics
 *
 * @example
 * const { data: trends } = useTrends(orgId, 12);
 *
 * if (trends) {
 *   console.log(`Average CO2e: ${trends.statistics.average}`);
 *   console.log(`Data points: ${trends.statistics.dataPoints}`);
 * }
 */
export function useTrends(organizationId: string, months: number = 12) {
  return useQuery({
    queryKey: ["analytics", "trends", organizationId, months],
    queryFn: async () => {
      const response = await api.get<TrendsResponse>(
        `/api/analytics/trends?organizationId=${organizationId}&months=${months}`
      );
      return response;
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes - trends don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes - keep historical data longer
  });
}

/**
 * Compare emissions across different dimensions (scope, facility, category)
 * @param organizationId - Required organization ID
 * @param options - Comparison options (date range, comparison type)
 * @returns Comparison data with breakdown by selected dimension
 *
 * @example
 * // Compare by scope
 * const { data: comparison } = useComparison(orgId, {
 *   compareBy: 'scope',
 *   startDate: '2025-01-01',
 *   endDate: '2025-12-31'
 * });
 *
 * // Compare by facility
 * const { data: comparison } = useComparison(orgId, { compareBy: 'facility' });
 *
 * // Compare by category
 * const { data: comparison } = useComparison(orgId, { compareBy: 'category' });
 */
export function useComparison(
  organizationId: string,
  options?: ComparisonOptions
) {
  const { startDate, endDate, compareBy = "scope" } = options || {};

  return useQuery({
    queryKey: ["analytics", "comparison", organizationId, startDate, endDate, compareBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        organizationId,
        compareBy,
      });

      if (startDate) {
        params.append("startDate", startDate);
      }
      if (endDate) {
        params.append("endDate", endDate);
      }

      const response = await api.get<ComparisonResponse>(
        `/api/analytics/comparison?${params.toString()}`
      );
      return response;
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch scope comparison for quick access
 * Convenience hook that calls useComparison with compareBy='scope'
 * @param organizationId - Required organization ID
 * @param startDate - Optional start date (YYYY-MM-DD)
 * @param endDate - Optional end date (YYYY-MM-DD)
 */
export function useScopeComparison(
  organizationId: string,
  startDate?: string,
  endDate?: string
) {
  return useComparison(organizationId, {
    compareBy: "scope",
    startDate,
    endDate,
  });
}

/**
 * Fetch facility comparison for quick access
 * Convenience hook that calls useComparison with compareBy='facility'
 * @param organizationId - Required organization ID
 * @param startDate - Optional start date (YYYY-MM-DD)
 * @param endDate - Optional end date (YYYY-MM-DD)
 */
export function useFacilityComparison(
  organizationId: string,
  startDate?: string,
  endDate?: string
) {
  return useComparison(organizationId, {
    compareBy: "facility",
    startDate,
    endDate,
  });
}

/**
 * Fetch category comparison for quick access
 * Convenience hook that calls useComparison with compareBy='category'
 * @param organizationId - Required organization ID
 * @param startDate - Optional start date (YYYY-MM-DD)
 * @param endDate - Optional end date (YYYY-MM-DD)
 */
export function useCategoryComparison(
  organizationId: string,
  startDate?: string,
  endDate?: string
) {
  return useComparison(organizationId, {
    compareBy: "category",
    startDate,
    endDate,
  });
}
