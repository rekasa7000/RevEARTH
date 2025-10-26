/**
 * Shared API Types
 * Type definitions for API requests and responses
 */

// ============================================
// Common Types
// ============================================

export interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// Organization Types
// ============================================

export type OccupancyType = "residential" | "commercial" | "industrial" | "lgu" | "academic";

export interface ApplicableScopes {
  scope1: boolean;
  scope2: boolean;
  scope3: boolean;
}

export interface Organization {
  id: string;
  userId: string;
  name: string;
  industrySector: string | null;
  occupancyType: OccupancyType;
  reportingBoundaries: string | null;
  applicableScopes: ApplicableScopes;
  createdAt: string;
  updatedAt: string;
  facilities?: Facility[];
  _count?: {
    emissionRecords: number;
    facilities: number;
  };
}

export interface CreateOrganizationInput {
  name: string;
  industrySector?: string;
  occupancyType: OccupancyType;
  reportingBoundaries?: string;
  applicableScopes?: ApplicableScopes;
}

export interface UpdateOrganizationInput {
  name?: string;
  industrySector?: string;
  occupancyType?: OccupancyType;
  reportingBoundaries?: string;
  applicableScopes?: ApplicableScopes;
}

export interface OrganizationResponse {
  organization: Organization;
}

// ============================================
// Facility Types
// ============================================

export interface Facility {
  id: string;
  organizationId: string;
  name: string;
  location: string | null;
  address: string | null;
  areaSqm: number | null;
  employeeCount: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    electricityUsage: number;
  };
}

export interface CreateFacilityInput {
  organizationId: string;
  name: string;
  location?: string;
  address?: string;
  areaSqm?: number;
  employeeCount?: number;
}

export interface UpdateFacilityInput {
  name?: string;
  location?: string;
  address?: string;
  areaSqm?: number;
  employeeCount?: number;
}

export interface FacilityResponse {
  facility: Facility;
}

export interface FacilitiesResponse {
  facilities: Facility[];
}

// ============================================
// Emission Record Types
// ============================================

export type EmissionRecordStatus = "draft" | "in_progress" | "completed" | "submitted";

export interface EmissionRecord {
  id: string;
  organizationId: string;
  facilityId: string | null;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  status: EmissionRecordStatus;
  scopeSelection: ApplicableScopes;
  createdAt: string;
  updatedAt: string;
  calculation?: Calculation;
  _count?: {
    fuelUsage: number;
    vehicleUsage: number;
    refrigerantUsage: number;
    electricityUsage: number;
    commutingData: number;
  };
}

export interface CreateEmissionRecordInput {
  organizationId: string;
  facilityId?: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  scopeSelection?: ApplicableScopes;
}

export interface UpdateEmissionRecordInput {
  reportingPeriodStart?: string;
  reportingPeriodEnd?: string;
  status?: EmissionRecordStatus;
  scopeSelection?: ApplicableScopes;
}

export interface EmissionRecordResponse {
  emissionRecord: EmissionRecord;
}

export interface EmissionRecordsResponse {
  records: EmissionRecord[];
  pagination: PaginationResponse;
}

// ============================================
// Calculation Types
// ============================================

export interface Calculation {
  id: string;
  emissionRecordId: string;
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
  totalEmissions: number;
  calculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalculationSummary {
  scope1: {
    stationary: number;
    mobile: number;
    refrigerant: number;
    total: number;
  };
  scope2: {
    electricity: number;
    total: number;
  };
  scope3: {
    commuting: number;
    total: number;
  };
  grandTotal: number;
}

export interface CalculationInput {
  emissionRecordId: string;
}

export interface CalculationResponse {
  calculation: Calculation;
  summary: CalculationSummary;
}

// ============================================
// Fuel Usage Types
// ============================================

export interface FuelUsage {
  id: string;
  emissionRecordId: string;
  sourceDescription: string;
  fuelState: "Solid" | "Liquid" | "Gas";
  fuelType: string;
  quantityCombust: number;
  unit: string;
  co2Emissions: number;
  ch4Emissions: number;
  n2oEmissions: number;
  totalEmissions: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFuelUsageInput {
  emissionRecordId: string;
  sourceDescription: string;
  fuelState: "Solid" | "Liquid" | "Gas";
  fuelType: string;
  quantityCombust: number;
  unit: string;
}

// ============================================
// Electricity Usage Types
// ============================================

export interface ElectricityUsage {
  id: string;
  emissionRecordId: string;
  facilityId: string | null;
  sourceDescription: string;
  quantity: number;
  powerRating: number;
  monthlyRuntime: number;
  unit: string;
  gridFactor: number;
  co2Emissions: number;
  totalEmissions: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateElectricityUsageInput {
  emissionRecordId: string;
  facilityId?: string;
  sourceDescription: string;
  quantity: number;
  powerRating: number;
  monthlyRuntime: number;
  unit: string;
  gridFactor: number;
}

// ============================================
// Commuting Data Types
// ============================================

export interface CommutingData {
  id: string;
  emissionRecordId: string;
  employeeId: string;
  notes: string | null;
  vehicleType: string;
  vehicleYear: number;
  fuelType: string;
  distanceCoveredDaily: number;
  annualWorkDays: number;
  totalEmissions: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommutingDataInput {
  emissionRecordId: string;
  employeeId: string;
  notes?: string;
  vehicleType: string;
  vehicleYear: number;
  fuelType: string;
  distanceCoveredDaily: number;
  annualWorkDays: number;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  totalEmissions: number;
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
  emissionRecordsCount: number;
  facilitiesCount: number;
  recentCalculations: Array<{
    id: string;
    reportingPeriod: string;
    totalEmissions: number;
    calculatedAt: string;
  }>;
}

export interface DashboardResponse {
  stats: DashboardStats;
}

// ============================================
// Analytics Types
// ============================================

export interface TrendsData {
  period: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export interface TrendsResponse {
  trends: TrendsData[];
}

export interface ComparisonData {
  category: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export interface ComparisonResponse {
  comparisons: ComparisonData[];
}
