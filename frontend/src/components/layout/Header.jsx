// T033: Header layout component with mobile-responsive design
import { Link } from 'react-router-dom';
import useAppStore from '../../store/appStore';

export default function Header() {
  const { isAuthenticated, user, logout } = useAppStore();
  
  const handleLogout = async () => {
    try {
      const authService = await import('../../services/authService.js');
      await authService.default.logout();
      logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <h1 className="header-title">🚗 CarCalendar</h1>
        </Link>
        
        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              <Link to="/" className="nav-link">Events</Link>
              <Link to="/events/create" className="nav-link">Create</Link>
              <span className="user-greeting">Hi, {user?.displayName}</span>
              <button onClick={handleLogout} className="header-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">Events</Link>
              <Link to="/login">
                <button className="header-btn">Login</button>
              </Link>
              <Link to="/register">
                <button className="header-btn header-btn-signup">Sign Up</button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
