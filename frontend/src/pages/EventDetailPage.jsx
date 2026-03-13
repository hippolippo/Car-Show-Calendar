// T086: EventDetailPage - full event view with RSVP integration
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import EventDetail from '../components/events/EventDetail';
import { getEventById, deleteEvent } from '../services/eventService';
import useAppStore from '../store/appStore';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAppStore();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getEventById(id);
      setEvent(data);
    } catch (err) {
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteEvent(id);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to delete event');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading event...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
        <Link to="/" className="btn btn-secondary">← Back to Events</Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-container">
        <div className="alert alert-error">Event not found</div>
        <Link to="/" className="btn btn-secondary">← Back to Events</Link>
      </div>
    );
  }

  const isOrganizer = user && event.organizer.id === user.id;

  return (
    <div className="page-container">
      {/* Action Buttons */}
      <div className="page-actions">
        <Link to="/" className="btn btn-secondary">
          ← Back to Events
        </Link>
        {isOrganizer && (
          <div className="organizer-actions">
            <Link to={`/events/${id}/edit`} className="btn btn-primary">
              ✏️ Edit Event
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn-danger"
            >
              {deleting ? 'Deleting...' : '🗑️ Delete Event'}
            </button>
          </div>
        )}
      </div>

      {/* Event Detail */}
      <EventDetail event={event} onRSVPChange={fetchEvent} />
    </div>
  );
}
