# Domain Pitfalls & Mitigations

## 1. Credit Double-Spending & Negative Balances
- **Risk:** A user with 1 credit requests three simultaneous sessions. If all three are confirmed, the user drops to -2 credits.
- **Mitigation:**
  - Hold credits in escrow or verify available balance upon request creation and re-verify balance atomically inside a database transaction before confirming completion.
  - Reject exchange confirmation if requester's balance is insufficient.

## 2. Inactive / Ghost Requests
- **Risk:** A user requests an exchange and the provider never responds, leaving the requester hanging.
- **Mitigation:**
  - Status visibility: clearly flag pending requests.
  - Automatic expiration or manual cancellation by requester at any time while status is `PENDING`.

## 3. Asymmetric Confirmation on Session Completion
- **Risk:** One party claims the session occurred while the other claims a no-show.
- **Mitigation:**
  - The requester (who pays the credits) must click "Confirm & Release Credits" after the session.
  - Provide a rating and optional review upon release.
  - In MVP, requester-confirmed release ensures credits are only deducted when the learner is satisfied the session occurred.

## 4. Cold-Start Problem in Local Communities
- **Risk:** New users join with 0 balance and cannot learn anything until someone books their skill.
- **Mitigation:**
  - Automatic initial grant: Every verified user starts with 3 welcome credits (`WELCOME_BONUS`).
  - Supports both `TEACH` listings (what you offer) and `LEARN` requests (what you're looking for), allowing matching from either direction.
