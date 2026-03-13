// T051-T054: Auth API controllers
import { AuthService } from '../../services/AuthService.js';
import jwtConfig from '../../config/auth.js';

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export async function register(req, res, next) {
  try {
    const { email, password, displayName } = req.body;

    const user = await AuthService.register({
      email,
      password,
      displayName
    });

    // Automatically log in the user after registration by generating JWT token
    const loginResult = await AuthService.login(email, password);

    // Set JWT cookie
    res.cookie(jwtConfig.cookieName, loginResult.token, jwtConfig.cookieOptions);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt
      },
      message: 'Account created successfully'
    });
  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: error.message
        }
      });
    }

    if (error.validationErrors) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.validationErrors.map(err => ({
            message: err
          }))
        }
      });
    }

    next(error);
  }
}

/**
 * Login user
 * POST /api/v1/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    // Set JWT cookie
    res.cookie(jwtConfig.cookieName, result.token, jwtConfig.cookieOptions);

    res.status(200).json({
      user: result.user,
      message: 'Login successful'
    });
  } catch (error) {
    if (error.message === 'Email and password are required') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      });
    }

    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: error.message
        }
      });
    }

    next(error);
  }
}

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export async function logout(req, res, next) {
  try {
    // Clear JWT cookie
    res.clearCookie(jwtConfig.cookieName, jwtConfig.cookieOptions);

    res.status(200).json({
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current authenticated user
 * GET /api/v1/auth/me
 */
export async function me(req, res, next) {
  try {
    // req.user is set by auth middleware
    const user = await AuthService.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}
