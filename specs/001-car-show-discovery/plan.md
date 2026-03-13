# Implementation Plan: Car Show Discovery Platform

**Branch**: `001-car-show-discovery` | **Date**: 2026-03-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-car-show-discovery/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a car show discovery platform where users can find, RSVP to, and create car show/meet events in their area. The platform enables event discovery with location-based search, sorting by multiple factors (distance, date, popularity, organizer reputation), RSVPs with attendance tracking, following organizers for notifications, and event creation/management. Technical approach: React frontend + Node.js REST API backend with geolocation services for distance calculations.

## Technical Context

**Language/Version**: 
- Frontend: JavaScript/React (latest stable) with Vite v7.3.1 build tool
- Backend: Node.js v22 LTS with Express v5.x

**Primary Dependencies**: 
- Frontend: React, React Router, Zustand (state management ~1.2KB), native fetch API
- Backend: Express v5.x for REST API
- Geolocation: geolib v3.3.4 for distance calculations (~7-8KB)
- Image Upload: Cloudflare R2 (S3-compatible) with @aws-sdk/client-s3

**Storage**: PostgreSQL v16.x with PostGIS extension for geospatial queries

**Testing**: 
- Frontend: Vitest + React Testing Library + jsdom
- Backend: Vitest + Supertest for API testing
- E2E: Playwright for end-to-end user flows

**Target Platform**: 
- Frontend: Modern web browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- Backend: Linux/MacOS server environment

**Project Type**: Web application (frontend + backend)

**Performance Goals**: 
- API response time: <200ms for list queries, <100ms for single entity queries
- Distance calculations: <2 seconds for sorting operations
- RSVP updates: <2 seconds end-to-end
- Support 1000 concurrent users (per SC-010)
- Event search results: <2 seconds (per SC-006, SC-009)

**Constraints**: 
- Location accuracy: within 1 mile margin of error (per SC-007)
- Browser geolocation API support required
- Must handle concurrent RSVP updates correctly (FR-020)
- File upload size limit: 10MB per flier image/PDF

**Scale/Scope**: 
- Initial target: 1000 concurrent users, 10,000+ events
- 5 major user stories, 41 functional requirements
- Frontend: ~10-15 components, 5-8 pages
- Backend: ~15-20 API endpoints, 7 data models

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Frontend-First UI ✅
- **Status**: COMPLIANT
- **Evidence**: Feature spec describes a web-based UI for discovering events. React-based frontend planned with component-driven development.
- **Components needed**: EventList, EventCard, EventDetail, CreateEventForm, UserProfile, SortControls, LocationInput, NotificationBell, OrganizerProfile
- **Action**: Each component will be independently testable per constitution

### Principle II: Node.js Backend ✅
- **Status**: COMPLIANT
- **Evidence**: Backend planned in Node.js with RESTful API design.
- **API contracts**: Will define clear contracts between frontend and backend (Phase 1)
- **Services**: Event service, User service, RSVP service, Follow service, Notification service, Geolocation service

### Principle III: Test-First Development (NON-NEGOTIABLE) ✅
- **Status**: COMPLIANT
- **Commitment**: TDD mandatory - all tests written and approved before implementation
- **Process**: Red-Green-Refactor cycle will be strictly enforced
- **Test categories**: Unit tests (models, services), Integration tests (API contracts), E2E tests (user flows)
- **Action**: Phase 2 will generate test stubs that must fail before any implementation

### Principle IV: Integration Testing ✅
- **Status**: COMPLIANT
- **Focus areas**:
  - API contract tests between frontend and backend (all 41 functional requirements)
  - Frontend-backend integration flows (5 user stories)
  - Data persistence and retrieval (7 entities)
  - Concurrent RSVP handling (FR-020)
  - Geolocation and distance calculations (FR-003, FR-037)

### Principle V: Simplicity & Minimal Dependencies ✅
- **Status**: COMPLIANT
- **Approach**: Start with minimal stack - React + Node.js + single database
- **Dependencies to justify**: 
  - Geolocation library (required for FR-003, FR-037 - distance calculations)
  - Image upload/storage (required for FR-030 - flier images)
  - Authentication library (required for FR-012-015 - user accounts)
- **YAGNI**: No unnecessary features, stick to 41 functional requirements only

### Overall Gate Status: ✅ PASS (Initial Check)
All constitutional principles satisfied. Ready to proceed with Phase 0 research.

---

### Post-Phase 1 Design Review ✅

**Date**: 2026-03-11  
**Artifacts Reviewed**: research.md, data-model.md, api-contracts.md, quickstart.md

#### Principle I: Frontend-First UI ✅
- **Revalidation**: COMPLIANT
- **Evidence**: 
  - React components defined across 4 categories (events/, users/, common/, layout/)
  - Each component independently testable with Vitest + React Testing Library
  - Clear separation of concerns (components, pages, services, hooks, store)
  - Zustand state management keeps components clean and testable

#### Principle II: Node.js Backend ✅
- **Revalidation**: COMPLIANT
- **Evidence**:
  - Express v5.x chosen for REST API (simple, unopinionated)
  - Clear API contracts defined (20 endpoints, consistent error formatting)
  - Services self-contained: EventService, UserService, RSVPService, FollowService, NotificationService
  - Independent deployability maintained

#### Principle III: Test-First Development ✅
- **Revalidation**: COMPLIANT
- **Evidence**:
  - Vitest chosen for unit testing (frontend + backend)
  - Supertest for API integration tests
  - Playwright for E2E tests
  - All endpoints have defined test scenarios in api-contracts.md
  - Quickstart guide emphasizes TDD workflow (write tests → approve → implement)

#### Principle IV: Integration Testing ✅
- **Revalidation**: COMPLIANT
- **Evidence**:
  - API contract tests defined for all 20 endpoints
  - Integration test categories specified: API contracts, frontend-backend flows, data persistence, concurrent operations
  - Supertest integration confirmed
  - E2E test framework (Playwright) selected

#### Principle V: Simplicity & Minimal Dependencies ✅
- **Revalidation**: COMPLIANT
- **Evidence**:
  - Dependencies justified in research.md:
    - geolib v3.3.4: Required for geospatial calculations (FR-003, FR-037)
    - Cloudflare R2: Required for image storage (FR-030), simple S3-compatible API
    - Zustand: Minimal state management (~1.2KB), simpler than Redux
    - Express: Minimal, unopinionated framework vs Fastify/Koa
  - Technology choices prioritize simplicity (Vite over Next.js, native fetch over axios, PostgreSQL over MongoDB for relational data)
  - No unnecessary features added beyond 41 FRs

#### Final Gate Status: ✅ PASS
All constitutional principles remain satisfied after Phase 1 design. Technology stack aligns with simplicity principle. Ready to proceed to Phase 2 (task generation).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

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
│   ├── context/          # React Context for state management
│   └── utils/            # Frontend utilities
├── tests/
│   ├── unit/             # Component unit tests
│   ├── integration/      # Frontend-backend integration tests
│   └── e2e/              # End-to-end user flow tests
└── package.json

shared/
└── types/                # Shared TypeScript types (if using TypeScript)
```

**Structure Decision**: Web application structure (Option 2) selected. Separate `backend/` and `frontend/` directories for clear separation of concerns per Constitution Principle I and II. Each has independent test suites. Shared types directory optional based on TypeScript adoption decision in Phase 0.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations. All constitutional principles satisfied.

---

## Phase Completion Status

### ✅ Phase 0: Outline & Research (COMPLETE)

**Completed**: 2026-03-11  
**Output**: [research.md](./research.md)

**Decisions Made**:
- Frontend Build: Vite v7.3.1 (rejected: CRA, Next.js)
- Backend Framework: Express v5.x (rejected: Fastify, Koa)
- Database: PostgreSQL v16.x + PostGIS (rejected: MongoDB, SQLite)
- Geolocation: geolib v3.3.4 (rejected: Turf.js, geodist)
- Image Storage: Cloudflare R2 (rejected: local filesystem, AWS S3, UploadThing)
- Testing: Vitest + Supertest + Playwright (rejected: Jest, Mocha, Cypress)
- State Management: Zustand (rejected: Redux Toolkit, Context API)

All "NEEDS CLARIFICATION" items from Technical Context resolved.

---

### ✅ Phase 1: Design & Contracts (COMPLETE)

**Completed**: 2026-03-11  
**Outputs**:
- [data-model.md](./data-model.md) - 7 entities, relationships, SQL schema
- [contracts/api-contracts.md](./contracts/api-contracts.md) - 20 REST endpoints
- [quickstart.md](./quickstart.md) - Development setup guide
- [AGENTS.md](../../AGENTS.md) - Agent context updated

**Artifacts Created**:
1. **Data Model**: 7 entities (User, Event, Location, RSVP, Follow, Notification, Organizer Reputation)
2. **API Contracts**: 20 endpoints covering all 41 functional requirements
3. **Database Schema**: PostgreSQL schema with PostGIS, triggers, indexes
4. **Development Guide**: 5-minute quickstart with Docker setup

**Constitution Re-check**: ✅ PASS - All principles remain satisfied

---

### → Phase 2: Task Generation (NEXT STEP)

**Command**: `/speckit.tasks`

**Purpose**: Break down implementation into actionable tasks

**Expected Output**: `specs/001-car-show-discovery/tasks.md`

**Task Categories**:
1. Project setup (initialize repos, configure tooling)
2. Database setup (migrations, seed data)
3. Backend implementation (models, services, API endpoints)
4. Frontend implementation (components, pages, state management)
5. Integration testing (API contracts, E2E flows)
6. Deployment preparation

**Note**: Phase 2 is NOT part of `/speckit.plan` command. Run `/speckit.tasks` next.

---

## Summary

**Planning Phase Complete** ✅

The implementation plan for the Car Show Discovery Platform is complete with:
- ✅ All technology decisions researched and justified
- ✅ Data model designed with 7 entities and relationships
- ✅ 20 API endpoints defined with contracts
- ✅ Development environment documented
- ✅ Constitutional compliance verified twice (pre and post-design)

**Ready for**: `/speckit.tasks` to generate actionable implementation tasks

**Branch**: `001-car-show-discovery`  
**Spec**: [spec.md](./spec.md)  
**Plan**: This file
