import {
  getFuelEmissionFactor,
  getFuelGasEmissions,
  getRefrigerantEmissionFactor,
  getElectricityEmissionFactor,
  getElectricityGasEmissions,
  getTransportEmissionFactor,
  getTransportGasEmissions,
} from "@/lib/constants/emission-factors";

/**
 * Calculate emissions for fuel consumption (returns separate CO2, CH4, N2O)
 * Formula: CO2e = CO2 + (CH4 × 25) + (N2O × 298)
 */
export function calculateFuelEmissions(
  fuelType: string,
  quantity: number
): { co2: number; ch4: number; n2o: number; co2e: number } {
  return getFuelGasEmissions(fuelType, quantity);
}

/**
 * Calculate emissions for vehicle fuel consumption (returns separate CO2, CH4, N2O)
 * Formula: Fuel Consumed × Emission Factor
 */
export function calculateVehicleEmissions(
  fuelType: string,
  fuelConsumed: number
): { co2: number; ch4: number; n2o: number; co2e: number } {
  return getFuelGasEmissions(fuelType, fuelConsumed);
}

/**
 * Calculate CO2e for refrigerant leakage
 * Formula: Quantity Leaked × GWP
 * Note: Refrigerants produce direct CO2e (no separate CO2, CH4, N2O)
 */
export function calculateRefrigerantEmissions(
  refrigerantType: string,
  quantityLeaked: number
): { co2: number; ch4: number; n2o: number; co2e: number } {
  const factor = getRefrigerantEmissionFactor(refrigerantType);
  const co2e = quantityLeaked * factor;
  // Refrigerants contribute directly to CO2e, so we put it all in CO2
  return { co2: co2e, ch4: 0, n2o: 0, co2e };
}

/**
 * Calculate emissions for electricity consumption (returns separate CO2, CH4, N2O)
 * Formula: kWh Consumption × Grid Emission Factor
 */
export function calculateElectricityEmissions(
  kwhConsumption: number,
  grid: string = "ph_grid_average"
): { co2: number; ch4: number; n2o: number; co2e: number } {
  return getElectricityGasEmissions(kwhConsumption, grid);
}

/**
 * Calculate emissions for employee commuting (returns separate CO2, CH4, N2O)
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
): { co2: number; ch4: number; n2o: number; co2e: number } {
  // Calculate annual work days
  const workDaysPerYear = (daysPerWeek * 52) - (wfhDays * 52);

  // Round trip factor (2 = to and from work)
  const roundTripFactor = 2;

  // Total distance per year for all employees
  const totalDistancePerYear =
    employeeCount * avgDistanceKm * roundTripFactor * workDaysPerYear;

  // Get emissions for total distance
  const annualEmissions = getTransportGasEmissions(transportMode, totalDistancePerYear);

  // Convert to monthly average
  return {
    co2: annualEmissions.co2 / 12,
    ch4: annualEmissions.ch4 / 12,
    n2o: annualEmissions.n2o / 12,
    co2e: annualEmissions.co2e / 12,
  };
}

/**
 * Calculate total Scope 1 emissions (aggregates separate gases)
 */
export function calculateScope1Total(
  fuelEmissions: Array<{ co2: number; ch4: number; n2o: number; co2e: number }>,
  vehicleEmissions: Array<{ co2: number; ch4: number; n2o: number; co2e: number }>,
  refrigerantEmissions: Array<{ co2: number; ch4: number; n2o: number; co2e: number }>
): { co2: number; ch4: number; n2o: number; co2e: number } {
  const aggregate = (emissions: Array<{ co2: number; ch4: number; n2o: number; co2e: number }>) => {
    return emissions.reduce(
      (sum, val) => ({
        co2: sum.co2 + val.co2,
        ch4: sum.ch4 + val.ch4,
        n2o: sum.n2o + val.n2o,
        co2e: sum.co2e + val.co2e,
      }),
      { co2: 0, ch4: 0, n2o: 0, co2e: 0 }
    );
  };

  const fuelTotal = aggregate(fuelEmissions);
  const vehicleTotal = aggregate(vehicleEmissions);
  const refrigerantTotal = aggregate(refrigerantEmissions);

  return {
    co2: fuelTotal.co2 + vehicleTotal.co2 + refrigerantTotal.co2,
    ch4: fuelTotal.ch4 + vehicleTotal.ch4 + refrigerantTotal.ch4,
    n2o: fuelTotal.n2o + vehicleTotal.n2o + refrigerantTotal.n2o,
    co2e: fuelTotal.co2e + vehicleTotal.co2e + refrigerantTotal.co2e,
  };
}

/**
 * Calculate total Scope 2 emissions (aggregates separate gases)
 */
export function calculateScope2Total(
  electricityEmissions: Array<{ co2: number; ch4: number; n2o: number; co2e: number }>
): { co2: number; ch4: number; n2o: number; co2e: number } {
  return electricityEmissions.reduce(
    (sum, val) => ({
      co2: sum.co2 + val.co2,
      ch4: sum.ch4 + val.ch4,
      n2o: sum.n2o + val.n2o,
      co2e: sum.co2e + val.co2e,
    }),
    { co2: 0, ch4: 0, n2o: 0, co2e: 0 }
  );
}

/**
 * Calculate total Scope 3 emissions (aggregates separate gases)
 */
export function calculateScope3Total(
  commutingEmissions: Array<{ co2: number; ch4: number; n2o: number; co2e: number }>
): { co2: number; ch4: number; n2o: number; co2e: number } {
  return commutingEmissions.reduce(
    (sum, val) => ({
      co2: sum.co2 + val.co2,
      ch4: sum.ch4 + val.ch4,
      n2o: sum.n2o + val.n2o,
      co2e: sum.co2e + val.co2e,
    }),
    { co2: 0, ch4: 0, n2o: 0, co2e: 0 }
  );
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
