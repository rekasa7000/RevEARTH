# RevEarth GHG Inventory Platform - Backend Documentation

## Table of Contents
1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Database Schema](#database-schema)
4. [System Architecture](#system-architecture)
5. [Use Cases](#use-cases)
6. [User Walkthrough](#user-walkthrough)
7. [API Endpoints](#api-endpoints)
8. [Business Logic](#business-logic)
9. [Data Models](#data-models)
10. [Security & Authentication](#security--authentication)

---

## Overview

RevEarth is a GHG (Greenhouse Gas) Inventory Platform designed for small to medium Filipino businesses, regional offices, LGUs, academic institutions, and commercial/industrial facilities to track and manage their carbon emissions.

### Target Users
- Small to medium Filipino businesses
- Regional offices of multinational corporations
- Local government units (LGUs)
- Academic institutions
- Commercial and industrial facilities

### Core Objectives
- Simplify GHG emissions tracking across Scope 1, 2, and 3
- Provide automatic calculation with EPA and Philippine emission factors
- Generate compliance-ready reports
- Enable data-driven sustainability decisions

---

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--|| ORGANIZATION : "manages"
    ORGANIZATION ||--o{ FACILITY : "has"
    ORGANIZATION ||--|| SUBSCRIPTION : "subscribes_to"
    ORGANIZATION ||--o{ EMISSION_RECORD : "tracks"
    FACILITY ||--o{ SCOPE2_ELECTRICITY : "monitors"
    EMISSION_RECORD ||--o{ SCOPE1_FUEL : "contains"
    EMISSION_RECORD ||--o{ SCOPE1_VEHICLE : "contains"
    EMISSION_RECORD ||--o{ SCOPE1_REFRIGERANT : "contains"
    EMISSION_RECORD ||--o{ SCOPE2_ELECTRICITY : "contains"
    EMISSION_RECORD ||--o{ SCOPE3_COMMUTING : "contains"
    ORGANIZATION ||--o{ EMPLOYEE_COMMUTE_SURVEY : "conducts"
    EMISSION_RECORD ||--|| EMISSION_CALCULATION : "calculates"

    USER {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        timestamp created_at
        timestamp last_login
        boolean is_verified
    }

    ORGANIZATION {
        uuid id PK
        uuid user_id FK
        string name
        string industry_sector
        enum occupancy_type
        json reporting_boundaries
        json applicable_scopes
        timestamp created_at
        timestamp updated_at
    }

    SUBSCRIPTION {
        uuid id PK
        uuid organization_id FK
        enum tier
        date start_date
        date end_date
        boolean is_active
        json features_enabled
        int reports_generated_this_month
        timestamp created_at
    }

    FACILITY {
        uuid id PK
        uuid organization_id FK
        string name
        string location
        string address
        float area_sqm
        int employee_count
        timestamp created_at
    }

    EMISSION_RECORD {
        uuid id PK
        uuid organization_id FK
        uuid facility_id FK
        date reporting_period_start
        date reporting_period_end
        enum status
        json scope_selection
        timestamp created_at
        timestamp updated_at
    }

    SCOPE1_FUEL {
        uuid id PK
        uuid emission_record_id FK
        enum fuel_type
        float quantity
        string unit
        float co2e_calculated
        date entry_date
        json metadata
    }

    SCOPE1_VEHICLE {
        uuid id PK
        uuid emission_record_id FK
        string vehicle_id
        enum vehicle_type
        enum fuel_type
        float fuel_consumed
        float mileage
        string unit
        float co2e_calculated
        date entry_date
    }

    SCOPE1_REFRIGERANT {
        uuid id PK
        uuid emission_record_id FK
        string equipment_id
        enum refrigerant_type
        float quantity_leaked
        float quantity_purchased
        string unit
        float co2e_calculated
        date entry_date
        json leak_detection_log
    }

    SCOPE2_ELECTRICITY {
        uuid id PK
        uuid emission_record_id FK
        uuid facility_id FK
        string meter_number
        float kwh_consumption
        float peak_hours_kwh
        float offpeak_hours_kwh
        float co2e_calculated
        date billing_period_start
        date billing_period_end
        json utility_bill_data
    }

    SCOPE3_COMMUTING {
        uuid id PK
        uuid emission_record_id FK
        int employee_count
        float avg_distance_km
        enum transport_mode
        int days_per_week
        int wfh_days
        float co2e_calculated
        date survey_date
    }

    EMPLOYEE_COMMUTE_SURVEY {
        uuid id PK
        uuid organization_id FK
        string employee_identifier
        float distance_km
        enum transport_mode
        int office_days_per_week
        int wfh_days_per_week
        date survey_date
        enum quarter
    }

    EMISSION_CALCULATION {
        uuid id PK
        uuid emission_record_id FK
        float total_scope1_co2e
        float total_scope2_co2e
        float total_scope3_co2e
        float total_co2e
        json breakdown_by_category
        json emission_factors_used
        float emissions_per_employee
        timestamp calculated_at
    }
```

---

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP
);
```

#### organizations
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    industry_sector VARCHAR(255),
    occupancy_type VARCHAR(50) CHECK (occupancy_type IN ('residential', 'commercial', 'industrial', 'lgu', 'academic')),
    reporting_boundaries JSONB,
    applicable_scopes JSONB DEFAULT '{"scope1": true, "scope2": true, "scope3": false}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### subscriptions
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    tier VARCHAR(50) CHECK (tier IN ('basic', 'standard', 'premium')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    features_enabled JSONB,
    reports_generated_this_month INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### facilities
```sql
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    address TEXT,
    area_sqm DECIMAL(10,2),
    employee_count INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### emission_records
```sql
CREATE TABLE emission_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id),
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    status VARCHAR(50) CHECK (status IN ('draft', 'submitted', 'validated', 'archived')),
    scope_selection JSONB DEFAULT '{"scope1": true, "scope2": true, "scope3": false}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### scope1_fuel
```sql
CREATE TABLE scope1_fuel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emission_record_id UUID REFERENCES emission_records(id) ON DELETE CASCADE,
    fuel_type VARCHAR(50) CHECK (fuel_type IN ('natural_gas', 'heating_oil', 'propane', 'diesel')),
    quantity DECIMAL(12,2) NOT NULL,
    unit VARCHAR(20),
    co2e_calculated DECIMAL(12,4),
    entry_date DATE NOT NULL,
    metadata JSONB
);
```

#### scope1_vehicles
```sql
CREATE TABLE scope1_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emission_record_id UUID REFERENCES emission_records(id) ON DELETE CASCADE,
    vehicle_id VARCHAR(100),
    vehicle_type VARCHAR(50) CHECK (vehicle_type IN ('sedan', 'suv', 'truck', 'van', 'motorcycle')),
    fuel_type VARCHAR(50) CHECK (fuel_type IN ('gasoline', 'diesel', 'lpg')),
    fuel_consumed DECIMAL(10,2),
    mileage DECIMAL(10,2),
    unit VARCHAR(20),
    co2e_calculated DECIMAL(12,4),
    entry_date DATE NOT NULL
);
```

#### scope1_refrigerants
```sql
CREATE TABLE scope1_refrigerants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emission_record_id UUID REFERENCES emission_records(id) ON DELETE CASCADE,
    equipment_id VARCHAR(100),
    refrigerant_type VARCHAR(50) CHECK (refrigerant_type IN ('R-410A', 'R-134a', 'R-32', 'R-404A')),
    quantity_leaked DECIMAL(10,4),
    quantity_purchased DECIMAL(10,4),
    unit VARCHAR(20),
    co2e_calculated DECIMAL(12,4),
    entry_date DATE NOT NULL,
    leak_detection_log JSONB
);
```

#### scope2_electricity
```sql
CREATE TABLE scope2_electricity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emission_record_id UUID REFERENCES emission_records(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id),
    meter_number VARCHAR(100),
    kwh_consumption DECIMAL(12,2) NOT NULL,
    peak_hours_kwh DECIMAL(12,2),
    offpeak_hours_kwh DECIMAL(12,2),
    co2e_calculated DECIMAL(12,4),
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    utility_bill_data JSONB
);
```

#### scope3_commuting
```sql
CREATE TABLE scope3_commuting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emission_record_id UUID REFERENCES emission_records(id) ON DELETE CASCADE,
    employee_count INT NOT NULL,
    avg_distance_km DECIMAL(8,2),
    transport_mode VARCHAR(50) CHECK (transport_mode IN ('car', 'motorcycle', 'bus', 'jeepney', 'train', 'bicycle', 'walking')),
    days_per_week INT,
    wfh_days INT,
    co2e_calculated DECIMAL(12,4),
    survey_date DATE
);
```

#### employee_commute_surveys
```sql
CREATE TABLE employee_commute_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    employee_identifier VARCHAR(255),
    distance_km DECIMAL(8,2),
    transport_mode VARCHAR(50),
    office_days_per_week INT,
    wfh_days_per_week INT,
    survey_date DATE NOT NULL,
    quarter VARCHAR(10)
);
```

#### emission_calculations
```sql
CREATE TABLE emission_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emission_record_id UUID REFERENCES emission_records(id) ON DELETE CASCADE,
    total_scope1_co2e DECIMAL(15,4),
    total_scope2_co2e DECIMAL(15,4),
    total_scope3_co2e DECIMAL(15,4),
    total_co2e DECIMAL(15,4),
    breakdown_by_category JSONB,
    emission_factors_used JSONB,
    emissions_per_employee DECIMAL(12,4),
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile Browser]
    end

    subgraph "API Gateway"
        C[Next.js API Routes]
        D[Middleware Layer]
    end

    subgraph "Authentication"
        E[NextAuth.js]
        F[JWT Token Manager]
    end

    subgraph "Application Layer"
        G[User Service]
        H[Organization Service]
        I[Emission Service]
        J[Calculation Engine]
        K[Report Generator]
        L[Survey Service]
    end

    subgraph "Business Logic"
        M[Emission Factor Database]
        N[Unit Converter]
        O[Data Validator]
        P[Scope Manager]
    end

    subgraph "Data Layer"
        Q[(PostgreSQL Database)]
        R[Prisma ORM]
    end

    subgraph "External Services"
        S[Email Service]
        T[PDF Generator]
        U[CSV Export]
    end

    A --> C
    B --> C
    C --> D
    D --> E
    E --> F
    D --> G
    D --> H
    D --> I
    G --> R
    H --> R
    I --> R
    I --> J
    J --> M
    J --> N
    I --> O
    I --> P
    J --> R
    K --> T
    K --> U
    L --> R
    R --> Q
    G --> S

    style C fill:#4CAF50
    style E fill:#2196F3
    style J fill:#FF9800
    style Q fill:#9C27B0
```

### Architecture Components

#### 1. Client Layer
- **Web Browser**: Primary interface for desktop users
- **Mobile Browser**: Responsive interface for mobile devices

#### 2. API Gateway
- **Next.js API Routes**: RESTful API endpoints
- **Middleware Layer**: Authentication, validation, error handling

#### 3. Authentication
- **NextAuth.js**: Authentication framework
- **JWT Token Manager**: Secure session management

#### 4. Application Layer Services

**User Service**
- User registration and authentication
- Profile management
- Password reset

**Organization Service**
- Organization setup and configuration
- Occupancy classification
- Scope selection management

**Emission Service**
- Data entry coordination
- Multi-scope data management
- Historical data retrieval

**Calculation Engine**
- Real-time emission calculations
- Emission factor application
- Aggregation logic

**Report Generator**
- PDF report creation
- CSV export functionality
- Custom date range reports

**Survey Service**
- Quarterly commute surveys
- Survey distribution and collection
- Aggregated survey analytics

#### 5. Business Logic
- **Emission Factor Database**: EPA and Philippine grid factors
- **Unit Converter**: Automatic unit conversions
- **Data Validator**: Input validation and error checking
- **Scope Manager**: Adaptive scope handling

#### 6. Data Layer
- **PostgreSQL Database**: Primary data store
- **Prisma ORM**: Type-safe database access

---

## Use Cases

```mermaid
graph LR
    subgraph Actors
        A1[User/Admin]
        A2[System]
    end

    subgraph "Authentication Use Cases"
        UC1[Register Account]
        UC2[Login]
        UC3[Reset Password]
        UC4[Verify Email]
    end

    subgraph "Organization Setup"
        UC5[Create Organization]
        UC6[Select Occupancy Type]
        UC7[Configure Applicable Scopes]
        UC8[Add Facilities]
    end

    subgraph "Data Entry"
        UC9[Enter Scope 1 Fuel Data]
        UC10[Enter Vehicle Fleet Data]
        UC11[Enter Refrigerant Data]
        UC12[Enter Electricity Data]
        UC13[Enter Commuting Data]
    end

    subgraph "Calculations"
        UC14[Calculate Emissions]
        UC15[Validate Data]
        UC16[Convert Units]
    end

    subgraph "Reporting"
        UC17[View Dashboard]
        UC18[Generate PDF Report]
        UC19[Export CSV Data]
        UC20[Compare Periods]
    end

    subgraph "Surveys"
        UC21[Create Commute Survey]
        UC22[Submit Survey Response]
        UC23[Aggregate Survey Data]
    end

    A1 --> UC1
    A1 --> UC2
    A1 --> UC3
    A1 --> UC5
    A1 --> UC6
    A1 --> UC7
    A1 --> UC8
    A1 --> UC9
    A1 --> UC10
    A1 --> UC11
    A1 --> UC12
    A1 --> UC13
    A1 --> UC17
    A1 --> UC18
    A1 --> UC19
    A1 --> UC20
    A1 --> UC21
    A1 --> UC22

    A2 --> UC4
    A2 --> UC14
    A2 --> UC15
    A2 --> UC16
    A2 --> UC23
```

### Detailed Use Cases

#### UC1: Register Account
**Actor**: User
**Precondition**: None
**Main Flow**:
1. User navigates to registration page
2. User enters email, password, and full name
3. System validates email format and password strength
4. System creates user account
5. System sends verification email
6. User verifies email via link

**Postcondition**: User account created and verified

---

#### UC5: Create Organization
**Actor**: User
**Precondition**: User is authenticated
**Main Flow**:
1. User navigates to organization setup
2. User enters organization name and industry sector
3. User selects occupancy type (Residential/Commercial/Industrial/LGU/Academic)
4. System adjusts available scopes based on occupancy type
5. User configures applicable scopes
6. System creates organization profile

**Postcondition**: Organization profile created

---

#### UC9: Enter Scope 1 Fuel Data
**Actor**: User
**Precondition**: Organization exists, Scope 1 is enabled
**Main Flow**:
1. User selects reporting period
2. User selects fuel type (natural gas, heating oil, propane, diesel)
3. User enters quantity and unit
4. System validates input ranges
5. System converts units if needed
6. System calculates CO2e emissions
7. System displays calculated emissions
8. User saves data

**Postcondition**: Fuel emission data recorded

---

#### UC14: Calculate Emissions
**Actor**: System
**Precondition**: Emission data entered
**Main Flow**:
1. System retrieves emission factors from database
2. System applies appropriate factor based on fuel/electricity type
3. System performs unit conversions
4. System calculates CO2e for each entry
5. System aggregates totals by scope
6. System calculates per-employee metrics
7. System stores calculation results

**Postcondition**: Emissions calculated and stored

---

#### UC18: Generate PDF Report
**Actor**: User
**Precondition**: Emission data exists, user has report quota
**Main Flow**:
1. User selects date range for report
2. User clicks "Generate PDF Report"
3. System retrieves emission data
4. System retrieves calculation results
5. System generates PDF with charts and tables
6. System decrements user's monthly report quota
7. System provides download link

**Postcondition**: PDF report generated and available for download

---

## User Walkthrough

### 1. Initial Setup Flow

```mermaid
flowchart TD
    A[Start] --> B[Visit Registration Page]
    B --> C[Enter Email & Password]
    C --> D[Submit Registration]
    D --> E{Email Valid?}
    E -->|No| F[Show Error]
    F --> C
    E -->|Yes| G[Create Account]
    G --> H[Send Verification Email]
    H --> I[User Clicks Verification Link]
    I --> J[Account Verified]
    J --> K[Redirect to Login]
    K --> L[Enter Credentials]
    L --> M[Authenticate]
    M --> N[Redirect to Organization Setup]
    N --> O[Enter Organization Details]
    O --> P[Select Occupancy Type]
    P --> Q{Occupancy Type?}
    Q -->|Residential| R[Enable Scope 1 & 2]
    Q -->|Commercial| S[Enable Scope 1, 2, 3]
    Q -->|Industrial| T[Enable All Scopes]
    Q -->|LGU| U[Enable Scope 1, 2, 3]
    Q -->|Academic| V[Enable Scope 1, 2, 3]
    R --> W[Configure Scopes]
    S --> W
    T --> W
    U --> W
    V --> W
    W --> X[Add Facilities - Optional]
    X --> Y[Setup Complete]
    Y --> Z[Redirect to Dashboard]
    Z --> End[End]
```

---

### 2. Monthly Data Entry Flow

```mermaid
flowchart TD
    A[User Logs In] --> B[Navigate to Dashboard]
    B --> C[Click Add New Record]
    C --> D[Select Reporting Period]
    D --> E{Which Scope?}

    E -->|Scope 1| F[Fuel Data Entry]
    E -->|Scope 1| G[Vehicle Data Entry]
    E -->|Scope 1| H[Refrigerant Data Entry]
    E -->|Scope 2| I[Electricity Data Entry]
    E -->|Scope 3| J[Commuting Data Entry]

    F --> F1[Select Fuel Type]
    F1 --> F2[Enter Quantity & Unit]
    F2 --> F3[System Validates Input]
    F3 --> F4{Valid?}
    F4 -->|No| F5[Show Error Message]
    F5 --> F2
    F4 -->|Yes| F6[Calculate CO2e]
    F6 --> F7[Display Result]
    F7 --> K

    G --> G1[Enter Vehicle ID]
    G1 --> G2[Select Vehicle & Fuel Type]
    G2 --> G3[Enter Fuel/Mileage]
    G3 --> G4[Calculate CO2e]
    G4 --> G5[Display Result]
    G5 --> K

    H --> H1[Enter Equipment ID]
    H1 --> H2[Select Refrigerant Type]
    H2 --> H3[Enter Leaked/Purchased Qty]
    H3 --> H4[Calculate CO2e]
    H4 --> H5[Display Result]
    H5 --> K

    I --> I1[Select Facility]
    I1 --> I2[Enter Meter Number]
    I2 --> I3[Enter kWh Consumption]
    I3 --> I4[Enter Billing Period]
    I4 --> I5[Calculate CO2e]
    I5 --> I6[Display Result]
    I6 --> K

    J --> J1[Enter Employee Count]
    J1 --> J2[Enter Avg Distance]
    J2 --> J3[Select Transport Mode]
    J3 --> J4[Enter Office/WFH Days]
    J4 --> J5[Calculate CO2e]
    J5 --> J6[Display Result]
    J6 --> K

    K[Save Data]
    K --> L{More Data?}
    L -->|Yes| E
    L -->|No| M[Submit Record]
    M --> N[System Aggregates Totals]
    N --> O[Update Dashboard]
    O --> P[Show Success Message]
    P --> End[End]
```

---

### 3. Report Generation Flow

```mermaid
flowchart TD
    A[User on Dashboard] --> B[Click Reports Tab]
    B --> C[Select Date Range]
    C --> D{Report Type?}

    D -->|PDF Summary| E[Generate PDF Report]
    D -->|CSV Export| F[Generate CSV Export]

    E --> E1[Check Report Quota]
    E1 --> E2{Quota Available?}
    E2 -->|No| E3[Show Upgrade Message]
    E3 --> End1[End]
    E2 -->|Yes| E4[Retrieve Emission Data]
    E4 --> E5[Retrieve Calculations]
    E5 --> E6[Generate Charts]
    E6 --> E7[Format PDF Layout]
    E7 --> E8[Add Executive Summary]
    E8 --> E9[Add Scope Breakdown]
    E9 --> E10[Add Trend Analysis]
    E10 --> E11[Decrement Quota]
    E11 --> E12[Provide Download Link]
    E12 --> End2[End]

    F --> F1[Retrieve Emission Data]
    F1 --> F2[Format CSV Columns]
    F2 --> F3[Generate CSV File]
    F3 --> F4[Provide Download Link]
    F4 --> End3[End]
```

---

### 4. Quarterly Survey Flow

```mermaid
flowchart TD
    A[System Triggers Quarterly Survey] --> B[Generate Survey Link]
    B --> C[Send Email to Employees]
    C --> D[Employee Clicks Link]
    D --> E[Open Survey Form]
    E --> F[Enter Commute Distance]
    F --> G[Select Transport Mode]
    G --> H[Enter Office Days/Week]
    H --> I[Enter WFH Days/Week]
    I --> J[Submit Survey]
    J --> K[System Validates Data]
    K --> L{Valid?}
    L -->|No| M[Show Error]
    M --> F
    L -->|Yes| N[Save Survey Response]
    N --> O[Thank You Message]
    O --> P{All Employees Responded?}
    P -->|No| Q[Wait for More Responses]
    Q --> End1[End]
    P -->|Yes| R[Aggregate Survey Data]
    R --> S[Calculate Avg Distance]
    S --> T[Calculate Transport Mode Distribution]
    T --> U[Update Scope 3 Data]
    U --> V[Recalculate Emissions]
    V --> W[Update Dashboard]
    W --> End2[End]
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
```json
{
  "endpoint": "/api/auth/register",
  "method": "POST",
  "description": "Register a new user account",
  "request_body": {
    "email": "user@example.com",
    "password": "SecurePass123!",
    "full_name": "Juan Dela Cruz"
  },
  "response_200": {
    "success": true,
    "message": "Account created. Please verify your email.",
    "user_id": "uuid"
  },
  "response_400": {
    "error": "Email already exists"
  }
}
```

#### POST /api/auth/login
```json
{
  "endpoint": "/api/auth/login",
  "method": "POST",
  "description": "Authenticate user and return JWT token",
  "request_body": {
    "email": "user@example.com",
    "password": "SecurePass123!"
  },
  "response_200": {
    "success": true,
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "Juan Dela Cruz"
    }
  },
  "response_401": {
    "error": "Invalid credentials"
  }
}
```

#### POST /api/auth/verify-email
```json
{
  "endpoint": "/api/auth/verify-email",
  "method": "POST",
  "description": "Verify user email with token",
  "request_body": {
    "token": "verification_token"
  },
  "response_200": {
    "success": true,
    "message": "Email verified successfully"
  }
}
```

#### POST /api/auth/forgot-password
```json
{
  "endpoint": "/api/auth/forgot-password",
  "method": "POST",
  "description": "Request password reset",
  "request_body": {
    "email": "user@example.com"
  },
  "response_200": {
    "success": true,
    "message": "Password reset link sent to email"
  }
}
```

#### POST /api/auth/reset-password
```json
{
  "endpoint": "/api/auth/reset-password",
  "method": "POST",
  "description": "Reset password with token",
  "request_body": {
    "token": "reset_token",
    "new_password": "NewSecurePass123!"
  },
  "response_200": {
    "success": true,
    "message": "Password reset successfully"
  }
}
```

---

### Organization Endpoints

#### POST /api/organizations
```json
{
  "endpoint": "/api/organizations",
  "method": "POST",
  "description": "Create new organization",
  "auth": "Required",
  "request_body": {
    "name": "ABC Corporation",
    "industry_sector": "Manufacturing",
    "occupancy_type": "industrial",
    "reporting_boundaries": {
      "description": "Main facility and warehouse"
    },
    "applicable_scopes": {
      "scope1": true,
      "scope2": true,
      "scope3": true
    }
  },
  "response_201": {
    "success": true,
    "organization": {
      "id": "uuid",
      "name": "ABC Corporation",
      "occupancy_type": "industrial"
    }
  }
}
```

#### GET /api/organizations/:id
```json
{
  "endpoint": "/api/organizations/:id",
  "method": "GET",
  "description": "Get organization details",
  "auth": "Required",
  "response_200": {
    "id": "uuid",
    "name": "ABC Corporation",
    "industry_sector": "Manufacturing",
    "occupancy_type": "industrial",
    "applicable_scopes": {
      "scope1": true,
      "scope2": true,
      "scope3": true
    },
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

#### PATCH /api/organizations/:id
```json
{
  "endpoint": "/api/organizations/:id",
  "method": "PATCH",
  "description": "Update organization details",
  "auth": "Required",
  "request_body": {
    "name": "ABC Corporation Ltd.",
    "applicable_scopes": {
      "scope1": true,
      "scope2": true,
      "scope3": false
    }
  },
  "response_200": {
    "success": true,
    "organization": {
      "id": "uuid",
      "name": "ABC Corporation Ltd."
    }
  }
}
```

---

### Facility Endpoints

#### POST /api/facilities
```json
{
  "endpoint": "/api/facilities",
  "method": "POST",
  "description": "Add new facility",
  "auth": "Required",
  "request_body": {
    "organization_id": "uuid",
    "name": "Main Office",
    "location": "Makati City",
    "address": "123 Ayala Avenue, Makati",
    "area_sqm": 5000.00,
    "employee_count": 150
  },
  "response_201": {
    "success": true,
    "facility": {
      "id": "uuid",
      "name": "Main Office"
    }
  }
}
```

#### GET /api/facilities?organization_id=:id
```json
{
  "endpoint": "/api/facilities",
  "method": "GET",
  "description": "Get all facilities for organization",
  "auth": "Required",
  "response_200": {
    "facilities": [
      {
        "id": "uuid",
        "name": "Main Office",
        "location": "Makati City",
        "employee_count": 150
      },
      {
        "id": "uuid2",
        "name": "Warehouse",
        "location": "Laguna",
        "employee_count": 50
      }
    ]
  }
}
```

---

### Emission Record Endpoints

#### POST /api/emission-records
```json
{
  "endpoint": "/api/emission-records",
  "method": "POST",
  "description": "Create new emission record",
  "auth": "Required",
  "request_body": {
    "organization_id": "uuid",
    "facility_id": "uuid",
    "reporting_period_start": "2025-01-01",
    "reporting_period_end": "2025-01-31",
    "scope_selection": {
      "scope1": true,
      "scope2": true,
      "scope3": false
    }
  },
  "response_201": {
    "success": true,
    "emission_record": {
      "id": "uuid",
      "status": "draft"
    }
  }
}
```

#### GET /api/emission-records/:id
```json
{
  "endpoint": "/api/emission-records/:id",
  "method": "GET",
  "description": "Get emission record details with all scope data",
  "auth": "Required",
  "response_200": {
    "id": "uuid",
    "reporting_period_start": "2025-01-01",
    "reporting_period_end": "2025-01-31",
    "status": "submitted",
    "scope1_fuel": [...],
    "scope1_vehicles": [...],
    "scope1_refrigerants": [...],
    "scope2_electricity": [...],
    "scope3_commuting": [...],
    "calculations": {
      "total_co2e": 125.45,
      "total_scope1_co2e": 45.20,
      "total_scope2_co2e": 80.25,
      "total_scope3_co2e": 0
    }
  }
}
```

#### GET /api/emission-records?organization_id=:id
```json
{
  "endpoint": "/api/emission-records",
  "method": "GET",
  "description": "Get all emission records for organization",
  "auth": "Required",
  "response_200": {
    "records": [
      {
        "id": "uuid",
        "reporting_period": "Jan 2025",
        "total_co2e": 125.45,
        "status": "submitted"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 10,
      "total": 12
    }
  }
}
```

---

### Scope 1 Endpoints

#### POST /api/scope1/fuel
```json
{
  "endpoint": "/api/scope1/fuel",
  "method": "POST",
  "description": "Add Scope 1 fuel consumption data",
  "auth": "Required",
  "request_body": {
    "emission_record_id": "uuid",
    "fuel_type": "natural_gas",
    "quantity": 1500.00,
    "unit": "cubic_meters",
    "entry_date": "2025-01-15",
    "metadata": {
      "supplier": "Manila Gas",
      "invoice_number": "INV-12345"
    }
  },
  "response_201": {
    "success": true,
    "fuel_entry": {
      "id": "uuid",
      "co2e_calculated": 3.15
    }
  }
}
```

#### POST /api/scope1/vehicles
```json
{
  "endpoint": "/api/scope1/vehicles",
  "method": "POST",
  "description": "Add Scope 1 vehicle fleet data",
  "auth": "Required",
  "request_body": {
    "emission_record_id": "uuid",
    "vehicle_id": "ABC-123",
    "vehicle_type": "sedan",
    "fuel_type": "gasoline",
    "fuel_consumed": 45.50,
    "mileage": 500.00,
    "unit": "liters",
    "entry_date": "2025-01-15"
  },
  "response_201": {
    "success": true,
    "vehicle_entry": {
      "id": "uuid",
      "co2e_calculated": 0.106
    }
  }
}
```

#### POST /api/scope1/refrigerants
```json
{
  "endpoint": "/api/scope1/refrigerants",
  "method": "POST",
  "description": "Add Scope 1 refrigerant data",
  "auth": "Required",
  "request_body": {
    "emission_record_id": "uuid",
    "equipment_id": "HVAC-001",
    "refrigerant_type": "R-410A",
    "quantity_leaked": 2.50,
    "quantity_purchased": 5.00,
    "unit": "kg",
    "entry_date": "2025-01-15",
    "leak_detection_log": {
      "last_inspection": "2025-01-10",
      "inspector": "John Doe"
    }
  },
  "response_201": {
    "success": true,
    "refrigerant_entry": {
      "id": "uuid",
      "co2e_calculated": 5.22
    }
  }
}
```

---

### Scope 2 Endpoints

#### POST /api/scope2/electricity
```json
{
  "endpoint": "/api/scope2/electricity",
  "method": "POST",
  "description": "Add Scope 2 electricity consumption data",
  "auth": "Required",
  "request_body": {
    "emission_record_id": "uuid",
    "facility_id": "uuid",
    "meter_number": "123456789",
    "kwh_consumption": 15000.00,
    "peak_hours_kwh": 9000.00,
    "offpeak_hours_kwh": 6000.00,
    "billing_period_start": "2025-01-01",
    "billing_period_end": "2025-01-31",
    "utility_bill_data": {
      "provider": "Meralco",
      "account_number": "9876543210"
    }
  },
  "response_201": {
    "success": true,
    "electricity_entry": {
      "id": "uuid",
      "co2e_calculated": 9.45
    }
  }
}
```

---

### Scope 3 Endpoints

#### POST /api/scope3/commuting
```json
{
  "endpoint": "/api/scope3/commuting",
  "method": "POST",
  "description": "Add Scope 3 employee commuting data",
  "auth": "Required",
  "request_body": {
    "emission_record_id": "uuid",
    "employee_count": 150,
    "avg_distance_km": 12.50,
    "transport_mode": "car",
    "days_per_week": 5,
    "wfh_days": 1,
    "survey_date": "2025-01-15"
  },
  "response_201": {
    "success": true,
    "commuting_entry": {
      "id": "uuid",
      "co2e_calculated": 18.75
    }
  }
}
```

#### POST /api/scope3/surveys
```json
{
  "endpoint": "/api/scope3/surveys",
  "method": "POST",
  "description": "Submit employee commute survey",
  "auth": "Required",
  "request_body": {
    "organization_id": "uuid",
    "employee_identifier": "EMP-001",
    "distance_km": 15.00,
    "transport_mode": "bus",
    "office_days_per_week": 5,
    "wfh_days_per_week": 0,
    "survey_date": "2025-01-15",
    "quarter": "Q1-2025"
  },
  "response_201": {
    "success": true,
    "survey_id": "uuid"
  }
}
```

#### GET /api/scope3/surveys/aggregate?organization_id=:id&quarter=:quarter
```json
{
  "endpoint": "/api/scope3/surveys/aggregate",
  "method": "GET",
  "description": "Get aggregated survey data for quarter",
  "auth": "Required",
  "response_200": {
    "quarter": "Q1-2025",
    "total_responses": 145,
    "avg_distance_km": 13.25,
    "transport_distribution": {
      "car": 45,
      "bus": 60,
      "jeepney": 25,
      "train": 10,
      "motorcycle": 5
    },
    "avg_office_days": 4.5,
    "avg_wfh_days": 0.5
  }
}
```

---

### Calculation Endpoints

#### POST /api/calculations/calculate
```json
{
  "endpoint": "/api/calculations/calculate",
  "method": "POST",
  "description": "Trigger calculation for emission record",
  "auth": "Required",
  "request_body": {
    "emission_record_id": "uuid"
  },
  "response_200": {
    "success": true,
    "calculation": {
      "id": "uuid",
      "total_co2e": 125.45,
      "total_scope1_co2e": 45.20,
      "total_scope2_co2e": 80.25,
      "total_scope3_co2e": 0,
      "breakdown_by_category": {
        "fuel": 35.15,
        "vehicles": 10.05,
        "refrigerants": 0,
        "electricity": 80.25
      },
      "emissions_per_employee": 0.836,
      "calculated_at": "2025-01-20T14:30:00Z"
    }
  }
}
```

#### GET /api/calculations/:emission_record_id
```json
{
  "endpoint": "/api/calculations/:emission_record_id",
  "method": "GET",
  "description": "Get calculation results for emission record",
  "auth": "Required",
  "response_200": {
    "id": "uuid",
    "emission_record_id": "uuid",
    "total_co2e": 125.45,
    "breakdown_by_category": {...},
    "emission_factors_used": {
      "natural_gas": 0.0021,
      "electricity_ph_grid": 0.00063
    }
  }
}
```

---

### Dashboard Endpoints

#### GET /api/dashboard
```json
{
  "endpoint": "/api/dashboard",
  "method": "GET",
  "description": "Get dashboard analytics data",
  "auth": "Required",
  "query_params": {
    "organization_id": "uuid",
    "period": "year"
  },
  "response_200": {
    "summary": {
      "total_co2e_ytd": 1505.40,
      "total_scope1": 542.40,
      "total_scope2": 963.00,
      "total_scope3": 0,
      "emissions_per_employee": 10.04
    },
    "trends": {
      "monthly": [
        {
          "month": "Jan 2025",
          "total_co2e": 125.45,
          "scope1": 45.20,
          "scope2": 80.25
        }
      ]
    },
    "breakdown": {
      "fuel": 35.2,
      "vehicles": 10.0,
      "electricity": 80.25
    },
    "top_sources": [
      {
        "category": "electricity",
        "percentage": 64.0
      },
      {
        "category": "fuel",
        "percentage": 28.0
      }
    ]
  }
}
```

---

### Report Endpoints

#### POST /api/reports/pdf
```json
{
  "endpoint": "/api/reports/pdf",
  "method": "POST",
  "description": "Generate PDF report",
  "auth": "Required",
  "request_body": {
    "organization_id": "uuid",
    "date_range": {
      "start": "2025-01-01",
      "end": "2025-03-31"
    },
    "include_charts": true,
    "include_breakdown": true
  },
  "response_200": {
    "success": true,
    "report_url": "https://storage.revearth.com/reports/uuid.pdf",
    "expires_at": "2025-01-22T14:30:00Z"
  },
  "response_403": {
    "error": "Monthly report quota exceeded. Upgrade plan for unlimited reports."
  }
}
```

#### POST /api/reports/csv
```json
{
  "endpoint": "/api/reports/csv",
  "method": "POST",
  "description": "Generate CSV export",
  "auth": "Required",
  "request_body": {
    "organization_id": "uuid",
    "date_range": {
      "start": "2025-01-01",
      "end": "2025-03-31"
    }
  },
  "response_200": {
    "success": true,
    "csv_url": "https://storage.revearth.com/exports/uuid.csv",
    "expires_at": "2025-01-22T14:30:00Z"
  }
}
```

---

### Subscription Endpoints

#### GET /api/subscriptions/:organization_id
```json
{
  "endpoint": "/api/subscriptions/:organization_id",
  "method": "GET",
  "description": "Get subscription details",
  "auth": "Required",
  "response_200": {
    "id": "uuid",
    "tier": "standard",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "is_active": true,
    "features_enabled": {
      "scope3": true,
      "csv_export": true,
      "unlimited_reports": false
    },
    "reports_generated_this_month": 5,
    "max_reports_per_month": 10
  }
}
```

---

## Business Logic

### Emission Factor Database

```json
{
  "scope1": {
    "fuels": {
      "natural_gas": {
        "factor": 0.0021,
        "unit": "tCO2e per cubic meter",
        "source": "EPA"
      },
      "heating_oil": {
        "factor": 0.00274,
        "unit": "tCO2e per liter",
        "source": "EPA"
      },
      "propane": {
        "factor": 0.00163,
        "unit": "tCO2e per kg",
        "source": "EPA"
      },
      "diesel": {
        "factor": 0.00269,
        "unit": "tCO2e per liter",
        "source": "EPA"
      },
      "gasoline": {
        "factor": 0.00233,
        "unit": "tCO2e per liter",
        "source": "EPA"
      }
    },
    "refrigerants": {
      "R-410A": {
        "gwp": 2088,
        "factor": 0.002088,
        "unit": "tCO2e per kg"
      },
      "R-134a": {
        "gwp": 1430,
        "factor": 0.00143,
        "unit": "tCO2e per kg"
      },
      "R-32": {
        "gwp": 675,
        "factor": 0.000675,
        "unit": "tCO2e per kg"
      },
      "R-404A": {
        "gwp": 3922,
        "factor": 0.003922,
        "unit": "tCO2e per kg"
      }
    }
  },
  "scope2": {
    "electricity": {
      "ph_grid_average": {
        "factor": 0.00063,
        "unit": "tCO2e per kWh",
        "source": "Philippine Department of Energy 2024"
      },
      "luzon_grid": {
        "factor": 0.00065,
        "unit": "tCO2e per kWh"
      },
      "visayas_grid": {
        "factor": 0.00061,
        "unit": "tCO2e per kWh"
      },
      "mindanao_grid": {
        "factor": 0.00058,
        "unit": "tCO2e per kWh"
      }
    }
  },
  "scope3": {
    "commuting": {
      "car": {
        "factor": 0.00017,
        "unit": "tCO2e per km",
        "source": "EPA"
      },
      "motorcycle": {
        "factor": 0.00010,
        "unit": "tCO2e per km"
      },
      "bus": {
        "factor": 0.00008,
        "unit": "tCO2e per km"
      },
      "jeepney": {
        "factor": 0.00009,
        "unit": "tCO2e per km"
      },
      "train": {
        "factor": 0.00004,
        "unit": "tCO2e per km"
      },
      "bicycle": {
        "factor": 0,
        "unit": "tCO2e per km"
      },
      "walking": {
        "factor": 0,
        "unit": "tCO2e per km"
      }
    }
  }
}
```

---

### Calculation Algorithms

#### Scope 1 Fuel Calculation
```
CO2e = Quantity × Emission Factor

Example:
Natural Gas: 1500 cubic meters
CO2e = 1500 × 0.0021 = 3.15 tCO2e
```

#### Scope 1 Vehicle Calculation
```
CO2e = Fuel Consumed × Emission Factor

Example:
Gasoline: 45.5 liters
CO2e = 45.5 × 0.00233 = 0.106 tCO2e
```

#### Scope 1 Refrigerant Calculation
```
CO2e = Quantity Leaked × GWP × 0.001

Example:
R-410A: 2.5 kg leaked
CO2e = 2.5 × 2088 × 0.001 = 5.22 tCO2e
```

#### Scope 2 Electricity Calculation
```
CO2e = kWh Consumption × Grid Emission Factor

Example:
Electricity: 15,000 kWh
CO2e = 15000 × 0.00063 = 9.45 tCO2e
```

#### Scope 3 Commuting Calculation
```
Annual CO2e = Employee Count × Avg Distance × Transport Factor × Work Days

Work Days = (Days per Week × 52 weeks) - (WFH Days × 52)
Round Trip Factor = 2

Example:
150 employees, 12.5 km avg distance, car, 5 days/week, 1 WFH day/week
Work Days = (5 × 52) - (1 × 52) = 208 days
CO2e = 150 × 12.5 × 2 × 0.00017 × 208 = 132.6 tCO2e annually
Monthly = 132.6 / 12 = 11.05 tCO2e
```

---

### Unit Conversion Logic

```javascript
const unitConversions = {
  volume: {
    gallons_to_liters: 3.78541,
    cubic_feet_to_cubic_meters: 0.0283168,
    barrels_to_liters: 158.987
  },
  distance: {
    miles_to_km: 1.60934,
    feet_to_meters: 0.3048
  },
  energy: {
    kwh_to_mwh: 0.001,
    kwh_to_joules: 3600000
  },
  mass: {
    pounds_to_kg: 0.453592,
    tons_to_tonnes: 0.907185
  }
};

function convertUnit(value, fromUnit, toUnit) {
  // Implementation of conversion logic
  const conversionKey = `${fromUnit}_to_${toUnit}`;
  if (unitConversions[category] && unitConversions[category][conversionKey]) {
    return value * unitConversions[category][conversionKey];
  }
  return value; // No conversion needed
}
```

---

### Data Validation Rules

```javascript
const validationRules = {
  scope1_fuel: {
    natural_gas: {
      min: 0,
      max: 1000000, // cubic meters per month
      typical_range: [100, 50000]
    },
    heating_oil: {
      min: 0,
      max: 100000, // liters per month
      typical_range: [50, 10000]
    }
  },
  scope2_electricity: {
    kwh_consumption: {
      min: 0,
      max: 10000000, // kWh per month
      typical_range: {
        commercial: [5000, 500000],
        industrial: [50000, 5000000],
        residential: [1000, 100000]
      }
    }
  },
  scope3_commuting: {
    distance_km: {
      min: 0,
      max: 200, // km one way
      typical_range: [5, 50]
    },
    days_per_week: {
      min: 0,
      max: 7
    }
  }
};

function validateInput(scope, type, value, occupancyType) {
  const rule = validationRules[scope][type];

  // Check absolute bounds
  if (value < rule.min || value > rule.max) {
    return {
      valid: false,
      error: `Value must be between ${rule.min} and ${rule.max}`
    };
  }

  // Check typical range (warning, not error)
  const typicalRange = rule.typical_range[occupancyType] || rule.typical_range;
  if (Array.isArray(typicalRange)) {
    if (value < typicalRange[0] || value > typicalRange[1]) {
      return {
        valid: true,
        warning: `Value is outside typical range (${typicalRange[0]}-${typicalRange[1]}). Please verify.`
      };
    }
  }

  return { valid: true };
}
```

---

## Data Models

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                  String         @id @default(uuid())
  email               String         @unique
  passwordHash        String         @map("password_hash")
  fullName            String         @map("full_name")
  createdAt           DateTime       @default(now()) @map("created_at")
  lastLogin           DateTime?      @map("last_login")
  isVerified          Boolean        @default(false) @map("is_verified")
  verificationToken   String?        @map("verification_token")
  resetToken          String?        @map("reset_token")
  resetTokenExpires   DateTime?      @map("reset_token_expires")

  organization        Organization?

  @@map("users")
}

model Organization {
  id                   String                      @id @default(uuid())
  userId               String                      @unique @map("user_id")
  name                 String
  industrySector       String?                     @map("industry_sector")
  occupancyType        OccupancyType               @map("occupancy_type")
  reportingBoundaries  Json?                       @map("reporting_boundaries")
  applicableScopes     Json                        @default("{\"scope1\": true, \"scope2\": true, \"scope3\": false}") @map("applicable_scopes")
  createdAt            DateTime                    @default(now()) @map("created_at")
  updatedAt            DateTime                    @updatedAt @map("updated_at")

  user                 User                        @relation(fields: [userId], references: [id], onDelete: Cascade)
  facilities           Facility[]
  subscription         Subscription?
  emissionRecords      EmissionRecord[]
  commuteSurveys       EmployeeCommuteSurvey[]

  @@map("organizations")
}

enum OccupancyType {
  residential
  commercial
  industrial
  lgu
  academic
}

model Subscription {
  id                        String    @id @default(uuid())
  organizationId            String    @unique @map("organization_id")
  tier                      Tier
  startDate                 DateTime  @map("start_date")
  endDate                   DateTime  @map("end_date")
  isActive                  Boolean   @default(true) @map("is_active")
  featuresEnabled           Json      @map("features_enabled")
  reportsGeneratedThisMonth Int       @default(0) @map("reports_generated_this_month")
  createdAt                 DateTime  @default(now()) @map("created_at")

  organization              Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@map("subscriptions")
}

enum Tier {
  basic
  standard
  premium
}

model Facility {
  id              String           @id @default(uuid())
  organizationId  String           @map("organization_id")
  name            String
  location        String?
  address         String?
  areaSqm         Decimal?         @map("area_sqm") @db.Decimal(10, 2)
  employeeCount   Int?             @map("employee_count")
  createdAt       DateTime         @default(now()) @map("created_at")

  organization    Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  electricity     Scope2Electricity[]

  @@map("facilities")
}

model EmissionRecord {
  id                    String                  @id @default(uuid())
  organizationId        String                  @map("organization_id")
  facilityId            String?                 @map("facility_id")
  reportingPeriodStart  DateTime                @map("reporting_period_start") @db.Date
  reportingPeriodEnd    DateTime                @map("reporting_period_end") @db.Date
  status                RecordStatus            @default(draft)
  scopeSelection        Json                    @default("{\"scope1\": true, \"scope2\": true, \"scope3\": false}") @map("scope_selection")
  createdAt             DateTime                @default(now()) @map("created_at")
  updatedAt             DateTime                @updatedAt @map("updated_at")

  organization          Organization            @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  scope1Fuel            Scope1Fuel[]
  scope1Vehicles        Scope1Vehicle[]
  scope1Refrigerants    Scope1Refrigerant[]
  scope2Electricity     Scope2Electricity[]
  scope3Commuting       Scope3Commuting[]
  calculation           EmissionCalculation?

  @@map("emission_records")
}

enum RecordStatus {
  draft
  submitted
  validated
  archived
}

model Scope1Fuel {
  id                String         @id @default(uuid())
  emissionRecordId  String         @map("emission_record_id")
  fuelType          FuelType       @map("fuel_type")
  quantity          Decimal        @db.Decimal(12, 2)
  unit              String
  co2eCalculated    Decimal?       @map("co2e_calculated") @db.Decimal(12, 4)
  entryDate         DateTime       @map("entry_date") @db.Date
  metadata          Json?

  emissionRecord    EmissionRecord @relation(fields: [emissionRecordId], references: [id], onDelete: Cascade)

  @@map("scope1_fuel")
}

enum FuelType {
  natural_gas
  heating_oil
  propane
  diesel
  gasoline
}

model Scope1Vehicle {
  id                String         @id @default(uuid())
  emissionRecordId  String         @map("emission_record_id")
  vehicleId         String?        @map("vehicle_id")
  vehicleType       VehicleType    @map("vehicle_type")
  fuelType          FuelType       @map("fuel_type")
  fuelConsumed      Decimal?       @map("fuel_consumed") @db.Decimal(10, 2)
  mileage           Decimal?       @db.Decimal(10, 2)
  unit              String
  co2eCalculated    Decimal?       @map("co2e_calculated") @db.Decimal(12, 4)
  entryDate         DateTime       @map("entry_date") @db.Date

  emissionRecord    EmissionRecord @relation(fields: [emissionRecordId], references: [id], onDelete: Cascade)

  @@map("scope1_vehicles")
}

enum VehicleType {
  sedan
  suv
  truck
  van
  motorcycle
}

model Scope1Refrigerant {
  id                  String         @id @default(uuid())
  emissionRecordId    String         @map("emission_record_id")
  equipmentId         String?        @map("equipment_id")
  refrigerantType     RefrigerantType @map("refrigerant_type")
  quantityLeaked      Decimal?       @map("quantity_leaked") @db.Decimal(10, 4)
  quantityPurchased   Decimal?       @map("quantity_purchased") @db.Decimal(10, 4)
  unit                String
  co2eCalculated      Decimal?       @map("co2e_calculated") @db.Decimal(12, 4)
  entryDate           DateTime       @map("entry_date") @db.Date
  leakDetectionLog    Json?          @map("leak_detection_log")

  emissionRecord      EmissionRecord @relation(fields: [emissionRecordId], references: [id], onDelete: Cascade)

  @@map("scope1_refrigerants")
}

enum RefrigerantType {
  R_410A
  R_134a
  R_32
  R_404A
}

model Scope2Electricity {
  id                  String         @id @default(uuid())
  emissionRecordId    String         @map("emission_record_id")
  facilityId          String?        @map("facility_id")
  meterNumber         String?        @map("meter_number")
  kwhConsumption      Decimal        @map("kwh_consumption") @db.Decimal(12, 2)
  peakHoursKwh        Decimal?       @map("peak_hours_kwh") @db.Decimal(12, 2)
  offpeakHoursKwh     Decimal?       @map("offpeak_hours_kwh") @db.Decimal(12, 2)
  co2eCalculated      Decimal?       @map("co2e_calculated") @db.Decimal(12, 4)
  billingPeriodStart  DateTime       @map("billing_period_start") @db.Date
  billingPeriodEnd    DateTime       @map("billing_period_end") @db.Date
  utilityBillData     Json?          @map("utility_bill_data")

  emissionRecord      EmissionRecord @relation(fields: [emissionRecordId], references: [id], onDelete: Cascade)
  facility            Facility?      @relation(fields: [facilityId], references: [id])

  @@map("scope2_electricity")
}

model Scope3Commuting {
  id                String         @id @default(uuid())
  emissionRecordId  String         @map("emission_record_id")
  employeeCount     Int            @map("employee_count")
  avgDistanceKm     Decimal?       @map("avg_distance_km") @db.Decimal(8, 2)
  transportMode     TransportMode  @map("transport_mode")
  daysPerWeek       Int?           @map("days_per_week")
  wfhDays           Int?           @map("wfh_days")
  co2eCalculated    Decimal?       @map("co2e_calculated") @db.Decimal(12, 4)
  surveyDate        DateTime?      @map("survey_date") @db.Date

  emissionRecord    EmissionRecord @relation(fields: [emissionRecordId], references: [id], onDelete: Cascade)

  @@map("scope3_commuting")
}

enum TransportMode {
  car
  motorcycle
  bus
  jeepney
  train
  bicycle
  walking
}

model EmployeeCommuteSurvey {
  id                  String         @id @default(uuid())
  organizationId      String         @map("organization_id")
  employeeIdentifier  String?        @map("employee_identifier")
  distanceKm          Decimal        @map("distance_km") @db.Decimal(8, 2)
  transportMode       TransportMode  @map("transport_mode")
  officeDaysPerWeek   Int            @map("office_days_per_week")
  wfhDaysPerWeek      Int            @map("wfh_days_per_week")
  surveyDate          DateTime       @map("survey_date") @db.Date
  quarter             String?

  organization        Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@map("employee_commute_surveys")
}

model EmissionCalculation {
  id                    String         @id @default(uuid())
  emissionRecordId      String         @unique @map("emission_record_id")
  totalScope1Co2e       Decimal?       @map("total_scope1_co2e") @db.Decimal(15, 4)
  totalScope2Co2e       Decimal?       @map("total_scope2_co2e") @db.Decimal(15, 4)
  totalScope3Co2e       Decimal?       @map("total_scope3_co2e") @db.Decimal(15, 4)
  totalCo2e             Decimal?       @map("total_co2e") @db.Decimal(15, 4)
  breakdownByCategory   Json?          @map("breakdown_by_category")
  emissionFactorsUsed   Json?          @map("emission_factors_used")
  emissionsPerEmployee  Decimal?       @map("emissions_per_employee") @db.Decimal(12, 4)
  calculatedAt          DateTime       @default(now()) @map("calculated_at")

  emissionRecord        EmissionRecord @relation(fields: [emissionRecordId], references: [id], onDelete: Cascade)

  @@map("emission_calculations")
}
```

---

## Security & Authentication

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant NextAuth
    participant Database
    participant Email

    User->>Client: Enter credentials
    Client->>API: POST /api/auth/login
    API->>Database: Query user by email
    Database-->>API: Return user data
    API->>API: Verify password hash
    API->>NextAuth: Create JWT token
    NextAuth-->>API: Return token
    API-->>Client: Return token + user data
    Client->>Client: Store token in httpOnly cookie
    Client-->>User: Redirect to dashboard

    Note over User,Database: Subsequent requests

    User->>Client: Access protected resource
    Client->>API: GET /api/resource (with JWT)
    API->>NextAuth: Verify JWT
    NextAuth-->>API: Token valid
    API->>Database: Query resource
    Database-->>API: Return data
    API-->>Client: Return resource
    Client-->>User: Display data
```

### Security Measures

#### Password Security
```javascript
import bcrypt from 'bcryptjs';

// Hash password on registration
const saltRounds = 12;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Verify password on login
const isValid = await bcrypt.compare(password, user.passwordHash);
```

#### JWT Configuration
```javascript
// NextAuth configuration
export const authOptions = {
  providers: [
    CredentialsProvider({
      // Credentials provider configuration
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    }
  }
};
```

#### Data Encryption
- All passwords hashed with bcrypt (12 rounds)
- JWT tokens signed with HS256
- Database connections over SSL/TLS
- Sensitive data encrypted at rest

#### API Security
- All API routes protected with NextAuth middleware
- Rate limiting on authentication endpoints
- CORS configuration for allowed origins
- Input validation and sanitization
- SQL injection prevention via Prisma ORM

#### Environment Variables
```env
# Required environment variables
DATABASE_URL="postgresql://user:password@localhost:5432/revearth"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
EMAIL_SERVER="smtp://user:password@smtp.example.com:587"
EMAIL_FROM="noreply@revearth.com"
```

---

## Implementation Notes

### Technology Stack Recommendations

**Backend:**
- Next.js 14+ (App Router)
- Prisma ORM
- PostgreSQL 14+
- NextAuth.js

**Authentication:**
- NextAuth.js with Credentials provider
- JWT tokens
- bcryptjs for password hashing

**Email:**
- Nodemailer or SendGrid

**PDF Generation:**
- @react-pdf/renderer or Puppeteer

**CSV Export:**
- Papa Parse or Fast-CSV

### Database Setup

```bash
# Install Prisma
npm install prisma @prisma/client

# Initialize Prisma
npx prisma init

# Create migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### API Route Structure

```
app/
  api/
    auth/
      register/
        route.ts
      login/
        route.ts
      verify-email/
        route.ts
      forgot-password/
        route.ts
      reset-password/
        route.ts
    organizations/
      route.ts
      [id]/
        route.ts
    facilities/
      route.ts
    emission-records/
      route.ts
      [id]/
        route.ts
    scope1/
      fuel/
        route.ts
      vehicles/
        route.ts
      refrigerants/
        route.ts
    scope2/
      electricity/
        route.ts
    scope3/
      commuting/
        route.ts
      surveys/
        route.ts
        aggregate/
          route.ts
    calculations/
      calculate/
        route.ts
      [emission_record_id]/
        route.ts
    dashboard/
      route.ts
    reports/
      pdf/
        route.ts
      csv/
        route.ts
    subscriptions/
      [organization_id]/
        route.ts
```

---

## Next Steps for Frontend Development

With the backend documented, you can now build the frontend with the following guidance:

1. **Authentication Pages:**
   - `/register` - User registration
   - `/login` - User login
   - `/verify-email` - Email verification
   - `/forgot-password` - Password reset request
   - `/reset-password` - Password reset form

2. **Dashboard:**
   - Summary cards (Total CO2e, Scope breakdowns)
   - Charts (Pie chart, trend lines)
   - Quick actions

3. **Organization Setup:**
   - Organization profile form
   - Occupancy type selector
   - Scope configuration

4. **Data Entry Forms:**
   - Scope 1 forms (Fuel, Vehicles, Refrigerants)
   - Scope 2 form (Electricity)
   - Scope 3 form (Commuting)

5. **Reports:**
   - PDF report generator
   - CSV export functionality
   - Print-friendly views

6. **Settings:**
   - Organization settings
   - User profile
   - Subscription management

---

## Conclusion

This documentation provides a comprehensive backend specification for the RevEarth GHG Inventory Platform MVP. All diagrams use Mermaid.js for easy integration into markdown-based documentation systems.

The backend is designed to be:
- **Scalable**: Supports multiple organizations and facilities
- **Flexible**: Adaptive scope selection based on occupancy type
- **Accurate**: EPA and Philippine emission factors
- **Secure**: Authentication, authorization, and data encryption
- **API-first**: RESTful API for frontend integration

For questions or clarifications, refer to the specific sections above or consult the API endpoint documentation.
