# Database Setup Guide

## Prerequisites

✅ Supabase PostgreSQL database configured
✅ Environment variables set in `.env`
✅ Prisma schema defined

---

## Setup Steps

### Step 1: Ensure Database is Running

Make sure your Supabase database is active:
1. Go to your Supabase dashboard
2. Check if the database is paused
3. Unpause if needed (free tier databases auto-pause after inactivity)

---

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client (v6.17.0) to .\node_modules\@prisma\client
```

---

### Step 3: Push Schema to Database

**Option A: For Development (Recommended)**
```bash
npx prisma db push
```

This will:
- Create all tables and relationships
- No migration files created
- Fast and simple for development

**Option B: Create Migration (Production)**
```bash
npx prisma migrate dev --name init_ghg_inventory
```

This will:
- Create migration files in `prisma/migrations/`
- Apply migration to database
- Better for version control

---

### Step 4: Verify Database Schema

```bash
npx prisma studio
```

This opens Prisma Studio (database GUI) at `http://localhost:5555`

**Check that these tables exist:**
- ✅ users
- ✅ accounts
- ✅ sessions
- ✅ verification_tokens
- ✅ organizations
- ✅ facilities
- ✅ emission_records
- ✅ fuel_usage
- ✅ vehicle_usage
- ✅ refrigerant_usage
- ✅ electricity_usage
- ✅ commuting_data
- ✅ employee_commute_surveys
- ✅ emission_calculations

---

## Database Schema Overview

### Authentication Tables
- **users** - User accounts
- **accounts** - OAuth provider accounts
- **sessions** - Active user sessions
- **verification_tokens** - Email verification tokens

### Core Tables
- **organizations** - Company/entity information
- **facilities** - Multiple locations per organization

### Emission Data Tables
- **emission_records** - Container for reporting periods
- **fuel_usage** - Scope 1 fuel consumption
- **vehicle_usage** - Scope 1 vehicle fleet
- **refrigerant_usage** - Scope 1 refrigerants
- **electricity_usage** - Scope 2 electricity
- **commuting_data** - Scope 3 employee commuting
- **employee_commute_surveys** - Quarterly surveys

### Calculation Tables
- **emission_calculations** - Calculated CO2e totals

---

## Troubleshooting

### Issue: Can't reach database server

**Solution:**
1. Check Supabase dashboard - database might be paused
2. Unpause the database
3. Wait 1-2 minutes for database to start
4. Try the command again

---

### Issue: Connection timeout

**Solution:**
1. Verify your DATABASE_URL in `.env`
2. Check if you're behind a firewall
3. Try using DIRECT_URL for migrations:
   ```bash
   npx prisma migrate dev --name init_ghg_inventory
   ```

---

### Issue: Schema already exists

**Solution:**
If tables already exist but schema changed:
```bash
npx prisma migrate reset
# Warning: This deletes all data!

# Or for development:
npx prisma db push --force-reset
```

---

### Issue: Better-auth tables not created

**Solution:**
Better-auth will create its own tables on first use. Ensure these are in your schema:
- users
- accounts
- sessions
- verification_tokens

---

## Seed Data (Optional)

### Create Seed Script

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: '$2a$12$example', // Use bcrypt to hash actual password
      isVerified: true,
    },
  });

  console.log('Created user:', user.email);

  // Create test organization
  const org = await prisma.organization.create({
    data: {
      userId: user.id,
      name: 'Test Corporation',
      occupancyType: 'commercial',
      industrySector: 'Technology',
      applicableScopes: {
        scope1: true,
        scope2: true,
        scope3: false,
      },
    },
  });

  console.log('Created organization:', org.name);

  // Create test facility
  const facility = await prisma.facility.create({
    data: {
      organizationId: org.id,
      name: 'Main Office',
      location: 'Manila',
      employeeCount: 50,
      areaSqm: 1000,
    },
  });

  console.log('Created facility:', facility.name);

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Update package.json

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

### Run Seed

```bash
npx prisma db seed
```

---

## Verify Setup

### 1. Check Prisma Connection
```bash
npx prisma db pull
```

Should show: "Introspecting based on datasource..."

---

### 2. Query Database
```bash
npx prisma studio
```

Navigate through tables to verify structure.

---

### 3. Test API Connection

Create `test-connection.ts`:
```typescript
import { prisma } from './lib/db';

async function testConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log('✅ Database connected:', result);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

Run:
```bash
npx ts-node test-connection.ts
```

---

## Environment Variables Checklist

Verify your `.env` file has:

```env
# Database
DATABASE_URL="postgresql://..."  # For connection pooling (PgBouncer)
DIRECT_URL="postgresql://..."    # For migrations

# Better-auth (if using)
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Migration Strategy

### Development
```bash
# Fast iteration
npx prisma db push
```

### Production
```bash
# Version controlled migrations
npx prisma migrate deploy
```

---

## Database Backup (Recommended)

Before major changes:
```bash
# Export schema
npx prisma db pull

# Backup data (if using Supabase CLI)
supabase db dump -f backup.sql
```

---

## Next Steps

After database setup:
1. ✅ Run the app: `npm run dev`
2. ✅ Test authentication endpoints
3. ✅ Create test organization
4. ✅ Enter sample emission data
5. ✅ Run calculations
6. ✅ View dashboard

---

## Quick Commands Reference

```bash
# Generate Prisma Client
npx prisma generate

# Push schema (dev)
npx prisma db push

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (prod)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open database GUI
npx prisma studio

# Validate schema
npx prisma validate

# Format schema
npx prisma format
```

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| P1001 | Can't reach database | Check Supabase is running |
| P3009 | Missing migrations | Run `prisma migrate dev` |
| P2002 | Unique constraint | Duplicate data exists |
| P1017 | Server closed connection | Database auto-paused, unpause it |

---

## Support

- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **Better-auth Docs**: https://www.better-auth.com/docs

---

## Status

- [x] Prisma schema defined
- [x] Prisma client generated
- [ ] Database migrations applied
- [ ] Database verified with Prisma Studio
- [ ] Seed data created (optional)
- [ ] API endpoints tested
