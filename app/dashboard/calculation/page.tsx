"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "./data-table";
import { columns, CombustionData } from "./columns";
import { useState } from "react";

async function getData(): Promise<CombustionData[]> {
  // Placeholder for fetching data from an API or database
  return [
    {
      id: 1,
      sourceDescription: "Single-burner stove",
      fuelState: "Solid",
      fuelType: "Wood",
      fuelConsumption: 500,
      unit: "kg",
      co2Emissions: 1200,
      ch4Emissions: 5,
      n2oEmissions: 2,
      totalEmissions: 1307,
    },
  ];
}

// Content configurations for all scopes
const contentConfigs = {
  // Scope 1 options
  stationary: {
    title: "Scope 1: Direct Emissions: Stationary Combustion",
    subtitle:
      "Enter the following data for each stationary combustion source in the table below.",
    instructions: [
      "Source Description: Provide a brief description of the stationary combustion source (e.g. single-burner stove).",
      "Fuel State: Select the physical state of the fuel used in the stationary combustion source from the dropdown menu.",
      "Fuel type: Select the type of fuel used from the dropdown menu.",
      "Quantity Combusted: Enter the annual amount of fuel combusted for the stationary combustion source.",
      "Units: Select the appropriate unit for the quantity of fuel combusted from the dropdown menu. It may be necessary to convert the unit you have to the unit available in the dropdown menu in some cases.",
    ],
  },
  mobile: {
    title: "Scope 1: Direct Emissions: Mobile Combustion",
    subtitle:
      "Enter the following data for each mobile combustion source in the table below.",
    instructions: [
      "Mobile Description: Provide a brief description of the mobile combustion source (e.g., brand, model, and year, if applicable). ONly include vehicles owned or leased by your organization.",
      "Vehicle Type: Select the category or type of vehicle from the dropdown menu that best matches the source.",
      "Vehicle Year: Enter the model year of the vehicle.",
      "Fuel type: Select the type of fuel used from the dropdown menu.",
      "Fuel Economy: Enter the fuel economy of the vehicle in kilometers per liter. It may be necessary to look up this information online.",
      "Annual Distance Traveled: Enter the annual distance traveled or covered by the vehicle in kilometers.",
    ],
  },
  refrigeration: {
    title: "Scope 1: Direct Emissions: Refrigeration & Air Conditioning",
    subtitle:
      "Enter the following data for each refrigeration and AC equipment in the table below.",
    instructions: [
      "Source Description: Provide a brief description of the refrigeration or air conditioning unit (e.g. brand, model, and/or generic description, if applicable). Ex. Refrigerated pastry display.",
      "Refrigerant Type: Select the type of refrigerant used in the unit from the dropdown menu. You may enter the name or designation of the refrigerant if it is not available from the menu.",
      "GWP: If you selected the refrigerant type from the dropdown menu, this will be automatically filled up. Otherwise, enter the 100-year Global Warming Potential (GWP) of the refrigerant. It may be necessary to look up this information online.",
      "New Unit Charge (kg): Enter the amount of refrigerant charged into new units in kilograms.",
      "Operating Units (kg): Enter the amount of refrigerant currently in operating units in kilograms.",
      "Disposed Units (kg): Enter the amount of refrigerant recovered from disposed units in kilograms.",
      "Time Since Last Recharge (years): Enter the time in years since the unit was last charged.",
    ],
  },
  scope2: {
    title: "Scope 2: Indirect Emissions: Purchased Electricity",
    subtitle:
      "Select the appropriate Electrical Grid to which your organization is connected to from the dropdown menu and then select the emission factor you need to use. You may also choose to select 'Custom' for the Electrical Grid if you wish to use your own emission factors. Enter the following data for each electrical equipment in the table below.",
    instructions: [
      "Source Description: Provide a brief description of the electrical equipment (e.g., brand, model, and/or generic description).",
      "Quantity: Enter the quantity of the same electrical equipment present in the organization.",
      "Power Rating: Enter the nameplate power rating of the equipment or the measured power draw of the equipment in watts (i.e., usuing wattmeter).",
      "Monthly Runtime: Enter the amount of time in hours that the equipment is in operation within a month.",
    ],
  },
  scope3: {
    title: "Scope 3: Other Indirect Emissions: Employee Commuting",
    subtitle:
      "Enter the following data for each employee, staff, or personnel in the table below.",
    instructions: [
      "ID: Assign a distinct ID number to each employee.",
      "Notes: This can be used to put certain details or information about the specific employee.",
      "Vehicle Type: Select the category or type of vehicle from the dropdown menu that best matches the source.",
      "Vehicle Year: Enter the model year of the vehicle.",
      "Fuel type: Select the type of fuel used from the dropdown menu.",
      "Distance Covered Daily (km, back and forth): Enter the distance traveled or covered by the employee in kilometers from home to work and vice versa.",
      "Annual Work Days: Enter the number of days within the year when the employee goues to work (e.g., 312).",
    ],
  },
};

export default function Calculation() {
  const [data, setData] = useState<CombustionData[]>([]);
  const [selectedScope1, setSelectedScope1] = useState<
    "stationary" | "mobile" | "refrigeration" | null
  >(null);
  const [selectedScope2, setSelectedScope2] = useState<boolean>(false);
  const [selectedScope3, setSelectedScope3] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get the currently selected option across all scopes
  const getCurrentSelection = (): keyof typeof contentConfigs | null => {
    if (selectedScope1) return selectedScope1;
    if (selectedScope2) return "scope2";
    if (selectedScope3) return "scope3";
    return null;
  };

  // Load data when component mounts or when selection changes
  const loadData = async () => {
    setIsLoading(true);
    try {
      const fetchedData = await getData();
      setData(fetchedData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dropdown selection for Scope 1
  const handleScope1Selection = (
    option: "stationary" | "mobile" | "refrigeration"
  ) => {
    setSelectedScope1(option);
    setSelectedScope2(false); // Clear other scopes
    setSelectedScope3(false);
    loadData();
  };

  // Handle button click for Scope 2
  const handleScope2Click = () => {
    setSelectedScope2(true);
    setSelectedScope1(null); // Clear other scopes
    setSelectedScope3(false);
    loadData();
  };

  // Handle button click for Scope 3
  const handleScope3Click = () => {
    setSelectedScope3(true);
    setSelectedScope1(null); // Clear other scopes
    setSelectedScope2(false);
    loadData();
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Data Calculation
        </h1>
      </div>

      <div>
        <div className="flex justify-center">
          <h1 className="text-xl font-bold text-[#A4C246]">
            Energy Auditing Tool
          </h1>
        </div>

        <div className="flex justify-center mt-4 gap-3.5">
          {/* Scope 1 Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={selectedScope1 ? "default" : "outline"}>
                Scope 1
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[220px]">
              <DropdownMenuItem
                onClick={() => handleScope1Selection("stationary")}
              >
                Stationary Combustion
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleScope1Selection("mobile")}>
                Mobile Combustion
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleScope1Selection("refrigeration")}
              >
                Refrigeration & Air Conditioning
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Scope 2 Button */}
          <Button
            variant={selectedScope2 ? "default" : "outline"}
            onClick={handleScope2Click}
          >
            Scope 2
          </Button>

          {/* Scope 3 Button */}
          <Button
            variant={selectedScope3 ? "default" : "outline"}
            onClick={handleScope3Click}
          >
            Scope 3
          </Button>
        </div>

        {/* Dynamic Content Section */}
        {getCurrentSelection() && (
          <div className="mt-8 p-4">
            <div>
              <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                {contentConfigs[getCurrentSelection()!].title}
              </h1>
              <div>
                <h2 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                  {contentConfigs[getCurrentSelection()!].subtitle}
                </h2>
                <div className="space-y-3">
                  {contentConfigs[getCurrentSelection()!].instructions.map(
                    (instruction, index) => (
                      <p
                        key={index}
                        className="text-gray-600 dark:text-gray-400 leading-relaxed"
                      >
                        {instruction}
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Table Section */}
        {getCurrentSelection() && (
          <div className="mt-6 px-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-600 dark:text-gray-400">
                  Loading...
                </div>
              </div>
            ) : (
              <DataTable columns={columns} data={data} />
            )}
          </div>
        )}

        {/* Add Record Button */}
        {getCurrentSelection() && (
          <div className="mt-6 px-4">
            <Button onClick={loadData} disabled={isLoading}>
              {isLoading ? "Loading..." : "Add Record"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
