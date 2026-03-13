import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import jwtConfig from '../config/auth.js';

const { secret: JWT_SECRET, expiresIn: JWT_EXPIRES_IN } = jwtConfig;

export class AuthService {
  /**
   * Validate email format
   * @private
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate registration data
   * @private
   */
  static validateRegistrationData(data) {
    const errors = [];

    if (!data.email || typeof data.email !== 'string') {
      errors.push('Email is required');
    } else if (!this.validateEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (!data.password || typeof data.password !== 'string') {
      errors.push('Password is required');
    } else if (data.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (!data.displayName || typeof data.displayName !== 'string') {
      errors.push('Display name is required');
    } else if (data.displayName.trim().length < 3) {
      errors.push('Display name must be at least 3 characters');
    } else if (data.displayName.length > 100) {
      errors.push('Display name must be at most 100 characters');
    }

    if (errors.length > 0) {
      const error = new Error(errors[0]);
      error.validationErrors = errors;
      throw error;
    }
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.displayName - User display name
   * @returns {Promise<Object>} Created user (without password)
   */
  static async register(userData) {
    // Validate input
    this.validateRegistrationData(userData);

    // Check if email already exists
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Create user
    const user = await User.register(
      userData.email,
      userData.password,
      userData.displayName
    );

    return user;
  }

  /**
   * Login user and generate JWT token
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User and JWT token
   */
  static async login(email, password) {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Verify credentials
    const user = await User.login(email, password);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN
      }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt
      },
      token
    };
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Promise<Object>} Decoded token payload
   */
  static async verifyToken(token) {
    if (!token) {
      throw new Error('Token is required');
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User or null
   */
  static async getUserById(userId) {
    return await User.findById(userId);
  }
}
