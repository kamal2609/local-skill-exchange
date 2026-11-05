# Phase 9: Testing, Security Audit & Deployment — Research & Technical Specification

## 1. Problem Statement & Scope

As the final phase of the Local Skill Exchange project, Phase 9 guarantees production quality, operational stability, security hardening, cloud deployment readiness, and complete documentation:

1. **Automated Testing Suite (`REQ-QA-03`):**
   - Unify all verification suites (Phases 1–8) into an automated, zero-flakiness master test runner.
   - Comprehensive test assertions covering authentication, RBAC, Smart Skill Matching Engine ⭐ (formulas, reciprocal bonuses), weekly availability, session booking state machine, atomic double-entry credit ledger, direct messaging, peer reviews, safety reports, and admin metrics.
   - Wire `"npm test"` across monorepo root, backend, and frontend packages.

2. **Security Hardening & Audit (`REQ-QA-02`):**
   - **HTTP Headers:** Helmet configuration enforcing `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, and custom `Content-Security-Policy` allowing WebGL canvas and external avatar image sources.
   - **NoSQL Injection Defense:** Sanitization middleware stripping MongoDB operators (`$`, `.`) from `req.body`, `req.query`, and `req.params`.
   - **Rate Limiting:** IP-based rate limiting on sensitive authentication routes (`/api/auth/*`) and general API endpoints (`/api/*`).
   - **CORS Restrictions:** Dynamic origin validation for local Vite dev and production cloud deployment domains.
   - **Automated Security Audit:** Verification script (`backend/test/securityAudit.js`) validating headers, injection protection, and rate-limiting.

3. **Complete Documentation Suite:**
   - **`README.md`:** Comprehensive project documentation with architecture diagrams, quickstart guide, environment variables, features, and scripts.
   - **`docs/ARCHITECTURE.md`:** Deep-dive into MERN architecture, Smart Matching algorithm formulas, and double-entry accounting.
   - **`docs/DATABASE.md`:** Schema documentation for all 12 Mongoose models, indexes, and relationship graph.
   - **`docs/API.md`:** Exhaustive REST API reference for all 15 route groups (request/response shapes, headers, status codes).
   - **`docs/TESTING.md`:** Test execution guide, coverage report, and verification instructions.
   - **`docs/USER_GUIDE.md`:** End-user guide for Learners, Skill Providers, and Administrators.

4. **Production Cloud Deployment Configurations (`REQ-QA-04`):**
   - `vercel.json`: Single Page Application (SPA) rewrite rules for React Router v6 client-side routing on Vercel.
   - `render.yaml`: Infrastructure-as-code specification for Render Web Service backend with environment variable mapping.
   - Production readiness verification: zero build errors, clean git working tree.

---

## 2. Technical Specifications & Architecture

### 2.1 Unified Testing Architecture

```
                             [Master Test Runner]
                           (backend/test/runAll.js)
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
[Mathematical Engine Tests]   [REST API & Auth Guards]   [Accounting & DB Guards]
- Reciprocal barter bonus     - 401 unauthenticated      - Non-negative balance
- Distance & language score   - 403 non-admin roles      - Double-entry symmetry
- Normalization [0, 100]      - 200/201 success paths    - Duplicate session guard
```

The testing harness uses an ephemeral Node.js HTTP server pattern (`http.createServer(app)` listening on port `0`), ensuring:
- Zero port conflicts during parallel execution.
- Deterministic behavior in offline / CI environments via controller-level demo fallbacks when MongoDB is not connected.
- Instant execution (< 10 seconds for 140+ assertions).

### 2.2 Security Hardening Architecture

```
[Client Request]
       │
       ▼
[Helmet Security Headers] ──> nosniff, frameguard, CSP, hidePoweredBy
       │
       ▼
[Rate Limiting Limiter]  ──> 100 req / 15 min (General), 15 req / 15 min (Auth)
       │
       ▼
[NoSQL Sanitizer]         ──> Recursive strip of keys containing '$' or '.'
       │
       ▼
[CORS Validator]         ──> Allowed origins whitelist
       │
       ▼
[Express Controllers]
```

#### NoSQL Injection Sanitization Algorithm:
```js
function sanitize(payload) {
  if (Array.isArray(payload)) {
    return payload.map(sanitize);
  }
  if (payload !== null && typeof payload === 'object') {
    const clean = {};
    for (const [key, value] of Object.entries(payload)) {
      if (!key.startsWith('$') && !key.includes('.')) {
        clean[key] = sanitize(value);
      }
    }
    return clean;
  }
  return payload;
}
```

### 2.3 Cloud Deployment Topology

- **Frontend (Vercel):**
  - Static SPA hosting with Vite build output (`dist/`).
  - Rewrites rule: `[ { "source": "/(.*)", "destination": "/index.html" } ]` ensuring client-side routes (`/explore`, `/matches`, `/sessions`, `/ledger`, `/admin`) reload without 404 errors.
- **Backend (Render / Railway):**
  - Node.js runtime (`node src/server.js`).
  - Managed MongoDB Atlas connection string (`MONGODB_URI`).
  - Health check endpoint `/api/health` for zero-downtime rolling deploys.

---

## 3. Plan Decomposition (3 Waves)

- **Wave 1 (Plan 09-01): Master Automated Test Suite & Testing Harness**
  - Unified master test runner (`backend/test/masterTestSuite.js`).
  - Root and package `"npm test"` script integration.
  - Frontend utility test verification.

- **Wave 2 (Plan 09-02): Security Hardening & Audit Script**
  - NoSQL input sanitization middleware (`backend/src/middleware/sanitize.js`).
  - Helmet CSP and security header tuning.
  - Auth route rate limiting.
  - Automated security audit suite (`backend/test/securityAudit.js`).

- **Wave 3 (Plan 09-03): Documentation Suite & Cloud Deployment Configurations**
  - `README.md` and 5 specialized docs in `docs/`.
  - `vercel.json` and `render.yaml` deployment configs.
  - Final verification across monorepo builds and tests.

