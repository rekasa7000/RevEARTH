"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface OrganizationSetupDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function OrganizationSetupDialog({
  open,
  onOpenChange
}: OrganizationSetupDialogProps) {
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

      // Close dialog and refresh page
      onOpenChange?.(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto"
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-center">
            Set Up Your Organization
          </DialogTitle>
          <DialogDescription className="text-center">
            Let&apos;s get started by setting up your organization profile to begin tracking emissions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Organization Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Organization Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Organization Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Acme Corporation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={createOrganization.isPending}
                    className="mt-1.5"
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
                    disabled={createOrganization.isPending}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Occupancy Type */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Occupancy Type *</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Select your organization type to automatically configure emission scopes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {occupancyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, occupancyType: option.value })}
                  disabled={createOrganization.isPending}
                  className={`relative p-4 border-2 rounded-lg text-left transition-all ${
                    formData.occupancyType === option.value
                      ? "border-[#A5C046] bg-[#A5C046]/10"
                      : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">
                        {option.label}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {option.description}
                      </p>
                      <span className="text-xs font-medium text-[#00594D] dark:text-[#A5C046]">
                        {option.scopes}
                      </span>
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
          </div>

          {/* Scope Configuration Preview */}
          {formData.occupancyType && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Automatic Scope Configuration
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    The following emission scopes will be configured:
                  </p>
                  <ul className="space-y-1">
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
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={createOrganization.isPending || !formData.name || !formData.occupancyType}
              className="bg-[#A5C046] hover:bg-[#8fa33a] text-white"
            >
              {createOrganization.isPending ? "Creating..." : "Complete Setup"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
