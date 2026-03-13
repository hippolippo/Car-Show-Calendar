// T061: LocationInput component for address input and coordinates
import { useState } from 'react';

export default function LocationInput({ value, onChange, error, disabled = false }) {
  const [showCoordinates, setShowCoordinates] = useState(false);

  const handleAddressChange = (field, fieldValue) => {
    onChange({
      ...value,
      [field]: fieldValue
    });
  };

  const handleCoordinateChange = (coord, coordValue) => {
    onChange({
      ...value,
      coordinates: {
        ...value.coordinates,
        [coord]: parseFloat(coordValue) || 0
      }
    });
  };

  return (
    <div className="location-input">
      <div className="form-group">
        <label htmlFor="address">Street Address *</label>
        <input
          type="text"
          id="address"
          value={value.address || ''}
          onChange={(e) => handleAddressChange('address', e.target.value)}
          placeholder="123 Main St"
          required
          disabled={disabled}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            value={value.city || ''}
            onChange={(e) => handleAddressChange('city', e.target.value)}
            placeholder="Charlotte"
            required
            disabled={disabled}
          />
        </div>

        <div className="form-group">
          <label htmlFor="state">State *</label>
          <input
            type="text"
            id="state"
            value={value.state || ''}
            onChange={(e) => handleAddressChange('state', e.target.value)}
            placeholder="NC"
            maxLength="2"
            required
            disabled={disabled}
          />
        </div>

        <div className="form-group">
          <label htmlFor="zipCode">ZIP Code *</label>
          <input
            type="text"
            id="zipCode"
            value={value.zipCode || ''}
            onChange={(e) => handleAddressChange('zipCode', e.target.value)}
            placeholder="28202"
            pattern="[0-9]{5}"
            required
            disabled={disabled}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="country">Country</label>
        <input
          type="text"
          id="country"
          value={value.country || 'USA'}
          onChange={(e) => handleAddressChange('country', e.target.value)}
          placeholder="USA"
          disabled={disabled}
        />
      </div>

      <div className="coordinates-section">
        <button
          type="button"
          onClick={() => setShowCoordinates(!showCoordinates)}
          className="toggle-coordinates"
        >
          {showCoordinates ? '− Hide' : '+ Show'} Coordinates
        </button>

        {showCoordinates && (
          <div className="coordinates-input">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitude *</label>
                <input
                  type="number"
                  id="latitude"
                  step="0.000001"
                  min="-90"
                  max="90"
                  value={value.coordinates?.lat || ''}
                  onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                  placeholder="35.2271"
                  required
                  disabled={disabled}
                />
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Longitude *</label>
                <input
                  type="number"
                  id="longitude"
                  step="0.000001"
                  min="-180"
                  max="180"
                  value={value.coordinates?.lon || ''}
                  onChange={(e) => handleCoordinateChange('lon', e.target.value)}
                  placeholder="-80.8431"
                  required
                  disabled={disabled}
                />
              </div>
            </div>
            <p className="help-text">
              You can find coordinates by searching the address on Google Maps and right-clicking the location.
            </p>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
