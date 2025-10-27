import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

/**
 * Permission levels for different actions
 */
export const PermissionLevel = {
  VIEW: ["owner", "admin", "editor", "viewer"] as Role[],
  EDIT: ["owner", "admin", "editor"] as Role[],
  MANAGE: ["owner", "admin"] as Role[],
  OWNER: ["owner"] as Role[],
} as const;

/**
 * Check if a user has access to an organization
 * @param userId - ID of the user
 * @param organizationId - ID of the organization
 * @returns User's membership record if they have access, null otherwise
 */
export async function getUserOrganizationMembership(
  userId: string,
  organizationId: string
) {
  try {
    // First check if user is the organization owner (backwards compatibility)
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (organization?.userId === userId) {
      // User is the owner, return a virtual membership
      return {
        id: "owner-virtual",
        organizationId,
        userId,
        role: "owner" as Role,
        joinedAt: organization.createdAt,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      };
    }

    // Check if user is a member
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    return member;
  } catch (error) {
    console.error("Error checking organization membership:", error);
    return null;
  }
}

/**
 * Check if a user has a specific permission level for an organization
 * @param userId - ID of the user
 * @param organizationId - ID of the organization
 * @param requiredRoles - Array of roles that have permission
 * @returns true if user has permission, false otherwise
 */
export async function hasOrganizationPermission(
  userId: string,
  organizationId: string,
  requiredRoles: readonly Role[]
): Promise<boolean> {
  const membership = await getUserOrganizationMembership(userId, organizationId);

  if (!membership) {
    return false;
  }

  return requiredRoles.includes(membership.role);
}

/**
 * Check if user can view organization resources
 */
export async function canViewOrganization(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return hasOrganizationPermission(userId, organizationId, PermissionLevel.VIEW);
}

/**
 * Check if user can edit organization resources
 */
export async function canEditOrganization(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return hasOrganizationPermission(userId, organizationId, PermissionLevel.EDIT);
}

/**
 * Check if user can manage organization (manage members, settings)
 */
export async function canManageOrganization(
  userId: string,
  organizationId: string
): Promise<boolean> {
  return hasOrganizationPermission(userId, organizationId, PermissionLevel.MANAGE);
}

/**
 * Check if user is the organization owner
 */
export async function isOrganizationOwner(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  return organization?.userId === userId;
}

/**
 * Get all organizations a user has access to
 * @param userId - ID of the user
 * @returns Array of organizations with user's role
 */
export async function getUserOrganizations(userId: string) {
  try {
    // Get organizations where user is the owner
    const ownedOrgs = await prisma.organization.findMany({
      where: { userId },
      include: {
        facilities: true,
        _count: {
          select: {
            emissionRecords: true,
            facilities: true,
            members: true,
          },
        },
      },
    });

    // Get organizations where user is a member
    const memberOrgs = await prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            facilities: true,
            _count: {
              select: {
                emissionRecords: true,
                facilities: true,
                members: true,
              },
            },
          },
        },
      },
    });

    // Combine and format results
    const ownedOrgsWithRole = ownedOrgs.map((org) => ({
      ...org,
      userRole: "owner" as Role,
    }));

    const memberOrgsWithRole = memberOrgs.map((member) => ({
      ...member.organization,
      userRole: member.role,
    }));

    // Remove duplicates (in case owner is also in members table)
    const allOrgs = [...ownedOrgsWithRole, ...memberOrgsWithRole];
    const uniqueOrgs = allOrgs.filter(
      (org, index, self) => index === self.findIndex((o) => o.id === org.id)
    );

    return uniqueOrgs;
  } catch (error) {
    console.error("Error getting user organizations:", error);
    return [];
  }
}

/**
 * Get all members of an organization
 * @param organizationId - ID of the organization
 * @returns Array of members with user details
 */
export async function getOrganizationMembers(organizationId: string) {
  try {
    // Get the organization owner
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
      },
    });

    if (!organization) {
      return [];
    }

    // Get all members
    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    // Add owner as first member
    const ownerMember = {
      id: "owner-virtual",
      organizationId,
      userId: organization.userId,
      role: "owner" as Role,
      joinedAt: organization.createdAt,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      user: organization.user,
    };

    // Remove owner from members list if they're there
    const filteredMembers = members.filter(
      (member) => member.userId !== organization.userId
    );

    return [ownerMember, ...filteredMembers];
  } catch (error) {
    console.error("Error getting organization members:", error);
    return [];
  }
}

/**
 * Add a member to an organization
 * @param organizationId - ID of the organization
 * @param userId - ID of the user to add
 * @param role - Role to assign to the user
 * @returns The created member record
 */
export async function addOrganizationMember(
  organizationId: string,
  userId: string,
  role: Role
) {
  try {
    // Check if user is already a member
    const existing = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
    });

    if (existing) {
      throw new Error("User is already a member of this organization");
    }

    // Check if user is the owner
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (organization?.userId === userId) {
      throw new Error("User is already the owner of this organization");
    }

    // Create member
    const member = await prisma.organizationMember.create({
      data: {
        organizationId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return member;
  } catch (error) {
    console.error("Error adding organization member:", error);
    throw error;
  }
}

/**
 * Update a member's role
 * @param memberId - ID of the member record
 * @param newRole - New role to assign
 * @returns The updated member record
 */
export async function updateMemberRole(memberId: string, newRole: Role) {
  try {
    const member = await prisma.organizationMember.update({
      where: { id: memberId },
      data: { role: newRole },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return member;
  } catch (error) {
    console.error("Error updating member role:", error);
    throw error;
  }
}

/**
 * Remove a member from an organization
 * @param memberId - ID of the member record
 */
export async function removeOrganizationMember(memberId: string) {
  try {
    await prisma.organizationMember.delete({
      where: { id: memberId },
    });
  } catch (error) {
    console.error("Error removing organization member:", error);
    throw error;
  }
}
