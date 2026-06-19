/**
 * Clerk auth middleware for API routes.
 * Extracts userId from the Clerk JWT Bearer token.
 * Returns JSON 401 — never redirects.
 */
import { logger } from '../lib/logger.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    
    if (!payload.sub) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }

    req.userId = payload.sub;
    next();
  } catch (err) {
    logger.error('[AUTH] Token decode failed:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Token decode failed' });
  }
};
