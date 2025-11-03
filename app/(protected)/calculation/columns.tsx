"use client"

import { ColumnDef } from "@tanstack/react-table";

// Base data types for different scopes
export type Scope1StationaryData = {
  id: string | number;
  sourceDescription: string;
  fuelState: "Solid" | "Liquid" | "Gas";
  fuelType: string;
  fuelConsumption: number;
  unit: string;
  co2Emissions: number;
  ch4Emissions: number;
  n2oEmissions: number;
  totalEmissions: number;
}

export type Scope1MobileData = {
  id: string | number;
  vehicleDescription: string;
  fuelState: "Solid" | "Liquid" | "Gas";
  fuelType: string;
  fuelConsumption: number;
  unit: string;
  co2Emissions: number;
  ch4Emissions: number;
  n2oEmissions: number;
  totalEmissions: number;
}

export type Scope1RefrigerationData = {
  id: string | number;
  equipmentDescription: string;
  refrigerantType: string;
  equipmentCapacity: number;
  refrigerantLeakage: number;
  unit: string;
  co2Emissions: number;
  totalEmissions: number;
}

export type Scope2Data = {
  id: string | number;
  energySourceDescription: string;
  energyType: "Electricity" | "Steam" | "Heating" | "Cooling";
  energyConsumption: number;
  unit: string;
  gridFactor: number;
  renewableCertificates: string;
  co2Emissions: number;
  totalEmissions: number;
}

export type Scope3Data = {
  id: string | number;
  activityDescription: string;
  activityCategory: string;
  activityData: number;
  unit: string;
  emissionFactor: number;
  dataQuality: "High" | "Medium" | "Low";
  co2Emissions: number;
  totalEmissions: number;
}

// Union type for all possible data types
export type EmissionData = Scope1StationaryData | Scope1MobileData | Scope1RefrigerationData | Scope2Data | Scope3Data;

// Column definitions for Scope 1 - Stationary Combustion
export const scope1StationaryColumns: ColumnDef<Scope1StationaryData>[] = [
  {
    accessorKey: "sourceDescription",
    header: "Source Description",
  },
  {
    accessorKey: "fuelState",
    header: "Fuel State",
  },
  {
    accessorKey: "fuelType",
    header: "Fuel Type",
  },
  {
    accessorKey: "fuelConsumption",
    header: "Quantity Combusted",
  },
  {
    accessorKey: "unit",
    header: "Units",
  },
  {
    accessorKey: "co2Emissions",
    header: "CO2 Emissions (kg)",
  },
  {
    accessorKey: "ch4Emissions",
    header: "CH4 Emissions (kg)",
  },
  {
    accessorKey: "n2oEmissions",
    header: "N2O Emissions (kg)",
  },
  {
    accessorKey: "totalEmissions",
    header: "Total Emissions (kg CO2e)",
  },
]

// Column definitions for Scope 1 - Mobile Combustion
export const scope1MobileColumns: ColumnDef<Scope1MobileData>[] = [
  {
    accessorKey: "vehicleDescription",
    header: "Vehicle Description",
  },
  {
    accessorKey: "fuelState",
    header: "Fuel State",
  },
  {
    accessorKey: "fuelType",
    header: "Fuel Type",
  },
  {
    accessorKey: "fuelConsumption",
    header: "Fuel Consumed",
  },
  {
    accessorKey: "unit",
    header: "Units",
  },
  {
    accessorKey: "co2Emissions",
    header: "CO2 Emissions (kg)",
  },
  {
    accessorKey: "ch4Emissions",
    header: "CH4 Emissions (kg)",
  },
  {
    accessorKey: "n2oEmissions",
    header: "N2O Emissions (kg)",
  },
  {
    accessorKey: "totalEmissions",
    header: "Total Emissions (kg CO2e)",
  },
]

// Column definitions for Scope 1 - Refrigeration
export const scope1RefrigerationColumns: ColumnDef<Scope1RefrigerationData>[] = [
  {
    accessorKey: "equipmentDescription",
    header: "Equipment Description",
  },
  {
    accessorKey: "refrigerantType",
    header: "Refrigerant Type",
  },
  {
    accessorKey: "equipmentCapacity",
    header: "Equipment Capacity",
  },
  {
    accessorKey: "refrigerantLeakage",
    header: "Refrigerant Leakage",
  },
  {
    accessorKey: "unit",
    header: "Units",
  },
  {
    accessorKey: "co2Emissions",
    header: "CO2 Equivalent (kg)",
  },
  {
    accessorKey: "totalEmissions",
    header: "Total Emissions (kg CO2e)",
  },
]

// Column definitions for Scope 2
export const scope2Columns: ColumnDef<Scope2Data>[] = [
  {
    accessorKey: "energySourceDescription",
    header: "Energy Source Description",
  },
  {
    accessorKey: "energyType",
    header: "Energy Type",
  },
  {
    accessorKey: "energyConsumption",
    header: "Energy Consumption",
  },
  {
    accessorKey: "unit",
    header: "Units",
  },
  {
    accessorKey: "gridFactor",
    header: "Grid/Supplier Factor",
  },
  {
    accessorKey: "renewableCertificates",
    header: "Renewable Certificates",
  },
  {
    accessorKey: "co2Emissions",
    header: "CO2 Emissions (kg)",
  },
  {
    accessorKey: "totalEmissions",
    header: "Total Emissions (kg CO2e)",
  },
]

// Column definitions for Scope 3
export const scope3Columns: ColumnDef<Scope3Data>[] = [
  {
    accessorKey: "activityDescription",
    header: "Activity Description",
  },
  {
    accessorKey: "activityCategory",
    header: "Activity Category",
  },
  {
    accessorKey: "activityData",
    header: "Activity Data",
  },
  {
    accessorKey: "unit",
    header: "Units",
  },
  {
    accessorKey: "emissionFactor",
    header: "Emission Factor",
  },
  {
    accessorKey: "dataQuality",
    header: "Data Quality",
  },
  {
    accessorKey: "co2Emissions",
    header: "CO2 Emissions (kg)",
  },
  {
    accessorKey: "totalEmissions",
    header: "Total Emissions (kg CO2e)",
  },
]

// Function to get the appropriate columns based on the current selection
export const getColumnsForScope = (scopeSelection: string | null) => {
  switch (scopeSelection) {
    case 'stationary':
      return scope1StationaryColumns;
    case 'mobile':
      return scope1MobileColumns;
    case 'refrigeration':
      return scope1RefrigerationColumns;
    case 'scope2':
      return scope2Columns;
    case 'scope3':
      return scope3Columns;
    default:
      return scope1StationaryColumns; // Default fallback
  }
};

// Function to get sample data for each scope (for testing/demo purposes)
export const getSampleDataForScope = (scopeSelection: string | null): EmissionData[] => {
  switch (scopeSelection) {
    case 'stationary':
      return [
        {
          id: 1,
          sourceDescription: "Single-burner stove",
          fuelState: "Solid" as const,
          fuelType: "Wood",
          fuelConsumption: 500,
          unit: "kg",
          co2Emissions: 1200,
          ch4Emissions: 5,
          n2oEmissions: 2,
          totalEmissions: 1307,
        }
      ];
    case 'mobile':
      return [
        {
          id: 1,
          vehicleDescription: "Company car",
          fuelState: "Liquid" as const,
          fuelType: "Gasoline",
          fuelConsumption: 2000,
          unit: "L",
          co2Emissions: 4600,
          ch4Emissions: 1,
          n2oEmissions: 0.5,
          totalEmissions: 4620,
        }
      ];
    case 'refrigeration':
      return [
        {
          id: 1,
          equipmentDescription: "Office AC unit",
          refrigerantType: "R-410A",
          equipmentCapacity: 50,
          refrigerantLeakage: 2.5,
          unit: "kg",
          co2Emissions: 5225,
          totalEmissions: 5225,
        }
      ];
    case 'scope2':
      return [
        {
          id: 1,
          energySourceDescription: "Main office building",
          energyType: "Electricity" as const,
          energyConsumption: 50000,
          unit: "kWh",
          gridFactor: 0.5,
          renewableCertificates: "None",
          co2Emissions: 25000,
          totalEmissions: 25000,
        }
      ];
    case 'scope3':
      return [
        {
          id: 1,
          activityDescription: "Business travel - domestic flights",
          activityCategory: "Business Travel",
          activityData: 10000,
          unit: "km",
          emissionFactor: 0.255,
          dataQuality: "High" as const,
          co2Emissions: 2550,
          totalEmissions: 2550,
        }
      ];
    default:
      return [];
  }
};

// Legacy export for backward compatibility
export type CombustionData = Scope1StationaryData;
export const columns = scope1StationaryColumns;