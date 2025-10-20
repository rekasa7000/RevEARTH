import { z } from "zod";
import { RefrigerantType } from "@prisma/client";

// Create refrigerant usage schema
export const createRefrigerantUsageSchema = z.object({
  emissionRecordId: z.string().cuid("Invalid emission record ID"),
  equipmentId: z.string().optional(),
  refrigerantType: z.nativeEnum(RefrigerantType, {
    errorMap: () => ({ message: "Invalid refrigerant type" }),
  }),
  quantityLeaked: z
    .number()
    .nonnegative("Quantity leaked must be non-negative")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().nonnegative()))
    .optional(),
  quantityPurchased: z
    .number()
    .nonnegative("Quantity purchased must be non-negative")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().nonnegative()))
    .optional(),
  unit: z.string().min(1, "Unit is required"),
  entryDate: z.string().datetime("Invalid entry date"),
  leakDetectionLog: z.record(z.any()).optional(),
});

export type CreateRefrigerantUsageInput = z.infer<typeof createRefrigerantUsageSchema>;

// Update refrigerant usage schema
export const updateRefrigerantUsageSchema = z.object({
  equipmentId: z.string().optional(),
  refrigerantType: z.nativeEnum(RefrigerantType).optional(),
  quantityLeaked: z
    .number()
    .nonnegative("Quantity leaked must be non-negative")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().nonnegative()))
    .optional(),
  quantityPurchased: z
    .number()
    .nonnegative("Quantity purchased must be non-negative")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().nonnegative()))
    .optional(),
  unit: z.string().min(1, "Unit is required").optional(),
  entryDate: z.string().datetime("Invalid entry date").optional(),
  leakDetectionLog: z.record(z.any()).optional(),
});

export type UpdateRefrigerantUsageInput = z.infer<typeof updateRefrigerantUsageSchema>;
