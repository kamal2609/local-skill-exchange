# Local Skill Exchange

## 1. Project Vision & Overview
Local Skill Exchange is a community-driven, time-banking web platform where neighbors and local peers barter knowledge and skills. Operating on the principle that **everyone has something to teach and something to learn**, the platform uses an equal-value time credit system: 1 hour of teaching earns 1 skill credit, which can be redeemed for 1 hour of learning from anyone else in the community.

## 2. Core Value Proposition
- **Egalitarian Time Banking:** Every person's time is valued equally—1 hour of teaching Python equals 1 hour of learning conversational Spanish or sourdough baking.
- **Direct Peer Discovery:** Search and discover local or virtual skills by category, level, and format.
- **Trust & Accountability:** Transparent credit ledger, verified exchange confirmations, and peer reviews maintain community safety.

## 3. Core Scope for v1 (MVP)
### In Scope
1. **User Authentication & Onboarding:**
   - Registration and secure session management.
   - Initial grant of **3 welcome credits** to bootstrap community participation.
   - User profile setup with location/city, bio, avatar, and credit balance.
2. **Skill Listings Management:**
   - Dual listing types: `TEACH` (Offering skills) and `LEARN` (Requesting lessons).
   - Rich categorization (Tech, Languages, Arts & Crafts, Music, Cooking, Fitness, Home & Gardening).
   - Detail fields: Experience level, preferred format (Online/In-person), location, and standard session duration.
3. **Discovery & Search:**
   - Filterable catalog of skill offers and requests.
   - Keyword search across titles, descriptions, and category tags.
   - Listing detail view showcasing teacher's profile and reviews.
4. **Exchange Workflow & Request Lifecycle:**
   - Request exchange flow with proposed schedule and introductory note.
   - Provider inbox to accept or decline incoming requests.
   - Session tracking (Pending -> Accepted -> In Progress -> Completed).
   - Mutual/Requester confirmation to complete session and release credits.
5. **Atomic Credit Ledger:**
   - Immutable transaction ledger logging all credit debits, credits, and welcome bonuses.
   - Real-time balance display on user dashboard and header.
6. **Ratings & Reviews:**
   - Star rating (1-5) and feedback note upon session completion.
   - Aggregate rating displayed on user profiles and skill listings.

### Out of Scope (Deferred to v2)
- Real-time in-app WebRTC video calling (users exchange Google Meet/Zoom links or meet in person).
- Fiat money payment gateway (strict time banking barter only).
- Native iOS/Android app (mobile-responsive web app in v1).
- Automated Google Calendar 2-way synchronization.
- Complex dispute mediation arbitration council.

## 4. Tech Stack & Architecture
- **Framework:** Next.js (App Router, React 19, TypeScript)
- **Styling:** Tailwind CSS, Lucide React icons
- **Data Layer:** Prisma ORM with SQLite (zero-config, high developer velocity, SQLite file committable/reproducible)
- **State & Validation:** Zod schemas for input validation; React Server Actions for mutations
- **Security:** Bcrypt password hashing, HTTP-only secure session cookies

## 5. Non-Negotiable Requirements
- All credit modifications **must** execute inside an atomic database transaction (`prisma.$transaction`) to prevent double-spending or balance mismatch.
- Exchange completion **must** verify sufficient balance before transferring credits.
- Clean, semantic, fully accessible UI with zero build or runtime errors.
