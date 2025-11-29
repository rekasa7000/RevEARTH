/**
 * Common type definitions used across the application
 */

// JSON value types for Prisma
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

// Type guard for errors
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Convert unknown error to message string
export function getErrorMessage(error: unknown): string {
  if (isError(error)) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}
