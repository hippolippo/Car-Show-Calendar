// Geocoding utilities using Nominatim (OpenStreetMap)

/**
 * Geocode an address to coordinates
 * @param {Object} address - Address object
 * @param {string} address.address - Street address
 * @param {string} address.city - City
 * @param {string} address.state - State
 * @param {string} address.zipCode - ZIP code
 * @param {string} address.country - Country
 * @returns {Promise<Object>} Coordinates { lat, lon }
 */
export async function geocodeAddress(address) {
  const { address: street, city, state, zipCode, country } = address;
  
  // Build query string for Nominatim
  const query = `${street}, ${city}, ${state} ${zipCode}, ${country}`;
  const encodedQuery = encodeURIComponent(query);
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1`,
      {
        headers: {
          'User-Agent': 'CarCalendar/1.0' // Nominatim requires User-Agent
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('Address not found. Please check the address and try again.');
    }
    
    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon)
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error(error.message || 'Failed to geocode address');
  }
}

/**
 * Geocode a ZIP code to coordinates
 * @param {string} zipCode - US ZIP code
 * @param {string} country - Country code (default: 'USA')
 * @returns {Promise<Object>} Coordinates { lat, lon } and location info
 */
export async function geocodeZipCode(zipCode, country = 'USA') {
  try {
    const query = `${zipCode}, ${country}`;
    const encodedQuery = encodeURIComponent(query);
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CarCalendar/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('ZIP code not found. Please check the ZIP code and try again.');
    }
    
    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      city: result.address?.city || result.address?.town || result.address?.village || '',
      state: result.address?.state || '',
      displayName: result.display_name
    };
  } catch (error) {
    console.error('ZIP code geocoding error:', error);
    throw new Error(error.message || 'Failed to geocode ZIP code');
  }
}

/**
 * Reverse geocode coordinates to an address
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Address object
 */
export async function reverseGeocode(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'CarCalendar/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding service unavailable');
    }
    
    const data = await response.json();
    
    if (!data.address) {
      throw new Error('No address found for these coordinates');
    }
    
    const addr = data.address;
    return {
      address: addr.road || addr.street || '',
      city: addr.city || addr.town || addr.village || '',
      state: addr.state || '',
      zipCode: addr.postcode || '',
      country: addr.country || 'USA'
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw new Error(error.message || 'Failed to reverse geocode coordinates');
  }
}
