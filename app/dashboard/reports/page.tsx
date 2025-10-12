"use client";

import React, { useState } from "react";
import {
  Pie,
  PieChart,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  BarChart,
  Bar,
} from "recharts";
import { MoreVertical } from "lucide-react";

const monthlyData = [
  { month: "Jan", scope1: 20, scope2: 15, scope3: 18 },
  { month: "Feb", scope1: 22, scope2: 17, scope3: 16 },
  { month: "Mar", scope1: 25, scope2: 18, scope3: 19 },
  { month: "Apr", scope1: 23, scope2: 16, scope3: 17 },
  { month: "May", scope1: 24, scope2: 19, scope3: 15 },
  { month: "Jun", scope1: 26, scope2: 20, scope3: 16 },
  { month: "Jul", scope1: 28, scope2: 21, scope3: 18 },
  { month: "Aug", scope1: 27, scope2: 19, scope3: 17 },
  { month: "Sep", scope1: 25, scope2: 18, scope3: 16 },
  { month: "Oct", scope1: 23, scope2: 17, scope3: 15 },
  { month: "Nov", scope1: 22, scope2: 16, scope3: 14 },
  { month: "Dec", scope1: 20, scope2: 15, scope3: 13 },
];

const scope1Categories: Record<string, { description: string; data: Array<{ source: string; value: number }> }> = {
  "Stationary Combustion": {
    description:
      "Emissions from stationary combustion represent the release of greenhouse gases resulting from the burning of fuels in fixed or stationary sources such as various equipment and machinery, including boilers, heaters, furnaces, kilns, ovens, flares, thermal oxidizers, dryers, and any other devices that combust carbon-bearing fuels or waste stream materials.",
    data: [
      { source: "Boilers", value: 400 },
      { source: "Furnaces", value: 350 },
      { source: "Heaters", value: 200 },
      { source: "Ovens", value: 250 },
    ],
  },
  "Mobile Combustion": {
    description:
      "Mobile combustion emissions come from transportation sources owned or controlled by the organization, including vehicles, aircraft, ships, and other mobile equipment that burn fuel.",
    data: [
      { source: "Vehicles", value: 500 },
      { source: "Aircraft", value: 200 },
      { source: "Ships", value: 100 },
    ],
  },
  "Refrigeration & AC": {
    description:
      "Emissions from refrigeration and air conditioning systems result from the release of refrigerant gases, which are potent greenhouse gases that can leak from cooling equipment during operation, maintenance, or disposal.",
    data: [
      { source: "HVAC Systems", value: 300 },
      { source: "Cold Storage", value: 250 },
      { source: "Leak Events", value: 150 },
    ],
  },
} as const satisfies Record<string, { description: string; data: Array<{ source: string; value: number }> }>;

const scope2Categories = {
  "Purchased Electricity": {
    description:
      "Purchased electricity includes the indirect release of greenhouse gases resulting from the generation of electricity that an organization uses from the grid of a supplier. This category is important in evaluating the environmental impact of an entity's electricity consumption, offering valuable information on the indirect emissions associated with the electricity usage.",
  },
};

const scope3Categories = {
  "Employee Commuting": {
    description:
      "Emissions from employees traveling to and from work in personal vehicles or public transportation.",
  },
};

const categoryValues = {
  "Stationary Combustion": 1000,
  "Mobile Combustion": 1000,
  "Refrigeration & AC": 1000,
  "Purchased Electricity": 1000,
  "Employee Commuting": 1000,
};

export default function Reports() {
  const [activeScope1Tab, setActiveScope1Tab] = useState("Stationary Combustion");

  const chartData = [
    { name: "Direct", value: 275, color: "#3b82f6" },
    { name: "Indirect", value: 200, color: "#a855f7" },
    { name: "Other Indirect", value: 187, color: "#06b6d4" },
  ];

  const colors = ["#3b82f6", "#a855f7", "#06b6d4", "#f59e0b"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Emissions Summary
        </h1>
      </div>

      {/* Title */}
      <div className="px-6 py-2">
        <h2 className="text-xl font-semibold text-gray-900 text-center">
          ABC Company&apos;s total estimated greenhouse gas emissions is:
        </h2>
      </div>

      {/* Total Emissions Banner */}
      <div className="flex justify-center py-6">
        <div className="bg-gray-200 rounded-lg px-6 py-4 border border-gray-400 flex items-center gap-4">
          <span className="text-4xl font-bold text-gray-900">10,000</span>
          <span className="text-sm text-gray-700">
            Metric tons of carbon dioxide equivalent (tCO2e)
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 py-4">
        {/* Left: Pie Chart */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Emission Summary (by scope)
              </h3>
              <button className="text-gray-400 hover:text-gray-600" title="More options">
                <MoreVertical size={20} />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Categories and Line Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Categories Box */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Emission Categories
            </h3>
            <div className="space-y-3">
              {Object.entries(categoryValues).map(([category, value]) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {category}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {value.toLocaleString()}{" "}
                    <span className="text-gray-500 font-normal">(tCO2e)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Emissions Trend
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="scope1"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Direct"
                />
                <Line
                  type="monotone"
                  dataKey="scope2"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                  name="Indirect"
                />
                <Line
                  type="monotone"
                  dataKey="scope3"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  name="Other Indirect"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scope 1 Section */}
      <div className="px-6 py-8 ">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Scope 1: Direct Emissions
          </h2>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Export report"
            title="Download report"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {Object.keys(scope1Categories).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveScope1Tab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeScope1Tab === tab
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 leading-relaxed mb-6">
          {scope1Categories[activeScope1Tab].description}
        </p>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={scope1Categories[activeScope1Tab].data}
                  dataKey="value"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {scope1Categories[activeScope1Tab].data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={scope1Categories[activeScope1Tab].data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="source" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scope 2 Section */}
      <div className="px-6 py-8 ">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Scope 2: Indirect Emissions
          </h2>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Export report"
            title="Download report"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 leading-relaxed mb-6">
          {scope2Categories["Purchased Electricity"].description}
        </p>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="scope2"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                  name="Purchased Electricity"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Bar dataKey="scope2" fill="#a855f7" name="Purchased Electricity" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Scope 3 Section */}
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Scope 3: Other Indirect Emissions
          </h2>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Export report"
            title="Download report"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Categories as static list */}
        <div className="space-y-4">
          {Object.entries(scope3Categories).map(([category, data]) => (
            <div key={category} className="pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category}
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                {data.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg border border-gray-200 h-48" />
                <div className="bg-gray-50 rounded-lg border border-gray-200 h-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}