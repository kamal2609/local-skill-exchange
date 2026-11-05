# Phase 6: Time-Banking Credit System & Ledger — Research & Technical Specification

## 1. Context & Academic Rationale
The **Time-Banking Model** is the foundational economic principle of the Local Skill Exchange:
- **Core Rule:** **1 Hour of Service = 1 Time Credit**, regardless of the skill taught (e.g., 1 hour of Violin equals 1 hour of Python Programming).
- **Academic Relevance:** Unlike monetary systems with fluctuating prices and inflationary pressure, a Time Bank guarantees parity and equality: everyone's hour of time is valued equally.
- **Atomic Double-Entry Bookkeeping:** When a session concludes, the learner pays $C = \text{duration} / 60$ credits to the provider. The platform must guarantee that credits cannot be duplicated, lost, or made negative.

---

## 2. Mathematical Invariants & State Transitions

### 2.1 Credit Valuation
$$\text{creditValue} = \frac{\text{durationInMinutes}}{60}$$
- 15 minutes = 0.25 Credits
- 30 minutes = 0.50 Credits
- 60 minutes = 1.00 Credit
- 90 minutes = 1.50 Credits
- 120 minutes = 2.00 Credits

### 2.2 Balance Conservation
For any non-reciprocal session transfer between Learner $L$ and Provider $P$:
$$\Delta \text{Balance}_L = -C, \quad \Delta \text{Balance}_P = +C$$
$$\sum \text{Balances}_{\text{platform}} = \text{Constant (except for Welcome Bonuses \& Admin Adjustments)}$$

For Reciprocal Swaps (bilateral barter):
$$\Delta \text{Balance}_L = 0, \quad \Delta \text{Balance}_P = 0$$

### 2.3 Solvency Invariant
$$\forall u \in \text{Users}, \quad \text{Balance}_u \ge 0$$
No operation can cause a user's balance to drop below 0.

---

## 3. Atomic Multi-Document Transactions

To guarantee atomic transfer even during network blips or concurrent actions:
1. When supported (MongoDB replica sets / Atlas clusters):
   ```javascript
   const mongoSession = await mongoose.startSession();
   await mongoSession.withTransaction(async () => {
     // Decrement learner balance with solvency check
     const learner = await User.findOneAndUpdate(
       { _id: learnerId, creditsBalance: { $gte: creditValue } },
       { $inc: { creditsBalance: -creditValue } },
       { session: mongoSession, new: true }
     );
     if (!learner) throw new Error('Insufficient credit balance');

     // Increment provider balance
     await User.findByIdAndUpdate(
       providerId,
       { $inc: { creditsBalance: creditValue } },
       { session: mongoSession }
     );

     // Create immutable credit transaction record
     await CreditTransaction.create([{
       senderId: learnerId,
       receiverId: providerId,
       amount: creditValue,
       type: 'SESSION_EARN',
       sessionId: session._id,
       description: `1-on-1 session: ${skill.name}`,
     }], { session: mongoSession });
   });
   ```
2. In single-instance standalone or test modes without replica sets, use atomic conditional updates (`findOneAndUpdate({ creditsBalance: { $gte: creditValue } })`) with clean fallbacks.

---

## 4. API Surface (`/api/credits`)

- `GET /api/credits/balance`: Current balance, lifetime earned, lifetime spent, and transaction statistics.
- `GET /api/credits/ledger`: Paginated transaction history with counterparty details, formatted date, amount, type, and session references.
- `POST /api/credits/admin-adjust`: Admin endpoint for manual adjustments with mandatory audit reason.

---

## 5. Frontend User Experience (`/ledger`)

- **Economic Parity Banner:** Educational summary of the Time-Banking philosophy ("1 Hour = 1 Credit").
- **Balance Card:** Highlighted balance with glowing badge, quick breakdown of earned vs spent.
- **Filterable Transaction Ledger:**
  - Categorized badges: `SESSION_EARN` (emerald), `SESSION_SPEND` (amber), `WELCOME_BONUS` (purple), `ADMIN_ADJUSTMENT` (indigo).
  - Counterparty avatar, name, and skill reference.
  - Export CSV button for personal accounting.
- **Navbar Integration:** Clicking the credits badge in the header navigates directly to `/ledger`.
