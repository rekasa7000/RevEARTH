# BetterAuth with Supabase PostgreSQL Setup

## Setup Complete!

I've configured BetterAuth with Prisma and Supabase PostgreSQL for your RevEarth application.

## What's Been Done:

1. **Dependencies Installed:**
   - `better-auth` - Modern authentication library
   - `@prisma/client` - Prisma ORM client
   - `prisma` - Prisma CLI

2. **Files Created/Modified:**
   - `prisma/schema.prisma` - Database schema with User, Account, Session, and VerificationToken models
   - `lib/auth.ts` - BetterAuth server configuration
   - `lib/auth-client.ts` - BetterAuth client for frontend
   - `app/api/auth/[...all]/route.ts` - API route handler for authentication
   - `.env.local` - Environment variables

## Next Steps - You Need to Complete:

### 1. Configure Supabase Database URL

Open `.env.local` and replace the placeholder with your actual Supabase credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST.supabase.co:5432/postgres?schema=public"
```

**To get your Supabase connection string:**
1. Go to your Supabase project dashboard
2. Click on "Project Settings" (gear icon)
3. Go to "Database" section
4. Find "Connection string" → "URI"
5. Copy the connection string and replace `[YOUR-PASSWORD]` with your database password

### 2. Generate Prisma Client and Run Migrations

Once you've configured the DATABASE_URL, run:

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations to your database
npx prisma migrate dev --name init
```

This will:
- Generate the Prisma client
- Create the necessary tables in your Supabase database (users, accounts, sessions, verification_tokens)

### 3. Start Your Development Server

```bash
npm run dev
```

## How to Use BetterAuth in Your Components

### Sign Up Example:

```tsx
import { signUp } from "@/lib/auth-client";

async function handleSignUp(email: string, password: string, name: string) {
  try {
    await signUp.email({
      email,
      password,
      name,
    });
    // Redirect or show success message
  } catch (error) {
    console.error("Sign up failed:", error);
  }
}
```

### Sign In Example:

```tsx
import { signIn } from "@/lib/auth-client";

async function handleSignIn(email: string, password: string) {
  try {
    await signIn.email({
      email,
      password,
    });
    // Redirect to dashboard
  } catch (error) {
    console.error("Sign in failed:", error);
  }
}
```

### Sign Out Example:

```tsx
import { signOut } from "@/lib/auth-client";

async function handleSignOut() {
  await signOut();
}
```

### Check User Session (Client Component):

```tsx
"use client";

import { useSession } from "@/lib/auth-client";

export function UserProfile() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not signed in</div>;

  return (
    <div>
      <p>Welcome, {session.user.name}</p>
      <p>Email: {session.user.email}</p>
    </div>
  );
}
```

### Protect Server Components/API Routes:

```tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/signin");
  }

  return <div>Protected content for {session.user.name}</div>;
}
```

## Available Authentication Methods:

- ✅ Email/Password (currently enabled)
- OAuth providers (commented out in `lib/auth.ts`):
  - GitHub
  - Google
  - Add more as needed

## Database Schema:

The following tables will be created in your Supabase database:

- **users** - User accounts
- **accounts** - OAuth provider accounts
- **sessions** - User sessions
- **verification_tokens** - Email verification tokens

## Security Notes:

1. ✅ `BETTER_AUTH_SECRET` has been generated and added to `.env.local`
2. ⚠️ Email verification is currently disabled for development
3. ⚠️ In production:
   - Set `BETTER_AUTH_URL` to your production URL
   - Set `NEXT_PUBLIC_APP_URL` to your production URL
   - Enable `requireEmailVerification: true` in `lib/auth.ts`
   - Use secure cookies (already configured for production)

## Troubleshooting:

### Error: "Can't reach database server"
- Check your DATABASE_URL in `.env.local`
- Verify your Supabase database is running
- Check your network connection

### Error: "Prisma Client not generated"
- Run `npx prisma generate`

### Migration fails:
- Ensure your Supabase database credentials are correct
- Check if you have permission to create tables

## API Endpoints:

BetterAuth automatically creates these endpoints:

- `POST /api/auth/sign-up/email` - Email sign up
- `POST /api/auth/sign-in/email` - Email sign in
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session
- And more...

## Documentation:

- [BetterAuth Docs](https://better-auth.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Docs](https://supabase.com/docs)

---

**Ready to test?** Once you complete steps 1-3 above, your authentication system will be fully functional!
