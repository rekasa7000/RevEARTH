"use client";

import { useState, useEffect } from "react";
import { useOrganization, useUpdateOrganization } from "@/lib/api/queries/organizations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings, Building2, Shield, Check, X } from "lucide-react";
import { PageErrorBoundary } from "@/components/error-boundary";
import { SettingsSkeleton } from "@/components/skeletons";

type OccupancyType = "residential" | "commercial" | "industrial" | "lgu" | "academic";

const OCCUPANCY_TYPES: { value: OccupancyType; label: string; description: string }[] = [
  {
    value: "residential",
    label: "Residential",
    description: "Apartment buildings, condominiums, housing complexes",
  },
  {
    value: "commercial",
    label: "Commercial",
    description: "Offices, retail stores, restaurants, hotels",
  },
  {
    value: "industrial",
    label: "Industrial",
    description: "Manufacturing plants, warehouses, factories",
  },
  {
    value: "lgu",
    label: "Local Government Unit (LGU)",
    description: "City/municipal government offices and facilities",
  },
  {
    value: "academic",
    label: "Academic",
    description: "Schools, universities, educational institutions",
  },
];

const SCOPE_CONFIGURATIONS: Record<
  OccupancyType,
  { scope1: boolean; scope2: boolean; scope3: boolean }
> = {
  residential: { scope1: false, scope2: true, scope3: true },
  commercial: { scope1: true, scope2: true, scope3: true },
  industrial: { scope1: true, scope2: true, scope3: true },
  lgu: { scope1: true, scope2: true, scope3: true },
  academic: { scope1: false, scope2: true, scope3: true },
};

function SettingsContent() {
  const { data: organization, isLoading } = useOrganization();
  const updateOrganization = useUpdateOrganization();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    industrySector: "",
    occupancyType: "commercial" as OccupancyType,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with organization data
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        industrySector: organization.industrySector || "",
        occupancyType: organization.occupancyType || "commercial",
      });
    }
  }, [organization]);

  // Keyboard shortcut handler for Ctrl/Cmd+S to save
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      form?.requestSubmit();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organization) {
      toast({
        title: "Error",
        description: "Organization not found",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Organization name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const applicableScopes = SCOPE_CONFIGURATIONS[formData.occupancyType];

      await updateOrganization.mutateAsync({
        id: organization.id,
        data: {
          name: formData.name.trim(),
          industrySector: formData.industrySector.trim() || undefined,
          occupancyType: formData.occupancyType,
          applicableScopes,
        },
      });

      toast({
        title: "Success",
        description: "Organization settings updated successfully",
      });
    } catch (error) {
      console.error("Update organization error:", error);
      toast({
        title: "Error",
        description: "Failed to update organization settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        industrySector: organization.industrySector || "",
        occupancyType: organization.occupancyType || "commercial",
      });
      toast({
        title: "Reset",
        description: "Form reset to current values",
      });
    }
  };

  const currentScopes = SCOPE_CONFIGURATIONS[formData.occupancyType];
  const hasChanges =
    organization &&
    (formData.name !== organization.name ||
      formData.industrySector !== (organization.industrySector || "") ||
      formData.occupancyType !== organization.occupancyType);

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  if (!organization) {
    return (
      <div className="p-6 w-full container mx-auto max-w-[100rem]">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No organization found. Please complete onboarding first.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 w-full container mx-auto max-w-[100rem]">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your organization settings and configuration
        </p>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organization">
            <Building2 className="h-4 w-4 mr-2" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="scopes">
            <Shield className="h-4 w-4 mr-2" />
            Emission Scopes
          </TabsTrigger>
        </TabsList>

        {/* Organization Settings Tab */}
        <TabsContent value="organization">
          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>
                  Update your organization details and configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Organization Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Organization Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter organization name"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    The official name of your organization
                  </p>
                </div>

                {/* Industry Sector */}
                <div className="space-y-2">
                  <Label htmlFor="industrySector">Industry Sector</Label>
                  <Input
                    id="industrySector"
                    value={formData.industrySector}
                    onChange={(e) => setFormData({ ...formData, industrySector: e.target.value })}
                    placeholder="e.g., Manufacturing, Healthcare, Education"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Optional: Specify your organization's industry sector
                  </p>
                </div>

                {/* Occupancy Type */}
                <div className="space-y-2">
                  <Label>
                    Occupancy Type <span className="text-red-500">*</span>
                  </Label>
                  <div className="space-y-3">
                    {OCCUPANCY_TYPES.map((type) => (
                      <div
                        key={type.value}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          formData.occupancyType === type.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                        onClick={() => setFormData({ ...formData, occupancyType: type.value })}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                              formData.occupancyType === type.value
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300 dark:border-gray-600"
                            }`}
                          >
                            {formData.occupancyType === type.value && (
                              <div className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {type.label}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select the type that best describes your organization
                  </p>
                </div>

                {/* Scope Configuration Preview */}
                <div className="space-y-2">
                  <Label>Applicable Emission Scopes</Label>
                  <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Based on your occupancy type, the following scopes will be applicable:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {currentScopes.scope1 ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400" />
                          )}
                          <span
                            className={
                              currentScopes.scope1
                                ? "text-gray-900 dark:text-white font-medium"
                                : "text-gray-500 dark:text-gray-400"
                            }
                          >
                            Scope 1 - Direct Emissions
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentScopes.scope2 ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400" />
                          )}
                          <span
                            className={
                              currentScopes.scope2
                                ? "text-gray-900 dark:text-white font-medium"
                                : "text-gray-500 dark:text-gray-400"
                            }
                          >
                            Scope 2 - Indirect Emissions (Electricity)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentScopes.scope3 ? (
                            <Check className="h-5 w-5 text-green-600" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400" />
                          )}
                          <span
                            className={
                              currentScopes.scope3
                                ? "text-gray-900 dark:text-white font-medium"
                                : "text-gray-500 dark:text-gray-400"
                            }
                          >
                            Scope 3 - Other Indirect Emissions
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={!hasChanges || isSaving}
                  >
                    Reset Changes
                  </Button>
                  <Button type="submit" disabled={!hasChanges || isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Scopes Information Tab */}
        <TabsContent value="scopes">
          <Card>
            <CardHeader>
              <CardTitle>Emission Scopes Configuration</CardTitle>
              <CardDescription>
                View and understand your applicable emission scopes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Configuration */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Current Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card
                    className={
                      organization.applicableScopes.scope1
                        ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                        : "bg-gray-50 dark:bg-gray-900"
                    }
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {organization.applicableScopes.scope1 ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400" />
                        )}
                        <h4 className="font-semibold text-gray-900 dark:text-white">Scope 1</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Direct emissions from sources owned or controlled by your organization
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className={
                      organization.applicableScopes.scope2
                        ? "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950"
                        : "bg-gray-50 dark:bg-gray-900"
                    }
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {organization.applicableScopes.scope2 ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400" />
                        )}
                        <h4 className="font-semibold text-gray-900 dark:text-white">Scope 2</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Indirect emissions from purchased electricity, heat, or cooling
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className={
                      organization.applicableScopes.scope3
                        ? "border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950"
                        : "bg-gray-50 dark:bg-gray-900"
                    }
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {organization.applicableScopes.scope3 ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400" />
                        )}
                        <h4 className="font-semibold text-gray-900 dark:text-white">Scope 3</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        All other indirect emissions in your value chain
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Scope Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Scope Definitions
                </h3>

                <Card className="border-blue-200 dark:border-blue-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Scope 1: Direct Emissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Emissions from sources that are owned or controlled by your organization:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                      <li>Stationary combustion (boilers, furnaces, generators)</li>
                      <li>Mobile combustion (company-owned vehicles)</li>
                      <li>Fugitive emissions (refrigerants, air conditioning)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Scope 2: Indirect Emissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Emissions from the generation of purchased energy:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                      <li>Purchased electricity</li>
                      <li>Purchased heat or steam</li>
                      <li>Purchased cooling</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-cyan-200 dark:border-cyan-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Scope 3: Other Indirect Emissions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      All other indirect emissions in your value chain:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                      <li>Employee commuting</li>
                      <li>Business travel</li>
                      <li>Purchased goods and services</li>
                      <li>Waste disposal</li>
                      <li>Transportation and distribution</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Note */}
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> To change your applicable scopes, update your organization's
                  occupancy type in the Organization tab. Scopes are automatically configured based on
                  industry best practices for your occupancy type.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <PageErrorBoundary>
      <SettingsContent />
    </PageErrorBoundary>
  );
}
