import { z } from "zod";
import { OccupancyType } from "@prisma/client";

// Create organization schema
export const createOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(255),
  industrySector: z.string().optional(),
  occupancyType: z.nativeEnum(OccupancyType),
  reportingBoundaries: z.record(z.string(), z.unknown()).optional(),
  applicableScopes: z
    .object({
      scope1: z.boolean(),
      scope2: z.boolean(),
      scope3: z.boolean(),
    })
    .optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

// Update organization schema
export const updateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(255).optional(),
  industrySector: z.string().optional(),
  occupancyType: z.nativeEnum(OccupancyType).optional(),
  reportingBoundaries: z.record(z.string(), z.unknown()).optional(),
  applicableScopes: z
    .object({
      scope1: z.boolean().optional(),
      scope2: z.boolean().optional(),
      scope3: z.boolean().optional(),
    })
    .optional(),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
