/**
 * Test Setup File
 * Runs before all tests
 */

import '@testing-library/jest-dom';

// Mock environment variables
// @ts-ignore - NODE_ENV is read-only in strict mode
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.DIRECT_URL = 'postgresql://test:test@localhost:5432/test';
process.env.BETTER_AUTH_SECRET = 'test-secret-key-for-testing-only';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Global test utilities can be added here
