# 🚗 CarCalendar - Car Show Discovery Platform

**Status**: MVP Foundation Complete ✅  
**Next Phase**: User Story 5 - Create Events  
**Progress**: 37/91 MVP tasks complete (41%)

Discover car shows and meets in your area. Create events, RSVP, follow organizers, and connect with the car community.

---

## 🎯 Quick Start

### Prerequisites

- Node.js v22 LTS
- PostgreSQL 16+ with PostGIS extension
- Docker (recommended for PostgreSQL)

### Setup (5 minutes)

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd CarCalendar
   
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Start PostgreSQL**
   ```bash
   docker run -d --name car-calendar-db \
     -e POSTGRES_DB=car_calendar \
     -e POSTGRES_USER=caruser \
     -e POSTGRES_PASSWORD=carpass123 \
     -p 5432:5432 \
     postgis/postgis:16-3.4
   ```

3. **Configure Environment**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env if needed
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   ```

4. **Initialize Database**
   ```bash
   cd backend
   npm run migrate
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

6. **Open Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/health

---

## 📁 Project Structure

```
CarCalendar/
├── backend/          # Node.js + Express API
│   ├── src/          # Source code
│   ├── tests/        # Tests (Vitest + Supertest)
│   ├── migrations/   # Database migrations
│   └── scripts/      # Utility scripts
├── frontend/         # React + Vite app
│   ├── src/          # Source code
│   └── tests/        # Tests (Vitest + Playwright)
└── specs/            # Design documents
    └── 001-car-show-discovery/
        ├── plan.md           # Implementation plan
        ├── spec.md           # User stories
        ├── data-model.md     # Database design
        ├── contracts/        # API contracts
        ├── tasks.md          # Task breakdown
        └── quickstart.md     # Setup guide
```

---

## 🧪 Testing

```bash
# Backend unit tests
cd backend
npm test

# Backend integration tests
npm run test:integration

# Frontend unit tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

---

## 🛠️ Technologies

**Backend**:
- Node.js v22 (ESM modules)
- Express v5.x (REST API)
- PostgreSQL 16 + PostGIS (Geospatial database)
- JWT authentication (httpOnly cookies)
- Vitest + Supertest (Testing)

**Frontend**:
- React (latest stable)
- Vite v7.3.1 (Build tool)
- React Router (Routing)
- Zustand (State management)
- Vitest + React Testing Library + Playwright (Testing)

**Shared**:
- geolib v3.3.4 (Distance calculations)

---

## 📚 Documentation

- **[Implementation Progress](./IMPLEMENTATION_PROGRESS.md)** - Current status and next steps
- **[Setup Notes](./backend/SETUP_NOTES.md)** - Database setup instructions
- **[Tasks](./specs/001-car-show-discovery/tasks.md)** - Complete task breakdown
- **[Spec](./specs/001-car-show-discovery/spec.md)** - User stories and requirements
- **[API Contracts](./specs/001-car-show-discovery/contracts/api-contracts.md)** - API documentation
- **[Data Model](./specs/001-car-show-discovery/data-model.md)** - Database design

---

## 🚀 Development Workflow

1. **Create feature branch** (if not already on `001-car-show-discovery`)
2. **Write tests first** (TDD approach)
3. **Implement feature** (Red-Green-Refactor)
4. **Run tests**: `npm test`
5. **Commit changes**: Follow conventional commits

---

## ✅ Completed

- [x] Project structure and configuration
- [x] Database schema and migrations
- [x] Backend core infrastructure (auth, middleware, config)
- [x] Frontend core infrastructure (store, router, API client)
- [x] Test infrastructure and utilities
- [x] Basic UI layout (Header, Footer, App)

## 🏗️ In Progress

- [ ] User Story 5: Create and Manage Events
- [ ] User Story 1: Discover Local Events

## 📋 Upcoming

- [ ] User Story 2: Sort and Filter Events
- [ ] User Story 3: RSVP to Events
- [ ] User Story 4: Follow Organizers

---

## 🎯 MVP Scope

The MVP includes:
1. **Event Creation** - Organizers can create car show events
2. **Event Discovery** - Users can find nearby events
3. **Location Search** - Find events by distance
4. **Basic Sorting** - Sort by distance, date, popularity

**MVP Delivery**: 91 tasks (37 complete, 54 remaining)

---

## 🤝 Contributing

Follow TDD workflow:
1. Write tests that fail
2. Implement minimum code to pass
3. Refactor
4. Commit

See `specs/001-car-show-discovery/tasks.md` for task breakdown.

---

## 📝 License

ISC

---

## 🔗 Links

- [Feature Specification](./specs/001-car-show-discovery/spec.md)
- [Implementation Plan](./specs/001-car-show-discovery/plan.md)
- [Task List](./specs/001-car-show-discovery/tasks.md)

---

**Built with** ❤️ **for the car community**
