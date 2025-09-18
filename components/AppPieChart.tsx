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

// Pie chart data
const chartData = [
  { name: "Scope 1", value: 60, color: "#064e3b" },
  { name: "Scope 2", value: 20, color: "#a3e635" },
  { name: "Scope 3", value: 20, color: "#fbbf24" },
];

// Config required by ChartContainer
const chartConfig: ChartConfig = {
  scope1: { label: "Scope 1", color: "#064e3b" },
  scope2: { label: "Scope 2", color: "#a3e635" },
  scope3: { label: "Scope 3", color: "#fbbf24" },
};

export function AppPieChart() {
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
