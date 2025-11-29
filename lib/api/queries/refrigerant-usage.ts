import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export type RefrigerantType = "R_410A" | "R_134a" | "R_32" | "R_404A";

export interface RefrigerantUsage {
  id: string;
  emissionRecordId: string;
  equipmentId?: string | null;
  refrigerantType: RefrigerantType;
  quantityLeaked?: number | null;
  quantityPurchased?: number | null;
  unit: string;
  co2eCalculated?: number | null;
  entryDate: string;
  leakDetectionLog?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRefrigerantUsageInput {
  emissionRecordId: string;
  equipmentId?: string;
  refrigerantType: RefrigerantType;
  quantityLeaked?: number;
  quantityPurchased?: number;
  unit: string;
  entryDate: string;
  leakDetectionLog?: Record<string, unknown>;
}

export interface UpdateRefrigerantUsageInput {
  id: string;
  data: {
    equipmentId?: string | null;
    refrigerantType?: RefrigerantType;
    quantityLeaked?: number | null;
    quantityPurchased?: number | null;
    unit?: string;
    entryDate?: string;
    leakDetectionLog?: Record<string, unknown> | null;
  };
}

// Response types match API endpoint structure
interface RefrigerantUsageResponse {
  refrigerantUsage: RefrigerantUsage[];
}

interface CreateRefrigerantUsageResponse {
  success: boolean;
  refrigerantUsage: RefrigerantUsage;
}

interface UpdateRefrigerantUsageResponse {
  success: boolean;
  refrigerantUsage: RefrigerantUsage;
}

interface DeleteRefrigerantUsageResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all refrigerant usage records for a specific emission record
 * @param emissionRecordId - ID of the emission record
 * @returns React Query result with refrigerant usage array
 */
export function useRefrigerantUsage(emissionRecordId: string) {
  return useQuery({
    queryKey: ["refrigerant-usage", emissionRecordId],
    queryFn: async () => {
      const response = await api.get<RefrigerantUsageResponse>(
        `/api/refrigerant-usage?emissionRecordId=${emissionRecordId}`
      );
      return response.refrigerantUsage;
    },
    enabled: !!emissionRecordId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch a single refrigerant usage entry by ID
 * @param id - Refrigerant usage ID
 * @returns React Query result with single refrigerant usage
 */
export function useRefrigerantUsageById(id: string) {
  return useQuery({
    queryKey: ["refrigerant-usage", "detail", id],
    queryFn: async () => {
      const response = await api.get<{ refrigerantUsage: RefrigerantUsage }>(
        `/api/refrigerant-usage/${id}`
      );
      return response.refrigerantUsage;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new refrigerant usage entry
 * Automatically invalidates refrigerant-usage and emission-record queries on success
 */
export function useCreateRefrigerantUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRefrigerantUsageInput) => {
      const response = await api.post<CreateRefrigerantUsageResponse>(
        "/api/refrigerant-usage",
        data
      );
      return response.refrigerantUsage;
    },
    onSuccess: (newRefrigerantUsage) => {
      // Invalidate refrigerant usage list for the emission record
      queryClient.invalidateQueries({
        queryKey: ["refrigerant-usage", newRefrigerantUsage.emissionRecordId],
      });

      // Invalidate the emission record to update counts
      queryClient.invalidateQueries({
        queryKey: ["emissionRecord", newRefrigerantUsage.emissionRecordId],
      });
    },
    onError: (error: unknown) => {
      console.error("Failed to create refrigerant usage:", error);
    },
  });
}

/**
 * Update an existing refrigerant usage entry
 * Uses optimistic updates with rollback on error
 */
export function useUpdateRefrigerantUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateRefrigerantUsageInput) => {
      const response = await api.patch<UpdateRefrigerantUsageResponse>(
        `/api/refrigerant-usage/${id}`,
        data
      );
      return response.refrigerantUsage;
    },

    // Optimistic update pattern
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["refrigerant-usage"] });

      // Snapshot previous value
      const previousRefrigerantUsage = queryClient.getQueryData<
        RefrigerantUsage[]
      >(["refrigerant-usage"]);

      // Optimistically update cache
      if (previousRefrigerantUsage) {
        queryClient.setQueryData<RefrigerantUsage[]>(
          ["refrigerant-usage"],
          previousRefrigerantUsage.map((item) =>
            item.id === id ? { ...item, ...data } : item
          )
        );
      }

      return { previousRefrigerantUsage };
    },

    // Rollback on error
    onError: (error: Error, variables, context) => {
      if (context?.previousRefrigerantUsage) {
        queryClient.setQueryData(
          ["refrigerant-usage"],
          context.previousRefrigerantUsage
        );
      }
      console.error("Failed to update refrigerant usage:", error);
    },

    // Invalidate after success
    onSuccess: (updatedRefrigerantUsage) => {
      queryClient.invalidateQueries({
        queryKey: [
          "refrigerant-usage",
          updatedRefrigerantUsage.emissionRecordId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "emissionRecord",
          updatedRefrigerantUsage.emissionRecordId,
        ],
      });
    },
  });
}

/**
 * Delete a refrigerant usage entry
 * Uses optimistic updates with rollback on error
 */
export function useDeleteRefrigerantUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      emissionRecordId,
    }: {
      id: string;
      emissionRecordId: string;
    }) => {
      const response = await api.delete<DeleteRefrigerantUsageResponse>(
        `/api/refrigerant-usage/${id}`
      );
      return { ...response, emissionRecordId };
    },

    onMutate: async ({ id, emissionRecordId }) => {
      await queryClient.cancelQueries({
        queryKey: ["refrigerant-usage", emissionRecordId],
      });

      const previousRefrigerantUsage = queryClient.getQueryData<
        RefrigerantUsage[]
      >(["refrigerant-usage", emissionRecordId]);

      if (previousRefrigerantUsage) {
        queryClient.setQueryData<RefrigerantUsage[]>(
          ["refrigerant-usage", emissionRecordId],
          previousRefrigerantUsage.filter((item) => item.id !== id)
        );
      }

      return { previousRefrigerantUsage };
    },

    onError: (error: Error, variables, context) => {
      if (context?.previousRefrigerantUsage) {
        queryClient.setQueryData(
          ["refrigerant-usage", variables.emissionRecordId],
          context.previousRefrigerantUsage
        );
      }
      console.error("Failed to delete refrigerant usage:", error);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["refrigerant-usage", data.emissionRecordId],
      });
      queryClient.invalidateQueries({
        queryKey: ["emissionRecord", data.emissionRecordId],
      });
    },
  });
}
