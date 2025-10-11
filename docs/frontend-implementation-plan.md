# Frontend Implementation Plan

## Overview
Proper implementation order for connecting the frontend to the existing backend API. Auth first, then data layer, then wire everything up.

---

## Phase 1: Auth Foundation (DO THIS FIRST)

### 1. Setup better-auth client
- [ ] Create `lib/auth/auth-hooks.ts` with auth client configuration
- [ ] Export `useSession()`, `useUser()`, `useSignIn()`, `useSignOut()` hooks
- [ ] Test that auth client can communicate with `/api/auth/[...all]` endpoint

### 2. Create protected route wrapper
- [ ] Create `components/auth/protected-route.tsx` component
- [ ] Redirect unauthenticated users to `/auth/signin`
- [ ] Show loading state while checking auth
- [ ] Handle session expiration gracefully

### 3. Verify/Fix auth pages
- [ ] Check `/app/auth/signin/page.tsx` - make sure it works
- [ ] Add proper error handling for failed login
- [ ] Add success redirect after login
- [ ] Test signup flow if applicable

### 4. Add auth to dashboard layout
- [ ] Wrap `/app/dashboard/layout.tsx` with protected route
- [ ] Add user info display in dashboard header
- [ ] Add logout functionality
- [ ] Test: unauthenticated users can't access dashboard

### 5. Test complete auth flow
- [ ] Test: Sign up new user
- [ ] Test: Sign in existing user
- [ ] Test: Access protected routes
- [ ] Test: Sign out
- [ ] Test: Session persistence on refresh

---

## Phase 2: API Layer (After auth works)

### 6. Create organizations queries
- [ ] Create `lib/api/queries/organizations.ts`
- [ ] Implement `useOrganization()` - fetch user's org
- [ ] Implement `useCreateOrganization()` - create org mutation
- [ ] Implement `useUpdateOrganization()` - update org mutation

### 7. Create facilities queries
- [ ] Create `lib/api/queries/facilities.ts`
- [ ] Implement `useFacilities(organizationId)` - list facilities
- [ ] Implement `useFacility(id)` - get single facility
- [ ] Implement `useCreateFacility()` - create mutation
- [ ] Implement `useUpdateFacility()` - update mutation
- [ ] Implement `useDeleteFacility()` - delete mutation

### 8. Create emission records queries
- [ ] Create `lib/api/queries/emission-records.ts`
- [ ] Implement `useEmissionRecords(organizationId, params)` - list records with pagination
- [ ] Implement `useEmissionRecord(id)` - get single record
- [ ] Implement `useCreateEmissionRecord()` - create mutation
- [ ] Implement `useUpdateEmissionRecord()` - update mutation
- [ ] Implement `useDeleteEmissionRecord()` - delete mutation

### 9. Create calculations queries
- [ ] Create `lib/api/queries/calculations.ts`
- [ ] Implement `useCalculateEmissions(emissionRecordId)` - trigger calculation
- [ ] Handle calculation loading state
- [ ] Handle calculation errors

### 10. Create fuel/electricity/commuting data queries
- [ ] Create `lib/api/queries/fuel-usage.ts`
- [ ] Create `lib/api/queries/electricity-usage.ts`
- [ ] Create `lib/api/queries/commuting-data.ts`
- [ ] Implement CRUD operations for each

---

## Phase 3: Wire Up Existing Pages (Make it actually work)

### 11. Fix calculation page data fetching
**File:** `app/dashboard/calculation/page.tsx`

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

### 12. Fix dashboard page
**File:** `app/dashboard/page.tsx`

- [ ] Fetch real dashboard stats from `/api/dashboard`
- [ ] Display actual emission data
- [ ] Show loading states
- [ ] Handle empty states (no data yet)

### 13. Add organization setup flow
- [ ] Check if user has organization on dashboard load
- [ ] If not, show organization setup modal/page
- [ ] Force user to create organization before accessing features
- [ ] Store organization ID in state/context for easy access

### 14. Implement proper error handling
- [ ] Create error boundary component
- [ ] Add toast/notification system for API errors
- [ ] Show user-friendly error messages
- [ ] Add retry mechanisms for failed requests

### 15. Add loading states everywhere
- [ ] Skeleton loaders for data tables
- [ ] Loading spinners for forms
- [ ] Disabled states for buttons during mutations
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

✅ Completed:
- Installed `@tanstack/react-query`
- Created `lib/api/client.ts` (fetch wrapper)
- Created `lib/api/types.ts` (TypeScript types)
- Created `lib/api/query-provider.tsx`
- Wrapped app with `QueryProvider` in root layout

⏸️ Paused:
- API queries creation (should do auth first)

🔴 Not Started:
- Auth setup
- Protected routes
- Real data fetching in pages

---

## Notes

- **ALWAYS test auth first** - nothing else matters if users can't log in
- **Don't skip error handling** - users will find every edge case
- **Loading states are not optional** - slow networks exist
- **Type everything** - TypeScript is your friend
- **Test incrementally** - don't build everything then test at the end

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
