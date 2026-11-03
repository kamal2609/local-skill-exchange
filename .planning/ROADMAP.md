# Project Roadmap (MERN Stack)

## Phase 1: MERN Stack Foundation & Database Layer
- **Goal:** Establish the complete MERN stack foundation: Node.js/Express API server, MongoDB connection with Mongoose schemas, React.js + Vite frontend with Tailwind CSS, comprehensive database seed data, and base responsive layout.
- **Deliverables:**
  - Root workspace setup orchestrating `client/` and `server/`.
  - Node.js + Express backend with MongoDB connection via Mongoose.
  - Complete Mongoose schemas: `User`, `SkillListing`, `ExchangeRequest`, `CreditTransaction`, `Review`.
  - Comprehensive seed script (`server/src/seed/seed.js`) populating realistic demo users, skills (Teach & Learn), and initial credit transactions.
  - React.js + Vite frontend configured with Tailwind CSS, Lucide icons, and React Router DOM.
  - Base responsive layout: Navbar with brand logo and credit balance pill, Footer with community ethos, and Landing page connected to backend health/featured API.
- **Verification:**
  - Express server starts and connects to MongoDB without connection errors.
  - Seed script successfully populates MongoDB with users, skills, and ledger entries.
  - React/Vite client builds cleanly (`npm run build`) without errors.
  - Landing page loads and renders live statistics and featured skills fetched from the Express API.

## Phase 2: Authentication & User Profiles (MERN)
- **Goal:** Deliver user authentication, JWT session management, welcome credit allocation, and profile views.
- **Deliverables:**
  - Express authentication endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
  - Automatic 3-credit welcome bonus allocation upon registration with MongoDB ledger entry.
  - React `AuthContext` for global session state and token persistence.
  - Registration and Login views with validation.
  - User Profile view & Edit Profile page with bio, city/location, and avatar.
  - Real-time balance badge in navigation reflecting actual database balance.
- **Requirements Covered:** `REQ-AUTH-01`, `REQ-AUTH-02`, `REQ-AUTH-03`, `REQ-AUTH-04`, `REQ-AUTH-05`.
- **Verification:**
  - New user registers -> receives 3 credits in header -> ledger record created in MongoDB.
  - Log out and log in with persisted JWT token.

## Phase 3: Skill Listings & Discovery Engine (MERN)
- **Goal:** Allow users to post skill offers (`TEACH`) and requests (`LEARN`), browse, and filter listings.
- **Deliverables:**
  - Express CRUD endpoints for `/api/listings` with category, format, and search query filters.
  - "Post a Skill" modal/form in React with validation (Type, Title, Category, Format, Experience Level, Description).
  - Discovery Catalog page with tabbed view (Teach / Learn), category filter pills, and search query bar.
  - Detailed Skill Listing page displaying teacher info, description, location, and "Request Exchange" CTA.
  - My Listings dashboard management (edit/archive listings).
- **Requirements Covered:** `REQ-SKILL-01`, `REQ-SKILL-02`, `REQ-SKILL-03`, `REQ-SKILL-04`, `REQ-DISC-01`, `REQ-DISC-02`, `REQ-DISC-03`.
- **Verification:**
  - User can publish a listing and see it appear immediately in search & filters.

## Phase 4: Exchange Workflow & Atomic Credit Ledger (MERN)
- **Goal:** Complete the end-to-end skill exchange request, acceptance, confirmation, and credit transfer cycle.
- **Deliverables:**
  - Express exchange endpoints: `POST /api/exchanges`, `GET /api/exchanges`, `PUT /api/exchanges/:id/status`, `POST /api/exchanges/:id/confirm`.
  - Atomic MongoDB transactions (`session.withTransaction`) for credit transfer: debits learner, credits teacher, appends `CreditTransaction`.
  - "Request Exchange" modal in React with duration selection and balance sufficiency pre-check.
  - Exchange Management Dashboard: "Incoming Requests" and "My Requests" tabs.
  - Provider actions: `ACCEPT` or `DECLINE`.
  - Requester actions: `CANCEL` (while pending) and `CONFIRM_COMPLETION` (after session).
  - Transaction History ledger view showing date, counterparty, amount, and reason.
- **Requirements Covered:** `REQ-EXCH-01`, `REQ-EXCH-02`, `REQ-EXCH-03`, `REQ-EXCH-04`, `REQ-EXCH-05`, `REQ-EXCH-06`, `REQ-LEDG-01`, `REQ-LEDG-02`, `REQ-LEDG-03`.
- **Verification:**
  - User A requests 1-hour session from User B -> User B accepts -> User A confirms completion -> 1 credit transferred from A to B atomically in MongoDB.

## Phase 5: Reviews, Ratings & Final Polish (MERN)
- **Goal:** Implement post-exchange feedback, aggregate rating badges, UI polish, and end-to-end audit.
- **Deliverables:**
  - Express endpoints for reviews: `POST /api/reviews`, `GET /api/reviews/user/:userId`.
  - Review modal triggered upon exchange completion (1-5 stars + written review).
  - Aggregate rating calculation displayed on user profiles and skill listing cards.
  - Empty states, loading skeletons, responsive mobile navigation, and community guidelines modal.
  - End-to-end smoke test verifying clean build and complete user flow.
- **Requirements Covered:** `REQ-REVW-01`, `REQ-REVW-02`.
- **Verification:**
  - Full happy path executed from registration to completed exchange with review across client and server.
