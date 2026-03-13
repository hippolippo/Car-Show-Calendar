# Data Model: Car Show Discovery Platform

**Date**: 2026-03-11  
**Phase**: Phase 1 - Data Model Design  
**Database**: PostgreSQL v16.x with PostGIS extension

---

## Overview

This document defines the data model for the Car Show Discovery Platform. The model supports 7 core entities with relationships designed for efficient querying of location-based event discovery, RSVPs, follows, and notifications.

---

## Entity Relationship Diagram (ERD)

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ 1:N (created_by)
       ├──────────────────────────┐
       │                          │
       │                          ▼
       │                  ┌──────────────┐
       │                  │    Event     │
       │                  └───────┬──────┘
       │                          │
       │ N:M (RSVPs)             │ 1:N (location)
       ├──────────────────────────┤
       │                          │
       ▼                          ▼
┌────────────┐            ┌─────────────┐
│    RSVP    │            │  Location   │
└────────────┘            └─────────────┘
       │
       │ N:M (follows)
       │
       ▼
┌──────────────┐          ┌────────────────┐
│    Follow    │          │  Notification  │
└──────────────┘          └────────────────┘
       │                          │
       │                          │ N:1 (belongs to user)
       │                          │
       └──────────────────────────┘
```

---

## Entities

### 1. User

**Purpose**: Represents a person using the platform (event organizer, attendee, or both)

**Table**: `users`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `display_name` | VARCHAR(100) | NOT NULL | User's display name |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last profile update |

**Indexes**:
- `idx_users_email` on `email` (unique, for login lookups)

**Validation Rules**:
- Email must be valid format (RFC 5322)
- Display name: 2-100 characters
- Password: minimum 8 characters (hashed with bcrypt, cost factor 12)

**Relationships**:
- `1:N` with Event (as creator)
- `N:M` with Event (through RSVP)
- `N:M` with User (through Follow, as follower or followed)
- `1:N` with Notification

---

### 2. Event

**Purpose**: Represents a car show or meet

**Table**: `events`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `name` | VARCHAR(200) | NOT NULL | Event name/title |
| `description` | TEXT | NOT NULL | Event description |
| `event_date` | TIMESTAMP WITH TIME ZONE | NOT NULL | Event date and time |
| `location_id` | UUID | NOT NULL, FOREIGN KEY → locations(id) | Reference to location |
| `flier_url` | VARCHAR(500) | NULLABLE | URL to flier image (R2 storage) |
| `organizer_id` | UUID | NOT NULL, FOREIGN KEY → users(id) | Event creator |
| `rsvp_count` | INTEGER | NOT NULL, DEFAULT 0 | Cached RSVP count for performance |
| `is_past` | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether event has passed |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Event creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last event update |

**Indexes**:
- `idx_events_organizer` on `organizer_id` (for organizer profile queries)
- `idx_events_date` on `event_date` (for date sorting)
- `idx_events_location` on `location_id` (for geospatial queries)
- `idx_events_is_past` on `is_past` (for filtering past events)
- `idx_events_rsvp_count` on `rsvp_count` (for popularity sorting)

**Validation Rules**:
- Name: 5-200 characters
- Description: 20-5000 characters
- Event date must be in the future at creation time
- Flier URL must be valid HTTPS URL (if provided)
- Flier file size: max 10MB

**Relationships**:
- `N:1` with User (organizer)
- `N:1` with Location
- `N:M` with User (through RSVP)
- `1:N` with Notification

**State Transitions**:
- `is_past` = FALSE → TRUE (automatically when event_date passes)

---

### 3. Location

**Purpose**: Represents a geographic location for events

**Table**: `locations`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `address` | VARCHAR(500) | NOT NULL | Full street address |
| `city` | VARCHAR(100) | NOT NULL | City name |
| `state` | VARCHAR(100) | NULLABLE | State/province |
| `zip_code` | VARCHAR(20) | NULLABLE | ZIP/postal code |
| `country` | VARCHAR(100) | NOT NULL, DEFAULT 'USA' | Country |
| `coordinates` | GEOGRAPHY(POINT, 4326) | NOT NULL | PostGIS geography point (lat/lon) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Location creation timestamp |

**Indexes**:
- `idx_locations_coordinates` GIST index on `coordinates` (for geospatial queries)
- `idx_locations_zip` on `zip_code` (for ZIP-based searches)

**Validation Rules**:
- Address: 10-500 characters
- City: 2-100 characters
- Coordinates: valid latitude (-90 to 90) and longitude (-180 to 180)
- Must use SRID 4326 (WGS 84) for PostGIS

**Relationships**:
- `1:N` with Event

**Notes**:
- PostGIS `GEOGRAPHY` type automatically handles Earth curvature for distance calculations
- SRID 4326 is standard GPS coordinate system (WGS 84)

---

### 4. RSVP

**Purpose**: Junction table representing user attendance intentions for events

**Table**: `rsvps`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → users(id) ON DELETE CASCADE | User RSVPing |
| `event_id` | UUID | NOT NULL, FOREIGN KEY → events(id) ON DELETE CASCADE | Event being attended |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | RSVP timestamp |

**Constraints**:
- `UNIQUE(user_id, event_id)` - User can only RSVP once per event

**Indexes**:
- `idx_rsvps_user` on `user_id` (for user's RSVP list)
- `idx_rsvps_event` on `event_id` (for event attendee list)
- `idx_rsvps_unique` UNIQUE on `(user_id, event_id)` (prevent duplicate RSVPs)

**Validation Rules**:
- Cannot RSVP to past events
- Cannot RSVP to own events (organizers automatically "attending")

**Relationships**:
- `N:1` with User
- `N:1` with Event

**Concurrent Write Handling** (FR-020):
- Uses database transactions with `SERIALIZABLE` isolation level
- Triggers update `events.rsvp_count` after INSERT/DELETE
- Row-level locking prevents race conditions

---

### 5. Follow

**Purpose**: Junction table representing user-to-organizer follow relationships

**Table**: `follows`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `follower_id` | UUID | NOT NULL, FOREIGN KEY → users(id) ON DELETE CASCADE | User who is following |
| `followed_id` | UUID | NOT NULL, FOREIGN KEY → users(id) ON DELETE CASCADE | User being followed (organizer) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Follow timestamp |

**Constraints**:
- `UNIQUE(follower_id, followed_id)` - User can only follow another user once
- `CHECK(follower_id != followed_id)` - Cannot follow yourself

**Indexes**:
- `idx_follows_follower` on `follower_id` (for user's following list)
- `idx_follows_followed` on `followed_id` (for follower count queries)
- `idx_follows_unique` UNIQUE on `(follower_id, followed_id)` (prevent duplicate follows)

**Validation Rules**:
- Cannot follow yourself
- Both users must exist

**Relationships**:
- `N:1` with User (as follower)
- `N:1` with User (as followed)

---

### 6. Notification

**Purpose**: In-app notifications for followed organizer activity

**Table**: `notifications`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → users(id) ON DELETE CASCADE | Notification recipient |
| `event_id` | UUID | NULLABLE, FOREIGN KEY → events(id) ON DELETE CASCADE | Related event (if applicable) |
| `type` | VARCHAR(50) | NOT NULL | Notification type (e.g., 'new_event_from_followed') |
| `message` | TEXT | NOT NULL | Notification message text |
| `is_read` | BOOLEAN | NOT NULL, DEFAULT FALSE | Read status |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Notification timestamp |

**Indexes**:
- `idx_notifications_user` on `user_id` (for user's notification list)
- `idx_notifications_unread` on `(user_id, is_read)` (for unread count queries)
- `idx_notifications_event` on `event_id` (for event-related notifications)

**Validation Rules**:
- Type must be valid enum value: `new_event_from_followed`, `event_updated`, `event_deleted`
- Message: 10-500 characters

**Relationships**:
- `N:1` with User
- `N:1` with Event (optional)

**State Transitions**:
- `is_read` = FALSE → TRUE (when user views notification)

**Notification Types**:
- `new_event_from_followed`: Followed organizer created new event
- `event_updated`: Event user RSVP'd to was updated
- `event_deleted`: Event user RSVP'd to was deleted

---

### 7. Organizer Reputation (Derived)

**Purpose**: Calculated metric for sorting events by organizer reputation

**Implementation**: Computed query, not a physical table

**Calculation**:
```sql
SELECT 
  u.id AS organizer_id,
  COUNT(DISTINCT e.id) AS total_events,
  AVG(e.rsvp_count) AS avg_attendance,
  SUM(e.rsvp_count) AS total_attendance,
  -- Reputation score: weighted average of past event popularity
  (SUM(e.rsvp_count) / GREATEST(COUNT(DISTINCT e.id), 1))::DECIMAL AS reputation_score
FROM users u
LEFT JOIN events e ON e.organizer_id = u.id AND e.is_past = TRUE
GROUP BY u.id;
```

**Usage**:
- Can be materialized as a view for performance: `CREATE MATERIALIZED VIEW organizer_reputation AS ...`
- Refresh periodically (daily via cron job) or on-demand
- Used for FR-009 (sort by organizer reputation)

**Default Value**:
- New organizers (0 past events): reputation_score = 0 (neutral, not penalized)

---

## Database Schema SQL

### Table Creation

```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

-- Locations table (with PostGIS geography)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100) NOT NULL DEFAULT 'USA',
  coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_locations_coordinates ON locations USING GIST(coordinates);
CREATE INDEX idx_locations_zip ON locations(zip_code);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location_id UUID NOT NULL REFERENCES locations(id),
  flier_url VARCHAR(500),
  organizer_id UUID NOT NULL REFERENCES users(id),
  rsvp_count INTEGER NOT NULL DEFAULT 0,
  is_past BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT event_date_future CHECK (event_date > created_at)
);
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_location ON events(location_id);
CREATE INDEX idx_events_is_past ON events(is_past);
CREATE INDEX idx_events_rsvp_count ON events(rsvp_count);

-- RSVPs table
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);
CREATE INDEX idx_rsvps_user ON rsvps(user_id);
CREATE INDEX idx_rsvps_event ON rsvps(event_id);

-- Follows table
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, followed_id),
  CHECK(follower_id != followed_id)
);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_followed ON follows(followed_id);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK(type IN ('new_event_from_followed', 'event_updated', 'event_deleted'))
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_event ON notifications(event_id);

-- Organizer Reputation materialized view
CREATE MATERIALIZED VIEW organizer_reputation AS
SELECT 
  u.id AS organizer_id,
  u.display_name,
  COUNT(DISTINCT e.id) AS total_events,
  COALESCE(AVG(e.rsvp_count), 0) AS avg_attendance,
  COALESCE(SUM(e.rsvp_count), 0) AS total_attendance,
  COALESCE(SUM(e.rsvp_count) / GREATEST(COUNT(DISTINCT e.id), 1), 0)::DECIMAL AS reputation_score
FROM users u
LEFT JOIN events e ON e.organizer_id = u.id AND e.is_past = TRUE
GROUP BY u.id, u.display_name;

CREATE UNIQUE INDEX idx_organizer_reputation_id ON organizer_reputation(organizer_id);
```

### Triggers

```sql
-- Trigger to update events.rsvp_count when RSVP is added/removed
CREATE OR REPLACE FUNCTION update_rsvp_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events SET rsvp_count = rsvp_count + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events SET rsvp_count = rsvp_count - 1 WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rsvp_count_trigger
AFTER INSERT OR DELETE ON rsvps
FOR EACH ROW EXECUTE FUNCTION update_rsvp_count();

-- Trigger to mark events as past when event_date passes
CREATE OR REPLACE FUNCTION mark_past_events()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_date < NOW() THEN
    NEW.is_past := TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mark_past_events_trigger
BEFORE INSERT OR UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION mark_past_events();

-- Trigger to create notifications for followers when organizer creates event
CREATE OR REPLACE FUNCTION notify_followers_new_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, event_id, type, message)
  SELECT 
    f.follower_id,
    NEW.id,
    'new_event_from_followed',
    'Organizer ' || u.display_name || ' created a new event: ' || NEW.name
  FROM follows f
  JOIN users u ON u.id = NEW.organizer_id
  WHERE f.followed_id = NEW.organizer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_followers_trigger
AFTER INSERT ON events
FOR EACH ROW EXECUTE FUNCTION notify_followers_new_event();
```

---

## Query Patterns

### 1. Find events near user location (FR-002, FR-003, FR-006)

```sql
SELECT 
  e.*,
  l.address,
  l.city,
  l.state,
  ST_Distance(l.coordinates, ST_SetSRID(ST_MakePoint(:user_lon, :user_lat), 4326)::geography) / 1609.34 AS distance_miles
FROM events e
JOIN locations l ON l.id = e.location_id
WHERE 
  e.is_past = FALSE
  AND ST_DWithin(
    l.coordinates,
    ST_SetSRID(ST_MakePoint(:user_lon, :user_lat), 4326)::geography,
    :radius_meters  -- e.g., 40233.6 for 25 miles
  )
ORDER BY distance_miles ASC
LIMIT 100;
```

### 2. Sort events by weighted combination (FR-010, FR-011)

```sql
WITH event_scores AS (
  SELECT 
    e.*,
    l.coordinates,
    -- Distance score (0-1, normalized by max distance)
    1 - (ST_Distance(l.coordinates, ST_SetSRID(ST_MakePoint(:user_lon, :user_lat), 4326)::geography) / :max_distance) AS distance_score,
    -- Date score (0-1, normalized by days until event)
    1 - (EXTRACT(EPOCH FROM (e.event_date - NOW())) / :max_seconds) AS date_score,
    -- Popularity score (0-1, normalized by max RSVPs)
    CAST(e.rsvp_count AS DECIMAL) / GREATEST(:max_rsvps, 1) AS popularity_score,
    -- Organizer reputation score (0-1, from materialized view)
    COALESCE(or.reputation_score / :max_reputation, 0) AS reputation_score
  FROM events e
  JOIN locations l ON l.id = e.location_id
  LEFT JOIN organizer_reputation or ON or.organizer_id = e.organizer_id
  WHERE e.is_past = FALSE
)
SELECT *,
  (:distance_weight * distance_score +
   :date_weight * date_score +
   :popularity_weight * popularity_score +
   :reputation_weight * reputation_score) AS weighted_score
FROM event_scores
ORDER BY weighted_score DESC
LIMIT 100;
```

### 3. Get user's RSVPs (FR-019)

```sql
SELECT e.*, r.created_at AS rsvp_date
FROM rsvps r
JOIN events e ON e.id = r.event_id
WHERE r.user_id = :user_id
ORDER BY e.event_date ASC;
```

### 4. Get organizer profile with stats (FR-024)

```sql
SELECT 
  u.*,
  or.total_events,
  or.avg_attendance,
  or.reputation_score,
  COUNT(DISTINCT f.follower_id) AS follower_count
FROM users u
LEFT JOIN organizer_reputation or ON or.organizer_id = u.id
LEFT JOIN follows f ON f.followed_id = u.id
WHERE u.id = :organizer_id
GROUP BY u.id, or.total_events, or.avg_attendance, or.reputation_score;
```

### 5. Get unread notifications (FR-026, FR-027)

```sql
SELECT n.*, e.name AS event_name
FROM notifications n
LEFT JOIN events e ON e.id = n.event_id
WHERE n.user_id = :user_id AND n.is_read = FALSE
ORDER BY n.created_at DESC
LIMIT 50;
```

---

## Migration Strategy

### Initial Schema Setup
1. Create PostgreSQL database: `car_calendar`
2. Enable PostGIS extension
3. Run schema creation SQL
4. Create database user with appropriate permissions

### Future Migrations
- Use migration tool (Knex, TypeORM, or Prisma Migrate)
- Version migrations sequentially (001_initial_schema.sql, 002_add_xyz.sql)
- Test migrations on development database before production
- Always create rollback scripts

### Data Seeding
- Create seed data for development/testing
- Minimum seed: 3 users, 10 events, 5 locations, 20 RSVPs
- Use realistic addresses and coordinates for location testing

---

## Performance Considerations

### Indexes
- All foreign keys indexed for join performance
- GIST index on `locations.coordinates` for geospatial queries (critical for FR-003)
- Composite index on `(user_id, is_read)` for notification queries
- Unique indexes enforce data integrity (no duplicate RSVPs/follows)

### Materialized View
- `organizer_reputation` materialized view cached for performance
- Refresh strategy: daily cron job or on-demand after event completion
- Query performance: O(1) for organizer reputation lookups

### Caching Strategy
- `events.rsvp_count` denormalized for fast queries (updated via trigger)
- Avoid N+1 queries by using JOINs or batch loading
- Consider application-level caching (Redis) for hot data (event list, user sessions)

### Scaling
- Read replicas for read-heavy workloads (event browsing)
- Connection pooling (pg-pool) to handle 1000 concurrent users
- Partitioning `notifications` table by date if volume grows (>1M rows)

---

## Security Considerations

### Authentication
- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens stored in httpOnly cookies (not localStorage)
- Token expiration: 7 days, refresh token: 30 days

### Authorization
- Row-level security policies (future enhancement):
  - Users can only edit/delete own events
  - Users can only view own RSVPs and notifications
  - Organizers can see attendee list for own events

### Data Validation
- All constraints enforced at database level
- Application-level validation for user input
- Sanitize all user-generated content (XSS prevention)

### Privacy
- User emails not exposed in public API responses
- RSVP lists visible to organizers only
- Follow relationships visible to both parties

---

## Testing Data Model

### Unit Tests
- Test each model's CRUD operations
- Test validation rules (constraint violations)
- Test relationship integrity (cascading deletes)

### Integration Tests
- Test trigger functionality (RSVP count updates)
- Test geospatial queries (distance calculations)
- Test concurrent RSVP updates (transaction isolation)

### Test Database
- Use separate test database
- Reset schema between test suites
- Use transactions for test isolation (rollback after each test)

---

## Next Steps

With the data model defined:
1. ✅ Phase 0 complete: Research and technology decisions
2. ✅ Phase 1a complete: Data model design
3. → Phase 1b: Define API contracts (`contracts/`)
4. → Phase 1c: Create quickstart guide (`quickstart.md`)
5. → Phase 1d: Update agent context
