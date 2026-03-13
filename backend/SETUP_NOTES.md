# Setup Notes

## PostgreSQL Database Setup Required

**Task T013**: PostgreSQL Docker container needs to be set up manually.

### Option 1: Using Docker (Recommended)

```bash
docker run -d \
  --name car-calendar-db \
  -e POSTGRES_DB=car_calendar \
  -e POSTGRES_USER=caruser \
  -e POSTGRES_PASSWORD=carpass123 \
  -p 5432:5432 \
  postgis/postgis:16-3.4
```

### Option 2: Local PostgreSQL Installation

1. Install PostgreSQL 16+ with PostGIS extension
2. Create database: `createdb car_calendar`
3. Enable PostGIS: `psql car_calendar -c "CREATE EXTENSION IF NOT EXISTS postgis;"`

### Environment Setup

1. Copy `.env.example` to `.env`
2. Update `DATABASE_URL` if using different credentials
3. Run migrations: `npm run migrate`

## Current Status

✅ Project structure created
✅ Dependencies installed
✅ Configuration files created
⚠️  PostgreSQL setup pending (requires manual Docker/local install)
