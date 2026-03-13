// T063: CreateEventPage
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateEventForm from '../components/events/CreateEventForm';
import useAppStore from '../store/appStore';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login?redirect=/events/create');
    }
  }, [user, navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="create-event-page">
      <div className="container">
        <CreateEventForm />
      </div>
    </div>
  );
}
