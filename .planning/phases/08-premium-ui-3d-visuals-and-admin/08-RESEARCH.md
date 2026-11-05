# Phase 8: Premium UI, 3D Visuals & Admin Dashboard — Research & Technical Specification

## 1. Problem Statement & Scope

Phase 8 elevates Local Skill Exchange from a feature-complete functional application to a polished, visually engaging, and enterprise-grade community platform. This phase delivers on four key requirements:

1. **Interactive 3D Skill Network Hero (`REQ-UI-02`):**
   - A reactive Three.js / React Three Fiber network graph representing skills as interconnected nodes floating in 3D space.
   - Nodes connect with glowing constellation edges, pulse on hover, and display skill categories.
   - Graceful low-power and mobile fallback when WebGL is unavailable or user prefers reduced motion.

2. **Fluid Micro-Interactions & Transitions (`REQ-UI-03`):**
   - Seamless Framer Motion page transitions (`<PageTransition>`) across routes.
   - Staggered entrance animations for skill cards, match recommendations, and session cards.
   - Spring-based physics for modals, toasts, and dropdowns.

3. **Comprehensive Administrator Dashboard (`REQ-ADMIN-01`, `REQ-ADMIN-02`, `REQ-ADMIN-03`):**
   - Real-time aggregated platform metrics: user counts, active offers, open requests, completed sessions, and credit circulation volume.
   - User Management: User search, role filter, one-click account suspension/reactivation (`isActive`), and role assignment (`LEARNER`, `PROVIDER`, `ADMIN`).
   - Moderation Desk: Review user safety reports, examine reporter/reported user context, and mark reports as `RESOLVED` or `DISMISSED` with admin audit notes.
   - Skill Taxonomy Manager: Add and organize skill categories and tags.
   - Direct Time-Banking Credit adjustments with mandatory audit reason logging.

4. **Full 20 Application Page Views:**
   - Deliver and wire up all 20 views across the platform, including dedicated pages for `/about`, `/how-it-works`, `/safety`, `/community`, and `/admin`.

---

## 2. Technical Architecture & Schemas

### 2.1 Backend Admin API Architecture

The administrative tier requires strict Role-Based Access Control (`protect` + `authorize('ADMIN')`).

```
                              [Incoming Request]
                                      │
                                      ▼
                             [protect middleware]
                                      │
                                      ▼
                        [authorize('ADMIN') middleware]
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
  [Platform Metrics]          [User Management]          [Moderation Reports]
- Total Users               - Paginated Search         - Pending / Reviewed
- Active Offers/Requests    - Status Toggle (Active)   - Action / Dismiss
- Completed Sessions        - Role Demotion/Promotion  - Audit Notes
- Credit Volume in Flow
```

#### Endpoints:
- `GET /api/admin/metrics`: Aggregated KPI counters and time-series session activity.
- `GET /api/admin/users`: Searchable and filterable user directory with role and status indicators.
- `PUT /api/admin/users/:id/status`: Toggle user account active/suspended state.
- `PUT /api/admin/users/:id/role`: Change user role (`LEARNER`, `PROVIDER`, `ADMIN`).
- `GET /api/admin/reports`: List of safety reports with status filter (`PENDING`, `REVIEWED`, `RESOLVED`, `DISMISSED`).
- `PUT /api/admin/reports/:id`: Update report status with admin resolution notes.
- `POST /api/admin/categories`: Create a new skill category taxonomy item.

### 2.2 3D Constellation & Skill Network Architecture

The Three.js canvas in `SkillNetworkHero.tsx` renders a dynamic 3D graph:
- **Vertices (Nodes):** `THREE.Sphere` geometry with custom materials (emerald, cyan, amber, violet, teal). Each node represents a skill domain (e.g., Programming, Language, Gardening, Music, Culinary, Design).
- **Edges (Lines):** `THREE.LineSegments` connecting vertices within distance threshold $d < R$, representing potential barter and barter-matching linkages.
- **Floating Physics:** `@react-three/drei`'s `<Float>` component combined with frame-based rotation (`useFrame`) produces gentle organic movement.
- **Mobile / Fallback Strategy:** If WebGL fails to initialize or on small screens (< 640px), render an animated CSS SVG gradient mesh constellation with zero performance penalty.

### 2.3 Framer Motion Animation Standard

- **Route Transitions:** `<motion.div>` wrapper with variants:
  ```ts
  const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
  };
  ```
- **Hover Micro-Interactions:** Subtle scale (`whileHover={{ scale: 1.02 }}`) and active tap (`whileTap={{ scale: 0.98 }}`).
- **Modal Transitions:** Spring bounce with backdrop opacity fading.

---

## 3. The 20 Application Page Views

| # | Route | Page Component | Description | Access |
|---|-------|----------------|-------------|--------|
| 1 | `/` | `HomePage` | Hero with 3D skill network, live stats, value propositions, how-it-works preview | Public |
| 2 | `/login` | `LoginPage` | Authentication with email/password and demo login pills | Public |
| 3 | `/register` | `RegisterPage` | Onboarding with 3 free bonus credits | Public |
| 4 | `/forgot-password` | `ForgotPasswordPage` | Password reset request | Public |
| 5 | `/reset-password` | `ResetPasswordPage` | Token-based password update | Public |
| 6 | `/profile` | `ProfilePage` | User profile editor, skills offered/wanted, bio, city | Protected |
| 7 | `/users/:id` | `PublicProfilePage` | Public member profile with reviews, ratings, skills, and chat link | Public |
| 8 | `/explore` | `ExplorePage` | Filterable skill catalog (offers and learning requests) | Public |
| 9 | `/post` | `PostPage` | Create skill offer or request with category, level, and tags | Protected |
| 10 | `/offers/:id` | `OfferDetailPage` | In-depth skill offer details with booking CTA | Public |
| 11 | `/requests/:id` | `RequestDetailPage` | Learning request details with offer-to-teach CTA | Public |
| 12 | `/matches` | `MatchesPage` | Smart skill matching dashboard with reciprocal scoring ⭐ | Protected |
| 13 | `/sessions` | `SessionsPage` | Booking management, weekly availability scheduler, dual-confirmations | Protected |
| 14 | `/ledger` | `LedgerPage` | Time-banking credit transactions, balance breakdown, CSV export | Protected |
| 15 | `/messages` | `MessagesPage` | 1-on-1 direct messaging threads, chat bubble UI, keyboard send | Protected |
| 16 | `/admin` | `AdminDashboardPage` | 5-tab admin command center: Metrics, Users, Moderation, Categories, Credits | Admin Only |
| 17 | `/about` | `AboutPage` | Time-banking manifesto, 1 hour = 1 credit philosophy, neighborhood vision | Public |
| 18 | `/how-it-works` | `HowItWorksPage` | Interactive 4-step guide: List Skill → Match → Book Session → Earn Credits | Public |
| 19 | `/safety` | `SafetyGuidelinesPage` | Community code of conduct, trust guidelines, dispute process | Public |
| 20 | `/community` | `CommunityPage` | Community leaderboard, top teachers, neighborhood exchange feed | Public |

---

## 4. Verification & Testing Strategy

- **Backend Admin Suite (`backend/test/phase8Verification.js`):**
  - Verify `GET /api/admin/metrics` returns 401 without auth, 403 for non-admins, 200 for admins with accurate counts.
  - Verify `GET /api/admin/users` supports pagination and role filtering.
  - Verify `PUT /api/admin/users/:id/status` toggles account suspension.
  - Verify `GET /api/admin/reports` lists reports with status filter.
  - Verify `PUT /api/admin/reports/:id` updates status to `RESOLVED` with admin notes.
- **Frontend Verification:**
  - `npm run build --prefix frontend` builds with zero errors.
  - Verify all 20 routes resolve cleanly without 404.
  - Verify 3D canvas loads with fallback and responsiveness.

