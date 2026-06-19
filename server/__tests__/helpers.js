/**
 * Test helper: generate a fake Clerk-style JWT that passes
 * the real authenticate() middleware decode logic.
 *
 * The middleware does:
 *   const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
 *   req.userId = payload.sub;
 *
 * So we craft a 3-part JWT with the right payload.
 */

export const makeFakeToken = (userId = 'user_test123') => {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ sub: userId, iat: Date.now() })).toString('base64url');
  const signature = Buffer.from('fake-signature').toString('base64url');
  return `${header}.${payload}.${signature}`;
};

export const authHeader = (userId = 'user_test123') => ({
  Authorization: `Bearer ${makeFakeToken(userId)}`,
});
