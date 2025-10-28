import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Type definitions for auth middleware
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  [key: string]: unknown;
}

export interface AuthContext {
  user: AuthUser;
  params?: Record<string, string>;
}

/**
 * Middleware to protect API routes
 * Usage: const user = await requireAuth(request);
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
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
    context: AuthContext
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, { params }: { params?: Record<string, string> } = {}) => {
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
