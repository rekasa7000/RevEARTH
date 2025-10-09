# Emission Data Entry API Documentation

## Overview

APIs for entering and managing GHG emissions data across all scopes.

**Data Entry Flow:**
1. Create Emission Record (container for a reporting period)
2. Add emission data (fuel, vehicles, electricity, commuting)
3. Calculations run automatically
4. View dashboard and reports

---

## Emission Records

### Create Emission Record
**POST** `/api/emission-records`

**Headers:**
```
Cookie: revearth.session_token=...
```

**Request Body:**
```json
{
  "organizationId": "clxxx...",
  "facilityId": "clxxx...",
  "reportingPeriodStart": "2025-01-01",
  "reportingPeriodEnd": "2025-01-31",
  "scopeSelection": {
    "scope1": true,
    "scope2": true,
    "scope3": false
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "emissionRecord": {
    "id": "clxxx...",
    "organizationId": "clxxx...",
    "facilityId": "clxxx...",
    "reportingPeriodStart": "2025-01-01T00:00:00Z",
    "reportingPeriodEnd": "2025-01-31T00:00:00Z",
    "status": "draft",
    "scopeSelection": { ... },
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

---

### Get All Emission Records
**GET** `/api/emission-records?organizationId=xxx&page=1&limit=10&status=draft`

**Query Parameters:**
- `organizationId` (required)
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `status` (optional: draft | submitted | validated | archived)

**Response (200):**
```json
{
  "records": [
    {
      "id": "clxxx...",
      "reportingPeriodStart": "2025-01-01T00:00:00Z",
      "reportingPeriodEnd": "2025-01-31T00:00:00Z",
      "status": "draft",
      "calculation": {
        "totalCo2e": 125.45,
        "totalScope1Co2e": 45.20,
        "totalScope2Co2e": 80.25
      },
      "_count": {
        "fuelUsage": 5,
        "vehicleUsage": 10,
        "electricityUsage": 2,
        "commutingData": 1
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12,
    "totalPages": 2
  }
}
```

---

### Get Emission Record by ID
**GET** `/api/emission-records/:id`

**Response (200):**
```json
{
  "record": {
    "id": "clxxx...",
    "reportingPeriodStart": "2025-01-01T00:00:00Z",
    "reportingPeriodEnd": "2025-01-31T00:00:00Z",
    "status": "draft",
    "organization": { ... },
    "fuelUsage": [...],
    "vehicleUsage": [...],
    "electricityUsage": [...],
    "commutingData": [...],
    "calculation": { ... }
  }
}
```

---

### Update Emission Record
**PATCH** `/api/emission-records/:id`

**Request Body:** (all fields optional)
```json
{
  "reportingPeriodStart": "2025-01-01",
  "reportingPeriodEnd": "2025-01-31",
  "status": "submitted",
  "scopeSelection": {
    "scope1": true,
    "scope2": true,
    "scope3": true
  }
}
```

---

### Delete Emission Record
**DELETE** `/api/emission-records/:id`

⚠️ **Warning:** Cascade deletes all emission data and calculations.

---

## Fuel Usage (Scope 1)

### Add Fuel Consumption
**POST** `/api/fuel-usage`

**Request Body:**
```json
{
  "emissionRecordId": "clxxx...",
  "fuelType": "natural_gas",
  "quantity": 1500.00,
  "unit": "cubic_meters",
  "entryDate": "2025-01-15",
  "metadata": {
    "supplier": "Manila Gas",
    "invoiceNumber": "INV-12345"
  }
}
```

**Fuel Types:**
- `natural_gas`
- `heating_oil`
- `propane`
- `diesel`
- `gasoline`

**Response (201):**
```json
{
  "success": true,
  "fuelUsage": {
    "id": "clxxx...",
    "emissionRecordId": "clxxx...",
    "fuelType": "natural_gas",
    "quantity": 1500.00,
    "unit": "cubic_meters",
    "co2eCalculated": 3.15,
    "entryDate": "2025-01-15T00:00:00Z"
  }
}
```

---

### Get Fuel Usage
**GET** `/api/fuel-usage?emissionRecordId=xxx`

---

### Update Fuel Usage
**PATCH** `/api/fuel-usage/:id`

---

### Delete Fuel Usage
**DELETE** `/api/fuel-usage/:id`

---

## Vehicle Usage (Scope 1)

### Add Vehicle Fleet Data
**POST** `/api/vehicle-usage`

**Request Body:**
```json
{
  "emissionRecordId": "clxxx...",
  "vehicleId": "ABC-123",
  "vehicleType": "sedan",
  "fuelType": "gasoline",
  "fuelConsumed": 45.50,
  "mileage": 500.00,
  "unit": "liters",
  "entryDate": "2025-01-15"
}
```

**Vehicle Types:**
- `sedan`
- `suv`
- `truck`
- `van`
- `motorcycle`

**Response (201):**
```json
{
  "success": true,
  "vehicleUsage": {
    "id": "clxxx...",
    "vehicleId": "ABC-123",
    "vehicleType": "sedan",
    "fuelType": "gasoline",
    "fuelConsumed": 45.50,
    "mileage": 500.00,
    "co2eCalculated": 0.106,
    "entryDate": "2025-01-15T00:00:00Z"
  }
}
```

---

### Get Vehicle Usage
**GET** `/api/vehicle-usage?emissionRecordId=xxx`

---

## Electricity Usage (Scope 2)

### Add Electricity Consumption
**POST** `/api/electricity-usage`

**Request Body:**
```json
{
  "emissionRecordId": "clxxx...",
  "facilityId": "clxxx...",
  "meterNumber": "123456789",
  "kwhConsumption": 15000.00,
  "peakHoursKwh": 9000.00,
  "offpeakHoursKwh": 6000.00,
  "billingPeriodStart": "2025-01-01",
  "billingPeriodEnd": "2025-01-31",
  "utilityBillData": {
    "provider": "Meralco",
    "accountNumber": "9876543210"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "electricityUsage": {
    "id": "clxxx...",
    "facilityId": "clxxx...",
    "meterNumber": "123456789",
    "kwhConsumption": 15000.00,
    "co2eCalculated": 9.45,
    "billingPeriodStart": "2025-01-01T00:00:00Z",
    "billingPeriodEnd": "2025-01-31T00:00:00Z"
  }
}
```

---

### Get Electricity Usage
**GET** `/api/electricity-usage?emissionRecordId=xxx`

---

## Commuting Data (Scope 3)

### Add Employee Commuting Data
**POST** `/api/commuting-data`

**Request Body:**
```json
{
  "emissionRecordId": "clxxx...",
  "employeeCount": 150,
  "avgDistanceKm": 12.50,
  "transportMode": "car",
  "daysPerWeek": 5,
  "wfhDays": 1,
  "surveyDate": "2025-01-15"
}
```

**Transport Modes:**
- `car`
- `motorcycle`
- `bus`
- `jeepney`
- `train`
- `bicycle`
- `walking`

**Response (201):**
```json
{
  "success": true,
  "commutingData": {
    "id": "clxxx...",
    "employeeCount": 150,
    "avgDistanceKm": 12.50,
    "transportMode": "car",
    "daysPerWeek": 5,
    "wfhDays": 1,
    "co2eCalculated": 18.75,
    "surveyDate": "2025-01-15T00:00:00Z"
  }
}
```

---

### Get Commuting Data
**GET** `/api/commuting-data?emissionRecordId=xxx`

---

## Complete Data Entry Example

### Step 1: Create Emission Record
```bash
curl -X POST http://localhost:3000/api/emission-records \
  -H "Content-Type: application/json" \
  -H "Cookie: revearth.session_token=..." \
  -d '{
    "organizationId": "clxxx...",
    "reportingPeriodStart": "2025-01-01",
    "reportingPeriodEnd": "2025-01-31"
  }'
```

### Step 2: Add Fuel Data (Scope 1)
```bash
curl -X POST http://localhost:3000/api/fuel-usage \
  -H "Content-Type: application/json" \
  -H "Cookie: revearth.session_token=..." \
  -d '{
    "emissionRecordId": "clxxx...",
    "fuelType": "natural_gas",
    "quantity": 1500.00,
    "unit": "cubic_meters",
    "entryDate": "2025-01-15"
  }'
```

### Step 3: Add Vehicle Data (Scope 1)
```bash
curl -X POST http://localhost:3000/api/vehicle-usage \
  -H "Content-Type: application/json" \
  -H "Cookie: revearth.session_token=..." \
  -d '{
    "emissionRecordId": "clxxx...",
    "vehicleId": "ABC-123",
    "vehicleType": "sedan",
    "fuelType": "gasoline",
    "fuelConsumed": 45.50,
    "unit": "liters",
    "entryDate": "2025-01-15"
  }'
```

### Step 4: Add Electricity Data (Scope 2)
```bash
curl -X POST http://localhost:3000/api/electricity-usage \
  -H "Content-Type: application/json" \
  -H "Cookie: revearth.session_token=..." \
  -d '{
    "emissionRecordId": "clxxx...",
    "facilityId": "clxxx...",
    "kwhConsumption": 15000.00,
    "billingPeriodStart": "2025-01-01",
    "billingPeriodEnd": "2025-01-31"
  }'
```

### Step 5: Add Commuting Data (Scope 3)
```bash
curl -X POST http://localhost:3000/api/commuting-data \
  -H "Content-Type: application/json" \
  -H "Cookie: revearth.session_token=..." \
  -d '{
    "emissionRecordId": "clxxx...",
    "employeeCount": 150,
    "avgDistanceKm": 12.50,
    "transportMode": "car",
    "daysPerWeek": 5,
    "wfhDays": 1
  }'
```

### Step 6: View Complete Record
```bash
curl http://localhost:3000/api/emission-records/clxxx... \
  -H "Cookie: revearth.session_token=..."
```

---

## Data Validation Rules

### Fuel Usage
- `quantity`: Must be > 0
- `fuelType`: Must be valid enum value
- `unit`: Required string
- `entryDate`: Required valid date

### Vehicle Usage
- At least one of `fuelConsumed` or `mileage` required
- `vehicleType` & `fuelType`: Must be valid enum values
- Both values must be > 0 if provided

### Electricity Usage
- `kwhConsumption`: Must be > 0
- `billingPeriodEnd`: Must be after `billingPeriodStart`
- `facilityId`: Optional but must be valid if provided

### Commuting Data
- `employeeCount`: Must be > 0 integer
- `transportMode`: Must be valid enum value
- `daysPerWeek` & `wfhDays`: Optional but must be 0-7 if provided

---

## Emission Record Statuses

- **draft** - Actively being edited
- **submitted** - Locked for review
- **validated** - Approved and finalized
- **archived** - Historical data, read-only

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "error": "Error message here"
}
```

**Common Status Codes:**
- **200** - Success
- **201** - Created
- **400** - Bad request (validation error)
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not found
- **500** - Server error
