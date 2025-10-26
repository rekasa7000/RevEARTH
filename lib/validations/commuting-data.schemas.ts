import { z } from "zod";
import { TransportMode } from "@prisma/client";

// Create commuting data schema
export const createCommutingDataSchema = z.object({
  emissionRecordId: z.string().cuid("Invalid emission record ID"),
  employeeCount: z
    .number()
    .int("Employee count must be an integer")
    .positive("Employee count must be positive")
    .or(z.string().transform((val) => parseInt(val)).pipe(z.number().int().positive())),
  avgDistanceKm: z
    .number()
    .positive("Average distance must be positive")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive()))
    .optional(),
  transportMode: z.nativeEnum(TransportMode, {
    errorMap: () => ({ message: "Invalid transport mode" }),
  }),
  daysPerWeek: z
    .number()
    .int("Days per week must be an integer")
    .min(0, "Days per week must be at least 0")
    .max(7, "Days per week cannot exceed 7")
    .optional()
    .or(z.string().transform((val) => parseInt(val)).pipe(z.number().int().min(0).max(7)))
    .optional(),
  wfhDays: z
    .number()
    .int("Work from home days must be an integer")
    .nonnegative("Work from home days must be non-negative")
    .optional()
    .or(z.string().transform((val) => parseInt(val)).pipe(z.number().int().nonnegative()))
    .optional(),
  surveyDate: z.string().datetime("Invalid survey date").optional(),
});

export type CreateCommutingDataInput = z.infer<typeof createCommutingDataSchema>;

// Update commuting data schema
export const updateCommutingDataSchema = z.object({
  employeeCount: z
    .number()
    .int("Employee count must be an integer")
    .positive("Employee count must be positive")
    .or(z.string().transform((val) => parseInt(val)).pipe(z.number().int().positive()))
    .optional(),
  avgDistanceKm: z
    .number()
    .positive("Average distance must be positive")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive()))
    .optional(),
  transportMode: z.nativeEnum(TransportMode).optional(),
  daysPerWeek: z
    .number()
    .int("Days per week must be an integer")
    .min(0, "Days per week must be at least 0")
    .max(7, "Days per week cannot exceed 7")
    .optional()
    .or(z.string().transform((val) => parseInt(val)).pipe(z.number().int().min(0).max(7)))
    .optional(),
  wfhDays: z
    .number()
    .int("Work from home days must be an integer")
    .nonnegative("Work from home days must be non-negative")
    .optional()
    .or(z.string().transform((val) => parseInt(val)).pipe(z.number().int().nonnegative()))
    .optional(),
  surveyDate: z.string().datetime("Invalid survey date").optional(),
});

export type UpdateCommutingDataInput = z.infer<typeof updateCommutingDataSchema>;
