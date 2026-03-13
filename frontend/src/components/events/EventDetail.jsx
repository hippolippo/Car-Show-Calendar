// T084: EventDetail component - displays full event information
import { formatDistance } from 'date-fns';
import RSVPButton from './RSVPButton';
import { getImageUrl } from '../../utils/imageUtils';

export default function EventDetail({ event, onRSVPChange }) {
  if (!event) {
    return null;
  }

  const eventDate = new Date(event.eventDate);
  const isPast = new Date() > eventDate;

  return (
    <div className="event-detail">
      {/* Event Header */}
      <div className="event-detail-header">
        <h1>{event.name}</h1>
        <div className="event-meta">
          <span className="event-date">
            📅 {eventDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </span>
          {isPast && <span className="badge badge-past">Past Event</span>}
        </div>
      </div>

      {/* Event Flier */}
      {event.flierUrl && (
        <div className="event-detail-image-wrapper">
          <img 
            src={getImageUrl(event.flierUrl)} 
            alt={`${event.name} flier`} 
            className="event-detail-image"
          />
        </div>
      )}

      {/* Event Description */}
      <div className="event-section">
        <h2>About This Event</h2>
        <p className="event-description">{event.description}</p>
      </div>

      {/* Location */}
      <div className="event-section">
        <h2>📍 Location</h2>
        <div className="event-location">
          <p>
            {event.location.address}<br />
            {event.location.city}, {event.location.state} {event.location.zipCode}
          </p>
          {event.location.coordinates && event.location.coordinates.lat && event.location.coordinates.lon && (
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${event.location.coordinates.lat},${event.location.coordinates.lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm maps-link"
            >
              🗺️ Open in Google Maps
            </a>
          )}
          {event.distance && (
            <p className="distance-info">
              🚗 {(event.distance / 1609.34).toFixed(1)} miles away
            </p>
          )}
        </div>
      </div>

      {/* Organizer */}
      {event.organizer && (
        <div className="event-section">
          <h2>👤 Organizer</h2>
          <div className="organizer-info">
            <p className="organizer-name">{event.organizer.displayName}</p>
            {event.organizer.followerCount !== undefined && (
              <p className="organizer-followers">
                {event.organizer.followerCount} follower{event.organizer.followerCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* RSVP Section */}
      <div className="event-section">
        <h2>🎟️ Attendance</h2>
        <div className="rsvp-section">
          <p className="rsvp-count">
            {event.rsvpCount} {event.rsvpCount === 1 ? 'person is' : 'people are'} going
          </p>
          <RSVPButton event={event} onSuccess={onRSVPChange} />
        </div>
      </div>

      {/* Attendees */}
      {event.attendees && event.attendees.length > 0 && (
        <div className="event-section">
          <h2>Attendees</h2>
          <div className="attendees-list">
            {event.attendees.slice(0, 10).map(attendee => (
              <div key={attendee.id} className="attendee-item">
                <span className="attendee-name">{attendee.displayName}</span>
                <span className="attendee-rsvp-date">
                  RSVP'd {formatDistance(new Date(attendee.rsvpDate), new Date(), { addSuffix: true })}
                </span>
              </div>
            ))}
            {event.attendees.length > 10 && (
              <p className="attendees-more">
                And {event.attendees.length - 10} more...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Event Metadata */}
      <div className="event-section event-metadata">
        <p className="text-muted">
          Created {formatDistance(new Date(event.createdAt), new Date(), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
