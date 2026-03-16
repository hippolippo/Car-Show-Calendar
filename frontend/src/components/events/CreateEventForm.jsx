// T062: CreateEventForm component with geocoding
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationInput from '../common/LocationInput';
import { createEvent } from '../../services/eventService';
import { geocodeAddress } from '../../utils/geocoding';
import { uploadImage } from '../../services/uploadService';

export default function CreateEventForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventDate: '',
    flierUrl: null,
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      coordinates: {
        lat: 0,
        lon: 0
      }
    }
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (location) => {
    setFormData(prev => ({
      ...prev,
      location
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, flierUrl: null }));
  };

  const handleFindCoordinates = async () => {
    setError(null);
    setSuccessMessage(null);
    setGeocoding(true);
    
    try {
      // Validate address fields first
      if (!formData.location.address || !formData.location.city || !formData.location.state) {
        throw new Error('Please fill in address, city, and state fields first');
      }
      
      const coordinates = await geocodeAddress(formData.location);
      
      // Round coordinates to 6 decimal places (about 10cm precision)
      const roundedCoordinates = {
        lat: parseFloat(coordinates.lat.toFixed(6)),
        lon: parseFloat(coordinates.lon.toFixed(6))
      };
      
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: roundedCoordinates
        }
      }));
      
      // Show success message briefly
      const successMsg = `✓ Found coordinates: ${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`;
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError(err.message || 'Failed to find coordinates');
    } finally {
      setGeocoding(false);
    }
  };

  const validateForm = () => {
    // Name validation
    if (!formData.name || formData.name.trim().length < 3) {
      return 'Event name must be at least 3 characters';
    }
    if (formData.name.length > 200) {
      return 'Event name must be at most 200 characters';
    }

    // Description validation
    if (!formData.description || formData.description.trim().length < 10) {
      return 'Event description must be at least 10 characters';
    }
    if (formData.description.length > 2000) {
      return 'Event description must be at most 2000 characters';
    }

    // Date validation
    if (!formData.eventDate) {
      return 'Event date is required';
    }
    const eventDate = new Date(formData.eventDate);
    if (eventDate <= new Date()) {
      return 'Event date must be in the future';
    }

    // Location validation
    if (!formData.location.address || formData.location.address.trim().length < 5) {
      return 'Street address must be at least 5 characters';
    }
    if (!formData.location.city || formData.location.city.trim().length < 2) {
      return 'City must be at least 2 characters';
    }
    if (!formData.location.state || formData.location.state.trim().length !== 2) {
      return 'State must be a 2-letter code';
    }
    if (!formData.location.zipCode || !/^\d{5}(-\d{4})?$/.test(formData.location.zipCode)) {
      return 'ZIP code must be valid (e.g., 12345 or 12345-6789)';
    }

    // Coordinates validation
    const { lat, lon } = formData.location.coordinates;
    if (typeof lat !== 'number' || lat < -90 || lat > 90 || lat === 0) {
      return 'Please click "Find Coordinates" to geocode the address';
    }
    if (typeof lon !== 'number' || lon < -180 || lon > 180 || lon === 0) {
      return 'Please click "Find Coordinates" to geocode the address';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Upload image first if provided
      if (imageFile) {
        setUploading(true);
        try {
          const uploadResult = await uploadImage(imageFile);
          formData.flierUrl = uploadResult.url;
        } catch (uploadError) {
          // Check if it's an authentication error
          if (uploadError.message.includes('Authentication') || uploadError.message.includes('401')) {
            throw new Error('Please login again to upload images. Your session may have expired.');
          }
          throw uploadError;
        } finally {
          setUploading(false);
        }
      }

      // Convert datetime-local to proper ISO string with timezone
      // datetime-local gives us "2026-03-15T15:00" (no timezone)
      // We need to preserve the local time the user entered
      const localDateTime = formData.eventDate; // e.g., "2026-03-15T15:00"
      
      // Create a Date object treating the input as local time
      const [datePart, timePart] = localDateTime.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);
      
      // Create date in local timezone
      const localDate = new Date(year, month - 1, day, hour, minute);
      
      const eventDataToSubmit = {
        ...formData,
        eventDate: localDate.toISOString()
      };

      const event = await createEvent(eventDataToSubmit);
      // Navigate to event detail page (will implement this route later)
      navigate(`/events/${event.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-event-form">
      <h2>Create New Event</h2>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">Event Name *</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Spring Car Show 2026"
          required
          minLength="3"
          maxLength="200"
        />
        <span className="char-count">{formData.name.length}/200</span>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Annual spring car show featuring classic cars and hot rods. Free admission, family-friendly event with food trucks and live music."
          required
          minLength="10"
          maxLength="2000"
          rows="6"
        />
        <span className="char-count">{formData.description.length}/2000</span>
      </div>

      <div className="form-group">
        <label htmlFor="eventDate">Event Date & Time *</label>
        <input
          type="datetime-local"
          id="eventDate"
          value={formData.eventDate}
          onChange={(e) => handleChange('eventDate', e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="flierImage">Event Flier / Poster (Optional)</label>
        <p className="help-text">Upload an image of the event flier or poster (Max 5MB, images only)</p>
        
        {!imagePreview ? (
          <div className="file-input-wrapper">
            <input
              type="file"
              id="flierImage"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
            <label htmlFor="flierImage" className="file-input-label">
              📷 Choose Image
            </label>
          </div>
        ) : (
          <div className="image-preview-container">
            <img 
              src={imagePreview} 
              alt="Event flier preview" 
              className="image-preview"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="btn btn-sm btn-danger remove-image-btn"
            >
              ✕ Remove Image
            </button>
          </div>
        )}
        
        {uploading && (
          <p className="upload-status">Uploading image...</p>
        )}
      </div>

      <div className="form-section">
        <h3>Event Location</h3>
        <LocationInput
          value={formData.location}
          onChange={handleLocationChange}
        />
        
        <div className="geocode-section">
          <button
            type="button"
            onClick={handleFindCoordinates}
            className="btn btn-secondary"
            disabled={geocoding}
          >
            {geocoding ? '🔍 Finding...' : '🔍 Find Coordinates from Address'}
          </button>
          <p className="help-text">
            Click this button after entering the address to automatically find the latitude and longitude
          </p>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || uploading}
        >
          {uploading ? 'Uploading Image...' : loading ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </form>
  );
}
