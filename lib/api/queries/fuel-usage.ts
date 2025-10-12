import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export type FuelType = "natural_gas" | "heating_oil" | "propane" | "diesel" | "gasoline";

export interface FuelUsage {
  id: string;
  emissionRecordId: string;
  fuelType: FuelType;
  quantity: number;
  unit: string;
  co2eCalculated?: number | null;
  entryDate: string;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFuelUsageInput {
  emissionRecordId: string;
  fuelType: FuelType;
  quantity: number;
  unit: string;
  entryDate: string;
  metadata?: Record<string, any>;
}

export interface UpdateFuelUsageInput {
  id: string;
  data: {
    fuelType?: FuelType;
    quantity?: number;
    unit?: string;
    entryDate?: string;
    metadata?: Record<string, any> | null;
  };
}

interface FuelUsageResponse {
  fuelUsage: FuelUsage[];
}

interface CreateFuelUsageResponse {
  success: boolean;
  fuelUsage: FuelUsage;
}

interface UpdateFuelUsageResponse {
  success: boolean;
  fuelUsage: FuelUsage;
}

interface DeleteFuelUsageResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all fuel usage entries for an emission record
 * @param emissionRecordId - Required emission record ID
 */
export function useFuelUsage(emissionRecordId: string) {
  return useQuery({
    queryKey: ["fuel-usage", emissionRecordId],
    queryFn: async () => {
      const response = await api.get<FuelUsageResponse>(
        `/api/fuel-usage?emissionRecordId=${emissionRecordId}`
      );
      return response.fuelUsage;
    },
    enabled: !!emissionRecordId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new fuel usage entry
 * Automatically invalidates fuel-usage and emission-record queries on success
 */
export function useCreateFuelUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFuelUsageInput) => {
      const response = await api.post<CreateFuelUsageResponse>(
        "/api/fuel-usage",
        data
      );
      return response.fuelUsage;
    },
    onSuccess: (newFuelUsage) => {
      // Invalidate fuel usage list for the emission record
      queryClient.invalidateQueries({
        queryKey: ["fuel-usage", newFuelUsage.emissionRecordId],
      });

      // Invalidate the emission record to update counts
      queryClient.invalidateQueries({
        queryKey: ["emissionRecord", newFuelUsage.emissionRecordId],
      });
    },
    onError: (error: any) => {
      console.error("Failed to create fuel usage:", error);
    },
  });
}

/**
 * Update an existing fuel usage entry
 * Automatically invalidates fuel-usage and emission-record queries on success
 */
export function useUpdateFuelUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateFuelUsageInput) => {
      const response = await api.patch<UpdateFuelUsageResponse>(
        `/api/fuel-usage/${id}`,
        data
      );
      return response.fuelUsage;
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["fuel-usage"],
      });

      // Snapshot the previous value
      const previousFuelUsage = queryClient.getQueryData<FuelUsage[]>([
        "fuel-usage",
      ]);

      // Optimistically update the cache
      if (previousFuelUsage) {
        queryClient.setQueryData<FuelUsage[]>(
          ["fuel-usage"],
          previousFuelUsage.map((item) =>
            item.id === id ? { ...item, ...data } : item
          )
        );
      }

      // Return a context with the previous value
      return { previousFuelUsage };
    },
    onError: (error: any, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousFuelUsage) {
        queryClient.setQueryData(["fuel-usage"], context.previousFuelUsage);
      }
      console.error("Failed to update fuel usage:", error);
    },
    onSuccess: (updatedFuelUsage) => {
      // Invalidate the list to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["fuel-usage", updatedFuelUsage.emissionRecordId],
      });

      // Invalidate the emission record to update calculations
      queryClient.invalidateQueries({
        queryKey: ["emissionRecord", updatedFuelUsage.emissionRecordId],
      });
    },
  });
}

/**
 * Delete a fuel usage entry
 * Automatically invalidates fuel-usage and emission-record queries on success
 */
export function useDeleteFuelUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      emissionRecordId,
    }: {
      id: string;
      emissionRecordId: string;
    }) => {
      const response = await api.delete<DeleteFuelUsageResponse>(
        `/api/fuel-usage/${id}`
      );
      return { ...response, emissionRecordId };
    },
    onMutate: async ({ id, emissionRecordId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["fuel-usage", emissionRecordId],
      });

      // Snapshot the previous value
      const previousFuelUsage = queryClient.getQueryData<FuelUsage[]>([
        "fuel-usage",
        emissionRecordId,
      ]);

      // Optimistically remove from cache
      if (previousFuelUsage) {
        queryClient.setQueryData<FuelUsage[]>(
          ["fuel-usage", emissionRecordId],
          previousFuelUsage.filter((item) => item.id !== id)
        );
      }

      // Return a context with the previous value
      return { previousFuelUsage };
    },
    onError: (error: any, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousFuelUsage) {
        queryClient.setQueryData(
          ["fuel-usage", variables.emissionRecordId],
          context.previousFuelUsage
        );
      }
      console.error("Failed to delete fuel usage:", error);
    },
    onSuccess: (data) => {
      // Invalidate the list to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["fuel-usage", data.emissionRecordId],
      });

      // Invalidate the emission record to update counts and calculations
      queryClient.invalidateQueries({
        queryKey: ["emissionRecord", data.emissionRecordId],
      });
    },
  });
}
