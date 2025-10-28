import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

/**
 * Validates request body against a Zod schema
 * Returns validated data or throws with formatted error response
 */
export async function validateRequest<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

/**
 * Validates query parameters against a Zod schema
 * Returns validated data or throws with formatted error response
 */
export function validateQuery<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): z.infer<T> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = Object.fromEntries(searchParams.entries());
    return schema.parse(query);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  public statusCode = 400;
  public errors: Array<{ field: string; message: string }>;

  constructor(zodError: ZodError) {
    super("Validation failed");
    this.name = "ValidationError";
    this.errors = zodError.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));
  }

  toJSON() {
    return {
      error: this.message,
      details: this.errors,
    };
  }
}

/**
 * Middleware wrapper that handles validation errors
 * Use this to wrap route handlers that use validation
 */
export function withValidation<T>(
  handler: (request: NextRequest, context?: Record<string, unknown>) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: Record<string, unknown>) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ValidationError) {
        return NextResponse.json(error.toJSON(), { status: error.statusCode });
      }
      throw error;
    }
  };
}

/**
 * Helper to validate and extract body in one step
 */
export async function getValidatedBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  return validateRequest(request, schema);
}

/**
 * Helper to validate and extract query params in one step
 */
export function getValidatedQuery<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): z.infer<T> {
  return validateQuery(request, schema);
}
