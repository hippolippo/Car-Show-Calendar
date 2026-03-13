# Technical Research: Car Show Discovery Platform

**Date**: 2026-03-11  
**Phase**: Phase 0 - Technology Stack Research  
**Purpose**: Resolve all "NEEDS CLARIFICATION" items from Technical Context

---

## Research Summary

This document consolidates research findings for all technology decisions needed to implement the Car Show Discovery Platform. Each decision was evaluated against the project's constitutional principles (simplicity, minimal dependencies, TDD-first) and specific requirements (geolocation, 1000 concurrent users, <200ms response times).

---

## 1. Frontend Build Tool

### Decision: Vite

### Rationale
Vite is the clear choice for a pure SPA car show discovery app in 2026. It's actively maintained (v7.3.1), powered by Rolldown (a fast Rust-based bundler), and provides instant dev server startup with lightning-fast HMR. It aligns perfectly with the simplicity principle—minimal configuration with sensible defaults, and the official React documentation now recommends it for building React apps from scratch.

### Alternatives Considered

**Create React App (CRA)**:
- Status: DEPRECATED (officially in "long-term stasis")
- Rejection Reason: Facebook explicitly deprecated CRA and redirects users to frameworks or Vite. Unmaintained, uses outdated webpack 4/5 config. No active development or security updates.

**Next.js**:
- Status: Actively maintained (v16 released)
- Rejection Reason: Massive overkill for a pure SPA. Full-stack meta-framework designed for server-side rendering, API routes, and complex routing. Adds significant complexity (App Router, Server Components, middleware) that violates simplicity requirement.

### Implementation
```bash
npm create vite@latest car-calendar -- --template react
cd car-calendar
npm install
npm run dev
```

---

## 2. Backend Framework

### Decision: Express

### Rationale
Express remains the best choice for the car show discovery platform because: (1) **Simplicity alignment** - Its unopinionated, minimal API perfectly matches the constitutional principle of simplicity; 15-20 endpoints don't justify Fastify's schema-based complexity. (2) **Sufficient performance** - While 5x slower than Fastify in synthetic benchmarks, Express easily handles <200ms/1000-user requirements with standard hardware. (3) **Ecosystem maturity** - The largest middleware ecosystem and community means faster development velocity and easier troubleshooting for a small team.

### Alternatives Considered

**Fastify**:
- Performance: 46,664 req/sec (5x faster than Express)
- Rejection Reason: The schema-based validation system and plugin architecture add unnecessary complexity for a simple REST API. The 5x performance gain is overkill for requirements - would need 5000+ concurrent users to justify the learning curve.

**Koa**:
- Performance: 35,086 req/sec (middle ground)
- Rejection Reason: Minimal core requires assembling basic features from scratch (routing, body parsing), which violates simplicity by increasing decision overhead. The context API paradigm shift doesn't provide enough benefit over Express's familiar req/res pattern.

### Implementation
```bash
npm install express
npm install --save-dev supertest  # for API testing
```

---

## 3. Database

### Decision: PostgreSQL with PostGIS

### Rationale
PostgreSQL with PostGIS extension provides native geospatial support (distance calculations, radius queries), ACID transactions for concurrent RSVPs (FR-020), and excellent relational modeling for many-to-many relationships (RSVPs, follows). It remains simple to deploy and operate while handling 1000+ concurrent users with proven scalability. The constitution's "simplicity" principle is satisfied through PostgreSQL's single-process architecture, strong Node.js driver support, and minimal operational overhead.

### Key Capabilities
- **Geospatial**: Native `ST_Distance()` function with Earth geodesic calculations
- **Relational Model**: Perfect fit for 7 entities with many-to-many relationships
- **Concurrency**: Row-level locking and ACID transactions ensure accurate RSVP counts
- **Performance**: Easily handles 10K+ events, 1000 concurrent users

### Alternatives Considered

**MongoDB**:
- Strengths: Strong geospatial capabilities with 2dsphere indexes
- Rejection Reason: Document model adds unnecessary complexity for highly relational data (users ↔ events ↔ RSVPs ↔ follows). Transaction support exists but is less mature than PostgreSQL. Would require more complex query logic for many-to-many relationships.

**SQLite**:
- Strengths: Excellent simplicity and zero configuration
- Rejection Reason: R*Tree geospatial extension is less capable (no native distance calculations, manual coordinate math required). Concurrent write limitations would struggle with FR-020's concurrent RSVP requirement and 1000 concurrent users. Better suited for embedded/mobile use cases.

### Implementation
```bash
npm install pg  # PostgreSQL client
npm install postgis  # PostGIS helper functions (optional)
```

**Development Setup**: Use PostgreSQL in Docker for local development
**Testing**: SQLite for unit tests (fast, no setup), PostgreSQL for integration tests
**Production**: Managed PostgreSQL service (AWS RDS, Heroku, Supabase)

---

## 4. Geolocation Library

### Decision: geolib

### Rationale
Geolib strikes the perfect balance for the use case. It provides both fast (`getDistance`) and precise (`getPreciseDistance`) distance calculations with zero dependencies, a tiny bundle size, and the simplest API. The `orderByDistance()` helper function directly addresses the need to sort 100+ events by distance. Its accuracy (within meters) far exceeds the 1-mile margin requirement, and it will easily handle sorting 100+ events in under 2 seconds.

### Key Features
- Zero dependencies
- Bundle size: ~7-8 KB minified + gzipped
- Both fast (Haversine) and precise (Vincenty) distance calculations
- Simple API: `getDistance({lat, lon}, {lat, lon})`
- Helper function: `orderByDistance()` for sorting
- TypeScript support

### Alternatives Considered

**Turf.js**:
- Performance: Very fast for distance calculations
- Rejection Reason: Full package is unnecessarily heavy (144 KB). While `@turf/distance` alone is small, geolib offers more distance-specific utilities without needing to compose multiple Turf modules. Better for comprehensive geospatial work, overkill for distance-only needs.

**geodist**:
- Performance: Fast, minimal overhead
- Rejection Reason: Abandoned (last update 2014) and lacks modern JavaScript/TypeScript features. No maintenance means no bug fixes or security updates, violating "simple and minimal" constitution requirement.

### Implementation
```bash
npm install geolib
```

```javascript
import { getDistance, orderByDistance } from 'geolib';

// Calculate distance (returns meters)
const distance = getDistance(
  { latitude: 51.5103, longitude: 7.49347 },
  { latitude: 51.525, longitude: 7.4575 }
);

// Sort events by distance
const sortedEvents = orderByDistance(
  userLocation,
  events.map(e => e.coordinates)
);
```

---

## 5. Image Upload & Storage

### Decision: Cloudflare R2

### Rationale
For a car show discovery platform starting small with potential to scale to 10,000+ events, Cloudflare R2 offers the ideal balance of simplicity, cost-effectiveness, and performance. It aligns perfectly with the constitution's "simplicity & minimal dependencies" principle while providing S3-compatible APIs that prevent vendor lock-in. The zero egress fees are crucial for a read-heavy platform displaying event fliers, and the automatic global CDN distribution ensures fast loading times without additional configuration.

### Key Benefits
- **Cost**: Free tier (10GB storage), then $0.015/GB-month (vs $0.023/GB-month for S3)
- **Zero egress fees**: No bandwidth charges (vs $0.09/GB for S3)
- **S3-compatible API**: No vendor lock-in, can migrate if needed
- **Automatic CDN**: Global distribution included
- **Simple API**: Standard S3 client works

### Cost Projection
- **Small scale (100 events, avg 2MB fliers)**: ~$0.003/month storage
- **Medium scale (5,000 events)**: ~$0.15/month storage
- **Large scale (10,000 events, 100K views/month)**: ~$0.30/month storage + $0 egress
- Compare to S3 at same scale: $0.23/month storage + ~$1,800/month egress = $1,800.23/month

### Alternatives Considered

**Local Filesystem Storage**:
- Simplicity: Easy to implement initially
- Rejection Reason: Fails to scale beyond a single server, lacks CDN capabilities, creates backup/reliability concerns. Would cost more in engineering time than storage fees.

**AWS S3**:
- Reliability: 99.999999999% durability
- Rejection Reason: Egress fees of $0.09/GB make it prohibitively expensive for read-heavy platform where each flier might be viewed hundreds of times. Complex pricing violates simplicity principle.

**UploadThing**:
- Developer Experience: Simplest with built-in authentication flow
- Rejection Reason: Free tier (2GB) suitable for development, but jump to $10/month for 100GB is steep compared to R2's pay-as-you-grow model. Great for prototyping, but R2 offers better long-term economics.

### Implementation
```bash
npm install @aws-sdk/client-s3  # S3-compatible client for R2
```

```javascript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// Upload image
await r2.send(new PutObjectCommand({
  Bucket: 'car-calendar',
  Key: `fliers/${eventId}.jpg`,
  Body: fileBuffer,
  ContentType: 'image/jpeg',
}));

// Public URL
const imageUrl = `https://pub-${R2_PUBLIC_ID}.r2.dev/fliers/${eventId}.jpg`;
```

---

## 6. Testing Frameworks

### Decisions

**Frontend Unit Testing**: Vitest with React Testing Library
- **Rationale**: Vitest is now the modern standard for Vite-based projects with native ESM support, exceptional speed, Jest compatibility, and out-of-box TypeScript support. Actively maintained by VoidZero (creator of Vite) and has become the de facto standard for modern React applications.

**Backend Unit Testing**: Vitest
- **Rationale**: Despite not using Vite for the backend, Vitest works excellently for Node.js code and offers superior performance, modern ESM support, TypeScript support without configuration, and a unified testing experience across the entire stack.

**API Integration Testing**: Supertest with Vitest
- **Rationale**: Supertest remains the industry standard for HTTP assertion testing in Node.js. It integrates seamlessly with any test runner (including Vitest) and provides an expressive API for testing REST endpoints.

**E2E Testing**: Playwright
- **Rationale**: Playwright has emerged as the clear leader for E2E testing in 2026, backed by Microsoft with excellent cross-browser support (Chromium, Firefox, WebKit), superior reliability with auto-wait and web-first assertions, powerful debugging tools, and faster execution than Cypress.

### Implementation
```bash
# Frontend testing
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom

# Backend testing
npm install --save-dev vitest supertest

# E2E testing
npm install --save-dev @playwright/test
```

---

## 7. React State Management

### Decision: Zustand

### Rationale
Zustand is the optimal choice for the car show discovery platform. It provides the simplest API with minimal boilerplate while maintaining excellent performance characteristics. For a moderate complexity app with a small initial team, Zustand offers the fastest development velocity without sacrificing scalability. The ~1KB bundle size is negligible, and the lack of providers makes code cleaner and easier to maintain.

### Key Benefits
- **Bundle Size**: ~1.2 KB gzipped (vs 13 KB for Redux Toolkit)
- **Learning Curve**: Minimal API surface - just `create()` and `set()`
- **Boilerplate**: No providers, reducers, or action creators required
- **Performance**: Fine-grained subscriptions, no context rerenders
- **DevTools**: Redux DevTools integration via middleware

### Alternatives Considered

**Redux Toolkit**:
- Strengths: Best-in-class DevTools, excellent performance at scale
- Rejection Reason: Unnecessary complexity and learning curve for moderate use case. Architecture overhead doesn't justify benefits for auth/events/location state. Better suited for highly complex domains with normalized data requirements.

**React Context API**:
- Strengths: Built into React, no new library
- Rejection Reason: Poor performance characteristics at moderate scale and high boilerplate needed to prevent unnecessary rerenders. Requires multiple contexts and careful memoization, contradicting simplicity principle.

### Implementation
```bash
npm install zustand
```

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }),
      
      // Location
      location: null,
      setLocation: (location) => set({ location }),
      
      // Events
      events: [],
      setEvents: (events) => set({ events }),
      
      // RSVPs
      rsvps: [],
      addRsvp: (eventId) => set((state) => ({ 
        rsvps: [...state.rsvps, eventId] 
      })),
    }),
    { name: 'car-calendar-storage' }
  )
);
```

---

## 8. Additional Technology Decisions

### Node.js Version
**Decision**: Node.js v22 LTS (current LTS in 2026)
**Rationale**: Long-term support, active maintenance, modern JavaScript features (ESM, top-level await)

### Package Manager
**Decision**: npm (comes with Node.js)
**Rationale**: No additional installation, sufficient for project needs, aligns with simplicity principle

### HTTP Client (Frontend)
**Decision**: Native `fetch` API
**Rationale**: Built into browsers, no additional dependency needed, sufficient for REST API calls

### Authentication
**Decision**: JWT with httpOnly cookies (to be detailed in Phase 1)
**Rationale**: Industry standard, stateless, simple to implement with Express middleware

### File Upload Size Limit
**Decision**: 10MB per file
**Rationale**: Sufficient for high-quality flier images/PDFs, prevents abuse, reasonable for most event organizers

---

## Technology Stack Summary

| Category | Choice | Version/Notes |
|----------|--------|---------------|
| **Frontend Build** | Vite | v7.3.1 |
| **Frontend Framework** | React | Latest stable |
| **Backend Framework** | Express | v5.x |
| **Database** | PostgreSQL + PostGIS | v16.x + latest PostGIS |
| **Geolocation** | geolib | v3.3.4 |
| **Image Storage** | Cloudflare R2 | S3-compatible |
| **State Management** | Zustand | v5.x |
| **Frontend Testing** | Vitest + React Testing Library | Latest |
| **Backend Testing** | Vitest + Supertest | Latest |
| **E2E Testing** | Playwright | Latest |
| **HTTP Client** | Native fetch | Built-in |
| **Node.js** | v22 LTS | Latest LTS |
| **Package Manager** | npm | Built-in |

---

## Constitutional Compliance Check

All technology choices align with the project constitution:

✅ **Frontend-First UI**: React with Vite provides modern component-driven development  
✅ **Node.js Backend**: Express backend with REST API design  
✅ **Test-First Development**: Vitest + Playwright support TDD workflow  
✅ **Integration Testing**: Supertest for API contracts, Playwright for E2E  
✅ **Simplicity & Minimal Dependencies**: All choices prioritize simplicity and avoid unnecessary complexity

---

## Next Steps

Phase 1 will use these technology decisions to:
1. Design data model (7 entities: User, Event, RSVP, Follow, Notification, Location, Organizer Reputation)
2. Define API contracts (15-20 REST endpoints)
3. Create quickstart guide for development setup
4. Update agent context with new technologies
