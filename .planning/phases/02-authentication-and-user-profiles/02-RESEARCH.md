# Phase 2: Authentication & User Profiles — Research & Design

## 1. Authentication Architecture (JWT + bcryptjs)
- **Token Generation:** Use `jsonwebtoken` to sign payload containing `{ id: user._id, role: user.role }` with `process.env.JWT_SECRET` and expiration (e.g. 7 days).
- **Password Security:**
  - `bcryptjs` with salt rounds = 10.
  - `User.hashPassword()` static method and `user.matchPassword()` instance method already present on Mongoose schema.
  - `toJSON` transform in `User.js` automatically strips `passwordHash`, `passwordResetToken`, and `passwordResetExpires` from responses.
- **Role-Based Access Control (RBAC):**
  - Roles: `LEARNER`, `PROVIDER`, `ADMIN`.
  - Middleware `protect`: extracts Bearer token from `Authorization` header, verifies token, loads user from database without sensitive fields, attaches to `req.user`.
  - Middleware `authorize(...roles)`: asserts `roles.includes(req.user.role)`, returns 403 Forbidden if not authorized.

## 2. Password Reset Workflow (Crypto Token)
- Uses Node.js native `crypto.randomBytes(32).toString('hex')`.
- Stores SHA-256 hash in `user.passwordResetToken` with `user.passwordResetExpires = Date.now() + 10 * 60 * 1000` (10 minutes).
- In development/local mode, returns the reset token and reset URL directly in the JSON response so users can test immediately without external SMTP configuration.
- Reset endpoint verifies unexpired token hash, updates password hash, clears reset fields, and issues a fresh JWT.

## 3. Starter Credit Automation (REQ-AUTH-06)
- Upon successful registration, the user receives:
  - `creditsBalance: 3.0`
  - A corresponding ledger entry created in `CreditTransaction`:
    - `receiverId: user._id`
    - `senderId: null`
    - `amount: 3.0`
    - `type: 'WELCOME_BONUS'`
    - `description: 'Starter welcome bonus for joining Local Skill Exchange'`

## 4. Frontend State & Token Lifecycle
- `AuthContext`:
  - Stores `user`, `token`, `isAuthenticated`, `isLoading`.
  - Stores JWT in `localStorage` under `lse_token`.
  - Automatically sets Axios default headers `Authorization: Bearer <token>` when token changes.
  - On app mount, verifies token via `GET /api/auth/me` to restore active session and live credit balance.
  - Handles login, registration, logout, and profile updates.
- `ProtectedRoute`:
  - Guards private routes (Profile, Edit Profile, Settings).
  - Redirects unauthenticated visitors to `/login` preserving intended destination via `location.state.from`.
  - Enforces role requirements if specified.
