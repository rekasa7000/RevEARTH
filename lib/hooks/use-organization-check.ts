import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOrganization } from "@/lib/api/queries/organizations";

/**
 * Hook to check if user has an organization
 * Redirects to onboarding if no organization is found
 */
export function useOrganizationCheck() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: organization, isLoading, error } = useOrganization();

  useEffect(() => {
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
  }, [organization, isLoading, error, pathname, router]);

  return { organization, isLoading, hasOrganization: !!organization };
}
