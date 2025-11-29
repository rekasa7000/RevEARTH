import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export type TransportMode = "car" | "motorcycle" | "bus" | "jeepney" | "train" | "bicycle" | "walking";

export interface CommutingData {
  id: string;
  emissionRecordId: string;
  employeeCount: number;
  avgDistanceKm?: number | null;
  transportMode: TransportMode;
  daysPerWeek?: number | null;
  wfhDays?: number | null;
  co2eCalculated?: number | null;
  surveyDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommutingDataInput {
  emissionRecordId: string;
  employeeCount: number;
  avgDistanceKm?: number;
  transportMode: TransportMode;
  daysPerWeek?: number;
  wfhDays?: number;
  surveyDate?: string;
}

export interface UpdateCommutingDataInput {
  id: string;
  data: {
    employeeCount?: number;
    avgDistanceKm?: number | null;
    transportMode?: TransportMode;
    daysPerWeek?: number | null;
    wfhDays?: number | null;
    surveyDate?: string | null;
  };
}

interface CommutingDataResponse {
  commutingData: CommutingData[];
}

interface CreateCommutingDataResponse {
  success: boolean;
  commutingData: CommutingData;
}

interface UpdateCommutingDataResponse {
  success: boolean;
  commutingData: CommutingData;
}

interface DeleteCommutingDataResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all commuting data entries for an emission record
 * @param emissionRecordId - Required emission record ID
 */
export function useCommutingData(emissionRecordId: string) {
  return useQuery({
    queryKey: ["commuting-data", emissionRecordId],
    queryFn: async () => {
      const response = await api.get<CommutingDataResponse>(
        `/api/commuting-data?emissionRecordId=${emissionRecordId}`
      );
      return response.commutingData;
    },
    enabled: !!emissionRecordId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new commuting data entry
 * Automatically invalidates commuting-data and emission-record queries on success
 */
export function useCreateCommutingData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommutingDataInput) => {
      const response = await api.post<CreateCommutingDataResponse>(
        "/api/commuting-data",
        data
      );
      return response.commutingData;
    },
    onSuccess: (newCommutingData) => {
      // Invalidate commuting data list for the emission record
      queryClient.invalidateQueries({
        queryKey: ["commuting-data", newCommutingData.emissionRecordId],
      });

      // Invalidate the emission record to update counts
      queryClient.invalidateQueries({
        queryKey: ["emissionRecord", newCommutingData.emissionRecordId],
      });
    },
    onError: (error: unknown) => {
      console.error("Failed to create commuting data:", error);
    },
  });
}

/**
 * Update an existing commuting data entry
 * ⚠️ Note: Backend endpoint PATCH /api/commuting-data/:id needs to be implemented
 * Automatically invalidates commuting-data and emission-record queries on success
 */
export function useUpdateCommutingData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateCommutingDataInput) => {
      const response = await api.patch<UpdateCommutingDataResponse>(
        `/api/commuting-data/${id}`,
        data
      );
      return response.commutingData;
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["commuting-data"],
      });

      // Snapshot the previous value
      const previousCommutingData = queryClient.getQueryData<CommutingData[]>([
        "commuting-data",
      ]);

      // Optimistically update the cache
      if (previousCommutingData) {
        queryClient.setQueryData<CommutingData[]>(
          ["commuting-data"],
          previousCommutingData.map((item) =>
            item.id === id ? { ...item, ...data } : item
          )
        );
      }

      // Return a context with the previous value
      return { previousCommutingData };
    },
    onError: (error: Error, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousCommutingData) {
        queryClient.setQueryData(["commuting-data"], context.previousCommutingData);
      }
      console.error("Failed to update commuting data:", error);
    },
    onSuccess: (updatedCommutingData) => {
      // Invalidate the list to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["commuting-data", updatedCommutingData.emissionRecordId],
      });

      // Invalidate the emission record to update calculations
      queryClient.invalidateQueries({
        queryKey: ["emissionRecord", updatedCommutingData.emissionRecordId],
      });
    },
  });
}

/**
 * Delete a commuting data entry
 * ⚠️ Note: Backend endpoint DELETE /api/commuting-data/:id needs to be implemented
 * Automatically invalidates commuting-data and emission-record queries on success
 */
export function useDeleteCommutingData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      emissionRecordId,
    }: {
      id: string;
      emissionRecordId: string;
    }) => {
      const response = await api.delete<DeleteCommutingDataResponse>(
        `/api/commuting-data/${id}`
      );
      return { ...response, emissionRecordId };
    },
    onMutate: async ({ id, emissionRecordId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["commuting-data", emissionRecordId],
      });

      // Snapshot the previous value
      const previousCommutingData = queryClient.getQueryData<CommutingData[]>([
        "commuting-data",
        emissionRecordId,
      ]);

      // Optimistically remove from cache
      if (previousCommutingData) {
        queryClient.setQueryData<CommutingData[]>(
          ["commuting-data", emissionRecordId],
          previousCommutingData.filter((item) => item.id !== id)
        );
      }

      // Return a context with the previous value
      return { previousCommutingData };
    },
    onError: (error: Error, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousCommutingData) {
        queryClient.setQueryData(
          ["commuting-data", variables.emissionRecordId],
          context.previousCommutingData
        );
      }
      console.error("Failed to delete commuting data:", error);
    },
    onSuccess: (data) => {
      // Invalidate the list to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["commuting-data", data.emissionRecordId],
      });

      // Invalidate the emission record to update counts and calculations
      queryClient.invalidateQueries({
        queryKey: ["emissionRecord", data.emissionRecordId],
      });
    },
  });
}
