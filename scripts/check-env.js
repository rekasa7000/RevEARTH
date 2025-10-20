#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Verifies that all required environment variables are set
 * Run: node scripts/check-env.js
 */

const requiredVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'NEXT_PUBLIC_APP_URL'
];

const optionalVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_SECURE',
  'EMAIL_FROM',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET'
];

console.log('\n🔍 Checking environment variables...\n');

// Check required variables
const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(v => console.error(`   - ${v}`));
  console.error('\n💡 Copy .env.example to .env.local and fill in the values.');
  console.error('📖 See ENVIRONMENT_SETUP.md for detailed instructions.\n');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set.\n');
}

// Check optional variables
const missingOptional = optionalVars.filter(v => !process.env[v]);

if (missingOptional.length > 0) {
  console.log('ℹ️  Optional variables not set:');
  missingOptional.forEach(v => console.log(`   - ${v}`));

  // Check if email is configured
  const emailVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  const emailMissing = emailVars.filter(v => !process.env[v]);

  if (emailMissing.length > 0 && emailMissing.length < emailVars.length) {
    console.log('\n⚠️  Email service is partially configured. Set all SMTP variables to enable email functionality.');
  } else if (emailMissing.length === emailVars.length) {
    console.log('\n⚠️  Email service is not configured. Users will not receive verification or password reset emails.');
  }

  console.log('\n📖 See ENVIRONMENT_SETUP.md for setup instructions.\n');
} else {
  console.log('✅ All optional variables are also set.\n');
}

// Validate format
console.log('🔍 Validating environment variable formats...\n');

let hasFormatErrors = false;

// Check URLs
const urlVars = ['BETTER_AUTH_URL', 'NEXT_PUBLIC_APP_URL'];
urlVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    try {
      new URL(value);
      console.log(`✅ ${varName} format is valid`);
    } catch (e) {
      console.error(`❌ ${varName} is not a valid URL: ${value}`);
      hasFormatErrors = true;
    }
  }
});

// Check DATABASE_URL
if (process.env.DATABASE_URL) {
  if (process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.log('✅ DATABASE_URL format is valid');
  } else {
    console.error('❌ DATABASE_URL must start with postgresql://');
    hasFormatErrors = true;
  }
}

// Check DIRECT_URL
if (process.env.DIRECT_URL) {
  if (process.env.DIRECT_URL.startsWith('postgresql://')) {
    console.log('✅ DIRECT_URL format is valid');
  } else {
    console.error('❌ DIRECT_URL must start with postgresql://');
    hasFormatErrors = true;
  }
}

// Check BETTER_AUTH_SECRET length
if (process.env.BETTER_AUTH_SECRET) {
  if (process.env.BETTER_AUTH_SECRET.length >= 32) {
    console.log('✅ BETTER_AUTH_SECRET length is sufficient');
  } else {
    console.error('❌ BETTER_AUTH_SECRET should be at least 32 characters');
    console.error('   Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');
    hasFormatErrors = true;
  }
}

// Check SMTP_PORT
if (process.env.SMTP_PORT) {
  const port = parseInt(process.env.SMTP_PORT);
  if (!isNaN(port) && port > 0 && port <= 65535) {
    console.log('✅ SMTP_PORT format is valid');
  } else {
    console.error('❌ SMTP_PORT must be a number between 1 and 65535');
    hasFormatErrors = true;
  }
}

console.log('');

if (hasFormatErrors) {
  console.error('❌ Some environment variables have format errors. Please fix them.\n');
  process.exit(1);
} else {
  console.log('✅ All environment variables are properly formatted.\n');
  console.log('🚀 Your environment is ready!\n');
  process.exit(0);
}
