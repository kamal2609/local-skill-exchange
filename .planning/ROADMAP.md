# Master Project Roadmap — Local Skill Exchange (9 Phases)

## Phase 1: MERN Foundation & Database Setup
- **Goal:** Establish clean monorepo architecture (`frontend/` and `backend/`), connect Express to MongoDB, implement all 12 Mongoose schemas, execute comprehensive seeding, and build base layout with landing page.
- **Deliverables:**
  - Standard monorepo layout: `frontend/` (React + Vite + TypeScript) and `backend/` (Node + Express + MongoDB).
  - All 12 Mongoose models: `User`, `Skill`, `SkillOffer`, `LearningRequest`, `Availability`, `Session`, `CreditTransaction`, `Review`, `Conversation`, `Message`, `Notification`, `Report`.
  - Comprehensive seed script (`backend/src/seed/seed.js`) generating realistic demo users (including admin), skills across categories, offers, requests, availability slots, and ledger history.
  - Express API foundation: CORS, Helmet, JSON body parsing, Morgan logging, central error handler, and `/api/health`.
  - Base responsive layout: Navbar with credit balance badge, Footer with community ethos, and Landing page consuming live backend statistics.
- **Verification Gates:**
  - Backend starts and connects to MongoDB without error.
  - Database seed populates all 12 collections with valid records.
  - Frontend builds cleanly (`npm run build --prefix frontend`) with zero TypeScript or styling errors.
  - Landing page loads and displays live counters from Express backend.

## Phase 2: Authentication & User Profiles
- **Goal:** Deliver secure user authentication, JWT session management, RBAC, profile management, and password reset.
- **Deliverables:**
  - Express endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`.
  - Role-based authorization middleware enforcing `LEARNER`, `PROVIDER`, and `ADMIN` access.
  - Automated 3-credit welcome bonus grant upon registration with ledger entry.
  - Frontend `AuthContext` with JWT persistence, login/registration forms with Zod validation.
  - User profile view and edit screens (skills offered, skills wanted, bio, avatar, location).
- **Verification Gates:** User registration creates user + welcome credit; JWT routes protect resources; role permissions work as intended.

## Phase 3: Skills, Offers & Learning Requests
- **Goal:** Implement the full skill catalog taxonomy, independent skill offer publishing, and learning request publishing.
- **Deliverables:**
  - Standalone Skill Catalog CRUD endpoints and taxonomy filters.
  - Skill Offers management: providers publish, edit, pause, and delete teaching offers.
  - Learning Requests management: learners publish requests with status lifecycle (`OPEN` to `COMPLETED`).
  - Discovery Catalog page with tabbed views (Offers vs Requests), category pills, difficulty filters, and search.
- **Verification Gates:** Users can publish offers and requests, search across titles and categories, and see them appear immediately.

## Phase 4: Smart Skill Matching Engine ⭐ (Differentiating Feature)
- **Goal:** Build the intelligent, explainable matching engine that suggests compatible learning partnerships.
- **Deliverables:**
  - Matching algorithm service calculating weighted compatibility (Skill: 40%, Reciprocal: 25%, Availability: 15%, Experience: 10%, Location: 5%, Language: 5%).
  - Reciprocal exchange detector (User A teaches what User B wants AND User B teaches what User A wants).
  - Match explanation generator providing clear rationale for every match.
  - Smart Matches dashboard view displaying ranked compatible partners with match score percentages and direct "Request Session" CTAs.
- **Verification Gates:** Matching service accurately identifies reciprocal and one-way matches with mathematical precision and clear explanations using real database records.

## Phase 5: Availability Management & Session Booking
- **Goal:** Implement weekly recurring availability schedules, session booking, and dual-confirmation completion flow.
- **Deliverables:**
  - Availability scheduler: users configure weekly days, hours, timezone, and learning format.
  - Booking engine: learners select available slots and send booking requests.
  - Conflict prevention: validation prevents overlapping sessions for both provider and learner.
  - Session lifecycle: `REQUESTED` → `ACCEPTED` / `REJECTED` → `SCHEDULED` → `IN_PROGRESS` → `COMPLETED`.
  - Mutual/learner confirmation flow triggering credit release.
- **Verification Gates:** Booking prevents double-booking; session state transitions cleanly; confirmation updates session status.

## Phase 6: Time-Banking Credit System & Ledger
- **Goal:** Ensure bulletproof, atomic time-banking accounting (1 hour = 1 credit).
- **Deliverables:**
  - Multi-document MongoDB transactions (`session.withTransaction`) executing atomic debit/credit operations.
  - Transaction types: `SESSION_EARN`, `SESSION_SPEND`, `SESSION_REFUND`, `WELCOME_BONUS`, `ADMIN_ADJUSTMENT`.
  - Safeguards preventing negative balances or duplicate credit awards.
  - Transaction History ledger page displaying date, counterparty, amount, and reference.
- **Verification Gates:** Completed sessions transfer credits atomically; insufficient balances reject bookings; ledger audit log is complete.

## Phase 7: Communication & Community
- **Goal:** Deliver in-app communication, real-time alerts, peer reviews, and safety reporting.
- **Deliverables:**
  - Direct messaging between matched users with conversation threads.
  - Notification center with unread counters for bookings, matches, and credits.
  - Post-session review modal (1 to 5 stars + written feedback) with aggregate rating calculation.
  - Report submission system for trust and safety moderation.
- **Verification Gates:** Users can message counterparties; reviews update user ratings; reports are queued for admin review.

## Phase 8: Premium UI, 3D Visuals & Admin Dashboard
- **Goal:** Deliver a modern, visually stunning experience with 3D components and comprehensive administrative controls.
- **Deliverables:**
  - Interactive 3D skill network hero using Three.js, React Three Fiber, and Drei.
  - Framer Motion page transitions, card hover physics, and modal animations.
  - Administrator Dashboard: platform metrics (users, skills, sessions, credit circulation), user management, category management, report resolution.
  - Full completion of the 20 application page views.
- **Verification Gates:** 3D hero renders smoothly with mobile fallbacks; admin dashboard displays real database aggregates; all 20 views are functional.

## Phase 9: Testing, Security Audit & Deployment
- **Goal:** Verify production quality through automated testing, security hardening, full documentation, and cloud deployment setup.
- **Deliverables:**
  - Automated tests: Unit tests (Vitest), API integration tests (Supertest), and E2E browser tests (Playwright).
  - Security hardening: Helmet headers, rate limiting, MongoDB sanitization, and CORS enforcement.
  - Documentation suite: `README.md`, `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/API.md`, `docs/TESTING.md`, `docs/USER_GUIDE.md`.
  - Deployment configuration for MongoDB Atlas, Render/Railway (backend), and Vercel (frontend).
- **Verification Gates:** All automated tests pass; security audit is clean; production builds succeed.
