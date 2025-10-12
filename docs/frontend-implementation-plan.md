# Frontend Implementation Plan

## Overview
Proper implementation order for connecting the frontend to the existing backend API. Auth first, then data layer, then wire everything up.

---

## Phase 1: Auth Foundation ✅ COMPLETED

### 1. Setup better-auth client ✅
- [x] Create `lib/auth/auth-hooks.ts` with auth client configuration
- [x] Export `useSession()`, `useUser()`, `useSignIn()`, `useSignOut()` hooks
- [x] Test that auth client can communicate with `/api/auth/[...all]` endpoint
- [x] Added `signInWithEmail()`, `signUpWithEmail()`, `signOutUser()` helper functions

### 2. Create protected route wrapper ✅
- [x] Create `components/auth/protected-route.tsx` component
- [x] Redirect unauthenticated users to `/auth/signin`
- [x] Show loading state while checking auth
- [x] Handle session expiration gracefully
- [x] Added `withAuth()` HOC for easy page wrapping
- [x] Store return URL for post-login redirect

### 3. Verify/Fix auth pages ✅
- [x] Check `/app/auth/signin/page.tsx` - make sure it works
- [x] Add proper error handling for failed login
- [x] Add success redirect after login
- [x] Test signup flow if applicable
- [x] Created `components/auth/guest-only-route.tsx` for auth pages
- [x] Added session expiration message handling

### 4. Add auth to dashboard layout ✅
- [x] Wrap `/app/dashboard/layout.tsx` with protected route
- [x] Add user info display in dashboard header (via sidebar)
- [x] Add logout functionality (`components/sidebar.tsx` with user dropdown)
- [x] Test: unauthenticated users can't access dashboard
- [x] Created `components/auth/user-menu.tsx` component

### 5. Test complete auth flow ✅
- [x] Test: Sign up new user
- [x] Test: Sign in existing user
- [x] Test: Access protected routes
- [x] Test: Sign out
- [x] Test: Session persistence on refresh

---

## Phase 2: API Layer 🟡 IN PROGRESS

### 6. Create organizations queries ✅ PARTIALLY COMPLETE
- [x] Create `lib/api/queries/organizations.ts`
- [x] Implement `useOrganization()` - fetch user's org
- [ ] Implement `useCreateOrganization()` - create org mutation
- [ ] Implement `useUpdateOrganization()` - update org mutation
- [x] Created `lib/hooks/use-organization-check.ts` for organization setup flow

**Note:** Organization creation is handled directly via API client in onboarding page. Consider creating a mutation hook for consistency.

### 7. Create facilities queries ⏸️
- [ ] Create `lib/api/queries/facilities.ts`
- [ ] Implement `useFacilities(organizationId)` - list facilities
- [ ] Implement `useFacility(id)` - get single facility
- [ ] Implement `useCreateFacility()` - create mutation
- [ ] Implement `useUpdateFacility()` - update mutation
- [ ] Implement `useDeleteFacility()` - delete mutation

### 8. Create emission records queries ⏸️
- [ ] Create `lib/api/queries/emission-records.ts`
- [ ] Implement `useEmissionRecords(organizationId, params)` - list records with pagination
- [ ] Implement `useEmissionRecord(id)` - get single record
- [ ] Implement `useCreateEmissionRecord()` - create mutation
- [ ] Implement `useUpdateEmissionRecord()` - update mutation
- [ ] Implement `useDeleteEmissionRecord()` - delete mutation

### 9. Create calculations queries ⏸️
- [ ] Create `lib/api/queries/calculations.ts`
- [ ] Implement `useCalculateEmissions(emissionRecordId)` - trigger calculation
- [ ] Handle calculation loading state
- [ ] Handle calculation errors

### 10. Create fuel/electricity/commuting data queries ⏸️
- [ ] Create `lib/api/queries/fuel-usage.ts`
- [ ] Create `lib/api/queries/electricity-usage.ts`
- [ ] Create `lib/api/queries/commuting-data.ts`
- [ ] Implement CRUD operations for each

---

## Phase 3: Wire Up Existing Pages 🟡 IN PROGRESS

### 11. Fix calculation page data fetching ⏸️ NOT STARTED
**File:** `app/calculation/page.tsx`

Current problems:
- Uses `getSampleDataForScope()` - fake data
- No real API calls
- Modal form doesn't persist data

Changes needed:
- [ ] Replace sample data with real API calls to fetch fuel/electricity/commuting data
- [ ] Implement actual form submission that calls API
- [ ] Add proper loading states
- [ ] Add error handling
- [ ] Add success feedback after creating records
- [ ] Implement real calculation trigger

**Note:** Page uses client-side state management only. Needs complete refactor to use API queries.

### 12. Fix dashboard page ✅ PARTIALLY COMPLETE
**File:** `app/dashboard/page.tsx`

- [x] Show loading states (skeleton loader implemented)
- [x] Handle empty states (organization check implemented)
- [x] Display organization name in header
- [ ] Fetch real dashboard stats from `/api/dashboard`
- [ ] Display actual emission data (currently shows hardcoded values)

**Current Status:** Dashboard shows organization info and placeholder charts/stats. Needs API integration for real data.

### 13. Add organization setup flow ✅ COMPLETED
- [x] Check if user has organization on dashboard load
- [x] If not, show organization setup modal/page (`app/onboarding/organization/page.tsx`)
- [x] Force user to create organization before accessing features
- [x] Store organization ID in state/context for easy access (via `useOrganization()` hook)
- [x] Created comprehensive onboarding page with occupancy type selection
- [x] Automatic scope configuration based on occupancy type

### 14. Implement proper error handling ⏸️ PARTIALLY COMPLETE
- [x] Error states in auth pages (sign in/sign up)
- [x] Error handling in organization setup
- [ ] Create error boundary component
- [ ] Add toast/notification system for API errors
- [ ] Show user-friendly error messages globally
- [ ] Add retry mechanisms for failed requests

### 15. Add loading states everywhere ✅ PARTIALLY COMPLETE
- [x] Loading states in auth pages
- [x] Skeleton loaders for dashboard
- [x] Loading states in protected route wrapper
- [x] Disabled states for buttons during mutations (sign in, org creation)
- [ ] Loading states for data tables in calculation page
- [ ] Optimistic updates where appropriate

---

## Phase 4: Test Everything

### 16. Test auth flows
- [ ] Login → Dashboard (should work)
- [ ] Login → Try to access `/dashboard` without session (should redirect to `/auth/signin`)
- [ ] Logout → Try to access dashboard (should redirect)
- [ ] Session expiration handling

### 17. Test organization flow
- [ ] New user creates organization
- [ ] User with org can access dashboard
- [ ] Organization data persists across sessions

### 18. Test emission records CRUD
- [ ] Create new emission record
- [ ] View emission records list
- [ ] Update emission record
- [ ] Delete emission record
- [ ] Pagination works correctly

### 19. Test calculation flow
- [ ] Add fuel usage data
- [ ] Add electricity usage data
- [ ] Add commuting data
- [ ] Trigger calculation
- [ ] View calculation results
- [ ] Results are persisted

### 20. Test edge cases
- [ ] Network errors (disconnect internet, retry)
- [ ] Invalid data submission (should show validation errors)
- [ ] Empty states (no records yet)
- [ ] Large datasets (pagination, performance)

---

## Phase 5: Polish (Optional, do later)

### 21. Add optimistic updates
- [ ] Form submissions feel instant
- [ ] Rollback on error

### 22. Add better UX
- [ ] Success toasts
- [ ] Confirmation dialogs for delete
- [ ] Form validation feedback
- [ ] Keyboard shortcuts

### 23. Performance optimization
- [ ] Implement proper cache invalidation strategies
- [ ] Add prefetching for common navigation paths
- [ ] Optimize bundle size if needed

---

## Current Status

### ✅ Completed:
**Infrastructure:**
- Installed `@tanstack/react-query`
- Created `lib/api/client.ts` (fetch wrapper)
- Created `lib/api/types.ts` (TypeScript types)
- Created `lib/api/query-provider.tsx`
- Wrapped app with `QueryProvider` in root layout

**Auth (Phase 1 - 100% Complete):**
- Created `lib/auth/auth-hooks.ts` with full auth client setup
- Created `components/auth/protected-route.tsx`
- Created `components/auth/guest-only-route.tsx`
- Created `components/auth/user-menu.tsx`
- Implemented signin/signup pages with proper error handling
- Integrated auth into dashboard layout
- Added user menu in sidebar with logout functionality

**Organization Flow (Phase 3):**
- Created `app/onboarding/organization/page.tsx` with comprehensive setup
- Created `lib/hooks/use-organization-check.ts` for organization checks
- Automatic redirect to onboarding if no organization
- Occupancy type selection with auto-scope configuration

**UI Components:**
- Created `components/sidebar.tsx` with navigation and user menu
- Dashboard layout with protected routes
- Loading states and skeleton loaders

### 🟡 In Progress:
**API Layer (Phase 2 - ~10% Complete):**
- Created `lib/api/queries/organizations.ts` with `useOrganization()` hook
- Need to create mutation hooks and other query files

**Dashboard (Phase 3):**
- Dashboard shows organization info and loading states
- Charts and stats are placeholder/hardcoded
- Needs API integration for real data

### 🔴 Not Started:
**API Layer (Phase 2):**
- Facilities queries
- Emission records queries
- Calculations queries
- Fuel/electricity/commuting data queries

**Page Integration (Phase 3):**
- Calculation page API integration (currently uses fake data)
- Dashboard real data integration
- Global error handling (toast/notification system)
- Error boundary component

**Testing (Phase 4):**
- Comprehensive testing of all flows
- Edge case testing

---

## Next Steps (Priority Order)

### Immediate Priority (Do These Next):
1. **Create Dashboard API Integration** (`app/dashboard/page.tsx`)
   - Create `lib/api/queries/dashboard.ts` with `useDashboardStats()` hook
   - Fetch real data from `/api/dashboard`
   - Replace hardcoded values with actual emission data
   - File location: `app/dashboard/page.tsx:55-93`

2. **Create Calculation Page Query Hooks** (Required for calculation page)
   - Create `lib/api/queries/fuel-usage.ts`
   - Create `lib/api/queries/electricity-usage.ts`
   - Create `lib/api/queries/commuting-data.ts`
   - Implement CRUD operations for each scope type

3. **Refactor Calculation Page** (`app/calculation/page.tsx`)
   - Replace `getSampleDataForScope()` with real API queries
   - Implement form submission using mutation hooks
   - Add proper error handling and success feedback
   - This is the biggest gap - page is currently non-functional

4. **Add Toast/Notification System**
   - Install `sonner` or similar toast library
   - Create global toast provider
   - Add success/error notifications for all mutations
   - Improves user feedback across the app

### Medium Priority (After Above):
5. **Create Facilities Management**
   - Create `lib/api/queries/facilities.ts`
   - Add facilities page/section to dashboard
   - Allow users to manage multiple facilities

6. **Create Emission Records Management**
   - Create `lib/api/queries/emission-records.ts`
   - Build emission records listing/management page
   - Add pagination support

7. **Error Boundary Component**
   - Create global error boundary
   - Add fallback UI for crashes
   - Improve app stability

### Lower Priority (Polish):
8. **Optimistic Updates**
   - Add optimistic updates to mutations
   - Improve perceived performance

9. **Testing & Bug Fixes**
   - Test all user flows end-to-end
   - Fix edge cases
   - Performance optimization

---

## Notes

- **ALWAYS test auth first** ✅ DONE - nothing else matters if users can't log in
- **Don't skip error handling** 🟡 Partially done - needs global toast system
- **Loading states are not optional** ✅ Mostly done - slow networks exist
- **Type everything** ✅ Good - TypeScript is your friend
- **Test incrementally** 🟡 In progress - don't build everything then test at the end

---

## Commands

Start dev server:
```bash
npm run dev
```

Test auth endpoints:
```bash
curl http://localhost:3000/api/auth/me
```

Check if backend is running:
```bash
curl http://localhost:3000/api/organizations
```

---

## Summary of Implementation Progress

### Overall Progress: ~35% Complete

**Phase 1: Auth Foundation** → ✅ 100% Complete
**Phase 2: API Layer** → 🟡 10% Complete
**Phase 3: Wire Up Pages** → 🟡 40% Complete
**Phase 4: Testing** → 🔴 0% Complete
**Phase 5: Polish** → 🔴 0% Complete

### Key Achievements:
- ✅ Full authentication system working (sign in, sign up, protected routes)
- ✅ Organization onboarding flow complete
- ✅ Dashboard skeleton with organization display
- ✅ Sidebar navigation with user menu
- ✅ Loading states and basic error handling

### Critical Gaps:
- ❌ Calculation page non-functional (uses fake data, doesn't save)
- ❌ Dashboard shows hardcoded stats (no real API data)
- ❌ Most API query hooks not created (facilities, emissions, calculations)
- ❌ No global toast/notification system
- ❌ No error boundary component

### Recommended Focus:
Focus on **Phase 2 (API Layer)** and completing **Phase 3 (Page Integration)** to make the app fully functional. The calculation page is the highest priority as it's the core feature.
