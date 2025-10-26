/**
 * Custom In-Memory Rate Limiter
 *
 * Provides rate limiting without external dependencies.
 * Uses in-memory storage with automatic cleanup.
 *
 * NOTE: This is a single-instance rate limiter.
 * For multi-instance deployments, consider using Redis or Upstash.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.storage = new Map();
    this.cleanupInterval = null;
    this.startCleanup();
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup() {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);

    // Prevent the interval from keeping the process alive
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.storage.entries()) {
      if (entry.resetAt < now) {
        this.storage.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0 && process.env.NODE_ENV === "development") {
      console.log(`Rate limiter: Cleaned up ${cleanedCount} expired entries`);
    }
  }

  /**
   * Check if request is allowed
   */
  async limit(identifier: string, options: RateLimitOptions): Promise<RateLimitResult> {
    const now = Date.now();
    const key = `${identifier}:${options.windowMs}:${options.maxRequests}`;

    let entry = this.storage.get(key);

    // Create new entry if it doesn't exist or has expired
    if (!entry || entry.resetAt < now) {
      entry = {
        count: 0,
        resetAt: now + options.windowMs,
      };
      this.storage.set(key, entry);
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    const success = entry.count <= options.maxRequests;
    const remaining = Math.max(0, options.maxRequests - entry.count);

    return {
      success,
      limit: options.maxRequests,
      remaining,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string) {
    // Delete all entries for this identifier
    for (const key of this.storage.keys()) {
      if (key.startsWith(`${identifier}:`)) {
        this.storage.delete(key);
      }
    }
  }

  /**
   * Get current stats
   */
  getStats() {
    return {
      totalEntries: this.storage.size,
      memoryUsage: process.memoryUsage(),
    };
  }

  /**
   * Destroy the rate limiter
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.storage.clear();
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// Export rate limiter instance
export { rateLimiter, RateLimitOptions, RateLimitResult };

// Export pre-configured rate limiters
export const RateLimits = {
  // Very strict - for authentication endpoints
  AUTH: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
  } as RateLimitOptions,

  // Strict - for write operations
  WRITE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  } as RateLimitOptions,

  // Moderate - for read operations
  READ: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  } as RateLimitOptions,

  // Very strict - for expensive calculations
  CALCULATION: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  } as RateLimitOptions,

  // Lenient - for public endpoints
  PUBLIC: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200,
  } as RateLimitOptions,
};

/**
 * Get identifier from request
 * Uses IP address with fallback to user-agent
 */
export function getIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Try to get IP from headers
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() :
             request.headers.get("x-real-ip") ||
             "unknown";

  return `ip:${ip}`;
}
