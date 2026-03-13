// T120 & T125: RSVPButton component with optimistic updates
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../../store/appStore';
import { createRSVP, cancelRSVP } from '../../services/rsvpService';

export default function RSVPButton({ event, onSuccess }) {
  const navigate = useNavigate();
  const { user, addRsvp, removeRsvp, rsvps } = useAppStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if user has RSVP'd (from Zustand store)
  const hasRsvped = rsvps.includes(event.id);

  const handleRSVP = async () => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate(`/login?redirect=/events/${event.id}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (hasRsvped) {
        // Cancel RSVP
        removeRsvp(event.id);
        
        try {
          await cancelRSVP(event.id);
          // Call success callback to refetch events
          if (onSuccess) onSuccess();
        } catch (err) {
          // Revert on error
          addRsvp(event.id);
          throw err;
        }
      } else {
        // Create RSVP
        addRsvp(event.id);
        
        try {
          await createRSVP(event.id);
          // Call success callback to refetch events
          if (onSuccess) onSuccess();
        } catch (err) {
          // Revert on error
          removeRsvp(event.id);
          throw err;
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to update RSVP');
    } finally {
      setLoading(false);
    }
  };

  // Don't show button for past events
  if (event.isPast) {
    return (
      <button className="btn btn-secondary" disabled>
        Event Ended
      </button>
    );
  }

  return (
    <div className="rsvp-button-container">
      <button
        onClick={handleRSVP}
        disabled={loading}
        className={`btn ${hasRsvped ? 'btn-success' : 'btn-primary'}`}
      >
        {loading ? (
          'Updating...'
        ) : hasRsvped ? (
          <>✓ Going</>
        ) : (
          <>RSVP</>
        )}
      </button>
      {error && (
        <div className="rsvp-error">
          {error}
        </div>
      )}
    </div>
  );
}
