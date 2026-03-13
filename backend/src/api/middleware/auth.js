// T024: Authentication middleware
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/auth.js';

/**
 * Middleware to verify JWT token from cookie
 * Adds user object to req.user if valid
 */
export function authenticate(req, res, next) {
  try {
    const token = req.cookies[jwtConfig.cookieName];
    
    if (!token) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }
    
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded; // { userId, email }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Session expired, please login again'
        }
      });
    }
    
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token'
      }
    });
  }
}

/**
 * Optional authentication - sets req.user if token is valid, but doesn't reject if missing
 */
export function optionalAuth(req, res, next) {
  try {
    const token = req.cookies[jwtConfig.cookieName];
    
    if (token) {
      const decoded = jwt.verify(token, jwtConfig.secret);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Invalid token, but we don't reject - just continue without user
    next();
  }
}

export default { authenticate, optionalAuth };
