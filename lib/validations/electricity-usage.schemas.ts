import { z } from "zod";

// Create electricity usage schema
export const createElectricityUsageSchema = z.object({
  emissionRecordId: z.string().cuid("Invalid emission record ID"),
  facilityId: z.string().cuid("Invalid facility ID").optional(),
  meterNumber: z.string().optional(),
  kwhConsumption: z
    .number()
    .positive("kWh consumption must be a positive number")
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive())),
  peakHoursKwh: z
    .number()
    .nonnegative("Peak hours kWh must be non-negative")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().nonnegative()))
    .optional(),
  offpeakHoursKwh: z
    .number()
    .nonnegative("Off-peak hours kWh must be non-negative")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().nonnegative()))
    .optional(),
  billingPeriodStart: z.string().datetime("Invalid billing period start date"),
  billingPeriodEnd: z.string().datetime("Invalid billing period end date"),
  utilityBillData: z.record(z.any()).optional(),
}).refine(
  (data) => {
    const start = new Date(data.billingPeriodStart);
    const end = new Date(data.billingPeriodEnd);
    return end > start;
  },
  {
    message: "Billing period end must be after start",
    path: ["billingPeriodEnd"],
  }
);

export type CreateElectricityUsageInput = z.infer<typeof createElectricityUsageSchema>;

// Update electricity usage schema
export const updateElectricityUsageSchema = z.object({
  facilityId: z.string().cuid("Invalid facility ID").optional(),
  meterNumber: z.string().optional(),
  kwhConsumption: z
    .number()
    .positive("kWh consumption must be a positive number")
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().positive()))
    .optional(),
  peakHoursKwh: z
    .number()
    .nonnegative("Peak hours kWh must be non-negative")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().nonnegative()))
    .optional(),
  offpeakHoursKwh: z
    .number()
    .nonnegative("Off-peak hours kWh must be non-negative")
    .optional()
    .or(z.string().transform((val) => parseFloat(val)).pipe(z.number().nonnegative()))
    .optional(),
  billingPeriodStart: z.string().datetime("Invalid billing period start date").optional(),
  billingPeriodEnd: z.string().datetime("Invalid billing period end date").optional(),
  utilityBillData: z.record(z.any()).optional(),
}).refine(
  (data) => {
    if (data.billingPeriodStart && data.billingPeriodEnd) {
      const start = new Date(data.billingPeriodStart);
      const end = new Date(data.billingPeriodEnd);
      return end > start;
    }
    return true;
  },
  {
    message: "Billing period end must be after start",
    path: ["billingPeriodEnd"],
  }
);

export type UpdateElectricityUsageInput = z.infer<typeof updateElectricityUsageSchema>;
