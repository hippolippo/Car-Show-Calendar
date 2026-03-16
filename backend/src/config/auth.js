// T023: JWT configuration
import dotenv from 'dotenv';

dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: 'authToken',
  cookieOptions: {
    httpOnly: true, // Prevent JavaScript access
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site in production, 'lax' for dev
    maxAge: parseInt(process.env.JWT_COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000, // 7 days
  }
};

// Validate JWT secret on startup
if (process.env.NODE_ENV === 'production' && jwtConfig.secret.includes('change-in-production')) {
  console.error('ERROR: JWT_SECRET must be changed in production!');
  process.exit(1);
}

export default jwtConfig;
