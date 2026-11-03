# Phase 1 Research: MERN Monorepo Foundation & Database Architecture

## 1. Objectives & Deliverables
Establish a production-ready, clean MERN monorepo layout for Local Skill Exchange adhering strictly to the official college specifications:
1. **Directory Migration:** Safely migrate from `client/` and `server/` to `frontend/` (React + Vite + TypeScript) and `backend/` (Node + Express + MongoDB).
2. **Server Architecture (`backend/`):** Express REST API with CORS, Helmet, Morgan, JSON parsing, rate limiting, and centralized error handling.
3. **Database Architecture:** All 12 normalized Mongoose models:
   - `User`, `Skill`, `SkillOffer`, `LearningRequest`, `Availability`, `Session`, `CreditTransaction`, `Review`, `Conversation`, `Message`, `Notification`, `Report`.
4. **Seed Pipeline:** Comprehensive seed script populating 6+ realistic users (including an Administrator), 15+ skills across 5 categories, 10+ offers, 8+ learning requests, recurring availability slots, and ledger history.
5. **Base Layout & Connectivity:** Responsive navigation with real-time credit badge, footer, and landing page consuming the live Express health & featured listings API.

## 2. Directory Layout
```text
Local Skill Exchange/
├── frontend/                          # React + Vite + TypeScript
│   ├── public/
│   ├── src/
│   │   ├── components/                # Layout, UI, and 3D primitives
│   │   ├── pages/                     # HomePage, etc.
│   │   ├── services/                  # api.ts (Axios)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                           # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/                    # db.js (MongoDB connection)
│   │   ├── models/                    # 12 Mongoose models
│   │   ├── routes/                    # Express REST route definitions
│   │   ├── controllers/               # Route handlers
│   │   ├── middleware/                # Error handling, auth
│   │   ├── seed/                      # Database seed script
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── package.json                       # Root workspace scripts
└── .planning/                         # GSD planning directory
```

## 3. Seed Dataset Specification
- **6 Users:**
  1. `admin@skills.local` (System Administrator)
  2. `elena.rostova@skills.local` (Acoustic Guitar, Oil Painting — Provider & Learner)
  3. `marcus.chen@skills.local` (Python, React/TypeScript — Provider & Learner)
  4. `sarah.jenkins@skills.local` (Sourdough Baking, Artisan Pastry — Provider & Learner)
  5. `david.miller@skills.local` (Bicycle Maintenance, Basic Carpentry — Provider & Learner)
  6. `maya.patel@skills.local` (Conversational Spanish, Vinyasa Yoga — Provider & Learner)
- **15+ Skills:** Categorized under Technology, Design, Academic, Creative, Lifestyle, and Other.
- **10+ Skill Offers:** Detailed teaching approaches, modes, and durations.
- **8+ Learning Requests:** Active learning requests with goals and required skills.
- **Credit Transactions:** 3.0 `WELCOME_BONUS` credits for all users + initial sample exchange ledger entries.
