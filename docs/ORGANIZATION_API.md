# Organization Management API Documentation

## Overview

Manage organizations and facilities for GHG emissions tracking.

**Key Rules:**
- Each user can have **one organization**
- Each organization can have **multiple facilities**
- All endpoints require authentication

---

## Organization Endpoints

### Create Organization
**POST** `/api/organizations`

**Headers:**
```
Cookie: revearth.session_token=...
```

**Request Body:**
```json
{
  "name": "ABC Corporation",
  "industrySector": "Manufacturing",
  "occupancyType": "industrial",
  "reportingBoundaries": {
    "description": "Main facility and warehouse in Metro Manila"
  },
  "applicableScopes": {
    "scope1": true,
    "scope2": true,
    "scope3": true
  }
}
```

**Occupancy Types:**
- `residential` - Apartment complexes, condominiums
- `commercial` - Offices, retail, hospitality
- `industrial` - Manufacturing, warehouses
- `lgu` - Local government units
- `academic` - Schools, universities

**Default Scopes by Occupancy Type:**
- `residential`: Scope 1 & 2 only
- `commercial`, `industrial`, `lgu`, `academic`: All scopes (1, 2, 3)

**Response (201):**
```json
{
  "success": true,
  "organization": {
    "id": "clxxx...",
    "userId": "clxxx...",
    "name": "ABC Corporation",
    "industrySector": "Manufacturing",
    "occupancyType": "industrial",
    "reportingBoundaries": {
      "description": "Main facility and warehouse in Metro Manila"
    },
    "applicableScopes": {
      "scope1": true,
      "scope2": true,
      "scope3": true
    },
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

**Errors:**
- **400** - Missing required fields or invalid occupancy type
- **400** - User already has an organization
- **401** - Unauthorized

---

### Get User's Organization
**GET** `/api/organizations`

**Headers:**
```
Cookie: revearth.session_token=...
```

**Response (200):**
```json
{
  "organization": {
    "id": "clxxx...",
    "userId": "clxxx...",
    "name": "ABC Corporation",
    "industrySector": "Manufacturing",
    "occupancyType": "industrial",
    "reportingBoundaries": { ... },
    "applicableScopes": { ... },
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:00:00Z",
    "facilities": [
      {
        "id": "clxxx...",
        "name": "Main Office",
        "location": "Makati City",
        "employeeCount": 150
      }
    ],
    "_count": {
      "emissionRecords": 12,
      "facilities": 2
    }
  }
}
```

**Errors:**
- **404** - Organization not found
- **401** - Unauthorized

---

### Get Organization by ID
**GET** `/api/organizations/:id`

**Headers:**
```
Cookie: revearth.session_token=...
```

**Response (200):**
```json
{
  "organization": {
    "id": "clxxx...",
    "name": "ABC Corporation",
    "industrySector": "Manufacturing",
    "occupancyType": "industrial",
    "facilities": [...],
    "_count": {
      "emissionRecords": 12,
      "facilities": 2,
      "commuteSurveys": 145
    }
  }
}
```

**Errors:**
- **403** - Forbidden (user doesn't own this organization)
- **404** - Organization not found
- **401** - Unauthorized

---

### Update Organization
**PATCH** `/api/organizations/:id`

**Headers:**
```
Cookie: revearth.session_token=...
```

**Request Body:** (all fields optional)
```json
{
  "name": "ABC Corporation Ltd.",
  "industrySector": "Manufacturing & Distribution",
  "occupancyType": "industrial",
  "reportingBoundaries": {
    "description": "Expanded to include Laguna warehouse"
  },
  "applicableScopes": {
    "scope1": true,
    "scope2": true,
    "scope3": true
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "organization": {
    "id": "clxxx...",
    "name": "ABC Corporation Ltd.",
    "industrySector": "Manufacturing & Distribution",
    ...
  }
}
```

**Errors:**
- **400** - Invalid occupancy type
- **403** - Forbidden
- **404** - Organization not found
- **401** - Unauthorized

---

### Delete Organization
**DELETE** `/api/organizations/:id`

⚠️ **Warning:** This will cascade delete:
- All facilities
- All emission records
- All emission data (fuel, vehicles, electricity, etc.)
- All calculations
- All commute surveys

**Headers:**
```
Cookie: revearth.session_token=...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Organization deleted successfully"
}
```

**Errors:**
- **403** - Forbidden
- **404** - Organization not found
- **401** - Unauthorized

---

## Facility Endpoints

### Create Facility
**POST** `/api/facilities`

**Headers:**
```
Cookie: revearth.session_token=...
```

**Request Body:**
```json
{
  "organizationId": "clxxx...",
  "name": "Main Office",
  "location": "Makati City",
  "address": "123 Ayala Avenue, Makati, Metro Manila",
  "areaSqm": 5000.50,
  "employeeCount": 150
}
```

**Response (201):**
```json
{
  "success": true,
  "facility": {
    "id": "clxxx...",
    "organizationId": "clxxx...",
    "name": "Main Office",
    "location": "Makati City",
    "address": "123 Ayala Avenue, Makati, Metro Manila",
    "areaSqm": 5000.50,
    "employeeCount": 150,
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

**Errors:**
- **400** - Missing required fields (organizationId, name)
- **403** - Forbidden (user doesn't own organization)
- **404** - Organization not found
- **401** - Unauthorized

---

### Get All Facilities
**GET** `/api/facilities?organizationId=xxx`

**Headers:**
```
Cookie: revearth.session_token=...
```

**Query Parameters:**
- `organizationId` (required) - Organization ID

**Response (200):**
```json
{
  "facilities": [
    {
      "id": "clxxx...",
      "organizationId": "clxxx...",
      "name": "Main Office",
      "location": "Makati City",
      "address": "123 Ayala Avenue, Makati",
      "areaSqm": 5000.50,
      "employeeCount": 150,
      "createdAt": "2025-01-15T10:00:00Z",
      "_count": {
        "electricityUsage": 24
      }
    },
    {
      "id": "clxxx...",
      "name": "Warehouse",
      "location": "Laguna",
      "employeeCount": 50,
      "_count": {
        "electricityUsage": 12
      }
    }
  ]
}
```

**Errors:**
- **400** - Missing organizationId parameter
- **403** - Forbidden
- **404** - Organization not found
- **401** - Unauthorized

---

### Get Facility by ID
**GET** `/api/facilities/:id`

**Headers:**
```
Cookie: revearth.session_token=...
```

**Response (200):**
```json
{
  "facility": {
    "id": "clxxx...",
    "organizationId": "clxxx...",
    "name": "Main Office",
    "location": "Makati City",
    "address": "123 Ayala Avenue, Makati",
    "areaSqm": 5000.50,
    "employeeCount": 150,
    "createdAt": "2025-01-15T10:00:00Z",
    "organization": {
      "id": "clxxx...",
      "name": "ABC Corporation"
    },
    "_count": {
      "electricityUsage": 24
    }
  }
}
```

**Errors:**
- **403** - Forbidden
- **404** - Facility not found
- **401** - Unauthorized

---

### Update Facility
**PATCH** `/api/facilities/:id`

**Headers:**
```
Cookie: revearth.session_token=...
```

**Request Body:** (all fields optional)
```json
{
  "name": "Main Office - Renovated",
  "location": "Makati City, Metro Manila",
  "address": "123 Ayala Avenue, Makati City",
  "areaSqm": 5500.75,
  "employeeCount": 175
}
```

**Response (200):**
```json
{
  "success": true,
  "facility": {
    "id": "clxxx...",
    "name": "Main Office - Renovated",
    "employeeCount": 175,
    ...
  }
}
```

**Errors:**
- **403** - Forbidden
- **404** - Facility not found
- **401** - Unauthorized

---

### Delete Facility
**DELETE** `/api/facilities/:id`

⚠️ **Note:** This will also delete all electricity usage records linked to this facility.

**Headers:**
```
Cookie: revearth.session_token=...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Facility deleted successfully"
}
```

**Errors:**
- **403** - Forbidden
- **404** - Facility not found
- **401** - Unauthorized

---

## Usage Examples

### Complete Organization Setup Flow

#### Step 1: Create Organization
```bash
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -H "Cookie: revearth.session_token=..." \
  -d '{
    "name": "Green Tech Solutions",
    "industrySector": "Technology",
    "occupancyType": "commercial"
  }'
```

#### Step 2: Add Main Facility
```bash
curl -X POST http://localhost:3000/api/facilities \
  -H "Content-Type: application/json" \
  -H "Cookie: revearth.session_token=..." \
  -d '{
    "organizationId": "clxxx...",
    "name": "Head Office",
    "location": "BGC, Taguig",
    "employeeCount": 200
  }'
```

#### Step 3: Add Additional Facility
```bash
curl -X POST http://localhost:3000/api/facilities \
  -H "Content-Type: application/json" \
  -H "Cookie: revearth.session_token=..." \
  -d '{
    "organizationId": "clxxx...",
    "name": "Data Center",
    "location": "Quezon City",
    "employeeCount": 25
  }'
```

#### Step 4: Get Organization with Facilities
```bash
curl http://localhost:3000/api/organizations \
  -H "Cookie: revearth.session_token=..."
```

---

## Data Validation

### Organization
- **name**: Required, string
- **occupancyType**: Required, enum (residential | commercial | industrial | lgu | academic)
- **industrySector**: Optional, string
- **reportingBoundaries**: Optional, JSON object
- **applicableScopes**: Optional, JSON object with scope1/scope2/scope3 booleans

### Facility
- **name**: Required, string
- **organizationId**: Required, valid organization ID
- **location**: Optional, string
- **address**: Optional, string
- **areaSqm**: Optional, decimal (positive number)
- **employeeCount**: Optional, integer (positive number)

---

## Business Rules

1. **One Organization Per User**
   - Users can only create one organization
   - Attempting to create a second organization returns 400 error

2. **Occupancy Type Impact**
   - Determines default applicable scopes
   - Residential: Scope 1 & 2
   - Others: All scopes (1, 2, 3)

3. **Facilities Are Optional**
   - Organizations can exist without facilities
   - Facilities are mainly for tracking multiple locations

4. **Cascade Deletion**
   - Deleting organization deletes all facilities and emission data
   - Deleting facility deletes only electricity usage records for that facility

5. **Access Control**
   - Users can only access their own organizations and facilities
   - All operations verify ownership via userId

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
- **401** - Unauthorized (not logged in)
- **403** - Forbidden (not owner)
- **404** - Not found
- **500** - Server error
