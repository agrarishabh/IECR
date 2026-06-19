/**
 * Global test setup — runs before ALL test files.
 * Sets environment variables needed by route modules that read them at load time.
 */
process.env.ADMIN_USER_IDS = 'admin_user_123';
process.env.MONGODB_URI = 'mongodb://test-not-used';
