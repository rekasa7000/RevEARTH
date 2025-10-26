"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Check } from "lucide-react";
import { useCreateOrganization } from "@/lib/api/queries/organizations";

type OccupancyType = "residential" | "commercial" | "industrial" | "lgu" | "academic";

interface OccupancyOption {
  value: OccupancyType;
  label: string;
  description: string;
  scopes: string;
}

const occupancyOptions: OccupancyOption[] = [
  {
    value: "residential",
    label: "Residential",
    description: "Apartment complexes, condominiums",
    scopes: "Scope 1 & 2"
  },
  {
    value: "commercial",
    label: "Commercial",
    description: "Offices, retail, hospitality",
    scopes: "Scope 1, 2 & 3"
  },
  {
    value: "industrial",
    label: "Industrial",
    description: "Manufacturing, warehouses",
    scopes: "Scope 1, 2 & 3"
  },
  {
    value: "lgu",
    label: "Local Government Unit",
    description: "Government facilities",
    scopes: "Scope 1, 2 & 3"
  },
  {
    value: "academic",
    label: "Academic Institution",
    description: "Schools, universities",
    scopes: "Scope 1, 2 & 3"
  }
];

export default function OrganizationSetup() {
  const router = useRouter();
  const createOrganization = useCreateOrganization();

  const [formData, setFormData] = useState({
    name: "",
    industrySector: "",
    occupancyType: "" as OccupancyType | ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Organization name is required");
      return;
    }

    if (!formData.occupancyType) {
      setError("Please select an occupancy type");
      return;
    }

    try {
      // Automatically configure scopes based on occupancy type
      const applicableScopes = formData.occupancyType === "residential"
        ? { scope1: true, scope2: true, scope3: false }
        : { scope1: true, scope2: true, scope3: true };

      await createOrganization.mutateAsync({
        name: formData.name,
        industrySector: formData.industrySector || undefined,
        occupancyType: formData.occupancyType,
        applicableScopes
      });

      // Redirect to dashboard after successful setup
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create organization");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Set Up Your Organization
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let's get started by setting up your organization profile
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Enter your organization's basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Acme Corporation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="industrySector">Industry Sector (Optional)</Label>
                <Input
                  id="industrySector"
                  type="text"
                  placeholder="e.g., Technology, Manufacturing, Retail"
                  value={formData.industrySector}
                  onChange={(e) => setFormData({ ...formData, industrySector: e.target.value })}
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Occupancy Type *</CardTitle>
              <CardDescription>
                Select your organization type. This will automatically configure applicable emission scopes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {occupancyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, occupancyType: option.value })}
                    disabled={isLoading}
                    className={`relative p-4 border-2 rounded-lg text-left transition-all ${
                      formData.occupancyType === option.value
                        ? "border-[#A5C046] bg-[#A5C046]/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {option.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {option.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#00594D] dark:text-[#A5C046]">
                            {option.scopes}
                          </span>
                        </div>
                      </div>
                      {formData.occupancyType === option.value && (
                        <div className="flex-shrink-0 ml-3">
                          <div className="w-6 h-6 bg-[#A5C046] rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {formData.occupancyType && (
            <Card className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Automatic Scope Configuration
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Based on your selection, the following emission scopes will be configured:
                    </p>
                    <ul className="mt-2 space-y-1">
                      <li className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Scope 1 - Direct emissions (fuel, vehicles, refrigerants)</span>
                      </li>
                      <li className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>Scope 2 - Indirect emissions (electricity)</span>
                      </li>
                      {formData.occupancyType !== "residential" && (
                        <li className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          <span>Scope 3 - Other indirect emissions (employee commuting)</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={createOrganization.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createOrganization.isPending || !formData.name || !formData.occupancyType}
              className="bg-[#A5C046] hover:bg-[#8fa33a] text-white"
            >
              {createOrganization.isPending ? "Creating..." : "Complete Setup"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
