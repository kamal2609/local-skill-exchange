# Phase 5: Availability Management & Session Booking — Research & Technical Specification

## 1. Context & Business Domain
In a Time-Banking skill exchange, scheduling is the critical bridge connecting a discovery or match to actual peer learning:
1. **Weekly Availability Profiles:** Providers and learners define recurring weekly windows (days 0-6, start time, end time, duration, and format) so peers only book mutually possible slots.
2. **Session Booking & Double-Booking Prevention:** Learners request sessions for specific dates and times. The system prevents time collisions for both parties.
3. **Session Lifecycle State Machine:**
   $$\text{REQUESTED} \longrightarrow \begin{cases} \text{ACCEPTED} \longrightarrow \text{SCHEDULED} \longrightarrow \text{IN\_PROGRESS} \longrightarrow \text{COMPLETED} \\ \text{REJECTED} \\ \text{CANCELLED} \end{cases}$$
4. **Dual-Confirmation Flow:** Once a session concludes, the learner (or both participants) confirms completion, validating that the 1 hour of knowledge was transferred and triggering credit release (integrating into Phase 6 Time Ledger).

---

## 2. Technical Specifications & Architecture

### 2.1 Availability Management (`Availability` Model)
- **Recurring Weekly Model:** Days of week represented as integers `0` (Sunday) to `6` (Saturday).
- **Time String Format:** 24-hour military format `HH:mm` (e.g., `'09:00'`, `'17:30'`).
- **Validation Constraints:**
  - `startTime` must strictly precede `endTime`.
  - Same user cannot have overlapping availability intervals on the same day.
  - Duration range: 15 to 240 minutes (default 60).
  - Mode: `ONLINE`, `IN_PERSON`, `HYBRID`.

### 2.2 Session Lifecycle & Booking Constraints (`Session` Model)
- **Credit Valuation Rule:** 
  $$\text{creditValue} = \frac{\text{durationInMinutes}}{60}$$
  - 30 minutes $\rightarrow 0.5$ Credits
  - 60 minutes $\rightarrow 1.0$ Credit
  - 90 minutes $\rightarrow 1.5$ Credits
  - 120 minutes $\rightarrow 2.0$ Credits
- **Learner Solvency Guard:**
  - Learner must hold `creditsBalance >= session.creditValue`, unless it is marked as a reciprocal barter swap.
- **Double-Booking & Conflict Detection:**
  - No active session (`['REQUESTED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS']`) can exist for either the provider or the learner on the same date where:
    $$\max(\text{start}_1, \text{start}_2) < \min(\text{end}_1, \text{end}_2)$$
- **Role Permissions:**
  - Only the `learnerId` can book a session with a `providerId`.
  - A user cannot book a session with themselves.
  - Only the `providerId` can `ACCEPT` or `REJECT` a `REQUESTED` session.
  - Both parties can `CANCEL` an upcoming session prior to completion.
  - Both parties can submit `confirm` completion.

---

## 3. API Surface

### 3.1 Availability Routes (`/api/availability`)
- `GET /api/availability/my`: Return authenticated user's weekly availability slots.
- `PUT /api/availability/my`: Bulk replace weekly availability slots with validation.
- `GET /api/availability/user/:userId`: Return active public availability slots for a target user (to render booking calendar).
- `POST /api/availability`: Create a single slot.
- `DELETE /api/availability/:id`: Delete a single slot.

### 3.2 Session Routes (`/api/sessions`)
- `POST /api/sessions`: Create a new session request with conflict detection & credit check.
- `GET /api/sessions`: List user's sessions (filtering by `status`: `UPCOMING`, `REQUESTED`, `COMPLETED`, `CANCELLED`; and `role`: `all`, `asLearner`, `asProvider`).
- `GET /api/sessions/:id`: Get detailed session with populated provider, learner, and skill info.
- `PUT /api/sessions/:id/status`: Provider accepts/rejects, or either party cancels.
- `POST /api/sessions/:id/confirm`: Record learner or provider confirmation. Updates to `COMPLETED` when criteria met.

---

## 4. Frontend User Experience
1. **Weekly Availability Scheduler Component:**
   - 7-day visual interactive grid where users toggle availability windows, set learning modes, and manage time intervals.
2. **Interactive Booking Modal & View (`/book/:offerId` or modal):**
   - Date picker, available slot chips derived from provider's weekly schedule, duration selector with real-time credit cost calculation, notes, and meeting link.
3. **Session Management Dashboard (`/sessions`):**
   - Categorized tabs: "Upcoming", "Pending Action", "Completed History", "Cancelled".
   - Status badges with clear color schemes.
   - One-click actions: "Accept", "Decline", "Join Meeting", "Mark Completed".
4. **Navbar Integration:**
   - "Sessions" navigation link with dynamic counter for pending requests.
