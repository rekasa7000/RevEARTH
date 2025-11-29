import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { Role } from "@prisma/client";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface Invitation {
  id: string;
  email: string;
  role: Role;
  expiresAt: string;
  createdAt: string;
}

export interface InvitationDetails extends Invitation {
  organization: {
    id: string;
    name: string;
    industrySector: string | null;
    occupancyType: string;
    createdAt: string;
  };
}

export interface CreateInvitationInput {
  organizationId: string;
  email: string;
  role: "admin" | "editor" | "viewer";
}

export interface AcceptInvitationInput {
  token: string;
}

// Response types
interface InvitationsResponse {
  invitations: Invitation[];
}

interface InvitationResponse {
  success: boolean;
  invitation: Invitation;
}

interface InvitationDetailsResponse {
  invitation: InvitationDetails;
}

interface AcceptInvitationResponse {
  success: boolean;
  message: string;
  organization: {
    id: string;
    name: string;
  };
  member?: {
    id: string;
    role: Role;
  };
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all pending invitations for an organization
 * @param organizationId - ID of the organization
 * @returns React Query result with invitations array
 */
export function useOrganizationInvitations(organizationId: string) {
  return useQuery({
    queryKey: ["organization-invitations", organizationId],
    queryFn: async () => {
      const response = await api.get<InvitationsResponse>(
        `/api/organizations/${organizationId}/invitations`
      );
      return response.invitations;
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch invitation details by token (for invitation page)
 * @param token - Invitation token
 * @returns React Query result with invitation details
 */
export function useInvitationDetails(token: string) {
  return useQuery({
    queryKey: ["invitation-details", token],
    queryFn: async () => {
      const response = await api.get<InvitationDetailsResponse>(
        `/api/invitations/${token}`
      );
      return response.invitation;
    },
    enabled: !!token,
    retry: false, // Don't retry if invitation is invalid
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create an invitation to join an organization
 * Automatically invalidates organization-invitations queries on success
 */
export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, email, role }: CreateInvitationInput) => {
      const response = await api.post<InvitationResponse>(
        `/api/organizations/${organizationId}/invitations`,
        { email, role }
      );
      return { ...response.invitation, organizationId };
    },
    onSuccess: (data) => {
      // Invalidate invitations list
      queryClient.invalidateQueries({
        queryKey: ["organization-invitations", data.organizationId],
      });
    },
    onError: (error: Error) => {
      console.error("Failed to create invitation:", error);
    },
  });
}

/**
 * Revoke an invitation
 * Uses optimistic updates with rollback on error
 */
export function useRevokeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      invitationId,
    }: {
      organizationId: string;
      invitationId: string;
    }) => {
      const response = await api.delete<DeleteResponse>(
        `/api/organizations/${organizationId}/invitations/${invitationId}`
      );
      return { ...response, organizationId };
    },

    onMutate: async ({ organizationId, invitationId }) => {
      await queryClient.cancelQueries({
        queryKey: ["organization-invitations", organizationId],
      });

      const previousInvitations = queryClient.getQueryData<Invitation[]>([
        "organization-invitations",
        organizationId,
      ]);

      if (previousInvitations) {
        queryClient.setQueryData<Invitation[]>(
          ["organization-invitations", organizationId],
          previousInvitations.filter((inv) => inv.id !== invitationId)
        );
      }

      return { previousInvitations };
    },

    onError: (error: Error, variables, context) => {
      if (context?.previousInvitations) {
        queryClient.setQueryData(
          ["organization-invitations", variables.organizationId],
          context.previousInvitations
        );
      }
      console.error("Failed to revoke invitation:", error);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["organization-invitations", data.organizationId],
      });
    },
  });
}

/**
 * Accept an invitation to join an organization
 * Invalidates relevant queries on success
 */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token }: AcceptInvitationInput) => {
      const response = await api.post<AcceptInvitationResponse>(
        "/api/invitations/accept",
        { token }
      );
      return response;
    },
    onSuccess: (data) => {
      // Invalidate user's organizations list
      queryClient.invalidateQueries({
        queryKey: ["organizations"],
      });

      // Invalidate the organization details
      queryClient.invalidateQueries({
        queryKey: ["organization", data.organization.id],
      });

      // Invalidate organization members
      queryClient.invalidateQueries({
        queryKey: ["organization-members", data.organization.id],
      });
    },
    onError: (error: Error) => {
      console.error("Failed to accept invitation:", error);
    },
  });
}
