# Technology Stack Research & Decisions

## Core Architecture
- **Framework:** Next.js (App Router, React 19, TypeScript)
  - Leverages Server Components for fast initial data load and SEO-friendly listing discovery.
  - Client components for interactive exchange flows, filter state, and forms.
  - Server Actions & Route Handlers for mutations, ensuring strict server-side validation.
- **Styling & UI:** Tailwind CSS + Lucide Icons + Tailwind UI patterns
  - Responsive, clean, accessible modern design with a warm community-oriented aesthetic.
  - Reusable UI component primitives (Button, Modal, Badge, Card, Avatar, Toast).
- **Database & Data Layer:** Prisma ORM with SQLite
  - Zero-friction local development, instant migrations, fully typed models.
  - Easily migratable to PostgreSQL in production with minimal schema changes.
- **Form Handling & Validation:** Zod
  - Schema-driven validation on both client and server actions.
- **Authentication:** Lightweight Session-based Authentication
  - Secure HTTP-only cookies, password hashing with bcryptjs.
  - Straightforward onboarding flow that seeds new accounts with initial starter credits (3 hours).

## Dependencies Summary
- `next`, `react`, `react-dom`, `typescript`
- `tailwindcss`, `postcss`, `autoprefixer`, `lucide-react`
- `@prisma/client`, `prisma`
- `zod`, `bcryptjs`, `clsx`, `tailwind-merge`
