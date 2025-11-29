import { NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getValidatedBody } from "@/lib/utils/validation-middleware";
import { createOrganizationSchema } from "@/lib/validations/organization.schemas";
import { checkRateLimit } from "@/lib/utils/rate-limit-middleware";
import { RateLimits } from "@/lib/services/rate-limiter";

/**
 * POST /api/organizations
 * Create a new organization
 * Rate limited: 20 requests per minute
 */
export const POST = withAuth(async (request, { user }): Promise<NextResponse> => {
  try {
    // Apply rate limiting
    const rateLimit = await checkRateLimit(request, RateLimits.WRITE, user.id);
    if (!rateLimit.allowed) {
      return rateLimit.response || NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    // Validate request body
    const body = await getValidatedBody(request, createOrganizationSchema);
    const {
      name,
      industrySector,
      occupancyType,
      reportingBoundaries,
      applicableScopes,
    } = body;

    // Check if user already has an organization
    const existingOrg = await prisma.organization.findUnique({
      where: { userId: user.id },
    });

    if (existingOrg) {
      return NextResponse.json(
        { error: "User already has an organization" },
        { status: 400 }
      );
    }

    // Set default applicable scopes based on occupancy type
    let defaultScopes = applicableScopes || {
      scope1: true,
      scope2: true,
      scope3: false,
    };

    // Adjust scopes based on occupancy type
    if (occupancyType === "residential") {
      defaultScopes = { scope1: true, scope2: true, scope3: false };
    } else if (["commercial", "industrial", "lgu", "academic"].includes(occupancyType)) {
      defaultScopes = { scope1: true, scope2: true, scope3: true };
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        userId: user.id,
        name,
        industrySector: industrySector || null,
        occupancyType,
        reportingBoundaries: (reportingBoundaries as Prisma.InputJsonValue) || undefined,
        applicableScopes: defaultScopes as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({
      success: true,
      organization,
    }, { status: 201 });
  } catch (error) {
    console.error("Create organization error:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
});

/**
 * GET /api/organizations
 * Get user's organization
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { userId: user.id },
      include: {
        facilities: true,
        _count: {
          select: {
            emissionRecords: true,
            facilities: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      organization,
    });
  } catch (error) {
    console.error("Get organization error:", error);
    return NextResponse.json(
      { error: "Failed to get organization" },
      { status: 500 }
    );
  }
});
