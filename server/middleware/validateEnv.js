/**
 * Validates required environment variables on server startup.
 * Throws immediately if any required variable is missing,
 * preventing silent failures in production.
 */
import { logger } from '../lib/logger.js';

const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'ADMIN_USER_IDS',
  'TMDB_API_KEY'
];

const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error('[STARTUP ERROR] Missing required environment variables:');
    missing.forEach((key) => logger.error(`  - ${key}`));
    process.exit(1);
  }

  logger.info('[ENV] All required environment variables are present.');
};

export default validateEnv;
