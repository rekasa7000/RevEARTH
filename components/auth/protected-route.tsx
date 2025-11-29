"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/auth/auth-hooks";

/**
 * Protected Route Component
 * Wraps components/pages that require authentication
 * Redirects to signin if user is not authenticated
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Optional: Custom redirect path (defaults to /auth/signin)
   */
  redirectTo?: string;
  /**
   * Optional: Custom loading component
   */
  loadingComponent?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  redirectTo = "/auth/signin",
  loadingComponent,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();

  useEffect(() => {
    // Session is loading, wait
    if (session.isPending) {
      return;
    }

    // No user found, redirect to signin
    if (!session.data?.user) {
      // Store the attempted URL to redirect back after login
      const returnUrl = pathname !== redirectTo ? pathname : "/dashboard";
      router.push(`${redirectTo}?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [session.isPending, session.data?.user, router, redirectTo, pathname]);

  // Show loading state while checking authentication
  if (session.isPending) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - don't render children (redirect will happen)
  if (!session.data?.user) {
    return null;
  }

  // Handle session expiration
  // If session exists but is about to expire, show warning
  if (session.data?.session) {
    const expiresAt = new Date(session.data.session.expiresAt);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);

    // Session expires in less than 1 hour - could add a warning banner here
    if (hoursUntilExpiry < 1 && hoursUntilExpiry > 0) {
      console.warn("Session expiring soon:", {
        expiresAt,
        hoursUntilExpiry: hoursUntilExpiry.toFixed(2),
      });
      // You could dispatch a toast notification here
    }

    // Session has expired
    if (timeUntilExpiry <= 0) {
      console.error("Session has expired");
      router.push(`${redirectTo}?expired=true`);
      return null;
    }
  }

  // Authenticated - render protected content
  return <>{children}</>;
}

/**
 * Higher-order component version for wrapping page components
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    loadingComponent?: React.ReactNode;
  }
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute
        redirectTo={options?.redirectTo}
        loadingComponent={options?.loadingComponent}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
