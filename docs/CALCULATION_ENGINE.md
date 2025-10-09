# Calculation Engine Documentation

## Overview

The RevEarth Calculation Engine automatically calculates CO2e (carbon dioxide equivalent) emissions for all scopes based on entered data and standardized emission factors.

---

## Emission Factors

### Sources
- **EPA**: United States Environmental Protection Agency
- **IPCC AR5**: Intergovernmental Panel on Climate Change, Fifth Assessment Report
- **Philippine DOE 2024**: Department of Energy emission factors for the Philippine electricity grid

### Scope 1 - Direct Emissions

#### Fuel Combustion
| Fuel Type | Factor | Unit | Source |
|-----------|--------|------|--------|
| Natural Gas | 0.0021 | tCO2e/m³ | EPA |
| Heating Oil | 0.00274 | tCO2e/liter | EPA |
| Propane (LPG) | 0.00163 | tCO2e/kg | EPA |
| Diesel | 0.00269 | tCO2e/liter | EPA |
| Gasoline | 0.00233 | tCO2e/liter | EPA |

#### Refrigerants
| Refrigerant | GWP | Factor | Unit | Source |
|-------------|-----|--------|------|--------|
| R-410A | 2088 | 0.002088 | tCO2e/kg | IPCC AR5 |
| R-134a | 1430 | 0.00143 | tCO2e/kg | IPCC AR5 |
| R-32 | 675 | 0.000675 | tCO2e/kg | IPCC AR5 |
| R-404A | 3922 | 0.003922 | tCO2e/kg | IPCC AR5 |

### Scope 2 - Electricity

#### Philippine Grid Factors
| Grid | Factor | Unit | Source |
|------|--------|------|--------|
| PH Average | 0.00063 | tCO2e/kWh | DOE 2024 |
| Luzon | 0.00065 | tCO2e/kWh | DOE 2024 |
| Visayas | 0.00061 | tCO2e/kWh | DOE 2024 |
| Mindanao | 0.00058 | tCO2e/kWh | DOE 2024 |

### Scope 3 - Commuting

#### Transport Modes
| Mode | Factor | Unit | Source |
|------|--------|------|--------|
| Car | 0.00017 | tCO2e/km | EPA |
| Motorcycle | 0.0001 | tCO2e/km | EPA |
| Bus | 0.00008 | tCO2e/passenger-km | EPA |
| Jeepney | 0.00009 | tCO2e/passenger-km | PH Transport Study |
| Train | 0.00004 | tCO2e/passenger-km | EPA |
| Bicycle | 0 | - | Zero emissions |
| Walking | 0 | - | Zero emissions |

---

## Calculation Formulas

### Scope 1 - Fuel Consumption
```
CO2e = Quantity × Emission Factor

Example:
Natural Gas: 1500 m³
CO2e = 1500 × 0.0021 = 3.15 tCO2e
```

### Scope 1 - Vehicle Fleet
```
CO2e = Fuel Consumed × Emission Factor

Example:
Gasoline: 45.5 liters
CO2e = 45.5 × 0.00233 = 0.106 tCO2e
```

### Scope 1 - Refrigerants
```
CO2e = Quantity Leaked × GWP × 0.001

Example:
R-410A: 2.5 kg leaked
CO2e = 2.5 × 2088 × 0.001 = 5.22 tCO2e
```

### Scope 2 - Electricity
```
CO2e = kWh Consumption × Grid Emission Factor

Example:
Electricity: 15,000 kWh
CO2e = 15000 × 0.00063 = 9.45 tCO2e
```

### Scope 3 - Employee Commuting
```
Annual CO2e = Employee Count × Avg Distance × Transport Factor × Work Days × Round Trip Factor

Work Days = (Days per Week × 52) - (WFH Days × 52)
Round Trip Factor = 2

Monthly CO2e = Annual CO2e / 12

Example:
150 employees, 12.5 km avg distance, car, 5 days/week, 1 WFH day/week
Work Days = (5 × 52) - (1 × 52) = 208 days
Annual CO2e = 150 × 12.5 × 2 × 0.00017 × 208 = 132.6 tCO2e
Monthly CO2e = 132.6 / 12 = 11.05 tCO2e
```

---

## API Endpoints

### Trigger Calculation
**POST** `/api/calculations`

**Request Body:**
```json
{
  "emissionRecordId": "clxxx..."
}
```

**Response (200):**
```json
{
  "success": true,
  "calculation": {
    "id": "clxxx...",
    "emissionRecordId": "clxxx...",
    "totalCo2e": 125.45,
    "totalScope1Co2e": 45.20,
    "totalScope2Co2e": 80.25,
    "totalScope3Co2e": 0,
    "breakdownByCategory": {
      "fuel": 35.15,
      "vehicles": 10.05,
      "refrigerants": 0,
      "electricity": 80.25,
      "commuting": 0
    },
    "emissionFactorsUsed": {
      "natural_gas": 0.0021,
      "gasoline": 0.00233,
      "electricity_ph_grid": 0.00063
    },
    "emissionsPerEmployee": 0.836,
    "calculatedAt": "2025-01-15T14:30:00Z"
  },
  "summary": {
    "totalCo2e": 125.45,
    "totalScope1Co2e": 45.20,
    "totalScope2Co2e": 80.25,
    "totalScope3Co2e": 0,
    "emissionsPerEmployee": 0.836,
    "breakdownByCategory": { ... }
  }
}
```

---

### Get Calculation Results
**GET** `/api/calculations/:emissionRecordId`

**Response (200):**
```json
{
  "calculation": {
    "id": "clxxx...",
    "totalCo2e": 125.45,
    "totalScope1Co2e": 45.20,
    "totalScope2Co2e": 80.25,
    "totalScope3Co2e": 0,
    "breakdownByCategory": { ... },
    "emissionFactorsUsed": { ... },
    "emissionsPerEmployee": 0.836,
    "calculatedAt": "2025-01-15T14:30:00Z"
  }
}
```

---

## Calculation Process

### Automatic Calculation Flow

1. **Data Entry**
   - User adds fuel, vehicle, electricity, or commuting data
   - Data is stored in database

2. **Trigger Calculation**
   - User triggers calculation via API
   - Or calculation runs automatically on data entry (optional)

3. **Calculation Engine**
   - Fetches all emission data for the record
   - Applies appropriate emission factors
   - Calculates CO2e for each entry
   - Updates individual records with calculated values

4. **Aggregation**
   - Sums emissions by scope
   - Calculates total CO2e
   - Generates breakdown by category
   - Calculates per-employee metrics

5. **Storage**
   - Saves calculation results to database
   - Records emission factors used
   - Timestamps the calculation

---

## Example Calculation Workflow

### Complete Example

**Organization:** ABC Corporation (150 employees)
**Period:** January 2025

#### Input Data:

**Fuel Usage:**
- Natural Gas: 1500 m³
- Diesel (generators): 200 liters

**Vehicle Fleet:**
- Sedan (ABC-123): 45.5 liters gasoline
- Truck (XYZ-789): 120 liters diesel

**Electricity:**
- Main Office: 15,000 kWh
- Warehouse: 8,000 kWh

**Commuting:**
- 150 employees
- Average distance: 12.5 km
- Transport: Car
- 5 days/week, 1 WFH day

#### Calculation:

**Scope 1 - Fuel:**
- Natural Gas: 1500 × 0.0021 = 3.15 tCO2e
- Diesel: 200 × 0.00269 = 0.538 tCO2e
- **Fuel Total: 3.688 tCO2e**

**Scope 1 - Vehicles:**
- Sedan: 45.5 × 0.00233 = 0.106 tCO2e
- Truck: 120 × 0.00269 = 0.323 tCO2e
- **Vehicle Total: 0.429 tCO2e**

**Scope 1 Total: 4.117 tCO2e**

**Scope 2 - Electricity:**
- Main Office: 15000 × 0.00063 = 9.45 tCO2e
- Warehouse: 8000 × 0.00063 = 5.04 tCO2e
- **Scope 2 Total: 14.49 tCO2e**

**Scope 3 - Commuting:**
- Work days: (5 × 52) - (1 × 52) = 208
- Annual: 150 × 12.5 × 2 × 0.00017 × 208 = 132.6 tCO2e
- Monthly: 132.6 / 12 = 11.05 tCO2e
- **Scope 3 Total: 11.05 tCO2e**

#### Final Results:

```json
{
  "totalCo2e": 29.657,
  "totalScope1Co2e": 4.117,
  "totalScope2Co2e": 14.49,
  "totalScope3Co2e": 11.05,
  "emissionsPerEmployee": 0.198,
  "breakdownByCategory": {
    "fuel": 3.688,
    "vehicles": 0.429,
    "refrigerants": 0,
    "electricity": 14.49,
    "commuting": 11.05
  }
}
```

---

## Calculation Updates

### When Calculations Are Recalculated:

1. **Manual Trigger**: User explicitly requests recalculation
2. **Data Changes**: When emission data is added/updated/deleted
3. **Bulk Recalculation**: For all records of an organization

### Recalculation Rules:

- Calculations are **idempotent** - running multiple times produces same result
- Previous calculation results are **overwritten**
- Calculation timestamp is **updated**
- Individual entry CO2e values are **updated**

---

## Validation & Error Handling

### Input Validation:
- ✅ Quantities must be positive numbers
- ✅ Dates must be valid
- ✅ Enum values must match allowed types
- ✅ Required fields must be present

### Calculation Validation:
- ✅ Results are finite numbers
- ✅ Results are non-negative
- ✅ Results are rounded to 4 decimal places
- ✅ Missing data is handled gracefully (excluded from calculations)

### Error Scenarios:
- **Missing emission factors**: Returns 0 (with warning log)
- **Invalid data types**: Calculation skips entry
- **Division by zero**: Returns 0 for per-employee metrics

---

## Performance Considerations

### Optimization Strategies:

1. **Batch Updates**: Individual entries are updated in parallel where possible
2. **Upsert Logic**: Calculations use upsert to avoid duplicates
3. **Selective Calculation**: Only calculates for entries with complete data
4. **Efficient Queries**: Uses Prisma includes to minimize database calls

### Scalability:

- Calculations are per-record (not global)
- Can handle thousands of entries per record
- Async processing ready (can be moved to background jobs)

---

## Future Enhancements

### Planned Features:
- Custom emission factors (organization-specific)
- Location-based electricity grid selection
- Historical emission factor versioning
- Automated calculation triggers on data entry
- Calculation audit log
- Carbon offset tracking
- Reduction target monitoring

---

## Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 404 | Emission record not found | Verify record ID |
| 403 | Forbidden | Check user ownership |
| 500 | Calculation failed | Check data integrity |

---

## Best Practices

1. **Run calculations after data entry** - Ensure all data is entered before calculating
2. **Verify results** - Review breakdown to ensure data accuracy
3. **Recalculate on changes** - Update calculations when editing data
4. **Monitor emissions per employee** - Track efficiency metrics
5. **Use consistent units** - Follow unit guidelines in data entry
