# System Architecture & Technical Design

## 1. High-Level Architecture Overview

Local Skill Exchange is engineered as a full-stack **MERN monorepo** (MongoDB, Express.js, React.js with Vite, Node.js) paired with Tailwind CSS, Three.js, and Framer Motion. The platform implements an egalitarian time-banking economic model backed by an immutable double-entry credit ledger, an automated pairwise matching engine, and real-time community communication.

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CLIENT TIER (React 18 + Vite)                     │
│  - 20 Application Page Views (SPA with React Router v6)                │
│  - 3D Interactive Constellation Hero (Three.js / React Three Fiber)    │
│  - Micro-Interactions & Transitions (Framer Motion)                   │
│  - Global AuthContext + Axios API Interceptors                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / JSON API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     SERVER TIER (Node.js + Express)                    │
│  - Security: Helmet (CSP, HSTS, Nosniff), Rate Limiters, NoSQL Sanitizer│
│  - Authentication: JWT Bearer Tokens, Bcryptjs Password Hashing        │
│  - RBAC: LEARNER, PROVIDER, ADMIN Middleware Guards                    │
│  - Validation: Zod Schemas on Request Payloads                         │
│  - Business Services:                                                  │
│      ├── Smart Skill Matching Engine ⭐ (Reciprocal compatibility)     │
│      ├── Time-Banking Credit Ledger Service (Double-entry accounting)  │
│      └── In-App Notification & Messaging Service                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mongoose ODM
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     DATA TIER (MongoDB Atlas Cluster)                  │
│  - 12 Schemas: User, Skill, Offer, Request, Availability, Session,     │
│    CreditTransaction, Review, Conversation, Message, Notification,     │
│    Report.                                                             │
│  - Compound Indexes, Text Indexes, and Atomic Transactions.             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Smart Skill Matching Engine ⭐ (Mathematical Specification)

The centerpiece of the application is the **Smart Skill Matching Engine**, located at `backend/src/services/matchingService.js`. The engine computes a deterministic compatibility score $S \in [0, 100]$ between a requesting user $A$ and any candidate partner $B$.

### 2.1 The Scoring Dimensions

$$S = \min\left(100, S_{\text{skill}} + B_{\text{reciprocal}} + S_{\text{category}} + S_{\text{lang}} + S_{\text{dist}} + S_{\text{rep}}\right)$$

1. **Direct Skill Overlap ($S_{\text{skill}} = 40$ pts):**
   Awarded when candidate $B$ explicitly offers at least one skill present on user $A$'s wishlist:
   $$\exists s \in \text{SkillsOffered}(B) \text{ such that } s \in \text{SkillsWanted}(A)$$

2. **Reciprocal Barter Bonus ($B_{\text{reciprocal}} = 25$ pts):**
   Awarded when candidate $B$ also desires a skill that user $A$ offers. This forms a mutual barter exchange where both parties learn simultaneously with zero net credit deduction:
   $$\exists s_1 \in \text{SkillsOffered}(B) \cap \text{SkillsWanted}(A) \quad \text{AND} \quad \exists s_2 \in \text{SkillsOffered}(A) \cap \text{SkillsWanted}(B)$$

3. **Category Affinity Fallback ($S_{\text{category}} = 20$ pts):**
   Awarded when exact skill titles differ, but candidate $B$ teaches in a domain category that user $A$ wants (e.g. Technology, Design, Academic, Creative, Lifestyle).

4. **Conversational Language Match ($S_{\text{lang}} = 5$ pts):**
   $$\text{Languages}(A) \cap \text{Languages}(B) \neq \emptyset$$

5. **Geographic Neighborhood Proximity ($S_{\text{dist}} = 5$ or $3$ pts):**
   - Exact neighborhood match: $5$ pts.
   - Same city match: $3$ pts.

6. **Community Reputation Multiplier ($S_{\text{rep}} \le 5$ pts):**
   Scaled according to user $B$'s average rating $R_B \in [1, 5]$:
   $$S_{\text{rep}} = \frac{R_B}{5.0} \times 5$$

---

## 3. Time-Banking Economics & Double-Entry Accounting

### 3.1 The Fundamental Law of Time Banking
$$\mathbf{1\text{ Hour Taught} = 1.0\text{ Credit Earned}}$$
Time banking eliminates currency speculation, inflation, and pricing discrimination:
- 1 hour of beginner acoustic guitar = 1.0 credit.
- 1 hour of advanced Python architecture = 1.0 credit.
- 1 hour of sourdough bread baking = 1.0 credit.

### 3.2 Atomic Ledger Transactions
All balance modifications are executed through `backend/src/services/creditService.js` and recorded in the immutable `CreditTransaction` collection.
- **`SESSION_EARN`:** Credit added to provider account upon verified session completion.
- **`SESSION_SPEND`:** Credit deducted from learner account upon verified session completion.
- **`WELCOME_BONUS`:** Non-refundable 3.0 credits granted upon user onboarding.
- **`ADMIN_ADJUSTMENT`:** Audited manual adjustment requiring an administrator ID and written justification.
- **Reciprocal Swaps:** When a session is flagged as a mutual barter exchange (`isReciprocal: true`), a transaction of $0.0$ credits is logged to preserve audit history while leaving balances untouched.

---

## 4. Frontend State Management & 3D Rendering

- **Authentication Context (`AuthContext.tsx`):** Maintains token persistence via `localStorage`, validates token expiration, manages current user object, and feeds role-based route guards (`ProtectedRoute`, `AdminRoute`).
- **3D Constellation Visualizer (`SkillNetworkHero.tsx`):**
  - Powered by `@react-three/fiber` and `@react-three/drei`.
  - Connects floating nodes with `THREE.LineSegments` representing skill barter paths.
  - Features real-time raycasting hover events with HTML tooltips.
  - Automatically falls back to an animated CSS SVG constellation on low-power devices and mobile screens.
- **Framer Motion Micro-Interactions (`PageTransition.tsx`):**
  - Route transitions with spring physics.
  - Staggered entrances for list items and cards.

