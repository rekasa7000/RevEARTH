"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
      </div>
    </div>
  );
}
