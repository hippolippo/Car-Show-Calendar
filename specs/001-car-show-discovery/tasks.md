# Tasks: Car Show Discovery Platform

**Feature Branch**: `001-car-show-discovery`  
**Date**: 2026-03-11  
**Input**: Design documents from `/specs/001-car-show-discovery/`

**Implementation Strategy**: MVP-first approach with incremental delivery. Tests are included per TDD requirement (Constitution Principle III).

**Note**: R2 (Cloudflare R2) integration is deferred - using local filesystem for flier storage in MVP.

---

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: `- [ ]` (required)
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, US4, US5)
- **File paths**: Exact paths included in descriptions

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create project structure and initialize both frontend and backend

- [x] T001 Create project directory structure: backend/, frontend/, specs/ per plan.md
- [x] T002 [P] Initialize backend Node.js project with Express in backend/package.json
- [x] T003 [P] Initialize frontend React project with Vite in frontend/package.json
- [x] T004 [P] Install backend dependencies in backend/package.json: express, pg, bcrypt, jsonwebtoken, geolib, dotenv
- [x] T005 [P] Install backend dev dependencies in backend/package.json: vitest, supertest, @types/node
- [x] T006 [P] Install frontend dependencies in frontend/package.json: react, react-dom, react-router-dom, zustand
- [x] T007 [P] Install frontend dev dependencies in frontend/package.json: vitest, @testing-library/react, @testing-library/jest-dom, jsdom, @playwright/test
- [x] T008 [P] Configure Vitest for backend in backend/vitest.config.js
- [x] T009 [P] Configure Vitest for frontend in frontend/vitest.config.js
- [x] T010 [P] Configure Playwright for E2E tests in frontend/playwright.config.js
- [x] T011 [P] Create backend environment template in backend/.env.example
- [x] T012 [P] Create frontend environment template in frontend/.env.example
- [x] T013 Setup PostgreSQL (installed via Homebrew on macOS)
- [x] T014 [P] Create ESLint configuration in backend/.eslintrc.json
- [x] T015 [P] Create ESLint configuration in frontend/.eslintrc.json

**Checkpoint**: Project structure ready, all dependencies installed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Foundation

- [x] T016 Enable PostGIS extension in PostgreSQL database (using lat/lon decimals temporarily)
- [x] T017 Create migration framework configuration in backend/migrations/config.js
- [x] T018 Create initial database schema migration in backend/migrations/001_initial_schema.sql (users, locations, events, rsvps, follows, notifications tables)
- [x] T019 Create database triggers migration in backend/migrations/002_triggers.sql (RSVP count update, mark past events, notify followers)
- [x] T020 Create organizer reputation materialized view in backend/migrations/003_organizer_reputation.sql
- [x] T021 Run migrations to initialize database schema

### Backend Core Infrastructure

- [x] T022 [P] Create database connection pool in backend/src/config/database.js
- [x] T023 [P] Create JWT configuration in backend/src/config/auth.js
- [x] T024 [P] Create authentication middleware in backend/src/api/middleware/auth.js
- [x] T025 [P] Create error handling middleware in backend/src/api/middleware/errorHandler.js
- [x] T026 [P] Create validation middleware in backend/src/api/middleware/validation.js
- [x] T027 Create Express app setup in backend/src/app.js (middleware, routes, error handling)
- [x] T028 Create server entry point in backend/src/index.js

### Frontend Core Infrastructure

- [x] T029 [P] Create API client service in frontend/src/services/api.js (fetch wrapper with auth)
- [x] T030 [P] Create Zustand store in frontend/src/store/appStore.js (user, location, events, rsvps state)
- [x] T031 [P] Create auth service in frontend/src/services/authService.js
- [x] T032 [P] Create router configuration in frontend/src/router.jsx
- [x] T033 [P] Create layout components in frontend/src/components/layout/Header.jsx
- [x] T034 [P] Create layout components in frontend/src/components/layout/Footer.jsx
- [x] T035 Create main App component in frontend/src/App.jsx

### Test Infrastructure

- [x] T036 [P] Create test database setup utility in backend/tests/setup.js
- [x] T037 [P] Create API test helpers in backend/tests/helpers/apiHelpers.js
- [x] T038 [P] Create frontend test utilities in frontend/tests/setup.js
- [x] T039 [P] Create seed data fixtures in backend/tests/fixtures/seedData.js

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 5 - Create and Manage Events (Priority: P1) 🎯 MVP

**Goal**: Enable organizers to create, edit, and delete car show events so the platform has content

**Independent Test**: Create an event with all required fields and verify it appears in database and can be viewed

**Why First**: Without events, there's nothing to discover. Must populate platform with content before discovery features.

### Tests for User Story 5 (TDD Required)

> **TDD**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T040 [P] [US5] Contract test for POST /api/v1/events in backend/tests/integration/events.create.test.js
- [ ] T041 [P] [US5] Contract test for PUT /api/v1/events/:id in backend/tests/integration/events.update.test.js
- [ ] T042 [P] [US5] Contract test for DELETE /api/v1/events/:id in backend/tests/integration/events.delete.test.js
- [ ] T043 [P] [US5] Unit test for EventService in backend/tests/unit/services/eventService.test.js
- [ ] T044 [P] [US5] Frontend test for CreateEventForm component in frontend/tests/unit/components/events/CreateEventForm.test.jsx
- [ ] T045 [P] [US5] E2E test for create event flow in frontend/tests/e2e/createEvent.spec.js

### Implementation for User Story 5

#### Backend Models & Services

- [x] T046 [P] [US5] Create User model in backend/src/models/User.js (register, login, findById, findByEmail)
- [x] T047 [P] [US5] Create Location model in backend/src/models/Location.js (create, findById, geocode coordinates)
- [x] T048 [US5] Create Event model in backend/src/models/Event.js (create, findById, update, delete, findByOrganizer)
- [x] T049 [US5] Implement EventService in backend/src/services/EventService.js (validation, location creation, event CRUD)
- [x] T050 [P] [US5] Implement AuthService in backend/src/services/AuthService.js (register, login, verify token)

#### Backend API Endpoints

- [x] T051 [P] [US5] Implement POST /api/v1/auth/register controller in backend/src/api/controllers/authController.js
- [x] T052 [P] [US5] Implement POST /api/v1/auth/login controller in backend/src/api/controllers/authController.js
- [x] T053 [P] [US5] Implement POST /api/v1/auth/logout controller in backend/src/api/controllers/authController.js
- [x] T054 [P] [US5] Implement GET /api/v1/auth/me controller in backend/src/api/controllers/authController.js
- [x] T055 [US5] Create auth routes in backend/src/api/routes/authRoutes.js
- [x] T056 [P] [US5] Implement POST /api/v1/events controller in backend/src/api/controllers/eventController.js
- [x] T057 [P] [US5] Implement PUT /api/v1/events/:id controller in backend/src/api/controllers/eventController.js
- [x] T058 [P] [US5] Implement DELETE /api/v1/events/:id controller in backend/src/api/controllers/eventController.js
- [x] T059 [US5] Create event routes in backend/src/api/routes/eventRoutes.js
- [x] T060 [US5] Mount auth and event routes in backend/src/app.js

#### Frontend Components

- [x] T061 [P] [US5] Create LocationInput component in frontend/src/components/common/LocationInput.jsx (address autocomplete, coordinates)
- [x] T062 [US5] Create CreateEventForm component in frontend/src/components/events/CreateEventForm.jsx (form fields, validation)
- [x] T063 [US5] Create CreateEventPage in frontend/src/pages/CreateEventPage.jsx
- [x] T064 [P] [US5] Create Login component in frontend/src/components/auth/Login.jsx
- [x] T065 [P] [US5] Create Register component in frontend/src/components/auth/Register.jsx
- [x] T066 [US5] Add event creation routes to frontend/src/router.jsx

#### Integration

- [x] T067 [US5] Connect CreateEventForm to API in frontend/src/services/eventService.js
- [x] T068 [US5] Add event creation success/error handling in frontend/src/components/events/CreateEventForm.jsx
- [x] T069 [US5] Run User Story 5 tests and verify all pass

**Checkpoint**: User Story 5 complete - organizers can create, edit, and delete events

---

## Phase 4: User Story 1 - Discover Local Car Events (Priority: P1) 🎯 MVP

**Goal**: Enable users to find upcoming car shows near their location with basic sorting by distance

**Independent Test**: Enter a location and view list of events with distances, sorted by proximity

### Tests for User Story 1 (TDD Required)

> **TDD**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T070 [P] [US1] Contract test for GET /api/v1/events in backend/tests/integration/events.list.test.js
- [ ] T071 [P] [US1] Contract test for GET /api/v1/events/:id in backend/tests/integration/events.detail.test.js
- [ ] T072 [P] [US1] Unit test for distance calculations in backend/tests/unit/utils/distance.test.js
- [ ] T073 [P] [US1] Frontend test for EventList component in frontend/tests/unit/components/events/EventList.test.jsx
- [ ] T074 [P] [US1] Frontend test for EventCard component in frontend/tests/unit/components/events/EventCard.test.jsx
- [ ] T075 [P] [US1] E2E test for event discovery flow in frontend/tests/e2e/discoverEvents.spec.js

### Implementation for User Story 1

#### Backend Services

- [x] T076 [US1] Extend Event model with findNearby query in backend/src/models/Event.js (PostGIS geospatial query)
- [x] T077 [P] [US1] Create distance calculation utility in backend/src/utils/distance.js (geolib integration)
- [x] T078 [US1] Implement event listing logic in backend/src/services/EventService.js (location search, distance sorting)

#### Backend API Endpoints

- [x] T079 [P] [US1] Implement GET /api/v1/events controller in backend/src/api/controllers/eventController.js (query params, pagination)
- [x] T080 [P] [US1] Implement GET /api/v1/events/:id controller in backend/src/api/controllers/eventController.js
- [x] T081 [US1] Add event listing routes to backend/src/api/routes/eventRoutes.js

#### Frontend Components

- [x] T082 [P] [US1] Create EventCard component in frontend/src/components/events/EventCard.jsx (displays event summary)
- [x] T083 [P] [US1] Create EventList component in frontend/src/components/events/EventList.jsx (renders event cards)
- [x] T084 [P] [US1] Create EventDetail component in frontend/src/components/events/EventDetail.jsx (full event info)
- [x] T085 [US1] Create HomePage in frontend/src/pages/HomePage.jsx (location input, event list)
- [x] T086 [US1] Create EventDetailPage in frontend/src/pages/EventDetailPage.jsx
- [x] T087 [US1] Add event routes to frontend/src/router.jsx

#### Integration

- [x] T088 [US1] Connect EventList to API in frontend/src/services/eventService.js (fetch events)
- [x] T089 [US1] Implement location detection in frontend/src/hooks/useGeolocation.js (browser geolocation API)
- [x] T090 [US1] Add location state to Zustand store in frontend/src/store/appStore.js
- [x] T091 [US1] Run User Story 1 tests and verify all pass

**Checkpoint**: User Story 1 complete - users can discover events near their location

---

## Phase 5: User Story 2 - Sort and Filter Events (Priority: P2)

**Goal**: Enable users to customize event display with multiple sorting criteria (date, popularity, organizer reputation)

**Independent Test**: Apply different sort options and verify event list reorders correctly

### Tests for User Story 2 (TDD Required)

> **TDD**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T092 [P] [US2] Contract test for weighted sorting in backend/tests/integration/events.sort.test.js
- [ ] T093 [P] [US2] Unit test for sorting algorithms in backend/tests/unit/services/sortingService.test.js
- [ ] T094 [P] [US2] Frontend test for SortControls component in frontend/tests/unit/components/common/SortControls.test.jsx
- [ ] T095 [P] [US2] E2E test for sorting flows in frontend/tests/e2e/sortEvents.spec.js

### Implementation for User Story 2

#### Backend Services

- [ ] T096 [US2] Extend Event model with sorting queries in backend/src/models/Event.js (date, popularity, reputation)
- [ ] T097 [US2] Create SortingService in backend/src/services/SortingService.js (weighted scoring algorithm)
- [ ] T098 [US2] Add organizer reputation query in backend/src/models/User.js (joins with materialized view)

#### Backend API Endpoints

- [ ] T099 [US2] Extend GET /api/v1/events controller with sorting params in backend/src/api/controllers/eventController.js
- [ ] T100 [US2] Add sort validation middleware in backend/src/api/middleware/validation.js

#### Frontend Components

- [x] T101 [US2] Create SortControls component in frontend/src/components/common/SortControls.jsx (dropdown, weight sliders)
- [x] T102 [US2] Integrate SortControls into HomePage in frontend/src/pages/HomePage.jsx
- [x] T103 [US2] Add sort preferences to Zustand store in frontend/src/store/appStore.js

#### Integration

- [x] T104 [US2] Update eventService to handle sort params in frontend/src/services/eventService.js
- [x] T105 [US2] Add URL query params for sort state in frontend/src/pages/HomePage.jsx
- [ ] T106 [US2] Run User Story 2 tests and verify all pass

**Checkpoint**: User Story 2 complete - users can sort events by multiple criteria

---

## Phase 6: User Story 3 - RSVP to Events (Priority: P2)

**Goal**: Enable users to indicate attendance intentions and see attendance counts

**Independent Test**: RSVP to an event and verify attendance count increases

### Tests for User Story 3 (TDD Required)

> **TDD**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T107 [P] [US3] Contract test for POST /api/v1/rsvps in backend/tests/integration/rsvps.create.test.js
- [ ] T108 [P] [US3] Contract test for DELETE /api/v1/rsvps/:eventId in backend/tests/integration/rsvps.delete.test.js
- [ ] T109 [P] [US3] Contract test for GET /api/v1/rsvps/me in backend/tests/integration/rsvps.list.test.js
- [ ] T110 [P] [US3] Unit test for concurrent RSVP handling in backend/tests/unit/services/rsvpService.test.js
- [ ] T111 [P] [US3] Frontend test for RSVP button in frontend/tests/unit/components/events/RSVPButton.test.jsx
- [ ] T112 [P] [US3] E2E test for RSVP flow in frontend/tests/e2e/rsvpEvent.spec.js

### Implementation for User Story 3

#### Backend Models & Services

- [x] T113 [P] [US3] Create RSVP model in backend/src/models/RSVP.js (create, delete, findByUser, findByEvent)
- [x] T114 [US3] Implement RSVPService in backend/src/services/RSVPService.js (transaction handling, count updates)

#### Backend API Endpoints

- [x] T115 [P] [US3] Implement POST /api/v1/rsvps controller in backend/src/api/controllers/rsvpController.js
- [x] T116 [P] [US3] Implement DELETE /api/v1/rsvps/:eventId controller in backend/src/api/controllers/rsvpController.js
- [x] T117 [P] [US3] Implement GET /api/v1/rsvps/me controller in backend/src/api/controllers/rsvpController.js
- [x] T118 [US3] Create RSVP routes in backend/src/api/routes/rsvpRoutes.js
- [x] T119 [US3] Mount RSVP routes in backend/src/app.js

#### Frontend Components

- [x] T120 [P] [US3] Create RSVPButton component in frontend/src/components/events/RSVPButton.jsx (going/cancel states)
- [x] T121 [US3] Integrate RSVPButton into EventCard in frontend/src/components/events/EventCard.jsx
- [x] T122 [US3] Integrate RSVPButton into EventDetail in frontend/src/components/events/EventDetail.jsx
- [x] T123 [US3] Add RSVP state to Zustand store in frontend/src/store/appStore.js

#### Integration

- [x] T124 [US3] Create RSVP service in frontend/src/services/rsvpService.js (API calls)
- [x] T125 [US3] Add optimistic updates for RSVP in frontend/src/components/events/RSVPButton.jsx
- [x] T126 [US3] Run User Story 3 tests and verify all pass

**Checkpoint**: User Story 3 complete - users can RSVP to events

---

## Phase 7: User Story 4 - Follow Event Organizers (Priority: P3)

**Goal**: Enable users to follow organizers and receive notifications about new events

**Independent Test**: Follow an organizer, have them create an event, verify notification appears

### Tests for User Story 4 (TDD Required)

> **TDD**: Write these tests FIRST, ensure they FAIL before implementation

- [ ] T127 [P] [US4] Contract test for POST /api/v1/follows in backend/tests/integration/follows.create.test.js
- [ ] T128 [P] [US4] Contract test for DELETE /api/v1/follows/:userId in backend/tests/integration/follows.delete.test.js
- [ ] T129 [P] [US4] Contract test for GET /api/v1/follows/following in backend/tests/integration/follows.list.test.js
- [ ] T130 [P] [US4] Contract test for GET /api/v1/users/:id in backend/tests/integration/users.profile.test.js
- [ ] T131 [P] [US4] Contract test for GET /api/v1/notifications in backend/tests/integration/notifications.list.test.js
- [ ] T132 [P] [US4] Unit test for notification triggers in backend/tests/unit/models/notification.test.js
- [ ] T133 [P] [US4] Frontend test for FollowButton in frontend/tests/unit/components/users/FollowButton.test.jsx
- [ ] T134 [P] [US4] Frontend test for NotificationBell in frontend/tests/unit/components/common/NotificationBell.test.jsx
- [ ] T135 [P] [US4] E2E test for follow flow in frontend/tests/e2e/followOrganizer.spec.js

### Implementation for User Story 4

#### Backend Models & Services

- [ ] T136 [P] [US4] Create Follow model in backend/src/models/Follow.js (create, delete, findFollowers, findFollowing)
- [ ] T137 [P] [US4] Create Notification model in backend/src/models/Notification.js (create, findByUser, markAsRead)
- [ ] T138 [US4] Implement FollowService in backend/src/services/FollowService.js
- [ ] T139 [US4] Implement NotificationService in backend/src/services/NotificationService.js
- [ ] T140 [US4] Extend User model with profile queries in backend/src/models/User.js (stats, recent events)

#### Backend API Endpoints

- [ ] T141 [P] [US4] Implement POST /api/v1/follows controller in backend/src/api/controllers/followController.js
- [ ] T142 [P] [US4] Implement DELETE /api/v1/follows/:userId controller in backend/src/api/controllers/followController.js
- [ ] T143 [P] [US4] Implement GET /api/v1/follows/following controller in backend/src/api/controllers/followController.js
- [ ] T144 [P] [US4] Implement GET /api/v1/follows/followers/:userId controller in backend/src/api/controllers/followController.js
- [ ] T145 [US4] Create follow routes in backend/src/api/routes/followRoutes.js
- [ ] T146 [P] [US4] Implement GET /api/v1/users/:id controller in backend/src/api/controllers/userController.js
- [ ] T147 [US4] Create user routes in backend/src/api/routes/userRoutes.js
- [ ] T148 [P] [US4] Implement GET /api/v1/notifications controller in backend/src/api/controllers/notificationController.js
- [ ] T149 [P] [US4] Implement PUT /api/v1/notifications/:id/read controller in backend/src/api/controllers/notificationController.js
- [ ] T150 [P] [US4] Implement PUT /api/v1/notifications/read-all controller in backend/src/api/controllers/notificationController.js
- [ ] T151 [US4] Create notification routes in backend/src/api/routes/notificationRoutes.js
- [ ] T152 [US4] Mount follow, user, and notification routes in backend/src/app.js

#### Frontend Components

- [ ] T153 [P] [US4] Create FollowButton component in frontend/src/components/users/FollowButton.jsx
- [ ] T154 [P] [US4] Create OrganizerProfile component in frontend/src/components/users/OrganizerProfile.jsx
- [ ] T155 [P] [US4] Create NotificationBell component in frontend/src/components/common/NotificationBell.jsx (badge for unread count)
- [ ] T156 [P] [US4] Create NotificationList component in frontend/src/components/common/NotificationList.jsx
- [ ] T157 [US4] Integrate NotificationBell into Header in frontend/src/components/layout/Header.jsx
- [ ] T158 [US4] Create OrganizerPage in frontend/src/pages/OrganizerPage.jsx
- [ ] T159 [US4] Add organizer profile routes to frontend/src/router.jsx

#### Integration

- [ ] T160 [US4] Create follow service in frontend/src/services/followService.js
- [ ] T161 [US4] Create notification service in frontend/src/services/notificationService.js
- [ ] T162 [US4] Add notification polling logic in frontend/src/hooks/useNotifications.js
- [ ] T163 [US4] Add follow/notification state to Zustand store in frontend/src/store/appStore.js
- [ ] T164 [US4] Run User Story 4 tests and verify all pass

**Checkpoint**: User Story 4 complete - users can follow organizers and receive notifications

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

### Testing & Validation

- [ ] T165 [P] Run full backend test suite and verify 100% pass rate
- [ ] T166 [P] Run full frontend test suite and verify 100% pass rate
- [ ] T167 [P] Run E2E test suite and verify all user flows work end-to-end
- [ ] T168 Validate quickstart.md by following setup instructions from scratch

### Code Quality

- [ ] T169 [P] Run ESLint on backend and fix all issues
- [ ] T170 [P] Run ESLint on frontend and fix all issues
- [ ] T171 [P] Add JSDoc comments to all public functions in backend/src/
- [ ] T172 [P] Add PropTypes to all React components in frontend/src/

### Performance & Security

- [ ] T173 [P] Add database query logging in backend/src/config/database.js
- [ ] T174 [P] Implement rate limiting middleware in backend/src/api/middleware/rateLimiter.js
- [ ] T175 [P] Add CORS configuration in backend/src/app.js
- [ ] T176 [P] Add input sanitization in backend/src/api/middleware/sanitization.js
- [ ] T177 [P] Optimize PostGIS queries with EXPLAIN ANALYZE
- [ ] T178 [P] Add frontend loading states for all async operations
- [ ] T179 [P] Add error boundaries in frontend/src/components/common/ErrorBoundary.jsx

### Documentation

- [ ] T180 [P] Update README.md with project overview and quick links
- [ ] T181 [P] Create API documentation in docs/api.md (optional)
- [ ] T182 [P] Add deployment guide in docs/deployment.md (optional)

### Database Maintenance

- [ ] T183 Create seed script in backend/seeds/001_sample_data.js (sample users, events, locations)
- [ ] T184 Create database reset script in backend/scripts/db-reset.js
- [ ] T185 Add organizer reputation refresh job in backend/scripts/refresh-reputation.js

**Checkpoint**: All polish complete - ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 5 (Phase 3)**: Depends on Foundational - Must complete first (creates events)
- **User Story 1 (Phase 4)**: Depends on Foundational + US5 (needs events to display)
- **User Story 2 (Phase 5)**: Depends on Foundational + US1 (extends event listing)
- **User Story 3 (Phase 6)**: Depends on Foundational + US1 (RSVPs need events + viewing)
- **User Story 4 (Phase 7)**: Depends on Foundational + US5 (follows need organizers/events)
- **Polish (Phase 8)**: Depends on all desired user stories

### User Story Completion Order

**MVP (Minimum Viable Product)**:
1. ✅ Setup (Phase 1)
2. ✅ Foundational (Phase 2)
3. ✅ User Story 5 - Create Events (Phase 3)
4. ✅ User Story 1 - Discover Events (Phase 4)

**Stop here for MVP validation** - Platform has core value: create and discover events

**Post-MVP Increments**:
5. User Story 2 - Sort Events (Phase 5) - Enhances discovery
6. User Story 3 - RSVPs (Phase 6) - Adds engagement
7. User Story 4 - Follow Organizers (Phase 7) - Builds community

### Within Each User Story

1. **Tests First** (TDD): Write all tests, ensure they FAIL
2. **Models**: Data layer
3. **Services**: Business logic
4. **API Endpoints**: Controllers and routes
5. **Frontend Components**: UI layer
6. **Integration**: Wire everything together
7. **Verify**: Run tests, ensure all PASS

### Parallel Opportunities

**Setup Phase**: All tasks marked [P] can run in parallel (T002-T015)

**Foundational Phase**: Groups of [P] tasks can run together:
- Database tasks (T016-T021) run sequentially
- Backend infrastructure (T022-T028) - [P] tasks in parallel
- Frontend infrastructure (T029-T035) - [P] tasks in parallel
- Test infrastructure (T036-T039) - all [P] in parallel

**Each User Story**: 
- Test tasks marked [P] run in parallel
- Model tasks marked [P] run in parallel
- Endpoint tasks marked [P] run in parallel
- Component tasks marked [P] run in parallel

**Multiple Teams**: After Foundational complete, different stories can be built by different developers in parallel

---

## Parallel Execution Examples

### Setup Phase (all parallel)

```bash
# Launch all independent setup tasks:
Task: "Initialize backend Node.js project with Express"
Task: "Initialize frontend React project with Vite"
Task: "Install backend dependencies"
Task: "Install frontend dependencies"
Task: "Configure Vitest for backend"
Task: "Configure Vitest for frontend"
```

### User Story 5 - Tests (all parallel)

```bash
# Launch all US5 tests together:
Task: "Contract test for POST /api/v1/events"
Task: "Contract test for PUT /api/v1/events/:id"
Task: "Contract test for DELETE /api/v1/events/:id"
Task: "Unit test for EventService"
Task: "Frontend test for CreateEventForm"
Task: "E2E test for create event flow"
```

### User Story 1 - Models (parallel)

```bash
# Launch model tasks together:
Task: "Extend Event model with findNearby query"
Task: "Create distance calculation utility"
```

---

## Implementation Strategy

### Strategy 1: MVP First (Recommended)

**Goal**: Get to working product fastest

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 5 (Create Events)
4. Complete Phase 4: User Story 1 (Discover Events)
5. **STOP**: Validate MVP
   - Can organizers create events?
   - Can users find nearby events?
   - Does distance sorting work?
6. Run quickstart.md validation (T168)
7. Demo/deploy if ready

**Tasks for MVP**: T001-T091 (91 tasks)

### Strategy 2: Incremental Delivery

**Goal**: Add value incrementally

1. Setup + Foundational → Foundation ready
2. Add US5 + US1 → **MVP** (create + discover)
3. Add US2 → Enhanced discovery with sorting
4. Add US3 → Engagement with RSVPs
5. Add US4 → Community with follows/notifications
6. Polish → Production ready

Each increment can be demoed/deployed independently.

### Strategy 3: Parallel Teams (2-3 developers)

**Goal**: Maximum velocity

**Phase 1-2** (Together): All developers collaborate on Setup + Foundational

**Phase 3-7** (Split):
- Developer A: User Story 5 + User Story 1 (core MVP)
- Developer B: User Story 2 + User Story 3 (engagement features)
- Developer C: User Story 4 (community features)

**Phase 8** (Together): Polish and final testing

---

## Notes

- **TDD Required**: All tests MUST be written first per Constitution Principle III
- **R2 Deferred**: Flier images use local filesystem initially (can add R2 later)
- **[P] = Parallel**: Tasks can run simultaneously (different files, no dependencies)
- **[Story] Labels**: Track which user story each task belongs to (US1-US5)
- **Independent Stories**: Each user story should be completable and testable independently
- **Stop Points**: MVP checkpoint (after US1), then incremental additions
- **File Paths**: All tasks include exact file paths for clarity
- **Commit Often**: Commit after each task or logical group
- **Test Coverage**: Aim for >80% code coverage (measure with `npm run test:coverage`)

---

## Summary

- **Total Tasks**: 185 tasks
- **MVP Tasks**: 91 tasks (T001-T091)
- **User Stories**: 5 total
  - US5: Create Events (P1) - 30 tasks
  - US1: Discover Events (P1) - 22 tasks
  - US2: Sort Events (P2) - 15 tasks
  - US3: RSVPs (P2) - 20 tasks
  - US4: Follow Organizers (P3) - 38 tasks
- **Parallel Opportunities**: 70+ tasks marked [P] can run in parallel within their phase
- **Test Tasks**: 35 test-related tasks (TDD enforced)
- **Suggested MVP Scope**: Setup + Foundational + US5 + US1 (91 tasks)

**Ready to implement!** 🚗 Start with Phase 1 and work through incrementally.
