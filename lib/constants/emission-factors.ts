/**
 * Emission Factors for GHG Calculations
 * Sources: EPA, Philippine Department of Energy 2024
 * Units: tCO2e (tonnes of CO2 equivalent)
 */

export const EMISSION_FACTORS = {
  // SCOPE 1 - Direct Emissions
  scope1: {
    // Fuel combustion factors
    fuels: {
      natural_gas: {
        factor: 0.0021, // tCO2e per cubic meter
        unit: "cubic_meters",
        source: "EPA",
        description: "Natural gas combustion",
      },
      heating_oil: {
        factor: 0.00274, // tCO2e per liter
        unit: "liters",
        source: "EPA",
        description: "Heating oil combustion",
      },
      propane: {
        factor: 0.00163, // tCO2e per kg
        unit: "kg",
        source: "EPA",
        description: "Propane (LPG) combustion",
      },
      diesel: {
        factor: 0.00269, // tCO2e per liter
        unit: "liters",
        source: "EPA",
        description: "Diesel fuel combustion",
      },
      gasoline: {
        factor: 0.00233, // tCO2e per liter
        unit: "liters",
        source: "EPA",
        description: "Gasoline combustion",
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
  scope2: {
    electricity: {
      // Philippine electricity grid factors
      ph_grid_average: {
        factor: 0.00063, // tCO2e per kWh
        unit: "kwh",
        source: "Philippine Department of Energy 2024",
        description: "Philippine grid average emission factor",
      },
      luzon_grid: {
        factor: 0.00065, // tCO2e per kWh
        unit: "kwh",
        source: "Philippine DOE 2024",
        description: "Luzon grid emission factor",
      },
      visayas_grid: {
        factor: 0.00061, // tCO2e per kWh
        unit: "kwh",
        source: "Philippine DOE 2024",
        description: "Visayas grid emission factor",
      },
      mindanao_grid: {
        factor: 0.00058, // tCO2e per kWh
        unit: "kwh",
        source: "Philippine DOE 2024",
        description: "Mindanao grid emission factor",
      },
    },
  },

  // SCOPE 3 - Other Indirect Emissions
  scope3: {
    commuting: {
      // Transport mode emission factors
      car: {
        factor: 0.00017, // tCO2e per km
        unit: "km",
        source: "EPA",
        description: "Average passenger car",
      },
      motorcycle: {
        factor: 0.0001, // tCO2e per km
        unit: "km",
        source: "EPA",
        description: "Motorcycle",
      },
      bus: {
        factor: 0.00008, // tCO2e per passenger-km
        unit: "km",
        source: "EPA",
        description: "Public bus",
      },
      jeepney: {
        factor: 0.00009, // tCO2e per passenger-km
        unit: "km",
        source: "Philippines Transport Study",
        description: "Philippine jeepney",
      },
      train: {
        factor: 0.00004, // tCO2e per passenger-km
        unit: "km",
        source: "EPA",
        description: "Rail/metro transit",
      },
      bicycle: {
        factor: 0, // Zero emissions
        unit: "km",
        source: "EPA",
        description: "Bicycle (zero emissions)",
      },
      walking: {
        factor: 0, // Zero emissions
        unit: "km",
        source: "EPA",
        description: "Walking (zero emissions)",
      },
    },
  },
} as const;

/**
 * Get emission factor for fuel type
 */
export function getFuelEmissionFactor(fuelType: string): number {
  const fuel = EMISSION_FACTORS.scope1.fuels[fuelType as keyof typeof EMISSION_FACTORS.scope1.fuels];
  return fuel?.factor || 0;
}

/**
 * Get emission factor for refrigerant type
 */
export function getRefrigerantEmissionFactor(refrigerantType: string): number {
  const refrigerant = EMISSION_FACTORS.scope1.refrigerants[refrigerantType as keyof typeof EMISSION_FACTORS.scope1.refrigerants];
  return refrigerant?.factor || 0;
}

/**
 * Get emission factor for electricity (default: PH grid average)
 */
export function getElectricityEmissionFactor(grid: string = "ph_grid_average"): number {
  const electricity = EMISSION_FACTORS.scope2.electricity[grid as keyof typeof EMISSION_FACTORS.scope2.electricity];
  return electricity?.factor || EMISSION_FACTORS.scope2.electricity.ph_grid_average.factor;
}

/**
 * Get emission factor for transport mode
 */
export function getTransportEmissionFactor(transportMode: string): number {
  const transport = EMISSION_FACTORS.scope3.commuting[transportMode as keyof typeof EMISSION_FACTORS.scope3.commuting];
  return transport?.factor || 0;
}

/**
 * Type definitions for emission factors
 */
export type FuelType = keyof typeof EMISSION_FACTORS.scope1.fuels;
export type RefrigerantType = keyof typeof EMISSION_FACTORS.scope1.refrigerants;
export type ElectricityGrid = keyof typeof EMISSION_FACTORS.scope2.electricity;
export type TransportMode = keyof typeof EMISSION_FACTORS.scope3.commuting;
