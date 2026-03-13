// EditEventPage - Edit existing event
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEventById, updateEvent } from '../services/eventService';
import { geocodeAddress } from '../utils/geocoding';
import LocationInput from '../components/common/LocationInput';
import useAppStore from '../store/appStore';

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAppStore();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventDate: '',
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

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const event = await getEventById(id);
      
      // Check if user is the organizer
      if (!user || event.organizer.id !== user.id) {
        setError('You can only edit your own events');
        return;
      }
      
      // Convert eventDate to datetime-local format
      const eventDate = new Date(event.eventDate);
      const localDate = new Date(eventDate.getTime() - eventDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      
      setFormData({
        name: event.name,
        description: event.description,
        eventDate: localDate,
        location: event.location
      });
    } catch (err) {
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

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

  const handleFindCoordinates = async () => {
    setError(null);
    setSuccessMessage(null);
    setGeocoding(true);
    
    try {
      if (!formData.location.address || !formData.location.city || !formData.location.state) {
        throw new Error('Please fill in address, city, and state fields first');
      }
      
      const coordinates = await geocodeAddress(formData.location);
      
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates
        }
      }));
      
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
    if (!formData.name || formData.name.trim().length < 3) {
      return 'Event name must be at least 3 characters';
    }
    if (formData.name.length > 200) {
      return 'Event name must be at most 200 characters';
    }
    if (!formData.description || formData.description.trim().length < 10) {
      return 'Event description must be at least 10 characters';
    }
    if (formData.description.length > 2000) {
      return 'Event description must be at most 2000 characters';
    }
    if (!formData.eventDate) {
      return 'Event date is required';
    }
    
    // Note: We allow updating past event dates since the event might already be in the past
    // The backend will handle this validation
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      // Only send fields that can be updated (not location for now in MVP)
      const updates = {
        name: formData.name,
        description: formData.description,
        eventDate: formData.eventDate
      };
      
      await updateEvent(id, updates);
      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading event...</div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
        <Link to="/" className="btn btn-secondary">← Back to Events</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <form onSubmit={handleSubmit} className="create-event-form">
        <h2>Edit Event</h2>

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
            placeholder="Annual spring car show featuring classic cars and hot rods."
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

        <div className="form-section">
          <h3>Event Location</h3>
          <p className="help-text" style={{ marginBottom: '1rem' }}>
            Note: Location cannot be changed after event creation in the MVP. 
            If you need to change the location, please delete this event and create a new one.
          </p>
          <LocationInput
            value={formData.location}
            onChange={handleLocationChange}
            disabled={true}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(`/events/${id}`)}
            className="btn btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
