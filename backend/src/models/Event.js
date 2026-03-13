// T048: Event model
import pool from '../config/database.js';

/**
 * Event model for car show events
 */
export class Event {
  /**
   * Create a new event
   * @param {Object} eventData - Event data
   * @param {string} eventData.name - Event name
   * @param {string} eventData.description - Event description
   * @param {string} eventData.eventDate - Event date/time (ISO string)
   * @param {string} eventData.locationId - Location UUID
   * @param {string} eventData.organizerId - Organizer user UUID
   * @param {string} eventData.flierUrl - Optional flier URL
   * @param {Object} client - Optional database client for transactions
   * @returns {Promise<Object>} Created event
   */
  static async create(eventData, client = null) {
    const db = client || pool;
    const {
      name,
      description,
      eventDate,
      locationId,
      organizerId,
      flierUrl = null
    } = eventData;
    
    const query = `
      INSERT INTO events (name, description, event_date, location_id, organizer_id, flier_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      name,
      description,
      eventDate,
      locationId,
      organizerId,
      flierUrl
    ]);
    
    // Return formatted with camelCase fields
    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      eventDate: result.rows[0].event_date,
      locationId: result.rows[0].location_id,
      organizerId: result.rows[0].organizer_id,
      flierUrl: result.rows[0].flier_url,
      rsvpCount: result.rows[0].rsvp_count,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
  }
  
  /**
   * Find event by ID (simple, no joins)
   * @param {string} id - Event UUID
   * @returns {Promise<Object|null>} Event with camelCase fields
   */
  static async findById(id) {
    const query = 'SELECT * FROM events WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      eventDate: row.event_date,
      locationId: row.location_id,
      organizerId: row.organizer_id,
      flierUrl: row.flier_url,
      rsvpCount: row.rsvp_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  /**
   * Find event by ID with location and organizer info (for API responses)
   * @param {string} id - Event UUID
   * @returns {Promise<Object|null>} Event with joined data
   */
  static async findByIdWithDetails(id) {
    const query = `
      SELECT 
        e.*,
        l.address, l.city, l.state, l.zip_code, l.country, l.latitude, l.longitude,
        u.display_name as organizer_name
      FROM events e
      LEFT JOIN locations l ON e.location_id = l.id
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE e.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this._formatEvent(result.rows[0]);
  }
  
  /**
   * Update an event
   * @param {string} id - Event UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated event
   */
  static async update(id, updates) {
    const allowedFields = ['name', 'description', 'event_date', 'flier_url'];
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(snakeKey)) {
        fields.push(`${snakeKey} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }
    
    if (fields.length === 0) {
      return this.findById(id);
    }
    
    values.push(id);
    const query = `
      UPDATE events 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    const row = result.rows[0];
    
    // Return formatted with camelCase fields
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      eventDate: row.event_date,
      locationId: row.location_id,
      organizerId: row.organizer_id,
      flierUrl: row.flier_url,
      rsvpCount: row.rsvp_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  
  /**
   * Delete an event
   * @param {string} id - Event UUID
   * @returns {Promise<boolean>} True if deleted
   */
  static async delete(id) {
    const query = 'DELETE FROM events WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }
  
  /**
   * Find events by organizer
   * @param {string} organizerId - Organizer user UUID
   * @returns {Promise<Array>} List of events
   */
  static async findByOrganizer(organizerId) {
    const query = `
      SELECT 
        e.*,
        l.address, l.city, l.state, l.latitude, l.longitude
      FROM events e
      LEFT JOIN locations l ON e.location_id = l.id
      WHERE e.organizer_id = $1
      ORDER BY e.event_date ASC
    `;
    
    const result = await pool.query(query, [organizerId]);
    return result.rows.map(row => this._formatEvent(row));
  }
  
  /**
   * Format event for API response
   * @private
   */
  static _formatEvent(row) {
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      eventDate: row.event_date,
      location: row.latitude ? {
        id: row.location_id,
        address: row.address,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
        country: row.country,
        coordinates: {
          lat: parseFloat(row.latitude),
          lon: parseFloat(row.longitude)
        }
      } : null,
      flierUrl: row.flier_url,
      organizer: {
        id: row.organizer_id,
        displayName: row.organizer_name
      },
      rsvpCount: row.rsvp_count,
      isPast: row.is_past,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export default Event;
