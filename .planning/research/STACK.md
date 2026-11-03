# Technology Stack Research & Decisions (MERN Monorepo)

## Core Architecture
- **Backend Runtime:** Node.js (v20+)
- **Backend Framework:** Express.js REST API
  - Modular layered architecture: controllers, services, middleware, models, routes, validators.
  - Security suite: `helmet` (security headers), `cors` (origin protection), `express-rate-limit` (DDoS & brute force prevention), `morgan` (HTTP request logging).
  - Validation: Request payload validation using `zod`.
  - Authentication: JWT tokens with `jsonwebtoken` and `bcryptjs` password hashing.
- **Database & ODM:** MongoDB with Mongoose (v8+)
  - 12 normalized collections with typed schemas, validation rules, indexes, and virtuals.
  - Multi-document transactions (`mongoose.startSession()`) for atomic credit transfers between users.
  - Support for local MongoDB (`mongodb://127.0.0.1:27017/local_skill_exchange`) and cloud deployment (`MongoDB Atlas`).
- **Frontend Framework:** React.js (v18/19) with Vite (TypeScript)
  - Ultra-fast development server with Hot Module Replacement (HMR) and optimized Rollup production builds.
  - Client-side routing with `react-router-dom` (v6+).
  - Styling: Tailwind CSS + Lucide React icons.
  - Visual Polish & 3D:
    - Three.js + React Three Fiber (`@react-three/fiber`) + Drei (`@react-three/drei`) for an interactive 3D skill network.
    - Framer Motion (`framer-motion`) for fluid page transitions, card hover effects, and modal physics.
  - Form Management: React Hook Form (`react-hook-form`) + `@hookform/resolvers` + `zod`.
  - HTTP Client: Axios with centralized instance, interceptors, and error formatting.
- **Testing & Quality Assurance:**
  - Unit & Integration: Vitest / Jest, Supertest.
  - End-to-End: Playwright.
- **Strict Restrictions:**
  - Zero Next.js, Zero Prisma, Zero SQLite.

## Project Structure (Official Monorepo Layout)
```text
Local Skill Exchange/
├── frontend/                          # React + Vite Client
│   ├── public/
│   ├── src/
│   │   ├── assets/                    # Static assets & icons
│   │   ├── components/
│   │   │   ├── layout/                # Navbar, Footer, Sidebar
│   │   │   ├── ui/                    # Button, Card, Badge, Modal, Input
│   │   │   ├── three/                 # 3D Skill Network Scene
│   │   │   └── shared/                # ProtectedRoute, ErrorBoundary
│   │   ├── context/                   # AuthContext, NotificationContext
│   │   ├── hooks/                     # Custom hooks
│   │   ├── pages/                     # 20 application page views
│   │   ├── services/                  # api.ts (Axios client)
│   │   ├── styles/                    # Global Tailwind styles
│   │   ├── utils/                     # Formatters, helpers
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
├── backend/                           # Node.js + Express API
│   ├── src/
│   │   ├── config/                    # db.js (MongoDB connection)
│   │   ├── controllers/               # Route controllers
│   │   ├── middleware/                # Auth, validation, error handler
│   │   ├── models/                    # 12 Mongoose models
│   │   ├── routes/                    # Express REST route definitions
│   │   ├── seed/                      # Database seed script
│   │   ├── services/                  # Business logic (matchingService, creditService)
│   │   ├── utils/                     # Helpers (token, pagination)
│   │   ├── validators/                # Zod schemas
│   │   ├── app.js                     # Express app setup
│   │   └── server.js                  # Entry point
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── docs/                              # Project documentation
├── .gitignore
├── README.md
├── package.json                       # Root workspace scripts
└── .planning/                         # GSD planning directory
```
