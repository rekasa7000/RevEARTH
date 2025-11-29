# RevEarth GHG Inventory Platform - System Flow Documentation

## Table of Contents
1. [Overview](#overview)
2. [User Journey](#user-journey)
3. [Phase 1: Initial Onboarding](#phase-1-initial-onboarding)
4. [Phase 2: Monthly Data Collection](#phase-2-monthly-data-collection)
5. [Phase 3: Reporting & Analytics](#phase-3-reporting--analytics)
6. [Page Structure & Navigation](#page-structure--navigation)
7. [Database Schema Workflow](#database-schema-workflow)
8. [Feature Priority](#feature-priority)

---

## Overview

RevEarth is a GHG (Greenhouse Gas) Inventory Platform designed for:
- Small to medium Filipino businesses
- Regional offices of multinational corporations
- Local government units (LGUs)
- Academic institutions
- Commercial and industrial facilities

### Key Principles
- **Progressive Disclosure**: Don't overwhelm users with all features at once
- **Adaptive Scopes**: Automatically configure emission scopes based on organization type
- **Flexible Implementation**: Allow gradual adoption with "Future Phase" marking
- **Real-time Feedback**: Live calculations and validation during data entry

---

## User Journey

```
NEW USER FLOW
==============
Sign Up → Email Verification → Login → Organization Setup → Scope Configuration → Dashboard

RECURRING MONTHLY FLOW
======================
Dashboard → Data Entry → Auto-Calculate → Review → Report → Next Month
```

---

## Phase 1: Initial Onboarding

### Step 1: Registration & Authentication
```
1. User signs up with email and password
2. Email verification sent
3. User verifies email
4. User logs in to dashboard
```

**Implementation Files:**
- `/app/auth/signup/page.tsx` ✅
- `/app/auth/signin/page.tsx` ✅
- `/lib/auth/auth-hooks.ts` ✅

---

### Step 2: Organization Setup (One-time)

**Workflow:**
```
1. Enter organization details
   - Organization name
   - Industry sector (optional)

2. Select occupancy type (Required)
   ├─ Residential - Apartment complexes, condominiums
   ├─ Commercial - Offices, retail, hospitality
   ├─ Industrial - Manufacturing, warehouses
   ├─ LGU - Local government facilities
   └─ Academic - Schools, universities

3. System automatically configures applicable scopes
   - Residential: Scope 1 & 2
   - Commercial/Industrial/LGU/Academic: Scope 1, 2 & 3
```

**Database:**
- Table: `organizations`
- Fields: `name`, `industrySector`, `occupancyType`, `applicableScopes`

**API Endpoint:**
- `POST /api/organizations` ✅

---

### Step 3: Scope Configuration

**Workflow:**
```
1. Review auto-suggested scopes based on occupancy type
2. User can enable/disable specific scopes
3. Mark scopes as "Future Phase" if not ready
4. Set reporting period (monthly recommended)
```

**Scope Requirements by Occupancy:**
| Occupancy Type | Scope 1 | Scope 2 | Scope 3 |
|---------------|---------|---------|---------|
| Residential   | ✅      | ✅      | ❌      |
| Commercial    | ✅      | ✅      | ✅      |
| Industrial    | ✅      | ✅      | ✅      |
| LGU           | ✅      | ✅      | ✅      |
| Academic      | ✅      | ✅      | ✅      |

---

### Step 4: Facility Setup (Optional)

**Workflow:**
```
1. Add primary facility location
2. Add additional facilities if multi-location
3. Configure meters/tracking points per facility
```

**Database:**
- Table: `facilities`
- Fields: `name`, `location`, `address`, `areaSqm`, `employeeCount`

**API Endpoint:**
- `POST /api/facilities` (To be created)

---

## Phase 2: Monthly Data Collection

### Dashboard Landing Page

**Key Components:**
```
1. Current Month Status
   - Progress indicator (% complete)
   - Missing data alerts
   - Last update timestamp

2. Quick Stats
   - Total CO2e emissions (current month)
   - Emissions per employee
   - Largest emission source

3. Quick Action Buttons
   - "Add Scope 1 Data"
   - "Add Scope 2 Data"
   - "Add Scope 3 Data" (if applicable)

4. Real-time Emission Totals
   - Pie chart by scope
   - Monthly trend line chart
```

**Implementation:**
- Page: `/app/dashboard/page.tsx` ✅

---

### Data Entry Workflow

#### 1. Scope 1 - Direct Emissions

**Fuel Consumption Entry:**
```
Form Fields:
- Fuel Type (dropdown): Natural gas, Heating oil, Propane, Diesel
- Quantity (number)
- Unit (auto-selected based on fuel type)
- Entry Date (date picker)
- Metadata (optional notes)

Auto-Calculation:
- CO2e = Quantity × Emission Factor
- Real-time display of calculated emissions
```

**Vehicle Fleet Data:**
```
Form Fields:
- Vehicle Type (dropdown): Sedan, SUV, Truck, Van, Motorcycle
- Fuel Type: Gasoline, Diesel
- Fuel Consumed OR Mileage
- Unit: Liters or Kilometers
- Entry Date

Auto-Calculation:
- If fuel: CO2e = Fuel × Emission Factor
- If mileage: CO2e = Distance × Vehicle Emission Factor
```

**Refrigerants:**
```
Form Fields:
- Refrigerant Type: R-410A, R-134a, R-32, R-404A
- Quantity Leaked (optional)
- Quantity Purchased (optional)
- Unit: kg
- Equipment ID (optional)
- Entry Date

Auto-Calculation:
- CO2e = (Leaked + Purchased) × GWP Factor
```

**Database:**
- Tables: `fuel_usage`, `vehicle_usage`, `refrigerant_usage`
- Linked to: `emission_records`

**API Endpoints:**
- `POST /api/emission-records/:id/fuel-usage`
- `POST /api/emission-records/:id/vehicle-usage`
- `POST /api/emission-records/:id/refrigerants`

---

#### 2. Scope 2 - Electricity (Indirect)

**Utility Bill Entry:**
```
Form Fields:
- Facility (dropdown, if multi-location)
- Meter Number (optional)
- kWh Consumption (number, required)
- Peak Hours kWh (optional)
- Off-peak Hours kWh (optional)
- Billing Period Start (date)
- Billing Period End (date)

Auto-Calculation:
- CO2e = kWh × Philippine Grid Emission Factor
- Monthly total across all facilities
```

**Database:**
- Table: `electricity_usage`
- Fields: `kwhConsumption`, `peakHoursKwh`, `offpeakHoursKwh`, `billingPeriodStart`, `billingPeriodEnd`

**API Endpoint:**
- `POST /api/emission-records/:id/electricity`

---

#### 3. Scope 3 - Employee Commuting (Quarterly)

**Survey Workflow:**
```
1. Admin initiates quarterly survey
2. Survey link distributed to employees
3. Employees submit data:
   - Distance from home to office (km)
   - Transportation mode (Car, Motorcycle, Bus, Jeepney, Train, Bicycle, Walking)
   - Office days per week
   - WFH days per week

4. System aggregates results
5. Auto-calculates CO2e based on:
   - Transport mode emission factors
   - Distance × Days × Weeks × Emission Factor
```

**Database:**
- Table: `employee_commute_surveys`
- Table: `commuting_data` (aggregated)

**API Endpoints:**
- `POST /api/organizations/:id/commute-survey` (Create survey)
- `POST /api/commute-survey/:id/responses` (Submit response)
- `GET /api/emission-records/:id/commuting` (Get aggregated data)

---

### Auto-Calculation & Validation

**Real-time Calculation Engine:**
```
1. Emission Factor Database
   - Fuel types with CO2e factors
   - Vehicle emission factors by type
   - Refrigerant GWP values
   - Philippine electricity grid factor
   - Transport mode emission factors

2. Calculation Logic
   - CO2e = Activity Data × Emission Factor
   - Unit conversions (gallons→liters, miles→km)
   - Aggregation across scopes

3. Data Validation
   - Range checking (e.g., kWh should be > 0 and < 1,000,000)
   - Unusual value alerts (e.g., 10x normal consumption)
   - Missing required fields
   - Date range validation
```

**Implementation:**
- Backend calculation service
- Emission factors stored in database or constants
- Real-time API responses with calculated CO2e

---

## Phase 3: Reporting & Analytics

### Dashboard Analytics

**Key Visualizations:**
```
1. Emission Breakdown (Pie Chart)
   - Scope 1 (Direct)
   - Scope 2 (Electricity)
   - Scope 3 (Commuting)

2. Monthly Trends (Line Chart)
   - X-axis: Months
   - Y-axis: Total CO2e
   - Compare year-over-year

3. Largest Sources (Bar Chart)
   - Top 5 emission sources
   - Sorted by CO2e contribution

4. KPI Cards
   - Total CO2e emissions
   - Emissions per employee
   - % change from last month
   - Reduction target progress
```

**Implementation:**
- Charts: Using existing chart components
- Data aggregation: Backend API

---

### Report Generation

**Report Types:**
```
1. Summary Report (PDF)
   - Executive dashboard
   - Total emissions by scope
   - Key insights and trends
   - Compliance-ready formatting

2. Detailed Report (PDF)
   - All data entries
   - Line-item breakdown
   - Supporting documentation
   - Calculation methodology

3. CSV Export
   - Raw data export
   - All emission records
   - Custom date range
```

**Workflow:**
```
User selects:
1. Report Type (Summary/Detailed)
2. Date Range (Month, Quarter, Year)
3. Include Facilities (if multi-location)
4. Generate → Download PDF/CSV
```

**API Endpoints:**
- `GET /api/reports/summary?startDate=&endDate=`
- `GET /api/reports/detailed?startDate=&endDate=`
- `GET /api/reports/export?format=csv`

---

## Page Structure & Navigation

### Main Navigation (Sidebar)

```
📊 Dashboard (/)
   - Overview of current month
   - Quick stats and charts

📝 Calculation (/calculation)
   - Emission Records list
   - Create new record
   - Data entry wizard

📁 Data Entry (Sub-menu)
   ├─ Scope 1 (/calculation?scope=1)
   ├─ Scope 2 (/calculation?scope=2)
   └─ Scope 3 (/calculation?scope=3)

🏢 Facilities (/facilities)
   - List all facilities
   - Add/Edit/Delete facilities

📈 Reports (/reports)
   - Generate reports
   - View past reports
   - Export data

⚙️ Settings (/settings)
   ├─ Organization Profile
   ├─ Scope Configuration
   └─ User Account

👤 Profile (/profile)
   - User information
   - Organization details
   - Session management
```

### Page Hierarchy

```
/
├── /auth
│   ├── /signin ✅
│   └── /signup ✅
│
├── /dashboard ✅
│
├── /calculation ✅
│   └── /[id] (View/Edit emission record)
│
├── /facilities (To create)
│   ├── /new
│   └── /[id]
│
├── /reports ✅
│   └── /[id] (View specific report)
│
├── /settings ✅
│   ├── /organization (To create)
│   ├── /scopes (To create)
│   └── /account
│
└── /profile ✅
```

---

## Database Schema Workflow

### Onboarding Status Tracking

```sql
-- Track user onboarding progress
CREATE TABLE onboarding_status (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id),
  organization_setup_complete BOOLEAN DEFAULT false,
  scope_configuration_complete BOOLEAN DEFAULT false,
  facility_setup_complete BOOLEAN DEFAULT false,
  first_data_entry_complete BOOLEAN DEFAULT false,
  current_step TEXT, -- 'org_setup', 'scope_config', 'facility_setup', 'complete'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Monthly Data Entry Status

```sql
-- Track monthly data entry completion
CREATE TABLE monthly_data_status (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  month INTEGER, -- 1-12
  year INTEGER,
  scope1_complete BOOLEAN DEFAULT false,
  scope2_complete BOOLEAN DEFAULT false,
  scope3_complete BOOLEAN DEFAULT false,
  completion_percentage DECIMAL(5,2), -- 0.00 to 100.00
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, month, year)
);
```

### Emission Calculation Cache

```sql
-- Cache calculated emissions for performance
CREATE TABLE emission_calculations (
  id TEXT PRIMARY KEY,
  emission_record_id TEXT UNIQUE REFERENCES emission_records(id),
  total_scope1_co2e DECIMAL(15,4),
  total_scope2_co2e DECIMAL(15,4),
  total_scope3_co2e DECIMAL(15,4),
  total_co2e DECIMAL(15,4),
  breakdown_by_category JSONB, -- {"fuel": 100, "electricity": 200, ...}
  emission_factors_used JSONB, -- Store factors used for transparency
  emissions_per_employee DECIMAL(12,4),
  calculated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Feature Priority

### Phase 1: MVP (Must-Have) ✅

| Feature | Status | Priority |
|---------|--------|----------|
| Authentication (email/password) | ✅ Done | P0 |
| Organization setup with occupancy type | ✅ Done | P0 |
| Scope 1 & 2 data entry forms | 🔄 In Progress | P0 |
| Auto-calculation engine | 📋 Planned | P0 |
| Basic dashboard with charts | ✅ Done | P0 |
| PDF report generation | 📋 Planned | P0 |

### Phase 1.5: Enhanced MVP (Should-Have)

| Feature | Status | Priority |
|---------|--------|----------|
| Scope 3 (employee commuting) | 📋 Planned | P1 |
| Multi-facility support | ✅ Schema Ready | P1 |
| CSV export | 📋 Planned | P1 |
| Data validation & error checking | 📋 Planned | P1 |
| Onboarding wizard | 📋 Planned | P1 |

### Phase 2: Advanced Features (Nice-to-Have)

| Feature | Status | Priority |
|---------|--------|----------|
| Multi-user accounts | 📋 Future | P2 |
| Custom emission factors | 📋 Future | P2 |
| Advanced analytics | 📋 Future | P2 |
| API integrations | 📋 Future | P3 |
| Mobile app | 📋 Future | P3 |

---

## Implementation Checklist

### Immediate Next Steps

- [ ] **Create Onboarding Wizard**
  - [ ] Organization setup page (`/onboarding/organization`)
  - [ ] Scope configuration page (`/onboarding/scopes`)
  - [ ] Facility setup page (`/onboarding/facilities`)
  - [ ] Completion redirect to dashboard

- [ ] **Build Data Entry Forms**
  - [ ] Emission record creation
  - [ ] Scope 1 forms (Fuel, Vehicles, Refrigerants)
  - [ ] Scope 2 form (Electricity)
  - [ ] Scope 3 form (Commuting survey)

- [ ] **Implement Calculation Engine**
  - [ ] Emission factors database/constants
  - [ ] Calculation service (Backend)
  - [ ] Real-time calculation API
  - [ ] Unit conversion utilities

- [ ] **Enhance Dashboard**
  - [ ] Monthly data entry status widget
  - [ ] Missing data alerts
  - [ ] Quick action buttons
  - [ ] Real-time emission updates

- [ ] **Build Reporting System**
  - [ ] PDF generation service
  - [ ] Summary report template
  - [ ] Detailed report template
  - [ ] CSV export functionality

---

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        NEW USER                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Sign Up        │
                    │   Verify Email   │
                    │   Login          │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Create Org       │
                    │ Select Occupancy │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Auto-Config      │
                    │ Scopes           │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Add Facility     │
                    │ (Optional)       │
                    └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              MONTHLY WORKFLOW (Recurring)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Dashboard      │
                    │   Reminder       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Scope 1 Entry    │
                    │ (Fuel, Vehicles) │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Scope 2 Entry    │
                    │ (Electricity)    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Scope 3 Entry    │
                    │ (Commuting)      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Auto-Calculate   │
                    │ Validate Data    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Dashboard        │
                    │ Updates          │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Generate Report  │
                    │ Export/Print     │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Next Month     │
                    │   Repeat         │
                    └──────────────────┘
```

---

## Contact & Support

For questions about this system flow, contact the development team or refer to:
- Technical Documentation: `/docs/API.md`
- Database Schema: `/docs/DATABASE.md`
- Component Library: `/docs/COMPONENTS.md`

---

**Last Updated:** 2025-10-12
**Version:** 1.0
**Status:** Living Document
