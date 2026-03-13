// T032, T066, T087: Router configuration with auth and event routes
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import EventDetailPage from './pages/EventDetailPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'events/create',
        element: <CreateEventPage />,
      },
      {
        path: 'events/:id/edit',
        element: <EditEventPage />,
      },
      {
        path: 'events/:id',
        element: <EventDetailPage />,
      },
    ],
  },
]);

export default router;
