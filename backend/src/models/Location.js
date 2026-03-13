// T047: Location model
import pool from '../config/database.js';

/**
 * Location model for storing and retrieving event locations
 */
export class Location {
  /**
   * Create a new location
   * @param {Object} locationData - Location data
   * @param {string} locationData.address - Street address
   * @param {string} locationData.city - City name
   * @param {string} locationData.state - State/province
   * @param {string} locationData.zipCode - ZIP/postal code
   * @param {string} locationData.country - Country (default: USA)
   * @param {Object} locationData.coordinates - Lat/lon coordinates
   * @param {number} locationData.coordinates.lat - Latitude
   * @param {number} locationData.coordinates.lon - Longitude
   * @param {Object} client - Optional database client for transactions
   * @returns {Promise<Object>} Created location
   */
  static async create(locationData, client = null) {
    const db = client || pool;
    const {
      address,
      city,
      state = null,
      zipCode = null,
      country = 'USA',
      coordinates
    } = locationData;
    
    const query = `
      INSERT INTO locations (address, city, state, zip_code, country, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      address,
      city,
      state,
      zipCode,
      country,
      coordinates.lat,
      coordinates.lon
    ]);
    
    return this._formatLocation(result.rows[0]);
  }
  
  /**
   * Find location by ID
   * @param {string} id - Location UUID
   * @returns {Promise<Object|null>} Location object
   */
  static async findById(id) {
    const query = 'SELECT * FROM locations WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this._formatLocation(result.rows[0]);
  }
  
  /**
   * Format location for API response
   * Converts lat/lon decimals to coordinates object
   * @private
   */
  static _formatLocation(row) {
    if (!row) return null;
    
    return {
      id: row.id,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      country: row.country,
      coordinates: {
        lat: parseFloat(row.latitude),
        lon: parseFloat(row.longitude)
      },
      createdAt: row.created_at
    };
  }
}

export default Location;
