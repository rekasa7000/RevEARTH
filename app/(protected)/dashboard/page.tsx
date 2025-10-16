"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrganizationCheck } from "@/lib/hooks/use-organization-check";
import { useDashboard, DashboardPeriod } from "@/lib/api/queries/dashboard";
import { PageErrorBoundary } from "@/components/error-boundary";
import { DashboardSkeleton } from "@/components/skeletons";

function DashboardContent() {
  const [period, setPeriod] = useState<DashboardPeriod>("year");
  const queryClient = useQueryClient();
  const { organization, isLoading: orgLoading } = useOrganizationCheck();
  const { data: dashboardData, isLoading: dashboardLoading, isFetching } = useDashboard(
    organization?.id || "",
    period
  );

  const isLoading = orgLoading || dashboardLoading;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Check if there's any data
  const hasData = dashboardData?.summary?.totalCo2eYtd && dashboardData.summary.totalCo2eYtd > 0;

  return (
    <div className="p-6 w-full container mx-auto max-w-[100rem]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Emissions Dashboard
          </h1>
          {organization && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {organization.name}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Tabs value={period} onValueChange={(value) => setPeriod(value as DashboardPeriod)}>
            <TabsList>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="quarter">This Quarter</TabsTrigger>
              <TabsTrigger value="year">This Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {!hasData ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                No Emissions Data Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                You haven't recorded any emissions data yet. Start by adding your facilities and creating emission records to see your dashboard analytics.
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button
                  onClick={() => window.location.href = '/facilities'}
                  variant="default"
                >
                  Add Facilities
                </Button>
                <Button
                  onClick={() => window.location.href = '/calculation'}
                  variant="outline"
                >
                  Record Emissions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
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
          <AppPieChart period={period} />
        </div>

        <div>
          <AppLineChart period={period} />
        </div>

        <div>
          <AppBarChart period={period} />
        </div>

        <div>
          <AppDonutChart period={period} />
        </div>
      </div>
        </>
      )}
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

export default function Dashboard() {
  return (
    <PageErrorBoundary>
      <DashboardContent />
    </PageErrorBoundary>
  );
}
