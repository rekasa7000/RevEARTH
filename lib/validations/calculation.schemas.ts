import { z } from "zod";

// Calculate emissions schema
export const calculateEmissionsSchema = z.object({
  emissionRecordId: z.string().cuid("Invalid emission record ID"),
  force: z.boolean().optional(), // Force recalculation even if already calculated
});

export type CalculateEmissionsInput = z.infer<typeof calculateEmissionsSchema>;
