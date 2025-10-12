import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface Facility {
  id: string;
  organizationId: string;
  name: string;
  location?: string | null;
  address?: string | null;
  areaSqm?: number | null;
  employeeCount?: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    electricityUsage: number;
  };
}

export interface FacilityWithOrganization extends Facility {
  organization: {
    id: string;
    userId: string;
    name: string;
  };
}

export interface CreateFacilityInput {
  organizationId: string;
  name: string;
  location?: string;
  address?: string;
  areaSqm?: number;
  employeeCount?: number;
}

export interface UpdateFacilityInput {
  id: string;
  data: {
    name?: string;
    location?: string | null;
    address?: string | null;
    areaSqm?: number | null;
    employeeCount?: number | null;
  };
}

interface FacilitiesResponse {
  facilities: Facility[];
}

interface FacilityResponse {
  facility: FacilityWithOrganization;
}

interface CreateFacilityResponse {
  success: boolean;
  facility: Facility;
}

interface UpdateFacilityResponse {
  success: boolean;
  facility: Facility;
}

interface DeleteFacilityResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all facilities for an organization
 * @param organizationId - Required organization ID
 */
export function useFacilities(organizationId: string) {
  return useQuery({
    queryKey: ["facilities", organizationId],
    queryFn: async () => {
      const response = await api.get<FacilitiesResponse>(
        `/api/facilities?organizationId=${organizationId}`
      );
      return response.facilities;
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single facility by ID with organization details
 * @param id - Facility ID
 */
export function useFacility(id: string) {
  return useQuery({
    queryKey: ["facility", id],
    queryFn: async () => {
      const response = await api.get<FacilityResponse>(
        `/api/facilities/${id}`
      );
      return response.facility;
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new facility
 * Automatically invalidates facilities query on success
 */
export function useCreateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFacilityInput) => {
      const response = await api.post<CreateFacilityResponse>(
        "/api/facilities",
        data
      );
      return response.facility;
    },
    onSuccess: (newFacility) => {
      // Invalidate facilities list for the organization
      queryClient.invalidateQueries({
        queryKey: ["facilities", newFacility.organizationId],
      });

      // Set the new facility in cache
      queryClient.setQueryData(["facility", newFacility.id], newFacility);
    },
    onError: (error: any) => {
      console.error("Failed to create facility:", error);
    },
  });
}

/**
 * Update an existing facility
 * Automatically invalidates facilities queries on success
 */
export function useUpdateFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateFacilityInput) => {
      const response = await api.patch<UpdateFacilityResponse>(
        `/api/facilities/${id}`,
        data
      );
      return response.facility;
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["facility", id] });

      // Snapshot the previous value
      const previousFacility = queryClient.getQueryData<Facility>([
        "facility",
        id,
      ]);

      // Optimistically update the cache
      if (previousFacility) {
        queryClient.setQueryData<Facility>(["facility", id], {
          ...previousFacility,
          ...data,
        });
      }

      // Return a context with the previous value
      return { previousFacility };
    },
    onError: (error: any, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousFacility) {
        queryClient.setQueryData(
          ["facility", variables.id],
          context.previousFacility
        );
      }
      console.error("Failed to update facility:", error);
    },
    onSuccess: (updatedFacility) => {
      // Update the cache with the server response
      queryClient.setQueryData(["facility", updatedFacility.id], updatedFacility);

      // Invalidate the list to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["facilities", updatedFacility.organizationId],
      });
    },
  });
}

/**
 * Delete a facility
 * Automatically invalidates facilities queries on success
 */
export function useDeleteFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<DeleteFacilityResponse>(
        `/api/facilities/${id}`
      );
      return response;
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["facility", id] });

      // Get the facility before deleting (for rollback and invalidation)
      const previousFacility = queryClient.getQueryData<FacilityWithOrganization>([
        "facility",
        id,
      ]);

      return { previousFacility };
    },
    onSuccess: (_, id, context) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["facility", id] });

      // Invalidate all facilities lists
      if (context?.previousFacility) {
        queryClient.invalidateQueries({
          queryKey: ["facilities", context.previousFacility.organizationId],
        });
      }
    },
    onError: (error: any) => {
      console.error("Failed to delete facility:", error);
    },
  });
}
