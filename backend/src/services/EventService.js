import { Event } from '../models/Event.js';
import { Location } from '../models/Location.js';
import pool from '../config/database.js';
import { calculateDistance, milesToMeters } from '../utils/distance.js';

export class EventService {
  /**
   * Validate event data
   * @private
   */
  static validateEventData(data, isUpdate = false) {
    const errors = [];

    // Validate name
    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim().length < 3) {
        errors.push('Event name must be at least 3 characters');
      }
      if (data.name.length > 200) {
        errors.push('Event name must be at most 200 characters');
      }
    } else if (!isUpdate) {
      errors.push('Event name is required');
    }

    // Validate description
    if (data.description !== undefined) {
      if (typeof data.description !== 'string' || data.description.trim().length < 10) {
        errors.push('Event description must be at least 10 characters');
      }
      if (data.description.length > 2000) {
        errors.push('Event description must be at most 2000 characters');
      }
    } else if (!isUpdate) {
      errors.push('Event description is required');
    }

    // Validate eventDate
    if (data.eventDate !== undefined) {
      const eventDate = new Date(data.eventDate);
      if (isNaN(eventDate.getTime())) {
        errors.push('Invalid event date');
      } else if (!isUpdate && eventDate <= new Date()) {
        // Only enforce future date for new events, not updates
        errors.push('Event date must be in the future');
      }
    } else if (!isUpdate) {
      errors.push('Event date is required');
    }

    // Validate location (only for create)
    if (!isUpdate && data.location) {
      const { location } = data;
      
      if (!location.address || location.address.trim().length < 5) {
        errors.push('Location address must be at least 5 characters');
      }
      if (!location.city || location.city.trim().length < 2) {
        errors.push('Location city must be at least 2 characters');
      }
      if (!location.state || location.state.trim().length !== 2) {
        errors.push('Location state must be a 2-letter code');
      }
      if (!location.zipCode || !/^\d{5}(-\d{4})?$/.test(location.zipCode)) {
        errors.push('Location zip code must be valid (e.g., 12345 or 12345-6789)');
      }
      if (!location.country || location.country.trim().length < 2) {
        errors.push('Location country is required');
      }

      // Validate coordinates
      if (location.coordinates) {
        const { lat, lon } = location.coordinates;
        if (typeof lat !== 'number' || lat < -90 || lat > 90) {
          errors.push('Latitude must be between -90 and 90');
        }
        if (typeof lon !== 'number' || lon < -180 || lon > 180) {
          errors.push('Longitude must be between -180 and 180');
        }
      } else {
        errors.push('Location coordinates are required');
      }
    } else if (!isUpdate && !data.location) {
      errors.push('Location is required');
    }

    if (errors.length > 0) {
      const error = new Error(errors[0]);
      error.validationErrors = errors;
      throw error;
    }
  }

  /**
   * Create a new event with location
   * @param {string} userId - ID of the user creating the event
   * @param {Object} eventData - Event data including location
   * @returns {Promise<Object>} Created event
   */
  static async createEvent(userId, eventData) {
    // Validate input
    this.validateEventData(eventData);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create location first
      const location = await Location.create(eventData.location, client);

      // Create event
      const event = await Event.create({
        name: eventData.name,
        description: eventData.description,
        eventDate: eventData.eventDate,
        organizerId: userId,
        locationId: location.id,
        flierUrl: eventData.flierUrl || null
      }, client);

      await client.query('COMMIT');
      return event;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update an event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID (must be organizer)
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated event
   */
  static async updateEvent(eventId, userId, updates) {
    // Validate updates
    if (Object.keys(updates).length > 0) {
      this.validateEventData(updates, true);
    }

    // Check if event exists and user is organizer
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new Error('Only the event organizer can update this event');
    }

    // Update event
    const updatedEvent = await Event.update(eventId, updates);
    return updatedEvent;
  }

  /**
   * Delete an event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID (must be organizer)
   * @returns {Promise<void>}
   */
  static async deleteEvent(eventId, userId) {
    // Check if event exists and user is organizer
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new Error('Only the event organizer can delete this event');
    }

    // Delete event (cascade will handle RSVPs)
    await Event.delete(eventId);
  }

  /**
   * Get event by ID with full details (location, organizer, attendees)
   * @param {string} eventId - Event ID
   * @param {string} userId - Optional user ID to check RSVP/follow status
   * @returns {Promise<Object|null>} Event with full details or null
   */
  static async getEventById(eventId, userId = null) {
    const query = `
      SELECT 
        e.*,
        l.address, l.city, l.state, l.zip_code, l.country, l.latitude, l.longitude,
        u.display_name as organizer_name,
        u.id as organizer_id
      FROM events e
      LEFT JOIN locations l ON e.location_id = l.id
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE e.id = $1
    `;

    const result = await pool.query(query, [eventId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const event = this._formatEventRow(result.rows[0]);

    // Get attendees (users who RSVP'd)
    const attendeesQuery = `
      SELECT 
        u.id,
        u.display_name,
        r.created_at as rsvp_date
      FROM rsvps r
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = $1
      ORDER BY r.created_at DESC
    `;
    
    const attendeesResult = await pool.query(attendeesQuery, [eventId]);
    event.attendees = attendeesResult.rows.map(row => ({
      id: row.id,
      displayName: row.display_name,
      rsvpDate: row.rsvp_date
    }));

    // Get follower count for organizer (placeholder for now - will be implemented in User Story 4)
    event.organizer.followerCount = 0;

    // Check if user has RSVP'd (if userId provided)
    event.userHasRsvped = false;
    if (userId) {
      const rsvpQuery = `SELECT 1 FROM rsvps WHERE event_id = $1 AND user_id = $2`;
      const rsvpResult = await pool.query(rsvpQuery, [eventId, userId]);
      event.userHasRsvped = rsvpResult.rows.length > 0;
    }

    // Check if user follows organizer (placeholder for User Story 4)
    event.userFollowsOrganizer = false;

    return event;
  }

  /**
   * List events with filtering and sorting (T078)
   * @param {Object} params - Query parameters
   * @param {number} params.lat - User latitude (required for distance sorting)
   * @param {number} params.lon - User longitude (required for distance sorting)
   * @param {number} params.radius - Search radius in meters (optional, omit for unlimited)
   * @param {string} params.sortBy - Sort field: distance, date, popularity (default: distance)
   * @param {boolean} params.includePast - Include past events (default: false)
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Results per page (default: 50, max: 100)
   * @returns {Promise<Object>} Events list with pagination
   */
  static async listEvents(params = {}) {
    const {
      lat,
      lon,
      radius, // No default - undefined means unlimited
      sortBy = 'distance',
      includePast = false,
      page = 1,
      limit = Math.min(params.limit || 50, 100)
    } = params;

    // Validate sorting by distance requires coordinates
    if (sortBy === 'distance' && (!lat || !lon)) {
      throw new Error('Latitude and longitude are required for distance sorting');
    }

    const offset = (page - 1) * limit;

    // Build query
    let query = `
      SELECT 
        e.*,
        l.address, l.city, l.state, l.zip_code, l.country, l.latitude, l.longitude,
        u.display_name as organizer_name
      FROM events e
      LEFT JOIN locations l ON e.location_id = l.id
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Filter past events
    if (!includePast) {
      query += ` AND e.event_date > NOW()`;
    }

    // If sorting by distance, filter by radius
    if (sortBy === 'distance' && lat && lon) {
      // For MVP, we'll fetch all events and filter in-memory
      // In production with PostGIS, this would use ST_Distance
    }

    // Add sorting
    if (sortBy === 'date') {
      query += ` ORDER BY e.event_date ASC`;
    } else if (sortBy === 'popularity') {
      query += ` ORDER BY e.rsvp_count DESC, e.event_date ASC`;
    } else {
      // Distance sorting will be done in-memory
      query += ` ORDER BY e.event_date ASC`;
    }

    // Add pagination
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(limit, offset);

    // Execute query
    const result = await pool.query(query, queryParams);
    let events = result.rows.map(row => this._formatEventRow(row));

    // Calculate distances and filter by radius if needed
    if (lat && lon) {
      const userLocation = { lat: parseFloat(lat), lon: parseFloat(lon) };
      
      events = events.map(event => ({
        ...event,
        distanceMiles: calculateDistance(userLocation, event.location.coordinates)
      }));

      // Filter by radius only if radius is provided (not undefined/null)
      if (radius !== undefined && radius !== null) {
        const radiusMiles = radius / 1609.34; // Convert meters to miles
        events = events.filter(event => event.distanceMiles <= radiusMiles);
      }

      // Sort by distance if requested
      if (sortBy === 'distance') {
        events.sort((a, b) => a.distanceMiles - b.distanceMiles);
      }
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM events e
      WHERE e.event_date > NOW()
    `;
    const countResult = await pool.query(countQuery);
    const total = parseInt(countResult.rows[0].total);

    return {
      events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Format event row from database
   * @private
   */
  static _formatEventRow(row) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      eventDate: row.event_date,
      location: {
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
      },
      flierUrl: row.flier_url,
      organizer: {
        id: row.organizer_id,
        displayName: row.organizer_name
      },
      rsvpCount: row.rsvp_count || 0,
      isPast: new Date(row.event_date) < new Date(),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
