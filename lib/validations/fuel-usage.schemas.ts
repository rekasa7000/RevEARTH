import { z } from "zod";
import { FuelType } from "@prisma/client";

// Create fuel usage schema
export const createFuelUsageSchema = z.object({
  emissionRecordId: z.string().cuid("Invalid emission record ID"),
  fuelType: z.nativeEnum(FuelType),
  quantity: z
    .number()
    .positive("Quantity must be a positive number")
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive())),
  unit: z.string().min(1, "Unit is required"),
  entryDate: z.string().datetime("Invalid entry date"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateFuelUsageInput = z.infer<typeof createFuelUsageSchema>;

// Update fuel usage schema
export const updateFuelUsageSchema = z.object({
  fuelType: z.nativeEnum(FuelType).optional(),
  quantity: z
    .number()
    .positive("Quantity must be a positive number")
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive()))
    .optional(),
  unit: z.string().min(1, "Unit is required").optional(),
  entryDate: z.string().datetime("Invalid entry date").optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateFuelUsageInput = z.infer<typeof updateFuelUsageSchema>;
