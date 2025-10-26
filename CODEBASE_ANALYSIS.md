# RevEarth Codebase Analysis & Recommendations

**Date:** October 19, 2025
**Project:** RevEarth - Carbon Footprint/Emissions Tracking Application
**Tech Stack:** Next.js 15, React 19, TypeScript, PostgreSQL, Prisma, Better-Auth

---

## Executive Summary

RevEarth is a **comprehensive GHG emissions tracking application** for organizations in the Philippines. The codebase demonstrates solid architecture with proper separation of concerns, type safety, and modern best practices. However, there are several **critical gaps** and **opportunities for improvement** across security, testing, documentation, error handling, and feature completeness.

**Overall Code Quality:** 7/10
**Production Readiness:** 5/10

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [What's Working Well](#whats-working-well)
3. [Critical Issues](#critical-issues)
4. [What's Missing](#whats-missing)
5. [Security Concerns](#security-concerns)
6. [Performance & Scalability](#performance--scalability)
7. [User Experience Gaps](#user-experience-gaps)
8. [Recommendations by Priority](#recommendations-by-priority)
9. [Implementation Roadmap](#implementation-roadmap)

---

## Architecture Overview

### Current Stack
```
┌─────────────────────────────────────────┐
│           Frontend (React 19)           │
│  - Pages: 9 (3 public, 6 protected)    │
│  - Components: 25+ (Radix UI)           │
│  - State: TanStack Query                │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        API Layer (Next.js Routes)       │
│  - 21 Endpoints                         │
│  - Better-Auth middleware               │
│  - Calculation engine                   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Database (PostgreSQL + Prisma)     │
│  - 13 Models                            │
│  - Relationships: 1:1, 1:many           │
└─────────────────────────────────────────┘
```

### Data Flow
```
User Input → React Form (zod validation)
  → React Query Mutation
  → API Route (withAuth middleware)
  → Prisma ORM
  → PostgreSQL
  → Calculation Engine (on-demand)
  → Response → Cache → UI Update
```

---

## What's Working Well

### ✅ Strengths

1. **Modern Tech Stack**
   - Next.js 15 App Router with proper file conventions
   - React 19 with server components support
   - TypeScript for type safety (good coverage)
   - Prisma ORM with well-designed schema

2. **Authentication & Authorization**
   - Better-Auth properly configured
   - Middleware protection on all API routes (`withAuth`)
   - Organization-scoped access control
   - Session management (7-day expiry)

3. **Database Design**
   - Normalized schema with proper relationships
   - Cascade deletes configured correctly
   - Enums for controlled values (FuelType, TransportMode, etc.)
   - Good use of Decimal types for precision

4. **Calculation Engine**
   - Scientifically-backed emission factors (EPA, IPCC AR5, Philippine DOE 2024)
   - Proper CO2e calculations across all 3 scopes
   - Breakdown by category
   - Per-employee intensity metrics

5. **UI/UX Components**
   - Accessible Radix UI components
   - Dark mode support
   - Loading skeletons
   - Empty states
   - Error boundaries
   - Responsive design (Tailwind CSS)

6. **State Management**
   - React Query with proper cache configuration
   - Optimistic updates in mutations
   - Query invalidation on updates

---

## Critical Issues

### 🔴 High Priority Issues

#### 1. **No Testing Infrastructure**
```
Status: CRITICAL
Files Found: 0 test files in /app, /lib, /components
```

**Impact:**
- No guarantee code works as intended
- Refactoring is risky
- Regressions go unnoticed
- Calculation engine errors could lead to incorrect emissions data

**What's Missing:**
- Unit tests for calculation engine
- Integration tests for API routes
- Component tests for forms
- E2E tests for critical flows

#### 2. **Email Service Not Implemented**
```typescript
// app/api/auth/forgot-password/route.ts:37
// TODO: Send email with reset link
// TODO: In production, send email via email service
```

**Impact:**
- Users can't reset passwords
- Email verification disabled (`requireEmailVerification: false`)
- Account recovery impossible
- Security vulnerability (no email confirmation)

**What's Missing:**
- Email provider integration (SendGrid, Resend, AWS SES)
- Email templates (verification, password reset, notifications)
- Email queue for reliability
- Email logs/tracking

#### 3. **No Input Validation on API Routes**
```typescript
// Most API routes lack Zod validation
export const POST = withAuth(async (request, { user }) => {
  const body = await request.json(); // ⚠️ No validation!
  // Direct use of body.field without schema validation
});
```

**Impact:**
- Injection attacks possible
- Type coercion vulnerabilities
- Data integrity issues
- Invalid data reaching database

**Solution:** Add Zod schemas for all request bodies

#### 4. **Missing Environment Variables Documentation**
```
Found: No .env.example file
Required Variables: DATABASE_URL, DIRECT_URL, BETTER_AUTH_SECRET, etc.
```

**Impact:**
- New developers can't set up the project
- Deployment failures
- Missing secrets in production

#### 5. **No Error Logging/Monitoring**
```typescript
// Typical error handling:
catch (error) {
  console.error("Error:", error); // ⚠️ Only logs to console
  return NextResponse.json({ error: "Failed" }, { status: 500 });
}
```

**Impact:**
- Production errors go unnoticed
- No error tracking or alerting
- Debugging production issues is impossible
- No audit trail

**Missing:**
- Sentry/LogRocket integration
- Error aggregation
- Performance monitoring
- User action tracking

#### 6. **No Database Migrations**
```bash
# Currently using:
npx prisma db push  # ⚠️ Not suitable for production
```

**Impact:**
- Data loss risk in production
- No rollback capability
- Can't track schema changes
- Team collaboration issues

**Solution:** Use `prisma migrate dev` and version control migrations

#### 7. **Hardcoded Emission Factors**
```typescript
// lib/constants/emission-factors.ts
export const EMISSION_FACTORS = {
  scope1: { fuels: { diesel: { factor: 0.00269 } } }
  // ⚠️ No way to update without code deployment
}
```

**Impact:**
- Can't update factors when standards change
- No region-specific customization
- Requires code deployment for data changes

**Solution:** Move emission factors to database with admin UI

#### 8. **No Rate Limiting**
```typescript
// API routes have no rate limiting
export const POST = withAuth(async (request, { user }) => {
  // ⚠️ Can be called unlimited times
});
```

**Impact:**
- DoS attacks possible
- Resource exhaustion
- Cost overruns (database connections)

**Solution:** Add rate limiting middleware (Upstash, Redis)

---

## What's Missing

### 📋 Feature Gaps

#### **Core Features**

1. **Refrigerant Usage API Endpoints**
   ```
   Status: Schema exists, but no API routes found
   Missing: POST/GET /api/refrigerant-usage
   ```

2. **Bulk Data Import**
   - No CSV/Excel import for emission data
   - Manual entry only (time-consuming for large datasets)
   - No import validation or error reporting

3. **Data Export Beyond Reports**
   - No raw data export (CSV, JSON)
   - No API for external integrations
   - No webhooks for data synchronization

4. **Audit Logs**
   - No tracking of who changed what
   - No data version history
   - Can't trace calculation changes

5. **Multi-User Support**
   - Only one user per organization (1:1 relationship)
   - No roles/permissions (Admin, Viewer, Editor)
   - No team collaboration features
   - No approval workflows

6. **Targets & Goals**
   - No emission reduction targets
   - No progress tracking against goals
   - No alerts when exceeding thresholds

7. **Advanced Analytics**
   - No forecasting/predictions
   - No peer benchmarking
   - No carbon intensity metrics (per revenue, per sqm)
   - No Scope 3 Category 1-15 breakdown (only commuting)

8. **Compliance & Standards**
   - No GHG Protocol methodology validation
   - No ISO 14064 compliance features
   - No third-party verification support
   - No regulatory reporting templates (Philippine specific)

9. **Mobile Responsiveness**
   - Desktop-first design
   - Limited mobile optimization
   - No mobile app

10. **Notifications System**
    - No email notifications for milestones
    - No reminders for data entry
    - No alerts for anomalies

#### **Developer Experience**

11. **No API Documentation**
    ```
    Missing:
    - OpenAPI/Swagger spec
    - API endpoint catalog
    - Example requests/responses
    - Authentication guide
    ```

12. **No Development Environment Setup Guide**
    - README.md is boilerplate Next.js template
    - No setup instructions
    - No database seeding scripts
    - No sample data

13. **No Pre-commit Hooks**
    - No linting enforcement
    - No type checking before commit
    - No test runs
    - No conventional commits

14. **No CI/CD Pipeline**
    ```
    Missing:
    - GitHub Actions / GitLab CI
    - Automated testing
    - Build verification
    - Deployment automation
    ```

15. **No Code Quality Tools**
    - No ESLint rules configured
    - No Prettier for formatting
    - No SonarQube/CodeClimate
    - No code coverage tracking

#### **Infrastructure**

16. **No Database Backups**
    - No backup strategy documented
    - No point-in-time recovery
    - No disaster recovery plan

17. **No Health Checks**
    ```
    Missing: GET /api/health
    Should return: DB status, service health, version
    ```

18. **No Middleware for Route Protection**
    ```
    Status: No Next.js middleware.ts file
    Impact: Public routes not explicitly defined
    ```

19. **No Caching Strategy**
    - No Redis for frequently accessed data
    - All queries hit database
    - No CDN for static assets

20. **No Feature Flags**
    - Can't toggle features without deployment
    - No A/B testing capability
    - No gradual rollouts

---

## Security Concerns

### 🔒 Security Audit Findings

#### **Critical**

1. **SQL Injection (Low Risk - Prisma Protected)**
   - Prisma ORM provides protection
   - BUT: No validation before Prisma calls

2. **XSS Vulnerabilities (Low Risk - React Protected)**
   - React escapes by default
   - BUT: Check PDF/CSV export for XSS in generated content

3. **CSRF Protection**
   ```
   Status: Missing explicit CSRF tokens
   Better-Auth may handle this, but verify in production
   ```

4. **Secrets Management**
   ```
   ⚠️ No .env.example - risk of committing secrets
   Recommendation: Use environment variable validation (t3-env)
   ```

5. **Session Security**
   ```typescript
   // lib/auth.ts:33
   useSecureCookies: process.env.NODE_ENV === "production"

   ⚠️ Ensure HTTPS in production
   ⚠️ Verify SameSite cookie settings
   ```

6. **Authorization Checks**
   - Most routes check `organization.userId === user.id` ✅
   - BUT: Verify all child resource checks (facilities, records)

7. **File Upload Security (Future)**
   - No file uploads currently
   - When added: validate file types, scan for malware, size limits

#### **Medium Priority**

8. **Password Policy**
   ```
   Status: No password strength requirements visible
   Recommendation: Add zod validation for min length, complexity
   ```

9. **Account Lockout**
   ```
   Status: No brute-force protection on login
   Recommendation: Add rate limiting + temporary lockout
   ```

10. **Security Headers**
    ```
    Missing:
    - Content-Security-Policy
    - X-Frame-Options
    - X-Content-Type-Options
    - Referrer-Policy
    ```

11. **Dependency Vulnerabilities**
    ```bash
    Recommendation: Run npm audit fix
    Add: Dependabot / Snyk for automated scanning
    ```

---

## Performance & Scalability

### ⚡ Performance Analysis

#### **Database Performance**

1. **Missing Indexes**
   ```prisma
   // Add indexes for common queries:
   @@index([organizationId, reportingPeriodStart])
   @@index([emissionRecordId, entryDate])
   @@index([userId])
   ```

2. **N+1 Query Problem**
   ```typescript
   // app/api/dashboard/route.ts - Potentially loading all records
   const emissionRecords = await prisma.emissionRecord.findMany({
     include: { calculation: true } // ✅ Good use of include
   });
   ```
   Status: Appears optimized with `include`, but verify with query logging

3. **Large Result Sets**
   - Emission records endpoint has pagination ✅
   - BUT: No limit on `findMany` in dashboard route
   - Risk: Performance degradation with years of data

4. **Connection Pooling**
   ```typescript
   // lib/db.ts - Uses Prisma singleton ✅
   // Verify: DATABASE_URL has connection_limit parameter
   ```

#### **Frontend Performance**

5. **Bundle Size**
   ```
   Recommendation: Analyze with next build
   Check: Are all Radix components tree-shaken?
   ```

6. **Image Optimization**
   - Using Next.js Image component? (Check in components)
   - Favicon is PNG - convert to ICO for better browser support

7. **Code Splitting**
   - App Router automatically code-splits ✅
   - Verify: Dynamic imports for large charts/PDFs

#### **API Performance**

8. **Calculation Engine Optimization**
   ```typescript
   // lib/services/calculation-engine.ts
   // ⚠️ Multiple sequential database updates in loops
   for (const fuel of record.fuelUsage) {
     await prisma.fuelUsage.update({ ... }); // N queries
   }
   ```
   **Solution:** Batch updates with `Promise.all` or use transactions

9. **Response Caching**
   ```
   Status: React Query caches on client (2min staleTime) ✅
   Missing: HTTP caching headers (Cache-Control, ETag)
   ```

---

## User Experience Gaps

### 🎨 UX/UI Observations

1. **Onboarding Flow**
   - Organization setup exists ✅
   - Missing: Guided tour, sample data, tooltips

2. **Form Validation Feedback**
   - React Hook Form used ✅
   - Verify: Error messages are user-friendly

3. **Loading States**
   - Skeletons implemented ✅
   - Verify: All mutations show loading indicators

4. **Empty States**
   - Dashboard has empty state ✅
   - Check: Other pages (facilities, reports)

5. **Error Messages**
   ```typescript
   // Generic errors shown to users:
   { error: "Failed to calculate emissions" }

   Recommendation: User-friendly messages + troubleshooting tips
   ```

6. **Accessibility**
   - Radix UI components are accessible ✅
   - TODO: Full WCAG 2.1 AA audit (keyboard nav, screen readers)

7. **Mobile Experience**
   - Tailwind responsive classes used ✅
   - TODO: Test on actual mobile devices

8. **Data Entry Efficiency**
   - No keyboard shortcuts
   - No auto-save drafts
   - No copy/duplicate records
   - No templates for recurring entries

9. **Export Feedback**
   - PDF/CSV generation - does it show progress?
   - Large exports might timeout

---

## Recommendations by Priority

### 🔥 **P0: Must Fix Before Production**

1. **Add Email Service Integration**
   - Provider: Resend (simple) or SendGrid (enterprise)
   - Templates: Verification, password reset, welcome
   - Queue: For reliability (BullMQ + Redis)

2. **Implement Request Validation**
   - Add Zod schemas for all API POST/PATCH bodies
   - Validate query parameters
   - Sanitize user inputs

3. **Create .env.example**
   ```env
   DATABASE_URL=
   DIRECT_URL=
   BETTER_AUTH_SECRET=
   BETTER_AUTH_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Add Error Monitoring**
   - Integrate Sentry
   - Add error boundaries for all pages
   - Log errors with context (user, org, action)

5. **Switch to Prisma Migrate**
   ```bash
   npx prisma migrate dev --name init
   # Commit migrations/ folder to git
   ```

6. **Add Rate Limiting**
   - Use `@upstash/ratelimit` with Vercel KV
   - Limits: 100 req/min per user for reads, 20 req/min for writes

7. **Add Database Indexes**
   ```prisma
   model EmissionRecord {
     @@index([organizationId])
     @@index([reportingPeriodStart])
   }
   ```

8. **Write Tests for Calculation Engine**
   - Use Vitest or Jest
   - Test each emission calculation function
   - Test edge cases (zero values, negative, null)

---

### 🟠 **P1: High Priority (Within 1 Month)**

9. **API Input Validation Example**
   ```typescript
   import { z } from 'zod';

   const createRecordSchema = z.object({
     organizationId: z.string().cuid(),
     reportingPeriodStart: z.string().datetime(),
     // ...
   });

   export const POST = withAuth(async (request, { user }) => {
     const body = await request.json();
     const validated = createRecordSchema.parse(body); // Throws if invalid
     // ...
   });
   ```

10. **Add Refrigerant Usage API**
    - POST /api/refrigerant-usage
    - GET /api/refrigerant-usage?emissionRecordId=xxx

11. **Implement Multi-User Support**
    ```prisma
    model OrganizationMember {
      id             String   @id @default(cuid())
      organizationId String
      userId         String
      role           Role     @default(viewer)
      organization   Organization @relation(...)
      user           User     @relation(...)

      @@unique([organizationId, userId])
    }

    enum Role {
      owner
      admin
      editor
      viewer
    }
    ```

12. **Add Audit Logging**
    ```prisma
    model AuditLog {
      id        String   @id @default(cuid())
      userId    String
      action    String   // "created", "updated", "deleted"
      entity    String   // "EmissionRecord", "FuelUsage"
      entityId  String
      changes   Json?
      createdAt DateTime @default(now())
    }
    ```

13. **Create API Documentation**
    - Use `@ts-rest/core` or Swagger
    - Generate docs from TypeScript types

14. **Add Health Check Endpoint**
    ```typescript
    // app/api/health/route.ts
    export async function GET() {
      const dbHealthy = await prisma.$queryRaw`SELECT 1`;
      return NextResponse.json({
        status: 'ok',
        database: dbHealthy ? 'connected' : 'disconnected',
        version: process.env.npm_package_version,
      });
    }
    ```

15. **Improve README**
    - Setup instructions
    - Environment variables
    - Database setup
    - Seeding data
    - Running tests
    - Deployment

16. **Add Security Headers**
    ```typescript
    // middleware.ts
    export function middleware(request: NextRequest) {
      const response = NextResponse.next();
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      return response;
    }
    ```

---

### 🟡 **P2: Medium Priority (Within 3 Months)**

17. **Bulk Import Feature**
    - CSV template download
    - Upload & validate
    - Preview before import
    - Error reporting

18. **Emission Targets & Goals**
    ```prisma
    model EmissionTarget {
      id             String   @id @default(cuid())
      organizationId String
      targetYear     Int
      targetCo2e     Decimal
      baselineYear   Int
      baselineCo2e   Decimal
    }
    ```

19. **Advanced Analytics**
    - Forecasting (linear regression)
    - Peer comparison (anonymized)
    - Carbon intensity (per revenue, per sqm)

20. **Notification System**
    - Email digest (weekly/monthly)
    - Reminders for data entry
    - Alerts for missing data

21. **Move Emission Factors to Database**
    ```prisma
    model EmissionFactor {
      id          String   @id @default(cuid())
      scope       Int      // 1, 2, or 3
      category    String   // "fuel", "electricity", "transport"
      subCategory String   // "diesel", "natural_gas"
      factor      Decimal
      unit        String
      region      String?  // "PH", "US", "global"
      source      String
      validFrom   DateTime
      validTo     DateTime?
    }
    ```

22. **CI/CD Pipeline**
    ```yaml
    # .github/workflows/ci.yml
    name: CI
    on: [push, pull_request]
    jobs:
      test:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - run: npm ci
          - run: npm run lint
          - run: npm run type-check
          - run: npm test
          - run: npm run build
    ```

23. **Database Backup Strategy**
    - Automated daily backups
    - Test restore procedure
    - Document in ops runbook

24. **Performance Monitoring**
    - Add Vercel Analytics
    - Track Core Web Vitals
    - Monitor API response times

---

### 🟢 **P3: Nice to Have (Future)**

25. **Mobile App**
    - React Native or PWA
    - Offline data entry
    - Photo uploads (utility bills)

26. **Third-Party Integrations**
    - Accounting software (QuickBooks)
    - Utility providers (auto-import)
    - Carbon offset marketplaces

27. **AI Features**
    - Auto-categorize expenses
    - Detect anomalies
    - Suggest reduction strategies

28. **Blockchain Verification**
    - Immutable audit trail
    - Carbon credit tokenization

29. **White-Label Solution**
    - Multi-tenant architecture
    - Custom branding
    - SSO integration

---

## Implementation Roadmap

### **Sprint 1-2 (Weeks 1-4): Production Readiness**
- [ ] Email service integration (Resend)
- [ ] .env.example file
- [ ] Request validation (Zod) on all API routes
- [ ] Error monitoring (Sentry)
- [ ] Prisma migrations
- [ ] Database indexes
- [ ] Rate limiting
- [ ] Security headers middleware
- [ ] README documentation

### **Sprint 3-4 (Weeks 5-8): Core Features**
- [ ] Refrigerant usage API
- [ ] Multi-user support (roles & permissions)
- [ ] Audit logging
- [ ] Calculation engine tests
- [ ] API documentation (Swagger)
- [ ] Health check endpoint
- [ ] Bulk CSV import

### **Sprint 5-6 (Weeks 9-12): Advanced Features**
- [ ] Emission targets & goals
- [ ] Notification system
- [ ] Advanced analytics dashboard
- [ ] Move emission factors to database
- [ ] Admin panel for factor management
- [ ] Database backup automation
- [ ] CI/CD pipeline

### **Sprint 7+ (Month 4+): Scale & Optimize**
- [ ] Performance optimization
- [ ] Mobile responsiveness improvements
- [ ] Third-party integrations
- [ ] Compliance features (GHG Protocol, ISO 14064)
- [ ] Carbon offset marketplace integration

---

## Testing Strategy

### **Unit Tests (Vitest/Jest)**
```typescript
// tests/lib/services/calculation-engine.test.ts
import { calculateFuelEmissions } from '@/lib/utils/calculations';

describe('calculateFuelEmissions', () => {
  it('calculates diesel emissions correctly', () => {
    const result = calculateFuelEmissions('diesel', 100);
    expect(result).toBe(0.269); // 100L * 0.00269 tCO2e/L
  });

  it('handles zero quantity', () => {
    expect(calculateFuelEmissions('diesel', 0)).toBe(0);
  });
});
```

### **Integration Tests (Playwright/Cypress)**
```typescript
// tests/e2e/auth.spec.ts
test('user can sign up and create organization', async ({ page }) => {
  await page.goto('/auth/signup');
  await page.fill('input[name=email]', 'test@example.com');
  await page.fill('input[name=password]', 'SecurePass123!');
  await page.click('button[type=submit]');

  await page.waitForURL('/onboarding/organization');
  await page.fill('input[name=name]', 'Test Corp');
  await page.click('button[type=submit]');

  await expect(page).toHaveURL('/dashboard');
});
```

### **API Tests (Supertest)**
```typescript
// tests/api/emission-records.test.ts
describe('POST /api/emission-records', () => {
  it('creates emission record with valid data', async () => {
    const response = await request(app)
      .post('/api/emission-records')
      .set('Authorization', `Bearer ${token}`)
      .send({
        organizationId: 'valid-id',
        reportingPeriodStart: '2025-01-01',
        reportingPeriodEnd: '2025-12-31',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });

  it('rejects invalid date range', async () => {
    await request(app)
      .post('/api/emission-records')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reportingPeriodStart: '2025-12-31',
        reportingPeriodEnd: '2025-01-01', // End before start
      })
      .expect(400);
  });
});
```

---

## Deployment Checklist

### **Pre-Deployment**
- [ ] All environment variables documented
- [ ] Secrets stored in secure vault (Vercel/AWS Secrets Manager)
- [ ] Database migrations tested
- [ ] Backup/restore procedure tested
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] HTTPS enforced
- [ ] CORS configured
- [ ] Error monitoring active

### **Post-Deployment**
- [ ] Health checks passing
- [ ] Monitoring dashboards configured
- [ ] Alert rules set up
- [ ] Rollback plan documented
- [ ] Performance baseline established
- [ ] User acceptance testing completed

---

## Conclusion

RevEarth has a **solid foundation** with modern architecture and good separation of concerns. However, it requires **significant hardening** before production deployment. The main gaps are:

1. **Testing** - No test coverage
2. **Email** - Critical auth features disabled
3. **Validation** - API inputs not validated
4. **Monitoring** - No error tracking
5. **Documentation** - Setup and API docs missing

**Estimated Timeline to Production:**
- **Minimum Viable Product:** 4-6 weeks (P0 + P1 items)
- **Full-Featured Launch:** 3-4 months (P0 + P1 + P2 items)

**Team Recommendation:**
- 1-2 Full-stack developers
- 1 DevOps engineer (part-time)
- 1 QA engineer (part-time)

---

## Quick Wins (Start Here)

1. Create `.env.example` (5 min)
2. Update README with setup instructions (30 min)
3. Add Zod validation to one API route (template for others) (1 hour)
4. Integrate Sentry (1 hour)
5. Add database indexes (30 min)
6. Set up Prisma migrations (1 hour)

**Total: ~4 hours to significantly improve the project**

---

*Generated by: Claude Code*
*Last Updated: October 19, 2025*
