# API Testing Guide

## Overview

Complete guide for testing the RevEarth GHG Inventory API using Postman.

---

## Setup

### 1. Import Postman Collection

1. Open Postman
2. Click **Import** button
3. Select `RevEarth_API.postman_collection.json`
4. Collection will be imported with all endpoints

### 2. Configure Environment Variables

The collection uses these variables (automatically set during testing):
- `baseUrl` - API base URL (default: `http://localhost:3000`)
- `sessionToken` - Authentication session token
- `userId` - Current user ID
- `organizationId` - Organization ID
- `facilityId` - Facility ID
- `emissionRecordId` - Emission record ID

**To modify baseUrl:**
1. Click on the collection
2. Go to **Variables** tab
3. Update `baseUrl` value

---

## Testing Workflow

### Complete End-to-End Test

Follow this order to test the entire system:

#### **Step 1: Authentication**

1. **Register** - Create new user account
   - Run: `1. Authentication > Register`
   - ✅ Verify: Returns 200, user created
   - 📝 Note: Email must be unique

2. **Login** - Get authenticated session
   - Run: `1. Authentication > Login`
   - ✅ Verify: Returns 200, session cookie set
   - 📝 Note: Session cookie is stored automatically

3. **Get Current User** - Verify authentication
   - Run: `1. Authentication > Get Current User`
   - ✅ Verify: Returns user data with ID

---

#### **Step 2: Organization Setup**

4. **Create Organization**
   - Run: `2. Organizations > Create Organization`
   - ✅ Verify: Returns 201, organization created
   - 📝 Note: `organizationId` auto-saved to variables

5. **Get My Organization**
   - Run: `2. Organizations > Get My Organization`
   - ✅ Verify: Returns organization with facilities count

---

#### **Step 3: Add Facilities**

6. **Create Facility**
   - Run: `3. Facilities > Create Facility`
   - ✅ Verify: Returns 201, facility created
   - 📝 Note: `facilityId` auto-saved to variables

7. **Get All Facilities**
   - Run: `3. Facilities > Get All Facilities`
   - ✅ Verify: Returns array with created facility

---

#### **Step 4: Create Emission Record**

8. **Create Emission Record**
   - Run: `4. Emission Records > Create Emission Record`
   - ✅ Verify: Returns 201, record created
   - 📝 Note: `emissionRecordId` auto-saved to variables

---

#### **Step 5: Add Emission Data**

9. **Add Fuel Usage** (Scope 1)
   - Run: `5. Fuel Usage > Add Fuel Usage`
   - ✅ Verify: Returns 201, fuel entry created
   - 📝 Note: CO2e will be calculated later

10. **Add Vehicle Usage** (Scope 1)
    - Run: `6. Vehicle Usage > Add Vehicle Usage`
    - ✅ Verify: Returns 201, vehicle entry created

11. **Add Electricity Usage** (Scope 2)
    - Run: `7. Electricity Usage > Add Electricity Usage`
    - ✅ Verify: Returns 201, electricity entry created

12. **Add Commuting Data** (Scope 3)
    - Run: `8. Commuting Data > Add Commuting Data`
    - ✅ Verify: Returns 201, commuting entry created

---

#### **Step 6: Calculate Emissions**

13. **Calculate Emissions**
    - Run: `9. Calculations > Calculate Emissions`
    - ✅ Verify: Returns calculated totals
    - ✅ Check: `totalCo2e`, `totalScope1Co2e`, `totalScope2Co2e`
    - 📝 Note: All individual entries updated with CO2e values

14. **Get Calculation Results**
    - Run: `9. Calculations > Get Calculation Results`
    - ✅ Verify: Returns complete calculation breakdown

---

#### **Step 7: View Dashboard**

15. **Get Dashboard**
    - Run: `10. Dashboard & Analytics > Get Dashboard`
    - ✅ Verify: Returns summary, trends, breakdown, top sources

16. **Get Trends**
    - Run: `10. Dashboard & Analytics > Get Trends`
    - ✅ Verify: Returns monthly trend data

17. **Get Comparison (By Scope)**
    - Run: `10. Dashboard & Analytics > Get Comparison (By Scope)`
    - ✅ Verify: Returns scope breakdown with percentages

---

## Detailed Testing Scenarios

### Scenario 1: Complete Monthly Record

**Goal:** Create and calculate a complete month's emissions

**Steps:**
1. Login
2. Create emission record (Jan 2025)
3. Add fuel usage: Natural gas (1500 m³)
4. Add fuel usage: Diesel (200 liters)
5. Add vehicle: Sedan (45.5 L gasoline)
6. Add vehicle: Truck (120 L diesel)
7. Add electricity: 15,000 kWh
8. Add electricity: 8,000 kWh (different facility)
9. Add commuting: 150 employees, 12.5 km, car
10. Calculate emissions
11. Verify total CO2e ≈ 29.66 tCO2e

**Expected Results:**
```json
{
  "totalCo2e": 29.657,
  "totalScope1Co2e": 4.117,
  "totalScope2Co2e": 14.49,
  "totalScope3Co2e": 11.05
}
```

---

### Scenario 2: Multi-Month Analysis

**Goal:** Track emissions over 3 months

**Steps:**
1. Create Jan emission record
2. Add Jan data
3. Calculate Jan
4. Create Feb emission record
5. Add Feb data
6. Calculate Feb
7. Create Mar emission record
8. Add Mar data
9. Calculate Mar
10. View trends (3 months)

**Expected Results:**
- Monthly trend chart data
- Moving average calculation
- Month-over-month comparison

---

### Scenario 3: Facility Comparison

**Goal:** Compare emissions between facilities

**Steps:**
1. Create 2 facilities (Main Office, Warehouse)
2. Create emission record
3. Add electricity for Main Office
4. Add electricity for Warehouse
5. Calculate
6. Get comparison by facility

**Expected Results:**
```json
{
  "comparison": {
    "type": "facility",
    "data": [
      { "name": "Main Office", "value": 945.30, "percentage": 62.8 },
      { "name": "Warehouse", "value": 560.10, "percentage": 37.2 }
    ]
  }
}
```

---

## Validation Checklist

### Authentication
- [ ] Registration creates user
- [ ] Login returns session
- [ ] Logout clears session
- [ ] Protected routes require authentication
- [ ] Email verification works
- [ ] Password reset works

### Organizations
- [ ] Can create organization
- [ ] Can update organization
- [ ] Can get organization details
- [ ] Cannot create duplicate organization
- [ ] Occupancy type affects scope selection

### Facilities
- [ ] Can create multiple facilities
- [ ] Can update facility
- [ ] Can delete facility
- [ ] Employee count tracked

### Emission Records
- [ ] Can create records
- [ ] Status transitions work (draft → submitted → validated)
- [ ] Date ranges validated
- [ ] Can have multiple records per organization

### Emission Data
- [ ] **Fuel Usage:**
  - [ ] Natural gas calculated correctly
  - [ ] Diesel calculated correctly
  - [ ] All fuel types accepted
- [ ] **Vehicle Usage:**
  - [ ] Gasoline vehicles calculated
  - [ ] Diesel vehicles calculated
  - [ ] Mileage tracked
- [ ] **Electricity Usage:**
  - [ ] kWh consumption recorded
  - [ ] Peak/off-peak tracked
  - [ ] Multiple meters supported
- [ ] **Commuting Data:**
  - [ ] All transport modes work
  - [ ] WFH days reduce emissions
  - [ ] Employee count affects total

### Calculations
- [ ] Scope 1 total correct
- [ ] Scope 2 total correct
- [ ] Scope 3 total correct
- [ ] Breakdown by category accurate
- [ ] Emissions per employee calculated
- [ ] Emission factors recorded

### Dashboard
- [ ] Summary statistics correct
- [ ] Monthly trends display
- [ ] Top sources identified
- [ ] YoY comparison works
- [ ] Period filtering works

---

## Common Issues & Solutions

### Issue: "Unauthorized" Error

**Cause:** Not logged in or session expired

**Solution:**
1. Run `1. Authentication > Login`
2. Verify cookies are enabled in Postman
3. Check session cookie is present

---

### Issue: "Organization not found"

**Cause:** Organization ID not set or invalid

**Solution:**
1. Run `2. Organizations > Create Organization`
2. Check `{{organizationId}}` variable is set
3. Verify organization exists in database

---

### Issue: "Calculation not found"

**Cause:** Calculations haven't been run yet

**Solution:**
1. Add emission data first
2. Run `9. Calculations > Calculate Emissions`
3. Then get calculation results

---

### Issue: Calculated CO2e is 0

**Cause:** Missing required fields

**Solution:**
- Fuel: Ensure `quantity` is provided
- Vehicle: Ensure `fuelConsumed` is provided
- Electricity: Ensure `kwhConsumption` is provided
- Commuting: Ensure `avgDistanceKm` and `daysPerWeek` provided

---

## Test Data Examples

### Test Organization
```json
{
  "name": "Green Tech Solutions",
  "industrySector": "Technology",
  "occupancyType": "commercial"
}
```

### Test Facility
```json
{
  "name": "BGC Office",
  "location": "Bonifacio Global City",
  "employeeCount": 200,
  "areaSqm": 3000
}
```

### Test Fuel Usage
```json
{
  "fuelType": "natural_gas",
  "quantity": 1500,
  "unit": "cubic_meters",
  "entryDate": "2025-01-15"
}
```

### Test Electricity
```json
{
  "kwhConsumption": 15000,
  "billingPeriodStart": "2025-01-01",
  "billingPeriodEnd": "2025-01-31"
}
```

---

## Expected Calculation Results

### Sample Data Input

**Fuel:**
- Natural Gas: 1500 m³

**Vehicles:**
- Sedan: 45.5 L gasoline

**Electricity:**
- 15,000 kWh

**Commuting:**
- 150 employees, 12.5 km, car, 5 days/week, 1 WFH day

### Expected Output

```json
{
  "totalCo2e": 23.806,
  "totalScope1Co2e": 3.256,
  "totalScope2Co2e": 9.450,
  "totalScope3Co2e": 11.050,
  "breakdownByCategory": {
    "fuel": 3.150,
    "vehicles": 0.106,
    "refrigerants": 0,
    "electricity": 9.450,
    "commuting": 11.050
  },
  "emissionsPerEmployee": 0.159
}
```

---

## Performance Testing

### Load Test Scenarios

1. **Create 100 emission records**
   - Verify all created successfully
   - Check database performance

2. **Add 1000 emission entries**
   - Verify calculation speed
   - Check API response time

3. **Concurrent users**
   - Simulate 10 users
   - Verify no conflicts

---

## Automation

### Postman Test Scripts

Example test script (already included):

```javascript
// Auto-save IDs
if (pm.response.code === 201) {
  const response = pm.response.json();
  if (response.organization) {
    pm.collectionVariables.set('organizationId', response.organization.id);
  }
}

// Verify response
pm.test("Status code is 201", () => {
  pm.response.to.have.status(201);
});

pm.test("Response has success field", () => {
  pm.expect(pm.response.json()).to.have.property('success');
});
```

---

## CI/CD Integration

### Run Collection via CLI

```bash
# Install Newman
npm install -g newman

# Run collection
newman run RevEarth_API.postman_collection.json \
  --environment your-environment.json \
  --reporters cli,json

# Run with specific tests
newman run RevEarth_API.postman_collection.json \
  --folder "1. Authentication"
```

---

## Next Steps

After testing:
1. ✅ Verify all endpoints work
2. ✅ Test edge cases
3. ✅ Test error handling
4. ✅ Document any bugs found
5. ✅ Create production environment
6. ✅ Set up monitoring
