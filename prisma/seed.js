/**
 * Database Seeding Script
 *
 * This script seeds the database with initial data for development/testing.
 * Run with: npm run db:seed
 *
 * NOTE: Modify this script to add your seed data.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Example: Seed users
  // Uncomment and modify as needed
  /*
  console.log('Creating test users...');
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: true,
    },
  });
  console.log('✓ Created user:', user.email);
  */

  // Example: Seed organizations
  /*
  console.log('\nCreating test organization...');
  const organization = await prisma.organization.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      name: 'Test Organization',
      industrySector: 'Technology',
      occupancyType: 'commercial',
    },
  });
  console.log('✓ Created organization:', organization.name);
  */

  console.log('\n✅ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('\n❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
