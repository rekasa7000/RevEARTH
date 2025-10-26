# Custom Error Monitoring System

RevEarth uses a custom-built error monitoring system instead of external services like Sentry. This provides complete control, zero costs, and no external dependencies.

## Features

- Automatic error logging from client-side and server-side
- Error deduplication and occurrence counting
- Error resolution tracking
- Statistics and analytics
- Web-based dashboard for viewing and managing errors
- Automatic cleanup of old resolved errors
- No external services or API keys required

## Architecture

### Database Model

The `ErrorLog` model stores all error information:

```prisma
model ErrorLog {
  id            String    @id @default(cuid())
  message       String
  stack         String?
  level         ErrorLevel // error, warn, info, debug
  context       String?    // api, client, server
  url           String?
  userAgent     String?
  userId        String?
  method        String?
  statusCode    Int?
  requestBody   Json?
  metadata      Json?
  resolved      Boolean
  resolvedAt    DateTime?
  resolvedBy    String?
  occurrences   Int       // Counts duplicate errors
  firstSeenAt   DateTime
  lastSeenAt    DateTime
  environment   String    // development, staging, production
}
```

### Service Layer

`lib/services/error-logger.ts` provides these functions:

- **`logError(options)`** - Log any error
- **`logApiError(error, request, context)`** - Log API errors
- **`logClientError(error, url, userId, metadata)`** - Log client errors
- **`resolveError(errorId, resolvedBy)`** - Mark error as resolved
- **`getErrorStats(timeframe)`** - Get error statistics
- **`cleanupOldErrors(daysToKeep)`** - Delete old resolved errors

### API Endpoints

- **POST /api/errors** - Log new error (no auth required)
- **GET /api/errors** - List errors with filtering (requires auth)
- **GET /api/errors/:id** - Get single error (requires auth)
- **PATCH /api/errors/:id** - Resolve/unresolve error (requires auth)
- **DELETE /api/errors/:id** - Delete error (requires auth)
- **GET /api/errors/stats** - Get statistics (requires auth)

### UI Dashboard

Access the error monitoring dashboard at `/errors` (protected route).

Features:
- View all errors with filtering (unresolved/resolved/all)
- Error statistics dashboard
- Resolve/unresolve errors
- Delete error logs
- View full stack traces
- See occurrence counts

## Usage

### Automatic Logging

Errors are automatically logged in these scenarios:

1. **Client-side React errors** - Caught by ErrorBoundary
2. **Unhandled Promise rejections** - Caught by error boundary
3. **Manual logging** - Use the service functions

### Manual Logging

#### In API Routes

```typescript
import { logApiError } from "@/lib/services/error-logger";

export async function GET(request: Request) {
  try {
    // Your code
  } catch (error) {
    await logApiError(error as Error, request, "my-api");
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

#### In Client Components

```typescript
// Errors thrown in components are automatically caught by ErrorBoundary

// For manual logging:
try {
  // Your code
} catch (error) {
  await fetch("/api/errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: (error as Error).message,
      stack: (error as Error).stack,
      level: "error",
      url: window.location.href,
      metadata: { additionalContext: "..." },
    }),
  });
}
```

#### In Server Components

```typescript
import { logError } from "@/lib/services/error-logger";

try {
  // Your code
} catch (error) {
  await logError({
    message: (error as Error).message,
    stack: (error as Error).stack,
    level: "error",
    context: "server",
    metadata: { additionalInfo: "..." },
  });
}
```

## Error Deduplication

The system automatically detects duplicate errors based on:
- Same error message
- Same context
- Same URL
- Within the last hour

Duplicates increment the `occurrences` counter instead of creating new entries.

## Maintenance

### Cleanup Old Errors

Run periodically to delete old resolved errors:

```typescript
import { cleanupOldErrors } from "@/lib/services/error-logger";

// Delete resolved errors older than 30 days
const deletedCount = await cleanupOldErrors(30);
```

Consider adding this as a cron job or scheduled task.

## Best Practices

1. **Log Contextual Information**
   - Include relevant metadata
   - Add user IDs when available
   - Include request/response data (sanitized)

2. **Use Appropriate Error Levels**
   - `error` - Critical errors requiring immediate attention
   - `warn` - Warnings that may need investigation
   - `info` - Informational messages
   - `debug` - Detailed debugging information

3. **Sanitize Sensitive Data**
   ```typescript
   // Bad - logs password
   await logError({ metadata: { password: "secret123" } });

   // Good - sanitized
   await logError({ metadata: { hasPassword: true } });
   ```

4. **Add Context**
   ```typescript
   await logError({
     message: "Database connection failed",
     context: "database",
     metadata: {
       host: "db.example.com",
       operation: "SELECT users",
       retryAttempt: 3,
     },
   });
   ```

5. **Regular Monitoring**
   - Check the `/errors` dashboard regularly
   - Set up alerts for critical errors (future enhancement)
   - Review and resolve errors promptly

## Future Enhancements

Consider adding:

1. **Email Alerts**
   - Send email when critical errors occur
   - Daily/weekly error summary reports

2. **Slack/Discord Integration**
   - Real-time notifications
   - Error summaries

3. **Performance Monitoring**
   - Track slow API responses
   - Monitor database query performance

4. **User Impact Tracking**
   - Track how many users affected by each error
   - User-specific error views

5. **Error Grouping**
   - Smart grouping of similar errors
   - Pattern detection

6. **Source Maps**
   - Parse and display original source locations
   - Link to code in IDE

7. **Automated Cleanup**
   - Cron job to run cleanup
   - Configurable retention policies

## Comparison with Sentry

| Feature | Custom Solution | Sentry |
|---------|----------------|--------|
| Cost | Free | Paid after free tier |
| Data Privacy | Fully controlled | External service |
| Customization | Full control | Limited |
| Setup Complexity | Moderate | Easy |
| External Dependencies | None | Requires account |
| Usage Limits | None | Event limits on free tier |
| Advanced Features | Basic | Extensive |
| Maintenance | Self-hosted | Managed |

## Troubleshooting

### Errors Not Appearing in Dashboard

1. Check database connection
2. Verify ErrorLog table exists: `npx prisma db push`
3. Check API endpoint is accessible: `curl http://localhost:3000/api/errors`
4. Verify authentication for dashboard access

### Too Many Errors

1. Check for error loops
2. Verify deduplication is working
3. Run cleanup: `cleanupOldErrors(7)` to remove old errors
4. Add filtering to reduce noise

### Performance Issues

1. Add database indexes (already included):
   ```prisma
   @@index([level, resolved])
   @@index([firstSeenAt])
   @@index([userId])
   ```

2. Limit query results with pagination
3. Archive old errors to separate table
4. Consider using database partitioning for large datasets

## Support

For issues or questions about error monitoring:
1. Check this documentation
2. Review `lib/services/error-logger.ts` source code
3. Check the API endpoints in `app/api/errors/`
4. Review the dashboard at `app/(protected)/errors/page.tsx`

---

**Built with ❤️ by the RevEarth Team**
