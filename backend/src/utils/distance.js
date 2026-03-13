// T077: Distance calculation utility using geolib
import { getDistance, convertDistance } from 'geolib';

/**
 * Calculate distance between two coordinates in miles
 * @param {Object} from - Starting point {lat, lon}
 * @param {Object} to - Ending point {lat, lon}
 * @returns {number} Distance in miles
 */
export function calculateDistance(from, to) {
  // getDistance returns meters
  const meters = getDistance(
    { latitude: from.lat, longitude: from.lon },
    { latitude: to.lat, longitude: to.lon }
  );
  
  // Convert meters to miles
  const miles = convertDistance(meters, 'mi');
  
  // Round to 1 decimal place
  return Math.round(miles * 10) / 10;
}

/**
 * Check if a location is within a radius
 * @param {Object} center - Center point {lat, lon}
 * @param {Object} point - Point to check {lat, lon}
 * @param {number} radiusMeters - Radius in meters
 * @returns {boolean} True if within radius
 */
export function isWithinRadius(center, point, radiusMeters) {
  const meters = getDistance(
    { latitude: center.lat, longitude: center.lon },
    { latitude: point.lat, longitude: point.lon }
  );
  
  return meters <= radiusMeters;
}

/**
 * Convert miles to meters
 * @param {number} miles - Distance in miles
 * @returns {number} Distance in meters
 */
export function milesToMeters(miles) {
  return miles * 1609.34;
}

/**
 * Convert meters to miles
 * @param {number} meters - Distance in meters
 * @returns {number} Distance in miles
 */
export function metersToMiles(meters) {
  return convertDistance(meters, 'mi');
}
