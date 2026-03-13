// T082 & T121: EventCard component - displays event summary with RSVP button
import { Link } from 'react-router-dom';
import RSVPButton from './RSVPButton';
import { getImageUrl } from '../../utils/imageUtils';

export default function EventCard({ event, onRSVPChange }) {
  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className="event-card">
      {/* Event Flier Image */}
      {event.flierUrl ? (
        <div className="event-card-image-wrapper">
          <img 
            src={getImageUrl(event.flierUrl)} 
            alt={`${event.name} flier`}
            className="event-card-image"
          />
        </div>
      ) : (
        <div className="event-card-image-wrapper">
          <div className="event-card-no-image">🚗</div>
        </div>
      )}
      
      <div className="event-card-header">
        <h3>
          <Link to={`/events/${event.id}`}>{event.name}</Link>
        </h3>
        {event.distanceMiles !== undefined && (
          <span className="distance-badge">
            {event.distanceMiles} mi
          </span>
        )}
      </div>

      <div className="event-card-body">
        <div className="event-meta">
          <div className="event-date">
            <span className="icon">📅</span>
            <span>{formattedDate}</span>
          </div>
          <div className="event-time">
            <span className="icon">🕐</span>
            <span>{formattedTime}</span>
          </div>
          <div className="event-location">
            <span className="icon">📍</span>
            <span>{event.location.city}, {event.location.state}</span>
          </div>
          <div className="event-organizer">
            <span className="icon">👤</span>
            <span>{event.organizer.displayName}</span>
          </div>
        </div>

        <p className="event-description">
          {event.description.length > 150
            ? `${event.description.substring(0, 150)}...`
            : event.description}
        </p>

        <div className="event-footer">
          <div className="rsvp-count">
            <span className="icon">✓</span>
            <span>{event.rsvpCount} attending</span>
          </div>
          <div className="event-actions">
            <RSVPButton event={event} onSuccess={onRSVPChange} />
            <Link to={`/events/${event.id}`} className="btn btn-secondary btn-sm">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
