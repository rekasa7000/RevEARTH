import { useQuery } from "@tanstack/react-query";
import { api } from "../client";

interface Facility {
  id: string;
  name: string;
  location?: string;
  address?: string;
  areaSqm?: number;
  employeeCount?: number;
  createdAt: string;
}

interface Organization {
  id: string;
  userId: string;
  name: string;
  industrySector?: string;
  occupancyType: "residential" | "commercial" | "industrial" | "lgu" | "academic";
  reportingBoundaries?: any;
  applicableScopes: {
    scope1: boolean;
    scope2: boolean;
    scope3: boolean;
  };
  createdAt: string;
  updatedAt: string;
  facilities: Facility[];
  _count: {
    emissionRecords: number;
    facilities: number;
  };
}

interface OrganizationResponse {
  organization: Organization;
}

export function useOrganization() {
  return useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      const response = await api.get<OrganizationResponse>("/api/organizations");
      return response.organization;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
