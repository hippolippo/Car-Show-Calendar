// T067: Event service for API integration
import api from './api';

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @returns {Promise<Object>} Created event
 */
export async function createEvent(eventData) {
  const response = await api.post('/events', eventData);
  return response;
}

/**
 * Get event by ID
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} Event details
 */
export async function getEventById(eventId) {
  const response = await api.get(`/events/${eventId}`);
  return response;
}

/**
 * Update an event
 * @param {string} eventId - Event ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated event
 */
export async function updateEvent(eventId, updates) {
  const response = await api.put(`/events/${eventId}`, updates);
  return response;
}

/**
 * Delete an event
 * @param {string} eventId - Event ID
 * @returns {Promise<void>}
 */
export async function deleteEvent(eventId) {
  await api.delete(`/events/${eventId}`);
}

/**
 * Get list of events (for discovery)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Events list with pagination
 */
export async function getEvents(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/events?${queryString}`);
  return response;
}
