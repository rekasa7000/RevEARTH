"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser, useSession } from "@/lib/auth/auth-hooks";
import { useOrganization } from "@/lib/api/queries/organizations";
import { Building2, MapPin, Users, FileText, CheckCircle2, XCircle, Calendar, Mail, Shield } from "lucide-react";

export default function Profile() {
  const user = useUser();
  const session = useSession();
  const { data: organization, isLoading: orgLoading, error: orgError } = useOrganization();

  if (session.isPending) {
    return (
      <div className="p-6 w-full container mx-auto max-w-[100rem]">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 w-full container mx-auto max-w-[100rem]">
        <p className="text-gray-600 dark:text-gray-400">No user data available.</p>
      </div>
    );
  }

  const sessionData = session.data?.session;
  const expiresAt = sessionData?.expiresAt ? new Date(sessionData.expiresAt) : null;

  const occupancyTypeLabels = {
    residential: "Residential",
    commercial: "Commercial",
    industrial: "Industrial",
    lgu: "Local Government Unit",
    academic: "Academic Institution",
  };

  return (
    <div className="p-6 w-full container mx-auto max-w-[100rem]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Manage your account and organization information</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Status</p>
                <p className="text-2xl font-bold mt-1">
                  {user.emailVerified ? (
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6" /> Verified
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <XCircle className="w-6 h-6" /> Unverified
                    </span>
                  )}
                </p>
              </div>
              <Shield className="w-12 h-12 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Facilities</p>
                <p className="text-2xl font-bold mt-1">{organization?._count.facilities || 0}</p>
              </div>
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Emission Records</p>
                <p className="text-2xl font-bold mt-1">{organization?._count.emissionRecords || 0}</p>
              </div>
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Your account details and contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 mt-0.5 text-gray-500" />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 mt-0.5 text-gray-500" />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">{user.name || "Not set"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 mt-0.5 text-gray-500" />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  }) : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 mt-0.5 text-gray-500" />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Session Expires</label>
                <p className="mt-1 text-gray-900 dark:text-gray-100">
                  {expiresAt ? expiresAt.toLocaleString() : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Information */}
      {orgLoading ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      ) : organization ? (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Organization Information
              </CardTitle>
              <CardDescription>Details about your organization and reporting configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Organization Name</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{organization.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Occupancy Type</label>
                  <p className="mt-1">
                    <Badge variant="secondary" className="text-sm">
                      {occupancyTypeLabels[organization.occupancyType]}
                    </Badge>
                  </p>
                </div>

                {organization.industrySector && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Industry Sector</label>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{organization.industrySector}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Applicable Scopes</label>
                  <div className="mt-2 flex gap-2">
                    {organization.applicableScopes.scope1 && (
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        Scope 1
                      </Badge>
                    )}
                    {organization.applicableScopes.scope2 && (
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
                        Scope 2
                      </Badge>
                    )}
                    {organization.applicableScopes.scope3 && (
                      <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        Scope 3
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          {organization.facilities && organization.facilities.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Facilities ({organization.facilities.length})
                </CardTitle>
                <CardDescription>Your registered facilities and locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {organization.facilities.map((facility) => (
                    <div key={facility.id} className="border dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{facility.name}</h4>
                          {facility.location && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {facility.location}
                            </p>
                          )}
                          {facility.address && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{facility.address}</p>
                          )}
                          <div className="flex gap-4 mt-2 text-sm">
                            {facility.areaSqm && (
                              <span className="text-gray-600 dark:text-gray-400">
                                Area: {Number(facility.areaSqm).toLocaleString()} m²
                              </span>
                            )}
                            {facility.employeeCount && (
                              <span className="text-gray-600 dark:text-gray-400">
                                Employees: {facility.employeeCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : orgError ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p className="text-amber-600 dark:text-amber-400">
              No organization found. Please create an organization to start tracking emissions.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
