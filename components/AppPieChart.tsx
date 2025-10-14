"use client";

import React from "react";
import { ChartPie } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { useOrganizationCheck } from "@/lib/hooks/use-organization-check";
import { useDashboard, DashboardPeriod } from "@/lib/api/queries/dashboard";

// Config required by ChartContainer
const chartConfig: ChartConfig = {
  scope1: { label: "Scope 1", color: "#064e3b" },
  scope2: { label: "Scope 2", color: "#a3e635" },
  scope3: { label: "Scope 3", color: "#fbbf24" },
};

interface AppPieChartProps {
  period?: DashboardPeriod;
}

export function AppPieChart({ period = "year" }: AppPieChartProps) {
  const { organization } = useOrganizationCheck();
  const { data: dashboardData, isLoading } = useDashboard(
    organization?.id || "",
    period
  );

  // Convert API data to chart format
  const chartData = React.useMemo(() => {
    if (!dashboardData?.summary) {
      return [
        { name: "Scope 1", value: 0, color: "#064e3b" },
        { name: "Scope 2", value: 0, color: "#a3e635" },
        { name: "Scope 3", value: 0, color: "#fbbf24" },
      ];
    }

    return [
      {
        name: "Scope 1",
        value: dashboardData.summary.totalScope1 / 1000, // Convert kg to tonnes
        color: "#064e3b",
      },
      {
        name: "Scope 2",
        value: dashboardData.summary.totalScope2 / 1000,
        color: "#a3e635",
      },
      {
        name: "Scope 3",
        value: dashboardData.summary.totalScope3 / 1000,
        color: "#fbbf24",
      },
    ];
  }, [dashboardData]);

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2">
            <ChartPie className="h-5 w-5" /> Emission Breakdown by Scope
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2">
          <ChartPie className="h-5 w-5" /> Emission Breakdown by Scope
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-center gap-8">
          {/* Chart */}
          <ChartContainer
            config={chartConfig}
            className="aspect-square w-[250px] h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Legend (beside the chart) */}
          <div className="flex flex-col gap-4 text-sm">
            {chartData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ background: d.color }}
                />
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
