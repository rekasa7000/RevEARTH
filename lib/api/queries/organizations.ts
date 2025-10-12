import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

interface Facility {
  id: string;
  name: string;
  location?: string;
  address?: string;
  areaSqm?: number;
  employeeCount?: number;
  createdAt: string;
}

export interface Organization {
  id: string;
  userId: string;
  name: string;
  industrySector?: string;
  occupancyType: "residential" | "commercial" | "industrial" | "lgu" | "academic";
  reportingBoundaries?: any;
  applicableScopes: {
    scope1: boolean;
    scope2: boolean;
    scope3: boolean;
  };
  createdAt: string;
  updatedAt: string;
  facilities: Facility[];
  _count: {
    emissionRecords: number;
    facilities: number;
  };
}

interface OrganizationResponse {
  organization: Organization;
}

export interface CreateOrganizationInput {
  name: string;
  industrySector?: string;
  occupancyType: "residential" | "commercial" | "industrial" | "lgu" | "academic";
  reportingBoundaries?: any;
  applicableScopes: {
    scope1: boolean;
    scope2: boolean;
    scope3: boolean;
  };
}

export interface UpdateOrganizationInput {
  id: string;
  data: Partial<CreateOrganizationInput>;
}

interface CreateOrganizationResponse {
  success: boolean;
  organization: Organization;
}

interface UpdateOrganizationResponse {
  success: boolean;
  organization: Organization;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch the current user's organization
 * @returns Organization data or null if not found
 */
export function useOrganization() {
  return useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      const response = await api.get<OrganizationResponse>("/api/organizations");
      return response.organization;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new organization for the current user
 * Automatically invalidates organization query on success
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrganizationInput) => {
      const response = await api.post<CreateOrganizationResponse>(
        "/api/organizations",
        data
      );
      return response.organization;
    },
    onSuccess: (newOrganization) => {
      // Update the cache with the new organization
      queryClient.setQueryData(["organization"], newOrganization);

      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
    onError: (error: any) => {
      console.error("Failed to create organization:", error);
    },
  });
}

/**
 * Update an existing organization
 * Automatically invalidates organization query on success
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateOrganizationInput) => {
      const response = await api.patch<UpdateOrganizationResponse>(
        `/api/organizations/${id}`,
        data
      );
      return response.organization;
    },
    onMutate: async ({ data }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["organization"] });

      // Snapshot the previous value
      const previousOrganization = queryClient.getQueryData<Organization>(["organization"]);

      // Optimistically update the cache
      if (previousOrganization) {
        queryClient.setQueryData<Organization>(["organization"], {
          ...previousOrganization,
          ...data,
        });
      }

      // Return a context with the previous value
      return { previousOrganization };
    },
    onError: (error: any, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousOrganization) {
        queryClient.setQueryData(["organization"], context.previousOrganization);
      }
      console.error("Failed to update organization:", error);
    },
    onSuccess: (updatedOrganization) => {
      // Update the cache with the server response
      queryClient.setQueryData(["organization"], updatedOrganization);

      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}
