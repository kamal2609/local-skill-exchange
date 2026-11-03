# Local Skill Exchange — Master Project Specification

## 1. Project Identity & Overview
- **Project Title:** Local Skill Exchange
- **Project Theme:** Neighbourhood Skill Sharing
- **Problem Statement:** People often have valuable skills to teach (from programming and languages to music, baking, and carpentry) but have no convenient, trusted way to find neighbors who need them or exchange knowledge. Local Skill Exchange provides user profiles, structured learning requests, skill offers, availability schedules, session records, and an egalitarian time-banking economy.
- **Differentiating Feature:** An intelligent, explainable **Smart Skill Matching Engine** that analyzes offered skills, requested skills, reciprocal compatibility, schedules, learning modes, and geographic proximity to recommend ideal learning partnerships with compatibility scores and clear explanations.

## 2. Core Value Proposition & Exchange Model
- **Egalitarian Time Banking:** Every person's time is valued equally—1 hour taught = 1 credit earned. 1 credit can be redeemed for 1 hour of learning from anyone in the community.
- **No Fiat Currency Required:** Direct peer-to-peer barter powered by an immutable credit ledger.
- **Trust & Accountability:** Double-entry style credit transactions, mutual session completion confirmations, peer ratings/reviews, and administrative oversight.
- **Three User Roles:**
  - **Learner:** Browse skills, publish learning requests, book sessions, spend credits, review providers.
  - **Skill Provider:** Publish skill offers, manage availability slots, accept/decline bookings, conduct sessions, earn credits.
  - **Administrator:** Manage users and categories, review platform analytics, monitor sessions, audit credit transactions, moderate reports.
  *(A single user can act as both a Learner and a Skill Provider).*

## 3. Technology Stack (Strictly MERN)
- **Frontend:**
  - React.js with Vite (TypeScript)
  - Tailwind CSS + Lucide React icons
  - Framer Motion (page transitions, interactive cards, micro-interactions)
  - Three.js, React Three Fiber (@react-three/fiber), Drei (@react-three/drei) (interactive 3D skill network hero)
  - React Router DOM (v6+)
  - React Hook Form + Zod (client-side form validation)
  - Axios (API client with interceptors)
- **Backend:**
  - Node.js + Express.js REST API
  - MongoDB + Mongoose ODM (12 normalized collections)
  - JSON Web Tokens (JWT) authentication & bcryptjs password hashing
  - Zod / input validation middleware
  - Helmet (security headers), CORS, Express Rate Limit, Morgan logging
  - Centralized error handling & graceful shutdown
- **Database:**
  - MongoDB (Local development instance + MongoDB Atlas for cloud deployment)
  - Multi-document session transactions for atomic credit balance transfers
- **Testing & QA:**
  - Vitest / Jest for unit and integration testing
  - Supertest for REST API endpoint verification
  - Playwright for end-to-end browser testing
- **Strict Restrictions:**
  - NO Next.js, NO Prisma, NO SQLite, NO simulated backends.

## 4. 12 Normalized Database Collections
1. `users` — Profiles, roles (LEARNER, PROVIDER, ADMIN), credit balances, verification status.
2. `skills` — Standalone skill catalog with categories, difficulty, tags, and popularity metrics.
3. `skillOffers` — Structured offers published by providers with teaching approach and modes.
4. `learningRequests` — Detailed requests published by learners with full status lifecycle.
5. `availability` — Recurring weekly availability time slots and timezone configurations.
6. `sessions` — Booked sessions with status lifecycle and dual-party completion confirmation.
7. `creditTransactions` — Immutable audit log (`SESSION_EARN`, `SESSION_SPEND`, `SESSION_REFUND`, `WELCOME_BONUS`, `ADMIN_ADJUSTMENT`).
8. `reviews` — 1-to-5 star ratings and comments linked to completed sessions.
9. `conversations` — Direct messaging thread metadata and unread counts.
10. `messages` — Individual messages within conversations.
11. `notifications` — System and activity alerts for matches, bookings, and credits.
12. `reports` — Trust & safety moderation reports reviewed by administrators.

## 5. Development Roadmap Overview (9 Phases)
1. **Phase 1:** MERN Foundation & Database Setup (Monorepo scaffold, Mongoose connection, 12 models, seed data, responsive layout & landing page)
2. **Phase 2:** Authentication & User Profiles (JWT, bcryptjs, RBAC, 3 roles, profile management, password reset)
3. **Phase 3:** Skills, Offers & Learning Requests (Catalog taxonomy, Offer publishing, Request publishing, search & category filters)
4. **Phase 4:** Smart Skill Matching Engine ⭐ (Weighted matching algorithm, reciprocal exchange detection, match explanations)
5. **Phase 5:** Availability Management & Session Booking (Weekly availability, slot booking, conflict prevention, dual confirmation)
6. **Phase 6:** Time-Banking Credit System & Ledger (Atomic ledger transactions, balance safeguards, refund logic)
7. **Phase 7:** Communication & Community (In-app messaging, notifications, reviews & ratings, report moderation)
8. **Phase 8:** Premium UI, 3D Visuals & Admin Dashboard (Three.js/R3F hero, Framer Motion, 20 functional pages, Admin dashboard)
9. **Phase 9:** Testing, Security Audit & Deployment (Vitest, Supertest, Playwright, documentation suite, Atlas/Render/Vercel setup)
