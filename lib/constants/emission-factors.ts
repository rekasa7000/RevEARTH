/**
 * Emission Factors for GHG Calculations
 * Sources: EPA, Philippine Department of Energy 2024
 * Units: tCO2e (tonnes of CO2 equivalent)
 */

export const EMISSION_FACTORS = {
  // SCOPE 1 - Direct Emissions
  scope1: {
    // Fuel combustion factors - separated by gas type
    // Source: GHG Inventory Toolkit (Page 15)
    fuels: {
      natural_gas: {
        co2: 0.00268, // tonnes CO2 per liter (2.68 kg/L from toolkit)
        ch4: 0.000000361, // tonnes CH4 per liter (3.61E-04 kg/L)
        n2o: 0.0000000217, // tonnes N2O per liter (2.17E-05 kg/L)
        unit: "liters",
        source: "GHG Inventory Toolkit 2024",
        description: "Natural gas combustion",
      },
      heating_oil: {
        co2: 0.00294, // tonnes CO2 per liter (Residual Fuel Oil from toolkit)
        ch4: 0.00000038, // tonnes CH4 per liter (3.80E-04 kg/L)
        n2o: 0.0000000228, // tonnes N2O per liter (2.28E-05 kg/L)
        unit: "liters",
        source: "GHG Inventory Toolkit 2024",
        description: "Residual fuel oil combustion",
      },
      propane: {
        co2: 0.0015, // tonnes CO2 per kg (LPG)
        ch4: 0.00000007, // tonnes CH4 per kg (estimated from gallon conversion)
        n2o: 0.000000016, // tonnes N2O per kg (estimated from gallon conversion)
        unit: "kg",
        source: "GHG Inventory Toolkit 2024",
        description: "Liquefied Petroleum Gas (LPG) combustion",
      },
      diesel: {
        co2: 0.00268, // tonnes CO2 per liter (2.68 kg/L from toolkit)
        ch4: 0.000000361, // tonnes CH4 per liter (3.61E-04 kg/L)
        n2o: 0.0000000217, // tonnes N2O per liter (2.17E-05 kg/L)
        unit: "liters",
        source: "GHG Inventory Toolkit 2024",
        description: "Diesel fuel combustion",
      },
      gasoline: {
        co2: 0.00227, // tonnes CO2 per liter (2.27 kg/L from toolkit)
        ch4: 0.000000328, // tonnes CH4 per liter (3.28E-04 kg/L)
        n2o: 0.0000000197, // tonnes N2O per liter (1.97E-05 kg/L)
        unit: "liters",
        source: "GHG Inventory Toolkit 2024",
        description: "Motor gasoline combustion",
      },
    },

    // Refrigerant GWP (Global Warming Potential)
    refrigerants: {
      R_410A: {
        gwp: 2088,
        factor: 0.002088, // tCO2e per kg (GWP / 1000)
        unit: "kg",
        source: "IPCC AR5",
        description: "R-410A refrigerant",
      },
      R_134a: {
        gwp: 1430,
        factor: 0.00143,
        unit: "kg",
        source: "IPCC AR5",
        description: "R-134a refrigerant",
      },
      R_32: {
        gwp: 675,
        factor: 0.000675,
        unit: "kg",
        source: "IPCC AR5",
        description: "R-32 refrigerant",
      },
      R_404A: {
        gwp: 3922,
        factor: 0.003922,
        unit: "kg",
        source: "IPCC AR5",
        description: "R-404A refrigerant",
      },
    },
  },

  // SCOPE 2 - Indirect Emissions (Electricity)
  // Source: GHG Inventory Toolkit (Page 15)
  scope2: {
    electricity: {
      // Philippine electricity grid factors
      ph_grid_average: {
        co2: 0.000712, // tonnes CO2 per kWh (Luzon-Visayas Simple OM)
        ch4: 0.00000000936, // tonnes CH4 per kWh (9.36E-06 kg/kWh)
        n2o: 0.00000000713, // tonnes N2O per kWh (7.13E-06 kg/kWh)
        unit: "kwh",
        source: "GHG Inventory Toolkit 2024",
        description: "Philippine grid average emission factor (Luzon-Visayas)",
      },
      luzon_grid: {
        co2: 0.000712, // tonnes CO2 per kWh (Simple Operating Margin)
        ch4: 0.00000000936, // tonnes CH4 per kWh
        n2o: 0.00000000713, // tonnes N2O per kWh
        unit: "kwh",
        source: "GHG Inventory Toolkit 2024",
        description: "Luzon-Visayas grid emission factor",
      },
      visayas_grid: {
        co2: 0.000712, // tonnes CO2 per kWh (Same as Luzon-Visayas)
        ch4: 0.00000000936, // tonnes CH4 per kWh
        n2o: 0.00000000713, // tonnes N2O per kWh
        unit: "kwh",
        source: "GHG Inventory Toolkit 2024",
        description: "Visayas grid emission factor",
      },
      mindanao_grid: {
        co2: 0.00078, // tonnes CO2 per kWh (7.80E-01 kg/kWh from toolkit)
        ch4: 0.00000000936, // tonnes CH4 per kWh
        n2o: 0.00000000713, // tonnes N2O per kWh
        unit: "kwh",
        source: "GHG Inventory Toolkit 2024",
        description: "Mindanao grid emission factor (Simple Operating Margin)",
      },
    },
  },

  // SCOPE 3 - Other Indirect Emissions
  // Source: GHG Inventory Toolkit (Page 15)
  scope3: {
    commuting: {
      // Transport mode emission factors
      car: {
        co2: 0.000212, // tonnes CO2 per km (2.12E-01 kg/km from toolkit)
        ch4: 0.0000000145, // tonnes CH4 per km (1.45E-05 kg/km)
        n2o: 0.000000005, // tonnes N2O per km (5.00E-06 kg/km)
        unit: "km",
        source: "GHG Inventory Toolkit 2024",
        description: "Average passenger car (sedan/hatchback/SUV)",
      },
      motorcycle: {
        co2: 0.000117, // tonnes CO2 per km (1.17E-01 kg/km from toolkit)
        ch4: 0.000000113, // tonnes CH4 per km (1.13E-04 kg/km)
        n2o: 0.0000000113, // tonnes N2O per km (1.13E-05 kg/km)
        unit: "km",
        source: "GHG Inventory Toolkit 2024",
        description: "Motorcycle",
      },
      bus: {
        co2: 0.000288, // tonnes CO2 per km (2.88E-01 kg/km from toolkit)
        ch4: 0.0000000075, // tonnes CH4 per km (7.50E-06 kg/km)
        n2o: 0.0000000062, // tonnes N2O per km (6.20E-06 kg/km)
        unit: "km",
        source: "GHG Inventory Toolkit 2024",
        description: "Public bus",
      },
      jeepney: {
        co2: 0.000288, // tonnes CO2 per km (2.88E-01 kg/km from toolkit)
        ch4: 0.0000000075, // tonnes CH4 per km (7.50E-06 kg/km)
        n2o: 0.0000000062, // tonnes N2O per km (6.20E-06 kg/km)
        unit: "km",
        source: "GHG Inventory Toolkit 2024",
        description: "Philippine jeepney",
      },
      train: {
        co2: 0, // Zero emissions (not in toolkit, assuming electric)
        ch4: 0,
        n2o: 0,
        unit: "km",
        source: "GHG Inventory Toolkit 2024",
        description: "Rail/metro transit (electric)",
      },
      bicycle: {
        co2: 0, // Zero emissions
        ch4: 0,
        n2o: 0,
        unit: "km",
        source: "GHG Inventory Toolkit 2024",
        description: "Bicycle (zero emissions)",
      },
      walking: {
        co2: 0, // Zero emissions
        ch4: 0,
        n2o: 0,
        unit: "km",
        source: "GHG Inventory Toolkit 2024",
        description: "Walking (zero emissions)",
      },
    },
  },
} as const;

/**
 * Get emission factor for fuel type (total CO2e)
 */
export function getFuelEmissionFactor(fuelType: string): number {
  const fuel = EMISSION_FACTORS.scope1.fuels[fuelType as keyof typeof EMISSION_FACTORS.scope1.fuels];
  return fuel?.factor || 0;
}

/**
 * Get individual gas emission factors for fuel type
 */
export function getFuelGasEmissions(fuelType: string, quantity: number): { co2: number; ch4: number; n2o: number; co2e: number } {
  const fuel = EMISSION_FACTORS.scope1.fuels[fuelType as keyof typeof EMISSION_FACTORS.scope1.fuels];
  if (!fuel) {
    return { co2: 0, ch4: 0, n2o: 0, co2e: 0 };
  }

  const co2 = quantity * (fuel.co2 || 0);
  const ch4 = quantity * (fuel.ch4 || 0);
  const n2o = quantity * (fuel.n2o || 0);

  // Convert to CO2e using GWP values (CH4 = 25, N2O = 298)
  const co2e = co2 + (ch4 * 25) + (n2o * 298);

  return { co2, ch4, n2o, co2e };
}

/**
 * Get emission factor for refrigerant type
 */
export function getRefrigerantEmissionFactor(refrigerantType: string): number {
  const refrigerant = EMISSION_FACTORS.scope1.refrigerants[refrigerantType as keyof typeof EMISSION_FACTORS.scope1.refrigerants];
  return refrigerant?.factor || 0;
}

/**
 * Get individual gas emission factors for electricity
 */
export function getElectricityGasEmissions(kwhConsumption: number, grid: string = "ph_grid_average"): { co2: number; ch4: number; n2o: number; co2e: number } {
  const electricity = EMISSION_FACTORS.scope2.electricity[grid as keyof typeof EMISSION_FACTORS.scope2.electricity];
  if (!electricity) {
    return { co2: 0, ch4: 0, n2o: 0, co2e: 0 };
  }

  const co2 = kwhConsumption * (electricity.co2 || 0);
  const ch4 = kwhConsumption * (electricity.ch4 || 0);
  const n2o = kwhConsumption * (electricity.n2o || 0);

  // Convert to CO2e using GWP values (CH4 = 25, N2O = 298)
  const co2e = co2 + (ch4 * 25) + (n2o * 298);

  return { co2, ch4, n2o, co2e };
}

/**
 * Get emission factor for electricity (default: PH grid average)
 * @deprecated Use getElectricityGasEmissions for separate gas emissions
 */
export function getElectricityEmissionFactor(grid: string = "ph_grid_average"): number {
  const result = getElectricityGasEmissions(1, grid);
  return result.co2e;
}

/**
 * Get individual gas emission factors for transport mode
 */
export function getTransportGasEmissions(transportMode: string, distanceKm: number): { co2: number; ch4: number; n2o: number; co2e: number } {
  const transport = EMISSION_FACTORS.scope3.commuting[transportMode as keyof typeof EMISSION_FACTORS.scope3.commuting];
  if (!transport) {
    return { co2: 0, ch4: 0, n2o: 0, co2e: 0 };
  }

  const co2 = distanceKm * (transport.co2 || 0);
  const ch4 = distanceKm * (transport.ch4 || 0);
  const n2o = distanceKm * (transport.n2o || 0);

  // Convert to CO2e using GWP values (CH4 = 25, N2O = 298)
  const co2e = co2 + (ch4 * 25) + (n2o * 298);

  return { co2, ch4, n2o, co2e };
}

/**
 * Get emission factor for transport mode
 * @deprecated Use getTransportGasEmissions for separate gas emissions
 */
export function getTransportEmissionFactor(transportMode: string): number {
  const result = getTransportGasEmissions(transportMode, 1);
  return result.co2e;
}

/**
 * Type definitions for emission factors
 */
export type FuelType = keyof typeof EMISSION_FACTORS.scope1.fuels;
export type RefrigerantType = keyof typeof EMISSION_FACTORS.scope1.refrigerants;
export type ElectricityGrid = keyof typeof EMISSION_FACTORS.scope2.electricity;
export type TransportMode = keyof typeof EMISSION_FACTORS.scope3.commuting;
