# System Architecture & Database Design (12 Mongoose Models)

## 1. Mongoose Database Models

### 1.1 `User` (`backend/src/models/User.js`)
- `name`: String, required, trim
- `username`: String, required, unique, lowercase, trim
- `email`: String, required, unique, lowercase, trim
- `passwordHash`: String, required
- `profilePicture`: String, default: null
- `bio`: String, default: ''
- `city`: String, default: 'Local Community'
- `preferredLearningMode`: String, enum: `['ONLINE', 'IN_PERSON', 'HYBRID']`, default: 'ONLINE'
- `languages`: [String], default: ['English']
- `skillsOffered`: [{ type: ObjectId, ref: 'Skill' }]
- `skillsWanted`: [{ type: ObjectId, ref: 'Skill' }]
- `role`: String, enum: `['LEARNER', 'PROVIDER', 'ADMIN']`, default: 'LEARNER'
- `creditsBalance`: Number, default: 3.0 (starter credits)
- `completedSessions`: Number, default: 0
- `averageRating`: Number, default: 5.0
- `isVerified`: Boolean, default: false
- `isActive`: Boolean, default: true
- `passwordResetToken`: String, default: null
- `passwordResetExpires`: Date, default: null
- Timestamps

### 1.2 `Skill` (`backend/src/models/Skill.js`)
- `name`: String, required, unique, trim
- `category`: String, enum: `['Technology', 'Design', 'Academic', 'Creative', 'Lifestyle', 'Other']`, required, index: true
- `description`: String, required
- `difficulty`: String, enum: `['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']`, default: 'ALL_LEVELS'
- `tags`: [String], default: []
- `icon`: String, default: 'BookOpen'
- `popularity`: Number, default: 0
- `createdBy`: { type: ObjectId, ref: 'User', default: null }
- Timestamps

### 1.3 `SkillOffer` (`backend/src/models/SkillOffer.js`)
- `providerId`: { type: ObjectId, ref: 'User', required: true, index: true }
- `skillId`: { type: ObjectId, ref: 'Skill', required: true, index: true }
- `description`: String, required
- `experienceLevel`: String, enum: `['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']`, default: 'INTERMEDIATE'
- `teachingLanguage`: String, default: 'English'
- `learningMode`: String, enum: `['ONLINE', 'IN_PERSON', 'HYBRID']`, default: 'ONLINE'
- `sessionDuration`: Number, default: 60 (minutes)
- `neighborhood`: String, default: ''
- `teachingApproach`: String, default: ''
- `status`: String, enum: `['ACTIVE', 'PAUSED', 'ARCHIVED']`, default: 'ACTIVE', index: true
- Timestamps

### 1.4 `LearningRequest` (`backend/src/models/LearningRequest.js`)
- `learnerId`: { type: ObjectId, ref: 'User', required: true, index: true }
- `skillId`: { type: ObjectId, ref: 'Skill', required: true, index: true }
- `title`: String, required, trim
- `description`: String, required
- `learningObjectives`: String, default: ''
- `preferredDifficulty`: String, enum: `['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']`, default: 'ALL_LEVELS'
- `preferredDuration`: Number, default: 60 (minutes)
- `preferredMode`: String, enum: `['ONLINE', 'IN_PERSON', 'HYBRID']`, default: 'ONLINE'
- `preferredSchedule`: String, default: 'Flexible'
- `neighborhood`: String, default: ''
- `status`: String, enum: `['OPEN', 'MATCHED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED']`, default: 'OPEN', index: true
- Timestamps

### 1.5 `Availability` (`backend/src/models/Availability.js`)
- `userId`: { type: ObjectId, ref: 'User', required: true, index: true }
- `dayOfWeek`: Number, min: 0, max: 6, required: true (0 = Sunday, 6 = Saturday)
- `startTime`: String, required (e.g. "09:00")
- `endTime`: String, required (e.g. "17:00")
- `preferredDuration`: Number, default: 60
- `learningMode`: String, enum: `['ONLINE', 'IN_PERSON', 'HYBRID']`, default: 'ONLINE'
- `timezone`: String, default: 'UTC'
- `isActive`: Boolean, default: true
- Timestamps

### 1.6 `Session` (`backend/src/models/Session.js`)
- `learnerId`: { type: ObjectId, ref: 'User', required: true, index: true }
- `providerId`: { type: ObjectId, ref: 'User', required: true, index: true }
- `skillId`: { type: ObjectId, ref: 'Skill', required: true, index: true }
- `learningRequestId`: { type: ObjectId, ref: 'LearningRequest', default: null }
- `skillOfferId`: { type: ObjectId, ref: 'SkillOffer', default: null }
- `bookingDate`: Date, required
- `startTime`: String, required (e.g. "14:00")
- `endTime`: String, required (e.g. "15:00")
- `duration`: Number, default: 60 (minutes)
- `creditValue`: Number, default: 1.0 (1 hour = 1 credit)
- `status`: String, enum: `['REQUESTED', 'ACCEPTED', 'REJECTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']`, default: 'REQUESTED', index: true
- `learnerConfirmed`: Boolean, default: false
- `providerConfirmed`: Boolean, default: false
- `notes`: String, default: ''
- `meetingLink`: String, default: ''
- Timestamps

### 1.7 `CreditTransaction` (`backend/src/models/CreditTransaction.js`)
- `senderId`: { type: ObjectId, ref: 'User', default: null } (null for system welcome bonus)
- `receiverId`: { type: ObjectId, ref: 'User', required: true, index: true }
- `amount`: Number, required: true
- `type`: String, enum: `['SESSION_EARN', 'SESSION_SPEND', 'SESSION_REFUND', 'WELCOME_BONUS', 'ADMIN_ADJUSTMENT']`, required: true
- `sessionId`: { type: ObjectId, ref: 'Session', default: null }
- `description`: String, default: ''
- Timestamps (immutable audit log)

### 1.8 `Review` (`backend/src/models/Review.js`)
- `sessionId`: { type: ObjectId, ref: 'Session', required: true, unique: true }
- `reviewerId`: { type: ObjectId, ref: 'User', required: true, index: true }
- `reviewedUserId`: { type: ObjectId, ref: 'User', required: true, index: true }
- `rating`: Number, min: 1, max: 5, required: true
- `comment`: String, trim: true, default: ''
- `isModerated`: Boolean, default: false
- Timestamps

### 1.9 `Conversation` (`backend/src/models/Conversation.js`)
- `participants`: [{ type: ObjectId, ref: 'User', required: true }]
- `lastMessage`: {
    text: String,
    senderId: { type: ObjectId, ref: 'User' },
    createdAt: Date
  }
- `unreadCounts`: { type: Map, of: Number, default: {} }
- Timestamps

### 1.10 `Message` (`backend/src/models/Message.js`)
- `conversationId`: { type: ObjectId, ref: 'Conversation', required: true, index: true }
- `senderId`: { type: ObjectId, ref: 'User', required: true, index: true }
- `text`: String, required: true, trim: true
- `isRead`: Boolean, default: false
- Timestamps

### 1.11 `Notification` (`backend/src/models/Notification.js`)
- `userId`: { type: ObjectId, ref: 'User', required: true, index: true }
- `type`: String, enum: `['MATCH_FOUND', 'SESSION_REQUEST', 'SESSION_ACCEPTED', 'SESSION_COMPLETED', 'MESSAGE', 'CREDIT_RECEIVED', 'REVIEW_RECEIVED']`, required: true
- `title`: String, required: true
- `message`: String, required: true
- `relatedId`: { type: ObjectId, default: null }
- `relatedModel`: String, default: null
- `isRead`: Boolean, default: false
- Timestamps

### 1.12 `Report` (`backend/src/models/Report.js`)
- `reporterId`: { type: ObjectId, ref: 'User', required: true, index: true }
- `reportedUserId`: { type: ObjectId, ref: 'User', required: true, index: true }
- `reason`: String, required: true
- `description`: String, default: ''
- `status`: String, enum: `['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED']`, default: 'PENDING', index: true
- `adminNotes`: String, default: ''
- Timestamps

---

## 2. Smart Skill Matching Engine Algorithm

$$\text{Total Match Score} = \sum (\text{Component Score} \times \text{Weight})$$

| Component | Weight | Calculation Method |
|---|:---:|---|
| **Skill Compatibility** | **40%** | Exact matches between User A wanted skills and User B offered skills. |
| **Reciprocal Compatibility** | **25%** | **100%** if User B also offers what User A wants AND User A offers what User B wants; **0%** if one-way only. |
| **Availability Compatibility** | **15%** | Jaccard overlap of shared active weekly day-time availability slots. |
| **Experience Compatibility** | **10%** | Proximity of provider experience level to learner's requested difficulty. |
| **Location Compatibility** | **5%** | Same city/neighborhood score or both accepting `ONLINE` format. |
| **Language Compatibility** | **5%** | Shared spoken languages in user profiles. |

---

## 3. Atomic Credit Ledger & Double-Spending Prevention

```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  // 1. Verify learner balance
  const learner = await User.findById(learnerId).session(session);
  if (learner.creditsBalance < creditAmount) {
    throw new Error('Insufficient credit balance');
  }

  // 2. Debit learner
  await User.findByIdAndUpdate(learnerId, { $inc: { creditsBalance: -creditAmount } }, { session });
  await CreditTransaction.create([{
    senderId: learnerId,
    receiverId: providerId,
    amount: creditAmount,
    type: 'SESSION_SPEND',
    sessionId: sessionDoc._id,
    description: `Completed session: ${skillName}`
  }], { session });

  // 3. Credit provider
  await User.findByIdAndUpdate(providerId, { $inc: { creditsBalance: creditAmount } }, { session });
  await CreditTransaction.create([{
    senderId: learnerId,
    receiverId: providerId,
    amount: creditAmount,
    type: 'SESSION_EARN',
    sessionId: sessionDoc._id,
    description: `Earned teaching: ${skillName}`
  }], { session });

  // 4. Update session status
  sessionDoc.status = 'COMPLETED';
  await sessionDoc.save({ session });

  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}
```
*(Fallback for standalone local MongoDB instances without replica sets uses optimistic concurrency checks to guarantee atomic consistency during development).*
