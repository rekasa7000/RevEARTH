# API Validation Schemas

This directory contains Zod validation schemas for all API endpoints in the RevEarth application.

## Created Schemas

### Authentication (`auth.schemas.ts`)
- `signupSchema` - User registration
- `signinSchema` - User login
- `forgotPasswordSchema` - Password reset request
- `resetPasswordSchema` - Password reset with token
- `verifyEmailSchema` - Email verification

### Organization Management (`organization.schemas.ts`)
- `createOrganizationSchema` - Create new organization
- `updateOrganizationSchema` - Update organization details

### Facility Management (`facility.schemas.ts`)
- `createFacilitySchema` - Create new facility
- `updateFacilitySchema` - Update facility details

### Emission Records (`emission-record.schemas.ts`)
- `createEmissionRecordSchema` - Create new emission record
- `updateEmissionRecordSchema` - Update emission record

### Scope 1 - Fuel Usage (`fuel-usage.schemas.ts`)
- `createFuelUsageSchema` - Log fuel consumption
- `updateFuelUsageSchema` - Update fuel usage data

### Scope 1 - Vehicle Usage (`vehicle-usage.schemas.ts`)
- `createVehicleUsageSchema` - Log vehicle fuel consumption
- `updateVehicleUsageSchema` - Update vehicle usage data

### Scope 1 - Refrigerant Usage (`refrigerant-usage.schemas.ts`)
- `createRefrigerantUsageSchema` - Log refrigerant leakage
- `updateRefrigerantUsageSchema` - Update refrigerant data

### Scope 2 - Electricity Usage (`electricity-usage.schemas.ts`)
- `createElectricityUsageSchema` - Log electricity consumption
- `updateElectricityUsageSchema` - Update electricity data

### Scope 3 - Commuting Data (`commuting-data.schemas.ts`)
- `createCommutingDataSchema` - Log employee commuting
- `updateCommutingDataSchema` - Update commuting data

### Calculations (`calculation.schemas.ts`)
- `calculateEmissionsSchema` - Trigger emission calculations

## Usage

### Basic Usage

```typescript
import { getValidatedBody } from "@/lib/utils/validation-middleware";
import { createOrganizationSchema } from "@/lib/validations/organization.schemas";

export const POST = withAuth(async (request, { user }) => {
  try {
    // Validate and extract body
    const body = await getValidatedBody(request, createOrganizationSchema);

    // Use validated data
    const organization = await prisma.organization.create({
      data: body,
    });

    return NextResponse.json({ organization });
  } catch (error) {
    // Validation errors are automatically handled
    // and return 400 with detailed error messages
    throw error;
  }
});
```

### Validation Middleware

The `validation-middleware.ts` provides several helper functions:

- `getValidatedBody(request, schema)` - Validate request body
- `getValidatedQuery(request, schema)` - Validate query parameters
- `withValidation(handler)` - Wrap handler with automatic error handling

## Implementation Status

### Completed
- [x] All validation schemas created
- [x] Validation middleware helper created
- [x] Organizations API routes updated

### To Do
Apply validation to remaining API routes:
- [ ] Facilities API (`app/api/facilities/route.ts`)
- [ ] Emission Records API (`app/api/emission-records/route.ts`)
- [ ] Fuel Usage API (`app/api/fuel-usage/route.ts`)
- [ ] Vehicle Usage API (`app/api/vehicle-usage/route.ts`)
- [ ] Electricity Usage API (`app/api/electricity-usage/route.ts`)
- [ ] Commuting Data API (`app/api/commuting-data/route.ts`)
- [ ] Calculations API (`app/api/calculations/route.ts`)

## How to Apply Validation to Routes

1. Import the validation helper and schema:
```typescript
import { getValidatedBody } from "@/lib/utils/validation-middleware";
import { createFacilitySchema } from "@/lib/validations/facility.schemas";
```

2. Replace manual JSON parsing and validation:
```typescript
// Before
const body = await request.json();
if (!body.name) {
  return NextResponse.json({ error: "Name required" }, { status: 400 });
}

// After
const body = await getValidatedBody(request, createFacilitySchema);
// body is now fully validated and typed
```

3. The validation middleware will automatically:
   - Parse the request body
   - Validate against the schema
   - Return 400 with detailed errors if validation fails
   - Provide TypeScript type safety

## Validation Features

All schemas include:
- Type safety with TypeScript inference
- Required field validation
- Type validation (string, number, enum, etc.)
- Format validation (email, datetime, CUID, etc.)
- Range validation (min, max, positive, etc.)
- Custom validation rules
- Detailed error messages
- Automatic data transformation (string to number, etc.)

## Next Steps

To complete the validation implementation:
1. Update each API route file to use the validation helpers
2. Remove manual validation code
3. Test each endpoint with invalid data to ensure errors are properly caught
4. Update API documentation with validation requirements
