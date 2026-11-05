# Database Schemas & Models (MongoDB / Mongoose)

The Local Skill Exchange data tier is powered by MongoDB Atlas and structured using 12 Mongoose schemas in `backend/src/models/`.

---

## 1. Entity-Relationship Overview

```
                      ┌──────────────┐
                      │     User     │◄─────────────────┐
                      └──────┬───────┘                  │
                             │                          │
       ┌─────────────┬───────┼─────────────┬────────────┼─────────────┐
       │             │       │             │            │             │
       ▼             ▼       ▼             ▼            ▼             ▼
┌────────────┐ ┌──────────┐ ┌────────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐
│ SkillOffer │ │ Learning │ │Availability│ │ Review  │ │  Report  │ │ Notif.  │
│            │ │ Request  │ │            │ │         │ │          │ │         │
└─────┬──────┘ └────┬─────┘ └────────────┘ └────┬────┘ └──────────┘ └─────────┘
      │             │                           │
      └──────┬──────┘                           │
             ▼                                  ▼
      ┌─────────────┐                    ┌─────────────┐
      │   Session   │◄───────────────────┤CreditTrans. │
      └──────┬──────┘                    └─────────────┘
             │
             ▼
     ┌──────────────┐       ┌─────────────┐
     │ Conversation │◄─────►│   Message   │
     └──────────────┘       └─────────────┘
```

---

## 2. The 12 Mongoose Schemas

### 2.1 `User` (`models/User.js`)
Stores member profiles, authentication credentials, credit balances, and reputation metrics.
- `name` (String, required): Full member name.
- `username` (String, required, unique, index): Unique handle.
- `email` (String, required, unique, index): Email for auth and communication.
- `passwordHash` (String, required): Bcrypt-hashed password.
- `role` (String, enum: `LEARNER`, `PROVIDER`, `ADMIN`, default: `LEARNER`): Authorization tier.
- `creditsBalance` (Number, default: 3.0, min: 0): Time credits available.
- `averageRating` (Number, default: 5.0, min: 1, max: 5): Weighted review score.
- `totalReviews` (Number, default: 0): Total peer reviews received.
- `completedSessions` (Number, default: 0): Count of completed exchanges.
- `isActive` (Boolean, default: true): Account status (for admin suspension).
- `location`: `{ neighborhood: String, city: String, coordinates: [Number] }`.

### 2.2 `Skill` (`models/Skill.js`)
Standardized skill taxonomy dictionary.
- `name` (String, required, unique, index): Skill name (e.g. "Python Programming").
- `category` (String, required, enum: `Technology`, `Design`, `Academic`, `Creative`, `Lifestyle`, `Other`): Domain category.
- `description` (String, required): Detailed overview.
- `difficulty` (String, enum: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `ALL_LEVELS`): Skill level.
- `tags` ([String]): Search keywords.
- `popularity` (Number, default: 0): Usage counter.

### 2.3 `SkillOffer` (`models/SkillOffer.js`)
Published teaching offers by skill providers.
- `providerId` (ObjectId → `User`, required, index): The teaching member.
- `skillId` (ObjectId → `Skill`, required, index): The offered skill.
- `description` (String, required): Personalized teaching syllabus.
- `experienceLevel` (String, enum: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `EXPERT`).
- `teachingLanguage` (String, default: "English").
- `learningMode` (String, enum: `ONLINE`, `IN_PERSON`, `HYBRID`).
- `sessionDuration` (Number, default: 60): Default minutes.
- `status` (String, enum: `ACTIVE`, `PAUSED`, `ARCHIVED`, default: `ACTIVE`).

### 2.4 `LearningRequest` (`models/LearningRequest.js`)
Published learning requests by members seeking knowledge.
- `learnerId` (ObjectId → `User`, required, index): The learning member.
- `skillId` (ObjectId → `Skill`, required, index): The wanted skill.
- `title` (String, required): Short summary.
- `description` (String, required): Learning objectives.
- `preferredDifficulty` (String, enum: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `ALL_LEVELS`).
- `preferredMode` (String, enum: `ONLINE`, `IN_PERSON`, `HYBRID`).
- `status` (String, enum: `OPEN`, `MATCHED`, `ACCEPTED`, `COMPLETED`, `CANCELLED`).

### 2.5 `Availability` (`models/Availability.js`)
Recurring weekly availability slots for automated booking.
- `userId` (ObjectId → `User`, required, index): Provider ID.
- `dayOfWeek` (Number, min: 0, max: 6): 0 = Sunday, 6 = Saturday.
- `startTime` (String, required, regex: `HH:mm`): e.g. "14:00".
- `endTime` (String, required, regex: `HH:mm`): e.g. "16:00".
- `isActive` (Boolean, default: true).

### 2.6 `Session` (`models/Session.js`)
Booked skill exchange sessions with lifecycle state machine.
- `learnerId` (ObjectId → `User`, required, index): Learning attendee.
- `providerId` (ObjectId → `User`, required, index): Teaching mentor.
- `skillId` (ObjectId → `Skill`, required): Skill exchanged.
- `bookingDate` (Date, required): Calendar date of session.
- `startTime` (String, required, regex: `HH:mm`).
- `endTime` (String, required, regex: `HH:mm`).
- `duration` (Number, required, default: 60): Minutes.
- `creditValue` (Number, required, default: 1.0): Credits exchanged ($\text{duration} / 60$).
- `isReciprocal` (Boolean, default: false): True if mutual zero-credit barter.
- `status` (String, enum: `REQUESTED`, `ACCEPTED`, `REJECTED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, default: `REQUESTED`).
- `learnerConfirmed` (Boolean, default: false): Completion sign-off.
- `providerConfirmed` (Boolean, default: false): Completion sign-off.

### 2.7 `CreditTransaction` (`models/CreditTransaction.js`)
Immutable double-entry audit ledger.
- `senderId` (ObjectId → `User`, nullable): Account debited (null for bonuses).
- `receiverId` (ObjectId → `User`, nullable): Account credited.
- `sessionId` (ObjectId → `Session`, optional): Linked session.
- `amount` (Number, required, min: 0): Transferred credit amount.
- `type` (String, enum: `SESSION_EARN`, `SESSION_SPEND`, `SESSION_REFUND`, `WELCOME_BONUS`, `ADMIN_ADJUSTMENT`).
- `description` (String, required): Human-readable ledger note.

### 2.8 `Review` (`models/Review.js`)
Post-session peer evaluations.
- `sessionId` (ObjectId → `Session`, required, unique): 1 review per session.
- `reviewerId` (ObjectId → `User`, required, index): Reviewer.
- `reviewedUserId` (ObjectId → `User`, required, index): Reviewee.
- `rating` (Number, required, min: 1, max: 5): Gold star rating.
- `comment` (String, maxlength: 1000): Written feedback.
- `isModerated` (Boolean, default: false).

### 2.9 `Conversation` (`models/Conversation.js`)
1-on-1 direct messaging threads.
- `participants` ([ObjectId → `User`], length: 2): Thread members.
- `lastMessage`: `{ text: String, senderId: ObjectId, createdAt: Date }`.
- `unreadCounts` (Map of String → Number): Unread counter per member.

### 2.10 `Message` (`models/Message.js`)
Individual messages in a conversation.
- `conversationId` (ObjectId → `Conversation`, required, index).
- `senderId` (ObjectId → `User`, required).
- `text` (String, required, maxlength: 2000).
- `isRead` (Boolean, default: false).

### 2.11 `Notification` (`models/Notification.js`)
In-app alerts for system events.
- `userId` (ObjectId → `User`, required, index): Recipient.
- `type` (String, enum: `MATCH_FOUND`, `SESSION_REQUEST`, `SESSION_ACCEPTED`, `SESSION_COMPLETED`, `MESSAGE`, `CREDIT_RECEIVED`, `REVIEW_RECEIVED`).
- `title` (String, required).
- `message` (String, required).
- `isRead` (Boolean, default: false).

### 2.12 `Report` (`models/Report.js`)
Community trust & safety reports.
- `reporterId` (ObjectId → `User`, required).
- `reportedUserId` (ObjectId → `User`, required, index).
- `reason` (String, enum: `INAPPROPRIATE_BEHAVIOR`, `SPAM`, `HARASSMENT`, `FAKE_PROFILE`, `NO_SHOW`, `OTHER`).
- `description` (String, required, maxlength: 1000).
- `status` (String, enum: `PENDING`, `REVIEWED`, `RESOLVED`, `DISMISSED`, default: `PENDING`).
- `adminNotes` (String, optional).

