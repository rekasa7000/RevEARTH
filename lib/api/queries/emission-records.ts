import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface EmissionRecordCount {
  fuelUsage: number;
  vehicleUsage: number;
  electricityUsage: number;
  commutingData: number;
}

export interface EmissionCalculation {
  totalCo2e: number;
  totalScope1Co2e: number;
  totalScope2Co2e: number;
  totalScope3Co2e: number;
}

export interface EmissionRecord {
  id: string;
  organizationId: string;
  facilityId?: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  status: "draft" | "submitted" | "validated" | "archived";
  scopeSelection: {
    scope1: boolean;
    scope2: boolean;
    scope3: boolean;
  };
  createdAt: string;
  updatedAt: string;
  calculation?: EmissionCalculation;
  _count?: EmissionRecordCount;
}

export interface EmissionRecordWithDetails extends EmissionRecord {
  organization: {
    id: string;
    name: string;
  };
  fuelUsage: unknown[];
  vehicleUsage: unknown[];
  electricityUsage: unknown[];
  commutingData: unknown[];
}

export interface CreateEmissionRecordInput {
  organizationId: string;
  facilityId?: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  scopeSelection?: {
    scope1: boolean;
    scope2: boolean;
    scope3: boolean;
  };
}

export interface UpdateEmissionRecordInput {
  id: string;
  data: {
    reportingPeriodStart?: string;
    reportingPeriodEnd?: string;
    status?: "draft" | "submitted" | "validated" | "archived";
    scopeSelection?: {
      scope1: boolean;
      scope2: boolean;
      scope3: boolean;
    };
  };
}

interface EmissionRecordsResponse {
  records: EmissionRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface EmissionRecordResponse {
  record: EmissionRecordWithDetails;
}

interface CreateEmissionRecordResponse {
  success: boolean;
  emissionRecord: EmissionRecord;
}

interface UpdateEmissionRecordResponse {
  success: boolean;
  emissionRecord: EmissionRecord;
}

interface DeleteEmissionRecordResponse {
  success: boolean;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch emission records with pagination and filtering
 * @param organizationId - Required organization ID
 * @param page - Page number (default: 1)
 * @param limit - Records per page (default: 10)
 * @param status - Optional status filter
 */
export function useEmissionRecords(
  organizationId: string,
  page: number = 1,
  limit: number = 10,
  status?: "draft" | "submitted" | "validated" | "archived"
) {
  return useQuery({
    queryKey: ["emissionRecords", organizationId, page, limit, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        organizationId,
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) {
        params.append("status", status);
      }

      const response = await api.get<EmissionRecordsResponse>(
        `/api/emission-records?${params.toString()}`
      );
      return response;
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch a single emission record by ID with all related data
 * @param id - Emission record ID
 */
export function useEmissionRecord(id: string) {
  return useQuery({
    queryKey: ["emissionRecord", id],
    queryFn: async () => {
      const response = await api.get<EmissionRecordResponse>(
        `/api/emission-records/${id}`
      );
      return response.record;
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new emission record
 * Automatically invalidates emission records query on success
 */
export function useCreateEmissionRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEmissionRecordInput) => {
      const response = await api.post<CreateEmissionRecordResponse>(
        "/api/emission-records",
        data
      );
      return response.emissionRecord;
    },
    onSuccess: (newRecord) => {
      // Invalidate emission records list for the organization
      queryClient.invalidateQueries({
        queryKey: ["emissionRecords", newRecord.organizationId],
      });

      // Set the new record in cache
      queryClient.setQueryData(["emissionRecord", newRecord.id], newRecord);
    },
    onError: (error: unknown) => {
      console.error("Failed to create emission record:", error);
    },
  });
}

/**
 * Update an existing emission record
 * Automatically invalidates emission records queries on success
 */
export function useUpdateEmissionRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateEmissionRecordInput) => {
      const response = await api.patch<UpdateEmissionRecordResponse>(
        `/api/emission-records/${id}`,
        data
      );
      return response.emissionRecord;
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["emissionRecord", id] });

      // Snapshot the previous value
      const previousRecord = queryClient.getQueryData<EmissionRecord>([
        "emissionRecord",
        id,
      ]);

      // Optimistically update the cache
      if (previousRecord) {
        queryClient.setQueryData<EmissionRecord>(["emissionRecord", id], {
          ...previousRecord,
          ...data,
        });
      }

      // Return a context with the previous value
      return { previousRecord };
    },
    onError: (error: Error, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousRecord) {
        queryClient.setQueryData(
          ["emissionRecord", variables.id],
          context.previousRecord
        );
      }
      console.error("Failed to update emission record:", error);
    },
    onSuccess: (updatedRecord) => {
      // Update the cache with the server response
      queryClient.setQueryData(["emissionRecord", updatedRecord.id], updatedRecord);

      // Invalidate the list to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["emissionRecords", updatedRecord.organizationId],
      });
    },
  });
}

/**
 * Delete an emission record
 * ⚠️ Warning: Cascade deletes all emission data and calculations
 * Automatically invalidates emission records queries on success
 */
export function useDeleteEmissionRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<DeleteEmissionRecordResponse>(
        `/api/emission-records/${id}`
      );
      return response;
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["emissionRecord", id] });

      // Get the record before deleting (for rollback if needed)
      const previousRecord = queryClient.getQueryData<EmissionRecord>([
        "emissionRecord",
        id,
      ]);

      return { previousRecord };
    },
    onSuccess: (_, id, context) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["emissionRecord", id] });

      // Invalidate all emission records lists
      if (context?.previousRecord) {
        queryClient.invalidateQueries({
          queryKey: ["emissionRecords", context.previousRecord.organizationId],
        });
      }
    },
    onError: (error: unknown) => {
      console.error("Failed to delete emission record:", error);
    },
  });
}
