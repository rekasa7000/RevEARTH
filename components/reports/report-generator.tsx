import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { DashboardData, DashboardPeriod } from "@/lib/api/queries/dashboard";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: "#3b82f6",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 3,
  },
  summaryBanner: {
    backgroundColor: "#eff6ff",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  summaryText: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 10,
    textAlign: "center",
  },
  emissionValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 5,
  },
  emissionUnit: {
    fontSize: 14,
    color: "#6b7280",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 20,
    marginBottom: 12,
    borderBottom: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 5,
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    width: "23%",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 6,
    border: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 3,
  },
  cardDescription: {
    fontSize: 7,
    color: "#9ca3af",
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    fontWeight: "bold",
    fontSize: 10,
    borderBottom: 1,
    borderBottomColor: "#d1d5db",
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottom: 1,
    borderBottomColor: "#e5e7eb",
    fontSize: 9,
  },
  tableRowTotal: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#f9fafb",
    fontWeight: "bold",
    fontSize: 9,
    borderTop: 2,
    borderTopColor: "#d1d5db",
  },
  col1: {
    width: "35%",
  },
  col2: {
    width: "20%",
  },
  col3: {
    width: "25%",
    textAlign: "right",
  },
  col4: {
    width: "20%",
    textAlign: "right",
  },
  scopeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 7,
    fontWeight: "bold",
  },
  scope1Badge: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  scope2Badge: {
    backgroundColor: "#f3e8ff",
    color: "#6b21a8",
  },
  scope3Badge: {
    backgroundColor: "#cffafe",
    color: "#155e75",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  infoItem: {
    width: "25%",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    borderTop: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  trendText: {
    fontSize: 10,
    marginLeft: 5,
  },
  trendIncrease: {
    color: "#dc2626",
  },
  trendDecrease: {
    color: "#16a34a",
  },
  trendStable: {
    color: "#6b7280",
  },
});

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

// Helper function to format trend
const formatTrend = (trend: { percentage: number; direction: string; comparedTo: string }) => {
  const arrow = trend.direction === "increase" ? "↑" : trend.direction === "decrease" ? "↓" : "→";
  return `${arrow} ${trend.percentage.toFixed(1)}% vs ${trend.comparedTo}`;
};

interface EmissionsReportPDFProps {
  data: DashboardData;
  period: DashboardPeriod;
  organizationName: string;
}

// PDF Document Component
export const EmissionsReportPDF: React.FC<EmissionsReportPDFProps> = ({
  data,
  period,
  organizationName,
}) => {
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Emissions Report</Text>
          <Text style={styles.subtitle}>{organizationName}</Text>
          <Text style={styles.subtitle}>
            Period: {getPeriodLabel(period)} | Generated: {generatedDate}
          </Text>
        </View>

        {/* Summary Banner */}
        <View style={styles.summaryBanner}>
          <Text style={styles.summaryText}>
            Total estimated greenhouse gas emissions for {getPeriodLabel(period).toLowerCase()}:
          </Text>
          <Text style={styles.emissionValue}>
            {(data.summary.totalCo2eYtd / 1000).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <Text style={styles.emissionUnit}>tCO₂e (Metric Tons of CO₂ Equivalent)</Text>
          {data.summary.trend && (
            <View style={styles.trendContainer}>
              <Text
                style={[
                  styles.trendText,
                  data.summary.trend.direction === "increase"
                    ? styles.trendIncrease
                    : data.summary.trend.direction === "decrease"
                    ? styles.trendDecrease
                    : styles.trendStable,
                ]}
              >
                {formatTrend(data.summary.trend)}
              </Text>
            </View>
          )}
        </View>

        {/* Scope Summary Cards */}
        <Text style={styles.sectionTitle}>Emissions by Scope</Text>
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Scope 1 (Direct)</Text>
            <Text style={styles.cardValue}>
              {(data.summary.totalScope1 / 1000).toFixed(2)} tCO₂e
            </Text>
            <Text style={styles.cardDescription}>Stationary, Mobile, Refrigerants</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Scope 2 (Indirect)</Text>
            <Text style={styles.cardValue}>
              {(data.summary.totalScope2 / 1000).toFixed(2)} tCO₂e
            </Text>
            <Text style={styles.cardDescription}>Purchased Electricity</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Scope 3 (Other Indirect)</Text>
            <Text style={styles.cardValue}>
              {(data.summary.totalScope3 / 1000).toFixed(2)} tCO₂e
            </Text>
            <Text style={styles.cardDescription}>Employee Commuting</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Per Employee</Text>
            <Text style={styles.cardValue}>
              {(data.summary.emissionsPerEmployee / 1000).toFixed(2)}
            </Text>
            <Text style={styles.cardDescription}>tCO₂e/employee</Text>
          </View>
        </View>

        {/* Category Breakdown Table */}
        <Text style={styles.sectionTitle}>Emissions by Category</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Category</Text>
            <Text style={styles.col2}>Scope</Text>
            <Text style={styles.col3}>Emissions (tCO₂e)</Text>
            <Text style={styles.col4}>Percentage</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col1}>Stationary Combustion (Fuel)</Text>
            <View style={styles.col2}>
              <Text style={[styles.scopeBadge, styles.scope1Badge]}>Scope 1</Text>
            </View>
            <Text style={styles.col3}>{(data.breakdown.fuel / 1000).toFixed(2)}</Text>
            <Text style={styles.col4}>
              {data.summary.totalCo2eYtd > 0
                ? ((data.breakdown.fuel / data.summary.totalCo2eYtd) * 100).toFixed(1)
                : "0.0"}
              %
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col1}>Mobile Combustion (Vehicles)</Text>
            <View style={styles.col2}>
              <Text style={[styles.scopeBadge, styles.scope1Badge]}>Scope 1</Text>
            </View>
            <Text style={styles.col3}>{(data.breakdown.vehicles / 1000).toFixed(2)}</Text>
            <Text style={styles.col4}>
              {data.summary.totalCo2eYtd > 0
                ? ((data.breakdown.vehicles / data.summary.totalCo2eYtd) * 100).toFixed(1)
                : "0.0"}
              %
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col1}>Refrigerants & AC</Text>
            <View style={styles.col2}>
              <Text style={[styles.scopeBadge, styles.scope1Badge]}>Scope 1</Text>
            </View>
            <Text style={styles.col3}>{(data.breakdown.refrigerants / 1000).toFixed(2)}</Text>
            <Text style={styles.col4}>
              {data.summary.totalCo2eYtd > 0
                ? ((data.breakdown.refrigerants / data.summary.totalCo2eYtd) * 100).toFixed(1)
                : "0.0"}
              %
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col1}>Purchased Electricity</Text>
            <View style={styles.col2}>
              <Text style={[styles.scopeBadge, styles.scope2Badge]}>Scope 2</Text>
            </View>
            <Text style={styles.col3}>{(data.breakdown.electricity / 1000).toFixed(2)}</Text>
            <Text style={styles.col4}>
              {data.summary.totalCo2eYtd > 0
                ? ((data.breakdown.electricity / data.summary.totalCo2eYtd) * 100).toFixed(1)
                : "0.0"}
              %
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col1}>Employee Commuting</Text>
            <View style={styles.col2}>
              <Text style={[styles.scopeBadge, styles.scope3Badge]}>Scope 3</Text>
            </View>
            <Text style={styles.col3}>{(data.breakdown.commuting / 1000).toFixed(2)}</Text>
            <Text style={styles.col4}>
              {data.summary.totalCo2eYtd > 0
                ? ((data.breakdown.commuting / data.summary.totalCo2eYtd) * 100).toFixed(1)
                : "0.0"}
              %
            </Text>
          </View>

          <View style={styles.tableRowTotal}>
            <Text style={styles.col1}>Total Emissions</Text>
            <Text style={styles.col2}>All Scopes</Text>
            <Text style={styles.col3}>
              {(data.summary.totalCo2eYtd / 1000).toFixed(2)}
            </Text>
            <Text style={styles.col4}>100.0%</Text>
          </View>
        </View>

        {/* Organization Information */}
        <Text style={styles.sectionTitle}>Organization Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Organization</Text>
            <Text style={styles.infoValue}>{data.organization.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Occupancy Type</Text>
            <Text style={styles.infoValue}>{data.organization.occupancyType || "N/A"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Facilities</Text>
            <Text style={styles.infoValue}>{data.organization.facilitiesCount}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Total Employees</Text>
            <Text style={styles.infoValue}>
              {data.organization.totalEmployees?.toLocaleString() || 0}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Total Records</Text>
            <Text style={styles.infoValue}>{data.summary.totalRecords}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Records with Calculations</Text>
            <Text style={styles.infoValue}>{data.summary.recordsWithCalculations}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This report was generated by RevEarth GHG Inventory Platform on {generatedDate}.
          {"\n"}
          For questions or concerns, please contact your organization administrator.
        </Text>
      </Page>
    </Document>
  );
};

// Function to generate and download PDF
export const generateEmissionsReportPDF = async (
  data: DashboardData,
  period: DashboardPeriod,
  organizationName: string
): Promise<void> => {
  const fileName = `Emissions_Report_${organizationName.replace(/\s+/g, "_")}_${getPeriodLabel(
    period
  ).replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

  // Generate PDF blob
  const blob = await pdf(
    <EmissionsReportPDF data={data} period={period} organizationName={organizationName} />
  ).toBlob();

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
