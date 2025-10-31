import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface EmissionCalculation {
  id: string;
  emissionRecordId: string;
  totalScope1Co2e: number | null;
  totalScope2Co2e: number | null;
  totalScope3Co2e: number | null;
  totalCo2e: number | null;
  breakdownByCategory: Record<string, unknown> | null;
  emissionFactorsUsed: Record<string, unknown> | null;
  emissionsPerEmployee: number | null;
  calculatedAt: string;
}

export interface CalculationSummary {
  totalCo2e: number;
  totalScope1Co2e: number;
  totalScope2Co2e: number;
  totalScope3Co2e: number;
  emissionsPerEmployee: number;
  breakdownByCategory: Record<string, unknown>;
}

export interface TriggerCalculationInput {
  emissionRecordId: string;
}

interface CalculationResponse {
  calculation: EmissionCalculation;
}

interface TriggerCalculationResponse {
  success: boolean;
  calculation: EmissionCalculation;
  summary: CalculationSummary;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch calculation results for an emission record
 * @param emissionRecordId - Required emission record ID
 * @returns Calculation results including scope breakdowns and emission factors
 */
export function useCalculation(emissionRecordId: string) {
  return useQuery({
    queryKey: ["calculation", emissionRecordId],
    queryFn: async () => {
      const response = await api.get<CalculationResponse>(
        `/api/calculations/${emissionRecordId}`
      );
      return response.calculation;
    },
    enabled: !!emissionRecordId,
    staleTime: 2 * 60 * 1000, // 2 minutes - calculations are relatively stable
    retry: (failureCount, error: Error) => {
      // Don't retry if calculation doesn't exist (404)
      if ('response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Trigger calculation for an emission record
 * Runs the calculation engine to compute CO2e emissions for all data entries
 * Automatically invalidates calculation and emission-record queries on success
 *
 * @example
 * const triggerCalculation = useTriggerCalculation();
 *
 * triggerCalculation.mutate({ emissionRecordId: "rec_123" }, {
 *   onSuccess: (data) => {
 *     console.log(`Total CO2e: ${data.summary.totalCo2e}`);
 *   }
 * });
 */
export function useTriggerCalculation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ emissionRecordId }: TriggerCalculationInput) => {
      const response = await api.post<TriggerCalculationResponse>(
        "/api/calculations",
        { emissionRecordId }
      );
      return response;
    },
    onSuccess: (data) => {
      const { calculation } = data;

      // Set the calculation in cache immediately
      queryClient.setQueryData(
        ["calculation", calculation.emissionRecordId],
        calculation
      );

      // Invalidate the emission record to update it with new calculation data
      queryClient.invalidateQueries({
        queryKey: ["emissionRecord", calculation.emissionRecordId],
      });

      // Invalidate all usage data queries to show updated co2eCalculated values
      queryClient.invalidateQueries({
        queryKey: ["fuel-usage", calculation.emissionRecordId],
      });
      queryClient.invalidateQueries({
        queryKey: ["vehicle-usage", calculation.emissionRecordId],
      });
      queryClient.invalidateQueries({
        queryKey: ["electricity-usage", calculation.emissionRecordId],
      });
      queryClient.invalidateQueries({
        queryKey: ["commuting-data", calculation.emissionRecordId],
      });
    },
    onError: (error: unknown) => {
      console.error("Failed to trigger calculation:", error);
    },
  });
}
