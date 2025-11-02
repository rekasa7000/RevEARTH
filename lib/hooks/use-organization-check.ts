import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOrganization } from "@/lib/api/queries/organizations";

interface UseOrganizationCheckOptions {
  /**
   * If true, will not redirect to onboarding page
   * Useful when you want to show a dialog instead
   */
  disableRedirect?: boolean;
}

/**
 * Hook to check if user has an organization
 * By default, redirects to onboarding if no organization is found
 * Set disableRedirect: true to handle organization setup manually (e.g., with a dialog)
 */
export function useOrganizationCheck(options?: UseOrganizationCheckOptions) {
  const { disableRedirect = false } = options || {};
  const router = useRouter();
  const pathname = usePathname();
  const { data: organization, isLoading, error } = useOrganization();

  useEffect(() => {
    // Skip redirect if disabled
    if (disableRedirect) return;

    // Skip check if still loading
    if (isLoading) return;

    // Skip check if already on onboarding page
    if (pathname.startsWith("/onboarding")) return;

    // Skip check for auth pages
    if (pathname.startsWith("/auth")) return;

    // If no organization found (404 error), redirect to onboarding
    if (error && !organization) {
      router.push("/onboarding/organization");
    }
  }, [organization, isLoading, error, pathname, router, disableRedirect]);

  return {
    organization,
    isLoading,
    hasOrganization: !!organization,
    needsSetup: !isLoading && !organization
  };
}
