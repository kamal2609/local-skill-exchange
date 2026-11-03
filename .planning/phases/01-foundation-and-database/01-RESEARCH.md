# Phase 1 Research: MERN Stack Foundation & Database Layer

## 1. Objectives & Deliverables
Establish a production-ready, clean MERN stack architecture for Local Skill Exchange:
1. **Server (`server/`):** Node.js + Express.js REST API with Mongoose ODM connected to MongoDB.
2. **Client (`client/`):** React.js + Vite SPA with Tailwind CSS, Lucide icons, and React Router DOM.
3. **Database Layer:** Full Mongoose schemas (`User`, `SkillListing`, `ExchangeRequest`, `CreditTransaction`, `Review`).
4. **Seed Pipeline:** Comprehensive seed script populating 5 diverse demo users, 10+ listings (both `TEACH` and `LEARN`), welcome credit bonus logs, and a sample completed exchange.
5. **Base Layout & Connectivity:** Responsive navigation with real-time credit badge, footer, and landing page consuming the live Express health & featured listings API.

## 2. Directory Layout
```text
Local Skill Exchange/
├── client/                     # React + Vite Client
│   ├── public/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, FeaturedBanner, ListingCard
│   │   ├── context/            # AuthContext, CreditContext
│   │   ├── pages/              # HomePage
│   │   ├── services/           # api.ts (Axios client)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── server/                     # Node.js + Express + MongoDB Server
│   ├── src/
│   │   ├── config/             # db.js
│   │   ├── models/             # User.js, SkillListing.js, ExchangeRequest.js, CreditTransaction.js, Review.js
│   │   ├── routes/             # api.js
│   │   ├── controllers/        # healthController.js, listingsController.js
│   │   ├── seed/               # seed.js
│   │   └── app.js, index.js
│   ├── .env
│   └── package.json
├── package.json                # Root package.json
└── .planning/                  # GSD planning directory
```

## 3. Mongoose Schemas Specification

### 3.1 User Schema
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  avatarUrl: { type: String, default: null },
  bio: { type: String, default: '' },
  location: { type: String, default: 'Local Community' },
  creditsBalance: { type: Number, default: 3.0 }, // 3 starter credits
}, { timestamps: true });
```

### 3.2 SkillListing Schema
```javascript
const skillListingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['TEACH', 'LEARN'], required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Technology', 'Music', 'Languages', 'Arts & Crafts', 'Cooking', 'Fitness', 'Gardening', 'Other'],
    required: true,
    index: true
  },
  experienceLevel: {
    type: String,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS'],
    default: 'ALL_LEVELS'
  },
  format: {
    type: String,
    enum: ['ONLINE', 'IN_PERSON', 'HYBRID'],
    default: 'ONLINE'
  },
  location: { type: String, default: '' },
  durationMinutes: { type: Number, default: 60 },
  status: { type: String, enum: ['ACTIVE', 'PAUSED', 'ARCHIVED'], default: 'ACTIVE', index: true }
}, { timestamps: true });
```

### 3.3 ExchangeRequest Schema
```javascript
const exchangeRequestSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillListing', required: true, index: true },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  proposedDurationHours: { type: Number, default: 1.0 },
  creditCost: { type: Number, default: 1.0 },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING',
    index: true
  },
  notes: { type: String, default: '' },
  scheduledDate: { type: Date, default: null }
}, { timestamps: true });
```

### 3.4 CreditTransaction Schema
```javascript
const creditTransactionSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ['WELCOME_BONUS', 'EXCHANGE_PAYMENT', 'ADMIN_ADJUSTMENT'],
    required: true
  },
  exchangeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeRequest', default: null }
}, { timestamps: true });
```

### 3.5 Review Schema
```javascript
const reviewSchema = new mongoose.Schema({
  exchangeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExchangeRequest', required: true, unique: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' }
}, { timestamps: true });
```

## 4. Local Database Connection & Zero-Friction Setup
- MongoDB connection URL via `process.env.MONGODB_URI` (defaults to `mongodb://127.0.0.1:27017/local_skill_exchange`).
- Memory/Fallback resilience: If a local MongoDB instance is running, it connects automatically. For environments without a running local MongoDB daemon during quick testing, `mongodb-memory-server` can be included in development dependencies to ensure zero-blocker automated testing and demonstrations.

## 5. Seed Dataset
- 5 diverse personas:
  - **Elena Rostova:** Teaches Acoustic Guitar & Classical Piano, wants Web Development.
  - **Marcus Chen:** Teaches Python & TypeScript/React, wants Conversational Spanish.
  - **Sarah Jenkins:** Teaches Sourdough Baking & Pastry, wants Urban Gardening.
  - **David Miller:** Teaches Bicycle Maintenance & Carpentry, wants Vinyasa Yoga.
  - **Maya Patel:** Teaches Conversational Spanish & Yoga, wants French.
- 10 listings (combination of TEACH offers and LEARN requests).
- Welcome bonus transactions (3.0 credits for each user).
- 1 completed sample exchange with a 5-star review.
