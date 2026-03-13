// T114: RSVPService - handles RSVP operations with transaction handling
import { RSVP } from '../models/RSVP.js';
import { Event } from '../models/Event.js';
import pool from '../config/database.js';

export class RSVPService {
  /**
   * Create an RSVP for an event
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Created RSVP
   */
  static async createRSVP(userId, eventId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if event exists
      const event = await Event.findById(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Check if event is in the past
      if (new Date(event.eventDate) < new Date()) {
        throw new Error('Cannot RSVP to past events');
      }

      // Check if user already RSVP'd
      const existingRsvp = await RSVP.findByUserAndEvent(userId, eventId);
      if (existingRsvp) {
        throw new Error('Already RSVP\'d to this event');
      }

      // Create RSVP (database trigger will automatically increment rsvp_count)
      const rsvp = await RSVP.create(userId, eventId, client);

      await client.query('COMMIT');
      return rsvp;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Cancel an RSVP
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   * @returns {Promise<void>}
   */
  static async cancelRSVP(userId, eventId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if RSVP exists
      const rsvp = await RSVP.findByUserAndEvent(userId, eventId);
      if (!rsvp) {
        throw new Error('RSVP not found');
      }

      // Delete RSVP (database trigger will automatically decrement rsvp_count)
      await RSVP.delete(userId, eventId, client);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all RSVPs for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of user's RSVPs
   */
  static async getUserRSVPs(userId) {
    return await RSVP.findByUser(userId);
  }

  /**
   * Get all RSVPs for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} List of event's RSVPs
   */
  static async getEventRSVPs(eventId) {
    return await RSVP.findByEvent(eventId);
  }

  /**
   * Check if user has RSVP'd to event
   * @param {string} userId - User ID
   * @param {string} eventId - Event ID
   * @returns {Promise<boolean>} True if user has RSVP'd
   */
  static async hasUserRsvped(userId, eventId) {
    return await RSVP.hasRsvped(userId, eventId);
  }
}

export default RSVPService;
