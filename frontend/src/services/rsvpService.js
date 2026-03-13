// T124: RSVP service for API integration
import api from './api';

/**
 * Create an RSVP for an event
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} Created RSVP
 */
export async function createRSVP(eventId) {
  const response = await api.post('/rsvps', { eventId });
  return response;
}

/**
 * Cancel an RSVP
 * @param {string} eventId - Event ID
 * @returns {Promise<void>}
 */
export async function cancelRSVP(eventId) {
  await api.delete(`/rsvps/${eventId}`);
}

/**
 * Get current user's RSVPs
 * @returns {Promise<Array>} List of user's RSVPs
 */
export async function getMyRSVPs() {
  const response = await api.get('/rsvps/me');
  return response.rsvps;
}
