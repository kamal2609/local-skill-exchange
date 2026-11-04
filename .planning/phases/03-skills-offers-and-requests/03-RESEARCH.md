# Phase 3: Skills, Offers & Learning Requests — Research & Technical Specification

## 1. Problem Context & Value Architecture
In a neighbourhood time-banking skill exchange platform:
1. **Skill Catalog (Taxonomy):** A standardized, curated directory of skills (e.g., Python, Graphic Design, Spanish, Guitar, Woodworking, Pastry Baking) organized by standard categories (`Technology`, `Design`, `Academic`, `Creative`, `Lifestyle`, `Other`). This prevents fragmentation (e.g. "pythn" vs "Python Programming") while allowing users to propose new skills.
2. **Skill Offers (Supply / Teaching):** Providers create structured teaching offers linked to a skill, defining their experience level, preferred teaching mode (`ONLINE`, `IN_PERSON`, `HYBRID`), session duration (minutes), neighborhood, and teaching philosophy.
3. **Learning Requests (Demand / Learning):** Learners post specific requests for skills they wish to acquire, outlining learning goals, preferred schedule, and target difficulty.
4. **Relationship to Differentiating Feature (Phase 4):** The Smart Skill Matching Engine in Phase 4 directly evaluates these published offers and requests to compute reciprocal compatibility scores. Clean, validated schemas in Phase 3 are vital for Phase 4's success.

## 2. API Endpoints Architecture

### 2.1 Skill Taxonomy (`/api/skills`)
- `GET /api/skills`: Public catalog list with query filtering (`category`, `difficulty`, `search`, `limit`, `sort`). Populates popularity counters.
- `GET /api/skills/:id`: Public single skill detail with count of active offers and requests.
- `POST /api/skills`: Protected endpoint (authenticated users/admin) to propose or add a new skill to the taxonomy with duplicate name prevention.

### 2.2 Skill Offers (`/api/offers`)
- `GET /api/offers`: Public directory of active teaching offers with filters (`skillId`, `category`, `learningMode`, `experienceLevel`, `city`, `search`, `page`, `limit`).
- `GET /api/offers/my`: Protected endpoint for the authenticated provider to view all their offers (active, paused, archived).
- `POST /api/offers`: Protected endpoint for a provider to publish an offer. Validates skill existence and ensures unique `(providerId, skillId)`.
- `PUT /api/offers/:id`: Protected endpoint for the owner to edit details or toggle status (`ACTIVE` <-> `PAUSED`).
- `DELETE /api/offers/:id`: Protected endpoint for the owner to delete/archive an offer.

### 2.3 Learning Requests (`/api/requests`)
- `GET /api/requests`: Public directory of open learning requests with filters (`skillId`, `category`, `preferredMode`, `status`, `page`, `limit`).
- `GET /api/requests/my`: Protected endpoint for the authenticated learner to view all their requests.
- `POST /api/requests`: Protected endpoint for a learner to publish a request.
- `PUT /api/requests/:id`: Protected endpoint for the owner to edit or cancel a request.
- `DELETE /api/requests/:id`: Protected endpoint for the owner to remove a request.

## 3. Data Integrity & Ownership Rules
- **Ownership Verification:** Only the author of an offer (`offer.providerId.equals(req.user._id)`) or an `ADMIN` can update or delete that offer.
- **Learner Ownership:** Only the author of a request (`request.learnerId.equals(req.user._id)`) or an `ADMIN` can update or delete that request.
- **Population:** Skill references (`skillId`) and User references (`providerId`, `learnerId`) must be populated cleanly with sanitized fields (never exposing passwords or reset tokens).

## 4. Frontend User Experience
- **Discovery Catalog (`/explore`):**
  - Unified view with tabs: **"Skills to Learn (Offers)"** and **"Community Requests"**.
  - Category selector pills with active visual indicators.
  - Search input with instantaneous debounced filtering.
  - Filters for Learning Format (`All`, `Online`, `In-Person`, `Hybrid`).
- **Post a Skill / Request (`/post`):**
  - Toggle between "I want to Teach" (Create Offer) and "I want to Learn" (Create Request).
  - Searchable skill dropdown from existing catalog + instant create new skill option.
  - Clean validation error feedback via React Hook Form + Zod.
- **My Listings:**
  - Accessible from the User Profile or dedicated tab to manage active offers and open requests.

