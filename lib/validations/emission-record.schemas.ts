import { z } from "zod";
import { RecordStatus } from "@prisma/client";

// Create emission record schema
export const createEmissionRecordSchema = z.object({
  organizationId: z.string().cuid("Invalid organization ID"),
  facilityId: z.string().cuid("Invalid facility ID").optional(),
  reportingPeriodStart: z.string().datetime("Invalid start date"),
  reportingPeriodEnd: z.string().datetime("Invalid end date"),
  scopeSelection: z
    .object({
      scope1: z.boolean(),
      scope2: z.boolean(),
      scope3: z.boolean(),
    })
    .optional(),
  status: z.nativeEnum(RecordStatus).optional(),
}).refine(
  (data) => {
    const start = new Date(data.reportingPeriodStart);
    const end = new Date(data.reportingPeriodEnd);
    return end > start;
  },
  {
    message: "End date must be after start date",
    path: ["reportingPeriodEnd"],
  }
);

export type CreateEmissionRecordInput = z.infer<typeof createEmissionRecordSchema>;

// Update emission record schema
export const updateEmissionRecordSchema = z.object({
  facilityId: z.string().cuid("Invalid facility ID").optional(),
  reportingPeriodStart: z.string().datetime("Invalid start date").optional(),
  reportingPeriodEnd: z.string().datetime("Invalid end date").optional(),
  scopeSelection: z
    .object({
      scope1: z.boolean().optional(),
      scope2: z.boolean().optional(),
      scope3: z.boolean().optional(),
    })
    .optional(),
  status: z.nativeEnum(RecordStatus).optional(),
}).refine(
  (data) => {
    if (data.reportingPeriodStart && data.reportingPeriodEnd) {
      const start = new Date(data.reportingPeriodStart);
      const end = new Date(data.reportingPeriodEnd);
      return end > start;
    }
    return true;
  },
  {
    message: "End date must be after start date",
    path: ["reportingPeriodEnd"],
  }
);

export type UpdateEmissionRecordInput = z.infer<typeof updateEmissionRecordSchema>;
