# Project Roadmap

## Phase 1: Foundation & Database Layer
- **Goal:** Set up the full Next.js project with TypeScript, Tailwind CSS, Lucide icons, Prisma ORM with SQLite, seed data, and core layout components.
- **Deliverables:**
  - Initialized Next.js 15+ App Router application with Tailwind CSS configuration.
  - Complete Prisma schema (`User`, `SkillListing`, `ExchangeRequest`, `CreditTransaction`, `Review`).
  - Database migration applied (`prisma migrate dev` or `prisma db push`).
  - Comprehensive seed script with mock users, skills (Teach & Learn), and initial credit transactions.
  - Base responsive layout: Navbar with balance pill, footer, toast notifications container.
- **Verification:**
  - `npm run build` succeeds without TypeScript or ESLint errors.
  - Database contains valid seeded records.
  - Home page displays layout and hero section.

## Phase 2: Authentication & User Profiles
- **Goal:** Deliver user authentication, session cookies, welcome credit allocation, and profile views.
- **Deliverables:**
  - Registration form with validation (Name, Email, Password, Bio, Location).
  - Login / Logout actions with HTTP-only cookie session management.
  - Automatic 3-credit welcome bonus allocation upon registration with ledger entry.
  - User Profile view & Edit Profile page.
  - Real-time balance badge in navigation reflecting actual database balance.
- **Requirements Covered:** `REQ-AUTH-01`, `REQ-AUTH-02`, `REQ-AUTH-03`, `REQ-AUTH-04`, `REQ-AUTH-05`.
- **Verification:**
  - New user registers -> receives 3 credits in header -> ledger record created.
  - Log out and log in with persisted session.

## Phase 3: Skill Listings & Discovery Engine
- **Goal:** Allow users to post skill offers (`TEACH`) and requests (`LEARN`), browse, and filter listings.
- **Deliverables:**
  - "Post a Skill" modal / page with form validation (Type, Title, Category, Format, Experience Level, Description).
  - Discovery Catalog page with tabbed view (Teach / Learn), category filter pills, and search query bar.
  - Detailed Skill Listing page displaying teacher info, description, location, and "Request Exchange" CTA.
  - My Listings dashboard management (edit/archive listings).
- **Requirements Covered:** `REQ-SKILL-01`, `REQ-SKILL-02`, `REQ-SKILL-03`, `REQ-SKILL-04`, `REQ-DISC-01`, `REQ-DISC-02`, `REQ-DISC-03`.
- **Verification:**
  - User can publish a listing and see it appear immediately in search & filters.

## Phase 4: Exchange Workflow & Atomic Credit Ledger
- **Goal:** Complete the end-to-end skill exchange request, acceptance, confirmation, and credit transfer cycle.
- **Deliverables:**
  - "Request Exchange" flow with duration selection and balance sufficiency pre-check.
  - Exchange Management Dashboard: "Incoming Requests" and "My Requests" tabs.
  - Provider actions: `ACCEPT` or `DECLINE`.
  - Requester actions: `CANCEL` (while pending) and `CONFIRM_COMPLETION` (after session).
  - Atomic database transaction for credit transfer: debits learner, credits teacher, appends `CreditTransaction`.
  - Transaction History ledger view showing date, counterparty, amount, and reason.
- **Requirements Covered:** `REQ-EXCH-01`, `REQ-EXCH-02`, `REQ-EXCH-03`, `REQ-EXCH-04`, `REQ-EXCH-05`, `REQ-EXCH-06`, `REQ-LEDG-01`, `REQ-LEDG-02`, `REQ-LEDG-03`.
- **Verification:**
  - User A requests 1-hour session from User B -> User B accepts -> User A confirms completion -> 1 credit transferred from A to B atomically.

## Phase 5: Reviews, Ratings & Final Polish
- **Goal:** Implement post-exchange feedback, aggregate rating badges, UI polish, and end-to-end audit.
- **Deliverables:**
  - Review modal triggered upon exchange completion (1-5 stars + written review).
  - Aggregate rating calculation displayed on user profiles and skill listing cards.
  - Empty states, loading skeletons, responsive mobile navigation, and community guidelines modal.
  - End-to-end smoke test verifying clean build and complete user flow.
- **Requirements Covered:** `REQ-REVW-01`, `REQ-REVW-02`.
- **Verification:**
  - Production build (`npm run build`) runs cleanly. Full happy path executed from registration to completed exchange with review.
