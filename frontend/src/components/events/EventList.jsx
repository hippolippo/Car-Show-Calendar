// T083: EventList component - renders event cards
import EventCard from './EventCard';

export default function EventList({ events, loading, error, onRSVPChange }) {
  if (loading) {
    return (
      <div className="event-list-loading">
        <p>Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="event-list-empty">
        <p>No events found in your area.</p>
        <p>Try adjusting your location or check back later!</p>
      </div>
    );
  }

  return (
    <div className="event-list">
      <div className="event-count">
        Found {events.length} event{events.length !== 1 ? 's' : ''}
      </div>
      <div className="event-grid">
        {events.map(event => (
          <EventCard key={event.id} event={event} onRSVPChange={onRSVPChange} />
        ))}
      </div>
    </div>
  );
}
