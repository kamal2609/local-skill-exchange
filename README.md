# 🌟 Local Skill Exchange – Neighbourhood Time-Banking Platform

> **1 Hour Taught = 1 Credit Earned.** Egalitarian knowledge sharing with an AI-powered Smart Skill Matching Engine ⭐, immutable double-entry credit ledger, interactive 3D constellation visuals, and comprehensive community moderation. Built on the **MERN Stack (MongoDB, Express, React, Node.js)**.

---

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Differentiating Feature: Smart Skill Matching Engine ⭐](#-differentiating-feature-smart-skill-matching-engine-)
- [Tech Stack](#-tech-stack)
- [Monorepo Architecture](#-monorepo-architecture)
- [The 20 Application Page Views](#-the-20-application-page-views)
- [Quickstart & Setup](#-quickstart--setup)
- [Automated Testing & Security Audit](#-automated-testing--security-audit)
- [Deployment Guide](#-deployment-guide)
- [Documentation Suite](#-documentation-suite)
- [License](#-license)

---

## 🤝 Project Overview

Local Skill Exchange is an egalitarian neighborhood barter platform powered by **Time Banking**:
- **Pure Knowledge Barter:** No fiat currency is exchanged. Every person's sixty minutes of teaching is valued equally: **1 hour = 1 credit**.
- **Welcome Bonus:** Every new member receives **3 free starter credits** to begin learning immediately.
- **Reciprocal Barter Optimization:** Detects two-way matches where two neighbors learn from each other with zero net credit spend.
- **Trust & Accountability:** Double-entry ledger, mutual dual-confirmation of completed sessions, peer reviews, and human moderation.

---

## ✨ Key Features

1. **Authentication & User Profiles:** JWT authentication, bcryptjs encryption, role-based authorization (`LEARNER`, `PROVIDER`, `ADMIN`), and comprehensive profile customization.
2. **Skill Catalog & Taxonomy:** Searchable, filterable directory across 6 skill domains (`Technology`, `Design`, `Creative`, `Academic`, `Lifestyle`, `Other`).
3. **Smart Skill Matching Engine ⭐:** 6-dimension mathematical compatibility scoring with reciprocal swap detection and human-readable explanations.
4. **Availability & Session Booking:** Interactive weekly availability scheduler, conflict prevention, session lifecycle state machine, and dual-party confirmation.
5. **Time-Banking Credit System & Ledger:** Atomic credit transfers upon session completion, non-negative balance safeguards, filterable transaction history, and CSV export.
6. **Communication & Community:** 1-on-1 direct messaging, notification center with unread badges, 5-star peer reviews, and confidential safety reporting.
7. **Interactive 3D Constellation Hero:** Three.js / React Three Fiber interactive skill network graph with floating rotation, node glow, hover badges, and 2D SVG fallback.
8. **Administrator Command Center:** Real-time KPI analytics, user directory with suspension toggles, moderation desk for report resolution, and manual credit audits.

---

## ⭐ Differentiating Feature: Smart Skill Matching Engine

The core competitive advantage of Local Skill Exchange is its **Smart Skill Matching Engine**:
$$\text{Total Score} = \text{SkillScore} + \text{ReciprocalBonus} + \text{CategoryScore} + \text{LanguageScore} + \text{DistanceScore} + \text{ReputationScore}$$

- **Direct Skill Match (40 pts):** Direct overlap between your learning wishlist and their teaching offers.
- **Reciprocal Barter Bonus (25 pts):** Mutual barter detection where they want a skill you teach, allowing zero-cost credit swaps.
- **Category Compatibility (20 pts):** Domain-level synergy when exact skill names vary.
- **Language Alignment (5 pts):** Shared conversational tongues.
- **Geographic Proximity (5 pts):** Neighborhood/city distance decay.
- **Community Reputation (5 pts):** Peer rating multiplier.
- **Explainability:** Generates transparent bullet points detailing why two neighbors were paired.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js, MongoDB Atlas with Mongoose (12 schemas), Zod validation, JWT, Helmet, Morgan, Express Rate Limit.
- **Frontend:** React 18 (TypeScript), Vite, Tailwind CSS, Lucide React icons, Three.js, React Three Fiber (@react-three/fiber), Drei (@react-three/drei), Framer Motion.
- **Architecture:** Monorepo with concurrently managed scripts and unified root test runner.

---

## 🗂️ Monorepo Architecture

```
local-skill-exchange/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Route controllers (Auth, Skills, Matches, Sessions, Credits, Admin...)
│   │   ├── middleware/       # Auth, RBAC, Validation, ErrorHandler, Sanitization
│   │   ├── models/           # 12 Mongoose Models (User, Skill, Session, CreditTransaction...)
│   │   ├── routes/           # 15 Route Groups
│   │   ├── services/         # Matching Engine, Credit Accounting Service
│   │   ├── validators/       # Zod Schemas
│   │   ├── app.js            # Express application setup & middleware
│   │   └── server.js         # HTTP server entry point
│   └── test/                 # Automated verification suites & security audit
├── frontend/
│   ├── src/
│   │   ├── components/       # UI Components (Navbar, 3D Hero, Modals, Scheduler)
│   │   ├── context/          # Auth Context & Provider
│   │   ├── pages/            # All 20 Application Page Views
│   │   ├── services/         # Axios API client with auth interceptors
│   │   └── App.tsx           # Client router & page routes
│   └── index.html
├── docs/                     # Specialized documentation suite
├── .planning/                # GSD planning state & phase documentation
├── package.json              # Monorepo root scripts
├── render.yaml               # Render Web Service blueprint
└── vercel.json               # Vercel SPA rewrite rules
```

---

## 📱 The 20 Application Page Views

| # | Route | View | Description | Access |
|---|-------|------|-------------|--------|
| 1 | `/` | `HomePage` | Hero with 3D skill network, live stats, value propositions | Public |
| 2 | `/login` | `LoginPage` | Authentication with demo login pills | Public |
| 3 | `/register` | `RegisterPage` | Onboarding with 3 free bonus credits | Public |
| 4 | `/forgot-password` | `ForgotPasswordPage` | Password recovery request | Public |
| 5 | `/reset-password` | `ResetPasswordPage` | Token-based password reset | Public |
| 6 | `/profile` | `ProfilePage` | User profile editor, skills offered/wanted, bio | Protected |
| 7 | `/users/:id` | `PublicProfilePage` | Public member profile with reviews, ratings, skills | Public |
| 8 | `/explore` | `ExplorePage` | Filterable skill catalog (offers and requests) | Public |
| 9 | `/post` | `PostPage` | Create skill offer or request | Protected |
| 10 | `/offers/:id` | `OfferDetailPage` | Skill offer details with booking CTA | Public |
| 11 | `/requests/:id` | `RequestDetailPage` | Learning request details with offer-to-teach CTA | Public |
| 12 | `/matches` | `MatchesPage` | Smart skill matching dashboard with reciprocal scoring ⭐ | Protected |
| 13 | `/sessions` | `SessionsPage` | Booking management, weekly availability scheduler | Protected |
| 14 | `/ledger` | `LedgerPage` | Time-banking credit transactions, balance, CSV export | Protected |
| 15 | `/messages` | `MessagesPage` | 1-on-1 direct messaging threads, chat bubble UI | Protected |
| 16 | `/admin` | `AdminDashboardPage` | 5-tab admin center: KPIs, Users, Moderation, Credits | Admin Only |
| 17 | `/about` | `AboutPage` | Time-banking manifesto, 1 hour = 1 credit philosophy | Public |
| 18 | `/how-it-works` | `HowItWorksPage` | 4-step visual flow: List Skill → Match → Book → Learn | Public |
| 19 | `/safety` | `SafetyGuidelinesPage` | Community code of conduct, trust guidelines | Public |
| 20 | `/community` | `CommunityPage` | Community leaderboard, top teachers, neighbor stories | Public |

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB Atlas cluster or local MongoDB instance (optional; fully operational in offline demo fallback)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/local-skill-exchange.git
cd local-skill-exchange

# Install all dependencies across monorepo
npm install
npm install --prefix backend
npm install --prefix frontend
```

### Environment Configuration
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```
Ensure `JWT_SECRET` and `MONGODB_URI` are set.

### Database Seeding (Optional)
Populate the database with realistic neighborhood skills, users, offers, requests, and sessions:
```bash
npm run seed
```

### Development
Launch both the Express backend (`http://localhost:5000`) and Vite frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

---

## 🧪 Automated Testing & Security Audit

The project features a comprehensive automated testing harness requiring zero external services:

```bash
# Run the Master Test Suite (32+ functional assertions across all modules)
npm test

# Run the OWASP Security Audit Suite (Headers, NoSQL injection, Rate limiting)
node backend/test/securityAudit.js

# Build production bundle for frontend (zero TypeScript errors)
npm run build
```

---

## ☁️ Deployment Guide

### Frontend on Vercel
1. Import repository on Vercel.
2. Root directory: `./`
3. Build command: `npm run build:frontend`
4. Output directory: `frontend/dist`
5. Configured with `vercel.json` for seamless client-side SPA routing rewrites.

### Backend on Render / Railway
1. Create a Web Service connected to this repository.
2. Build command: `npm install --prefix backend`
3. Start command: `npm run start --prefix backend`
4. Set environment variables: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`.
5. Blueprint provided in `render.yaml`.

---

## 📚 Documentation Suite

For in-depth technical details, consult the specialized documentation in the [`docs/`](./docs) folder:
- [Architecture & Design (`docs/ARCHITECTURE.md`)](./docs/ARCHITECTURE.md)
- [Database Models & Indexes (`docs/DATABASE.md`)](./docs/DATABASE.md)
- [REST API Reference (`docs/API.md`)](./docs/API.md)
- [Testing & Verification Guide (`docs/TESTING.md`)](./docs/TESTING.md)
- [User Guide & Onboarding (`docs/USER_GUIDE.md`)](./docs/USER_GUIDE.md)

---

## 📄 License
MIT © 2026 Local Skill Exchange. Built for community empowerment and lifelong learning.

