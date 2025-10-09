"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "./data-table";
import {
  getColumnsForScope,
  getSampleDataForScope,
  EmissionData,
  Scope1StationaryData,
  Scope1MobileData,
  Scope1RefrigerationData,
  Scope2Data,
  Scope3Data,
} from "./columns";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

// Content configurations for all scopes
const contentConfigs = {
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
      "Mobile Description: Provide a brief description of the mobile combustion source (e.g., brand, model, and year, if applicable). Only include vehicles owned or leased by your organization.",
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
      "Power Rating: Enter the nameplate power rating of the equipment or the measured power draw of the equipment in watts (i.e., using wattmeter).",
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
      "Annual Work Days: Enter the number of days within the year when the employee goes to work (e.g., 312).",
    ],
  },
};

export default function Calculation() {
  const [data, setData] = useState<EmissionData[]>([]);
  const [currentScope, setCurrentScope] = useState<string>("stationary");
  
  useEffect(() => {
    // Load initial data for the default scope
    loadData("stationary");
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Load data based on the current scope selection
  const loadData = async (scopeSelection: string) => {
    setIsLoading(true);
    try {
      const fetchedData = getSampleDataForScope(scopeSelection);
      setData(fetchedData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle scope selection
  const handleScopeSelection = (scope: string) => {
    setCurrentScope(scope);
    loadData(scope);
  };

  // Handle opening add record modal
  const handleAddRecord = () => {
    setFormData({});
    setIsModalOpen(true);
  };

  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!currentScope) return;

    // Generate new ID
    const newId = data.length > 0 ? Math.max(...data.map((d) => d.id)) + 1 : 1;

    // Create new record based on scope
    let newRecord: EmissionData;

    switch (currentScope) {
      case "stationary":
        newRecord = {
          id: newId,
          sourceDescription: formData.sourceDescription || "",
          fuelState: (formData.fuelState as "Solid" | "Liquid" | "Gas") || "Solid",
          fuelType: formData.fuelType || "",
          fuelConsumption: parseFloat(formData.fuelConsumption) || 0,
          unit: formData.unit || "",
          co2Emissions: parseFloat(formData.co2Emissions) || 0,
          ch4Emissions: parseFloat(formData.ch4Emissions) || 0,
          n2oEmissions: parseFloat(formData.n2oEmissions) || 0,
          totalEmissions: parseFloat(formData.totalEmissions) || 0,
        } as Scope1StationaryData;
        break;

      case "mobile":
        newRecord = {
          id: newId,
          vehicleDescription: formData.vehicleDescription || "",
          fuelState: (formData.fuelState as "Solid" | "Liquid" | "Gas") || "Liquid",
          fuelType: formData.fuelType || "",
          fuelConsumption: parseFloat(formData.fuelConsumption) || 0,
          unit: formData.unit || "",
          co2Emissions: parseFloat(formData.co2Emissions) || 0,
          ch4Emissions: parseFloat(formData.ch4Emissions) || 0,
          n2oEmissions: parseFloat(formData.n2oEmissions) || 0,
          totalEmissions: parseFloat(formData.totalEmissions) || 0,
        } as Scope1MobileData;
        break;

      case "refrigeration":
        newRecord = {
          id: newId,
          equipmentDescription: formData.equipmentDescription || "",
          refrigerantType: formData.refrigerantType || "",
          equipmentCapacity: parseFloat(formData.equipmentCapacity) || 0,
          refrigerantLeakage: parseFloat(formData.refrigerantLeakage) || 0,
          unit: formData.unit || "",
          co2Emissions: parseFloat(formData.co2Emissions) || 0,
          totalEmissions: parseFloat(formData.totalEmissions) || 0,
        } as Scope1RefrigerationData;
        break;

      case "scope2":
        newRecord = {
          id: newId,
          energySourceDescription: formData.energySourceDescription || "",
          energyType: (formData.energyType as "Electricity" | "Steam" | "Heating" | "Cooling") || "Electricity",
          energyConsumption: parseFloat(formData.energyConsumption) || 0,
          unit: formData.unit || "",
          gridFactor: parseFloat(formData.gridFactor) || 0,
          renewableCertificates: formData.renewableCertificates || "None",
          co2Emissions: parseFloat(formData.co2Emissions) || 0,
          totalEmissions: parseFloat(formData.totalEmissions) || 0,
        } as Scope2Data;
        break;

      case "scope3":
        newRecord = {
          id: newId,
          activityDescription: formData.activityDescription || "",
          activityCategory: formData.activityCategory || "",
          activityData: parseFloat(formData.activityData) || 0,
          unit: formData.unit || "",
          emissionFactor: parseFloat(formData.emissionFactor) || 0,
          dataQuality: (formData.dataQuality as "High" | "Medium" | "Low") || "Medium",
          co2Emissions: parseFloat(formData.co2Emissions) || 0,
          totalEmissions: parseFloat(formData.totalEmissions) || 0,
        } as Scope3Data;
        break;

      default:
        return;
    }

    setData((prev) => [...prev, newRecord]);
    setIsModalOpen(false);
    setFormData({});
  };

  // Render form fields based on current scope
  const renderFormFields = () => {
    if (!currentScope) return null;

    const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";
    const labelClass = "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300";

    switch (currentScope) {
      case "stationary":
        return (
          <div className="grid gap-4">
            <div>
              <label htmlFor="sourceDescription" className={labelClass}>Source Description</label>
              <input
                id="sourceDescription"
                type="text"
                value={formData.sourceDescription || ""}
                onChange={(e) => handleFieldChange("sourceDescription", e.target.value)}
                placeholder="e.g., Single-burner stove"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="fuelState" className={labelClass}>Fuel State</label>
              <select
                id="fuelState"
                value={formData.fuelState || ""}
                onChange={(e) => handleFieldChange("fuelState", e.target.value)}
                className={inputClass}
              >
                <option value="">Select fuel state</option>
                <option value="Solid">Solid</option>
                <option value="Liquid">Liquid</option>
                <option value="Gas">Gas</option>
              </select>
            </div>
            <div>
              <label htmlFor="fuelType" className={labelClass}>Fuel Type</label>
              <input
                id="fuelType"
                type="text"
                value={formData.fuelType || ""}
                onChange={(e) => handleFieldChange("fuelType", e.target.value)}
                placeholder="e.g., Wood, Coal"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="fuelConsumption" className={labelClass}>Quantity Combusted</label>
              <input
                id="fuelConsumption"
                type="number"
                value={formData.fuelConsumption || ""}
                onChange={(e) => handleFieldChange("fuelConsumption", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="unit" className={labelClass}>Unit</label>
              <input
                id="unit"
                type="text"
                value={formData.unit || ""}
                onChange={(e) => handleFieldChange("unit", e.target.value)}
                placeholder="e.g., kg, L"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="co2Emissions" className={labelClass}>CO2 Emissions (kg)</label>
              <input
                id="co2Emissions"
                type="number"
                value={formData.co2Emissions || ""}
                onChange={(e) => handleFieldChange("co2Emissions", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ch4Emissions" className={labelClass}>CH4 Emissions (kg)</label>
              <input
                id="ch4Emissions"
                type="number"
                value={formData.ch4Emissions || ""}
                onChange={(e) => handleFieldChange("ch4Emissions", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="n2oEmissions" className={labelClass}>N2O Emissions (kg)</label>
              <input
                id="n2oEmissions"
                type="number"
                value={formData.n2oEmissions || ""}
                onChange={(e) => handleFieldChange("n2oEmissions", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="totalEmissions" className={labelClass}>Total Emissions (kg CO2e)</label>
              <input
                id="totalEmissions"
                type="number"
                value={formData.totalEmissions || ""}
                onChange={(e) => handleFieldChange("totalEmissions", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        );

      case "mobile":
        return (
          <div className="grid gap-4">
            <div>
              <label htmlFor="vehicleDescription" className={labelClass}>Vehicle Description</label>
              <input
                id="vehicleDescription"
                type="text"
                value={formData.vehicleDescription || ""}
                onChange={(e) => handleFieldChange("vehicleDescription", e.target.value)}
                placeholder="e.g., Company car"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="fuelState" className={labelClass}>Fuel State</label>
              <select
                id="fuelState"
                value={formData.fuelState || ""}
                onChange={(e) => handleFieldChange("fuelState", e.target.value)}
                className={inputClass}
              >
                <option value="">Select fuel state</option>
                <option value="Solid">Solid</option>
                <option value="Liquid">Liquid</option>
                <option value="Gas">Gas</option>
              </select>
            </div>
            <div>
              <label htmlFor="fuelType" className={labelClass}>Fuel Type</label>
              <input
                id="fuelType"
                type="text"
                value={formData.fuelType || ""}
                onChange={(e) => handleFieldChange("fuelType", e.target.value)}
                placeholder="e.g., Gasoline"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="fuelConsumption" className={labelClass}>Fuel Consumed</label>
              <input
                id="fuelConsumption"
                type="number"
                value={formData.fuelConsumption || ""}
                onChange={(e) => handleFieldChange("fuelConsumption", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="unit" className={labelClass}>Unit</label>
              <input
                id="unit"
                type="text"
                value={formData.unit || ""}
                onChange={(e) => handleFieldChange("unit", e.target.value)}
                placeholder="e.g., L"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="co2Emissions" className={labelClass}>CO2 Emissions (kg)</label>
              <input
                id="co2Emissions"
                type="number"
                value={formData.co2Emissions || ""}
                onChange={(e) => handleFieldChange("co2Emissions", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="ch4Emissions" className={labelClass}>CH4 Emissions (kg)</label>
              <input
                id="ch4Emissions"
                type="number"
                value={formData.ch4Emissions || ""}
                onChange={(e) => handleFieldChange("ch4Emissions", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="n2oEmissions" className={labelClass}>N2O Emissions (kg)</label>
              <input
                id="n2oEmissions"
                type="number"
                value={formData.n2oEmissions || ""}
                onChange={(e) => handleFieldChange("n2oEmissions", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="totalEmissions" className={labelClass}>Total Emissions (kg CO2e)</label>
              <input
                id="totalEmissions"
                type="number"
                value={formData.totalEmissions || ""}
                onChange={(e) => handleFieldChange("totalEmissions", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        );

      case "refrigeration":
        return (
          <div className="grid gap-4">
            <div>
              <label htmlFor="equipmentDescription" className={labelClass}>Equipment Description</label>
              <input
                id="equipmentDescription"
                type="text"
                value={formData.equipmentDescription || ""}
                onChange={(e) => handleFieldChange("equipmentDescription", e.target.value)}
                placeholder="e.g., Office AC unit"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="refrigerantType" className={labelClass}>Refrigerant Type</label>
              <input
                id="refrigerantType"
                type="text"
                value={formData.refrigerantType || ""}
                onChange={(e) => handleFieldChange("refrigerantType", e.target.value)}
                placeholder="e.g., R-410A"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="equipmentCapacity" className={labelClass}>Equipment Capacity</label>
              <input
                id="equipmentCapacity"
                type="number"
                value={formData.equipmentCapacity || ""}
                onChange={(e) => handleFieldChange("equipmentCapacity", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="refrigerantLeakage" className={labelClass}>Refrigerant Leakage</label>
              <input
                id="refrigerantLeakage"
                type="number"
                value={formData.refrigerantLeakage || ""}
                onChange={(e) => handleFieldChange("refrigerantLeakage", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="unit" className={labelClass}>Unit</label>
              <input
                id="unit"
                type="text"
                value={formData.unit || ""}
                onChange={(e) => handleFieldChange("unit", e.target.value)}
                placeholder="e.g., kg"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="co2Emissions" className={labelClass}>CO2 Equivalent (kg)</label>
              <input
                id="co2Emissions"
                type="number"
                value={formData.co2Emissions || ""}
                onChange={(e) => handleFieldChange("co2Emissions", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="totalEmissions" className={labelClass}>Total Emissions (kg CO2e)</label>
              <input
                id="totalEmissions"
                type="number"
                value={formData.totalEmissions || ""}
                onChange={(e) => handleFieldChange("totalEmissions", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        );

      case "scope2":
        return (
          <div className="grid gap-4">
            <div>
              <label htmlFor="energySourceDescription" className={labelClass}>Energy Source Description</label>
              <input
                id="energySourceDescription"
                type="text"
                value={formData.energySourceDescription || ""}
                onChange={(e) => handleFieldChange("energySourceDescription", e.target.value)}
                placeholder="e.g., Main office"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="energyType" className={labelClass}>Energy Type</label>
              <select
                id="energyType"
                value={formData.energyType || ""}
                onChange={(e) => handleFieldChange("energyType", e.target.value)}
                className={inputClass}
              >
                <option value="">Select energy type</option>
                <option value="Electricity">Electricity</option>
                <option value="Steam">Steam</option>
                <option value="Heating">Heating</option>
                <option value="Cooling">Cooling</option>
              </select>
            </div>
            <div>
              <label htmlFor="energyConsumption" className={labelClass}>Energy Consumption</label>
              <input
                id="energyConsumption"
                type="number"
                value={formData.energyConsumption || ""}
                onChange={(e) => handleFieldChange("energyConsumption", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="unit" className={labelClass}>Unit</label>
              <input
                id="unit"
                type="text"
                value={formData.unit || ""}
                onChange={(e) => handleFieldChange("unit", e.target.value)}
                placeholder="e.g., kWh"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="gridFactor" className={labelClass}>Grid/Supplier Factor</label>
              <input
                id="gridFactor"
                type="number"
                step="0.01"
                value={formData.gridFactor || ""}
                onChange={(e) => handleFieldChange("gridFactor", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="renewableCertificates" className={labelClass}>Renewable Certificates</label>
              <input
                id="renewableCertificates"
                type="text"
                value={formData.renewableCertificates || ""}
                onChange={(e) => handleFieldChange("renewableCertificates", e.target.value)}
                placeholder="e.g., None"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="co2Emissions" className={labelClass}>CO2 Emissions (kg)</label>
              <input
                id="co2Emissions"
                type="number"
                value={formData.co2Emissions || ""}
                onChange={(e) => handleFieldChange("co2Emissions", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="totalEmissions" className={labelClass}>Total Emissions (kg CO2e)</label>
              <input
                id="totalEmissions"
                type="number"
                value={formData.totalEmissions || ""}
                onChange={(e) => handleFieldChange("totalEmissions", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        );

      case "scope3":
        return (
          <div className="grid gap-4">
            <div>
              <label htmlFor="activityDescription" className={labelClass}>Activity Description</label>
              <input
                id="activityDescription"
                type="text"
                value={formData.activityDescription || ""}
                onChange={(e) => handleFieldChange("activityDescription", e.target.value)}
                placeholder="e.g., Business travel"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="activityCategory" className={labelClass}>Activity Category</label>
              <input
                id="activityCategory"
                type="text"
                value={formData.activityCategory || ""}
                onChange={(e) => handleFieldChange("activityCategory", e.target.value)}
                placeholder="e.g., Business Travel"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="activityData" className={labelClass}>Activity Data</label>
              <input
                id="activityData"
                type="number"
                value={formData.activityData || ""}
                onChange={(e) => handleFieldChange("activityData", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="unit" className={labelClass}>Unit</label>
              <input
                id="unit"
                type="text"
                value={formData.unit || ""}
                onChange={(e) => handleFieldChange("unit", e.target.value)}
                placeholder="e.g., km"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="emissionFactor" className={labelClass}>Emission Factor</label>
              <input
                id="emissionFactor"
                type="number"
                step="0.001"
                value={formData.emissionFactor || ""}
                onChange={(e) => handleFieldChange("emissionFactor", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="dataQuality" className={labelClass}>Data Quality</label>
              <select
                id="dataQuality"
                value={formData.dataQuality || ""}
                onChange={(e) => handleFieldChange("dataQuality", e.target.value)}
                className={inputClass}
              >
                <option value="">Select quality</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label htmlFor="co2Emissions" className={labelClass}>CO2 Emissions (kg)</label>
              <input
                id="co2Emissions"
                type="number"
                value={formData.co2Emissions || ""}
                onChange={(e) => handleFieldChange("co2Emissions", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="totalEmissions" className={labelClass}>Total Emissions (kg CO2e)</label>
              <input
                id="totalEmissions"
                type="number"
                value={formData.totalEmissions || ""}
                onChange={(e) => handleFieldChange("totalEmissions", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={
                  ["stationary", "mobile", "refrigeration"].includes(
                    currentScope || ""
                  )
                    ? "default"
                    : "outline"
                }
              >
                Scope 1
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[220px]">
              <DropdownMenuItem
                onClick={() => handleScopeSelection("stationary")}
              >
                Stationary Combustion
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleScopeSelection("mobile")}>
                Mobile Combustion
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleScopeSelection("refrigeration")}
              >
                Refrigeration & Air Conditioning
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={currentScope === "scope2" ? "default" : "outline"}
            onClick={() => handleScopeSelection("scope2")}
          >
            Scope 2
          </Button>

          <Button
            variant={currentScope === "scope3" ? "default" : "outline"}
            onClick={() => handleScopeSelection("scope3")}
          >
            Scope 3
          </Button>
        </div>

        {currentScope && (
          <div className="mt-8 p-4">
            <div>
              <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                {contentConfigs[currentScope as keyof typeof contentConfigs].title}
              </h1>
              <div>
                <h2 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                  {contentConfigs[currentScope as keyof typeof contentConfigs].subtitle}
                </h2>
                <div className="space-y-3">
                  {contentConfigs[currentScope as keyof typeof contentConfigs].instructions.map(
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

        {currentScope && (
          <div className="mt-6 px-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-600 dark:text-gray-400">
                  Loading...
                </div>
              </div>
            ) : (
              <DataTable
                columns={getColumnsForScope(currentScope) as ColumnDef<EmissionData>[]}
                data={data}
                searchPlaceholder={`Search ${currentScope} data...`}
              />
            )}
          </div>
        )}

        {currentScope && (
          <div className="mt-6 px-4">
            <Button onClick={handleAddRecord} disabled={isLoading}>
              Add Record
            </Button>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col m-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Add New Record
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {currentScope && contentConfigs[currentScope as keyof typeof contentConfigs].title}
                  </p>
                </div>
                <Button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {renderFormFields()}
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  Add Record
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}