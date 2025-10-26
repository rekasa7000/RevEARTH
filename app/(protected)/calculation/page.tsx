"use client";

import { PageErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "./data-table";
import type { ColumnDef } from "@tanstack/react-table";
import {
  getColumnsForScope,
  EmissionData,
} from "./columns";
import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { useOrganizationCheck } from "@/lib/hooks/use-organization-check";
import {
  getSchemaForScope,
} from "@/lib/validations/emission-forms";
import { useEmissionRecords, useCreateEmissionRecord } from "@/lib/api/queries/emission-records";
import { useFuelUsage, useCreateFuelUsage } from "@/lib/api/queries/fuel-usage";
import { useVehicleUsage, useCreateVehicleUsage } from "@/lib/api/queries/vehicle-usage";
import { useRefrigerantUsage, useCreateRefrigerantUsage } from "@/lib/api/queries/refrigerant-usage";
import { useElectricityUsage, useCreateElectricityUsage } from "@/lib/api/queries/electricity-usage";
import { useCommutingData, useCreateCommutingData } from "@/lib/api/queries/commuting-data";
import { useCalculation, useTriggerCalculation } from "@/lib/api/queries/calculations";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { CalculationSkeleton } from "@/components/skeletons";
import { EmptyState, EmptyStateInline } from "@/components/empty-state";
import { FileX } from "lucide-react";

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

function CalculationContent() {
  // Toast for notifications
  const { toast } = useToast();

  // Organization and emission record state
  const { organization, isLoading: orgLoading } = useOrganizationCheck();
  const [currentEmissionRecordId, setCurrentEmissionRecordId] = useState<string>("");
  const [currentScope, setCurrentScope] = useState<string>("stationary");
  const [isCreateRecordDialogOpen, setIsCreateRecordDialogOpen] = useState(false);
  const [newRecordData, setNewRecordData] = useState({
    reportingPeriodStart: "",
    reportingPeriodEnd: "",
  });

  // Fetch emission records for the organization
  const { data: emissionRecordsData, isLoading: recordsLoading } = useEmissionRecords(
    organization?.id || "",
    1,
    50
  );

  // Create emission record mutation
  const createEmissionRecord = useCreateEmissionRecord();

  // Fetch data based on current scope and emission record
  const { data: fuelData, isLoading: fuelLoading } = useFuelUsage(currentEmissionRecordId);
  const { data: vehicleData, isLoading: vehicleLoading } = useVehicleUsage(currentEmissionRecordId);
  const { data: refrigerantData, isLoading: refrigerantLoading } = useRefrigerantUsage(currentEmissionRecordId);
  const { data: electricityData, isLoading: electricityLoading } = useElectricityUsage(currentEmissionRecordId);
  const { data: commutingData, isLoading: commutingLoading } = useCommutingData(currentEmissionRecordId);

  // Mutation hooks for creating records
  const createFuelUsage = useCreateFuelUsage();
  const createVehicleUsage = useCreateVehicleUsage();
  const createRefrigerantUsage = useCreateRefrigerantUsage();
  const createElectricityUsage = useCreateElectricityUsage();
  const createCommutingData = useCreateCommutingData();

  // Calculation hooks
  const { data: calculation } = useCalculation(currentEmissionRecordId);
  const triggerCalculation = useTriggerCalculation();

  // Select first emission record by default
  useEffect(() => {
    if (emissionRecordsData?.records && emissionRecordsData.records.length > 0 && !currentEmissionRecordId) {
      setCurrentEmissionRecordId(emissionRecordsData.records[0].id);
    }
  }, [emissionRecordsData, currentEmissionRecordId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Get data and loading state based on current scope
  const getCurrentData = (): EmissionData[] => {
    try {
      switch (currentScope) {
        case "stationary":
          // Map FuelUsage to Scope1StationaryData
          if (!fuelData) return [];
          return fuelData.map((fuel) => {
            const metadata = fuel.metadata as Record<string, unknown> | null;
            return {
              id: fuel.id || "",
              sourceDescription: (metadata?.sourceDescription as string) || "N/A",
              fuelState: ((metadata?.fuelState as string) === "Solid" || (metadata?.fuelState as string) === "Gas" ? metadata.fuelState : "Liquid") as "Solid" | "Liquid" | "Gas",
              fuelType: fuel.fuelType || "unknown",
              fuelConsumption: Number(fuel.quantity) || 0,
              unit: fuel.unit || "",
              co2Emissions: Number(fuel.co2eCalculated) || 0,
              ch4Emissions: 0, // Not tracked separately in current backend
              n2oEmissions: 0, // Not tracked separately in current backend
              totalEmissions: Number(fuel.co2eCalculated) || 0,
            };
          }) as EmissionData[];
        case "mobile":
          // Map VehicleUsage to Scope1MobileData
          if (!vehicleData) return [];
          return vehicleData.map((vehicle) => ({
            id: vehicle.id || "",
            vehicleDescription: vehicle.vehicleId || "N/A",
            fuelState: "Liquid" as const, // Default, not tracked in backend
            fuelType: vehicle.fuelType || "unknown",
            fuelConsumption: Number(vehicle.fuelConsumed) || 0,
            unit: vehicle.unit || "",
            co2Emissions: Number(vehicle.co2eCalculated) || 0,
            ch4Emissions: 0, // Not tracked separately in current backend
            n2oEmissions: 0, // Not tracked separately in current backend
            totalEmissions: Number(vehicle.co2eCalculated) || 0,
          })) as EmissionData[];
        case "refrigeration":
          // Map RefrigerantUsage to Scope1RefrigerationData
          if (!refrigerantData) return [];
          return refrigerantData.map((refrigerant) => ({
            id: refrigerant.id || "",
            equipmentDescription: refrigerant.equipmentId || "N/A",
            refrigerantType: refrigerant.refrigerantType || "unknown",
            quantityLeaked: Number(refrigerant.quantityLeaked) || 0,
            quantityPurchased: Number(refrigerant.quantityPurchased) || 0,
            unit: refrigerant.unit || "kg",
            co2Emissions: Number(refrigerant.co2eCalculated) || 0,
            ch4Emissions: 0, // Not tracked separately
            n2oEmissions: 0, // Not tracked separately
            totalEmissions: Number(refrigerant.co2eCalculated) || 0,
          })) as EmissionData[];
        case "scope2":
          // Map ElectricityUsage to Scope2Data
          if (!electricityData) return [];
          return electricityData.map((electricity) => ({
            id: electricity.id || "",
            energySourceDescription: electricity.facility?.name || electricity.meterNumber || "N/A",
            energyType: "Electricity" as const,
            energyConsumption: Number(electricity.kwhConsumption) || 0,
            unit: "kWh",
            gridFactor: 0, // Not tracked in current backend
            renewableCertificates: "N/A",
            co2Emissions: Number(electricity.co2eCalculated) || 0,
            totalEmissions: Number(electricity.co2eCalculated) || 0,
          })) as EmissionData[];
        case "scope3":
          // Map CommutingData to Scope3Data
          if (!commutingData) return [];
          return commutingData.map((commuting) => ({
            id: commuting.id || "",
            activityDescription: `${commuting.transportMode || "Unknown"} commuting (${commuting.employeeCount || 0} employees)`,
            activityCategory: "Employee Commuting",
            activityData: Number(commuting.avgDistanceKm) || 0,
            unit: "km",
            emissionFactor: 0, // Not exposed directly
            dataQuality: "Medium" as const,
            co2Emissions: Number(commuting.co2eCalculated) || 0,
            totalEmissions: Number(commuting.co2eCalculated) || 0,
          })) as EmissionData[];
        default:
          return [];
      }
    } catch (error) {
      console.error("Error mapping data:", error);
      return [];
    }
  };

  const isCurrentLoading = (): boolean => {
    switch (currentScope) {
      case "stationary":
        return fuelLoading;
      case "mobile":
        return vehicleLoading;
      case "refrigeration":
        return refrigerantLoading;
      case "scope2":
        return electricityLoading;
      case "scope3":
        return commutingLoading;
      default:
        return false;
    }
  };

  // Handle scope selection
  const handleScopeSelection = (scope: string) => {
    setCurrentScope(scope);
    // Data will be loaded automatically by query hooks based on currentScope
  };

  // Handle opening add record modal
  const handleAddRecord = () => {
    setFormData({});
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Keyboard shortcut handler for modal
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setIsModalOpen(false);
    }
  };

  // Handle form field changes
  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form data before submission
  const validateForm = (): boolean => {
    const schema = getSchemaForScope(currentScope);
    if (!schema) return true;

    try {
      schema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      const errors: Record<string, string> = {};
      if (error && typeof error === 'object' && 'errors' in error) {
        const zodError = error as { errors: Array<{ path: string[]; message: string }> };
        zodError.errors.forEach((err) => {
          if (err.path && err.path.length > 0) {
            errors[err.path[0]] = err.message;
          }
        });
      }
      setFormErrors(errors);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!currentScope || !currentEmissionRecordId) return;

    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get today's date in ISO format for entryDate
      const today = new Date().toISOString();

      switch (currentScope) {
        case "stationary":
          // Scope 1 - Stationary Combustion (Fuel Usage)
          await createFuelUsage.mutateAsync({
            emissionRecordId: currentEmissionRecordId,
            fuelType: formData.fuelType,
            quantity: parseFloat(formData.fuelConsumption) || 0,
            unit: formData.unit || "L",
            entryDate: today,
            metadata: {
              sourceDescription: formData.sourceDescription || "",
            },
          });
          toast({
            title: "Success",
            description: "Fuel usage record created successfully",
          });
          break;

        case "mobile":
          // Scope 1 - Mobile Combustion (Vehicle Usage)
          await createVehicleUsage.mutateAsync({
            emissionRecordId: currentEmissionRecordId,
            vehicleType: formData.vehicleType,
            fuelType: formData.fuelType,
            fuelConsumed: parseFloat(formData.fuelConsumption),
            mileage: formData.mileage ? parseFloat(formData.mileage) : undefined,
            unit: formData.unit || "L",
            entryDate: today,
            vehicleId: formData.vehicleDescription || undefined,
          });
          toast({
            title: "Success",
            description: "Vehicle usage record created successfully",
          });
          break;

        case "refrigeration":
          // Scope 1 - Refrigeration (Refrigerant Usage)
          await createRefrigerantUsage.mutateAsync({
            emissionRecordId: currentEmissionRecordId,
            equipmentId: formData.equipmentDescription || undefined,
            refrigerantType: formData.refrigerantType,
            quantityLeaked: formData.quantityLeaked ? parseFloat(formData.quantityLeaked) : undefined,
            quantityPurchased: formData.quantityPurchased ? parseFloat(formData.quantityPurchased) : undefined,
            unit: formData.unit || "kg",
            entryDate: today,
          });
          toast({
            title: "Success",
            description: "Refrigerant usage record created successfully",
          });
          break;

        case "scope2":
          // Scope 2 - Electricity Usage
          await createElectricityUsage.mutateAsync({
            emissionRecordId: currentEmissionRecordId,
            kwhConsumption: parseFloat(formData.energyConsumption) || 0,
            billingPeriodStart: today,
            billingPeriodEnd: today,
            facilityId: formData.facilityId || undefined,
            meterNumber: formData.meterNumber || undefined,
          });
          toast({
            title: "Success",
            description: "Electricity usage record created successfully",
          });
          break;

        case "scope3":
          // Scope 3 - Commuting Data
          await createCommutingData.mutateAsync({
            emissionRecordId: currentEmissionRecordId,
            employeeCount: parseInt(formData.employeeCount) || 1,
            avgDistanceKm: parseFloat(formData.activityData),
            transportMode: formData.transportMode,
            daysPerWeek: formData.daysPerWeek ? parseInt(formData.daysPerWeek) : undefined,
            wfhDays: formData.wfhDays ? parseInt(formData.wfhDays) : undefined,
            surveyDate: today,
          });
          toast({
            title: "Success",
            description: "Commuting data record created successfully",
          });
          break;

        default:
          return;
      }

      // Close modal and reset form on success
      setIsModalOpen(false);
      setFormData({});
      setFormErrors({});
    } catch (error) {
      console.error("Failed to create record:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create record. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Handle calculation trigger
  const handleCalculate = async () => {
    if (!currentEmissionRecordId) return;

    try {
      await triggerCalculation.mutateAsync({ emissionRecordId: currentEmissionRecordId });
      toast({
        title: "Success",
        description: "Emissions calculated successfully",
      });
    } catch (error) {
      console.error("Failed to calculate emissions:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to calculate emissions. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Handle creating a new emission record
  const handleCreateEmissionRecord = async () => {
    if (!organization?.id) return;
    if (!newRecordData.reportingPeriodStart || !newRecordData.reportingPeriodEnd) {
      toast({
        title: "Validation Error",
        description: "Please provide both start and end dates",
        variant: "destructive",
      });
      return;
    }

    try {
      await createEmissionRecord.mutateAsync({
        organizationId: organization.id,
        reportingPeriodStart: new Date(newRecordData.reportingPeriodStart).toISOString(),
        reportingPeriodEnd: new Date(newRecordData.reportingPeriodEnd).toISOString(),
        status: "draft",
      });

      toast({
        title: "Success",
        description: "Emission record created successfully",
      });

      setIsCreateRecordDialogOpen(false);
      setNewRecordData({ reportingPeriodStart: "", reportingPeriodEnd: "" });
    } catch (error) {
      console.error("Failed to create emission record:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create emission record. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Check if a scope is applicable for the organization
  const isScopeApplicable = (scope: string): boolean => {
    if (!organization?.applicableScopes) return true; // Default to showing all if not set

    const scopes = organization.applicableScopes as { scope1?: boolean; scope2?: boolean; scope3?: boolean };

    if (scope === "stationary" || scope === "mobile" || scope === "refrigeration") {
      return scopes.scope1 === true;
    }
    if (scope === "scope2") {
      return scopes.scope2 === true;
    }
    if (scope === "scope3") {
      return scopes.scope3 === true;
    }

    return true;
  };

  // Render form fields based on current scope
  const renderFormFields = () => {
    if (!currentScope) return null;

    const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";
    const inputErrorClass = "w-full px-3 py-2 border border-red-500 dark:border-red-400 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";
    const labelClass = "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300";
    const errorClass = "text-sm text-red-600 dark:text-red-400 mt-1";

    const getInputClass = (fieldName: string) => {
      return formErrors[fieldName] ? inputErrorClass : inputClass;
    };

    switch (currentScope) {
      case "stationary":
        return (
          <div className="grid gap-4">
            <div>
              <label htmlFor="sourceDescription" className={labelClass}>Source Description *</label>
              <input
                id="sourceDescription"
                type="text"
                value={formData.sourceDescription || ""}
                onChange={(e) => handleFieldChange("sourceDescription", e.target.value)}
                placeholder="e.g., Single-burner stove"
                className={getInputClass("sourceDescription")}
              />
              {formErrors.sourceDescription && (
                <p className={errorClass}>{formErrors.sourceDescription}</p>
              )}
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
              <label htmlFor="fuelType" className={labelClass}>Fuel Type *</label>
              <select
                id="fuelType"
                value={formData.fuelType || ""}
                onChange={(e) => handleFieldChange("fuelType", e.target.value)}
                className={getInputClass("fuelType")}
              >
                <option value="">Select fuel type</option>
                <option value="natural_gas">Natural Gas</option>
                <option value="heating_oil">Heating Oil</option>
                <option value="propane">Propane</option>
                <option value="diesel">Diesel</option>
                <option value="gasoline">Gasoline</option>
                <option value="coal">Coal</option>
                <option value="wood">Wood</option>
                <option value="biomass">Biomass</option>
                <option value="lpg">LPG</option>
                <option value="kerosene">Kerosene</option>
                <option value="fuel_oil">Fuel Oil</option>
                <option value="biodiesel">Biodiesel</option>
                <option value="ethanol">Ethanol</option>
                <option value="other">Other</option>
              </select>
              {formErrors.fuelType && (
                <p className={errorClass}>{formErrors.fuelType}</p>
              )}
            </div>
            <div>
              <label htmlFor="fuelConsumption" className={labelClass}>Quantity Combusted *</label>
              <input
                id="fuelConsumption"
                type="number"
                value={formData.fuelConsumption || ""}
                onChange={(e) => handleFieldChange("fuelConsumption", e.target.value)}
                className={getInputClass("fuelConsumption")}
              />
              {formErrors.fuelConsumption && (
                <p className={errorClass}>{formErrors.fuelConsumption}</p>
              )}
            </div>
            <div>
              <label htmlFor="unit" className={labelClass}>Unit *</label>
              <input
                id="unit"
                type="text"
                value={formData.unit || ""}
                onChange={(e) => handleFieldChange("unit", e.target.value)}
                placeholder="e.g., kg, L"
                className={getInputClass("unit")}
              />
              {formErrors.unit && (
                <p className={errorClass}>{formErrors.unit}</p>
              )}
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
              <label htmlFor="fuelType" className={labelClass}>Fuel Type *</label>
              <select
                id="fuelType"
                value={formData.fuelType || ""}
                onChange={(e) => handleFieldChange("fuelType", e.target.value)}
                className={inputClass}
              >
                <option value="">Select fuel type</option>
                <option value="natural_gas">Natural Gas</option>
                <option value="heating_oil">Heating Oil</option>
                <option value="propane">Propane</option>
                <option value="diesel">Diesel</option>
                <option value="gasoline">Gasoline</option>
                <option value="coal">Coal</option>
                <option value="wood">Wood</option>
                <option value="biomass">Biomass</option>
                <option value="lpg">LPG</option>
                <option value="kerosene">Kerosene</option>
                <option value="fuel_oil">Fuel Oil</option>
                <option value="biodiesel">Biodiesel</option>
                <option value="ethanol">Ethanol</option>
                <option value="other">Other</option>
              </select>
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

  // Show loading state while organization is being fetched
  if (orgLoading) {
    return <CalculationSkeleton />;
  }

  // Show message if no emission records exist
  const hasEmissionRecords = emissionRecordsData && emissionRecordsData.records.length > 0;

  return (
    <div className="p-6 w-full container mx-auto max-w-[100rem]">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Data Calculation
        </h1>
        <p className="text-lg text-[#A5C046] font-semibold">
          Energy Auditing Tool
        </p>
      </div>

      {/* Emission Record Selector */}
      <div className="mb-8">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Select Reporting Period
            </label>
            {recordsLoading ? (
              <EmptyStateInline message="Loading emission records..." />
            ) : !hasEmissionRecords ? (
              <EmptyState
                icon={FileX}
                title="No emission records found"
                description="Create an emission record to start tracking and calculating your organization's greenhouse gas emissions"
                action={{
                  label: "Create Emission Record",
                  onClick: () => setIsCreateRecordDialogOpen(true),
                }}
              />
            ) : (
              <Select
                value={currentEmissionRecordId}
                onValueChange={setCurrentEmissionRecordId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select reporting period" />
                </SelectTrigger>
                <SelectContent>
                  {emissionRecordsData.records.map((record) => (
                    <SelectItem key={record.id} value={record.id}>
                      {format(new Date(record.reportingPeriodStart), "MMM yyyy")} -{" "}
                      {format(new Date(record.reportingPeriodEnd), "MMM yyyy")} ({record.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {/* Scope Selection Tabs */}
      {hasEmissionRecords && (
        <div className="mb-8">
          <div className="flex justify-center gap-3.5">
            {isScopeApplicable("stationary") && (
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
            )}

            {isScopeApplicable("scope2") && (
              <Button
                variant={currentScope === "scope2" ? "default" : "outline"}
                onClick={() => handleScopeSelection("scope2")}
              >
                Scope 2
              </Button>
            )}

            {isScopeApplicable("scope3") && (
              <Button
                variant={currentScope === "scope3" ? "default" : "outline"}
                onClick={() => handleScopeSelection("scope3")}
              >
                Scope 3
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Scope Instructions */}
      {hasEmissionRecords && currentScope && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            {contentConfigs[currentScope as keyof typeof contentConfigs].title}
          </h2>
          <p className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
            {contentConfigs[currentScope as keyof typeof contentConfigs].subtitle}
          </p>
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
      )}

      {/* Data Table */}
      {hasEmissionRecords && currentScope && currentEmissionRecordId && (
        <div className="mb-8">
          {isCurrentLoading() ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-600 dark:text-gray-400">
                Loading data...
              </div>
            </div>
          ) : (
            <DataTable
              columns={getColumnsForScope(currentScope) as ColumnDef<EmissionData>[]}
              data={getCurrentData()}
              searchPlaceholder={`Search ${currentScope} data...`}
            />
          )}
        </div>
      )}

      {/* Action Buttons */}
      {hasEmissionRecords && currentScope && currentEmissionRecordId && (
        <div className="mb-8 flex gap-3">
          <Button onClick={handleAddRecord} disabled={isCurrentLoading()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
          <Button
            onClick={handleCalculate}
            disabled={isCurrentLoading() || triggerCalculation.isPending}
            variant="secondary"
          >
            {triggerCalculation.isPending ? "Calculating..." : "Calculate Emissions"}
          </Button>
        </div>
      )}

      {/* Calculation Results Display */}
      {calculation && currentEmissionRecordId && (
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Calculation Results
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total CO2e</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {calculation.totalCo2e?.toLocaleString() || "0"} kg
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Scope 1</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {calculation.totalScope1Co2e?.toLocaleString() || "0"} kg
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Scope 2</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {calculation.totalScope2Co2e?.toLocaleString() || "0"} kg
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Scope 3</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {calculation.totalScope3Co2e?.toLocaleString() || "0"} kg
                </p>
              </div>
            </div>

            {calculation.emissionsPerEmployee && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Emissions Per Employee</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {calculation.emissionsPerEmployee.toLocaleString()} kg CO2e
                </p>
              </div>
            )}

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last calculated: {format(new Date(calculation.calculatedAt), "PPpp")}
            </div>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col m-4" onClick={(e) => e.stopPropagation()} onKeyDown={handleModalKeyDown} tabIndex={-1}>
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
                disabled={
                  createFuelUsage.isPending ||
                  createVehicleUsage.isPending ||
                  createElectricityUsage.isPending ||
                  createCommutingData.isPending
                }
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  createFuelUsage.isPending ||
                  createVehicleUsage.isPending ||
                  createElectricityUsage.isPending ||
                  createCommutingData.isPending
                }
              >
                {(createFuelUsage.isPending ||
                  createVehicleUsage.isPending ||
                  createElectricityUsage.isPending ||
                  createCommutingData.isPending)
                  ? "Creating..."
                  : "Add Record"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Emission Record Dialog */}
      <Dialog open={isCreateRecordDialogOpen} onOpenChange={setIsCreateRecordDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Emission Record</DialogTitle>
            <DialogDescription>
              Create a new reporting period to track emissions data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Reporting Period Start *</Label>
              <Input
                id="startDate"
                type="date"
                value={newRecordData.reportingPeriodStart}
                onChange={(e) =>
                  setNewRecordData({ ...newRecordData, reportingPeriodStart: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Reporting Period End *</Label>
              <Input
                id="endDate"
                type="date"
                value={newRecordData.reportingPeriodEnd}
                onChange={(e) =>
                  setNewRecordData({ ...newRecordData, reportingPeriodEnd: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateRecordDialogOpen(false)}
              disabled={createEmissionRecord.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateEmissionRecord}
              disabled={createEmissionRecord.isPending}
            >
              {createEmissionRecord.isPending ? "Creating..." : "Create Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Calculation() {
  return (
    <PageErrorBoundary>
      <CalculationContent />
    </PageErrorBoundary>
  );
}