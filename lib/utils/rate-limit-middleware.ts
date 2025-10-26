/**
 * Rate Limiting Middleware
 *
 * Provides middleware for applying rate limits to API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimiter, RateLimitOptions, getIdentifier } from "@/lib/services/rate-limiter";

interface RateLimitMiddlewareOptions extends RateLimitOptions {
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  getUserId?: (request: NextRequest) => string | undefined;
}

/**
 * Add rate limit headers to response
 */
function addRateLimitHeaders(response: NextResponse, result: {
  limit: number;
  remaining: number;
  resetAt: number;
}): NextResponse {
  response.headers.set("X-RateLimit-Limit", result.limit.toString());
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
  response.headers.set("X-RateLimit-Reset", new Date(result.resetAt).toISOString());

  return response;
}

/**
 * Create rate limited response
 */
function createRateLimitedResponse(result: {
  limit: number;
  remaining: number;
  resetAt: number;
}): NextResponse {
  const response = NextResponse.json(
    {
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      limit: result.limit,
      remaining: result.remaining,
      resetAt: new Date(result.resetAt).toISOString(),
    },
    { status: 429 }
  );

  return addRateLimitHeaders(response, result);
}

/**
 * Rate limiting middleware wrapper
 */
export function withRateLimit(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: RateLimitMiddlewareOptions
) {
  return async (request: NextRequest, context: any) => {
    try {
      // Get user ID if function provided
      const userId = options.getUserId ? options.getUserId(request) : undefined;

      // Get identifier
      const identifier = getIdentifier(request, userId);

      // Check rate limit
      const result = await rateLimiter.limit(identifier, {
        windowMs: options.windowMs,
        maxRequests: options.maxRequests,
      });

      // If rate limit exceeded
      if (!result.success) {
        return createRateLimitedResponse(result);
      }

      // Execute handler
      const response = await handler(request, context);

      // Add rate limit headers to successful response
      return addRateLimitHeaders(response, result);
    } catch (error) {
      // If rate limiting fails, allow request through
      console.error("Rate limiting error:", error);
      return handler(request, context);
    }
  };
}

/**
 * Simple rate limit function for use without full middleware
 */
export async function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions,
  userId?: string
): Promise<{ allowed: boolean; response?: NextResponse }> {
  try {
    const identifier = getIdentifier(request, userId);
    const result = await rateLimiter.limit(identifier, options);

    if (!result.success) {
      return {
        allowed: false,
        response: createRateLimitedResponse(result),
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Rate limiting error:", error);
    return { allowed: true }; // Allow on error
  }
}

/**
 * Combine auth middleware with rate limiting
 */
export function withAuthAndRateLimit(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  options: RateLimitMiddlewareOptions,
  authMiddleware: (handler: any) => any
) {
  // First apply rate limiting, then auth
  const rateLimitedHandler = withRateLimit(handler, options);
  return authMiddleware(rateLimitedHandler);
}
