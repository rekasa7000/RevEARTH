import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export type VehicleType = "sedan" | "suv" | "truck" | "van" | "motorcycle";
export type VehicleFuelType = "natural_gas" | "heating_oil" | "propane" | "diesel" | "gasoline";

export interface VehicleUsage {
  id: string;
  emissionRecordId: string;
  vehicleId?: string | null;
  vehicleType: VehicleType;
  fuelType: VehicleFuelType;
  fuelConsumed?: number | null;
  mileage?: number | null;
  unit: string;
  co2Emissions?: number | null;
  ch4Emissions?: number | null;
  n2oEmissions?: number | null;
  co2eCalculated?: number | null;
  entryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleUsageInput {
  emissionRecordId: string;
  vehicleId?: string;
  vehicleType: VehicleType;
  fuelType: VehicleFuelType;
  fuelConsumed?: number;
  mileage?: number;
  unit: string;
  entryDate: string;
}

export interface UpdateVehicleUsageInput {
  id: string;
  data: {
    vehicleId?: string | null;
    vehicleType?: VehicleType;
    fuelType?: VehicleFuelType;
    fuelConsumed?: number | null;
    mileage?: number | null;
    unit?: string;
    entryDate?: string;
  };
}

interface VehicleUsageResponse {
  vehicleUsage: VehicleUsage[];
}

interface CreateVehicleUsageResponse {
  success: boolean;
  vehicleUsage: VehicleUsage;
}

interface UpdateVehicleUsageResponse {
  success: boolean;
  vehicleUsage: VehicleUsage;
}

interface DeleteVehicleUsageResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all vehicle usage entries for an emission record
 * @param emissionRecordId - Required emission record ID
 */
export function useVehicleUsage(emissionRecordId: string) {
  return useQuery({
    queryKey: ["vehicle-usage", emissionRecordId],
    queryFn: async () => {
      const response = await api.get<VehicleUsageResponse>(
        `/api/vehicle-usage?emissionRecordId=${emissionRecordId}`
      );
      return response.vehicleUsage;
    },
    enabled: !!emissionRecordId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new vehicle usage entry
 * Automatically invalidates vehicle-usage and emission-record queries on success
 */
export function useCreateVehicleUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateVehicleUsageInput) => {
      const response = await api.post<CreateVehicleUsageResponse>(
        "/api/vehicle-usage",
        data
      );
      return response.vehicleUsage;
    },
    onSuccess: (newVehicleUsage) => {
      // Invalidate vehicle usage list for the emission record
      queryClient.invalidateQueries({
        queryKey: ["vehicle-usage", newVehicleUsage.emissionRecordId],
      });

      // Invalidate the emission record to update counts
      queryClient.invalidateQueries({
        queryKey: ["emissionRecord", newVehicleUsage.emissionRecordId],
      });
    },
    onError: (error: unknown) => {
      console.error("Failed to create vehicle usage:", error);
    },
  });
}

/**
 * Update an existing vehicle usage entry
 * ⚠️ Note: Backend endpoint PATCH /api/vehicle-usage/:id needs to be implemented
 * Automatically invalidates vehicle-usage and emission-record queries on success
 */
export function useUpdateVehicleUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateVehicleUsageInput) => {
      const response = await api.patch<UpdateVehicleUsageResponse>(
        `/api/vehicle-usage/${id}`,
        data
      );
      return response.vehicleUsage;
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["vehicle-usage"],
      });

      // Snapshot the previous value
      const previousVehicleUsage = queryClient.getQueryData<VehicleUsage[]>([
        "vehicle-usage",
      ]);

      // Optimistically update the cache
      if (previousVehicleUsage) {
        queryClient.setQueryData<VehicleUsage[]>(
          ["vehicle-usage"],
          previousVehicleUsage.map((item) =>
            item.id === id ? { ...item, ...data } : item
          )
        );
      }

      // Return a context with the previous value
      return { previousVehicleUsage };
    },
    onError: (error: Error, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousVehicleUsage) {
        queryClient.setQueryData(["vehicle-usage"], context.previousVehicleUsage);
      }
      console.error("Failed to update vehicle usage:", error);
    },
    onSuccess: (updatedVehicleUsage) => {
      // Invalidate the list to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["vehicle-usage", updatedVehicleUsage.emissionRecordId],
      });

      // Invalidate the emission record to update calculations
      queryClient.invalidateQueries({
        queryKey: ["emissionRecord", updatedVehicleUsage.emissionRecordId],
      });
    },
  });
}

/**
 * Delete a vehicle usage entry
 * ⚠️ Note: Backend endpoint DELETE /api/vehicle-usage/:id needs to be implemented
 * Automatically invalidates vehicle-usage and emission-record queries on success
 */
export function useDeleteVehicleUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      emissionRecordId,
    }: {
      id: string;
      emissionRecordId: string;
    }) => {
      const response = await api.delete<DeleteVehicleUsageResponse>(
        `/api/vehicle-usage/${id}`
      );
      return { ...response, emissionRecordId };
    },
    onMutate: async ({ id, emissionRecordId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["vehicle-usage", emissionRecordId],
      });

      // Snapshot the previous value
      const previousVehicleUsage = queryClient.getQueryData<VehicleUsage[]>([
        "vehicle-usage",
        emissionRecordId,
      ]);

      // Optimistically remove from cache
      if (previousVehicleUsage) {
        queryClient.setQueryData<VehicleUsage[]>(
          ["vehicle-usage", emissionRecordId],
          previousVehicleUsage.filter((item) => item.id !== id)
        );
      }

      // Return a context with the previous value
      return { previousVehicleUsage };
    },
    onError: (error: Error, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousVehicleUsage) {
        queryClient.setQueryData(
          ["vehicle-usage", variables.emissionRecordId],
          context.previousVehicleUsage
        );
      }
      console.error("Failed to delete vehicle usage:", error);
    },
    onSuccess: (data) => {
      // Invalidate the list to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["vehicle-usage", data.emissionRecordId],
      });

      // Invalidate the emission record to update counts and calculations
      queryClient.invalidateQueries({
        queryKey: ["emissionRecord", data.emissionRecordId],
      });
    },
  });
}
