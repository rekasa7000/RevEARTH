import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface ElectricityUsage {
  id: string;
  emissionRecordId: string;
  facilityId?: string | null;
  meterNumber?: string | null;
  kwhConsumption: number;
  peakHoursKwh?: number | null;
  offpeakHoursKwh?: number | null;
  co2eCalculated?: number | null;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  utilityBillData?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  facility?: {
    id: string;
    name: string;
    organizationId: string;
  } | null;
}

export interface CreateElectricityUsageInput {
  emissionRecordId: string;
  facilityId?: string;
  meterNumber?: string;
  kwhConsumption: number;
  peakHoursKwh?: number;
  offpeakHoursKwh?: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  utilityBillData?: Record<string, unknown>;
}

export interface UpdateElectricityUsageInput {
  id: string;
  data: {
    facilityId?: string | null;
    meterNumber?: string | null;
    kwhConsumption?: number;
    peakHoursKwh?: number | null;
    offpeakHoursKwh?: number | null;
    billingPeriodStart?: string;
    billingPeriodEnd?: string;
    utilityBillData?: Record<string, unknown> | null;
  };
}

interface ElectricityUsageResponse {
  electricityUsage: ElectricityUsage[];
}

interface CreateElectricityUsageResponse {
  success: boolean;
  electricityUsage: ElectricityUsage;
}

interface UpdateElectricityUsageResponse {
  success: boolean;
  electricityUsage: ElectricityUsage;
}

interface DeleteElectricityUsageResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all electricity usage entries for an emission record
 * @param emissionRecordId - Required emission record ID
 */
export function useElectricityUsage(emissionRecordId: string) {
  return useQuery({
    queryKey: ["electricity-usage", emissionRecordId],
    queryFn: async () => {
      const response = await api.get<ElectricityUsageResponse>(
        `/api/electricity-usage?emissionRecordId=${emissionRecordId}`
      );
      return response.electricityUsage;
    },
    enabled: !!emissionRecordId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new electricity usage entry
 * Automatically invalidates electricity-usage and emission-record queries on success
 */
export function useCreateElectricityUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateElectricityUsageInput) => {
      const response = await api.post<CreateElectricityUsageResponse>(
        "/api/electricity-usage",
        data
      );
      return response.electricityUsage;
    },
    onSuccess: (newElectricityUsage) => {
      // Invalidate electricity usage list for the emission record
      queryClient.invalidateQueries({
        queryKey: ["electricity-usage", newElectricityUsage.emissionRecordId],
      });

      // Invalidate the emission record to update counts
      queryClient.invalidateQueries({
        queryKey: ["emissionRecord", newElectricityUsage.emissionRecordId],
      });

      // If associated with a facility, invalidate facility data
      if (newElectricityUsage.facilityId) {
        queryClient.invalidateQueries({
          queryKey: ["facility", newElectricityUsage.facilityId],
        });
      }
    },
    onError: (error: unknown) => {
      console.error("Failed to create electricity usage:", error);
    },
  });
}

/**
 * Update an existing electricity usage entry
 * ⚠️ Note: Backend endpoint PATCH /api/electricity-usage/:id needs to be implemented
 * Automatically invalidates electricity-usage and emission-record queries on success
 */
export function useUpdateElectricityUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateElectricityUsageInput) => {
      const response = await api.patch<UpdateElectricityUsageResponse>(
        `/api/electricity-usage/${id}`,
        data
      );
      return response.electricityUsage;
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["electricity-usage"],
      });

      // Snapshot the previous value
      const previousElectricityUsage = queryClient.getQueryData<ElectricityUsage[]>([
        "electricity-usage",
      ]);

      // Optimistically update the cache
      if (previousElectricityUsage) {
        queryClient.setQueryData<ElectricityUsage[]>(
          ["electricity-usage"],
          previousElectricityUsage.map((item) =>
            item.id === id ? { ...item, ...data } : item
          )
        );
      }

      // Return a context with the previous value
      return { previousElectricityUsage };
    },
    onError: (error: Error, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousElectricityUsage) {
        queryClient.setQueryData(["electricity-usage"], context.previousElectricityUsage);
      }
      console.error("Failed to update electricity usage:", error);
    },
    onSuccess: (updatedElectricityUsage) => {
      // Invalidate the list to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["electricity-usage", updatedElectricityUsage.emissionRecordId],
      });

      // Invalidate the emission record to update calculations
      queryClient.invalidateQueries({
        queryKey: ["emissionRecord", updatedElectricityUsage.emissionRecordId],
      });

      // If associated with a facility, invalidate facility data
      if (updatedElectricityUsage.facilityId) {
        queryClient.invalidateQueries({
          queryKey: ["facility", updatedElectricityUsage.facilityId],
        });
      }
    },
  });
}

/**
 * Delete an electricity usage entry
 * ⚠️ Note: Backend endpoint DELETE /api/electricity-usage/:id needs to be implemented
 * Automatically invalidates electricity-usage and emission-record queries on success
 */
export function useDeleteElectricityUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      emissionRecordId,
      facilityId,
    }: {
      id: string;
      emissionRecordId: string;
      facilityId?: string | null;
    }) => {
      const response = await api.delete<DeleteElectricityUsageResponse>(
        `/api/electricity-usage/${id}`
      );
      return { ...response, emissionRecordId, facilityId };
    },
    onMutate: async ({ id, emissionRecordId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["electricity-usage", emissionRecordId],
      });

      // Snapshot the previous value
      const previousElectricityUsage = queryClient.getQueryData<ElectricityUsage[]>([
        "electricity-usage",
        emissionRecordId,
      ]);

      // Optimistically remove from cache
      if (previousElectricityUsage) {
        queryClient.setQueryData<ElectricityUsage[]>(
          ["electricity-usage", emissionRecordId],
          previousElectricityUsage.filter((item) => item.id !== id)
        );
      }

      // Return a context with the previous value
      return { previousElectricityUsage };
    },
    onError: (error: Error, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousElectricityUsage) {
        queryClient.setQueryData(
          ["electricity-usage", variables.emissionRecordId],
          context.previousElectricityUsage
        );
      }
      console.error("Failed to delete electricity usage:", error);
    },
    onSuccess: (data) => {
      // Invalidate the list to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["electricity-usage", data.emissionRecordId],
      });

      // Invalidate the emission record to update counts and calculations
      queryClient.invalidateQueries({
        queryKey: ["emissionRecord", data.emissionRecordId],
      });

      // If associated with a facility, invalidate facility data
      if (data.facilityId) {
        queryClient.invalidateQueries({
          queryKey: ["facility", data.facilityId],
        });
      }
    },
  });
}
