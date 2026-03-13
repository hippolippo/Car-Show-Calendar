// T026: Validation middleware
import { AppError } from './errorHandler.js';

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(lat, lon) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  return !isNaN(latitude) && !isNaN(longitude) && 
         latitude >= -90 && latitude <= 90 && 
         longitude >= -180 && longitude <= 180;
}

/**
 * Validate date is in the future
 */
export function isValidFutureDate(dateString) {
  const date = new Date(dateString);
  return date > new Date();
}

/**
 * Middleware to validate request body fields
 */
export function validateFields(requiredFields, optionalFields = []) {
  return (req, res, next) => {
    const errors = [];
    const allFields = [...requiredFields, ...optionalFields];
    
    // Check required fields
    for (const field of requiredFields) {
      if (!req.body[field]) {
        errors.push({
          field,
          message: `${field} is required`
        });
      }
    }
    
    // Check for unknown fields
    for (const key of Object.keys(req.body)) {
      if (!allFields.includes(key)) {
        errors.push({
          field: key,
          message: `${key} is not a valid field`
        });
      }
    }
    
    if (errors.length > 0) {
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors);
    }
    
    next();
  };
}

/**
 * Validate user registration data
 */
export function validateRegistration(req, res, next) {
  const { email, password, displayName } = req.body;
  const errors = [];
  
  if (!email || !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  
  if (!password || password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }
  
  if (!displayName || displayName.length < 2 || displayName.length > 100) {
    errors.push({ field: 'displayName', message: 'Display name must be 2-100 characters' });
  }
  
  if (errors.length > 0) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors);
  }
  
  next();
}

/**
 * Validate event creation data
 */
export function validateEvent(req, res, next) {
  const { name, description, eventDate, location } = req.body;
  const errors = [];
  
  if (!name || name.length < 5 || name.length > 200) {
    errors.push({ field: 'name', message: 'Event name must be 5-200 characters' });
  }
  
  if (!description || description.length < 20 || description.length > 5000) {
    errors.push({ field: 'description', message: 'Description must be 20-5000 characters' });
  }
  
  if (!eventDate || !isValidFutureDate(eventDate)) {
    errors.push({ field: 'eventDate', message: 'Event date must be in the future' });
  }
  
  if (!location || !location.coordinates) {
    errors.push({ field: 'location', message: 'Location with coordinates is required' });
  } else {
    const { lat, lon } = location.coordinates;
    if (!isValidCoordinates(lat, lon)) {
      errors.push({ field: 'location.coordinates', message: 'Invalid coordinates' });
    }
  }
  
  if (errors.length > 0) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors);
  }
  
  next();
}

/**
 * Validate query parameters for event listing
 */
export function validateEventQuery(req, res, next) {
  const { sortBy, lat, lon } = req.query;
  const errors = [];
  
  // If sorting by distance, lat/lon are required
  if (sortBy === 'distance' || sortBy === 'weighted') {
    if (!lat || !lon) {
      errors.push({ field: 'lat/lon', message: 'Latitude and longitude required for distance sorting' });
    } else if (!isValidCoordinates(lat, lon)) {
      errors.push({ field: 'lat/lon', message: 'Invalid coordinates' });
    }
  }
  
  // Validate sortBy values
  const validSortOptions = ['distance', 'date', 'popularity', 'reputation', 'weighted'];
  if (sortBy && !validSortOptions.includes(sortBy)) {
    errors.push({ field: 'sortBy', message: `sortBy must be one of: ${validSortOptions.join(', ')}` });
  }
  
  if (errors.length > 0) {
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors);
  }
  
  next();
}

export default {
  validateFields,
  validateRegistration,
  validateEvent,
  validateEventQuery,
  isValidEmail,
  isValidUUID,
  isValidCoordinates,
  isValidFutureDate
};
