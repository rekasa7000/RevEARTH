"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/auth-hooks";

/**
 * Guest Only Route Component
 * Wraps signin/signup pages that should only be accessible when NOT authenticated
 * Redirects authenticated users to dashboard
 */

interface GuestOnlyRouteProps {
  children: React.ReactNode;
  /**
   * Optional: Custom redirect path for authenticated users (defaults to /dashboard)
   */
  redirectTo?: string;
}

export function GuestOnlyRoute({
  children,
  redirectTo = "/dashboard",
}: GuestOnlyRouteProps) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    // Session is loading, wait
    if (session.isPending) {
      return;
    }

    // User is authenticated, redirect to dashboard
    if (session.data?.user) {
      router.push(redirectTo);
    }
  }, [session.isPending, session.data?.user, router, redirectTo]);

  // Show loading state while checking authentication
  if (session.isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // User is authenticated - don't render children (redirect will happen)
  if (session.data?.user) {
    return null;
  }

  // Not authenticated - render auth pages
  return <>{children}</>;
}
