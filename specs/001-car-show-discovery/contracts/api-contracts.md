# API Contracts: Car Show Discovery Platform

**Date**: 2026-03-11  
**Phase**: Phase 1b - API Contract Definition  
**API Style**: REST with JSON payloads  
**Base URL**: `/api/v1`

---

## Overview

This document defines all API endpoints for the Car Show Discovery Platform. The API follows REST principles with JSON request/response bodies, standard HTTP status codes, and consistent error formatting.

---

## Authentication

**Method**: JWT tokens in httpOnly cookies

**Login**: `POST /auth/login`  
**Logout**: `POST /auth/logout`  
**Token Refresh**: `POST /auth/refresh`

**Protected Endpoints**: Require valid JWT in cookie header
- All `/users/*` endpoints (except registration)
- `POST /events`, `PUT /events/:id`, `DELETE /events/:id`
- All `/rsvps/*` endpoints
- All `/follows/*` endpoints
- All `/notifications/*` endpoints

---

## API Endpoints

### Authentication Endpoints

#### POST /api/v1/auth/register
**Purpose**: Create new user account (FR-012)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe",
    "createdAt": "2026-03-11T10:00:00Z"
  },
  "message": "Account created successfully"
}
```

**Errors**:
- 400: Invalid email format, password too short, display name too short
- 409: Email already exists

---

#### POST /api/v1/auth/login
**Purpose**: Authenticate user and set JWT cookie (FR-013)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe"
  },
  "message": "Login successful"
}
```

**Sets Cookie**: `authToken=<jwt>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`

**Errors**:
- 400: Missing credentials
- 401: Invalid email or password

---

#### POST /api/v1/auth/logout
**Purpose**: Invalidate session and clear JWT cookie (FR-013)

**Authentication**: Required

**Response** (200 OK):
```json
{
  "message": "Logout successful"
}
```

**Clears Cookie**: `authToken`

---

#### GET /api/v1/auth/me
**Purpose**: Get current authenticated user info

**Authentication**: Required

**Response** (200 OK):
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "createdAt": "2026-03-11T10:00:00Z"
}
```

**Errors**:
- 401: Not authenticated

---

### Event Endpoints

#### GET /api/v1/events
**Purpose**: List events with filtering and sorting (FR-001, FR-002, FR-006-FR-011)

**Authentication**: Optional (public browsing allowed per FR-014)

**Query Parameters**:
- `lat` (number, required if sorting by distance): User latitude
- `lon` (number, required if sorting by distance): User longitude
- `radius` (number, optional, default 40234): Search radius in meters (25 miles)
- `sortBy` (string, optional, default 'distance'): Sort field - `distance`, `date`, `popularity`, `reputation`, `weighted`
- `weights` (string, optional, only for `sortBy=weighted`): JSON object `{"distance":0.3,"date":0.3,"popularity":0.2,"reputation":0.2}`
- `includePast` (boolean, optional, default false): Include past events
- `page` (number, optional, default 1): Page number
- `limit` (number, optional, default 50, max 100): Results per page

**Response** (200 OK):
```json
{
  "events": [
    {
      "id": "uuid",
      "name": "Spring Car Show 2026",
      "description": "Annual spring car show featuring classic cars...",
      "eventDate": "2026-04-15T14:00:00Z",
      "location": {
        "id": "uuid",
        "address": "123 Main St",
        "city": "Charlotte",
        "state": "NC",
        "zipCode": "28202",
        "country": "USA",
        "coordinates": {
          "lat": 35.2271,
          "lon": -80.8431
        }
      },
      "flierUrl": "https://r2.example.com/fliers/uuid.jpg",
      "organizer": {
        "id": "uuid",
        "displayName": "John Doe"
      },
      "rsvpCount": 45,
      "distanceMiles": 12.5,
      "userHasRsvped": false,
      "createdAt": "2026-03-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

**Errors**:
- 400: Invalid query parameters (missing lat/lon for distance sorting, invalid weights)

---

#### GET /api/v1/events/:id
**Purpose**: Get single event details (FR-001)

**Authentication**: Optional

**Response** (200 OK):
```json
{
  "id": "uuid",
  "name": "Spring Car Show 2026",
  "description": "Annual spring car show featuring classic cars and hot rods. Free admission, family-friendly event with food trucks and live music.",
  "eventDate": "2026-04-15T14:00:00Z",
  "location": {
    "id": "uuid",
    "address": "123 Main St",
    "city": "Charlotte",
    "state": "NC",
    "zipCode": "28202",
    "country": "USA",
    "coordinates": {
      "lat": 35.2271,
      "lon": -80.8431
    }
  },
  "flierUrl": "https://r2.example.com/fliers/uuid.jpg",
  "organizer": {
    "id": "uuid",
    "displayName": "John Doe",
    "followerCount": 25
  },
  "rsvpCount": 45,
  "attendees": [
    {
      "id": "uuid",
      "displayName": "Jane Smith",
      "rsvpDate": "2026-03-05T12:00:00Z"
    }
  ],
  "userHasRsvped": false,
  "userFollowsOrganizer": false,
  "isPast": false,
  "createdAt": "2026-03-01T10:00:00Z",
  "updatedAt": "2026-03-01T10:00:00Z"
}
```

**Errors**:
- 404: Event not found

---

#### POST /api/v1/events
**Purpose**: Create new event (FR-029)

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Spring Car Show 2026",
  "description": "Annual spring car show featuring classic cars and hot rods. Free admission, family-friendly event with food trucks and live music.",
  "eventDate": "2026-04-15T14:00:00Z",
  "location": {
    "address": "123 Main St",
    "city": "Charlotte",
    "state": "NC",
    "zipCode": "28202",
    "country": "USA",
    "coordinates": {
      "lat": 35.2271,
      "lon": -80.8431
    }
  },
  "flierUrl": null
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "name": "Spring Car Show 2026",
  "description": "...",
  "eventDate": "2026-04-15T14:00:00Z",
  "location": { ... },
  "flierUrl": null,
  "organizer": {
    "id": "uuid",
    "displayName": "John Doe"
  },
  "rsvpCount": 0,
  "createdAt": "2026-03-11T10:00:00Z"
}
```

**Errors**:
- 400: Validation errors (missing required fields, invalid date, invalid coordinates)
- 401: Not authenticated

---

#### PUT /api/v1/events/:id
**Purpose**: Update event (FR-032)

**Authentication**: Required (must be event creator)

**Request Body**: Same as POST, all fields optional
```json
{
  "name": "Updated Event Name",
  "description": "Updated description"
}
```

**Response** (200 OK): Updated event object

**Errors**:
- 400: Validation errors
- 401: Not authenticated
- 403: Not event creator
- 404: Event not found

---

#### DELETE /api/v1/events/:id
**Purpose**: Delete event (FR-033)

**Authentication**: Required (must be event creator)

**Response** (204 No Content)

**Side Effects**:
- Cascading delete RSVPs
- Creates notifications for all attendees (FR-109)

**Errors**:
- 401: Not authenticated
- 403: Not event creator
- 404: Event not found

---

#### POST /api/v1/events/:id/upload-flier
**Purpose**: Upload event flier image (FR-030)

**Authentication**: Required (must be event creator)

**Content-Type**: `multipart/form-data`

**Request Body**:
- `flier`: File upload (JPG, PNG, or PDF, max 10MB)

**Response** (200 OK):
```json
{
  "flierUrl": "https://r2.example.com/fliers/uuid.jpg",
  "message": "Flier uploaded successfully"
}
```

**Errors**:
- 400: File too large, invalid file type
- 401: Not authenticated
- 403: Not event creator
- 404: Event not found
- 413: Payload too large (>10MB)

---

### RSVP Endpoints

#### POST /api/v1/rsvps
**Purpose**: RSVP to event (FR-016)

**Authentication**: Required

**Request Body**:
```json
{
  "eventId": "uuid"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "userId": "uuid",
  "eventId": "uuid",
  "createdAt": "2026-03-11T10:00:00Z"
}
```

**Side Effects**:
- Increments `events.rsvp_count` (FR-018)

**Errors**:
- 400: Missing eventId, already RSVP'd, event is past
- 401: Not authenticated
- 404: Event not found
- 409: Already RSVP'd to this event

---

#### DELETE /api/v1/rsvps/:eventId
**Purpose**: Cancel RSVP (FR-017)

**Authentication**: Required

**Response** (204 No Content)

**Side Effects**:
- Decrements `events.rsvp_count` (FR-018)

**Errors**:
- 401: Not authenticated
- 404: RSVP not found

---

#### GET /api/v1/rsvps/me
**Purpose**: Get current user's RSVPs (FR-019)

**Authentication**: Required

**Response** (200 OK):
```json
{
  "rsvps": [
    {
      "id": "uuid",
      "event": {
        "id": "uuid",
        "name": "Spring Car Show 2026",
        "eventDate": "2026-04-15T14:00:00Z",
        "location": { ... },
        "rsvpCount": 45
      },
      "rsvpDate": "2026-03-05T12:00:00Z"
    }
  ]
}
```

---

### Follow Endpoints

#### POST /api/v1/follows
**Purpose**: Follow organizer (FR-021)

**Authentication**: Required

**Request Body**:
```json
{
  "userId": "uuid"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "followerId": "uuid",
  "followedId": "uuid",
  "createdAt": "2026-03-11T10:00:00Z"
}
```

**Errors**:
- 400: Missing userId, cannot follow yourself
- 401: Not authenticated
- 404: User not found
- 409: Already following this user

---

#### DELETE /api/v1/follows/:userId
**Purpose**: Unfollow organizer (FR-022)

**Authentication**: Required

**Response** (204 No Content)

**Errors**:
- 401: Not authenticated
- 404: Follow relationship not found

---

#### GET /api/v1/follows/following
**Purpose**: Get list of organizers user is following (FR-023)

**Authentication**: Required

**Response** (200 OK):
```json
{
  "following": [
    {
      "id": "uuid",
      "displayName": "John Doe",
      "followerCount": 25,
      "eventCount": 12,
      "followedAt": "2026-03-01T10:00:00Z"
    }
  ]
}
```

---

#### GET /api/v1/follows/followers/:userId
**Purpose**: Get list of followers for an organizer

**Authentication**: Optional

**Response** (200 OK):
```json
{
  "followers": [
    {
      "id": "uuid",
      "displayName": "Jane Smith",
      "followedAt": "2026-03-01T10:00:00Z"
    }
  ],
  "total": 25
}
```

---

### User/Organizer Profile Endpoints

#### GET /api/v1/users/:id
**Purpose**: Get organizer profile (FR-024)

**Authentication**: Optional

**Response** (200 OK):
```json
{
  "id": "uuid",
  "displayName": "John Doe",
  "stats": {
    "totalEvents": 12,
    "pastEvents": 8,
    "upcomingEvents": 4,
    "averageAttendance": 35.5,
    "totalAttendance": 284,
    "reputationScore": 35.5,
    "followerCount": 25
  },
  "recentEvents": [
    {
      "id": "uuid",
      "name": "Spring Car Show 2026",
      "eventDate": "2026-04-15T14:00:00Z",
      "rsvpCount": 45,
      "isPast": false
    }
  ],
  "userFollowsOrganizer": false
}
```

**Errors**:
- 404: User not found

---

### Notification Endpoints

#### GET /api/v1/notifications
**Purpose**: Get user notifications (FR-027)

**Authentication**: Required

**Query Parameters**:
- `unreadOnly` (boolean, optional, default false): Only show unread notifications
- `limit` (number, optional, default 50): Max results

**Response** (200 OK):
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "new_event_from_followed",
      "message": "Organizer John Doe created a new event: Spring Car Show 2026",
      "event": {
        "id": "uuid",
        "name": "Spring Car Show 2026",
        "eventDate": "2026-04-15T14:00:00Z"
      },
      "isRead": false,
      "createdAt": "2026-03-11T10:00:00Z"
    }
  ],
  "unreadCount": 3
}
```

---

#### PUT /api/v1/notifications/:id/read
**Purpose**: Mark notification as read (FR-028)

**Authentication**: Required (must be notification owner)

**Response** (200 OK):
```json
{
  "id": "uuid",
  "isRead": true
}
```

**Errors**:
- 401: Not authenticated
- 403: Not notification owner
- 404: Notification not found

---

#### PUT /api/v1/notifications/read-all
**Purpose**: Mark all notifications as read

**Authentication**: Required

**Response** (200 OK):
```json
{
  "message": "All notifications marked as read",
  "count": 5
}
```

---

## Error Response Format

All errors follow consistent JSON format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

**Standard Error Codes**:
- `VALIDATION_ERROR` (400): Invalid request data
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource already exists
- `PAYLOAD_TOO_LARGE` (413): File upload too large
- `INTERNAL_SERVER_ERROR` (500): Unexpected server error

---

## Rate Limiting

**Limits**:
- Anonymous requests: 100 req/hour per IP
- Authenticated requests: 1000 req/hour per user
- File uploads: 10 uploads/hour per user

**Headers**:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

**Response** (429 Too Many Requests):
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "retryAfter": 3600
  }
}
```

---

## CORS Policy

**Allowed Origins**: 
- Development: `http://localhost:5173` (Vite dev server)
- Production: `https://car-calendar.com`

**Allowed Methods**: `GET, POST, PUT, DELETE, OPTIONS`

**Allowed Headers**: `Content-Type, Authorization`

**Credentials**: `true` (for cookies)

---

## Versioning

**Current Version**: v1

**URL Format**: `/api/v1/*`

**Breaking Changes**: Will increment version (v2, v3, etc.)

**Deprecation**: v1 supported for minimum 6 months after v2 release

---

## Testing API Contracts

### Integration Tests (Supertest)

Each endpoint should have integration tests covering:
1. **Success cases**: Valid requests return expected responses
2. **Validation errors**: Invalid data returns 400 with error details
3. **Authentication**: Protected endpoints return 401 without token
4. **Authorization**: Users can't access others' resources (403)
5. **Not found**: Invalid IDs return 404
6. **Edge cases**: Duplicate RSVPs, following yourself, etc.

### Contract Testing

Use API contract tests to ensure frontend-backend compatibility:
1. Generate API schemas from this spec
2. Validate all responses match schema
3. Mock API in frontend tests using this contract
4. Run contract tests in CI/CD pipeline

---

## Next Steps

With API contracts defined:
1. ✅ Phase 0 complete: Research and technology decisions
2. ✅ Phase 1a complete: Data model design
3. ✅ Phase 1b complete: API contracts
4. → Phase 1c: Create quickstart guide (`quickstart.md`)
5. → Phase 1d: Update agent context
