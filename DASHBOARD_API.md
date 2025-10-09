# Dashboard & Analytics API Documentation

## Overview

APIs for visualizing and analyzing GHG emissions data through dashboards, trends, and comparisons.

---

## Dashboard Endpoint

### Get Dashboard Summary
**GET** `/api/dashboard?organizationId=xxx&period=year`

**Query Parameters:**
- `organizationId` (required) - Organization ID
- `period` (optional) - `year` | `quarter` | `month` (default: year)

**Headers:**
```
Cookie: revearth.session_token=...
```

**Response (200):**
```json
{
  "summary": {
    "totalCo2eYtd": 1505.40,
    "totalScope1": 542.40,
    "totalScope2": 963.00,
    "totalScope3": 0,
    "emissionsPerEmployee": 10.04,
    "totalRecords": 12,
    "recordsWithCalculations": 12,
    "trend": {
      "percentage": -15.5,
      "direction": "decrease",
      "comparedTo": "previous year"
    }
  },
  "trends": {
    "monthly": [
      {
        "month": "2025-01",
        "totalCo2e": 125.45,
        "scope1": 45.20,
        "scope2": 80.25,
        "scope3": 0
      },
      {
        "month": "2025-02",
        "totalCo2e": 130.20,
        "scope1": 48.10,
        "scope2": 82.10,
        "scope3": 0
      }
    ]
  },
  "breakdown": {
    "fuel": 421.80,
    "vehicles": 120.60,
    "refrigerants": 0,
    "electricity": 963.00,
    "commuting": 0
  },
  "topSources": [
    {
      "category": "electricity",
      "value": 963.00,
      "percentage": 64.0
    },
    {
      "category": "fuel",
      "value": 421.80,
      "percentage": 28.0
    },
    {
      "category": "vehicles",
      "value": 120.60,
      "percentage": 8.0
    }
  ],
  "organization": {
    "name": "ABC Corporation",
    "occupancyType": "industrial",
    "facilitiesCount": 2,
    "totalEmployees": 150
  }
}
```

---

## Analytics Endpoints

### Get Emission Trends
**GET** `/api/analytics/trends?organizationId=xxx&months=12`

**Query Parameters:**
- `organizationId` (required)
- `months` (optional, default: 12) - Number of months to include

**Response (200):**
```json
{
  "trends": [
    {
      "date": "2025-01-01",
      "month": "2025-01",
      "totalCo2e": 125.45,
      "scope1": 45.20,
      "scope2": 80.25,
      "scope3": 0,
      "breakdown": {
        "fuel": 35.15,
        "vehicles": 10.05,
        "refrigerants": 0,
        "electricity": 80.25,
        "commuting": 0
      }
    },
    {
      "date": "2025-02-01",
      "month": "2025-02",
      "totalCo2e": 130.20,
      "scope1": 48.10,
      "scope2": 82.10,
      "scope3": 0,
      "breakdown": { ... }
    }
  ],
  "movingAverage": [
    null,
    null,
    127.35,
    128.90,
    ...
  ],
  "statistics": {
    "min": 118.50,
    "max": 145.30,
    "average": 125.45,
    "dataPoints": 12
  }
}
```

**Use Cases:**
- Line charts showing emissions over time
- Trend analysis
- Identify seasonal patterns
- Moving average for smoothing fluctuations

---

### Get Comparison Data
**GET** `/api/analytics/comparison?organizationId=xxx&startDate=2025-01-01&endDate=2025-12-31&compareBy=scope`

**Query Parameters:**
- `organizationId` (required)
- `startDate` (optional) - Start date (YYYY-MM-DD)
- `endDate` (optional) - End date (YYYY-MM-DD)
- `compareBy` (optional) - `scope` | `facility` | `category` (default: scope)

#### Compare by Scope
**Response (200):**
```json
{
  "comparison": {
    "type": "scope",
    "data": [
      {
        "name": "Scope 1 - Direct Emissions",
        "value": 542.40,
        "percentage": 36.0
      },
      {
        "name": "Scope 2 - Electricity",
        "value": 963.00,
        "percentage": 64.0
      },
      {
        "name": "Scope 3 - Indirect Emissions",
        "value": 0,
        "percentage": 0
      }
    ],
    "total": 1505.40
  },
  "period": {
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "recordsCount": 12
  }
}
```

#### Compare by Facility
**Request:**
```
GET /api/analytics/comparison?organizationId=xxx&compareBy=facility
```

**Response (200):**
```json
{
  "comparison": {
    "type": "facility",
    "data": [
      {
        "name": "Main Office",
        "value": 945.30,
        "percentage": 62.8
      },
      {
        "name": "Warehouse",
        "value": 560.10,
        "percentage": 37.2
      }
    ],
    "total": 1505.40
  },
  "period": { ... }
}
```

#### Compare by Category
**Request:**
```
GET /api/analytics/comparison?organizationId=xxx&compareBy=category
```

**Response (200):**
```json
{
  "comparison": {
    "type": "category",
    "data": [
      {
        "name": "electricity",
        "value": 963.00,
        "percentage": 64.0
      },
      {
        "name": "fuel",
        "value": 421.80,
        "percentage": 28.0
      },
      {
        "name": "vehicles",
        "value": 120.60,
        "percentage": 8.0
      }
    ],
    "total": 1505.40
  },
  "period": { ... }
}
```

---

## Dashboard Visualization Guide

### Recommended Charts

#### 1. Summary Cards (KPIs)
**Data Source:** `/api/dashboard`

Display as cards:
- Total CO2e YTD
- Emissions per Employee
- Total Records
- YoY Trend (↑ increase, ↓ decrease)

```jsx
<div className="grid grid-cols-4 gap-4">
  <Card>
    <CardTitle>Total Emissions</CardTitle>
    <CardValue>{summary.totalCo2eYtd} tCO2e</CardValue>
    <CardTrend>{summary.trend.percentage}%</CardTrend>
  </Card>
  ...
</div>
```

---

#### 2. Scope Breakdown (Pie Chart)
**Data Source:** `/api/analytics/comparison?compareBy=scope`

```jsx
<PieChart>
  data={comparison.data.map(item => ({
    name: item.name,
    value: item.value
  }))}
</PieChart>
```

**Chart Library:** Recharts, Chart.js, or similar

---

#### 3. Monthly Trend (Line Chart)
**Data Source:** `/api/analytics/trends?months=12`

```jsx
<LineChart>
  <Line dataKey="totalCo2e" data={trends} />
  <Line dataKey="scope1" stroke="#ff7300" />
  <Line dataKey="scope2" stroke="#00c49f" />
  <Line dataKey="scope3" stroke="#0088fe" />
</LineChart>
```

---

#### 4. Category Breakdown (Bar Chart)
**Data Source:** `/api/analytics/comparison?compareBy=category`

```jsx
<BarChart data={comparison.data}>
  <Bar dataKey="value" fill="#8884d8" />
</BarChart>
```

---

#### 5. Top Sources (Horizontal Bar)
**Data Source:** `/api/dashboard` → `topSources`

```jsx
{topSources.map(source => (
  <div key={source.category}>
    <span>{source.category}</span>
    <ProgressBar value={source.percentage} />
    <span>{source.value} tCO2e</span>
  </div>
))}
```

---

## Complete Dashboard Example

### Frontend Implementation

```typescript
// Dashboard Component
import { useEffect, useState } from 'react';

export function Dashboard({ organizationId }: { organizationId: string }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      const response = await fetch(
        `/api/dashboard?organizationId=${organizationId}&period=year`,
        { credentials: 'include' }
      );
      const data = await response.json();
      setDashboardData(data);
      setLoading(false);
    }

    fetchDashboard();
  }, [organizationId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      {/* Summary Cards */}
      <div className="summary-cards">
        <Card title="Total Emissions" value={`${dashboardData.summary.totalCo2eYtd} tCO2e`} />
        <Card title="Scope 1" value={`${dashboardData.summary.totalScope1} tCO2e`} />
        <Card title="Scope 2" value={`${dashboardData.summary.totalScope2} tCO2e`} />
        <Card title="Per Employee" value={`${dashboardData.summary.emissionsPerEmployee} tCO2e`} />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart">
          <h3>Scope Breakdown</h3>
          <PieChart data={dashboardData.topSources} />
        </div>

        <div className="chart">
          <h3>Monthly Trends</h3>
          <LineChart data={dashboardData.trends.monthly} />
        </div>
      </div>

      {/* Top Sources */}
      <div className="top-sources">
        <h3>Top Emission Sources</h3>
        {dashboardData.topSources.map(source => (
          <SourceItem key={source.category} {...source} />
        ))}
      </div>
    </div>
  );
}
```

---

## Data Refresh Strategy

### Real-time Updates
```typescript
// Poll for updates every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchDashboard();
  }, 30000);

  return () => clearInterval(interval);
}, []);
```

### Manual Refresh
```typescript
<button onClick={() => fetchDashboard()}>
  Refresh Dashboard
</button>
```

---

## Performance Optimization

### Caching Strategy
```typescript
// Cache dashboard data for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

const cachedData = useMemo(() => {
  return dashboardData;
}, [dashboardData?.summary.totalCo2eYtd]);
```

### Lazy Loading
```typescript
// Load trends separately
const [trends, setTrends] = useState(null);

useEffect(() => {
  // Load dashboard first
  fetchDashboard().then(() => {
    // Then load trends
    fetchTrends();
  });
}, []);
```

---

## Error Handling

### API Errors
```typescript
try {
  const response = await fetch('/api/dashboard?...');

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard');
  }

  const data = await response.json();
  setDashboardData(data);
} catch (error) {
  console.error(error);
  setError('Unable to load dashboard. Please try again.');
}
```

---

## Best Practices

1. **Show Loading States**
   - Display skeleton loaders while fetching data
   - Use suspense boundaries for better UX

2. **Handle Empty States**
   - Show helpful messages when no data exists
   - Guide users to add their first emission record

3. **Responsive Design**
   - Stack cards on mobile
   - Adjust chart sizes for different screens

4. **Accessibility**
   - Add ARIA labels to charts
   - Provide data tables as alternatives
   - Use high-contrast colors

5. **Progressive Enhancement**
   - Load summary first
   - Fetch detailed analytics in background
   - Allow drilling down into specific periods

---

## Common Use Cases

### Year-over-Year Comparison
```typescript
const currentYear = await fetch('/api/dashboard?period=year');
const lastYear = await fetch('/api/dashboard?period=year&year=2024');

const yoyChange = ((currentYear.total - lastYear.total) / lastYear.total) * 100;
```

### Facility Comparison
```typescript
const facilityData = await fetch(
  '/api/analytics/comparison?compareBy=facility'
);

// Identify highest emitting facility
const topFacility = facilityData.comparison.data
  .sort((a, b) => b.value - a.value)[0];
```

### Progress Tracking
```typescript
// Set reduction target
const target = 1000; // tCO2e
const current = dashboardData.summary.totalCo2eYtd;
const progress = ((target - current) / target) * 100;
```

---

## Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | Organization ID required | Include organizationId parameter |
| 403 | Forbidden | Check user ownership |
| 404 | Organization not found | Verify organization exists |
| 500 | Failed to get dashboard data | Check server logs |
