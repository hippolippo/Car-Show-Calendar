// T046: User model
import pool from '../config/database.js';
import bcrypt from 'bcrypt';

/**
 * User model for authentication and user management
 */
export class User {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @param {string} displayName - User display name
   * @returns {Promise<Object>} Created user (without password)
   */
  static async register(email, password, displayName) {
    // Hash password with bcrypt (cost factor 12)
    const passwordHash = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users (email, password_hash, display_name)
      VALUES ($1, $2, $3)
      RETURNING id, email, display_name, created_at
    `;
    
    const result = await pool.query(query, [email, passwordHash, displayName]);
    const row = result.rows[0];
    
    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      createdAt: row.created_at
    };
  }
  
  /**
   * Login user - verify credentials
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {Promise<Object|null>} User object if valid, null if invalid
   */
  static async login(email, password) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    const isValid = await bcrypt.compare(password, row.password_hash);
    
    if (!isValid) {
      return null;
    }
    
    // Return user without password hash, with camelCase fields
    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  /**
   * Find user by ID
   * @param {string} id - User UUID
   * @returns {Promise<Object|null>} User object (without password)
   */
  static async findById(id) {
    const query = 'SELECT id, email, display_name, created_at, updated_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object (without password)
   */
  static async findByEmail(email) {
    const query = 'SELECT id, email, display_name, created_at, updated_at FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      displayName: row.display_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  /**
   * Create a user (for testing purposes)
   * @param {Object} data - User data with passwordHash already provided
   * @param {Object} client - Optional database client for transactions
   * @returns {Promise<Object>} Created user (without password)
   */
  static async create(data, client = null) {
    const db = client || pool;
    const query = `
      INSERT INTO users (email, password_hash, display_name)
      VALUES ($1, $2, $3)
      RETURNING id, email, display_name, created_at
    `;
    
    const result = await db.query(query, [data.email, data.passwordHash, data.displayName]);
    return result.rows[0];
  }
}

export default User;
