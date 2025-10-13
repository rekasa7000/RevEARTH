"use client";

import { useState } from "react";
import { AppBarChart } from "@/components/AppBarChart";
import { AppDonutChart } from "@/components/AppDonutChart";
import { AppLineChart } from "@/components/AppLineChart";
import { AppPieChart } from "@/components/AppPieChart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganizationCheck } from "@/lib/hooks/use-organization-check";
import { useDashboard, DashboardPeriod } from "@/lib/api/queries/dashboard";

export default function Dashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("year");
  const { organization, isLoading: orgLoading } = useOrganizationCheck();
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboard(
    organization?.id || "",
    period
  );

  const isLoading = orgLoading || dashboardLoading;

  if (isLoading) {
    return (
      <div className="p-6 w-full container mx-auto max-w-[100rem]">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full container mx-auto max-w-[100rem]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Emissions Dashboard
        </h1>
        {organization && (
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {organization.name}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Total CO₂e Emissions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <p className="text-2xl font-bold">
              {dashboardData?.summary.totalCo2eYtd
                ? `${(dashboardData.summary.totalCo2eYtd / 1000).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} tCO₂e`
                : "0.00 tCO₂e"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Emissions per Employee
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <p className="text-2xl font-bold">
              {dashboardData?.summary.emissionsPerEmployee
                ? (dashboardData.summary.emissionsPerEmployee / 1000).toFixed(2)
                : "0.00"}
            </p>
            <span className="ml-1 text-gray-600 dark:text-gray-400">
              tCO₂e/employee
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Largest Source
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <p className="text-2xl font-bold">
              {dashboardData?.topSources && dashboardData.topSources.length > 0
                ? dashboardData.topSources[0].category
                : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-600 dark:text-gray-300">
              Employees
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <p className="text-2xl font-bold">
              {dashboardData?.organization.totalEmployees?.toLocaleString() || "0"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <AppPieChart />
        </div>

        <div>
          <AppLineChart />
        </div>

        <div>
          <AppBarChart />
        </div>

        <div>
          <AppDonutChart />
        </div>
      </div>
      {/* <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, dummy!</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            This is your protected dashboard. Only authenticated users can see this page.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Session Info</CardTitle>
              <CardDescription>Your current authentication details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> dummy@dummy.com
                </p>
                <p>
                  <strong>Name:</strong> dummy
                </p>
                <p>
                  <strong>Provider:</strong> Credentials
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your activity overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Login Count:</strong> 1
                </p>
                <p>
                  <strong>Last Login:</strong> Just now
                </p>
                <p>
                  <strong>Account Status:</strong> Active
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Things you can do</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>• View your profile</p>
                <p>• Update settings</p>
                <p>• Access protected content</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Learning Points</CardTitle>
            <CardDescription>Key concepts demonstrated in this authentication setup</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Frontend (Client-Side)</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>useSession hook for session state</li>
                  <li>signIn/signOut functions</li>
                  <li>Client-side route protection</li>
                  <li>Conditional rendering based on auth state</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Backend (Server-Side)</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>NextAuth.js configuration</li>
                  <li>Multiple auth providers (OAuth + Credentials)</li>
                  <li>Middleware for route protection</li>
                  <li>JWT session management</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
}
