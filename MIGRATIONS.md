# Database Migrations Guide

This document explains how to manage database schema changes using Prisma Migrate.

## Overview

RevEarth uses **Prisma Migrate** for database schema version control. All schema changes should be done through migrations to ensure consistency across environments.

## Current Status

The project currently uses `prisma db push` for development, which directly syncs the schema without creating migration files. For production readiness, we're transitioning to proper migrations.

## Migration Workflow

### Development Environment

#### Option 1: Using `db push` (Current Method)

Best for rapid prototyping and local development:

```bash
# Make changes to prisma/schema.prisma
npm run db:push
```

**Pros:**
- Fast iteration
- No migration files to manage
- Good for prototyping

**Cons:**
- No migration history
- Can't rollback changes
- Not suitable for production

#### Option 2: Using Migrations (Recommended for Production)

Create proper migration files:

```bash
# 1. Make changes to prisma/schema.prisma

# 2. Create and apply migration
npm run db:migrate
# or
npx prisma migrate dev --name describe_your_change

# 3. Commit the migration files
git add prisma/migrations/
git commit -m "Add migration: describe_your_change"
```

### Production/Staging Environment

ALWAYS use migrations in production:

```bash
# Deploy pending migrations
npm run db:deploy
# or
npx prisma migrate deploy
```

## Common Migration Tasks

### 1. Add a New Table

```prisma
// prisma/schema.prisma
model NewFeature {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())

  @@map("new_features")
}
```

```bash
npx prisma migrate dev --name add_new_feature_table
```

### 2. Add a Column

```prisma
model User {
  id    String @id
  name  String
  phone String? // New column
}
```

```bash
npx prisma migrate dev --name add_user_phone
```

### 3. Modify a Column

```prisma
model Organization {
  id   String @id
  name String @db.VarChar(500) // Changed from default
}
```

```bash
npx prisma migrate dev --name increase_organization_name_length
```

### 4. Add a Relation

```prisma
model Post {
  id       String @id
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}

model User {
  id    String @id
  posts Post[]
}
```

```bash
npx prisma migrate dev --name add_post_author_relation
```

### 5. Data Migration

For changes that require data transformation, create an empty migration and add SQL:

```bash
# Create empty migration
npx prisma migrate dev --create-only --name migrate_user_data

# Edit the generated migration file
# prisma/migrations/XXXXXX_migrate_user_data/migration.sql
```

Add your SQL:
```sql
-- Update existing data
UPDATE users SET status = 'active' WHERE status IS NULL;

-- Make column non-nullable after data migration
ALTER TABLE users ALTER COLUMN status SET NOT NULL;
```

Then apply:
```bash
npx prisma migrate dev
```

## Migration Best Practices

### 1. Descriptive Names

```bash
# Good
npx prisma migrate dev --name add_error_monitoring
npx prisma migrate dev --name make_email_unique
npx prisma migrate dev --name add_user_roles

# Bad
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
npx prisma migrate dev --name changes
```

### 2. Small, Focused Migrations

Create separate migrations for different features:

```bash
# Instead of one large migration
npx prisma migrate dev --name big_update

# Do this
npx prisma migrate dev --name add_error_logging
npx prisma migrate dev --name add_audit_tables
npx prisma migrate dev --name update_user_schema
```

### 3. Test Before Committing

```bash
# 1. Create migration
npx prisma migrate dev --name my_change

# 2. Test in development
npm run dev

# 3. If issues, reset and fix
npx prisma migrate reset
# Fix schema
npx prisma migrate dev --name my_change_fixed

# 4. Commit when working
git add prisma/
git commit -m "Add migration: my_change"
```

### 4. Backup Before Major Changes

```bash
# Backup production database before deploying migrations
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Then deploy
npx prisma migrate deploy
```

### 5. Never Edit Applied Migrations

Once a migration is committed and applied (especially in production), NEVER edit it.

Instead, create a new migration to fix issues:

```bash
# Wrong
# Editing: prisma/migrations/20241020_add_users/migration.sql

# Correct
npx prisma migrate dev --name fix_users_table
```

## Migration Commands Reference

### Development

```bash
# Create and apply migration
npx prisma migrate dev --name <migration_name>

# Create migration without applying
npx prisma migrate dev --create-only --name <migration_name>

# Reset database and replay all migrations
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Generate Prisma Client after migration
npx prisma generate
```

### Production

```bash
# Deploy pending migrations
npx prisma migrate deploy

# Mark a migration as applied (without running it)
npx prisma migrate resolve --applied <migration_name>

# Mark a migration as rolled back
npx prisma migrate resolve --rolled-back <migration_name>
```

### Database Management

```bash
# Push schema changes without migrations (dev only)
npx prisma db push

# Pull schema from database (introspection)
npx prisma db pull

# Open Prisma Studio (GUI for database)
npx prisma studio
```

## Troubleshooting

### Migration Drift

**Error:** "Drift detected: Your database schema is not in sync"

**Solution:**
```bash
# Option 1: Reset and replay (dev only, loses data)
npx prisma migrate reset

# Option 2: Push current schema
npx prisma db push

# Option 3: Mark as resolved (if you're sure schema is correct)
npx prisma migrate resolve --applied <migration_name>
```

### Failed Migration

**Error:** Migration failed midway

**Solution:**
```bash
# 1. Check status
npx prisma migrate status

# 2. Fix the issue manually in database or schema

# 3. Mark as rolled back
npx prisma migrate resolve --rolled-back <failed_migration>

# 4. Fix and create new migration
npx prisma migrate dev --name fix_<issue>
```

### Missing Migration Files

**Error:** "migration(s) are applied to the database but missing from the local migrations directory"

**Solution:**
```bash
# If working alone and can reset
npx prisma migrate reset

# If migrations are from another developer
git pull origin main
npx prisma migrate deploy

# If migration files are truly lost (production)
# Contact team lead - may need manual resolution
```

### Connection Issues

**Error:** "Can't reach database server"

**Solution:**
```bash
# 1. Check .env file has correct DATABASE_URL and DIRECT_URL
# 2. Verify database is running
# 3. Check firewall/network
# 4. For migrations, use DIRECT_URL (port 5432), not pooled connection (port 6543)
```

## Environment Variables

Migrations require specific URLs:

```env
# Connection pooling (port 6543) - for app queries
DATABASE_URL="postgresql://user:pass@host:6543/db?pgbouncer=true"

# Direct connection (port 5432) - for migrations
DIRECT_URL="postgresql://user:pass@host:5432/db"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Migrations

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Deploy migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
        run: npx prisma migrate deploy
```

## Team Workflow

### Making Schema Changes

1. **Pull latest changes**
   ```bash
   git pull origin main
   npx prisma migrate deploy
   ```

2. **Make your changes**
   - Edit `prisma/schema.prisma`

3. **Create migration**
   ```bash
   npx prisma migrate dev --name your_change
   ```

4. **Test locally**
   - Run app and verify changes work
   - Test affected features

5. **Commit**
   ```bash
   git add prisma/
   git commit -m "Add migration: your_change"
   git push
   ```

6. **Notify team**
   - Let team know to pull and run migrations

### Pulling Changes with Migrations

```bash
# 1. Pull latest code
git pull origin main

# 2. Apply new migrations
npx prisma migrate deploy
# or in development
npx prisma migrate dev

# 3. Regenerate Prisma Client
npx prisma generate

# 4. Restart dev server
npm run dev
```

## Schema Design Guidelines

### Naming Conventions

```prisma
// Tables: PascalCase
model UserProfile { }

// Columns: camelCase
model User {
  firstName String
  createdAt DateTime
}

// Database names: snake_case
model User {
  firstName String @map("first_name")

  @@map("users")
}
```

### Indexes

```prisma
model User {
  email String @unique

  @@index([email])
  @@index([createdAt])
}
```

### Relations

```prisma
// One-to-Many
model Organization {
  id        String     @id
  facilities Facility[]
}

model Facility {
  id             String       @id
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
}

// Many-to-Many
model Post {
  id   String @id
  tags Tag[]  @relation("PostTags")
}

model Tag {
  id    String @id
  posts Post[] @relation("PostTags")
}
```

## Production Deployment Checklist

Before deploying schema changes:

- [ ] Migrations tested in development
- [ ] Migrations tested in staging
- [ ] Database backup created
- [ ] Team notified of deployment
- [ ] Rollback plan prepared
- [ ] All migrations committed to git
- [ ] CI/CD pipeline tested
- [ ] Monitor error logs during deployment

## Additional Resources

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Database Migration Best Practices](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate)

---

**Last Updated:** October 20, 2025
**Maintained by:** RevEarth Development Team
