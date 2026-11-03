# System Architecture & Data Model (MERN Stack)

## 1. Domain Models & Mongoose Schemas

### 1.1 User (`server/src/models/User.js`)
- `name`: String, required, trim
- `email`: String, required, unique, lowercase, trim
- `passwordHash`: String, required
- `avatarUrl`: String, default avatar fallback
- `bio`: String, max 500 characters
- `location`: String (e.g., "Brooklyn, NY" or "North District")
- `creditsBalance`: Number, default: 3.0 (initial welcome grant)
- `createdAt`, `updatedAt`: Timestamps

### 1.2 SkillListing (`server/src/models/SkillListing.js`)
- `userId`: Schema.Types.ObjectId, ref: 'User', required, indexed
- `type`: String, enum: `['TEACH', 'LEARN']`, required, indexed
- `title`: String, required, trim
- `description`: String, required
- `category`: String, enum: `['Technology', 'Music', 'Languages', 'Arts & Crafts', 'Cooking', 'Fitness', 'Gardening', 'Other']`, required, indexed
- `experienceLevel`: String, enum: `['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']`, default: 'ALL_LEVELS'
- `format`: String, enum: `['ONLINE', 'IN_PERSON', 'HYBRID']`, default: 'ONLINE'
- `location`: String, optional
- `durationMinutes`: Number, default: 60 (standard 1-hour unit)
- `status`: String, enum: `['ACTIVE', 'PAUSED', 'ARCHIVED']`, default: 'ACTIVE', indexed
- `createdAt`, `updatedAt`: Timestamps

### 1.3 ExchangeRequest (`server/src/models/ExchangeRequest.js`)
- `listingId`: Schema.Types.ObjectId, ref: 'SkillListing', required, indexed
- `requesterId`: Schema.Types.ObjectId, ref: 'User', required, indexed
- `providerId`: Schema.Types.ObjectId, ref: 'User', required, indexed
- `proposedDurationHours`: Number, default: 1.0
- `creditCost`: Number, default: 1.0 (1 hour = 1 credit)
- `status`: String, enum: `['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED']`, default: 'PENDING', indexed
- `notes`: String (initial message & scheduling proposal)
- `scheduledDate`: Date, optional
- `createdAt`, `updatedAt`: Timestamps

### 1.4 CreditTransaction (`server/src/models/CreditTransaction.js`)
- `senderId`: Schema.Types.ObjectId, ref: 'User', default: null (null for system welcome bonus)
- `receiverId`: Schema.Types.ObjectId, ref: 'User', required, indexed
- `amount`: Number, required (e.g. 1.0 or 3.0)
- `type`: String, enum: `['WELCOME_BONUS', 'EXCHANGE_PAYMENT', 'ADMIN_ADJUSTMENT']`, required
- `exchangeId`: Schema.Types.ObjectId, ref: 'ExchangeRequest', default: null
- `createdAt`: Timestamp (immutable audit record)

### 1.5 Review (`server/src/models/Review.js`)
- `exchangeId`: Schema.Types.ObjectId, ref: 'ExchangeRequest', required, unique
- `authorId`: Schema.Types.ObjectId, ref: 'User', required
- `receiverId`: Schema.Types.ObjectId, ref: 'User', required, indexed
- `rating`: Number, min: 1, max: 5, required
- `comment`: String, trim
- `createdAt`: Timestamp

---

## 2. Atomic Credit Accounting & Mongoose Transactions

### The Balance Invariant
The platform enforces strict time-banking ledger integrity:
- **Rule 1:** A user cannot spend more credits than their verified balance.
- **Rule 2:** Credit transfers between learner and teacher execute atomically within a MongoDB session transaction:
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  // 1. Verify learner balance
  const learner = await User.findById(learnerId).session(session);
  if (learner.creditsBalance < creditCost) {
    throw new Error('Insufficient credit balance');
  }

  // 2. Debit learner
  await User.findByIdAndUpdate(learnerId, { $inc: { creditsBalance: -creditCost } }, { session });

  // 3. Credit teacher
  await User.findByIdAndUpdate(teacherId, { $inc: { creditsBalance: creditCost } }, { session });

  // 4. Create immutable transaction log
  await CreditTransaction.create([{
    senderId: learnerId,
    receiverId: teacherId,
    amount: creditCost,
    type: 'EXCHANGE_PAYMENT',
    exchangeId: exchange._id
  }], { session });

  // 5. Update exchange status
  exchange.status = 'COMPLETED';
  await exchange.save({ session });

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```
*(Note: For single-node local development without replica sets, a transactional fallback with optimistic concurrency / version checks is supported to ensure seamless zero-config local runs while preserving full atomic logic).*

---

## 3. REST API Specifications

### Auth & User Endpoints (`/api/auth`, `/api/users`)
- `POST /api/auth/register` — Register user, grant 3 welcome credits, record transaction, return JWT
- `POST /api/auth/login` — Authenticate credentials, return JWT + user profile
- `GET /api/auth/me` — Return authenticated user session & real-time credit balance
- `GET /api/users/:id` — Public profile with skills taught/wanted and review summary
- `PUT /api/users/profile` — Update bio, location, avatar

### Skill Listings Endpoints (`/api/listings`)
- `GET /api/listings` — List active skills with query filters (`type=TEACH|LEARN`, `category`, `search`, `format`)
- `GET /api/listings/:id` — Detail view with author profile
- `POST /api/listings` — Create listing (authenticated)
- `PUT /api/listings/:id` — Edit own listing
- `DELETE /api/listings/:id` — Archive/delete listing

### Exchanges & Ledger Endpoints (`/api/exchanges`, `/api/credits`)
- `POST /api/exchanges` — Submit exchange request (pre-checks balance for TEACH sessions)
- `GET /api/exchanges` — List incoming and outgoing requests for authenticated user
- `PUT /api/exchanges/:id/status` — Provider accepts/declines; Requester cancels
- `POST /api/exchanges/:id/confirm` — Requester confirms completion -> triggers atomic credit transfer
- `GET /api/credits/history` — Audit ledger of all credits earned, spent, and bonuses

### Reviews Endpoints (`/api/reviews`)
- `POST /api/reviews` — Submit 1-5 star review upon exchange completion
- `GET /api/reviews/user/:userId` — Fetch all reviews received by a user

---

## 4. Frontend Architecture (React + Vite)
- **Routing:** `react-router-dom` with public and protected route wrappers.
- **State Management:**
  - `AuthContext`: Manages current user session, token storage, login/logout.
  - `CreditContext`: Real-time credit balance tracker synchronized across header, exchange forms, and dashboard.
- **Services Layer (`client/src/services/api.ts`):** Centralized Axios instance with base URL, request interceptors (attaching Bearer token), and response error handling.
