import { z } from "zod";
import { FuelType, VehicleType } from "@prisma/client";

// Create vehicle usage schema
export const createVehicleUsageSchema = z.object({
  emissionRecordId: z.string().cuid("Invalid emission record ID"),
  vehicleId: z.string().optional(),
  vehicleType: z.nativeEnum(VehicleType),
  fuelType: z.nativeEnum(FuelType),
  fuelConsumed: z
    .number()
    .positive("Fuel consumed must be a positive number")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive()))
    .optional(),
  mileage: z
    .number()
    .nonnegative("Mileage must be non-negative")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().nonnegative()))
    .optional(),
  unit: z.string().min(1, "Unit is required"),
  entryDate: z.string().datetime("Invalid entry date"),
});

export type CreateVehicleUsageInput = z.infer<typeof createVehicleUsageSchema>;

// Update vehicle usage schema
export const updateVehicleUsageSchema = z.object({
  vehicleId: z.string().optional(),
  vehicleType: z.nativeEnum(VehicleType).optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  fuelConsumed: z
    .number()
    .positive("Fuel consumed must be a positive number")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive()))
    .optional(),
  mileage: z
    .number()
    .nonnegative("Mileage must be non-negative")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().nonnegative()))
    .optional(),
  unit: z.string().min(1, "Unit is required").optional(),
  entryDate: z.string().datetime("Invalid entry date").optional(),
});

export type UpdateVehicleUsageInput = z.infer<typeof updateVehicleUsageSchema>;
