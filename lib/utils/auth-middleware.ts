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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
export function withAuth<TParams extends Promise<Record<string, string>> | Record<string, string> | undefined = undefined>(
  handler: (
    request: NextRequest,
    context: AuthContext
  ) => Promise<NextResponse>
): (
  request: NextRequest,
  context: TParams extends undefined ? never : { params: TParams }
) => Promise<NextResponse>;
export function withAuth(
  handler: (
    request: NextRequest,
    context: AuthContext
  ) => Promise<NextResponse>
): (request: NextRequest, ...args: unknown[]) => Promise<NextResponse> {
  return async (request: NextRequest, ...args: unknown[]) => {
    try {
      const context = args[0] as { params?: Promise<Record<string, string>> | Record<string, string> } | undefined;
      const user = await requireAuth(request);
      let params: Record<string, string> | undefined;

      if (context?.params) {
        params = context.params instanceof Promise ? await context.params : context.params;
      }

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function optionalAuth(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session?.user || null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return null;
  }
}
