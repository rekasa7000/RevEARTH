/**
 * Custom Error Logging Service
 * Provides error tracking and monitoring without external dependencies
 */

import { prisma } from "@/lib/db";

export type ErrorLevel = "error" | "warn" | "info" | "debug";

export interface LogErrorOptions {
  message: string;
  stack?: string;
  level?: ErrorLevel;
  context?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  method?: string;
  statusCode?: number;
  requestBody?: unknown;
  metadata?: Record<string, unknown>;
}

/**
 * Log an error to the database
 */
export async function logError(options: LogErrorOptions): Promise<void> {
  try {
    const {
      message,
      stack,
      level = "error",
      context,
      url,
      userAgent,
      userId,
      method,
      statusCode,
      requestBody,
      metadata,
    } = options;

    // Check if similar error exists (same message, context, and URL within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existingError = await prisma.errorLog.findFirst({
      where: {
        message,
        context,
        url,
        firstSeenAt: {
          gte: oneHourAgo,
        },
      },
      orderBy: {
        lastSeenAt: "desc",
      },
    });

    if (existingError) {
      // Update existing error with new occurrence
      await prisma.errorLog.update({
        where: { id: existingError.id },
        data: {
          occurrences: existingError.occurrences + 1,
          lastSeenAt: new Date(),
          // Update stack if new one is provided
          ...(stack && { stack }),
          // Update metadata if provided
          ...(metadata && { metadata }),
        },
      });
    } else {
      // Create new error log
      await prisma.errorLog.create({
        data: {
          message,
          stack,
          level,
          context,
          url,
          userAgent,
          userId,
          method,
          statusCode,
          requestBody: requestBody ? JSON.parse(JSON.stringify(requestBody)) : null,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
          environment: process.env.NODE_ENV || "production",
        },
      });
    }
  } catch (error) {
    // If error logging fails, log to console as fallback
    console.error("Failed to log error to database:", error);
    console.error("Original error:", options);
  }
}

/**
 * Log error from API route
 */
export async function logApiError(
  error: Error,
  request: Request,
  context?: string
): Promise<void> {
  const url = new URL(request.url);

  await logError({
    message: error.message,
    stack: error.stack,
    level: "error",
    context: context || "api",
    url: url.pathname,
    userAgent: request.headers.get("user-agent") || undefined,
    method: request.method,
    metadata: {
      query: Object.fromEntries(url.searchParams),
    },
  });
}

/**
 * Log error from client side
 */
export async function logClientError(
  error: Error,
  url?: string,
  userId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logError({
    message: error.message,
    stack: error.stack,
    level: "error",
    context: "client",
    url,
    userAgent: typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    userId,
    metadata,
  });
}

/**
 * Mark error as resolved
 */
export async function resolveError(errorId: string, resolvedBy?: string): Promise<void> {
  await prisma.errorLog.update({
    where: { id: errorId },
    data: {
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy,
    },
  });
}

/**
 * Get error statistics
 */
export async function getErrorStats(timeframe: "day" | "week" | "month" = "day") {
  const now = new Date();
  const startDate = new Date();

  switch (timeframe) {
    case "day":
      startDate.setDate(now.getDate() - 1);
      break;
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
  }

  const [total, unresolved, byLevel] = await Promise.all([
    // Total errors in timeframe
    prisma.errorLog.count({
      where: {
        firstSeenAt: {
          gte: startDate,
        },
      },
    }),

    // Unresolved errors
    prisma.errorLog.count({
      where: {
        resolved: false,
        firstSeenAt: {
          gte: startDate,
        },
      },
    }),

    // Errors by level
    prisma.errorLog.groupBy({
      by: ["level"],
      where: {
        firstSeenAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
    }),
  ]);

  const byLevelMap = byLevel.reduce(
    (acc, item) => {
      acc[item.level] = item._count.id;
      return acc;
    },
    { error: 0, warn: 0, info: 0, debug: 0 } as Record<ErrorLevel, number>
  );

  return {
    total,
    unresolved,
    resolved: total - unresolved,
    byLevel: byLevelMap,
    timeframe,
  };
}

/**
 * Clean up old resolved errors
 */
export async function cleanupOldErrors(daysToKeep: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  const result = await prisma.errorLog.deleteMany({
    where: {
      resolved: true,
      resolvedAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}
