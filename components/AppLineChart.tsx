"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartSpline } from "lucide-react";

export const description = "A multiple line chart";

const chartData = [
  { month: "January", scope1: 186, scope2: 80, scope3: 100 },
  { month: "February", scope1: 305, scope2: 200, scope3: 50 },
  { month: "March", scope1: 237, scope2: 120, scope3: 150 },
  { month: "April", scope1: 73, scope2: 190, scope3: 400 },
  { month: "May", scope1: 209, scope2: 130, scope3: 200 },
  { month: "June", scope1: 214, scope2: 140, scope3: 250 },
  { month: "July", scope1: 186, scope2: 80, scope3: 100 },
  { month: "August", scope1: 305, scope2: 200, scope3: 50 },
  { month: "September", scope1: 237, scope2: 120, scope3: 150 },
  { month: "October", scope1: 73, scope2: 190, scope3: 400 },
  { month: "November", scope1: 209, scope2: 130, scope3: 200 },
  { month: "December", scope1: 214, scope2: 140, scope3: 250 },
];

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
