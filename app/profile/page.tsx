"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="max-w-3xl mx-auto py-6 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage your account information and preferences.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {session.user?.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {session.user?.name || "Not provided"}
                </p>
              </div>
            </div>
            
            {session.user?.image && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Profile Picture
                </label>
                <img 
                  src={session.user.image} 
                  alt="Profile" 
                  className="mt-2 w-16 h-16 rounded-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>Technical information about your current session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>User ID:</strong> {session.user?.id || "N/A"}</p>
              <p><strong>Session Expires:</strong> Never (JWT)</p>
              <p><strong>Auth Provider:</strong> {session.user?.image ? "OAuth Provider" : "Email/Password"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full">
                Update Profile Information
              </Button>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              <Button variant="outline" className="w-full">
                Privacy Settings
              </Button>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </div>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Note: These are demo buttons for learning purposes and don't perform actual actions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}