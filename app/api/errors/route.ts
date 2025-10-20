import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/utils/auth-middleware";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/services/error-logger";

/**
 * POST /api/errors
 * Log an error from client-side
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      stack,
      level = "error",
      url,
      metadata,
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Error message is required" },
        { status: 400 }
      );
    }

    // Get user info from auth if available (optional)
    let userId: string | undefined;
    try {
      const authHeader = request.headers.get("authorization");
      // Extract user from session if available
      // This is optional - errors can be logged without authentication
    } catch {
      // No auth - that's okay
    }

    await logError({
      message,
      stack,
      level,
      context: "client",
      url,
      userAgent: request.headers.get("user-agent") || undefined,
      userId,
      metadata,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error logging error:", error);
    return NextResponse.json(
      { error: "Failed to log error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/errors
 * Get error logs (requires authentication)
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const level = searchParams.get("level");
    const resolved = searchParams.get("resolved");
    const context = searchParams.get("context");

    // Build where clause
    const where: any = {};

    if (level) {
      where.level = level;
    }

    if (resolved !== null && resolved !== undefined) {
      where.resolved = resolved === "true";
    }

    if (context) {
      where.context = context;
    }

    // Get total count
    const total = await prisma.errorLog.count({ where });

    // Get paginated errors
    const errors = await prisma.errorLog.findMany({
      where,
      orderBy: {
        lastSeenAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        message: true,
        stack: true,
        level: true,
        context: true,
        url: true,
        method: true,
        statusCode: true,
        occurrences: true,
        resolved: true,
        resolvedAt: true,
        firstSeenAt: true,
        lastSeenAt: true,
        environment: true,
        userId: true,
      },
    });

    return NextResponse.json({
      errors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get errors error:", error);
    return NextResponse.json(
      { error: "Failed to get errors" },
      { status: 500 }
    );
  }
});
