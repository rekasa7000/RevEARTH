# Authentication API Documentation

## Overview

RevEarth uses **better-auth** for authentication, which provides built-in endpoints plus custom extensions for email verification and password reset.

---

## Better-Auth Built-in Endpoints

Better-auth automatically provides these endpoints via `/api/auth/[...all]`:

### Register
**POST** `/api/auth/sign-up/email`

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "Juan Dela Cruz"
}
```

**Response:**
```json
{
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "Juan Dela Cruz",
    "emailVerified": false
  },
  "session": {
    "token": "session_token...",
    "expiresAt": "2025-01-20T..."
  }
}
```

---

### Login
**POST** `/api/auth/sign-in/email`

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "Juan Dela Cruz"
  },
  "session": {
    "token": "session_token...",
    "expiresAt": "2025-01-20T..."
  }
}
```

---

### Logout
**POST** `/api/auth/sign-out`

**Headers:**
```
Cookie: revearth.session_token=...
```

**Response:**
```json
{
  "success": true
}
```

---

## Custom Authentication Endpoints

### Get Current User
**GET** `/api/auth/me`

**Headers:**
```
Cookie: revearth.session_token=...
```

**Response:**
```json
{
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "Juan Dela Cruz",
    "emailVerified": "2025-01-15T10:00:00Z",
    "isVerified": true
  },
  "session": {
    "token": "session_token...",
    "expiresAt": "2025-01-22T..."
  }
}
```

**Error (401):**
```json
{
  "error": "Unauthorized"
}
```

---

### Verify Email (POST)
**POST** `/api/auth/verify-email`

```json
{
  "token": "verification_token_from_email"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error (400):**
```json
{
  "error": "Invalid verification token"
}
```

---

### Verify Email (GET - Link Click)
**GET** `/api/auth/verify-email?token=xxx`

**Success:** Redirects to `/auth/verify-success`

**Error:** Redirects to `/auth/verify-error`

---

### Forgot Password
**POST** `/api/auth/forgot-password`

```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset link sent to your email",
  "resetLink": "http://localhost:3000/auth/reset-password?token=xxx" // Development only
}
```

**Note:** Always returns success to prevent email enumeration attacks.

---

### Reset Password (POST)
**POST** `/api/auth/reset-password`

```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error (400):**
```json
{
  "error": "Invalid or expired reset token"
}
```

**Error (400 - Weak Password):**
```json
{
  "error": "Password must be at least 8 characters long"
}
```

---

### Verify Reset Token
**GET** `/api/auth/reset-password?token=xxx`

**Response (200):**
```json
{
  "valid": true,
  "message": "Token is valid"
}
```

**Error (400):**
```json
{
  "valid": false,
  "error": "Invalid or expired reset token"
}
```

---

## Authentication Flow Examples

### Registration Flow
1. User submits registration form
2. **POST** `/api/auth/sign-up/email`
3. Backend creates user with `isVerified: false`
4. Generate verification token
5. Send verification email (TODO: integrate email service)
6. User clicks link in email
7. **GET** `/api/auth/verify-email?token=xxx`
8. User account verified, redirect to login

---

### Login Flow
1. User submits login form
2. **POST** `/api/auth/sign-in/email`
3. Better-auth validates credentials
4. Returns session token in HTTP-only cookie
5. Redirect to dashboard

---

### Password Reset Flow
1. User clicks "Forgot Password"
2. **POST** `/api/auth/forgot-password` with email
3. Generate reset token with 1-hour expiry
4. Send reset email (TODO: integrate email service)
5. User clicks link in email
6. Frontend verifies token: **GET** `/api/auth/reset-password?token=xxx`
7. User enters new password
8. **POST** `/api/auth/reset-password` with token and new password
9. Password updated, redirect to login

---

## Protected Routes

To protect API routes, use the `withAuth` wrapper or `requireAuth` helper:

### Example: Protected Route
```typescript
import { withAuth } from "@/lib/utils/auth-middleware";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuth(async (request, { user }) => {
  // User is automatically authenticated here
  return NextResponse.json({
    message: `Hello ${user.name}!`,
    userId: user.id,
  });
});
```

### Example: Manual Auth Check
```typescript
import { requireAuth } from "@/lib/utils/auth-middleware";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Your logic here
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
}
```

---

## Environment Variables

Required in `.env`:

```env
# Better-auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/revearth"
DIRECT_URL="postgresql://user:password@localhost:5432/revearth"

# App URL (for email links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Email Service (TODO: Add when implementing)
# EMAIL_SERVER="smtp://user:pass@smtp.gmail.com:587"
# EMAIL_FROM="noreply@revearth.com"
```

---

## TODO: Email Integration

Currently, email links are logged to console in development. Integrate an email service:

**Options:**
- **Resend** (recommended for Next.js)
- **SendGrid**
- **Nodemailer** with SMTP
- **Postmark**

**Email Templates Needed:**
1. Email verification
2. Password reset
3. Welcome email (optional)

---

## Security Features

✅ **HTTP-only cookies** - Session tokens not accessible via JavaScript
✅ **CSRF protection** - Better-auth built-in
✅ **Secure cookies in production** - Automatic based on NODE_ENV
✅ **Password hashing** - Better-auth uses bcrypt
✅ **Token expiry** - Verification tokens don't expire, reset tokens expire in 1 hour
✅ **Email enumeration prevention** - Forgot password always returns success
✅ **Session expiry** - 7 days, updates every 24 hours

---

## Error Handling

All endpoints return consistent error format:

```json
{
  "error": "Error message here"
}
```

Common status codes:
- **200** - Success
- **400** - Bad request (validation error)
- **401** - Unauthorized (not logged in)
- **403** - Forbidden (logged in but no access)
- **500** - Server error
