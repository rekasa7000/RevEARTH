"use client";

import { useState } from "react";
import { useOrganizationCheck } from "@/lib/hooks/use-organization-check";
import {
  useFacilities,
  useCreateFacility,
  useUpdateFacility,
  useDeleteFacility,
  type Facility,
} from "@/lib/api/queries/facilities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FacilitiesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [deletingFacilityId, setDeletingFacilityId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    address: "",
    areaSqm: "",
    employeeCount: "",
  });

  const { toast } = useToast();
  const { organization, isLoading: orgLoading } = useOrganizationCheck();
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities(
    organization?.id || ""
  );
  const createFacility = useCreateFacility();
  const updateFacility = useUpdateFacility();
  const deleteFacility = useDeleteFacility();

  const isLoading = orgLoading || facilitiesLoading;

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      address: "",
      areaSqm: "",
      employeeCount: "",
    });
    setEditingFacility(null);
  };

  const handleOpenDialog = (facility?: Facility) => {
    if (facility) {
      setEditingFacility(facility);
      setFormData({
        name: facility.name,
        location: facility.location || "",
        address: facility.address || "",
        areaSqm: facility.areaSqm?.toString() || "",
        employeeCount: facility.employeeCount?.toString() || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTimeout(resetForm, 200); // Reset after animation
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organization) return;

    try {
      if (editingFacility) {
        // Update existing facility
        await updateFacility.mutateAsync({
          id: editingFacility.id,
          data: {
            name: formData.name,
            location: formData.location || null,
            address: formData.address || null,
            areaSqm: formData.areaSqm ? parseFloat(formData.areaSqm) : null,
            employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : null,
          },
        });

        toast({
          title: "Success",
          description: "Facility updated successfully",
        });
      } else {
        // Create new facility
        await createFacility.mutateAsync({
          organizationId: organization.id,
          name: formData.name,
          location: formData.location || undefined,
          address: formData.address || undefined,
          areaSqm: formData.areaSqm ? parseFloat(formData.areaSqm) : undefined,
          employeeCount: formData.employeeCount ? parseInt(formData.employeeCount) : undefined,
        });

        toast({
          title: "Success",
          description: "Facility created successfully",
        });
      }

      handleCloseDialog();
    } catch (error) {
      toast({
        title: "Error",
        description: editingFacility
          ? "Failed to update facility"
          : "Failed to create facility",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (facilityId: string) => {
    setDeletingFacilityId(facilityId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFacilityId) return;

    try {
      await deleteFacility.mutateAsync(deletingFacilityId);

      toast({
        title: "Success",
        description: "Facility deleted successfully",
      });

      setDeletingFacilityId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete facility",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeletingFacilityId(null);
  };

  if (isLoading) {
    return (
      <div className="p-6 w-full container mx-auto max-w-[100rem]">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full container mx-auto max-w-[100rem]">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Facilities
          </h1>
          {organization && (
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your organization's facilities and locations
            </p>
          )}
        </div>

        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Facility
        </Button>
      </div>

      {/* Facilities Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Facilities</CardTitle>
        </CardHeader>
        <CardContent>
          {!facilities || facilities.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No facilities yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get started by adding your first facility
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Area (sqm)</TableHead>
                  <TableHead className="text-right">Employees</TableHead>
                  <TableHead className="text-right">Records</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {facilities.map((facility) => (
                  <TableRow key={facility.id}>
                    <TableCell className="font-medium">
                      {facility.name}
                    </TableCell>
                    <TableCell>
                      {facility.location || (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {facility.address || (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {facility.areaSqm?.toLocaleString() || (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {facility.employeeCount?.toLocaleString() || (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {facility._count?.electricityUsage || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(facility)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(facility.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Facility Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingFacility ? "Edit Facility" : "Add New Facility"}
            </DialogTitle>
            <DialogDescription>
              {editingFacility
                ? "Update the facility information below."
                : "Enter the details for the new facility."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Facility Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Facility Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Main Office, Warehouse A"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., New York, London"
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Enter full address"
                  rows={3}
                />
              </div>

              {/* Area (sqm) */}
              <div className="space-y-2">
                <Label htmlFor="areaSqm">Area (sqm)</Label>
                <Input
                  id="areaSqm"
                  type="number"
                  step="0.01"
                  value={formData.areaSqm}
                  onChange={(e) =>
                    setFormData({ ...formData, areaSqm: e.target.value })
                  }
                  placeholder="e.g., 5000"
                />
              </div>

              {/* Employee Count */}
              <div className="space-y-2">
                <Label htmlFor="employeeCount">Employee Count</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  step="1"
                  value={formData.employeeCount}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeCount: e.target.value })
                  }
                  placeholder="e.g., 100"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createFacility.isPending || updateFacility.isPending}
              >
                {createFacility.isPending || updateFacility.isPending
                  ? "Saving..."
                  : editingFacility
                  ? "Update Facility"
                  : "Create Facility"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingFacilityId} onOpenChange={(open) => !open && handleDeleteCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the facility
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleteFacility.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
