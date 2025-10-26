import Papa from "papaparse";
import { DashboardData, DashboardPeriod } from "@/lib/api/queries/dashboard";

// Helper function to get period label
const getPeriodLabel = (period: DashboardPeriod): string => {
  switch (period) {
    case "month":
      return "This Month";
    case "quarter":
      return "This Quarter";
    case "year":
      return "This Year";
    default:
      return "This Year";
  }
};

// Interface for CSV row structure
interface EmissionsCsvRow {
  Category: string;
  Scope: string;
  "Emissions (kg CO₂e)": number;
  "Emissions (tCO₂e)": string;
  "Percentage of Total": string;
}

interface SummaryCsvRow {
  Metric: string;
  Value: string;
}

interface OrganizationCsvRow {
  Field: string;
  Value: string;
}

/**
 * Format emissions breakdown data for CSV export
 */
const formatEmissionsBreakdown = (data: DashboardData): EmissionsCsvRow[] => {
  const totalEmissions = data.summary.totalCo2eYtd;

  return [
    {
      Category: "Stationary Combustion (Fuel)",
      Scope: "Scope 1",
      "Emissions (kg CO₂e)": data.breakdown.fuel,
      "Emissions (tCO₂e)": (data.breakdown.fuel / 1000).toFixed(2),
      "Percentage of Total":
        totalEmissions > 0
          ? `${((data.breakdown.fuel / totalEmissions) * 100).toFixed(1)}%`
          : "0.0%",
    },
    {
      Category: "Mobile Combustion (Vehicles)",
      Scope: "Scope 1",
      "Emissions (kg CO₂e)": data.breakdown.vehicles,
      "Emissions (tCO₂e)": (data.breakdown.vehicles / 1000).toFixed(2),
      "Percentage of Total":
        totalEmissions > 0
          ? `${((data.breakdown.vehicles / totalEmissions) * 100).toFixed(1)}%`
          : "0.0%",
    },
    {
      Category: "Refrigerants & AC",
      Scope: "Scope 1",
      "Emissions (kg CO₂e)": data.breakdown.refrigerants,
      "Emissions (tCO₂e)": (data.breakdown.refrigerants / 1000).toFixed(2),
      "Percentage of Total":
        totalEmissions > 0
          ? `${((data.breakdown.refrigerants / totalEmissions) * 100).toFixed(1)}%`
          : "0.0%",
    },
    {
      Category: "Purchased Electricity",
      Scope: "Scope 2",
      "Emissions (kg CO₂e)": data.breakdown.electricity,
      "Emissions (tCO₂e)": (data.breakdown.electricity / 1000).toFixed(2),
      "Percentage of Total":
        totalEmissions > 0
          ? `${((data.breakdown.electricity / totalEmissions) * 100).toFixed(1)}%`
          : "0.0%",
    },
    {
      Category: "Employee Commuting",
      Scope: "Scope 3",
      "Emissions (kg CO₂e)": data.breakdown.commuting,
      "Emissions (tCO₂e)": (data.breakdown.commuting / 1000).toFixed(2),
      "Percentage of Total":
        totalEmissions > 0
          ? `${((data.breakdown.commuting / totalEmissions) * 100).toFixed(1)}%`
          : "0.0%",
    },
    {
      Category: "TOTAL EMISSIONS",
      Scope: "All Scopes",
      "Emissions (kg CO₂e)": totalEmissions,
      "Emissions (tCO₂e)": (totalEmissions / 1000).toFixed(2),
      "Percentage of Total": "100.0%",
    },
  ];
};

/**
 * Format summary data for CSV export
 */
const formatSummary = (data: DashboardData, period: DashboardPeriod): SummaryCsvRow[] => {
  const trend = data.summary.trend;
  const trendText = trend
    ? `${trend.direction.toUpperCase()} ${trend.percentage.toFixed(1)}% vs ${trend.comparedTo}`
    : "N/A";

  return [
    {
      Metric: "Report Period",
      Value: getPeriodLabel(period),
    },
    {
      Metric: "Total Emissions (tCO₂e)",
      Value: (data.summary.totalCo2eYtd / 1000).toFixed(2),
    },
    {
      Metric: "Trend",
      Value: trendText,
    },
    {
      Metric: "Scope 1 - Direct Emissions (tCO₂e)",
      Value: (data.summary.totalScope1 / 1000).toFixed(2),
    },
    {
      Metric: "Scope 2 - Indirect Emissions (tCO₂e)",
      Value: (data.summary.totalScope2 / 1000).toFixed(2),
    },
    {
      Metric: "Scope 3 - Other Indirect Emissions (tCO₂e)",
      Value: (data.summary.totalScope3 / 1000).toFixed(2),
    },
    {
      Metric: "Emissions per Employee (tCO₂e)",
      Value: (data.summary.emissionsPerEmployee / 1000).toFixed(2),
    },
    {
      Metric: "Total Records",
      Value: data.summary.totalRecords.toString(),
    },
    {
      Metric: "Records with Calculations",
      Value: data.summary.recordsWithCalculations.toString(),
    },
  ];
};

/**
 * Format organization data for CSV export
 */
const formatOrganizationInfo = (data: DashboardData): OrganizationCsvRow[] => {
  return [
    {
      Field: "Organization Name",
      Value: data.organization.name,
    },
    {
      Field: "Occupancy Type",
      Value: data.organization.occupancyType || "N/A",
    },
    {
      Field: "Total Facilities",
      Value: data.organization.facilitiesCount.toString(),
    },
    {
      Field: "Total Employees",
      Value: data.organization.totalEmployees?.toLocaleString() || "0",
    },
  ];
};

/**
 * Format top emission sources for CSV export
 */
const formatTopSources = (data: DashboardData) => {
  if (!data.topSources || data.topSources.length === 0) {
    return [];
  }

  return data.topSources.map((source, index) => ({
    Rank: index + 1,
    "Source Category": source.category,
    "Emissions (kg CO₂e)": source.value,
    "Emissions (tCO₂e)": (source.value / 1000).toFixed(2),
    "Percentage of Total": `${source.percentage.toFixed(1)}%`,
  }));
};

/**
 * Generate and download comprehensive CSV report with multiple sheets (sections)
 */
export const generateEmissionsCSV = (
  data: DashboardData,
  period: DashboardPeriod,
  organizationName: string
): void => {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Create comprehensive CSV with multiple sections
  const csvContent: string[] = [];

  // Header section
  csvContent.push("EMISSIONS REPORT");
  csvContent.push(`Organization: ${organizationName}`);
  csvContent.push(`Period: ${getPeriodLabel(period)}`);
  csvContent.push(`Generated: ${generatedDate}`);
  csvContent.push(""); // Empty line

  // Summary section
  csvContent.push("=== SUMMARY ===");
  const summaryData = formatSummary(data, period);
  csvContent.push(Papa.unparse(summaryData));
  csvContent.push(""); // Empty line

  // Emissions breakdown section
  csvContent.push("=== EMISSIONS BY CATEGORY ===");
  const emissionsData = formatEmissionsBreakdown(data);
  csvContent.push(Papa.unparse(emissionsData));
  csvContent.push(""); // Empty line

  // Top sources section (if available)
  const topSourcesData = formatTopSources(data);
  if (topSourcesData.length > 0) {
    csvContent.push("=== TOP EMISSION SOURCES ===");
    csvContent.push(Papa.unparse(topSourcesData));
    csvContent.push(""); // Empty line
  }

  // Organization info section
  csvContent.push("=== ORGANIZATION INFORMATION ===");
  const orgData = formatOrganizationInfo(data);
  csvContent.push(Papa.unparse(orgData));
  csvContent.push(""); // Empty line

  // Footer
  csvContent.push(
    `This report was generated by RevEarth GHG Inventory Platform on ${generatedDate}`
  );

  // Join all sections
  const finalCsv = csvContent.join("\n");

  // Create and download file
  const fileName = `Emissions_Report_${organizationName.replace(/\s+/g, "_")}_${getPeriodLabel(
    period
  ).replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;

  const blob = new Blob([finalCsv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate and download CSV with only emissions breakdown (simplified version)
 */
export const generateSimpleEmissionsCSV = (
  data: DashboardData,
  organizationName: string
): void => {
  const emissionsData = formatEmissionsBreakdown(data);
  const csv = Papa.unparse(emissionsData);

  const fileName = `Emissions_Breakdown_${organizationName.replace(
    /\s+/g,
    "_"
  )}_${new Date().toISOString().split("T")[0]}.csv`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
