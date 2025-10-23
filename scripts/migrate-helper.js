#!/usr/bin/env node

/**
 * Migration Helper Script
 *
 * Provides utilities for managing Prisma migrations
 * Run: node scripts/migrate-helper.js [command]
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function exec(command) {
  console.log(`\n📦 Running: ${command}\n`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`\n❌ Command failed with exit code ${error.status}`);
    return false;
  }
}

async function createMigration() {
  console.log('📝 Creating a new migration\n');

  const name = await question('Migration name (e.g., add_user_roles): ');

  if (!name || name.trim() === '') {
    console.error('❌ Migration name is required');
    rl.close();
    return;
  }

  const success = exec(`npx prisma migrate dev --name ${name.trim()}`);

  if (success) {
    console.log('\n✅ Migration created successfully!');
    console.log('📁 Check prisma/migrations/ for the generated files');
    console.log('💾 Remember to commit the migration files to git');
  }

  rl.close();
}

async function deployMigration() {
  console.log('🚀 Deploying pending migrations\n');
  console.log('⚠️  This will apply migrations to the database');

  const confirm = await question('Continue? (y/N): ');

  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Deployment cancelled');
    rl.close();
    return;
  }

  const success = exec('npx prisma migrate deploy');

  if (success) {
    console.log('\n✅ Migrations deployed successfully!');
  }

  rl.close();
}

async function checkStatus() {
  console.log('🔍 Checking migration status\n');
  exec('npx prisma migrate status');
  rl.close();
}

async function resetDatabase() {
  console.log('🔄 Resetting database\n');
  console.log('⚠️  WARNING: This will DELETE ALL DATA and replay migrations');

  const confirm = await question('Are you ABSOLUTELY sure? Type "RESET" to confirm: ');

  if (confirm !== 'RESET') {
    console.log('❌ Reset cancelled');
    rl.close();
    return;
  }

  const success = exec('npx prisma migrate reset --force');

  if (success) {
    console.log('\n✅ Database reset successfully!');
  }

  rl.close();
}

async function generateClient() {
  console.log('⚙️  Generating Prisma Client\n');
  const success = exec('npx prisma generate');

  if (success) {
    console.log('\n✅ Prisma Client generated successfully!');
  }

  rl.close();
}

async function openStudio() {
  console.log('🎨 Opening Prisma Studio\n');
  exec('npx prisma studio');
  rl.close();
}

async function mainMenu() {
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║   Prisma Migration Helper             ║');
  console.log('╚═══════════════════════════════════════╝\n');
  console.log('What would you like to do?\n');
  console.log('1. Create new migration');
  console.log('2. Deploy migrations (production)');
  console.log('3. Check migration status');
  console.log('4. Reset database (DANGEROUS)');
  console.log('5. Generate Prisma Client');
  console.log('6. Open Prisma Studio');
  console.log('7. Exit\n');

  const choice = await question('Enter your choice (1-7): ');

  switch (choice.trim()) {
    case '1':
      await createMigration();
      break;
    case '2':
      await deployMigration();
      break;
    case '3':
      await checkStatus();
      break;
    case '4':
      await resetDatabase();
      break;
    case '5':
      await generateClient();
      break;
    case '6':
      await openStudio();
      break;
    case '7':
      console.log('👋 Goodbye!');
      rl.close();
      break;
    default:
      console.log('❌ Invalid choice');
      rl.close();
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'create' || command === 'new') {
  createMigration();
} else if (command === 'deploy') {
  deployMigration();
} else if (command === 'status') {
  checkStatus();
} else if (command === 'reset') {
  resetDatabase();
} else if (command === 'generate') {
  generateClient();
} else if (command === 'studio') {
  openStudio();
} else {
  mainMenu();
}
