"use client";

import { useState } from "react";
import { useOrganizationCheck } from "@/lib/hooks/use-organization-check";
import { useDashboard, DashboardPeriod } from "@/lib/api/queries/dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Download, FileSpreadsheet, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { generateEmissionsReportPDF } from "@/components/reports/report-generator";
import { generateEmissionsCSV } from "@/components/reports/export-csv";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ReportsPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("year");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingCSV, setIsGeneratingCSV] = useState(false);
  const { toast } = useToast();
  const { organization, isLoading: orgLoading } = useOrganizationCheck();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard(
    organization?.id || "",
    period
  );

  const isLoading = orgLoading || dashboardLoading;

  // Get period label for display
  const getPeriodLabel = (period: DashboardPeriod) => {
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

  // Format trend icon
  const getTrendIcon = (direction?: string) => {
    switch (direction) {
      case "increase":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "decrease":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (direction?: string) => {
    switch (direction) {
      case "increase":
        return "text-red-600";
      case "decrease":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  // Export handlers
  const handleExportPDF = async () => {
    if (!dashboardData || !organization) {
      toast({
        title: "Error",
        description: "No data available to generate report",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await generateEmissionsReportPDF(dashboardData, period, organization.name);
      toast({
        title: "Success",
        description: "PDF report generated successfully",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleExportCSV = async () => {
    if (!dashboardData || !organization) {
      toast({
        title: "Error",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingCSV(true);
    try {
      generateEmissionsCSV(dashboardData, period, organization.name);
      toast({
        title: "Success",
        description: "CSV report exported successfully",
      });
    } catch (error) {
      console.error("CSV export error:", error);
      toast({
        title: "Error",
        description: "Failed to export CSV report",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCSV(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 w-full container mx-auto max-w-[100rem]">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full container mx-auto max-w-[100rem]">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Emissions Reports
          </h1>
          {organization && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {organization.name} - {getPeriodLabel(period)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Export Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={isGeneratingPDF || isLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? "Generating..." : "Export PDF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={isGeneratingCSV || isLoading}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {isGeneratingCSV ? "Exporting..." : "Export CSV"}
          </Button>

          {/* Period Selector */}
          <Tabs value={period} onValueChange={(value) => setPeriod(value as DashboardPeriod)}>
            <TabsList>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="quarter">This Quarter</TabsTrigger>
              <TabsTrigger value="year">This Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Summary Banner */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              {organization?.name}&apos;s total estimated greenhouse gas emissions for {getPeriodLabel(period).toLowerCase()}:
            </p>
            <div className="flex items-center justify-center gap-4">
              <div>
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  {dashboardData?.summary.totalCo2eYtd
                    ? (dashboardData.summary.totalCo2eYtd / 1000).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00"}
                </span>
                <span className="text-xl text-gray-600 dark:text-gray-400 ml-2">
                  tCO₂e
                </span>
              </div>
              {dashboardData?.summary.trend && (
                <div className="flex items-center gap-2 text-sm">
                  {getTrendIcon(dashboardData.summary.trend.direction)}
                  <span className={getTrendColor(dashboardData.summary.trend.direction)}>
                    {dashboardData.summary.trend.percentage.toFixed(1)}%
                    <br />
                    vs {dashboardData.summary.trend.comparedTo}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Scope 1 (Direct)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {dashboardData?.summary.totalScope1
                ? (dashboardData.summary.totalScope1 / 1000).toFixed(2)
                : "0.00"}{" "}
              tCO₂e
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Stationary, Mobile, Refrigerants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Scope 2 (Indirect)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {dashboardData?.summary.totalScope2
                ? (dashboardData.summary.totalScope2 / 1000).toFixed(2)
                : "0.00"}{" "}
              tCO₂e
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Purchased Electricity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Scope 3 (Other Indirect)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              {dashboardData?.summary.totalScope3
                ? (dashboardData.summary.totalScope3 / 1000).toFixed(2)
                : "0.00"}{" "}
              tCO₂e
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Employee Commuting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Per Employee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {dashboardData?.summary.emissionsPerEmployee
                ? (dashboardData.summary.emissionsPerEmployee / 1000).toFixed(2)
                : "0.00"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              tCO₂e/employee
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Emissions by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead className="text-right">Emissions (tCO₂e)</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboardData?.breakdown && (
                <>
                  <TableRow>
                    <TableCell className="font-medium">Stationary Combustion (Fuel)</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Scope 1
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {(dashboardData.breakdown.fuel / 1000).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {dashboardData.summary.totalCo2eYtd > 0
                        ? ((dashboardData.breakdown.fuel / dashboardData.summary.totalCo2eYtd) * 100).toFixed(1)
                        : "0.0"}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Mobile Combustion (Vehicles)</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Scope 1
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {(dashboardData.breakdown.vehicles / 1000).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {dashboardData.summary.totalCo2eYtd > 0
                        ? ((dashboardData.breakdown.vehicles / dashboardData.summary.totalCo2eYtd) * 100).toFixed(1)
                        : "0.0"}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Refrigerants & AC</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Scope 1
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {(dashboardData.breakdown.refrigerants / 1000).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {dashboardData.summary.totalCo2eYtd > 0
                        ? ((dashboardData.breakdown.refrigerants / dashboardData.summary.totalCo2eYtd) * 100).toFixed(1)
                        : "0.0"}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Purchased Electricity</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        Scope 2
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {(dashboardData.breakdown.electricity / 1000).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {dashboardData.summary.totalCo2eYtd > 0
                        ? ((dashboardData.breakdown.electricity / dashboardData.summary.totalCo2eYtd) * 100).toFixed(1)
                        : "0.0"}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Employee Commuting</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300">
                        Scope 3
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {(dashboardData.breakdown.commuting / 1000).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {dashboardData.summary.totalCo2eYtd > 0
                        ? ((dashboardData.breakdown.commuting / dashboardData.summary.totalCo2eYtd) * 100).toFixed(1)
                        : "0.0"}%
                    </TableCell>
                  </TableRow>
                  <TableRow className="font-bold bg-gray-50 dark:bg-gray-800">
                    <TableCell>Total Emissions</TableCell>
                    <TableCell>All Scopes</TableCell>
                    <TableCell className="text-right">
                      {(dashboardData.summary.totalCo2eYtd / 1000).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">100.0%</TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Emission Sources */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top Emission Sources</CardTitle>
        </CardHeader>
        <CardContent>
          {!dashboardData?.topSources || dashboardData.topSources.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No emission sources data available for this period
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Source Category</TableHead>
                  <TableHead className="text-right">Emissions (tCO₂e)</TableHead>
                  <TableHead className="text-right">Percentage of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.topSources.map((source, index) => (
                  <TableRow key={source.category}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>{source.category}</TableCell>
                    <TableCell className="text-right">
                      {(source.value / 1000).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                        <span>{source.percentage.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Emissions Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {!dashboardData?.trends.monthly || dashboardData.trends.monthly.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-600 dark:text-gray-400">
                No trend data available for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.trends.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => {
                      const date = new Date(value + "-01");
                      return date.toLocaleDateString("en-US", { month: "short" });
                    }}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                    }}
                    formatter={(value: number) => [(value / 1000).toFixed(2) + " tCO₂e", ""]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="scope1"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="Scope 1"
                  />
                  <Line
                    type="monotone"
                    dataKey="scope2"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                    name="Scope 2"
                  />
                  <Line
                    type="monotone"
                    dataKey="scope3"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                    name="Scope 3"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Scope Comparison Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Emissions by Scope</CardTitle>
          </CardHeader>
          <CardContent>
            {!dashboardData?.summary ? (
              <div className="h-[300px] flex items-center justify-center text-gray-600 dark:text-gray-400">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Scope 1",
                        value: dashboardData.summary.totalScope1 / 1000,
                        color: "#3b82f6",
                      },
                      {
                        name: "Scope 2",
                        value: dashboardData.summary.totalScope2 / 1000,
                        color: "#a855f7",
                      },
                      {
                        name: "Scope 3",
                        value: dashboardData.summary.totalScope3 / 1000,
                        color: "#06b6d4",
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { color: "#3b82f6" },
                      { color: "#a855f7" },
                      { color: "#06b6d4" },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                    }}
                    formatter={(value: number) => [value.toFixed(2) + " tCO₂e", ""]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Emissions by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {!dashboardData?.breakdown ? (
              <div className="h-[300px] flex items-center justify-center text-gray-600 dark:text-gray-400">
                No breakdown data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      category: "Fuel",
                      value: dashboardData.breakdown.fuel / 1000,
                      fill: "#3b82f6",
                    },
                    {
                      category: "Vehicles",
                      value: dashboardData.breakdown.vehicles / 1000,
                      fill: "#3b82f6",
                    },
                    {
                      category: "Refrigerants",
                      value: dashboardData.breakdown.refrigerants / 1000,
                      fill: "#3b82f6",
                    },
                    {
                      category: "Electricity",
                      value: dashboardData.breakdown.electricity / 1000,
                      fill: "#a855f7",
                    },
                    {
                      category: "Commuting",
                      value: dashboardData.breakdown.commuting / 1000,
                      fill: "#06b6d4",
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                    }}
                    formatter={(value: number) => [value.toFixed(2) + " tCO₂e", "Emissions"]}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Organization</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {dashboardData?.organization.name || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Occupancy Type</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {dashboardData?.organization.occupancyType || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Facilities</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {dashboardData?.organization.facilitiesCount || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Employees</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {dashboardData?.organization.totalEmployees?.toLocaleString() || 0}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {dashboardData?.summary.totalRecords || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Records with Calculations</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {dashboardData?.summary.recordsWithCalculations || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
