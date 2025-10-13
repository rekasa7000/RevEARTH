"use client";

import React from "react";
import { BarChart4 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useOrganizationCheck } from "@/lib/hooks/use-organization-check";
import { useDashboard } from "@/lib/api/queries/dashboard";

export const description = "Emissions by category bar chart";

const chartConfig = {
  value: {
    label: "Emissions",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function AppBarChart() {
  const { organization } = useOrganizationCheck();
  const { data: dashboardData, isLoading } = useDashboard(
    organization?.id || "",
    "year"
  );

  // Convert API data to chart format
  const chartData = React.useMemo(() => {
    if (!dashboardData?.breakdown) {
      return [];
    }

    const breakdown = dashboardData.breakdown;
    return [
      { category: "Fuel", value: breakdown.fuel / 1000 }, // Convert kg to tonnes
      { category: "Vehicles", value: breakdown.vehicles / 1000 },
      { category: "Refrigerants", value: breakdown.refrigerants / 1000 },
      { category: "Electricity", value: breakdown.electricity / 1000 },
      { category: "Commuting", value: breakdown.commuting / 1000 },
    ].filter((item) => item.value > 0); // Only show categories with emissions
  }, [dashboardData]);

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2">
            <BarChart4 className="h-5 w-5" /> Emissions by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-50 flex items-center justify-center">
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
          <BarChart4 className="h-5 w-5" /> Emissions by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-50 w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="value" fill="var(--chart-1)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
