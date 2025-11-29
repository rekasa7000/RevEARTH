import { jsPDF } from "jspdf";
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

// Helper function to format trend
const formatTrend = (trend: { percentage: number; direction: string; comparedTo: string }) => {
  const arrow = trend.direction === "increase" ? "↑" : trend.direction === "decrease" ? "↓" : "→";
  return `${arrow} ${trend.percentage.toFixed(1)}% vs ${trend.comparedTo}`;
};

// Function to generate and download PDF
export const generateEmissionsReportPDF = async (
  data: DashboardData,
  period: DashboardPeriod,
  organizationName: string
): Promise<void> => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55); // gray-800
  doc.text("Emissions Report", margin, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128); // gray-500
  doc.text(organizationName, margin, yPos);
  yPos += 6;

  doc.setFontSize(10);
  doc.text(`Period: ${getPeriodLabel(period)} | Generated: ${generatedDate}`, margin, yPos);
  yPos += 5;

  // Header line
  doc.setDrawColor(59, 130, 246); // blue-500
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // Summary Banner
  checkPageBreak(40);
  doc.setFillColor(239, 246, 255); // blue-50
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, "F");

  yPos += 8;
  doc.setFontSize(11);
  doc.setTextColor(55, 65, 81); // gray-700
  const summaryText = `Total estimated greenhouse gas emissions for ${getPeriodLabel(period).toLowerCase()}:`;
  doc.text(summaryText, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55); // gray-800
  const emissionValue = (data.summary.totalCo2eYtd / 1000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  doc.text(`${emissionValue} tCO₂e`, pageWidth / 2, yPos, { align: "center" });
  yPos += 6;

  if (data.summary.trend) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const trendColor = data.summary.trend.direction === "increase" ? [220, 38, 38] :
                       data.summary.trend.direction === "decrease" ? [22, 163, 74] : [107, 114, 128];
    doc.setTextColor(trendColor[0], trendColor[1], trendColor[2]);
    doc.text(formatTrend(data.summary.trend), pageWidth / 2, yPos, { align: "center" });
  }
  yPos += 15;

  // Scope Summary Cards
  checkPageBreak(35);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("Emissions by Scope", margin, yPos);
  yPos += 8;

  const cardWidth = (contentWidth - 9) / 4; // 4 cards with 3mm gap each
  const cardHeight = 25;

  const cards = [
    {
      title: "Scope 1 (Direct)",
      value: `${(data.summary.totalScope1 / 1000).toFixed(2)} tCO₂e`,
      desc: "Stationary, Mobile, Refrigerants",
      color: [219, 234, 254] // blue-100
    },
    {
      title: "Scope 2 (Indirect)",
      value: `${(data.summary.totalScope2 / 1000).toFixed(2)} tCO₂e`,
      desc: "Purchased Electricity",
      color: [243, 232, 255] // purple-100
    },
    {
      title: "Scope 3 (Other)",
      value: `${(data.summary.totalScope3 / 1000).toFixed(2)} tCO₂e`,
      desc: "Employee Commuting",
      color: [207, 250, 254] // cyan-100
    },
    {
      title: "Per Employee",
      value: `${(data.summary.emissionsPerEmployee / 1000).toFixed(2)}`,
      desc: "tCO₂e/employee",
      color: [249, 250, 251] // gray-50
    },
  ];

  cards.forEach((card, index) => {
    const xPos = margin + index * (cardWidth + 3);
    doc.setFillColor(card.color[0], card.color[1], card.color[2]);
    doc.roundedRect(xPos, yPos, cardWidth, cardHeight, 2, 2, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(card.title, xPos + 2, yPos + 5);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(card.value, xPos + 2, yPos + 12);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(156, 163, 175);
    doc.text(card.desc, xPos + 2, yPos + 17, { maxWidth: cardWidth - 4 });
  });
  yPos += cardHeight + 12;

  // Category Breakdown Table
  checkPageBreak(80);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("Emissions by Category", margin, yPos);
  yPos += 8;

  // Table header
  doc.setFillColor(243, 244, 246); // gray-100
  doc.rect(margin, yPos, contentWidth, 8, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("Category", margin + 2, yPos + 5);
  doc.text("Scope", margin + 65, yPos + 5);
  doc.text("Emissions (tCO₂e)", margin + 95, yPos + 5);
  doc.text("Percentage", margin + 145, yPos + 5);
  yPos += 8;

  // Table rows
  const tableRows = [
    {
      category: "Stationary Combustion (Fuel)",
      scope: "Scope 1",
      emissions: data.breakdown.fuel,
      color: [219, 234, 254] // blue-100
    },
    {
      category: "Mobile Combustion (Vehicles)",
      scope: "Scope 1",
      emissions: data.breakdown.vehicles,
      color: [219, 234, 254]
    },
    {
      category: "Refrigerants & AC",
      scope: "Scope 1",
      emissions: data.breakdown.refrigerants,
      color: [219, 234, 254]
    },
    {
      category: "Purchased Electricity",
      scope: "Scope 2",
      emissions: data.breakdown.electricity,
      color: [243, 232, 255] // purple-100
    },
    {
      category: "Employee Commuting",
      scope: "Scope 3",
      emissions: data.breakdown.commuting,
      color: [207, 250, 254] // cyan-100
    },
  ];

  doc.setFont("helvetica", "normal");
  tableRows.forEach((row) => {
    checkPageBreak(8);

    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.1);
    doc.line(margin, yPos, pageWidth - margin, yPos);

    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    doc.text(row.category, margin + 2, yPos + 5);

    // Scope badge
    doc.setFillColor(row.color[0], row.color[1], row.color[2]);
    doc.roundedRect(margin + 65, yPos + 1.5, 22, 5, 1, 1, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(row.scope, margin + 68, yPos + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text((row.emissions / 1000).toFixed(2), margin + 95, yPos + 5);

    const percentage = data.summary.totalCo2eYtd > 0
      ? ((row.emissions / data.summary.totalCo2eYtd) * 100).toFixed(1)
      : "0.0";
    doc.text(`${percentage}%`, margin + 145, yPos + 5);

    yPos += 8;
  });

  // Total row
  checkPageBreak(10);
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, yPos, contentWidth, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Total Emissions", margin + 2, yPos + 5);
  doc.text("All Scopes", margin + 68, yPos + 5);
  doc.text((data.summary.totalCo2eYtd / 1000).toFixed(2), margin + 95, yPos + 5);
  doc.text("100.0%", margin + 145, yPos + 5);
  yPos += 15;

  // Organization Information
  checkPageBreak(50);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("Organization Information", margin, yPos);
  yPos += 8;

  const infoItems = [
    { label: "Organization", value: data.organization.name },
    { label: "Occupancy Type", value: data.organization.occupancyType || "N/A" },
    { label: "Facilities", value: String(data.organization.facilitiesCount) },
    { label: "Total Employees", value: data.organization.totalEmployees?.toLocaleString() || "0" },
    { label: "Total Records", value: String(data.summary.totalRecords) },
    { label: "Records with Calculations", value: String(data.summary.recordsWithCalculations) },
  ];

  const itemsPerRow = 2;
  const itemWidth = contentWidth / itemsPerRow;

  infoItems.forEach((item, index) => {
    const col = index % itemsPerRow;
    const row = Math.floor(index / itemsPerRow);
    const xPos = margin + col * itemWidth;
    const yOffset = row * 15;

    checkPageBreak(yOffset + 15);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(item.label, xPos, yPos + yOffset);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55);
    doc.text(item.value, xPos, yPos + yOffset + 5);
  });
  yPos += Math.ceil(infoItems.length / itemsPerRow) * 15 + 10;

  // Footer
  const footerY = pageHeight - 15;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.1);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(156, 163, 175);
  doc.text(
    `This report was generated by RevEarth GHG Inventory Platform on ${generatedDate}.`,
    pageWidth / 2,
    footerY,
    { align: "center" }
  );
  doc.text(
    "For questions or concerns, please contact your organization administrator.",
    pageWidth / 2,
    footerY + 4,
    { align: "center" }
  );

  // Generate filename and download
  const fileName = `Emissions_Report_${organizationName.replace(/\s+/g, "_")}_${getPeriodLabel(
    period
  ).replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

  doc.save(fileName);
};
