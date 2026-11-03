# System Architecture & Data Model

## Domain Model & Entity Relationships

### 1. User & Profile
- `User`: id, name, email, passwordHash, avatarUrl, bio, location, creditsBalance (integer/float), createdAt, updatedAt.
- Initial credit allocation: New users receive **3 credits** upon registration to encourage initial learning interactions.

### 2. Skill Listing
- `SkillListing`:
  - `id`: unique ID
  - `userId`: relation to User (author)
  - `type`: `TEACH` (offering to share) vs `LEARN` (seeking someone to teach)
  - `title`: e.g. "Introductory Acoustic Guitar Lessons"
  - `description`: detailed expectations, what will be covered
  - `category`: e.g. "Music", "Technology", "Cooking", "Languages", "Crafts", "Fitness"
  - `experienceLevel`: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `ALL_LEVELS`
  - `format`: `ONLINE`, `IN_PERSON`, `HYBRID`
  - `location`: neighborhood / city or remote note
  - `durationMinutes`: standard session length (typically 60 min = 1 credit)
  - `status`: `ACTIVE`, `PAUSED`, `ARCHIVED`

### 3. Skill Exchange Request Lifecycle
- `ExchangeRequest`:
  - `id`: unique ID
  - `listingId`: reference to SkillListing
  - `requesterId`: User asking for the exchange
  - `providerId`: User delivering the lesson / skill
  - `proposedDurationHours`: hours (default 1.0)
  - `creditCost`: calculated credits (1 credit per hour)
  - `status`:
    - `PENDING`: Requester sent the request with a note and preferred schedule.
    - `ACCEPTED`: Provider agreed to the session.
    - `DECLINED`: Provider declined.
    - `CANCELLED`: Either party cancelled before session started.
    - `COMPLETED`: Session finished, awaiting dual confirmation or provider confirmation.
    - `CONFIRMED`: Both parties or requester confirmed completion; credits atomically transferred.
  - `notes`: initial scheduling proposal & message

### 4. Credit Ledger (Atomic Accounting)
- `CreditTransaction`:
  - Immutable double-entry style audit log:
  - `id`: unique ID
  - `senderId`: user debited (or NULL for system welcome grant)
  - `receiverId`: user credited
  - `amount`: number of credits
  - `exchangeId`: foreign key to ExchangeRequest (if applicable)
  - `type`: `WELCOME_BONUS`, `EXCHANGE_PAYMENT`, `ADMIN_ADJUSTMENT`
  - `createdAt`: timestamp
- **Rule:** Balance calculations and transfers run inside an atomic Prisma transaction (`prisma.$transaction`).

