# REST API Reference Manual

The Local Skill Exchange REST API is accessible under the `/api` prefix. All protected endpoints require a valid JWT passed via standard HTTP Bearer token:
`Authorization: Bearer <token>`

---

## 1. System Health & Platform Discovery

### `GET /api`
Root discovery endpoint listing all mounted route modules.
- **Access:** Public
- **Response:** `200 OK`
```json
{
  "message": "Welcome to the Local Skill Exchange REST API (MERN Stack)",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### `GET /api/health`
Monitors database connectivity, server uptime, and memory usage.
- **Access:** Public
- **Response:** `200 OK`

---

## 2. Authentication & Authorization (`/api/auth`)

### `POST /api/auth/register`
Creates an account and credits 3.0 starter time credits.
- **Payload:** `{ name, username, email, password, role?, bio?, city?, preferredLearningMode? }`
- **Response:** `201 Created` with JWT token and user profile.

### `POST /api/auth/login`
Authenticates with email or username.
- **Payload:** `{ identifier, password }`
- **Response:** `200 OK` with JWT token and profile data.

### `POST /api/auth/forgot-password` & `POST /api/auth/reset-password`
Generates recovery token and resets password.

---

## 3. Users & Profiles (`/api/users`)

### `GET /api/users/profile`
Fetches the currently authenticated user's private profile.
- **Access:** Protected (`LEARNER`, `PROVIDER`, `ADMIN`)

### `PUT /api/users/profile`
Updates profile details, bio, location, and learning preferences.
- **Access:** Protected

### `GET /api/users` & `GET /api/users/:id`
Public member directory and public profile with ratings and reviews.
- **Access:** Public

---

## 4. Skills Taxonomy (`/api/skills`)

### `GET /api/skills`
Returns the standardized skill taxonomy with category and popularity filters.

### `GET /api/skills/:id`
Fetches individual skill details with associated offers and requests count.

---

## 5. Skill Offers (`/api/offers`)

### `GET /api/offers`
Searchable and filterable skill offers (`category`, `difficulty`, `learningMode`, `search`).

### `POST /api/offers`
Publishes a skill offer.
- **Access:** Protected (`PROVIDER`)
- **Payload:** `{ skillId, description, experienceLevel?, teachingLanguage?, learningMode?, sessionDuration? }`

### `GET /api/offers/:id` & `PUT /api/offers/:id`
Retrieves or updates an offer's details and active/paused status.

---

## 6. Learning Requests (`/api/requests`)

### `GET /api/requests`
Searchable directory of community learning requests.

### `POST /api/requests`
Publishes a learning request.
- **Access:** Protected (`LEARNER`)
- **Payload:** `{ skillId, title, description, preferredDifficulty?, preferredMode?, preferredDuration? }`

---

## 7. Smart Skill Matching Engine ⭐ (`/api/matches`)

### `GET /api/matches`
Computes and returns pairwise compatibility matches for the calling user, ranked by score descending.
- **Access:** Protected
- **Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "score": 92,
      "isReciprocal": true,
      "breakdown": {
        "skill": 40,
        "reciprocal": 25,
        "category": 20,
        "language": 5,
        "distance": 2
      },
      "explanations": [
        "Direct match: Elena teaches Python Programming",
        "Mutual barter swap: Elena wants to learn Conversational Spanish!",
        "Shared conversational language: English"
      ],
      "partner": { ... }
    }
  ]
}
```

### `GET /api/matches/reciprocal`
Filters matches returning exclusively reciprocal barter pairs (`isReciprocal: true`).

### `GET /api/matches/:partnerId`
Returns pairwise compatibility breakdown between the calling user and a specific member.

---

## 8. Availability Scheduler (`/api/availability`)

### `GET /api/availability/my` & `PUT /api/availability/my`
Manages the provider's recurring weekly available slots.

### `GET /api/availability/user/:userId`
Public endpoint returning a member's active available booking slots.

---

## 9. Sessions & Bookings (`/api/sessions`)

### `POST /api/sessions`
Books a session with a provider. Blocks self-booking.
- **Payload:** `{ providerId, skillId, bookingDate, startTime, endTime, duration, notes?, isReciprocal? }`
- **Response:** `201 Created`

### `GET /api/sessions`
Returns calling user's sessions (both as learner and provider) filterable by `status`.

### `PUT /api/sessions/:id/status`
Accepts, rejects, or cancels a session request.

### `POST /api/sessions/:id/confirm`
Records mutual completion confirmation. When both parties confirm, triggers atomic credit transfer.

---

## 10. Time-Banking Credit Ledger (`/api/credits`)

### `GET /api/credits/balance`
Returns balance, lifetime earned, lifetime spent, and transaction count.

### `GET /api/credits/ledger`
Paginated audit ledger filterable by `type` (`ALL`, `EARNED`, `SPENT`, `BONUS`).

### `POST /api/credits/admin-adjust`
Audited credit adjustment.
- **Access:** Admin only (`authorize('ADMIN')`)
- **Payload:** `{ userId, amount, reason }`

---

## 11. Communication & Direct Messaging (`/api/conversations`)

### `GET /api/conversations`
Retrieves 1-on-1 threads with participant profiles, unread counts, and last message previews.

### `POST /api/conversations`
Initializes or fetches conversation with `recipientId`.

### `GET /api/conversations/:id/messages`
Retrieves message history and auto-marks messages as read.

### `POST /api/conversations/:id/messages`
Sends a message and creates recipient notification.
- **Payload:** `{ text }`

---

## 12. Notifications (`/api/notifications`)

### `GET /api/notifications`
Returns in-app notifications with total `unreadCount`.

### `PUT /api/notifications/:id/read` & `PUT /api/notifications/read-all`
Marks single or all notifications as read.

---

## 13. Peer Reviews & Ratings (`/api/reviews`)

### `POST /api/reviews`
Submits post-session feedback (1–5 gold stars, comment). Prevents self-reviews.

### `GET /api/reviews/user/:userId`
Public endpoint returning a member's review history.

---

## 14. Trust & Safety Reports (`/api/reports`)

### `POST /api/reports`
Submits confidential misconduct report (`reportedUserId`, `reason`, `description`).

### `GET /api/reports` & `PUT /api/reports/:id/status`
Admin desk for report review and status resolution.

---

## 15. Administrator Command Center (`/api/admin`)

- `GET /api/admin/metrics`: Platform KPIs (users, skills, sessions, credits, reports).
- `GET /api/admin/users`: Searchable, filterable member directory.
- `PUT /api/admin/users/:id/status`: Account activation/suspension toggle.
- `PUT /api/admin/users/:id/role`: Role assignment (`LEARNER`, `PROVIDER`, `ADMIN`).
- `GET /api/admin/reports`: Filtered list of safety reports.
- `PUT /api/admin/reports/:id`: Resolves/dismisses reports with admin audit notes.
- `POST /api/admin/categories`: Registers new skill taxonomy item.
