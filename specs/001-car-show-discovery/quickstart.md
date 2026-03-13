# Quickstart Guide: Car Show Discovery Platform

**Date**: 2026-03-11  
**Phase**: Phase 1c - Development Setup  
**Target**: Developers setting up local development environment

---

## Prerequisites

Before starting, ensure you have:

- **Node.js v22 LTS** (latest LTS version)
- **npm** (comes with Node.js)
- **PostgreSQL v16.x** with PostGIS extension
- **Docker** (optional, recommended for PostgreSQL)
- **Git**

---

## Quick Setup (5 minutes)

### 1. Clone and Install

```bash
# Clone repository (when available)
git clone https://github.com/yourusername/car-calendar.git
cd car-calendar

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start PostgreSQL (Docker recommended)

```bash
# Create and start PostgreSQL with PostGIS
docker run -d \
  --name car-calendar-db \
  -e POSTGRES_DB=car_calendar \
  -e POSTGRES_USER=caruser \
  -e POSTGRES_PASSWORD=carpass123 \
  -p 5432:5432 \
  postgis/postgis:16-3.4

# Verify it's running
docker ps | grep car-calendar-db
```

**Alternative (local PostgreSQL installation)**:
```bash
# Create database
createdb car_calendar

# Enable PostGIS
psql car_calendar -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### 3. Configure Environment

**Backend** (`backend/.env`):
```env
# Database
DATABASE_URL=postgresql://caruser:carpass123@localhost:5432/car_calendar

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Cloudflare R2 (optional for development, can use local filesystem initially)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=car-calendar-dev
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# Server
PORT=3000
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 4. Initialize Database

```bash
cd backend

# Run migrations (creates tables, indexes, triggers)
npm run migrate

# Seed development data (optional)
npm run seed
```

### 5. Start Development Servers

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# Server running at http://localhost:3000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# Vite dev server at http://localhost:5173
```

### 6. Verify Setup

Open browser to `http://localhost:5173` and verify:
- ✅ Frontend loads
- ✅ Can view events (test data from seed)
- ✅ Can create account
- ✅ Can login

---

## Project Structure

```
car-calendar/
├── backend/
│   ├── src/
│   │   ├── models/          # Data models (User, Event, etc.)
│   │   ├── services/        # Business logic
│   │   ├── api/
│   │   │   ├── routes/      # Express routes
│   │   │   ├── controllers/ # Request handlers
│   │   │   └── middleware/  # Auth, validation, errors
│   │   ├── utils/           # Helpers (distance calc, dates)
│   │   └── config/          # Configuration
│   ├── tests/               # Backend tests
│   ├── migrations/          # Database migrations
│   ├── seeds/               # Seed data
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── events/      # Event-related components
│   │   │   ├── users/       # User profile components
│   │   │   └── common/      # Shared components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # Zustand stores
│   │   └── utils/           # Frontend utilities
│   ├── tests/               # Frontend tests
│   └── package.json
│
├── specs/                   # Feature specs (this directory)
└── README.md
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/add-event-search
```

### 2. Write Tests First (TDD)

Per constitution, tests must be written before implementation:

```bash
# Backend tests
cd backend
npm test -- --watch

# Frontend tests
cd frontend
npm test -- --watch
```

### 3. Implement Feature

Follow Red-Green-Refactor cycle:
1. Write failing test
2. Implement minimum code to pass
3. Refactor

### 4. Run All Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# E2E tests (after both servers running)
cd frontend
npm run test:e2e
```

### 5. Commit and Push

```bash
git add .
git commit -m "feat: add event search by location"
git push origin feature/add-event-search
```

---

## Common Tasks

### Run Database Migrations

```bash
cd backend

# Create new migration
npm run migrate:create add_new_field

# Run pending migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback
```

### Seed Test Data

```bash
cd backend

# Seed development data
npm run seed

# Reset database and reseed
npm run db:reset
```

### View Database

```bash
# Using psql
psql -U caruser -d car_calendar

# Common queries
SELECT * FROM events LIMIT 10;
SELECT COUNT(*) FROM users;
SELECT * FROM organizer_reputation;
```

### Test API Endpoints

```bash
# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","displayName":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Get events (with authentication)
curl -X GET http://localhost:3000/api/v1/events?lat=35.2271&lon=-80.8431 \
  -b cookies.txt
```

### Update Dependencies

```bash
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix
```

---

## Testing

### Unit Tests (Vitest)

**Backend**:
```bash
cd backend
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- services/       # Test specific directory
npm run test:coverage       # Coverage report
```

**Frontend**:
```bash
cd frontend
npm test                    # Run all tests
npm test -- --ui            # Interactive UI
npm test -- EventList       # Test specific component
npm run test:coverage       # Coverage report
```

### Integration Tests (Supertest)

```bash
cd backend
npm run test:integration    # API contract tests
```

### E2E Tests (Playwright)

```bash
cd frontend
npm run test:e2e            # Run E2E tests headless
npm run test:e2e -- --ui    # Interactive mode
npm run test:e2e -- --debug # Debug mode
```

---

## Debugging

### Backend Debugging (VSCode)

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/index.js",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Frontend Debugging (Browser DevTools)

1. Open Chrome DevTools (F12)
2. Sources tab → `src/` folder
3. Set breakpoints in component files
4. Refresh page to hit breakpoints

### Database Debugging

```bash
# Enable query logging in PostgreSQL
docker exec -it car-calendar-db psql -U caruser -d car_calendar

# Show slow queries
\x
SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;

# Explain query plan
EXPLAIN ANALYZE SELECT * FROM events WHERE is_past = FALSE;
```

---

## Troubleshooting

### PostgreSQL Connection Issues

**Error**: `ECONNREFUSED 127.0.0.1:5432`

**Solution**:
```bash
# Check if PostgreSQL is running
docker ps | grep car-calendar-db

# Restart container
docker restart car-calendar-db

# Check logs
docker logs car-calendar-db
```

### Vite Dev Server Issues

**Error**: `Port 5173 already in use`

**Solution**:
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 5174
```

### Migration Errors

**Error**: `Migration failed: table already exists`

**Solution**:
```bash
# Check migration status
npm run migrate:status

# Rollback and retry
npm run migrate:rollback
npm run migrate
```

### JWT Authentication Issues

**Error**: `401 Unauthorized`

**Solution**:
1. Check JWT_SECRET in `.env` matches frontend expectation
2. Verify cookie is being sent (check browser DevTools → Application → Cookies)
3. Check token expiration (`JWT_EXPIRES_IN`)

---

## Environment Setup Checklist

Before starting development:

- [ ] Node.js v22 LTS installed (`node -v`)
- [ ] PostgreSQL 16 with PostGIS running (`docker ps`)
- [ ] Backend dependencies installed (`cd backend && npm list`)
- [ ] Frontend dependencies installed (`cd frontend && npm list`)
- [ ] Environment variables configured (`.env` files)
- [ ] Database migrations run (`npm run migrate`)
- [ ] Backend server starts (`npm run dev` in `backend/`)
- [ ] Frontend server starts (`npm run dev` in `frontend/`)
- [ ] Can access frontend at `http://localhost:5173`
- [ ] Can call API at `http://localhost:3000/api/v1/events`
- [ ] Tests pass (`npm test` in both directories)

---

## Next Steps

After setup is complete:

1. ✅ Review project structure
2. ✅ Run through this quickstart guide
3. → Read [data-model.md](./data-model.md) to understand entities
4. → Read [api-contracts.md](./contracts/api-contracts.md) to understand endpoints
5. → Start with Phase 2: Generate tasks and implement features
6. → Follow TDD: Write tests → Get approval → Implement

---

## Resources

- **Feature Spec**: [spec.md](./spec.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/api-contracts.md](./contracts/api-contracts.md)
- **Tech Research**: [research.md](./research.md)
- **Implementation Plan**: [plan.md](./plan.md)

---

## Getting Help

**Common Issues**:
1. Check troubleshooting section above
2. Review error logs: `docker logs car-calendar-db`, `npm run dev` output
3. Verify environment variables in `.env` files
4. Ensure all services are running (PostgreSQL, backend, frontend)

**Development Questions**:
1. Review feature specification: [spec.md](./spec.md)
2. Check API contracts: [contracts/api-contracts.md](./contracts/api-contracts.md)
3. Consult constitution: `.specify/memory/constitution.md`

---

## Tips for Productivity

1. **Use watch mode** for tests during development
2. **Set up editor** with ESLint, Prettier for auto-formatting
3. **Use Thunder Client / Postman** for API testing
4. **Keep backend and frontend** running in separate terminals
5. **Commit frequently** with meaningful messages
6. **Run full test suite** before pushing code
7. **Use Docker Compose** (optional) to orchestrate services
8. **Enable hot reload** (already configured in Vite)

---

**Happy Coding!** 🚗 🎉
