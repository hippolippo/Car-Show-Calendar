// Upload service for handling image uploads

// Get API URL (same logic as api.js)
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const hostname = window.location.hostname;
  
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:3000/api/v1`;
  }
  
  return 'http://localhost:3000/api/v1';
};

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const API_URL = getApiUrl();
  const url = `${API_URL}/upload/image`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'include' // Include cookies for auth
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to upload image');
  }

  const data = await response.json();
  return data;
}
