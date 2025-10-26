import { z } from "zod";

// Create facility schema
export const createFacilitySchema = z.object({
  organizationId: z.string().cuid("Invalid organization ID"),
  name: z.string().min(1, "Facility name is required").max(255),
  location: z.string().optional(),
  address: z.string().optional(),
  areaSqm: z
    .number()
    .positive("Area must be a positive number")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive()))
    .optional(),
  employeeCount: z
    .number()
    .int("Employee count must be an integer")
    .positive("Employee count must be positive")
    .optional()
    .or(z.string().transform((val) => parseInt(val)).pipe(z.number().int().positive()))
    .optional(),
});

export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;

// Update facility schema
export const updateFacilitySchema = z.object({
  name: z.string().min(1, "Facility name is required").max(255).optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  areaSqm: z
    .number()
    .positive("Area must be a positive number")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive()))
    .optional(),
  employeeCount: z
    .number()
    .int("Employee count must be an integer")
    .positive("Employee count must be positive")
    .optional()
    .or(z.string().transform((val) => parseInt(val)).pipe(z.number().int().positive()))
    .optional(),
});

export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;
