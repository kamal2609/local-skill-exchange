# Requirements Specification

## 1. Authentication & User Profile
- **REQ-AUTH-01:** Users can sign up with name, email, password, location, and bio.
- **REQ-AUTH-02:** Upon successful account creation, the system atomically grants 3 welcome credits to the user and records a `WELCOME_BONUS` transaction in the credit ledger.
- **REQ-AUTH-03:** Users can log in, log out, and maintain an authenticated session via secure cookies.
- **REQ-AUTH-04:** Users can view and edit their profile details (bio, city/location, skills offered, avatar).
- **REQ-AUTH-05:** Users can see their current credit balance prominently in the navigation header and dashboard.

## 2. Skill Listings
- **REQ-SKILL-01:** Users can create a skill listing marked as either `TEACH` (Offering to teach) or `LEARN` (Looking for a teacher).
- **REQ-SKILL-02:** Each listing requires: title, description, category, experience level (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `ALL_LEVELS`), format (`ONLINE`, `IN_PERSON`), and location notes.
- **REQ-SKILL-03:** Users can edit or archive their own skill listings.
- **REQ-SKILL-04:** Public users can view the full details of any active skill listing, including provider profile and average rating.

## 3. Discovery & Search
- **REQ-DISC-01:** Browse listings with tabs to toggle between "Offers to Teach" and "Requests to Learn".
- **REQ-DISC-02:** Filter listings by category (e.g. Technology, Languages, Music, Arts, Cooking, Fitness, etc.) and format (Online vs In-Person).
- **REQ-DISC-03:** Full-text search on listing titles and descriptions.

## 4. Skill Exchange Lifecycle
- **REQ-EXCH-01:** An authenticated user can submit an exchange request for any active listing, specifying session duration (hours) and an introductory message with scheduling proposals.
- **REQ-EXCH-02:** If the user is requesting a `TEACH` session, the system validates that the requester has sufficient credits for the session duration before creating the request.
- **REQ-EXCH-03:** The provider receives the request in their Exchange Dashboard and can `ACCEPT` or `DECLINE` it.
- **REQ-EXCH-04:** Once accepted, both parties can view session coordination details and status (`ACCEPTED`).
- **REQ-EXCH-05:** Either party can cancel a `PENDING` request.
- **REQ-EXCH-06:** After the session takes place, the learner/requester confirms completion, which atomically transfers the credits from learner to teacher and sets the exchange status to `COMPLETED`.

## 5. Credit Ledger & Accounting
- **REQ-LEDG-01:** Every credit transfer must be recorded in an immutable `CreditTransaction` log containing sender, receiver, amount, exchange reference, and timestamp.
- **REQ-LEDG-02:** User balance adjustments and ledger records must occur within a single database transaction.
- **REQ-LEDG-03:** Users can view their transaction history (credits earned, spent, and bonuses) in their dashboard.

## 6. Feedback & Reviews
- **REQ-REVW-01:** Upon confirming a completed exchange, the learner can submit a 1 to 5 star rating and optional written review.
- **REQ-REVW-02:** The teacher's average star rating and review count are updated and displayed on their profile and listings.

## Traceability Matrix (v1 MVP)
| ID | Phase | Priority | Status |
|----|-------|----------|--------|
| REQ-AUTH-01 - REQ-AUTH-05 | Phase 2 | Critical | Pending |
| REQ-SKILL-01 - REQ-SKILL-04 | Phase 3 | Critical | Pending |
| REQ-DISC-01 - REQ-DISC-03 | Phase 3 | High | Pending |
| REQ-EXCH-01 - REQ-EXCH-06 | Phase 4 | Critical | Pending |
| REQ-LEDG-01 - REQ-LEDG-03 | Phase 4 | Critical | Pending |
| REQ-REVW-01 - REQ-REVW-02 | Phase 5 | Medium | Pending |
