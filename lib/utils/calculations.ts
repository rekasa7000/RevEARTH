import {
  getFuelEmissionFactor,
  getRefrigerantEmissionFactor,
  getElectricityEmissionFactor,
  getTransportEmissionFactor,
  EMISSION_FACTORS,
} from "@/lib/constants/emission-factors";

/**
 * Calculate CO2e for fuel consumption
 * Formula: Quantity × Emission Factor
 */
export function calculateFuelEmissions(
  fuelType: string,
  quantity: number
): number {
  const factor = getFuelEmissionFactor(fuelType);
  return quantity * factor;
}

/**
 * Calculate CO2e for vehicle fuel consumption
 * Formula: Fuel Consumed × Emission Factor
 */
export function calculateVehicleEmissions(
  fuelType: string,
  fuelConsumed: number
): number {
  const factor = getFuelEmissionFactor(fuelType);
  return fuelConsumed * factor;
}

/**
 * Calculate CO2e for refrigerant leakage
 * Formula: Quantity Leaked × GWP × 0.001
 */
export function calculateRefrigerantEmissions(
  refrigerantType: string,
  quantityLeaked: number
): number {
  const factor = getRefrigerantEmissionFactor(refrigerantType);
  return quantityLeaked * factor;
}

/**
 * Calculate CO2e for electricity consumption
 * Formula: kWh Consumption × Grid Emission Factor
 */
export function calculateElectricityEmissions(
  kwhConsumption: number,
  grid: string = "ph_grid_average"
): number {
  const factor = getElectricityEmissionFactor(grid);
  return kwhConsumption * factor;
}

/**
 * Calculate CO2e for employee commuting
 * Formula: Employee Count × Avg Distance × Transport Factor × Work Days × Round Trip Factor
 *
 * Work Days = (Days per Week × 52 weeks) - (WFH Days × 52)
 * Round Trip Factor = 2 (to and from work)
 */
export function calculateCommutingEmissions(
  employeeCount: number,
  avgDistanceKm: number,
  transportMode: string,
  daysPerWeek: number,
  wfhDays: number
): number {
  const factor = getTransportEmissionFactor(transportMode);

  // Calculate annual work days
  const workDaysPerYear = (daysPerWeek * 52) - (wfhDays * 52);

  // Round trip factor (2 = to and from work)
  const roundTripFactor = 2;

  // Annual emissions
  const annualEmissions =
    employeeCount *
    avgDistanceKm *
    roundTripFactor *
    factor *
    workDaysPerYear;

  // Convert to monthly average
  return annualEmissions / 12;
}

/**
 * Calculate total Scope 1 emissions
 */
export function calculateScope1Total(
  fuelEmissions: number[],
  vehicleEmissions: number[],
  refrigerantEmissions: number[]
): number {
  const fuelTotal = fuelEmissions.reduce((sum, val) => sum + val, 0);
  const vehicleTotal = vehicleEmissions.reduce((sum, val) => sum + val, 0);
  const refrigerantTotal = refrigerantEmissions.reduce((sum, val) => sum + val, 0);

  return fuelTotal + vehicleTotal + refrigerantTotal;
}

/**
 * Calculate total Scope 2 emissions
 */
export function calculateScope2Total(
  electricityEmissions: number[]
): number {
  return electricityEmissions.reduce((sum, val) => sum + val, 0);
}

/**
 * Calculate total Scope 3 emissions
 */
export function calculateScope3Total(
  commutingEmissions: number[]
): number {
  return commutingEmissions.reduce((sum, val) => sum + val, 0);
}

/**
 * Calculate emissions per employee
 */
export function calculateEmissionsPerEmployee(
  totalCo2e: number,
  employeeCount: number
): number {
  if (employeeCount === 0) return 0;
  return totalCo2e / employeeCount;
}

/**
 * Generate breakdown by category
 */
export function generateBreakdown(
  fuelTotal: number,
  vehicleTotal: number,
  refrigerantTotal: number,
  electricityTotal: number,
  commutingTotal: number
): Record<string, number> {
  return {
    fuel: parseFloat(fuelTotal.toFixed(4)),
    vehicles: parseFloat(vehicleTotal.toFixed(4)),
    refrigerants: parseFloat(refrigerantTotal.toFixed(4)),
    electricity: parseFloat(electricityTotal.toFixed(4)),
    commuting: parseFloat(commutingTotal.toFixed(4)),
  };
}

/**
 * Get emission factors used in calculations
 */
export function getEmissionFactorsUsed(
  fuelTypes: string[],
  refrigerantTypes: string[],
  transportModes: string[]
): Record<string, number> {
  const factorsUsed: Record<string, number> = {};

  // Add fuel factors
  fuelTypes.forEach(type => {
    const factor = getFuelEmissionFactor(type);
    if (factor > 0) {
      factorsUsed[type] = factor;
    }
  });

  // Add refrigerant factors
  refrigerantTypes.forEach(type => {
    const factor = getRefrigerantEmissionFactor(type);
    if (factor > 0) {
      factorsUsed[type] = factor;
    }
  });

  // Add electricity factor (PH grid average)
  factorsUsed.electricity_ph_grid = getElectricityEmissionFactor();

  // Add transport factors
  transportModes.forEach(mode => {
    const factor = getTransportEmissionFactor(mode);
    factorsUsed[`transport_${mode}`] = factor;
  });

  return factorsUsed;
}

/**
 * Validate calculation inputs
 */
export function validateCalculationInputs(value: number): boolean {
  return !isNaN(value) && isFinite(value) && value >= 0;
}

/**
 * Round to 4 decimal places for storage
 */
export function roundEmissions(value: number): number {
  return parseFloat(value.toFixed(4));
}
