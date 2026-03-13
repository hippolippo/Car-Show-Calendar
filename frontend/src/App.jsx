// T035: Main App component with layout
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import useAppStore from './store/appStore';
import authService from './services/authService';
import { getMyRSVPs } from './services/rsvpService';

function App() {
  const { setUser, isAuthenticated, setRsvps } = useAppStore();
  
  // Check if user is already logged in on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setUser(user);
          
          // Load user's RSVPs
          try {
            const rsvps = await getMyRSVPs();
            const rsvpEventIds = rsvps.map(rsvp => rsvp.event.id);
            setRsvps(rsvpEventIds);
          } catch (error) {
            console.error('Failed to load RSVPs:', error);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    }
    
    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, setUser, setRsvps]);
  
  return (
    <div style={styles.app}>
      <Header />
      <main style={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

const styles = {
  app: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  },
  main: {
    flex: 1,
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '2rem 1rem'
  }
};

export default App;
