// T029: API client service (fetch wrapper with auth)
// Version 3.0 - Fixed for mobile

// Dynamically determine API URL based on current host
// This allows the app to work on localhost and on local network
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If accessed via network IP, use the same IP for API
  const hostname = window.location.hostname;
  
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const apiUrl = `http://${hostname}:3000/api/v1`;
    console.log('🌐 API URL:', apiUrl);
    return apiUrl;
  }
  
  return 'http://localhost:3000/api/v1';
};

/**
 * Base fetch wrapper with error handling and auth
 */
async function apiRequest(endpoint, options = {}) {
  // Get API URL dynamically on each request
  const API_URL = getApiUrl();
  const url = `${API_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for auth
  };
  
  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return null;
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      const error = new Error(data.error?.message || 'Request failed');
      error.status = response.status;
      error.code = data.error?.code;
      error.details = data.error?.details;
      throw error;
    }
    
    return data;
  } catch (error) {
    // Network error or JSON parsing error
    if (!error.status) {
      const API_URL = getApiUrl();
      console.error('❌ API Error:', error.message);
      console.error('Failed URL:', url);
      error.message = `Network error. Please check your connection.`;
    }
    throw error;
  }
}

/**
 * HTTP methods
 */
export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, body, options = {}) => apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  }),
  
  put: (endpoint, body, options = {}) => apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
