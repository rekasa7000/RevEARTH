# RevEarth Frontend - Complete Implementation Plan
## Comprehensive Task Breakdown from Start to Finish

**Created:** 2025-10-12
**Status:** Living Document
**Overall Progress:** ~35% Complete

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Current State Analysis](#current-state-analysis)
3. [Phase 1: Auth Foundation](#phase-1-auth-foundation-completed) ✅
4. [Phase 2: Organization & Onboarding](#phase-2-organization--onboarding-completed) ✅
5. [Phase 3: API Layer - Query Hooks](#phase-3-api-layer---query-hooks) 🔄
6. [Phase 4: Calculation Page Implementation](#phase-4-calculation-page-implementation) 🔴
7. [Phase 5: Dashboard Integration](#phase-5-dashboard-integration) 🔴
8. [Phase 6: Facilities Management](#phase-6-facilities-management) 🔴
9. [Phase 7: Reports & Analytics](#phase-7-reports--analytics) 🔴
10. [Phase 8: Settings & Configuration](#phase-8-settings--configuration) 🔴
11. [Phase 9: Error Handling & UX Polish](#phase-9-error-handling--ux-polish) 🔴
12. [Phase 10: Testing & Optimization](#phase-10-testing--optimization) 🔴
13. [File Structure Reference](#file-structure-reference)
14. [API Endpoints Reference](#api-endpoints-reference)

---

## Project Overview

### System Description
RevEarth is a GHG (Greenhouse Gas) Inventory Platform for Filipino businesses, LGUs, academic institutions, and commercial facilities to track Scope 1, 2, and 3 carbon emissions.

### Tech Stack
- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **State Management:** React Query (@tanstack/react-query)
- **Auth:** better-auth
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma ORM
- **Charts:** Recharts (already in use)

### Key Features
1. Authentication & user management
2. Organization setup with occupancy-based scope configuration
3. Multi-scope emission data entry (Scope 1, 2, 3)
4. Automatic CO2e calculations using EPA & Philippine emission factors
5. Real-time dashboard with charts and analytics
6. PDF reports and CSV exports
7. Multi-facility support

---

## Current State Analysis

### ✅ Completed (35%)

#### Infrastructure
- [x] Next.js 14 project setup
- [x] Tailwind CSS configured
- [x] shadcn/ui components installed
- [x] React Query provider configured
- [x] API client wrapper (`lib/api/client.ts`)
- [x] TypeScript types (`lib/api/types.ts`)

#### Authentication (100%)
- [x] better-auth configuration (`lib/auth.ts`)
- [x] Auth hooks (`lib/auth/auth-hooks.ts`)
  - [x] `useSession()`
  - [x] `useUser()`
  - [x] `signInWithEmail()`
  - [x] `signUpWithEmail()`
  - [x] `signOutUser()`
- [x] Protected route component (`components/auth/protected-route.tsx`)
- [x] Guest-only route component (`components/auth/guest-only-route.tsx`)
- [x] Sign in page (`app/auth/signin/page.tsx`)
- [x] Sign up page (`app/auth/signup/page.tsx`)
- [x] User menu component (`components/auth/user-menu.tsx`)
- [x] Session persistence & expiration handling

#### Organization & Onboarding (100%)
- [x] Organization API endpoints
  - [x] `POST /api/organizations` - Create organization
  - [x] `GET /api/organizations` - Get user's organization
  - [x] `PATCH /api/organizations/:id` - Update organization
- [x] Organization onboarding page (`app/onboarding/organization/page.tsx`)
  - [x] Occupancy type selection UI
  - [x] Auto-scope configuration
  - [x] Validation & error handling
- [x] Organization check hook (`lib/hooks/use-organization-check.ts`)
- [x] Organization query hook (`lib/api/queries/organizations.ts`)

#### UI Components
- [x] Sidebar navigation (`components/sidebar.tsx`)
- [x] Dashboard layout (`app/dashboard/layout.tsx`)
- [x] Chart components (AppBarChart, AppDonutChart, AppLineChart, AppPieChart)
- [x] Card, Button, Input, Label (shadcn/ui)
- [x] Loading skeleton components

#### Backend API (100%)
All API endpoints are fully implemented:
- [x] Auth endpoints (`/api/auth/*`)
- [x] Organizations (`/api/organizations`)
- [x] Facilities (`/api/facilities`)
- [x] Emission records (`/api/emission-records`)
- [x] Fuel usage (`/api/fuel-usage`)
- [x] Electricity usage (`/api/electricity-usage`)
- [x] Commuting data (`/api/commuting-data`)
- [x] Vehicle usage (`/api/vehicle-usage`)
- [x] Calculations (`/api/calculations`)
- [x] Dashboard (`/api/dashboard`)
- [x] Analytics (`/api/analytics/trends`, `/api/analytics/comparison`)
- [x] Emission factors constants (`lib/constants/emission-factors.ts`)
- [x] Calculation engine service (`lib/services/calculation-engine.ts`)

### 🔄 In Progress (60%)

#### API Query Hooks
- [x] `lib/api/queries/organizations.ts` ✅ COMPLETE
  - [x] `useOrganization()` query hook
  - [x] `useCreateOrganization()` mutation hook
  - [x] `useUpdateOrganization()` mutation hook with optimistic updates
  - [x] TypeScript interfaces exported
  - [x] Integrated into onboarding page
- [x] `lib/api/queries/facilities.ts` ✅ COMPLETE
  - [x] `useFacilities()` query hook
  - [x] `useFacility()` query hook for single facility
  - [x] `useCreateFacility()` mutation hook
  - [x] `useUpdateFacility()` mutation hook with optimistic updates
  - [x] `useDeleteFacility()` mutation hook
  - [x] All TypeScript interfaces defined
- [x] `lib/api/queries/emission-records.ts` ✅ COMPLETE
  - [x] `useEmissionRecords()` query hook with pagination
  - [x] `useEmissionRecord()` query hook for single record
  - [x] `useCreateEmissionRecord()` mutation hook
  - [x] `useUpdateEmissionRecord()` mutation hook with optimistic updates
  - [x] `useDeleteEmissionRecord()` mutation hook
  - [x] All TypeScript interfaces defined
- [x] `lib/api/queries/fuel-usage.ts` ✅ COMPLETE
  - [x] `useFuelUsage()` query hook
  - [x] `useCreateFuelUsage()` mutation hook
  - [x] `useUpdateFuelUsage()` mutation hook with optimistic updates
  - [x] `useDeleteFuelUsage()` mutation hook with optimistic removal
  - [x] All TypeScript interfaces defined
- [x] `lib/api/queries/vehicle-usage.ts` ✅ COMPLETE
  - [x] `useVehicleUsage()` query hook
  - [x] `useCreateVehicleUsage()` mutation hook
  - [x] `useUpdateVehicleUsage()` mutation hook with optimistic updates
  - [x] `useDeleteVehicleUsage()` mutation hook with optimistic removal
  - [x] All TypeScript interfaces defined
  - [x] ⚠️ Note: Backend PATCH/DELETE endpoints need implementation
- [x] `lib/api/queries/electricity-usage.ts` ✅ COMPLETE
  - [x] `useElectricityUsage()` query hook
  - [x] `useCreateElectricityUsage()` mutation hook
  - [x] `useUpdateElectricityUsage()` mutation hook with optimistic updates
  - [x] `useDeleteElectricityUsage()` mutation hook with optimistic removal
  - [x] All TypeScript interfaces defined
  - [x] Triple query invalidation (electricity-usage + emission-record + facility)
  - [x] ⚠️ Note: Backend PATCH/DELETE endpoints need implementation
- [ ] All other query files missing (3 files remaining)

### 🔴 Not Started (55%)

#### Critical Gaps
1. **Calculation Page** - Core feature, completely non-functional
   - Uses fake data (`getSampleDataForScope()`)
   - Form submissions don't persist to API
   - No real API integration

2. **Dashboard Real Data** - Shows hardcoded stats
   - No API calls to `/api/dashboard`
   - Placeholder charts

3. **API Query Hooks** - Missing ~95% of query hooks
   - No facilities queries
   - No emission records queries
   - No fuel/electricity/commuting queries
   - No calculations queries

4. **UX Components**
   - No toast/notification system
   - No error boundary
   - No global error handling

---

## Phase 1: Auth Foundation ✅ COMPLETED

**Status:** 100% Complete
**Files Modified:** 8 files created/modified
**Estimated Time:** ✅ Completed

### Tasks Completed
- [x] **1.1** Create `lib/auth/auth-hooks.ts` with better-auth client ✅
  - Location: `lib/auth/auth-hooks.ts`
  - Exports: `useSession()`, `useUser()`, `useIsAuthenticated()`, `signInWithEmail()`, `signUpWithEmail()`, `signOutUser()`
  - Dependencies: better-auth/react

- [x] **1.2** Create protected route wrapper ✅
  - Location: `components/auth/protected-route.tsx`
  - Features: Loading state, session expiration handling, return URL storage
  - Exports: `ProtectedRoute` component, `withAuth()` HOC

- [x] **1.3** Create guest-only route wrapper ✅
  - Location: `components/auth/guest-only-route.tsx`
  - Purpose: Prevent authenticated users from accessing auth pages

- [x] **1.4** Implement sign in page ✅
  - Location: `app/auth/signin/page.tsx`
  - Features: Email/password form, error handling, return URL redirect, session expired message

- [x] **1.5** Implement sign up page ✅
  - Location: `app/auth/signup/page.tsx`
  - Features: Email/password/name form, validation, redirect after signup

- [x] **1.6** Create user menu component ✅
  - Location: `components/auth/user-menu.tsx`
  - Features: User avatar with initials, dropdown menu, logout functionality

- [x] **1.7** Add auth to dashboard layout ✅
  - Location: `app/dashboard/layout.tsx`
  - Protected with: `<ProtectedRoute>` wrapper

- [x] **1.8** Integrate user menu into sidebar ✅
  - Location: `components/sidebar.tsx`
  - Features: User info display, logout in dropdown

### Verification Steps
- [x] Sign up flow works
- [x] Sign in flow works
- [x] Protected routes redirect to signin
- [x] Session persistence on refresh
- [x] Logout works correctly
- [x] Return URL redirect after login

---

## Phase 2: Organization & Onboarding ✅ COMPLETED

**Status:** 100% Complete
**Files Modified:** 4 files created
**Estimated Time:** ✅ Completed

### Tasks Completed
- [x] **2.1** Create organization query hook ✅
  - Location: `lib/api/queries/organizations.ts`
  - Hook: `useOrganization()`
  - Features: Fetches user's organization, auto-retry, 5min cache

- [x] **2.2** Create organization check hook ✅
  - Location: `lib/hooks/use-organization-check.ts`
  - Hook: `useOrganizationCheck()`
  - Features: Auto-redirect to onboarding if no org

- [x] **2.3** Build organization onboarding page ✅
  - Location: `app/onboarding/organization/page.tsx`
  - Features:
    - Organization name & industry sector inputs
    - Occupancy type selection (5 types)
    - Visual cards with checkmarks
    - Auto-scope configuration display
    - API integration with POST /api/organizations
    - Error handling & loading states
    - Redirect to dashboard on completion

- [x] **2.4** Integrate org check into dashboard ✅
  - Location: `app/dashboard/page.tsx`
  - Uses: `useOrganizationCheck()` hook
  - Shows: Organization name in header

### Verification Steps
- [x] New user redirected to onboarding
- [x] Organization creation persists
- [x] Scopes auto-configured based on occupancy type
- [x] User with org can access dashboard
- [x] Onboarding page has proper validation

---

## Phase 3: API Layer - Query Hooks 🔄 IN PROGRESS

**Status:** 60% Complete (6 of 10 sections completed, 3 files remaining)
**Files to Create:** 3 files
**Estimated Time:** 2-3 hours remaining

### Overview
Create React Query hooks for all API endpoints to provide type-safe, cached data fetching with optimistic updates.

---

### 3.1 Organizations Mutations ✅ COMPLETED
**File:** `lib/api/queries/organizations.ts` (extend existing)
**Completed:** 2025-10-12

#### Tasks Completed
- [x] **3.1.1** Add `useCreateOrganization()` mutation hook ✅
  - Implemented with proper cache update
  - Automatically sets query data on success
  - Error logging included
  - **Location:** `lib/api/queries/organizations.ts:98-120`

- [x] **3.1.2** Add `useUpdateOrganization()` mutation hook ✅
  - Implemented with optimistic updates
  - Rollback on error
  - Proper cache invalidation
  - **Location:** `lib/api/queries/organizations.ts:126-170`

- [x] **3.1.3** Add TypeScript types ✅
  - `CreateOrganizationInput` interface exported
  - `UpdateOrganizationInput` interface exported
  - `Organization` interface exported
  - All types properly documented
  - **Location:** `lib/api/queries/organizations.ts:18-68`

- [x] **3.1.4** Replace direct API call in onboarding page with mutation hook ✅
  - Removed `api` import
  - Added `useCreateOrganization()` hook
  - Replaced `isLoading` state with `createOrganization.isPending`
  - Proper error handling maintained
  - **Location:** `app/onboarding/organization/page.tsx:10,56,85-96,247,253,256`

#### Acceptance Criteria Met
- [x] Mutation hooks follow React Query best practices
  - Uses `useMutation` from @tanstack/react-query
  - Proper `queryClient` integration
  - `onSuccess`, `onMutate`, `onError` callbacks implemented
- [x] Cache invalidation works correctly
  - `invalidateQueries` called on success
  - Optimistic updates with rollback on error
- [x] Type safety enforced
  - All interfaces exported and used
  - No `any` types used
- [x] Loading/error states handled
  - `isPending` state available
  - Error objects accessible via mutation.error

---

### 3.2 Facilities Queries ✅ COMPLETED
**File:** `lib/api/queries/facilities.ts` (create new)
**Completed:** 2025-10-12
**Time Spent:** 3 hours

#### Tasks Completed
- [x] **3.2.1** Create file `lib/api/queries/facilities.ts` ✅
  - **Location:** `lib/api/queries/facilities.ts:1-244`

- [x] **3.2.2** Add `useFacilities()` query hook ✅
  - Fetches all facilities for an organization
  - Returns facilities with electricity usage count
  - Ordered by creation date (newest first)
  - Stale time: 5 minutes
  - **Location:** `lib/api/queries/facilities.ts:83-97`

- [x] **3.2.3** Add `useFacility()` query hook for single facility ✅
  - Fetches single facility with organization details
  - Includes electricity usage count
  - Stale time: 3 minutes
  - **Location:** `lib/api/queries/facilities.ts:104-117`

- [x] **3.2.4** Add `useCreateFacility()` mutation hook ✅
  - Creates new facility
  - Automatic cache invalidation for the list
  - Sets new facility in cache immediately
  - **Location:** `lib/api/queries/facilities.ts:126-152`

- [x] **3.2.5** Add `useUpdateFacility()` mutation hook ✅
  - Updates existing facility
  - Optimistic updates with rollback on error
  - Proper cache management
  - Invalidates list after success
  - **Location:** `lib/api/queries/facilities.ts:160-211`

- [x] **3.2.6** Add `useDeleteFacility()` mutation hook ✅
  - Deletes facility
  - Automatic cache cleanup
  - Invalidates facilities list
  - Prevents deletion errors with proper error handling
  - **Location:** `lib/api/queries/facilities.ts:219-244`

- [x] **3.2.7** Add TypeScript interfaces ✅
  - `Facility` - Main facility interface with optional _count
  - `FacilityWithOrganization` - Facility with organization details
  - `CreateFacilityInput` - Create payload
  - `UpdateFacilityInput` - Update payload
  - All response interfaces defined
  - **Location:** `lib/api/queries/facilities.ts:5-68`

#### Acceptance Criteria Met
- [x] All CRUD operations have hooks
  - Create, Read (list + single), Update, Delete all implemented
- [x] Optimistic updates for mutations
  - Update mutation has optimistic updates with rollback
- [x] Proper cache invalidation
  - Lists invalidated after create/update/delete
  - Single queries invalidated appropriately
- [x] Error handling included
  - Console error logging in all mutation hooks
  - Error callbacks defined

---

### 3.3 Emission Records Queries ✅ COMPLETED
**File:** `lib/api/queries/emission-records.ts` (create new)
**Completed:** 2025-10-12
**Time Spent:** 3 hours

#### Tasks Completed
- [x] **3.3.1** Create file `lib/api/queries/emission-records.ts` ✅
  - **Location:** `lib/api/queries/emission-records.ts:1-278`

- [x] **3.3.2** Add `useEmissionRecords()` query with pagination ✅
  - Supports pagination with page/limit parameters
  - Status filtering (draft, submitted, validated, archived)
  - Automatic cache invalidation
  - **Location:** `lib/api/queries/emission-records.ts:104-136`

- [x] **3.3.3** Add `useEmissionRecord()` query for single record ✅
  - Fetches single emission record with all related data
  - Includes fuel, vehicle, electricity, commuting data
  - Includes calculation results
  - **Location:** `lib/api/queries/emission-records.ts:144-156`

- [x] **3.3.4** Add `useCreateEmissionRecord()` mutation ✅
  - Creates new emission record
  - Automatic cache invalidation for the list
  - Sets new record in cache immediately
  - **Location:** `lib/api/queries/emission-records.ts:164-189`

- [x] **3.3.5** Add `useUpdateEmissionRecord()` mutation ✅
  - Updates existing emission record
  - Optimistic updates with rollback on error
  - Proper cache management
  - **Location:** `lib/api/queries/emission-records.ts:197-246`

- [x] **3.3.6** Add `useDeleteEmissionRecord()` mutation ✅
  - Deletes emission record (cascade deletes all related data)
  - Automatic cache cleanup
  - Warning included in JSDoc
  - **Location:** `lib/api/queries/emission-records.ts:254-278`

- [x] **3.3.7** Add TypeScript interfaces ✅
  - `EmissionRecord` - Main record interface
  - `EmissionRecordWithDetails` - Record with all relations
  - `EmissionRecordCount` - Count of related entries
  - `EmissionCalculation` - Calculation results
  - `CreateEmissionRecordInput` - Create payload
  - `UpdateEmissionRecordInput` - Update payload
  - All response interfaces defined
  - **Location:** `lib/api/queries/emission-records.ts:5-97`

#### Acceptance Criteria Met
- [x] Pagination works smoothly
  - keepPreviousData not used (modern approach with queryKey)
  - Page and limit parameters properly handled
- [x] Single record fetching works
  - Returns record with all relations
  - Enabled guard prevents unnecessary calls
- [x] Create/update/delete mutations work
  - All CRUD operations implemented
  - Proper TypeScript typing
- [x] Cache updates properly on mutations
  - Optimistic updates for update mutation
  - Automatic invalidation for lists
  - Rollback on error implemented

---

### 3.4 Fuel Usage Queries ✅ COMPLETED
**File:** `lib/api/queries/fuel-usage.ts` (create new)
**Completed:** 2025-10-12
**Time Spent:** 2 hours

#### Tasks Completed
- [x] **3.4.1** Create file `lib/api/queries/fuel-usage.ts` ✅
  - **Location:** `lib/api/queries/fuel-usage.ts:1-250`

- [x] **3.4.2** Add `useFuelUsage()` query hook ✅
  - Fetches all fuel usage entries for an emission record
  - Ordered by entry date (newest first)
  - Stale time: 2 minutes
  - **Location:** `lib/api/queries/fuel-usage.ts:70-84`

- [x] **3.4.3** Add `useCreateFuelUsage()` mutation hook ✅
  - Creates new fuel usage entry
  - Invalidates fuel-usage list for the emission record
  - Invalidates emission record to update counts
  - **Location:** `lib/api/queries/fuel-usage.ts:93-117`

- [x] **3.4.4** Add `useUpdateFuelUsage()` mutation hook ✅
  - Updates existing fuel usage entry
  - Optimistic updates with rollback on error
  - Invalidates both fuel-usage and emission-record queries
  - **Location:** `lib/api/queries/fuel-usage.ts:125-177`

- [x] **3.4.5** Add `useDeleteFuelUsage()` mutation hook ✅
  - Deletes fuel usage entry
  - Optimistic removal from cache
  - Rollback on error
  - Invalidates both fuel-usage and emission-record queries
  - Requires both id and emissionRecordId parameters
  - **Location:** `lib/api/queries/fuel-usage.ts:185-250`

- [x] **3.4.6** Add TypeScript interfaces ✅
  - `FuelType` - Type union for valid fuel types
  - `FuelUsage` - Main fuel usage interface
  - `CreateFuelUsageInput` - Create payload
  - `UpdateFuelUsageInput` - Update payload
  - All response interfaces defined
  - **Location:** `lib/api/queries/fuel-usage.ts:5-59`

#### Acceptance Criteria Met
- [x] Fetch fuel usage by emission record
  - Query hook filters by emissionRecordId
- [x] Create new fuel entries
  - Create mutation with proper validation
- [x] Update existing entries
  - Update mutation with optimistic updates
- [x] Delete entries
  - Delete mutation with optimistic removal and rollback
- [x] Invalidates both fuel-usage and emission-record queries
  - All mutations invalidate both query types to keep data fresh

---

### 3.5 Vehicle Usage Queries ✅ COMPLETED
**File:** `lib/api/queries/vehicle-usage.ts` (create new)
**Completed:** 2025-10-12
**Time Spent:** 2 hours

#### Tasks Completed
- [x] **3.5.1** Create file `lib/api/queries/vehicle-usage.ts` ✅
  - **Location:** `lib/api/queries/vehicle-usage.ts:1-260`

- [x] **3.5.2** Add `useVehicleUsage()` query hook ✅
  - Fetches all vehicle usage entries for an emission record
  - Ordered by entry date (newest first)
  - Stale time: 2 minutes
  - **Location:** `lib/api/queries/vehicle-usage.ts:76-90`

- [x] **3.5.3** Add `useCreateVehicleUsage()` mutation hook ✅
  - Creates new vehicle usage entry
  - Invalidates vehicle-usage list for the emission record
  - Invalidates emission record to update counts
  - **Location:** `lib/api/queries/vehicle-usage.ts:99-123`

- [x] **3.5.4** Add `useUpdateVehicleUsage()` mutation hook ✅
  - Updates existing vehicle usage entry
  - Optimistic updates with rollback on error
  - Invalidates both vehicle-usage and emission-record queries
  - ⚠️ **Note:** Backend endpoint PATCH /api/vehicle-usage/:id needs to be implemented
  - **Location:** `lib/api/queries/vehicle-usage.ts:131-183`

- [x] **3.5.5** Add `useDeleteVehicleUsage()` mutation hook ✅
  - Deletes vehicle usage entry
  - Optimistic removal from cache
  - Rollback on error
  - Invalidates both vehicle-usage and emission-record queries
  - Requires both id and emissionRecordId parameters
  - ⚠️ **Note:** Backend endpoint DELETE /api/vehicle-usage/:id needs to be implemented
  - **Location:** `lib/api/queries/vehicle-usage.ts:191-260`

- [x] **3.5.6** Add TypeScript interfaces ✅
  - `VehicleType` - Type union for vehicle types (sedan, suv, truck, van, motorcycle)
  - `VehicleFuelType` - Type union for fuel types
  - `VehicleUsage` - Main vehicle usage interface
  - `CreateVehicleUsageInput` - Create payload
  - `UpdateVehicleUsageInput` - Update payload
  - All response interfaces defined
  - **Location:** `lib/api/queries/vehicle-usage.ts:5-65`

#### Acceptance Criteria Met
- [x] Similar structure to fuel-usage queries
  - Follows same patterns as fuel-usage
  - Dual query invalidation (vehicle-usage + emission-record)
- [x] Handles both fuel-based and mileage-based calculations
  - Supports optional fuelConsumed and mileage fields
  - At least one required (validated by backend)

#### Notes
- ⚠️ **Backend API Gap:** Update (PATCH) and Delete (DELETE) endpoints for `/api/vehicle-usage/:id` need to be implemented on the backend
- Frontend hooks are ready and will work once backend endpoints are added
- Following the same pattern as fuel-usage endpoints

---

### 3.6 Electricity Usage Queries ✅ COMPLETED
**File:** `lib/api/queries/electricity-usage.ts` (create new)
**Completed:** 2025-10-12
**Time Spent:** 2 hours

#### Tasks Completed
- [x] **3.6.1** Create file `lib/api/queries/electricity-usage.ts` ✅
  - **Location:** `lib/api/queries/electricity-usage.ts:1-284`

- [x] **3.6.2** Add `useElectricityUsage()` query hook ✅
  - Fetches all electricity usage entries for an emission record
  - Includes facility details when available
  - Ordered by billing period start (newest first)
  - Stale time: 2 minutes
  - **Location:** `lib/api/queries/electricity-usage.ts:83-97`

- [x] **3.6.3** Add `useCreateElectricityUsage()` mutation hook ✅
  - Creates new electricity usage entry
  - Invalidates electricity-usage list for the emission record
  - Invalidates emission record to update counts
  - **Also invalidates facility data** if associated with a facility
  - **Location:** `lib/api/queries/electricity-usage.ts:106-139`

- [x] **3.6.4** Add `useUpdateElectricityUsage()` mutation hook ✅
  - Updates existing electricity usage entry
  - Optimistic updates with rollback on error
  - Invalidates electricity-usage, emission-record, and facility queries
  - ⚠️ **Note:** Backend endpoint PATCH /api/electricity-usage/:id needs to be implemented
  - **Location:** `lib/api/queries/electricity-usage.ts:147-206`

- [x] **3.6.5** Add `useDeleteElectricityUsage()` mutation hook ✅
  - Deletes electricity usage entry
  - Optimistic removal from cache
  - Rollback on error
  - Invalidates electricity-usage, emission-record, and facility queries
  - Requires id, emissionRecordId, and optional facilityId parameters
  - ⚠️ **Note:** Backend endpoint DELETE /api/electricity-usage/:id needs to be implemented
  - **Location:** `lib/api/queries/electricity-usage.ts:214-284`

- [x] **3.6.6** Add TypeScript interfaces ✅
  - `ElectricityUsage` - Main electricity usage interface with optional facility
  - `CreateElectricityUsageInput` - Create payload
  - `UpdateElectricityUsageInput` - Update payload
  - All response interfaces defined
  - Supports utilityBillData as flexible JSON object
  - **Location:** `lib/api/queries/electricity-usage.ts:5-75`

#### Acceptance Criteria Met
- [x] Supports facility filtering
  - Optional facilityId in all operations
  - Facility details included in query response
- [x] Handles billing period dates
  - billingPeriodStart and billingPeriodEnd required
  - Proper date handling in all operations
- [x] Optional peak/off-peak breakdown
  - peakHoursKwh and offpeakHoursKwh as optional fields
  - Supports detailed billing breakdowns

#### Notes
- ⚠️ **Backend API Gap:** Update (PATCH) and Delete (DELETE) endpoints for `/api/electricity-usage/:id` need to be implemented on the backend
- **Triple Query Invalidation:** All mutations invalidate electricity-usage, emission-record, AND facility queries (when applicable)
- Frontend hooks are ready and will work once backend endpoints are added

---

### 3.7 Commuting Data Queries 🔴 NOT STARTED
**File:** `lib/api/queries/commuting-data.ts` (create new)
**Estimated Time:** 2 hours
**Dependencies:** API endpoint `/api/commuting-data` ✅ exists

#### Tasks
- [ ] **3.7.1** Create file `lib/api/queries/commuting-data.ts`

- [ ] **3.7.2** Add `useCommutingData()` query hook

- [ ] **3.7.3** Add `useCreateCommutingData()` mutation hook

- [ ] **3.7.4** Add `useUpdateCommutingData()` mutation hook

- [ ] **3.7.5** Add `useDeleteCommutingData()` mutation hook

- [ ] **3.7.6** Add TypeScript interfaces
  ```typescript
  interface CommutingData {
    id: string;
    emissionRecordId: string;
    employeeCount: number;
    avgDistanceKm?: number;
    transportMode: 'car' | 'motorcycle' | 'bus' | 'jeepney' | 'train' | 'bicycle' | 'walking';
    daysPerWeek?: number;
    wfhDays?: number;
    co2eCalculated?: number;
    surveyDate?: string;
  }
  ```

#### Acceptance Criteria
- [ ] Handles transport mode selection
- [ ] Calculates work-from-home days
- [ ] Validates employee count

---

### 3.8 Calculations Queries 🔴 NOT STARTED
**File:** `lib/api/queries/calculations.ts` (create new)
**Estimated Time:** 2 hours
**Dependencies:** API endpoint `/api/calculations` ✅ exists

#### Tasks
- [ ] **3.8.1** Create file `lib/api/queries/calculations.ts`

- [ ] **3.8.2** Add `useCalculation()` query hook
  ```typescript
  export function useCalculation(emissionRecordId: string) {
    return useQuery({
      queryKey: ['calculation', emissionRecordId],
      queryFn: async () => {
        const response = await api.get<CalculationResponse>(
          `/api/calculations/${emissionRecordId}`
        );
        return response.calculation;
      },
      enabled: !!emissionRecordId,
    });
  }
  ```

- [ ] **3.8.3** Add `useTriggerCalculation()` mutation hook
  ```typescript
  export function useTriggerCalculation() {
    return useMutation({
      mutationFn: async (emissionRecordId: string) => {
        return api.post('/api/calculations', { emissionRecordId });
      },
      onSuccess: (data) => {
        queryClient.setQueryData(
          ['calculation', data.calculation.emissionRecordId],
          data.calculation
        );
        queryClient.invalidateQueries({
          queryKey: ['emission-record', data.calculation.emissionRecordId],
        });
      },
    });
  }
  ```

- [ ] **3.8.4** Add TypeScript interfaces (reference CALCULATION_ENGINE.md)

#### Acceptance Criteria
- [ ] Fetches existing calculations
- [ ] Triggers new calculations
- [ ] Updates cache immediately after calculation
- [ ] Handles calculation errors

---

### 3.9 Dashboard Queries 🔴 NOT STARTED
**File:** `lib/api/queries/dashboard.ts` (create new)
**Estimated Time:** 2 hours
**Dependencies:** API endpoint `/api/dashboard` ✅ exists

#### Tasks
- [ ] **3.9.1** Create file `lib/api/queries/dashboard.ts`

- [ ] **3.9.2** Add `useDashboard()` query hook
  ```typescript
  export function useDashboard(
    organizationId: string,
    period: 'year' | 'quarter' | 'month' = 'year'
  ) {
    return useQuery({
      queryKey: ['dashboard', organizationId, period],
      queryFn: async () => {
        const response = await api.get<DashboardResponse>(
          `/api/dashboard?organizationId=${organizationId}&period=${period}`
        );
        return response;
      },
      enabled: !!organizationId,
      staleTime: 2 * 60 * 1000, // 2 minutes - dashboard changes frequently
    });
  }
  ```

- [ ] **3.9.3** Add TypeScript interfaces (reference DASHBOARD_API.md)
  ```typescript
  interface DashboardResponse {
    summary: {
      totalCo2eYtd: number;
      totalScope1: number;
      totalScope2: number;
      totalScope3: number;
      emissionsPerEmployee: number;
      totalRecords: number;
      recordsWithCalculations: number;
      trend: {
        percentage: number;
        direction: 'increase' | 'decrease';
        comparedTo: string;
      };
    };
    trends: {
      monthly: Array<{
        month: string;
        totalCo2e: number;
        scope1: number;
        scope2: number;
        scope3: number;
      }>;
    };
    breakdown: Record<string, number>;
    topSources: Array<{
      category: string;
      value: number;
      percentage: number;
    }>;
    organization: {
      name: string;
      occupancyType: string;
      facilitiesCount: number;
      totalEmployees: number;
    };
  }
  ```

#### Acceptance Criteria
- [ ] Fetches dashboard summary
- [ ] Supports period filtering
- [ ] Includes trends and breakdowns
- [ ] Type-safe response handling

---

### 3.10 Analytics Queries 🔴 NOT STARTED
**File:** `lib/api/queries/analytics.ts` (create new)
**Estimated Time:** 2 hours
**Dependencies:** API endpoints `/api/analytics/*` ✅ exist

#### Tasks
- [ ] **3.10.1** Create file `lib/api/queries/analytics.ts`

- [ ] **3.10.2** Add `useTrends()` query hook
  ```typescript
  export function useTrends(organizationId: string, months: number = 12) {
    return useQuery({
      queryKey: ['analytics', 'trends', organizationId, months],
      queryFn: async () => {
        const response = await api.get<TrendsResponse>(
          `/api/analytics/trends?organizationId=${organizationId}&months=${months}`
        );
        return response;
      },
      enabled: !!organizationId,
    });
  }
  ```

- [ ] **3.10.3** Add `useComparison()` query hook
  ```typescript
  export function useComparison(
    organizationId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      compareBy?: 'scope' | 'facility' | 'category';
    }
  ) {
    return useQuery({
      queryKey: ['analytics', 'comparison', organizationId, options],
      queryFn: async () => {
        const params = new URLSearchParams({
          organizationId,
          ...(options?.startDate && { startDate: options.startDate }),
          ...(options?.endDate && { endDate: options.endDate }),
          ...(options?.compareBy && { compareBy: options.compareBy }),
        });

        const response = await api.get<ComparisonResponse>(
          `/api/analytics/comparison?${params}`
        );
        return response;
      },
      enabled: !!organizationId,
    });
  }
  ```

- [ ] **3.10.4** Add TypeScript interfaces (reference DASHBOARD_API.md)

#### Acceptance Criteria
- [ ] Trends query works with configurable months
- [ ] Comparison supports multiple comparison types
- [ ] Date range filtering works
- [ ] Proper caching strategy

---

### Phase 3 Summary

**Total Files to Create:** 8 files (6 completed, 2 remaining)
**Total Tasks:** ~12 remaining
**Estimated Time:** 2-3 hours remaining

**Completed:**
1. ✅ Organizations Mutations (section 3.1) - 2 hours
2. ✅ Facilities Queries (section 3.2) - 3 hours
3. ✅ Emission Records Queries (section 3.3) - 3 hours
4. ✅ Fuel Usage Queries (section 3.4) - 2 hours
5. ✅ Vehicle Usage Queries (section 3.5) - 2 hours
6. ✅ Electricity Usage Queries (section 3.6) - 2 hours

**Priority Order (Remaining):**
1. ⚠️ **CRITICAL** - Commuting Usage (section 3.7 - needed for calculation page)
2. ⚠️ **HIGH** - Calculations (section 3.8 - needed for calculation page)
3. ⚠️ **HIGH** - Dashboard (section 3.9 - needed for dashboard page)
4. ⚠️ **LOW** - Analytics (section 3.10 - nice to have for reports)

---

## Phase 4: Calculation Page Implementation 🔴 NOT STARTED

**Status:** 0% Complete
**Current State:** Uses fake data, doesn't persist
**Estimated Time:** 16-20 hours
**Priority:** ⚠️ CRITICAL - Core feature

### Current Problems
1. Uses `getSampleDataForScope()` - fake data generator
2. Modal form submissions don't call API
3. Data only lives in component state
4. No integration with calculation engine
5. No validation or error handling

### File to Modify
- `app/calculation/page.tsx` (867 lines - major refactor)
- `app/calculation/columns.tsx` (table column definitions)
- `app/calculation/data-table.tsx` (table component)

---

### 4.1 Refactor Data Loading 🔴 NOT STARTED
**Estimated Time:** 4 hours

#### Tasks
- [ ] **4.1.1** Remove fake data functions
  - Delete `getSampleDataForScope()` function
  - Delete all sample data generators
  - Remove hardcoded data arrays

- [ ] **4.1.2** Add emission record state management
  ```typescript
  const [currentEmissionRecord, setCurrentEmissionRecord] = useState<string | null>(null);
  const [currentScope, setCurrentScope] = useState<'stationary' | 'mobile' | 'refrigeration' | 'scope2' | 'scope3'>('stationary');
  ```

- [ ] **4.1.3** Replace data loading with query hooks
  ```typescript
  // For Scope 1 - Stationary Combustion
  const { data: fuelData, isLoading: fuelLoading } = useFuelUsage(currentEmissionRecord || '');

  // For Scope 1 - Mobile Combustion
  const { data: vehicleData, isLoading: vehicleLoading } = useVehicleUsage(currentEmissionRecord || '');

  // For Scope 2
  const { data: electricityData, isLoading: electricityLoading } = useElectricityUsage(currentEmissionRecord || '');

  // For Scope 3
  const { data: commutingData, isLoading: commutingLoading } = useCommutingData(currentEmissionRecord || '');
  ```

- [ ] **4.1.4** Update `loadData()` function
  ```typescript
  const loadData = (scopeSelection: string) => {
    setCurrentScope(scopeSelection);
    // Data will be loaded automatically by query hooks
    // No need to manually fetch
  };
  ```

- [ ] **4.1.5** Add emission record selector
  ```tsx
  <Select
    value={currentEmissionRecord || ''}
    onValueChange={setCurrentEmissionRecord}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select reporting period" />
    </SelectTrigger>
    <SelectContent>
      {emissionRecords?.map(record => (
        <SelectItem key={record.id} value={record.id}>
          {format(new Date(record.reportingPeriodStart), 'MMM yyyy')}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  ```

#### Acceptance Criteria
- [ ] No more fake data
- [ ] Real API data loads correctly
- [ ] Loading states display
- [ ] Empty states handled

---

### 4.2 Implement Form Submissions 🔴 NOT STARTED
**Estimated Time:** 6 hours

#### Tasks
- [ ] **4.2.1** Add mutation hooks to component
  ```typescript
  const createFuel = useCreateFuelUsage();
  const createVehicle = useCreateVehicleUsage();
  const createElectricity = useCreateElectricityUsage();
  const createCommuting = useCreateCommutingData();
  ```

- [ ] **4.2.2** Refactor `handleSubmit()` for Scope 1 - Stationary
  ```typescript
  const handleSubmit = async () => {
    if (currentScope === 'stationary') {
      await createFuel.mutateAsync({
        emissionRecordId: currentEmissionRecord!,
        fuelType: formData.fuelType,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        entryDate: formData.entryDate,
        metadata: formData.metadata
      });

      setIsModalOpen(false);
      setFormData({});
    }
  };
  ```

- [ ] **4.2.3** Implement Scope 1 - Mobile submission
  ```typescript
  if (currentScope === 'mobile') {
    await createVehicle.mutateAsync({
      emissionRecordId: currentEmissionRecord!,
      vehicleId: formData.vehicleId,
      vehicleType: formData.vehicleType,
      fuelType: formData.fuelType,
      fuelConsumed: parseFloat(formData.fuelConsumed),
      unit: formData.unit,
      entryDate: formData.entryDate
    });
  }
  ```

- [ ] **4.2.4** Implement Scope 1 - Refrigeration submission
  ```typescript
  if (currentScope === 'refrigeration') {
    await createRefrigerant.mutateAsync({
      emissionRecordId: currentEmissionRecord!,
      equipmentId: formData.equipmentId,
      refrigerantType: formData.refrigerantType,
      quantityLeaked: parseFloat(formData.quantityLeaked),
      quantityPurchased: parseFloat(formData.quantityPurchased),
      unit: formData.unit,
      entryDate: formData.entryDate
    });
  }
  ```

- [ ] **4.2.5** Implement Scope 2 submission
  ```typescript
  if (currentScope === 'scope2') {
    await createElectricity.mutateAsync({
      emissionRecordId: currentEmissionRecord!,
      facilityId: formData.facilityId,
      meterNumber: formData.meterNumber,
      kwhConsumption: parseFloat(formData.kwhConsumption),
      peakHoursKwh: formData.peakHoursKwh ? parseFloat(formData.peakHoursKwh) : undefined,
      offpeakHoursKwh: formData.offpeakHoursKwh ? parseFloat(formData.offpeakHoursKwh) : undefined,
      billingPeriodStart: formData.billingPeriodStart,
      billingPeriodEnd: formData.billingPeriodEnd,
      utilityBillData: formData.utilityBillData
    });
  }
  ```

- [ ] **4.2.6** Implement Scope 3 submission
  ```typescript
  if (currentScope === 'scope3') {
    await createCommuting.mutateAsync({
      emissionRecordId: currentEmissionRecord!,
      employeeCount: parseInt(formData.employeeCount),
      avgDistanceKm: parseFloat(formData.avgDistanceKm),
      transportMode: formData.transportMode,
      daysPerWeek: parseInt(formData.daysPerWeek),
      wfhDays: parseInt(formData.wfhDays),
      surveyDate: formData.surveyDate
    });
  }
  ```

- [ ] **4.2.7** Add loading states to form
  ```typescript
  const isSubmitting =
    createFuel.isPending ||
    createVehicle.isPending ||
    createElectricity.isPending ||
    createCommuting.isPending;
  ```

- [ ] **4.2.8** Add error handling
  ```typescript
  const error =
    createFuel.error ||
    createVehicle.error ||
    createElectricity.error ||
    createCommuting.error;

  {error && (
    <Alert variant="destructive">
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  )}
  ```

#### Acceptance Criteria
- [ ] All scope submissions work
- [ ] Data persists to database
- [ ] Loading states show during submission
- [ ] Success feedback after submission
- [ ] Error messages display
- [ ] Modal closes on success

---

### 4.3 Add Real-time Calculations 🔴 NOT STARTED
**Estimated Time:** 3 hours

#### Tasks
- [ ] **4.3.1** Add calculation trigger button
  ```tsx
  <Button
    onClick={() => triggerCalculation.mutate(currentEmissionRecord!)}
    disabled={!currentEmissionRecord || triggerCalculation.isPending}
  >
    {triggerCalculation.isPending ? 'Calculating...' : 'Calculate Emissions'}
  </Button>
  ```

- [ ] **4.3.2** Display calculation results
  ```tsx
  const { data: calculation } = useCalculation(currentEmissionRecord || '');

  {calculation && (
    <Card>
      <CardHeader>
        <CardTitle>Calculation Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total CO2e</p>
            <p className="text-2xl font-bold">{calculation.totalCo2e} tCO2e</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Scope 1</p>
            <p className="text-xl">{calculation.totalScope1Co2e} tCO2e</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Scope 2</p>
            <p className="text-xl">{calculation.totalScope2Co2e} tCO2e</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )}
  ```

- [ ] **4.3.3** Add auto-calculation option (optional)
  ```typescript
  // Auto-trigger calculation after data entry
  onSuccess: async (data) => {
    await triggerCalculation.mutateAsync(currentEmissionRecord!);
  }
  ```

#### Acceptance Criteria
- [ ] Calculation button works
- [ ] Results display correctly
- [ ] Loading state during calculation
- [ ] Results update in real-time

---

### 4.4 Improve Form Validation 🔴 NOT STARTED
**Estimated Time:** 3 hours

#### Tasks
- [ ] **4.4.1** Install validation library (if not exists)
  ```bash
  npm install zod react-hook-form @hookform/resolvers
  ```

- [ ] **4.4.2** Create validation schemas
  ```typescript
  import { z } from 'zod';

  const fuelUsageSchema = z.object({
    fuelType: z.enum(['natural_gas', 'heating_oil', 'propane', 'diesel', 'gasoline']),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    entryDate: z.string().min(1, 'Entry date is required'),
  });
  ```

- [ ] **4.4.3** Add validation to forms
  ```typescript
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fuelUsageSchema),
  });
  ```

- [ ] **4.4.4** Display validation errors
  ```tsx
  {errors.quantity && (
    <p className="text-sm text-red-600">{errors.quantity.message}</p>
  )}
  ```

- [ ] **4.4.5** Add client-side range validation
  - Quantity > 0
  - Dates are valid
  - Required fields filled

#### Acceptance Criteria
- [ ] All fields validated
- [ ] Error messages shown inline
- [ ] Submit disabled when invalid
- [ ] Clear error messages

---

### 4.5 Add Edit & Delete Functionality 🔴 NOT STARTED
**Estimated Time:** 4 hours

#### Tasks
- [ ] **4.5.1** Add edit button to table rows
  ```tsx
  <Button
    variant="ghost"
    size="sm"
    onClick={() => handleEdit(row.original)}
  >
    <Edit className="h-4 w-4" />
  </Button>
  ```

- [ ] **4.5.2** Implement edit handler
  ```typescript
  const handleEdit = (item: FuelUsage | VehicleUsage | etc) => {
    setFormData({
      id: item.id,
      ...item
    });
    setIsModalOpen(true);
    setIsEditing(true);
  };
  ```

- [ ] **4.5.3** Update submit handler to handle edits
  ```typescript
  const handleSubmit = async () => {
    if (isEditing) {
      await updateFuel.mutateAsync({
        id: formData.id,
        data: { ...formData }
      });
    } else {
      await createFuel.mutateAsync(formData);
    }
  };
  ```

- [ ] **4.5.4** Add delete button with confirmation
  ```tsx
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant="destructive" size="sm">
        <Trash className="h-4 w-4" />
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Entry</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={() => handleDelete(row.original.id)}>
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  ```

- [ ] **4.5.5** Implement delete handler
  ```typescript
  const handleDelete = async (id: string) => {
    await deleteFuel.mutateAsync(id);
  };
  ```

#### Acceptance Criteria
- [ ] Edit opens form with pre-filled data
- [ ] Update works correctly
- [ ] Delete shows confirmation
- [ ] Delete removes data
- [ ] Table updates after edit/delete

---

### Phase 4 Summary

**Total Tasks:** ~30 tasks
**Estimated Time:** 16-20 hours
**Critical Priority:** ⚠️ This is the MOST IMPORTANT phase

**Completion Criteria:**
- [ ] No fake data used
- [ ] All scopes persist data to API
- [ ] Calculations work and display
- [ ] Edit and delete work
- [ ] Validation prevents bad data
- [ ] Loading and error states work

---

## Phase 5: Dashboard Integration 🔴 NOT STARTED

**Status:** 0% Complete
**Current State:** Shows hardcoded stats and placeholder charts
**Estimated Time:** 8-10 hours
**Priority:** ⚠️ HIGH

### File to Modify
- `app/dashboard/page.tsx` (209 lines)

---

### 5.1 Replace Hardcoded Stats 🔴 NOT STARTED
**Estimated Time:** 3 hours

#### Tasks
- [ ] **5.1.1** Add dashboard query hook
  ```typescript
  import { useDashboard } from '@/lib/api/queries/dashboard';

  export default function Dashboard() {
    const { organization } = useOrganizationCheck();
    const { data: dashboardData, isLoading, error } = useDashboard(
      organization?.id || '',
      'year'
    );
  ```

- [ ] **5.1.2** Replace hardcoded "10,000 tCO₂e" with real data
  ```tsx
  <p className="text-2xl font-bold">
    {dashboardData?.summary.totalCo2eYtd.toLocaleString() || '0'} tCO₂e
  </p>
  ```

- [ ] **5.1.3** Replace "Emissions per Employee"
  ```tsx
  <p className="text-2xl font-bold">
    {dashboardData?.summary.emissionsPerEmployee.toFixed(2) || '0'}
  </p>
  <span className="ml-1 text-gray-600">tCO₂e/employee</span>
  ```

- [ ] **5.1.4** Replace "Largest Source"
  ```tsx
  <p className="text-2xl font-bold">
    {dashboardData?.topSources[0]?.category || 'N/A'}
  </p>
  ```

- [ ] **5.1.5** Replace "Employees" count
  ```tsx
  <p className="text-2xl font-bold">
    {dashboardData?.organization.totalEmployees || '0'}
  </p>
  ```

- [ ] **5.1.6** Add trend indicators
  ```tsx
  {dashboardData?.summary.trend && (
    <div className={`flex items-center ${
      dashboardData.summary.trend.direction === 'decrease'
        ? 'text-green-600'
        : 'text-red-600'
    }`}>
      {dashboardData.summary.trend.direction === 'decrease' ? (
        <TrendingDown className="h-4 w-4" />
      ) : (
        <TrendingUp className="h-4 w-4" />
      )}
      <span className="ml-1">
        {Math.abs(dashboardData.summary.trend.percentage)}%
      </span>
    </div>
  )}
  ```

#### Acceptance Criteria
- [ ] All stats show real data
- [ ] Numbers format correctly
- [ ] Trend indicators work
- [ ] Loading states during fetch

---

### 5.2 Integrate Real Chart Data 🔴 NOT STARTED
**Estimated Time:** 4 hours

#### Tasks
- [ ] **5.2.1** Update AppPieChart with real data
  ```tsx
  <AppPieChart
    data={dashboardData?.topSources.map(source => ({
      name: source.category,
      value: source.value,
      percentage: source.percentage
    })) || []}
  />
  ```

- [ ] **5.2.2** Update AppLineChart with trends
  ```tsx
  <AppLineChart
    data={dashboardData?.trends.monthly.map(month => ({
      month: format(new Date(month.month), 'MMM'),
      scope1: month.scope1,
      scope2: month.scope2,
      scope3: month.scope3,
      total: month.totalCo2e
    })) || []}
  />
  ```

- [ ] **5.2.3** Update AppBarChart with breakdown
  ```tsx
  <AppBarChart
    data={Object.entries(dashboardData?.breakdown || {}).map(([category, value]) => ({
      category,
      value
    }))}
  />
  ```

- [ ] **5.2.4** Update AppDonutChart
  ```tsx
  <AppDonutChart
    data={[
      { name: 'Scope 1', value: dashboardData?.summary.totalScope1 || 0 },
      { name: 'Scope 2', value: dashboardData?.summary.totalScope2 || 0 },
      { name: 'Scope 3', value: dashboardData?.summary.totalScope3 || 0 },
    ]}
  />
  ```

- [ ] **5.2.5** Add empty state handling
  ```tsx
  {(!dashboardData || dashboardData.summary.totalRecords === 0) && (
    <EmptyState
      title="No emission data yet"
      description="Add your first emission record to see your dashboard"
      action={
        <Button onClick={() => router.push('/calculation')}>
          Add Emission Data
        </Button>
      }
    />
  )}
  ```

#### Acceptance Criteria
- [ ] Charts display real data
- [ ] Charts update when data changes
- [ ] Empty states show when no data
- [ ] Chart colors are consistent

---

### 5.3 Add Period Selector 🔴 NOT STARTED
**Estimated Time:** 2 hours

#### Tasks
- [ ] **5.3.1** Add period state
  ```typescript
  const [period, setPeriod] = useState<'year' | 'quarter' | 'month'>('year');
  ```

- [ ] **5.3.2** Update dashboard query with period
  ```typescript
  const { data: dashboardData } = useDashboard(organization?.id || '', period);
  ```

- [ ] **5.3.3** Add period selector UI
  ```tsx
  <Tabs value={period} onValueChange={(value) => setPeriod(value as any)}>
    <TabsList>
      <TabsTrigger value="month">This Month</TabsTrigger>
      <TabsTrigger value="quarter">This Quarter</TabsTrigger>
      <TabsTrigger value="year">This Year</TabsTrigger>
    </TabsList>
  </Tabs>
  ```

#### Acceptance Criteria
- [ ] Period selector works
- [ ] Data updates when period changes
- [ ] Loading state during period change

---

### 5.4 Add Refresh Functionality 🔴 NOT STARTED
**Estimated Time:** 1 hour

#### Tasks
- [ ] **5.4.1** Add manual refresh button
  ```tsx
  <Button
    variant="outline"
    size="sm"
    onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })}
  >
    <RefreshCw className="h-4 w-4 mr-2" />
    Refresh
  </Button>
  ```

- [ ] **5.4.2** Add auto-refresh (optional)
  ```typescript
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, []);
  ```

#### Acceptance Criteria
- [ ] Manual refresh works
- [ ] Loading indicator during refresh
- [ ] Auto-refresh works (if implemented)

---

### Phase 5 Summary

**Total Tasks:** ~20 tasks
**Estimated Time:** 8-10 hours
**Priority:** ⚠️ HIGH

**Completion Criteria:**
- [ ] All hardcoded data replaced
- [ ] Charts show real data
- [ ] Period selector works
- [ ] Empty states display
- [ ] Refresh works

---

## Phase 6: Facilities Management 🔴 NOT STARTED

**Status:** 0% Complete
**Current State:** No facilities page exists
**Estimated Time:** 8-10 hours
**Priority:** Medium

### Files to Create
- `app/facilities/page.tsx` (new)
- `app/facilities/[id]/page.tsx` (new, optional)
- `components/facilities/facility-form.tsx` (new, optional)

---

### 6.1 Create Facilities List Page 🔴 NOT STARTED
**Estimated Time:** 4 hours

#### Tasks
- [ ] **6.1.1** Create `app/facilities/page.tsx`

- [ ] **6.1.2** Add facilities query
  ```typescript
  'use client';

  import { useFacilities } from '@/lib/api/queries/facilities';

  export default function FacilitiesPage() {
    const { organization } = useOrganizationCheck();
    const { data: facilities, isLoading } = useFacilities(organization?.id || '');
  ```

- [ ] **6.1.3** Create facilities table
  ```tsx
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Location</TableHead>
        <TableHead>Area (sqm)</TableHead>
        <TableHead>Employees</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {facilities?.map(facility => (
        <TableRow key={facility.id}>
          <TableCell>{facility.name}</TableCell>
          <TableCell>{facility.location}</TableCell>
          <TableCell>{facility.areaSqm}</TableCell>
          <TableCell>{facility.employeeCount}</TableCell>
          <TableCell>
            <Button variant="ghost" size="sm">Edit</Button>
            <Button variant="ghost" size="sm">Delete</Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  ```

- [ ] **6.1.4** Add "Add Facility" button
  ```tsx
  <Button onClick={() => setIsAddDialogOpen(true)}>
    <Plus className="h-4 w-4 mr-2" />
    Add Facility
  </Button>
  ```

#### Acceptance Criteria
- [ ] Facilities list displays
- [ ] Table shows all facility data
- [ ] Loading states work
- [ ] Empty state when no facilities

---

### 6.2 Create Add/Edit Facility Dialog 🔴 NOT STARTED
**Estimated Time:** 3 hours

#### Tasks
- [ ] **6.2.1** Create facility form dialog
  ```tsx
  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {editingFacility ? 'Edit Facility' : 'Add Facility'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label>Facility Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div>
            <Label>Address</Label>
            <Textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div>
            <Label>Area (sqm)</Label>
            <Input
              type="number"
              value={formData.areaSqm}
              onChange={(e) => setFormData({ ...formData, areaSqm: e.target.value })}
            />
          </div>
          <div>
            <Label>Employee Count</Label>
            <Input
              type="number"
              value={formData.employeeCount}
              onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  ```

- [ ] **6.2.2** Implement create facility
  ```typescript
  const createFacility = useCreateFacility();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFacility.mutateAsync({
      organizationId: organization!.id,
      name: formData.name,
      location: formData.location,
      address: formData.address,
      areaSqm: parseFloat(formData.areaSqm),
      employeeCount: parseInt(formData.employeeCount),
    });
    setIsAddDialogOpen(false);
    setFormData({});
  };
  ```

- [ ] **6.2.3** Implement edit facility

- [ ] **6.2.4** Add validation

#### Acceptance Criteria
- [ ] Dialog opens/closes correctly
- [ ] Create facility works
- [ ] Edit facility works
- [ ] Validation prevents bad data
- [ ] Form resets after submission

---

### 6.3 Implement Delete Facility 🔴 NOT STARTED
**Estimated Time:** 1 hour

#### Tasks
- [ ] **6.3.1** Add delete confirmation dialog
- [ ] **6.3.2** Implement delete mutation
- [ ] **6.3.3** Handle cascade warning (facilities with emission data)

#### Acceptance Criteria
- [ ] Delete confirmation shows
- [ ] Delete works
- [ ] Warning shown if facility has data
- [ ] List updates after delete

---

### Phase 6 Summary

**Total Tasks:** ~15 tasks
**Estimated Time:** 8-10 hours
**Priority:** Medium

---

## Phase 7: Reports & Analytics 🔴 NOT STARTED

**Status:** 0% Complete
**Estimated Time:** 12-15 hours
**Priority:** Medium

### Files to Create/Modify
- `app/reports/page.tsx` (exists, needs functionality)
- `components/reports/report-generator.tsx` (new)
- `components/reports/export-csv.tsx` (new)

---

### 7.1 Build Reports Page 🔴 NOT STARTED
**Estimated Time:** 4 hours

#### Tasks
- [ ] **7.1.1** Modify `app/reports/page.tsx`
- [ ] **7.1.2** Add date range selector
- [ ] **7.1.3** Add report type selector (Summary/Detailed)
- [ ] **7.1.4** Add facility filter
- [ ] **7.1.5** Add "Generate Report" button
- [ ] **7.1.6** Display report preview
- [ ] **7.1.7** Add download button

#### Acceptance Criteria
- [ ] Date range selection works
- [ ] Report type selection works
- [ ] Facility filtering works
- [ ] Preview shows before download

---

### 7.2 Implement PDF Generation 🔴 NOT STARTED
**Estimated Time:** 6 hours

#### Tasks
- [ ] **7.2.1** Install PDF library
  ```bash
  npm install @react-pdf/renderer
  ```

- [ ] **7.2.2** Create PDF template component
- [ ] **7.2.3** Add summary report template
- [ ] **7.2.4** Add detailed report template
- [ ] **7.2.5** Integrate with API endpoint
- [ ] **7.2.6** Add download functionality

#### Acceptance Criteria
- [ ] PDF generates correctly
- [ ] Summary report includes key stats
- [ ] Detailed report includes all data
- [ ] PDF downloads successfully

---

### 7.3 Implement CSV Export 🔴 NOT STARTED
**Estimated Time:** 3 hours

#### Tasks
- [ ] **7.3.1** Install CSV library
  ```bash
  npm install papaparse
  ```

- [ ] **7.3.2** Create CSV export function
- [ ] **7.3.3** Format data for export
- [ ] **7.3.4** Add download trigger

#### Acceptance Criteria
- [ ] CSV exports correctly
- [ ] All relevant data included
- [ ] File downloads with proper name

---

### 7.4 Add Analytics Charts 🔴 NOT STARTED
**Estimated Time:** 2 hours

#### Tasks
- [ ] **7.4.1** Add year-over-year comparison chart
- [ ] **7.4.2** Add facility comparison chart
- [ ] **7.4.3** Add category breakdown chart
- [ ] **7.4.4** Use analytics API endpoints

#### Acceptance Criteria
- [ ] Comparison charts work
- [ ] Data loads from analytics API
- [ ] Charts are interactive

---

### Phase 7 Summary

**Total Tasks:** ~25 tasks
**Estimated Time:** 12-15 hours

---

## Phase 8: Settings & Configuration 🔴 NOT STARTED

**Status:** 0% Complete
**Estimated Time:** 6-8 hours
**Priority:** Low

### Files to Create/Modify
- `app/settings/page.tsx` (exists, needs content)
- `app/settings/organization/page.tsx` (new)
- `app/settings/scopes/page.tsx` (new)

---

### 8.1 Organization Settings 🔴 NOT STARTED
**Estimated Time:** 3 hours

#### Tasks
- [ ] **8.1.1** Create organization settings page
- [ ] **8.1.2** Add organization update form
- [ ] **8.1.3** Allow occupancy type change (with warning)
- [ ] **8.1.4** Allow industry sector edit

#### Acceptance Criteria
- [ ] Organization details editable
- [ ] Changes persist
- [ ] Warning shown for occupancy type change

---

### 8.2 Scope Configuration 🔴 NOT STARTED
**Estimated Time:** 2 hours

#### Tasks
- [ ] **8.2.1** Create scopes settings page
- [ ] **8.2.2** Add scope toggle switches
- [ ] **8.2.3** Show impact of disabling scopes
- [ ] **8.2.4** Save scope configuration

#### Acceptance Criteria
- [ ] Scopes can be toggled
- [ ] Changes save correctly
- [ ] UI reflects scope changes

---

### 8.3 Account Settings 🔴 NOT STARTED
**Estimated Time:** 2 hours

#### Tasks
- [ ] **8.3.1** Add password change form
- [ ] **8.3.2** Add email change (with verification)
- [ ] **8.3.3** Add name update
- [ ] **8.3.4** Add account deletion (with confirmation)

#### Acceptance Criteria
- [ ] Password change works
- [ ] Email verification sent
- [ ] Name updates correctly
- [ ] Delete has strong confirmation

---

### Phase 8 Summary

**Total Tasks:** ~15 tasks
**Estimated Time:** 6-8 hours

---

## Phase 9: Error Handling & UX Polish 🔴 NOT STARTED

**Status:** 0% Complete
**Estimated Time:** 8-10 hours
**Priority:** ⚠️ HIGH

---

### 9.1 Toast Notification System 🔴 NOT STARTED
**Estimated Time:** 3 hours

#### Tasks
- [ ] **9.1.1** Install toast library
  ```bash
  npm install sonner
  ```

- [ ] **9.1.2** Add Toaster to root layout
  ```tsx
  import { Toaster } from 'sonner';

  export default function RootLayout() {
    return (
      <html>
        <body>
          {children}
          <Toaster position="top-right" />
        </body>
      </html>
    );
  }
  ```

- [ ] **9.1.3** Create toast helper functions
  ```typescript
  // lib/utils/toast.ts
  import { toast } from 'sonner';

  export const showSuccess = (message: string) => {
    toast.success(message);
  };

  export const showError = (message: string) => {
    toast.error(message);
  };

  export const showInfo = (message: string) => {
    toast.info(message);
  };

  export const showLoading = (message: string) => {
    return toast.loading(message);
  };
  ```

- [ ] **9.1.4** Add toasts to all mutations
  ```typescript
  const createFuel = useCreateFuelUsage();

  const handleSubmit = async () => {
    const toastId = showLoading('Adding fuel data...');

    try {
      await createFuel.mutateAsync(data);
      toast.dismiss(toastId);
      showSuccess('Fuel data added successfully!');
    } catch (error) {
      toast.dismiss(toastId);
      showError(error.message);
    }
  };
  ```

- [ ] **9.1.5** Add toasts to calculations
- [ ] **9.1.6** Add toasts to auth operations
- [ ] **9.1.7** Add toasts to org operations

#### Acceptance Criteria
- [ ] Toasts show for all user actions
- [ ] Success/error states clear
- [ ] Loading toasts dismiss properly
- [ ] Toasts are visually appealing

---

### 9.2 Error Boundary Component 🔴 NOT STARTED
**Estimated Time:** 2 hours

#### Tasks
- [ ] **9.2.1** Create error boundary component
  ```tsx
  // components/error-boundary.tsx
  'use client';

  import { Component, ReactNode } from 'react';

  interface Props {
    children: ReactNode;
    fallback?: ReactNode;
  }

  interface State {
    hasError: boolean;
    error?: Error;
  }

  export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
              <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </div>
        );
      }

      return this.props.children;
    }
  }
  ```

- [ ] **9.2.2** Wrap app with error boundary
  ```tsx
  // app/layout.tsx
  <ErrorBoundary>
    {children}
  </ErrorBoundary>
  ```

- [ ] **9.2.3** Add error boundaries to major sections

#### Acceptance Criteria
- [ ] Errors don't crash entire app
- [ ] User-friendly error messages
- [ ] Reload option available
- [ ] Errors logged to console

---

### 9.3 Global Loading States 🔴 NOT STARTED
**Estimated Time:** 2 hours

#### Tasks
- [ ] **9.3.1** Create loading skeleton components
  ```tsx
  // components/skeletons/dashboard-skeleton.tsx
  export function DashboardSkeleton() {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  ```

- [ ] **9.3.2** Create table skeleton
- [ ] **9.3.3** Create form skeleton
- [ ] **9.3.4** Add loading states to all pages

#### Acceptance Criteria
- [ ] Skeletons match final layout
- [ ] Loading states feel fast
- [ ] No jarring layout shifts

---

### 9.4 Empty States 🔴 NOT STARTED
**Estimated Time:** 2 hours

#### Tasks
- [ ] **9.4.1** Create empty state component
  ```tsx
  // components/empty-state.tsx
  export function EmptyState({
    title,
    description,
    icon: Icon,
    action
  }: EmptyStateProps) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        {Icon && <Icon className="h-12 w-12 text-gray-400 mb-4" />}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        {action}
      </div>
    );
  }
  ```

- [ ] **9.4.2** Add empty states to:
  - Dashboard (no emission records)
  - Calculation page (no data)
  - Facilities (no facilities)
  - Reports (no records to report)

#### Acceptance Criteria
- [ ] Empty states guide users
- [ ] Clear call-to-action buttons
- [ ] Helpful descriptions
- [ ] Icons are relevant

---

### 9.5 Form Improvements 🔴 NOT STARTED
**Estimated Time:** 1 hour

#### Tasks
- [ ] **9.5.1** Add field descriptions/hints
- [ ] **9.5.2** Add input masks (dates, numbers)
- [ ] **9.5.3** Add autocomplete where applicable
- [ ] **9.5.4** Improve focus states
- [ ] **9.5.5** Add keyboard shortcuts (Ctrl+S to save, Esc to close modals)

#### Acceptance Criteria
- [ ] Forms are easy to fill out
- [ ] Hints help users
- [ ] Keyboard navigation works

---

### Phase 9 Summary

**Total Tasks:** ~30 tasks
**Estimated Time:** 8-10 hours
**Priority:** ⚠️ HIGH (affects all features)

---

## Phase 10: Testing & Optimization 🔴 NOT STARTED

**Status:** 0% Complete
**Estimated Time:** 10-12 hours
**Priority:** Medium-High

---

### 10.1 Manual Testing Checklist 🔴 NOT STARTED
**Estimated Time:** 4 hours

#### Auth Flow Tests
- [ ] **10.1.1** Sign up flow
  - [ ] Valid email/password
  - [ ] Invalid email format
  - [ ] Weak password
  - [ ] Duplicate email
  - [ ] Email verification

- [ ] **10.1.2** Sign in flow
  - [ ] Valid credentials
  - [ ] Invalid credentials
  - [ ] Remember me
  - [ ] Return URL redirect
  - [ ] Session expiration

- [ ] **10.1.3** Protected routes
  - [ ] Redirect to signin when not authenticated
  - [ ] Allow access when authenticated
  - [ ] Session persistence on refresh

#### Organization Flow Tests
- [ ] **10.1.4** Organization onboarding
  - [ ] Create new organization
  - [ ] All occupancy types
  - [ ] Scope auto-configuration
  - [ ] Form validation
  - [ ] Redirect to dashboard

- [ ] **10.1.5** Organization check
  - [ ] Redirect to onboarding if no org
  - [ ] Skip check if already on onboarding
  - [ ] Load organization data

#### Calculation Page Tests
- [ ] **10.1.6** Data entry
  - [ ] Scope 1 - Fuel
  - [ ] Scope 1 - Vehicles
  - [ ] Scope 1 - Refrigerants (if implemented)
  - [ ] Scope 2 - Electricity
  - [ ] Scope 3 - Commuting

- [ ] **10.1.7** CRUD operations
  - [ ] Create entries
  - [ ] Edit entries
  - [ ] Delete entries
  - [ ] View entries

- [ ] **10.1.8** Calculations
  - [ ] Trigger calculation
  - [ ] View results
  - [ ] Results persist

#### Dashboard Tests
- [ ] **10.1.9** Data display
  - [ ] Summary cards show real data
  - [ ] Charts render correctly
  - [ ] Period selector works
  - [ ] Refresh works

- [ ] **10.1.10** Empty states
  - [ ] Shows when no data
  - [ ] Call-to-action works

#### Edge Cases
- [ ] **10.1.11** Network errors
  - [ ] Offline behavior
  - [ ] Slow network
  - [ ] API errors

- [ ] **10.1.12** Large datasets
  - [ ] Pagination works
  - [ ] Performance acceptable
  - [ ] No memory leaks

#### Acceptance Criteria
- [ ] All tests pass
- [ ] No critical bugs
- [ ] Edge cases handled

---

### 10.2 Performance Optimization 🔴 NOT STARTED
**Estimated Time:** 3 hours

#### Tasks
- [ ] **10.2.1** Analyze bundle size
  ```bash
  npm run build
  # Check .next/analyze output
  ```

- [ ] **10.2.2** Optimize images
  - [ ] Use Next.js Image component
  - [ ] Add proper sizes
  - [ ] Lazy load images

- [ ] **10.2.3** Code splitting
  - [ ] Dynamic imports for large components
  - [ ] Route-based splitting (already done by Next.js)

- [ ] **10.2.4** React Query optimization
  - [ ] Review staleTime settings
  - [ ] Add prefetching for common navigations
  - [ ] Optimize cache sizes

- [ ] **10.2.5** Memoization
  - [ ] Add useMemo for expensive calculations
  - [ ] Add useCallback for stable references
  - [ ] Memo expensive components

#### Acceptance Criteria
- [ ] Bundle size reasonable
- [ ] Page loads fast
- [ ] Smooth interactions
- [ ] No unnecessary re-renders

---

### 10.3 Accessibility Audit 🔴 NOT STARTED
**Estimated Time:** 2 hours

#### Tasks
- [ ] **10.3.1** Add ARIA labels
  - [ ] Form fields
  - [ ] Buttons
  - [ ] Charts

- [ ] **10.3.2** Keyboard navigation
  - [ ] Tab order logical
  - [ ] Focus visible
  - [ ] Escape closes modals
  - [ ] Enter submits forms

- [ ] **10.3.3** Screen reader testing
  - [ ] Test with NVDA/JAWS
  - [ ] Ensure announcements are clear

- [ ] **10.3.4** Color contrast
  - [ ] All text readable
  - [ ] Buttons have enough contrast
  - [ ] Charts use accessible colors

#### Acceptance Criteria
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigable
- [ ] Screen reader friendly

---

### 10.4 Mobile Responsiveness 🔴 NOT STARTED
**Estimated Time:** 3 hours

#### Tasks
- [ ] **10.4.1** Test all pages on mobile
  - [ ] Dashboard
  - [ ] Calculation
  - [ ] Facilities
  - [ ] Reports
  - [ ] Settings

- [ ] **10.4.2** Fix layout issues
  - [ ] Stack cards on mobile
  - [ ] Responsive tables (horizontal scroll or stack)
  - [ ] Touch-friendly buttons

- [ ] **10.4.3** Mobile navigation
  - [ ] Hamburger menu
  - [ ] Touch gestures
  - [ ] Mobile-optimized forms

#### Acceptance Criteria
- [ ] Works on phones (375px+)
- [ ] Works on tablets (768px+)
- [ ] Touch interactions smooth
- [ ] No horizontal scroll

---

### Phase 10 Summary

**Total Tasks:** ~40 tasks
**Estimated Time:** 10-12 hours

---

## File Structure Reference

### Completed Files
```
app/
├── auth/
│   ├── signin/page.tsx ✅
│   └── signup/page.tsx ✅
├── dashboard/
│   ├── layout.tsx ✅ (protected)
│   └── page.tsx 🔄 (needs real data)
├── calculation/
│   ├── page.tsx 🔴 (needs refactor)
│   ├── columns.tsx ✅
│   └── data-table.tsx ✅
├── onboarding/
│   └── organization/page.tsx ✅
├── reports/page.tsx 🔴
├── settings/page.tsx 🔴
└── profile/page.tsx 🔴

lib/
├── auth/
│   └── auth-hooks.ts ✅
├── api/
│   ├── client.ts ✅
│   ├── types.ts ✅
│   ├── query-provider.tsx ✅
│   └── queries/
│       └── organizations.ts 🔄 (partial)
├── hooks/
│   └── use-organization-check.ts ✅
└── constants/
    └── emission-factors.ts ✅

components/
├── auth/
│   ├── protected-route.tsx ✅
│   ├── guest-only-route.tsx ✅
│   └── user-menu.tsx ✅
├── sidebar.tsx ✅
├── AppBarChart.tsx ✅
├── AppDonutChart.tsx ✅
├── AppLineChart.tsx ✅
└── AppPieChart.tsx ✅
```

### Files to Create
```
lib/api/queries/
├── facilities.ts 🔴
├── emission-records.ts 🔴
├── fuel-usage.ts 🔴
├── vehicle-usage.ts 🔴
├── electricity-usage.ts 🔴
├── commuting-data.ts 🔴
├── calculations.ts 🔴
├── dashboard.ts 🔴
└── analytics.ts 🔴

app/
├── facilities/
│   ├── page.tsx 🔴
│   └── [id]/page.tsx 🔴 (optional)
└── settings/
    ├── organization/page.tsx 🔴
    ├── scopes/page.tsx 🔴
    └── account/page.tsx 🔴

components/
├── error-boundary.tsx 🔴
├── empty-state.tsx 🔴
├── skeletons/
│   ├── dashboard-skeleton.tsx 🔴
│   ├── table-skeleton.tsx 🔴
│   └── form-skeleton.tsx 🔴
├── facilities/
│   └── facility-form.tsx 🔴
└── reports/
    ├── report-generator.tsx 🔴
    └── export-csv.tsx 🔴

lib/utils/
└── toast.ts 🔴
```

---

## API Endpoints Reference

### ✅ Implemented Backend APIs
All endpoints are fully functional on the backend.

#### Authentication
- `POST /api/auth/register` ✅
- `POST /api/auth/[...all]` ✅ (better-auth)
- `POST /api/auth/verify-email` ✅
- `POST /api/auth/forgot-password` ✅
- `POST /api/auth/reset-password` ✅
- `GET /api/auth/me` ✅

#### Organizations
- `GET /api/organizations` ✅
- `POST /api/organizations` ✅
- `GET /api/organizations/:id` ✅
- `PATCH /api/organizations/:id` ✅

#### Facilities
- `GET /api/facilities` ✅
- `POST /api/facilities` ✅
- `GET /api/facilities/:id` ✅
- `PATCH /api/facilities/:id` ✅
- `DELETE /api/facilities/:id` ✅

#### Emission Records
- `GET /api/emission-records` ✅
- `POST /api/emission-records` ✅
- `GET /api/emission-records/:id` ✅
- `PATCH /api/emission-records/:id` ✅
- `DELETE /api/emission-records/:id` ✅

#### Fuel Usage (Scope 1)
- `GET /api/fuel-usage` ✅
- `POST /api/fuel-usage` ✅
- `GET /api/fuel-usage/:id` ✅
- `PATCH /api/fuel-usage/:id` ✅
- `DELETE /api/fuel-usage/:id` ✅

#### Vehicle Usage (Scope 1)
- `GET /api/vehicle-usage` ✅
- `POST /api/vehicle-usage` ✅

#### Electricity Usage (Scope 2)
- `GET /api/electricity-usage` ✅
- `POST /api/electricity-usage` ✅

#### Commuting Data (Scope 3)
- `GET /api/commuting-data` ✅
- `POST /api/commuting-data` ✅

#### Calculations
- `POST /api/calculations` ✅
- `GET /api/calculations/:emissionRecordId` ✅

#### Dashboard & Analytics
- `GET /api/dashboard` ✅
- `GET /api/analytics/trends` ✅
- `GET /api/analytics/comparison` ✅

---

## Implementation Priority Matrix

### Critical Path (Must Do First)
1. ⚠️ **Phase 3.3-3.7** - API Query Hooks (Emissions & Usage)
2. ⚠️ **Phase 4** - Calculation Page Refactor
3. ⚠️ **Phase 5** - Dashboard Real Data
4. ⚠️ **Phase 9.1-9.2** - Toast System & Error Boundary

### High Priority (Do Second)
5. **Phase 3.8-3.9** - Calculations & Dashboard Queries
6. **Phase 9.3-9.5** - UX Polish (Loading, Empty States)
7. **Phase 10.1** - Manual Testing

### Medium Priority (Do Third)
8. **Phase 6** - Facilities Management
9. **Phase 7** - Reports & Analytics
10. **Phase 10.2-10.4** - Performance & Accessibility

### Low Priority (Do Last)
11. **Phase 8** - Settings & Configuration
12. **Phase 3.1-3.2** - Facilities & Organization Mutations

---

## Success Metrics

### Phase Completion Criteria

**Phase 1:** ✅ Complete
- All auth flows work
- Protected routes function
- Session management solid

**Phase 2:** ✅ Complete
- Organization onboarding works
- Auto-redirect to onboarding
- Scope configuration automatic

**Phase 3:** Completion Target
- [ ] 9/9 query files created
- [ ] All CRUD operations have hooks
- [ ] Type safety enforced
- [ ] Cache invalidation works

**Phase 4:** Completion Target
- [ ] No fake data used
- [ ] All 5 scopes persist to API
- [ ] Calculations trigger and display
- [ ] Edit/delete functionality works

**Phase 5:** Completion Target
- [ ] Dashboard shows real data
- [ ] All charts use API data
- [ ] Period selector works
- [ ] Empty states display

**Phases 6-10:** Completion Target
- [ ] All features functional
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Accessibility compliant

---

## Estimated Timeline

### Aggressive Schedule (Full-time, 8hrs/day)
- **Week 1:** Phase 3 (API Hooks) + Start Phase 4
- **Week 2:** Complete Phase 4 (Calculation) + Phase 5 (Dashboard)
- **Week 3:** Phase 6 (Facilities) + Phase 7 (Reports) + Phase 9 (UX)
- **Week 4:** Phase 8 (Settings) + Phase 10 (Testing) + Buffer

**Total:** ~4 weeks full-time

### Moderate Schedule (Part-time, 4hrs/day)
- **Weeks 1-2:** Phase 3 (API Hooks)
- **Weeks 3-5:** Phase 4 (Calculation Page)
- **Weeks 6-7:** Phase 5 (Dashboard) + Phase 9.1-9.2 (Toasts/Errors)
- **Weeks 8-9:** Phase 6 (Facilities) + Phase 9.3-9.5 (UX Polish)
- **Weeks 10-11:** Phase 7 (Reports)
- **Week 12:** Phase 8 (Settings) + Testing + Buffer

**Total:** ~12 weeks part-time

### Realistic Schedule (Mixed pace)
- **Phase 3:** 3-4 days
- **Phase 4:** 4-5 days
- **Phase 5:** 2-3 days
- **Phase 6:** 2-3 days
- **Phase 7:** 3-4 days
- **Phase 8:** 2 days
- **Phase 9:** 2-3 days
- **Phase 10:** 3 days

**Total:** ~6-8 weeks mixed pace

---

## Notes & Best Practices

### Development Guidelines
1. **Always use TypeScript** - No `any` types
2. **Follow React Query patterns** - Use hooks for all API calls
3. **Consistent error handling** - Toast on error, log to console
4. **Loading states everywhere** - Never show blank screens
5. **Optimistic updates** - Make UI feel fast
6. **Cache invalidation** - Keep data fresh
7. **Validation** - Client-side and server-side
8. **Accessibility** - ARIA labels, keyboard navigation
9. **Mobile-first** - Responsive by default
10. **Test incrementally** - Don't wait until the end

### Code Quality Checklist
- [ ] No console.errors in production
- [ ] No TODO comments without issue links
- [ ] All functions have JSDoc comments
- [ ] All components have prop types
- [ ] All queries have error handling
- [ ] All mutations have optimistic updates
- [ ] All forms have validation
- [ ] All buttons have loading states
- [ ] All pages have empty states
- [ ] All pages have error states

---

## Appendix A: Technology Decisions

### Why React Query?
- Automatic caching and background updates
- Built-in loading/error states
- Optimistic updates support
- DevTools for debugging
- Industry standard for data fetching

### Why better-auth?
- Modern, type-safe authentication
- Built-in session management
- Multiple providers support
- Easy integration with Next.js
- Active maintenance

### Why Recharts?
- Already integrated in project
- React-native compatible
- Good documentation
- Responsive by default
- Customizable

### Why Sonner for toasts?
- Beautiful default styling
- Promise-based API
- Position control
- Stack management
- Lightweight

---

## Appendix B: Common Patterns

### Query Hook Pattern
```typescript
export function useResource(id: string) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      const response = await api.get<Response>(`/api/resource/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
```

### Mutation Hook Pattern
```typescript
export function useCreateResource() {
  return useMutation({
    mutationFn: async (data: CreateInput) => {
      return api.post('/api/resource', data);
    },
    onMutate: async (newData) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['resources'] });
      const previousData = queryClient.getQueryData(['resources']);
      queryClient.setQueryData(['resources'], (old: any) => [...old, newData]);
      return { previousData };
    },
    onError: (err, newData, context) => {
      // Rollback
      queryClient.setQueryData(['resources'], context.previousData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}
```

### Form Submission Pattern
```typescript
const createMutation = useCreateResource();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await createMutation.mutateAsync(formData);
    showSuccess('Resource created!');
    setIsModalOpen(false);
    setFormData({});
  } catch (error) {
    showError(error.message);
  }
};
```

---

**Document Version:** 1.0
**Last Updated:** 2025-10-12
**Total Pages:** 50+
**Total Tasks:** 300+
**Estimated Hours:** 100-120 hours
