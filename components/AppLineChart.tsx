"use client";

import React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartSpline } from "lucide-react";
import { useOrganizationCheck } from "@/lib/hooks/use-organization-check";
import { useDashboard } from "@/lib/api/queries/dashboard";

export const description = "A multiple line chart";

const chartConfig = {
  scope1: {
    label: "Scope 1",
    color: "var(--chart-1)",
  },
  scope2: {
    label: "Scope 2",
    color: "var(--chart-2)",
  },
  scope3: {
    label: "Scope 3",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function AppLineChart() {
  const { organization } = useOrganizationCheck();
  const { data: dashboardData, isLoading } = useDashboard(
    organization?.id || "",
    "year"
  );

  // Convert API data to chart format
  const chartData = React.useMemo(() => {
    if (!dashboardData?.trends?.monthly) {
      return [];
    }

    // Map the monthly data and convert YYYY-MM to month names
    return dashboardData.trends.monthly.map((item) => {
      const date = new Date(item.month + "-01"); // Add day to parse
      const monthName = date.toLocaleString("en-US", { month: "long" });

      return {
        month: monthName,
        scope1: item.scope1 / 1000, // Convert kg to tonnes
        scope2: item.scope2 / 1000,
        scope3: item.scope3 / 1000,
      };
    });
  }, [dashboardData]);

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-0">
          <CardTitle className="flex items-center gap-2">
            <ChartSpline className="h-5 w-5" /> Monthly Emissions Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-72 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        {/* Left side: Title */}
        <CardTitle className="flex items-center gap-2">
          <ChartSpline className="h-5 w-5" /> Monthly Emissions Trend
        </CardTitle>

        {/* Right side: Legend */}
        <div className="flex items-center gap-4">
          {Object.entries(chartConfig).map(([key, { label, color }]) => (
            <div key={key} className="flex items-center gap-1 text-sm">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-600 dark:text-gray-300">{label}</span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-72 w-full" >
          <LineChart
            data={chartData}
            margin={{ top: 5, left: 5, right: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            <Line
              dataKey="scope1"
              type="monotone"
              stroke={chartConfig.scope1.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="scope2"
              type="monotone"
              stroke={chartConfig.scope2.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="scope3"
              type="monotone"
              stroke={chartConfig.scope3.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
