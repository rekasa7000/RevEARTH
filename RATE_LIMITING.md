# Rate Limiting Guide

RevEarth uses a custom in-memory rate limiting system to protect API endpoints from abuse and ensure fair usage.

## Overview

Rate limiting prevents users from making too many requests in a short period, protecting the application from:
- Brute force attacks
- DDoS attempts
- Accidental infinite loops
- Resource exhaustion
- Unfair resource usage

## Features

- **In-Memory Storage**: No external dependencies required
- **Automatic Cleanup**: Expired entries are automatically removed
- **Customizable Limits**: Different limits for different endpoint types
- **User-Based Limiting**: Tracks authenticated users separately
- **IP-Based Limiting**: Falls back to IP address for unauthenticated requests
- **Standard Headers**: Returns standard rate limit headers
- **Zero Cost**: Completely free, no external services

## Rate Limit Tiers

### AUTH (Authentication Endpoints)
- **Limit**: 5 requests per minute
- **Use Case**: Login, signup, password reset
- **Reason**: Prevent brute force attacks

### WRITE (Data Modification)
- **Limit**: 20 requests per minute
- **Use Case**: Creating/updating organizations, facilities, records
- **Reason**: Prevent spam and data pollution

### READ (Data Retrieval)
- **Limit**: 100 requests per minute
- **Use Case**: Fetching lists, viewing details
- **Reason**: Allow normal usage while preventing scraping

### CALCULATION (Expensive Operations)
- **Limit**: 10 requests per minute
- **Use Case**: Emission calculations
- **Reason**: Protect against resource-intensive operations

### PUBLIC (Public/Error Endpoints)
- **Limit**: 200 requests per minute
- **Use Case**: Error logging, public data
- **Reason**: Lenient for non-sensitive operations

## Implementation

### Current Rate-Limited Endpoints

| Endpoint | Limit | Type |
|----------|-------|------|
| `/api/auth/forgot-password` | 5/min | AUTH |
| `/api/organizations` (POST) | 20/min | WRITE |
| `/api/calculations` | 10/min | CALCULATION |
| `/api/errors` (POST) | 200/min | PUBLIC |

### How It Works

1. **Request arrives** at endpoint
2. **Identifier extracted** (user ID or IP address)
3. **Counter checked** against limit
4. **Request allowed/denied** based on counter
5. **Headers added** to response with limit info

### Rate Limit Headers

All responses include these headers:

```
X-RateLimit-Limit: 20          # Maximum requests allowed
X-RateLimit-Remaining: 15      # Requests remaining in window
X-RateLimit-Reset: 2025-10-20T10:30:00Z  # When limit resets
```

### Rate Limit Exceeded Response

When limit is exceeded, the API returns:

```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later.",
  "limit": 20,
  "remaining": 0,
  "resetAt": "2025-10-20T10:30:00Z"
}
```

**Status Code**: `429 Too Many Requests`

## Usage

### Adding Rate Limiting to a Route

#### Method 1: Simple Rate Check

```typescript
import { checkRateLimit } from "@/lib/utils/rate-limit-middleware";
import { RateLimits } from "@/lib/services/rate-limiter";

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimit = await checkRateLimit(request, RateLimits.WRITE);
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  // Your handler code...
}
```

#### Method 2: Middleware Wrapper

```typescript
import { withRateLimit } from "@/lib/utils/rate-limit-middleware";
import { RateLimits } from "@/lib/services/rate-limiter";

async function handler(request: NextRequest) {
  // Your handler code...
}

export const POST = withRateLimit(handler, RateLimits.WRITE);
```

#### Method 3: With Authentication

```typescript
import { withAuth } from "@/lib/utils/auth-middleware";
import { checkRateLimit } from "@/lib/utils/rate-limit-middleware";
import { RateLimits } from "@/lib/services/rate-limiter";

export const POST = withAuth(async (request, { user }) => {
  // Rate limit by user ID
  const rateLimit = await checkRateLimit(request, RateLimits.WRITE, user.id);
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }

  // Your handler code...
});
```

### Custom Rate Limits

Create custom limits for specific needs:

```typescript
import { checkRateLimit } from "@/lib/utils/rate-limit-middleware";

const customLimit = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 1000,        // 1000 requests per hour
};

const rateLimit = await checkRateLimit(request, customLimit);
```

## Client-Side Handling

### React Example

```typescript
async function submitData(data: any) {
  try {
    const response = await fetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    // Check for rate limit
    if (response.status === 429) {
      const error = await response.json();
      const resetTime = new Date(error.resetAt);
      const waitSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);

      alert(`Rate limit exceeded. Please try again in ${waitSeconds} seconds.`);
      return;
    }

    const result = await response.json();
    // Handle success...
  } catch (error) {
    console.error('Request failed:', error);
  }
}
```

### Reading Rate Limit Headers

```typescript
const response = await fetch('/api/data');

const limit = response.headers.get('X-RateLimit-Limit');
const remaining = response.headers.get('X-RateLimit-Remaining');
const reset = response.headers.get('X-RateLimit-Reset');

console.log(`You have ${remaining} of ${limit} requests remaining`);
console.log(`Limit resets at ${reset}`);
```

## Best Practices

### 1. Choose Appropriate Limits

```typescript
// Too restrictive - frustrates users
{ windowMs: 60000, maxRequests: 1 }

// Too lenient - doesn't prevent abuse
{ windowMs: 60000, maxRequests: 10000 }

// Balanced - protects while allowing normal use
{ windowMs: 60000, maxRequests: 20 }
```

### 2. Use User IDs When Possible

```typescript
// Better - limits per user
const rateLimit = await checkRateLimit(request, limit, user.id);

// Fallback - limits per IP
const rateLimit = await checkRateLimit(request, limit);
```

### 3. Inform Users About Limits

Add rate limit information to API documentation:
- Maximum requests allowed
- Time window
- What happens when exceeded

### 4. Monitor Rate Limit Stats

```typescript
import { rateLimiter } from "@/lib/services/rate-limiter";

const stats = rateLimiter.getStats();
console.log(`Active rate limit entries: ${stats.totalEntries}`);
```

### 5. Handle Errors Gracefully

```typescript
try {
  const rateLimit = await checkRateLimit(request, limit);
  if (!rateLimit.allowed) {
    return rateLimit.response;
  }
} catch (error) {
  // Rate limiter failed - allow request through
  console.error("Rate limit error:", error);
}
```

## Configuration

### Adjusting Rate Limits

Edit `lib/services/rate-limiter.ts`:

```typescript
export const RateLimits = {
  AUTH: {
    windowMs: 60 * 1000,  // Change time window
    maxRequests: 10,       // Change max requests
  },
  // ... other limits
};
```

### Memory Management

The rate limiter automatically cleans up expired entries every 5 minutes. For manual cleanup:

```typescript
import { rateLimiter } from "@/lib/services/rate-limiter";

// Force cleanup
rateLimiter.cleanup();

// Get stats
const stats = rateLimiter.getStats();
```

## Limitations

### Single-Instance Only

The current implementation stores data in memory, which means:

- ✅ Works perfectly for single-instance deployments
- ✅ No external dependencies needed
- ❌ Doesn't work across multiple server instances
- ❌ Resets when server restarts

### For Multi-Instance Deployments

Consider using a shared storage solution:

1. **Redis** (self-hosted, free)
2. **Upstash Redis** (serverless, free tier)
3. **PostgreSQL** (use existing database)

Example with Redis:

```typescript
// lib/services/redis-rate-limiter.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function checkRedisRateLimit(
  identifier: string,
  limit: number,
  windowSec: number
) {
  const key = `ratelimit:${identifier}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, windowSec);
  }

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}
```

## Testing

### Test Rate Limits

```bash
# Test with curl
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/organizations \
    -H "Content-Type: application/json" \
    -d '{"name":"Test"}' \
    -i | grep -E "(HTTP|X-RateLimit)"
done
```

### Reset Rate Limits (Development)

```typescript
import { rateLimiter } from "@/lib/services/rate-limiter";

// Reset all limits for a user
rateLimiter.reset("user:123");

// Reset all limits for an IP
rateLimiter.reset("ip:192.168.1.1");
```

## Monitoring

### Log Rate Limit Violations

```typescript
const rateLimit = await checkRateLimit(request, limit, userId);
if (!rateLimit.allowed) {
  console.warn(`Rate limit exceeded for ${userId || 'unknown'}`);
  // Optional: Log to error monitoring system
  await logError({
    message: "Rate limit exceeded",
    level: "warn",
    userId,
    metadata: { limit, remaining: rateLimit.remaining },
  });
  return rateLimit.response;
}
```

### Dashboard Integration

Add rate limit stats to admin dashboard:

```typescript
import { rateLimiter } from "@/lib/services/rate-limiter";

export async function GET() {
  const stats = rateLimiter.getStats();
  return NextResponse.json({
    activeEntries: stats.totalEntries,
    memoryUsage: stats.memoryUsage,
  });
}
```

## Troubleshooting

### Rate Limits Not Working

1. Check imports are correct
2. Verify rate limit is placed before other logic
3. Check identifier is being extracted correctly

### Too Many False Positives

If legitimate users hit limits:
- Increase `maxRequests`
- Increase `windowMs`
- Use user IDs instead of IP addresses

### Memory Usage Growing

If memory usage increases over time:
- Check cleanup is running (every 5 minutes)
- Manually trigger cleanup: `rateLimiter.cleanup()`
- Adjust cleanup frequency if needed

### Rate Limits Reset Too Often

If limits reset when server restarts:
- Expected behavior with in-memory storage
- Consider switching to Redis for persistence

## API Reference

### `checkRateLimit(request, options, userId?)`

Check if request is within rate limit.

**Parameters:**
- `request`: NextRequest object
- `options`: Rate limit configuration
- `userId`: Optional user identifier

**Returns:**
```typescript
{
  allowed: boolean;
  response?: NextResponse; // 429 response if not allowed
}
```

### `withRateLimit(handler, options)`

Middleware wrapper for rate limiting.

### `RateLimits`

Pre-configured rate limit tiers:
- `AUTH`: 5 req/min
- `WRITE`: 20 req/min
- `READ`: 100 req/min
- `CALCULATION`: 10 req/min
- `PUBLIC`: 200 req/min

## Security Considerations

1. **IP Spoofing**: Trust proxy headers only if behind trusted proxy
2. **User Enumeration**: Use same limits for existing/non-existing users
3. **Bypass Attempts**: Rate limit applies before authentication
4. **DDoS Protection**: Rate limiting helps but isn't complete DDoS protection

## Future Enhancements

Potential improvements:

1. **Redis Integration**: For multi-instance deployments
2. **Sliding Window**: More accurate rate limiting algorithm
3. **Dynamic Limits**: Adjust based on system load
4. **Whitelist/Blacklist**: IP-based allowlists
5. **Burst Allowance**: Allow brief bursts above limit
6. **Cost-Based Limiting**: Different costs for different operations

---

**Last Updated:** October 20, 2025
**Maintained by:** RevEarth Development Team
