// Utility functions for handling image URLs

// Get backend base URL (same logic as api.js)
const getBackendUrl = () => {
  const hostname = window.location.hostname;
  
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:3000`;
  }
  
  return 'http://localhost:3000';
};

/**
 * Convert a backend image path to a full URL
 * @param {string} imagePath - Path like "/uploads/123-image.jpg" or full URL
 * @returns {string} - Full URL to the image
 */
export function getImageUrl(imagePath) {
  if (!imagePath) {
    return null;
  }
  
  // If already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Otherwise, prepend backend URL
  const backendUrl = getBackendUrl();
  return `${backendUrl}${imagePath}`;
}
