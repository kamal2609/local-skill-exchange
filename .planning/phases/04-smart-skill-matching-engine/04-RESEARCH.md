# Phase 4: Smart Skill Matching Engine ⭐ — Research & Technical Specification

## 1. Problem Statement & College Differentiating Feature
In typical skill platforms, users must manually search through listings without knowing if the other person is available, nearby, speaks the same language, or happens to need the skills they teach.

The **Smart Skill Matching Engine ⭐** is the core differentiating feature of Local Skill Exchange. It calculates a multi-factor mathematical compatibility score between users and detects **Reciprocal Exchanges** (bilateral barters where User A teaches what User B wants, and User B teaches what User A wants), allowing both parties to trade knowledge without any net currency change.

---

## 2. Mathematical Compatibility Formula (100% Total)

The overall compatibility score $S \in [0, 100]$ is computed as the weighted sum of 6 distinct criteria:

$$S = S_{\text{skill}} + S_{\text{reciprocal}} + S_{\text{availability}} + S_{\text{experience}} + S_{\text{location}} + S_{\text{language}}$$

### 2.1 Skill Compatibility ($S_{\text{skill}}$, Max: 40 Points)
- **Direct Skill Match:** Does User B offer a skill that User A has listed in `skillsWanted` or in an open `LearningRequest`?
- **Formula:**
  - If User B has an active `SkillOffer` matching one of User A's requested skills: **40 points**.
  - If partial match via category or tags: **20 points**.
  - Otherwise: **0 points**.

### 2.2 Reciprocal Exchange Bonus ($S_{\text{reciprocal}}$, Max: 25 Points)
- **Bilateral Barter:** Does User A also offer a skill that User B wants?
- **Formula:**
  - $\text{User A offers } X \land \text{User B wants } X \quad \text{AND} \quad \text{User B offers } Y \land \text{User A wants } Y$: **25 points**.
  - One-way match only (A wants B's skill, but B does not need A's skills): **0 points**.

### 2.3 Schedule & Availability Overlap ($S_{\text{availability}}$, Max: 15 Points)
- Evaluates overlapping weekly availability slots (`Availability` collection) for days of week ($0-6$) and matching format (`ONLINE`, `IN_PERSON`, `HYBRID`).
- **Formula:**
  - 3+ overlapping days/time windows: **15 points**.
  - 1-2 overlapping days: **10 points**.
  - Flexible schedules or general mode compatibility: **5 points**.
  - Complete schedule clash: **0 points**.

### 2.4 Experience Level Compatibility ($S_{\text{experience}}$, Max: 10 Points)
- Evaluates the provider's `experienceLevel` against the learner's `preferredDifficulty`.
- **Formula:**
  - Ideal pairing (e.g., `EXPERT` or `ADVANCED` teaching `BEGINNER` or `INTERMEDIATE`): **10 points**.
  - Equal levels: **7 points**.
  - Slight mismatch (e.g. `BEGINNER` trying to teach `ADVANCED`): **2 points**.

### 2.5 Location & Neighborhood Proximity ($S_{\text{location}}$, Max: 5 Points)
- **Formula:**
  - Both users in the exact same neighborhood: **5 points**.
  - Both users in the same city: **3 points**.
  - Different cities, but learning mode is `ONLINE`: **4 points**.
  - In-person required but different cities: **0 points**.

### 2.6 Language Compatibility ($S_{\text{language}}$, Max: 5 Points)
- Evaluates intersection of spoken languages (`user.languages`).
- **Formula:**
  - Share 1 or more common languages: **5 points**.
  - No common languages: **0 points**.

---

## 3. Explainable Rationale Generation (REQ-MATCH-03)
The engine does not output black-box numbers. For every recommendation, it constructs human-readable explanations:
- `"Direct Match: Elena offers Web Development, which matches your learning goal."`
- `"⭐ Reciprocal Exchange: Elena is eager to learn Spanish, which you offer to teach!"`
- `"Schedule Aligned: Both available on Tuesday and Thursday evenings."`
- `"Nearby: Both located in Downtown Neighborhood."`
- `"Language: Both speak English."`

---

## 4. API Endpoints
- `GET /api/matches`: Returns all ranked compatible partners for the logged-in user with total score, component breakdown, and explanations.
- `GET /api/matches/reciprocal`: Returns only reciprocal matches ($S_{\text{reciprocal}} > 0$).
- `GET /api/matches/:partnerId`: Detailed pairwise compatibility breakdown between the logged-in user and any specific user.
