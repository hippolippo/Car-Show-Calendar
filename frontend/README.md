# CarCalendar Frontend

React + Vite frontend for the CarCalendar car show discovery platform.

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management (~1KB)
- **Vitest** - Unit testing
- **Playwright** - E2E testing

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file (use `.env.example` as template):

```bash
# Backend API URL
VITE_API_URL=http://localhost:3000/api/v1
```

**Production:** Set `VITE_API_URL` to your Railway backend URL.

## Project Structure

```
src/
├── components/     # React components
│   ├── common/     # Shared components (LocationInput, etc.)
│   ├── events/     # Event-related components
│   ├── layout/     # Layout components (Header, etc.)
│   └── users/      # User-related components
├── pages/          # Page components (routes)
├── services/       # API client and service layer
├── store/          # Zustand state management
├── utils/          # Utility functions
└── App.jsx         # Root component
```

## Key Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Location-Based Search** - GPS and ZIP code support
- **Image Upload** - Event fliers with preview
- **Real-time Updates** - RSVP counts update immediately
- **Google Maps Integration** - Clickable addresses

## Deployment

See the main [DEPLOYMENT.md](../DEPLOYMENT.md) for full deployment instructions.

**Quick:** Deploy to Vercel with one click:
1. Import repository to Vercel
2. Set root directory to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend.railway.app/api/v1`
4. Deploy

The frontend is currently live at: https://car-show-calendar-one.vercel.app
