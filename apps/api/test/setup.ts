// Jest setup file for API tests
import 'reflect-metadata';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Global test timeout
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
  // Add any global cleanup here
});
