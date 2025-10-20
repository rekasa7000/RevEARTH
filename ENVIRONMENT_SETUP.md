# Environment Variables Setup Guide

This document provides comprehensive information about all environment variables used in the RevEarth application.

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Variables Reference](#environment-variables-reference)
- [Setup Instructions](#setup-instructions)
- [Common Issues](#common-issues)
- [Security Best Practices](#security-best-practices)

---

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required variables in `.env.local`

3. Minimum required variables for local development:
   ```env
   DATABASE_URL="your-supabase-pooler-url"
   DIRECT_URL="your-supabase-direct-url"
   BETTER_AUTH_SECRET="generate-with-crypto"
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

---

## Environment Variables Reference

### Critical (Required for Operation)

#### `DATABASE_URL`
- **Purpose:** Connection pooling URL for database queries
- **Type:** PostgreSQL connection string
- **Required:** Yes
- **Format:** `postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true`
- **Where to get:** Supabase Dashboard > Settings > Database > Connection Pooling
- **Used in:** `prisma/schema.prisma`, `lib/db.ts`
- **Notes:** Uses port 6543 for PgBouncer connection pooling

#### `DIRECT_URL`
- **Purpose:** Direct database connection for Prisma migrations
- **Type:** PostgreSQL connection string
- **Required:** Yes
- **Format:** `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
- **Where to get:** Supabase Dashboard > Settings > Database > Connection String
- **Used in:** `prisma/schema.prisma`
- **Notes:** Uses port 5432 for direct connection, required for `prisma migrate` commands

#### `BETTER_AUTH_SECRET`
- **Purpose:** Secret key for encrypting authentication tokens and sessions
- **Type:** Base64 string (minimum 32 bytes)
- **Required:** Yes
- **Generate:**
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- **Used in:** `lib/auth.ts`
- **Notes:** MUST be different in production. Never share or commit this value.

#### `BETTER_AUTH_URL`
- **Purpose:** Backend authentication service URL
- **Type:** Full URL
- **Required:** Yes
- **Development:** `http://localhost:3000`
- **Production:** `https://yourdomain.com`
- **Used in:** `lib/auth.ts`
- **Notes:** Must match your actual backend URL

#### `NEXT_PUBLIC_APP_URL`
- **Purpose:** Frontend application base URL (client-side accessible)
- **Type:** Full URL
- **Required:** Yes
- **Development:** `http://localhost:3000`
- **Production:** `https://yourdomain.com`
- **Used in:** `lib/auth-client.ts`, `lib/auth/auth-hooks.ts`, `lib/api/client.ts`, `app/api/auth/forgot-password/route.ts`
- **Notes:** Prefix `NEXT_PUBLIC_` makes it available in browser. Used for OAuth redirects and password reset links.

---

### Email Service (Optional but Recommended)

If not configured, the application will run but email functionality will be disabled. Users will not be able to:
- Verify their email addresses
- Reset forgotten passwords via email
- Receive welcome emails

#### `SMTP_HOST`
- **Purpose:** Email server hostname
- **Type:** String
- **Required:** Yes (for email functionality)
- **Examples:**
  - Gmail: `smtp.gmail.com`
  - Outlook: `smtp-mail.outlook.com`
  - SendGrid: `smtp.sendgrid.net`
- **Used in:** `lib/services/email.ts`

#### `SMTP_PORT`
- **Purpose:** Email server port
- **Type:** Number
- **Required:** Yes (for email functionality)
- **Common values:**
  - `587` - TLS/STARTTLS (recommended)
  - `465` - SSL
  - `25` - Plain (not recommended)
- **Used in:** `lib/services/email.ts`

#### `SMTP_USER`
- **Purpose:** Email account username/email
- **Type:** String (usually an email address)
- **Required:** Yes (for email functionality)
- **Used in:** `lib/services/email.ts`

#### `SMTP_PASS`
- **Purpose:** Email account password or app password
- **Type:** String
- **Required:** Yes (for email functionality)
- **Notes:** For Gmail, use App Password, not your regular password
- **Used in:** `lib/services/email.ts`

#### `SMTP_SECURE`
- **Purpose:** Whether to use TLS
- **Type:** Boolean string ("true" or "false")
- **Required:** No
- **Default:** false
- **Recommended:** `false` for port 587, `true` for port 465
- **Used in:** `lib/services/email.ts`

#### `EMAIL_FROM`
- **Purpose:** Default sender email address
- **Type:** Email address string
- **Required:** No
- **Default:** `noreply@revearth.com`
- **Used in:** `lib/services/email.ts`
- **Notes:** Should match your SMTP_USER or be an authorized sender

---

### OAuth Providers (Optional)

#### `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
- **Purpose:** Enable Google OAuth sign-in
- **Type:** String
- **Required:** No (only if enabling Google auth)
- **Where to get:** [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **Used in:** `lib/auth.ts` (currently commented out)
- **Setup:**
  1. Create project in Google Cloud Console
  2. Enable Google+ API
  3. Create OAuth 2.0 credentials
  4. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

#### `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`
- **Purpose:** Enable GitHub OAuth sign-in
- **Type:** String
- **Required:** No (only if enabling GitHub auth)
- **Where to get:** [GitHub Developer Settings](https://github.com/settings/developers)
- **Used in:** `lib/auth.ts` (currently commented out)
- **Setup:**
  1. Go to GitHub Settings > Developer settings > OAuth Apps
  2. Create new OAuth App
  3. Add callback URL: `http://localhost:3000/api/auth/callback/github`

---

### System Variables

#### `NODE_ENV`
- **Purpose:** Indicates runtime environment
- **Type:** String enum
- **Possible values:** `development`, `production`, `test`
- **Required:** Automatically set by Node.js
- **Used in:** Multiple files for conditional behavior
- **Effects:**
  - **Development:**
    - Verbose database query logging
    - Error stack traces in UI
    - Password reset links logged to console
    - React Query window refocus disabled
  - **Production:**
    - Minimal logging
    - Secure cookies enabled
    - Error details hidden from users
    - React Query optimized for production

---

## Setup Instructions

### 1. Database Setup (Supabase)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing
3. Navigate to **Settings > Database**
4. Copy **Connection string** (for `DIRECT_URL`)
5. Copy **Connection pooling string** (for `DATABASE_URL`)
6. Replace `[YOUR-PASSWORD]` with your actual database password

### 2. Authentication Secret Generation

Run this command to generate a secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and use it as `BETTER_AUTH_SECRET`.

### 3. Email Service Setup (Gmail Example)

#### Option 1: Gmail (Free)

1. Enable 2-Factor Authentication on your Google Account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Create a new App Password for "Mail"
4. Use the generated 16-character password as `SMTP_PASS`
5. Configuration:
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-16-char-app-password"
   SMTP_SECURE="false"
   ```

#### Option 2: Outlook/Hotmail (Free)

1. Use your regular Outlook password
2. Configuration:
   ```env
   SMTP_HOST="smtp-mail.outlook.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@outlook.com"
   SMTP_PASS="your-password"
   SMTP_SECURE="false"
   ```

#### Option 3: SendGrid (Paid)

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create API key
3. Configuration:
   ```env
   SMTP_HOST="smtp.sendgrid.net"
   SMTP_PORT="587"
   SMTP_USER="apikey"
   SMTP_PASS="your-sendgrid-api-key"
   SMTP_SECURE="false"
   ```

### 4. Run Database Migrations

```bash
npx prisma migrate dev
```

### 5. Verify Setup

Start the development server:
```bash
npm run dev
```

Check for any warnings in the console about missing environment variables.

---

## Common Issues

### Database Connection Errors

**Error:** `Can't reach database server`

**Solutions:**
1. Verify `DATABASE_URL` is correct
2. Check if Supabase project is paused (free tier pauses after 7 days of inactivity)
3. Verify your IP is not blocked by Supabase firewall
4. Test connection: `npx prisma db push`

### Migration Errors

**Error:** `Migration failed to apply cleanly`

**Solutions:**
1. Ensure `DIRECT_URL` is set correctly (uses port 5432, not 6543)
2. Try: `npx prisma migrate reset` (WARNING: deletes all data)
3. Manually apply: `npx prisma db push`

### Email Not Sending

**Error:** `SMTP configuration is missing`

**Solutions:**
1. Verify all SMTP variables are set in `.env.local`
2. For Gmail: Use App Password, not regular password
3. Check firewall/antivirus is not blocking SMTP
4. Test with port 587 and `SMTP_SECURE="false"`
5. Check console logs in development mode for detailed SMTP errors

### Authentication Errors

**Error:** `Invalid session` or `Unauthorized`

**Solutions:**
1. Regenerate `BETTER_AUTH_SECRET`
2. Clear browser cookies
3. Verify `BETTER_AUTH_URL` matches your server URL
4. Check `NEXT_PUBLIC_APP_URL` is accessible

### OAuth Not Working

**Solutions:**
1. Uncomment OAuth variables in `lib/auth.ts`
2. Verify redirect URIs match in OAuth provider settings
3. For Google: Enable Google+ API in Cloud Console
4. Check callback URL format: `{NEXT_PUBLIC_APP_URL}/api/auth/callback/{provider}`

---

## Security Best Practices

### DO:

1. Use `.env.local` for local development (automatically gitignored)
2. Generate a new `BETTER_AUTH_SECRET` for each environment
3. Use App Passwords for email services, not main account passwords
4. Enable 2FA on all service accounts
5. Use strong, unique database passwords
6. Rotate secrets regularly (every 90 days)
7. Use different credentials for development/staging/production
8. Store production secrets in secure vault (e.g., Vercel, AWS Secrets Manager)

### DON'T:

1. NEVER commit `.env` or `.env.local` files to git
2. NEVER share secrets in Slack, email, or other communication
3. NEVER use the same `BETTER_AUTH_SECRET` across environments
4. NEVER hardcode secrets in source code
5. NEVER use simple/weak secrets (e.g., "secret123")
6. NEVER reuse database passwords for other services
7. NEVER log secrets to console in production

### Environment-Specific Secrets

| Environment | Secret Strength | Rotation Frequency |
|-------------|----------------|-------------------|
| Development | Moderate | As needed |
| Staging | Strong | Monthly |
| Production | Very Strong | Every 90 days |

---

## Environment Files

### `.env.example`
- Template file with placeholder values
- Safe to commit to version control
- Used for documentation and onboarding

### `.env.local`
- Local development configuration
- Automatically ignored by git
- Overrides `.env` variables
- **Recommended for local development**

### `.env`
- Can be used for shared development defaults
- Currently contains database URLs (should be moved to `.env.local`)
- **Should not contain sensitive values**

### `.env.production`
- Production-specific variables
- Never stored in repository
- Managed by hosting platform (Vercel, etc.)

---

## Deployment Checklist

Before deploying to production:

- [ ] Generate new `BETTER_AUTH_SECRET`
- [ ] Update `BETTER_AUTH_URL` to production domain
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Configure production database URLs
- [ ] Set up production email service
- [ ] Verify all required environment variables are set in hosting platform
- [ ] Test email functionality in staging environment
- [ ] Verify OAuth redirect URIs include production domain
- [ ] Enable secure cookies (`NODE_ENV=production`)
- [ ] Remove or secure any development-only features

---

## Testing Environment Variables

### Verify All Variables Are Set

Create a test script `scripts/check-env.js`:

```javascript
const requiredVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'NEXT_PUBLIC_APP_URL'
];

const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('Missing required environment variables:');
  missing.forEach(v => console.error(`  - ${v}`));
  process.exit(1);
} else {
  console.log('All required environment variables are set.');
}
```

Run: `node scripts/check-env.js`

### Test Database Connection

```bash
npx prisma db pull
```

### Test Email Service

The application will automatically test SMTP configuration on startup and log warnings if misconfigured.

---

## Support

If you encounter issues with environment setup:

1. Check this documentation
2. Review [Common Issues](#common-issues) section
3. Verify values in `.env.local` match the format in `.env.example`
4. Check application logs for specific error messages
5. Ensure all services (Supabase, email) are active and accessible

---

**Last Updated:** October 20, 2025
**Maintained by:** RevEarth Development Team
