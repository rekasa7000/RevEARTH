/**
 * Reusable skeleton loading components
 * Provides consistent loading states across the application
 */

interface SkeletonProps {
  className?: string;
}

/**
 * Base skeleton element
 */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`}
    />
  );
}

/**
 * Dashboard skeleton with 4 cards and chart areas
 */
export function DashboardSkeleton() {
  return (
    <div className="p-6 w-full container mx-auto max-w-[100rem]">
      <div className="animate-pulse space-y-6">
        {/* Page title */}
        <Skeleton className="h-8 w-1/3" />

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </div>
  );
}

/**
 * Table skeleton with header and rows
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-6 w-full container mx-auto max-w-[100rem]">
      <div className="animate-pulse space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b">
            <div className="grid grid-cols-5 gap-4">
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
              <Skeleton className="h-4" />
            </div>
          </div>

          {/* Table rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0">
              <div className="grid grid-cols-5 gap-4">
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Form skeleton with fields
 */
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="p-6 w-full container mx-auto max-w-[100rem]">
      <div className="animate-pulse space-y-6">
        {/* Page title */}
        <Skeleton className="h-8 w-1/4" />

        {/* Form card */}
        <div className="border rounded-lg p-6 space-y-6">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}

          {/* Action buttons */}
          <div className="flex justify-between pt-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Card grid skeleton
 */
export function CardGridSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="p-6 w-full container mx-auto max-w-[100rem]">
      <div className="animate-pulse space-y-6">
        {/* Page title */}
        <Skeleton className="h-8 w-1/4" />

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="border rounded-lg p-6 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-8 w-24 mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Reports page skeleton with summary and charts
 */
export function ReportsSkeleton() {
  return (
    <div className="p-6 w-full container mx-auto max-w-[100rem]">
      <div className="animate-pulse space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Summary banner */}
        <Skeleton className="h-32 w-full" />

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>

        {/* Category breakdown */}
        <Skeleton className="h-96" />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    </div>
  );
}

/**
 * Calculation page skeleton
 */
export function CalculationSkeleton() {
  return (
    <div className="p-6 w-full container mx-auto max-w-[100rem]">
      <div className="animate-pulse space-y-6">
        {/* Page title */}
        <Skeleton className="h-8 w-1/3" />

        {/* Tool title */}
        <div className="flex justify-center">
          <Skeleton className="h-6 w-48" />
        </div>

        {/* Emission record selector */}
        <div className="flex justify-center">
          <Skeleton className="h-10 w-96" />
        </div>

        {/* Scope buttons */}
        <div className="flex justify-center gap-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Content area */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-48" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Settings page skeleton
 */
export function SettingsSkeleton() {
  return (
    <div className="p-6 w-full container mx-auto max-w-[100rem]">
      <div className="animate-pulse space-y-6">
        {/* Page title */}
        <Skeleton className="h-8 w-1/4" />

        {/* Tabs */}
        <Skeleton className="h-10 w-64" />

        {/* Form card */}
        <div className="border rounded-lg p-6 space-y-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />

          {/* Form fields */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Occupancy type cards */}
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>

          {/* Action buttons */}
          <div className="flex justify-between pt-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Generic page skeleton with title and content
 */
export function PageSkeleton() {
  return (
    <div className="p-6 w-full container mx-auto max-w-[100rem]">
      <div className="animate-pulse space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
