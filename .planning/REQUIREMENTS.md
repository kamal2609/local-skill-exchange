# Requirements Specification — Local Skill Exchange

## 1. Authentication, Authorization & Roles
- **REQ-AUTH-01:** Users can register with name, unique username, email, password, location, and bio.
- **REQ-AUTH-02:** Passwords must be hashed using `bcryptjs` (salt rounds: 10). Passwords and hashes are never exposed in API responses.
- **REQ-AUTH-03:** JWT-based authentication with secure token verification and protected route middleware.
- **REQ-AUTH-04:** Three user roles supported: `LEARNER`, `PROVIDER`, and `ADMIN`. Role-based authorization restricts administrative routes.
- **REQ-AUTH-05:** Forgot password and password reset workflow using secure hashed reset tokens with expiry.
- **REQ-AUTH-06:** New accounts automatically receive 3.0 starter credits with an immutable `WELCOME_BONUS` transaction entry.

## 2. User Profiles
- **REQ-PROF-01:** Users have public profiles displaying bio, city/neighborhood, learning modes, languages, skills offered, skills wanted, completed session count, and average rating.
- **REQ-PROF-02:** Users can edit their profile details, add/remove offered skills, add/remove wanted skills, and update their avatar.
- **REQ-PROF-03:** Header displays the active user's credit balance badge prominently in real time.

## 3. Skill Catalog & Taxonomy
- **REQ-SKILL-01:** Standardized `Skill` collection supporting name, category (Technology, Design, Academic, Creative, Lifestyle, Other), description, difficulty level (BEGINNER, INTERMEDIATE, ADVANCED), tags, and popularity counter.
- **REQ-SKILL-02:** Full CRUD capabilities for skills with duplicate prevention and admin management.

## 4. Skill Offers Management
- **REQ-OFFER-01:** Skill providers can create, edit, pause, and delete skill offers specifying skill reference, description, experience level, teaching language, mode (ONLINE, IN_PERSON, HYBRID), session duration, and neighborhood.
- **REQ-OFFER-02:** Public directory of skill offers filterable by category, difficulty, format, and search query.

## 5. Learning Requests Management
- **REQ-REQ-01:** Learners can publish learning requests specifying skill required, learning objectives, preferred difficulty, duration, preferred mode, and schedule.
- **REQ-REQ-02:** Request lifecycle management with statuses: `OPEN`, `MATCHED`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `EXPIRED`.
- **REQ-REQ-03:** Learners can edit or cancel their own open requests.

## 6. Smart Skill Matching Engine (Differentiating Feature) ⭐
- **REQ-MATCH-01:** Automated calculation of a multidimensional compatibility score between users based on:
  - Skill compatibility (40% weight)
  - Reciprocal exchange compatibility (25% weight)
  - Availability compatibility (15% weight)
  - Experience level compatibility (10% weight)
  - Location/neighborhood compatibility (5% weight)
  - Language compatibility (5% weight)
- **REQ-MATCH-02:** Reciprocal exchange detection: flags when User A teaches what User B wants AND User B teaches what User A wants.
- **REQ-MATCH-03:** Explainable match breakdown provided with each recommendation (e.g. "Both available on weekends", "Reciprocal: Offers Python, Wants UI/UX").
- **REQ-MATCH-04:** Smart Matches dashboard view displaying ranked compatible partners with direct "Send Booking Request" actions.
- **REQ-MATCH-05:** Real calculation engine based on verified user data (no fake/hardcoded scores).

## 7. Availability Management
- **REQ-AVAIL-01:** Users can configure recurring weekly availability slots (day of week 0-6, start time, end time, timezone, preferred mode).
- **REQ-AVAIL-02:** Public view of provider availability slots for seamless session booking.

## 8. Session Booking & Lifecycle
- **REQ-SESS-01:** Learners can select an open slot from a provider and submit a booking request.
- **REQ-SESS-02:** Overlapping booking prevention: system prevents double-booking the same provider or learner for overlapping time slots.
- **REQ-SESS-03:** Session status lifecycle: `REQUESTED` → `ACCEPTED` / `REJECTED` → `SCHEDULED` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`.
- **REQ-SESS-04:** Dual-confirmation on completion: session completion requires confirmation before credits are transferred.

## 9. Time-Banking Credit Ledger
- **REQ-LEDG-01:** Egalitarian rule: 1 hour taught = 1 credit earned. 1 credit deducted from learner upon session completion.
- **REQ-LEDG-02:** Transaction types strictly defined: `SESSION_EARN`, `SESSION_SPEND`, `SESSION_REFUND`, `WELCOME_BONUS`, `ADMIN_ADJUSTMENT`.
- **REQ-LEDG-03:** All credit modifications execute within atomic database transactions (`session.withTransaction`) to guarantee double-spending prevention and non-negative balances.
- **REQ-LEDG-04:** Full transaction history ledger accessible to users and auditable by administrators.

## 10. Communication, Notifications & Reviews
- **REQ-COMM-01:** Direct messaging between users with conversation threads and unread message counters.
- **REQ-COMM-02:** In-app notifications for match recommendations, session requests, acceptances, and credit transfers.
- **REQ-REVW-01:** Participants of completed sessions can submit 1 to 5 star ratings and written reviews. Duplicate reviews for the same session are prevented.
- **REQ-REVW-02:** Provider average rating and review counts update automatically.

## 11. Administrator Dashboard & Moderation
- **REQ-ADMIN-01:** Admin dashboard displaying real platform statistics: total users, active offers, open requests, completed sessions, and credit transaction volume.
- **REQ-ADMIN-02:** User management tools (view, suspend/activate accounts) and category management.
- **REQ-ADMIN-03:** Content moderation: review user reports and remove inappropriate listings or reviews.

## 12. Premium UI, 3D Visuals & Accessibility
- **REQ-UI-01:** Responsive design adapting smoothly across mobile, tablet, and desktop with zero horizontal overflow.
- **REQ-UI-02:** Interactive 3D skill network hero using Three.js, React Three Fiber, and Drei with fallback for low-power devices.
- **REQ-UI-03:** Smooth micro-interactions, modal transitions, and route animations using Framer Motion.
- **REQ-UI-04:** Accessible semantic HTML, high contrast ratios, readable typography, and proper touch targets.

## 13. Quality Assurance, Security & Deployment
- **REQ-QA-01:** Centralized error handling and consistent JSON response schemas (`{ success: boolean, data?, message? }`).
- **REQ-QA-02:** Security hardening with Helmet headers, CORS restrictions, input sanitization, and Express rate limiting.
- **REQ-QA-03:** Automated testing suite covering auth, matching algorithm, session booking, and credit transactions.
- **REQ-QA-04:** Production deployment readiness with MongoDB Atlas URI and cloud deployment configurations (Vercel/Render).

---

## Traceability Matrix across 9 Phases

| Requirement Category | Applicable Phase | Priority | Status |
|---|---|:---:|:---:|
| Project Setup & 12 Mongoose Models | **Phase 1** | Critical | Ready for Execution |
| Base Layout, Seed Script & Landing Page | **Phase 1** | Critical | Ready for Execution |
| REQ-AUTH-01 – REQ-AUTH-06, REQ-PROF-01 – REQ-PROF-03 | **Phase 2** | Critical | Pending Phase 1 |
| REQ-SKILL-01 – REQ-SKILL-02, REQ-OFFER-01 – REQ-OFFER-02, REQ-REQ-01 – REQ-REQ-03 | **Phase 3** | Critical | Pending Phase 2 |
| REQ-MATCH-01 – REQ-MATCH-05 (Smart Matching Engine ⭐) | **Phase 4** | Critical | Pending Phase 3 |
| REQ-AVAIL-01 – REQ-AVAIL-02, REQ-SESS-01 – REQ-SESS-04 | **Phase 5** | Critical | Pending Phase 4 |
| REQ-LEDG-01 – REQ-LEDG-04 (Credit System & Ledger) | **Phase 6** | Critical | Pending Phase 5 |
| REQ-COMM-01 – REQ-COMM-02, REQ-REVW-01 – REQ-REVW-02 | **Phase 7** | High | Pending Phase 6 |
| REQ-ADMIN-01 – REQ-ADMIN-03, REQ-UI-01 – REQ-UI-04 | **Phase 8** | High | Pending Phase 7 |
| REQ-QA-01 – REQ-QA-04 (Testing & Deployment) | **Phase 9** | High | Pending Phase 8 |
