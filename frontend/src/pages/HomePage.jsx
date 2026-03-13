// T085 & T102 & T105: HomePage - location input, sorting, and event list with URL query params
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EventList from '../components/events/EventList';
import SortControls from '../components/common/SortControls';
import useAppStore from '../store/appStore';
import useGeolocation from '../hooks/useGeolocation';
import { getEvents } from '../services/eventService';
import { geocodeZipCode } from '../utils/geocoding';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userLocation, setUserLocation, user, sortBy, setSortBy } = useAppStore();
  const { location: geoLocation, loading: geoLoading, error: geoError, getLocation } = useGeolocation();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchLocation, setSearchLocation] = useState(
    userLocation || { lat: 38.9072, lon: -77.0369 } // Default to Washington, DC
  );
  const [locationName, setLocationName] = useState('Washington, DC'); // Display name for location
  const [zipCode, setZipCode] = useState(''); // ZIP code input
  const [zipSearching, setZipSearching] = useState(false);
  const [radiusMiles, setRadiusMiles] = useState(25); // Default 25 miles
  const [unlimitedDistance, setUnlimitedDistance] = useState(false);

  // Initialize sort from URL query params on mount
  useEffect(() => {
    const sortFromUrl = searchParams.get('sort');
    if (sortFromUrl && ['distance', 'date', 'popularity'].includes(sortFromUrl)) {
      setSortBy(sortFromUrl);
    }
  }, []);

  // Fetch events when location, sort, or radius changes
  useEffect(() => {
    if (searchLocation) {
      fetchEvents();
    }
  }, [searchLocation, sortBy, radiusMiles, unlimitedDistance]);

  // Update search location when geolocation is obtained
  useEffect(() => {
    if (geoLocation) {
      setSearchLocation(geoLocation);
      setUserLocation(geoLocation);
      setLocationName('Your Location');
    }
  }, [geoLocation, setUserLocation]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        lat: searchLocation.lat,
        lon: searchLocation.lon,
        sortBy: sortBy,
        limit: unlimitedDistance ? 100 : 50
      };
      
      // Only add radius if not unlimited
      if (!unlimitedDistance) {
        params.radius = Math.round(radiusMiles * 1609.34); // Convert miles to meters
      }
      
      const result = await getEvents(params);
      
      setEvents(result.events);
    } catch (err) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    // Update URL query params to reflect sort state
    setSearchParams({ sort: newSortBy });
  };

  const handleUseMyLocation = () => {
    getLocation();
  };

  const handleZipCodeSearch = async () => {
    if (!zipCode || zipCode.trim().length < 5) {
      setError('Please enter a valid ZIP code');
      return;
    }

    setZipSearching(true);
    setError(null);

    try {
      const result = await geocodeZipCode(zipCode.trim());
      setSearchLocation({ lat: result.lat, lon: result.lon });
      setUserLocation({ lat: result.lat, lon: result.lon });
      
      // Build location name, hiding "Unknown" city
      let locationParts = [];
      if (result.city && result.city !== 'Unknown') {
        locationParts.push(result.city);
      }
      if (result.state) {
        locationParts.push(result.state);
      }
      locationParts.push(zipCode.trim());
      
      setLocationName(locationParts.join(', '));
      setZipCode(''); // Clear input after successful search
    } catch (err) {
      setError(err.message || 'Failed to find ZIP code');
    } finally {
      setZipSearching(false);
    }
  };

  const handleZipCodeKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleZipCodeSearch();
    }
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>🚗 Discover Car Shows Near You</h1>
        <p>Find and RSVP to car shows and meets in your area</p>
      </div>

      <div className="location-search">
        <h2>Search Location</h2>
        
        <div className="current-location">
          <span className="location-label">Currently searching near:</span>
          <span className="location-value">{locationName}</span>
        </div>
        
        <div className="location-controls">
          <div className="zip-input-group">
            <div className="form-group">
              <label htmlFor="zipCode">Enter ZIP Code</label>
              <input
                type="text"
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                onKeyPress={handleZipCodeKeyPress}
                placeholder="28202"
                maxLength="10"
                className="zip-input"
              />
            </div>
            
            <button
              onClick={handleZipCodeSearch}
              disabled={zipSearching}
              className="btn btn-primary"
            >
              {zipSearching ? '🔍 Searching...' : '🔍 Search ZIP'}
            </button>
          </div>
          
          <div className="or-divider">
            <span>OR</span>
          </div>
          
          <button
            onClick={handleUseMyLocation}
            disabled={geoLoading}
            className="btn btn-secondary"
          >
            {geoLoading ? 'Getting location...' : '📍 Use My Location'}
          </button>
        </div>
        
        {(geoError || error) && (
          <div className="alert alert-error">
            {geoError || error}
          </div>
        )}
        
        <p className="help-text">
          Enter a ZIP code or use your current location to find car shows nearby
        </p>
        
        <div className="radius-control">
          <div className="radius-header">
            <label htmlFor="radius">
              Search Radius: <strong>{unlimitedDistance ? 'Unlimited' : `${radiusMiles} miles`}</strong>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={unlimitedDistance}
                onChange={(e) => setUnlimitedDistance(e.target.checked)}
              />
              Show all events (any distance)
            </label>
          </div>
          {!unlimitedDistance && (
            <>
              <input
                type="range"
                id="radius"
                min="10"
                max="250"
                step="5"
                value={radiusMiles}
                onChange={(e) => setRadiusMiles(parseInt(e.target.value))}
                className="radius-slider"
              />
              <div className="radius-labels">
                <span>10 mi</span>
                <span>130 mi</span>
                <span>250 mi</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="events-section">
        <div className="section-header">
          <h2>Upcoming Events</h2>
          <div className="header-actions">
            <SortControls value={sortBy} onChange={handleSortChange} />
            {user && (
              <Link to="/events/create" className="btn btn-primary">
                + Create Event
              </Link>
            )}
          </div>
        </div>
        
        <EventList
          events={events}
          loading={loading}
          error={error}
          onRSVPChange={fetchEvents}
        />
      </div>
    </div>
  );
}
