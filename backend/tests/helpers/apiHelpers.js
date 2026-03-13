// T037: API test helpers
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../src/config/auth.js';

/**
 * Create a test user token
 */
export function createTestToken(userId, email) {
  return jwt.sign({ userId, email }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
}

/**
 * Make authenticated request
 */
export function authenticatedRequest(app, method, url, userId, email) {
  const token = createTestToken(userId, email);
  return request(app)[method](url).set('Cookie', [`${jwtConfig.cookieName}=${token}`]);
}

/**
 * Extract cookie from response
 */
export function extractCookie(response, cookieName) {
  const cookies = response.headers['set-cookie'];
  if (!cookies) return null;
  
  for (const cookie of cookies) {
    if (cookie.startsWith(cookieName)) {
      const match = cookie.match(/=([^;]+)/);
      return match ? match[1] : null;
    }
  }
  return null;
}

export default { createTestToken, authenticatedRequest, extractCookie };
