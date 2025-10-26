"use client"

import * as React from "react"
import { Label, Pie, PieChart, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useOrganizationCheck } from "@/lib/hooks/use-organization-check";
import { useDashboard, DashboardPeriod } from "@/lib/api/queries/dashboard";
import { Target } from "lucide-react";

export const description = "A donut chart showing top emission sources"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface AppDonutChartProps {
  period?: DashboardPeriod;
}

export function AppDonutChart({ period = "year" }: AppDonutChartProps) {
  const { organization } = useOrganizationCheck();
  const { data: dashboardData, isLoading } = useDashboard(
    organization?.id || "",
    period
  );

  // Convert API data to chart format
  const chartData = React.useMemo(() => {
    if (!dashboardData?.topSources || dashboardData.topSources.length === 0) {
      return [];
    }

    return dashboardData.topSources.slice(0, 5).map((source, index) => ({
      category: source.category,
      value: source.value / 1000, // Convert kg to tonnes
      percentage: source.percentage,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [dashboardData]);

  const totalEmissions = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0)
  }, [chartData])

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" /> Top Emission Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="h-50 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if there's any data
  const hasData = chartData.length > 0;

  if (!hasData) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" /> Top Emission Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="h-50 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p>No data available</p>
              <p className="text-sm mt-2">Add emission records to see top sources</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" /> Top Emission Sources
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="flex items-center justify-center gap-8">
          <ChartContainer
            config={{}}
            className="aspect-square w-[200px] h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="category"
                innerRadius={60}
                outerRadius={90}
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 10}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {totalEmissions.toFixed(1)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 10}
                            className="fill-muted-foreground text-sm"
                          >
                            tCO₂e
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Legend */}
          <div className="flex flex-col gap-3 text-sm">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ background: item.fill }}
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {item.category}
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-auto">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
