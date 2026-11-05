# Phase 7: Communication & Community — Research & Technical Specification

## 1. Problem Statement & Scope
Effective peer learning relies on trust, seamless communication, and accountability:
1. **Direct In-App Messaging:** Neighbors need to discuss session agendas, exchange preparation materials, coordinate locations, or troubleshoot technical setups without exchanging personal contact details.
2. **Notification Center:** Real-time awareness of booking requests, confirmations, incoming messages, and credit earnings.
3. **Peer Reviews & Reputation:** Transparent 5-star rating system with written feedback that updates provider reputation in the public directory and matching engine.
4. **Trust & Safety Reporting:** A confidential mechanism to report misbehavior, harassment, or no-shows for administrative review.

---

## 2. Technical Architecture & Schemas

### 2.1 Conversations & Messages (`Conversation`, `Message`)
- **1-on-1 Conversation Invariant:** Each unique pair of users $(A, B)$ has at most one active `Conversation` document (`participants: [A, B]`).
- **Message Indexing:** `{ conversationId: 1, createdAt: 1 }` for rapid chronological message history retrieval.
- **Unread Tracking:** Unread counters tracked per participant.

### 2.2 Notification System (`Notification`)
- **Event Types:**
  - `MATCH_FOUND`: New reciprocal or high-compatibility partner detected.
  - `SESSION_REQUEST`: A learner requested a booking.
  - `SESSION_ACCEPTED`: Provider accepted the session.
  - `SESSION_COMPLETED`: Session confirmed and credits transferred.
  - `MESSAGE`: New message received.
  - `CREDIT_RECEIVED`: Credits received from a completed session or bonus.
  - `REVIEW_RECEIVED`: New rating received.

### 2.3 Peer Reviews & Rating Formula (`Review`)
- **Post-Session Trigger:** Only participants of `Session.status === 'COMPLETED'` can leave a review.
- **Unique Constraint:** Only one review per session (`sessionId` is unique).
- **Reputation Aggregate Update:**
  $$\text{averageRating} = \frac{\sum_{i=1}^N \text{rating}_i}{N}$$
  Computed and updated atomically on the target user's `User` profile.

### 2.4 Safety & Moderation (`Report`)
- **Confidential Flagging:** Any user can report another member with a categorized reason (`INAPPROPRIATE_BEHAVIOR`, `NO_SHOW`, `HARASSMENT`, `OTHER`).
- **Status Lifecycle:** `PENDING` $\rightarrow$ `REVIEWED` $\rightarrow$ `RESOLVED` / `DISMISSED`.

---

## 3. API Surface

- **Conversations & Messages:**
  - `GET /api/conversations`: User's conversation threads.
  - `POST /api/conversations`: Get or create conversation with partner.
  - `GET /api/conversations/:id/messages`: Message history.
  - `POST /api/conversations/:id/messages`: Send message.
- **Notifications:**
  - `GET /api/notifications`: List notifications & unread count.
  - `PUT /api/notifications/:id/read`: Mark single notification read.
  - `PUT /api/notifications/read-all`: Mark all read.
- **Reviews:**
  - `POST /api/reviews`: Submit review and recalculate provider average rating.
  - `GET /api/reviews/user/:userId`: Public reviews for a user.
- **Reports:**
  - `POST /api/reports`: Submit trust & safety moderation report.
  - `GET /api/reports`: Admin-only view to inspect reported incidents.

---

## 4. Frontend User Experience
- `/messages`: Dedicated responsive split-pane messenger with active chat history and message composer.
- `NotificationBell`: In-header notification drawer displaying recent alerts with unread count.
- `ReviewModal`: Interactive 5-star rating modal with written feedback textarea.
- `ReportModal`: Discreet safety modal to flag misconduct.

