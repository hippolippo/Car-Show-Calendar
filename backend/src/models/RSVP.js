// T113: RSVP model
import pool from '../config/database.js';

/**
 * RSVP model for event attendance tracking
 */
export class RSVP {
  /**
   * Create a new RSVP
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   * @param {Object} client - Optional database client for transactions
   * @returns {Promise<Object>} Created RSVP
   */
  static async create(userId, eventId, client = null) {
    const db = client || pool;
    
    const query = `
      INSERT INTO rsvps (user_id, event_id)
      VALUES ($1, $2)
      RETURNING id, user_id, event_id, created_at
    `;
    
    const result = await db.query(query, [userId, eventId]);
    const row = result.rows[0];
    
    return {
      id: row.id,
      userId: row.user_id,
      eventId: row.event_id,
      createdAt: row.created_at
    };
  }

  /**
   * Delete an RSVP
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   * @param {Object} client - Optional database client for transactions
   * @returns {Promise<boolean>} True if deleted
   */
  static async delete(userId, eventId, client = null) {
    const db = client || pool;
    
    const query = 'DELETE FROM rsvps WHERE user_id = $1 AND event_id = $2';
    const result = await db.query(query, [userId, eventId]);
    
    return result.rowCount > 0;
  }

  /**
   * Find RSVP by user and event
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   * @returns {Promise<Object|null>} RSVP or null
   */
  static async findByUserAndEvent(userId, eventId) {
    const query = `
      SELECT id, user_id, event_id, created_at
      FROM rsvps
      WHERE user_id = $1 AND event_id = $2
    `;
    
    const result = await pool.query(query, [userId, eventId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      eventId: row.event_id,
      createdAt: row.created_at
    };
  }

  /**
   * Find all RSVPs for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of RSVPs with event details
   */
  static async findByUser(userId) {
    const query = `
      SELECT 
        r.id,
        r.user_id,
        r.event_id,
        r.created_at as rsvp_date,
        e.name as event_name,
        e.description as event_description,
        e.event_date,
        e.rsvp_count,
        l.address,
        l.city,
        l.state,
        l.zip_code,
        l.country,
        l.latitude,
        l.longitude
      FROM rsvps r
      JOIN events e ON r.event_id = e.id
      JOIN locations l ON e.location_id = l.id
      WHERE r.user_id = $1
      ORDER BY e.event_date ASC
    `;
    
    const result = await pool.query(query, [userId]);
    
    return result.rows.map(row => ({
      id: row.id,
      event: {
        id: row.event_id,
        name: row.event_name,
        description: row.event_description,
        eventDate: row.event_date,
        rsvpCount: row.rsvp_count,
        location: {
          address: row.address,
          city: row.city,
          state: row.state,
          zipCode: row.zip_code,
          country: row.country,
          coordinates: {
            lat: parseFloat(row.latitude),
            lon: parseFloat(row.longitude)
          }
        }
      },
      rsvpDate: row.rsvp_date
    }));
  }

  /**
   * Find all RSVPs for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} List of RSVPs with user details
   */
  static async findByEvent(eventId) {
    const query = `
      SELECT 
        r.id,
        r.user_id,
        r.event_id,
        r.created_at,
        u.display_name,
        u.email
      FROM rsvps r
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = $1
      ORDER BY r.created_at ASC
    `;
    
    const result = await pool.query(query, [eventId]);
    
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      eventId: row.event_id,
      displayName: row.display_name,
      email: row.email,
      createdAt: row.created_at
    }));
  }

  /**
   * Check if user has RSVP'd to event
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   * @returns {Promise<boolean>} True if RSVP exists
   */
  static async hasRsvped(userId, eventId) {
    const rsvp = await this.findByUserAndEvent(userId, eventId);
    return rsvp !== null;
  }
}

export default RSVP;
