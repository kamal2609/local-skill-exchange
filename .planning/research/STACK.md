# Technology Stack Research & Decisions (MERN Stack)

## Core Architecture
- **Backend Runtime:** Node.js (v20+)
- **Backend Framework:** Express.js
  - Clean modular architecture: controllers, services, middleware, routes, and models.
  - RESTful API design with JSON payloads and HTTP status codes.
  - Robust error handling middleware and request logging.
  - CORS configuration enabling seamless communication with Vite development server and production builds.
- **Database & ODM:** MongoDB with Mongoose (v8+)
  - Document-based persistence with flexible, strongly typed Mongoose schemas and validation.
  - Multi-document transactions (`mongoose.startSession()`) for atomic credit transfers between users.
  - Indexing on user email, listing categories, listing statuses, and transaction timestamps.
- **Frontend Framework:** React 19 / 18 with Vite
  - Ultra-fast development server (Hot Module Replacement) and optimized production rollup bundling.
  - Client-side routing with `react-router-dom` (v6+).
  - Component-driven UI architecture with reusable atomic primitives.
- **Styling & UI:** Tailwind CSS (v3/v4) + Lucide React Icons
  - Responsive, clean, accessible modern design with a warm community-oriented aesthetic.
  - Accent colors: Emerald/Teal for credits, time banking, and skill growth; Slate for structural contrast.
- **Authentication & Security:**
  - Password hashing with `bcryptjs` (salt rounds: 10).
  - Stateless JSON Web Tokens (JWT) stored in secure HTTP-only cookies or authorization headers.
  - Authentication and route-protection middleware on Express endpoints.
- **Validation:**
  - Mongoose built-in schema validation alongside server-level request payload sanitization.

## Project Structure (Clean Monorepo)
```text
Local Skill Exchange/
├── client/                     # React.js + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, Cards, Badges, Modals
│   │   ├── context/            # AuthContext, CreditContext
│   │   ├── pages/              # Home, Explore, PostSkill, Profile, Exchanges
│   │   ├── services/           # Axios/Fetch API client layer
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── server/                     # Node.js + Express + MongoDB Backend
│   ├── src/
│   │   ├── config/             # db.js (MongoDB connection)
│   │   ├── models/             # User, SkillListing, ExchangeRequest, CreditTransaction, Review
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # API route definitions (/api/users, /api/listings, etc.)
│   │   ├── middleware/         # Auth, validation, error handler
│   │   ├── seed/               # Demo seed script
│   │   └── server.js           # Express app entrypoint
│   ├── .env
│   └── package.json
├── package.json                # Root package.json with concurrent scripts
└── .planning/                  # GSD planning directory
```

## Dependencies Summary
### Server Dependencies
- `express`, `mongoose`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `morgan`
- Dev: `nodemon`

### Client Dependencies
- `react`, `react-dom`, `react-router-dom`, `lucide-react`, `clsx`, `tailwind-merge`, `axios`
- Dev: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`, `typescript`, `@types/react`, `@types/react-dom`
