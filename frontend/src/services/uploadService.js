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

  console.log('📤 Uploading to:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include' // Include cookies for auth
    });

    console.log('Upload response status:', response.status);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorMessage = 'Failed to upload image';
      
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        errorMessage = error.error?.message || errorMessage;
        console.error('Upload error response:', error);
      } else {
        const text = await response.text();
        console.error('Upload error (non-JSON):', text);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Upload successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}
