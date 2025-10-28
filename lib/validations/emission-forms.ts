import { z } from "zod";

// ============================================================================
// Scope 1 - Stationary Combustion (Fuel Usage) Validation
// ============================================================================

export const fuelUsageSchema = z.object({
  sourceDescription: z.string().min(1, "Source description is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
  fuelConsumption: z
    .string()
    .min(1, "Quantity is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Quantity must be a positive number",
    }),
  unit: z.string().min(1, "Unit is required"),
});

export type FuelUsageFormData = z.infer<typeof fuelUsageSchema>;

// ============================================================================
// Scope 1 - Mobile Combustion (Vehicle Usage) Validation
// ============================================================================

export const vehicleUsageSchema = z.object({
  vehicleDescription: z.string().min(1, "Vehicle description is required"),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
  fuelConsumption: z
    .string()
    .min(1, "Fuel consumed is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Fuel consumed must be a positive number",
    }),
  unit: z.string().min(1, "Unit is required"),
  mileage: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
      {
        message: "Mileage must be a positive number or zero",
      }
    ),
});

export type VehicleUsageFormData = z.infer<typeof vehicleUsageSchema>;

// ============================================================================
// Scope 1 - Refrigeration (Not implemented yet)
// ============================================================================

export const refrigerationSchema = z.object({
  equipmentDescription: z.string().min(1, "Equipment description is required"),
  refrigerantType: z.string().min(1, "Refrigerant type is required"),
  equipmentCapacity: z
    .string()
    .min(1, "Equipment capacity is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Equipment capacity must be a positive number",
    }),
  refrigerantLeakage: z
    .string()
    .min(1, "Refrigerant leakage is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Refrigerant leakage must be zero or positive",
    }),
  unit: z.string().min(1, "Unit is required"),
});

export type RefrigerationFormData = z.infer<typeof refrigerationSchema>;

// ============================================================================
// Scope 2 - Electricity Usage Validation
// ============================================================================

export const electricityUsageSchema = z.object({
  energySourceDescription: z.string().min(1, "Energy source description is required"),
  energyType: z.enum(["Electricity", "Steam", "Heating", "Cooling"] as const),
  energyConsumption: z
    .string()
    .min(1, "Energy consumption is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Energy consumption must be a positive number",
    }),
  unit: z.string().min(1, "Unit is required"),
  facilityId: z.string().optional(),
  meterNumber: z.string().optional(),
});

export type ElectricityUsageFormData = z.infer<typeof electricityUsageSchema>;

// ============================================================================
// Scope 3 - Commuting Data Validation
// ============================================================================

export const commutingDataSchema = z.object({
  activityDescription: z.string().min(1, "Activity description is required"),
  transportMode: z.string().min(1, "Transport mode is required"),
  activityData: z
    .string()
    .min(1, "Distance is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Distance must be a positive number",
    }),
  unit: z.string().min(1, "Unit is required"),
  employeeCount: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
      {
        message: "Employee count must be a positive number",
      }
    ),
  daysPerWeek: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 7),
      {
        message: "Days per week must be between 0 and 7",
      }
    ),
  wfhDays: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
      {
        message: "Work from home days must be zero or positive",
      }
    ),
});

export type CommutingDataFormData = z.infer<typeof commutingDataSchema>;

// ============================================================================
// Helper to get schema by scope
// ============================================================================

export function getSchemaForScope(scope: string) {
  switch (scope) {
    case "stationary":
      return fuelUsageSchema;
    case "mobile":
      return vehicleUsageSchema;
    case "refrigeration":
      return refrigerationSchema;
    case "scope2":
      return electricityUsageSchema;
    case "scope3":
      return commutingDataSchema;
    default:
      return null;
  }
}
