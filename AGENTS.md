# CarCalendar Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-11

## Active Technologies

### Backend (001-car-show-discovery)
- **Framework**: Express v5.x (Node.js REST API)
- **Language**: Node.js v22 LTS
- **Database**: PostgreSQL v16.x with PostGIS extension (geospatial queries)
- **Authentication**: JWT tokens in httpOnly cookies
- **Storage**: Cloudflare R2 (S3-compatible) for image uploads
- **Testing**: Vitest + Supertest for API tests

### Frontend (001-car-show-discovery)
- **Framework**: React (latest stable)
- **Build Tool**: Vite v7.3.1
- **State Management**: Zustand (~1.2KB)
- **HTTP Client**: Native fetch API
- **Routing**: React Router
- **Testing**: Vitest + React Testing Library + jsdom
- **E2E Testing**: Playwright

### Shared (001-car-show-discovery)
- **Geolocation**: geolib v3.3.4 (distance calculations)

## Project Structure

```text
backend/
├── src/
│   ├── models/           # Data models: User, Event, RSVP, Follow, Notification, Location
│   ├── services/         # Business logic: EventService, UserService, RSVPService, etc.
│   ├── api/              # REST API routes and controllers
│   │   ├── routes/       # Route definitions
│   │   ├── controllers/  # Request handlers
│   │   └── middleware/   # Auth, validation, error handling
│   ├── utils/            # Helpers: distance calculations, date handling
│   └── config/           # Configuration: DB, auth, storage
├── tests/
│   ├── unit/             # Unit tests for services and utils
│   ├── integration/      # API contract tests
│   └── fixtures/         # Test data
└── package.json

frontend/
├── src/
│   ├── components/       # React components
│   │   ├── events/       # EventList, EventCard, EventDetail, CreateEventForm
│   │   ├── users/        # UserProfile, OrganizerProfile
│   │   ├── common/       # LocationInput, SortControls, NotificationBell
│   │   └── layout/       # Header, Footer, Navigation
│   ├── pages/            # Page-level components
│   │   ├── HomePage.jsx
│   │   ├── EventDetailPage.jsx
│   │   ├── CreateEventPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── OrganizerPage.jsx
│   ├── services/         # API client, auth service
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand stores
│   └── utils/            # Frontend utilities
├── tests/
│   ├── unit/             # Component unit tests
│   ├── integration/      # Frontend-backend integration tests
│   └── e2e/              # End-to-end user flow tests
└── package.json
```

## Commands

### Development
```bash
# Backend
cd backend
npm run dev              # Start dev server (port 3000)
npm test                 # Run tests
npm run migrate          # Run database migrations

# Frontend
cd frontend
npm run dev              # Start Vite dev server (port 5173)
npm test                 # Run tests
npm run test:e2e         # Run Playwright E2E tests
```

### Database
```bash
# Start PostgreSQL with Docker
docker run -d --name car-calendar-db \
  -e POSTGRES_DB=car_calendar \
  -e POSTGRES_USER=caruser \
  -e POSTGRES_PASSWORD=carpass123 \
  -p 5432:5432 \
  postgis/postgis:16-3.4

# Run migrations
cd backend && npm run migrate

# Seed test data
cd backend && npm run seed
```

## Code Style

- **Backend**: Express middleware pattern, async/await for async operations
- **Frontend**: React functional components with hooks, Zustand for state
- **Testing**: TDD required - write tests before implementation (Red-Green-Refactor)
- **Imports**: ESM modules (`import/export`)
- **API**: RESTful conventions, JSON payloads, httpOnly cookies for auth

## Recent Changes

- 001-car-show-discovery: Added

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
