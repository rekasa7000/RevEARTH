import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../client";
import { Role } from "@prisma/client";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    createdAt: string;
  };
}

export interface AddMemberInput {
  organizationId: string;
  userId: string;
  role: "admin" | "editor" | "viewer";
}

export interface UpdateMemberRoleInput {
  organizationId: string;
  memberId: string;
  role: "admin" | "editor" | "viewer";
}

export interface RemoveMemberInput {
  organizationId: string;
  memberId: string;
}

// Response types
interface MembersResponse {
  members: OrganizationMember[];
}

interface MemberResponse {
  success: boolean;
  member: OrganizationMember;
}

interface DeleteResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all members of an organization
 * @param organizationId - ID of the organization
 * @returns React Query result with members array
 */
export function useOrganizationMembers(organizationId: string) {
  return useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: async () => {
      const response = await api.get<MembersResponse>(
        `/api/organizations/${organizationId}/members`
      );
      return response.members;
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Add a member to an organization
 * Automatically invalidates organization-members queries on success
 */
export function useAddOrganizationMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, userId, role }: AddMemberInput) => {
      const response = await api.post<MemberResponse>(
        `/api/organizations/${organizationId}/members`,
        { userId, role }
      );
      return response.member;
    },
    onSuccess: (newMember) => {
      // Invalidate members list
      queryClient.invalidateQueries({
        queryKey: ["organization-members", newMember.organizationId],
      });

      // Invalidate organization details to update member count
      queryClient.invalidateQueries({
        queryKey: ["organization", newMember.organizationId],
      });
    },
    onError: (error: Error) => {
      console.error("Failed to add organization member:", error);
    },
  });
}

/**
 * Update a member's role
 * Uses optimistic updates with rollback on error
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, memberId, role }: UpdateMemberRoleInput) => {
      const response = await api.patch<MemberResponse>(
        `/api/organizations/${organizationId}/members/${memberId}`,
        { role }
      );
      return response.member;
    },

    // Optimistic update pattern
    onMutate: async ({ organizationId, memberId, role }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["organization-members", organizationId],
      });

      // Snapshot previous value
      const previousMembers = queryClient.getQueryData<OrganizationMember[]>([
        "organization-members",
        organizationId,
      ]);

      // Optimistically update cache
      if (previousMembers) {
        queryClient.setQueryData<OrganizationMember[]>(
          ["organization-members", organizationId],
          previousMembers.map((member) =>
            member.id === memberId ? { ...member, role } : member
          )
        );
      }

      return { previousMembers };
    },

    // Rollback on error
    onError: (error: Error, variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(
          ["organization-members", variables.organizationId],
          context.previousMembers
        );
      }
      console.error("Failed to update member role:", error);
    },

    // Invalidate after success
    onSuccess: (updatedMember) => {
      queryClient.invalidateQueries({
        queryKey: ["organization-members", updatedMember.organizationId],
      });
    },
  });
}

/**
 * Remove a member from an organization
 * Uses optimistic updates with rollback on error
 */
export function useRemoveOrganizationMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ organizationId, memberId }: RemoveMemberInput) => {
      const response = await api.delete<DeleteResponse>(
        `/api/organizations/${organizationId}/members/${memberId}`
      );
      return { ...response, organizationId };
    },

    onMutate: async ({ organizationId, memberId }) => {
      await queryClient.cancelQueries({
        queryKey: ["organization-members", organizationId],
      });

      const previousMembers = queryClient.getQueryData<OrganizationMember[]>([
        "organization-members",
        organizationId,
      ]);

      if (previousMembers) {
        queryClient.setQueryData<OrganizationMember[]>(
          ["organization-members", organizationId],
          previousMembers.filter((member) => member.id !== memberId)
        );
      }

      return { previousMembers };
    },

    onError: (error: Error, variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(
          ["organization-members", variables.organizationId],
          context.previousMembers
        );
      }
      console.error("Failed to remove organization member:", error);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["organization-members", data.organizationId],
      });

      // Invalidate organization details to update member count
      queryClient.invalidateQueries({
        queryKey: ["organization", data.organizationId],
      });
    },
  });
}
