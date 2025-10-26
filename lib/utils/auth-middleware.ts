import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Middleware to protect API routes
 * Usage: const user = await requireAuth(request);
 */
export async function requireAuth(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

/**
 * Higher-order function to wrap API routes with authentication
 */
export function withAuth(
  handler: (
    request: NextRequest,
    context: { user: any; params?: any }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, { params }: any = {}) => {
    try {
      const user = await requireAuth(request);
      return await handler(request, { user, params });
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        return NextResponse.json(
          { error: "Unauthorized - Please log in" },
          { status: 401 }
        );
      }

      console.error("Auth middleware error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Optional auth - returns user if authenticated, null otherwise
 */
export async function optionalAuth(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session?.user || null;
  } catch (error) {
    return null;
  }
}
