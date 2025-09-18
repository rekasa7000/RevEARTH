"use client";

import { Calendar } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A multiple bar chart";

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

export function AppBarChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Year-over-Year Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-50 w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="scope1" fill="var(--chart-1)" radius={4} />
            <Bar dataKey="scope2" fill="var(--chart-2)" radius={4} />
            <Bar dataKey="scope3" fill="var(--chart-3)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
