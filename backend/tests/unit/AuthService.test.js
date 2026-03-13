import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../../src/services/AuthService.js';
import { User } from '../../src/models/User.js';
import pool from '../../src/config/database.js';
import { setupTestDatabase, cleanupTestDatabase } from '../setup.js';

describe('AuthService', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'securePassword123',
        displayName: 'New User'
      };

      const user = await AuthService.register(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe('newuser@example.com');
      expect(user.displayName).toBe('New User');
      expect(user.password).toBeUndefined(); // Should not return password
      expect(user.passwordHash).toBeUndefined(); // Should not return hash
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        displayName: 'User One'
      };

      await AuthService.register(userData);

      // Try to register again with same email
      await expect(AuthService.register(userData))
        .rejects
        .toThrow('Email already exists');
    });

    it('should throw error if email is invalid', async () => {
      const userData = {
        email: 'invalidemail',
        password: 'password123',
        displayName: 'Test User'
      };

      await expect(AuthService.register(userData))
        .rejects
        .toThrow('Invalid email format');
    });

    it('should throw error if password is too short', async () => {
      const userData = {
        email: 'user@example.com',
        password: 'short',
        displayName: 'Test User'
      };

      await expect(AuthService.register(userData))
        .rejects
        .toThrow('Password must be at least 8 characters');
    });

    it('should throw error if display name is too short', async () => {
      const userData = {
        email: 'user@example.com',
        password: 'password123',
        displayName: 'AB'
      };

      await expect(AuthService.register(userData))
        .rejects
        .toThrow('Display name must be at least 3 characters');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create test user
      await AuthService.register({
        email: 'testuser@example.com',
        password: 'correctPassword123',
        displayName: 'Test User'
      });
    });

    it('should login with correct credentials', async () => {
      const result = await AuthService.login('testuser@example.com', 'correctPassword123');

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('testuser@example.com');
      expect(result.user.displayName).toBe('Test User');
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('should throw error with incorrect password', async () => {
      await expect(AuthService.login('testuser@example.com', 'wrongPassword'))
        .rejects
        .toThrow('Invalid email or password');
    });

    it('should throw error with non-existent email', async () => {
      await expect(AuthService.login('nonexistent@example.com', 'password123'))
        .rejects
        .toThrow('Invalid email or password');
    });

    it('should throw error if email is missing', async () => {
      await expect(AuthService.login('', 'password123'))
        .rejects
        .toThrow('Email and password are required');
    });

    it('should throw error if password is missing', async () => {
      await expect(AuthService.login('user@example.com', ''))
        .rejects
        .toThrow('Email and password are required');
    });
  });

  describe('verifyToken', () => {
    let validToken;
    let userId;

    beforeEach(async () => {
      // Register and login to get valid token
      const user = await AuthService.register({
        email: 'tokentest@example.com',
        password: 'password123',
        displayName: 'Token Test'
      });
      userId = user.id;

      const result = await AuthService.login('tokentest@example.com', 'password123');
      validToken = result.token;
    });

    it('should verify valid token', async () => {
      const decoded = await AuthService.verifyToken(validToken);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe('tokentest@example.com');
    });

    it('should throw error for invalid token', async () => {
      const invalidToken = 'invalid.token.here';

      await expect(AuthService.verifyToken(invalidToken))
        .rejects
        .toThrow('Invalid or expired token');
    });

    it('should throw error for missing token', async () => {
      await expect(AuthService.verifyToken(''))
        .rejects
        .toThrow('Token is required');
    });
  });

  describe('getUserById', () => {
    let userId;

    beforeEach(async () => {
      const user = await AuthService.register({
        email: 'getuser@example.com',
        password: 'password123',
        displayName: 'Get User'
      });
      userId = user.id;
    });

    it('should get user by ID', async () => {
      const user = await AuthService.getUserById(userId);

      expect(user).toBeDefined();
      expect(user.id).toBe(userId);
      expect(user.email).toBe('getuser@example.com');
      expect(user.displayName).toBe('Get User');
    });

    it('should return null for non-existent user', async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';
      const user = await AuthService.getUserById(fakeUserId);

      expect(user).toBeNull();
    });
  });
});
