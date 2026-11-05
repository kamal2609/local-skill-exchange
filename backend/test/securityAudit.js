/**
 * Local Skill Exchange – Automated Security Audit Suite
 * Run with: node backend/test/securityAudit.js
 *
 * Validates OWASP defensive posture:
 * - Helmet security headers (nosniff, frameguard, CSP)
 * - NoSQL injection sanitization
 * - General and auth-specific rate limiting
 * - JWT signature verification and tampering prevention
 */

const http = require('http');
const assert = require('assert');
const path = require('path');
const jwt = require('jsonwebtoken');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;
    const req = http.request(
      {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data ? Buffer.byteLength(data) : 0,
          ...(options.headers || {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let json;
          try { json = JSON.parse(raw); } catch { json = raw; }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

let passed = 0;
let failed = 0;

async function check(label, fn) {
  try {
    await fn();
    console.log(`  🛡️  PASS: ${label}`);
    passed++;
  } catch (err) {
    console.error(`  ❌  FAIL: ${label}`);
    console.error(`       ${err.message}`);
    failed++;
  }
}

const app = require(path.join(__dirname, '../src/app'));
const { cleanObject } = require('../src/middleware/sanitize');

async function runSecurityAudit() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const base = { hostname: '127.0.0.1', port };

  console.log('\n================================================================');
  console.log('  🔒 LOCAL SKILL EXCHANGE – OWASP SECURITY AUDIT SUITE 🔒');
  console.log(`  Auditing test server on port ${port}`);
  console.log('================================================================\n');

  // ── 1. HTTP Security Headers ──────────────────────────────────────────────
  console.log('1. HTTP Security Headers (Helmet Verification)');
  const res = await request({ ...base, path: '/api/health', method: 'GET' });

  await check('X-Content-Type-Options is set to "nosniff"', () => {
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
  });

  await check('X-Frame-Options is configured (Clickjacking Defense)', () => {
    assert.ok(res.headers['x-frame-options']);
  });

  await check('Content-Security-Policy header is configured', () => {
    assert.ok(res.headers['content-security-policy']);
    assert.ok(res.headers['content-security-policy'].includes('default-src'));
  });

  await check('X-Powered-By is omitted / suppressed for server obfuscation', () => {
    assert.strictEqual(res.headers['x-powered-by'], undefined);
  });

  // ── 2. NoSQL Injection Sanitization ───────────────────────────────────────
  console.log('\n2. NoSQL Query & Body Injection Defense');

  await check('cleanObject strips top-level MongoDB operators ($gt, $ne, $where)', () => {
    const maliciousPayload = {
      username: 'alice',
      password: { $gt: '' },
      role: { $ne: 'LEARNER' },
    };
    const cleaned = cleanObject(maliciousPayload);
    assert.strictEqual(cleaned.username, 'alice');
    assert.strictEqual(cleaned.password?.$gt, undefined);
    assert.strictEqual(cleaned.role?.$ne, undefined);
  });

  await check('cleanObject strips nested dot-notation injection keys (e.g. user.role)', () => {
    const maliciousPayload = {
      'metadata.isAdmin': true,
      validField: 'safe data',
    };
    const cleaned = cleanObject(maliciousPayload);
    assert.strictEqual(cleaned['metadata.isAdmin'], undefined);
    assert.strictEqual(cleaned.validField, 'safe data');
  });

  await check('Live HTTP endpoint sanitizes malicious injection body payloads without error', async () => {
    const r = await request(
      { ...base, path: '/api/auth/login', method: 'POST' },
      { identifier: { $gt: '' }, password: 'password123' }
    );
    // Should be rejected by validator because identifier is stripped or not a string, returning 400
    assert.strictEqual(r.status, 400);
    assert.strictEqual(r.body.success, false);
  });

  // ── 3. Rate Limiting Protection ───────────────────────────────────────────
  console.log('\n3. Rate Limiting & Brute-Force Defenses');

  await check('General API provides RateLimit headers with 100 limit', async () => {
    const r = await request({ ...base, path: '/api', method: 'GET' });
    const limitHeader = r.headers['ratelimit-limit'];
    assert.strictEqual(limitHeader, '100');
  });

  await check('Auth endpoint enforces strict 15-request rate limit', async () => {
    const r = await request(
      { ...base, path: '/api/auth/login', method: 'POST' },
      { identifier: 'invalid', password: 'wrong' }
    );
    const authLimitHeader = r.headers['ratelimit-limit'];
    assert.strictEqual(authLimitHeader, '15');
  });

  // ── 4. Cryptographic Authentication & Tampering Defense ───────────────────
  console.log('\n4. Cryptographic Authentication & Token Integrity');

  await check('Rejects requests with malformed Bearer tokens (401)', async () => {
    const r = await request({
      ...base,
      path: '/api/users/profile',
      method: 'GET',
      headers: { Authorization: 'Bearer totally-invalid-token' },
    });
    assert.strictEqual(r.status, 401);
    assert.strictEqual(r.body.success, false);
  });

  await check('Rejects tampered JWT payload signatures (401)', async () => {
    // Generate token signed with wrong secret key
    const forgedToken = jwt.sign(
      { id: '507f1f77bcf86cd799439011', role: 'ADMIN' },
      'wrong_unauthorized_attacker_secret_key_12345'
    );
    const r = await request({
      ...base,
      path: '/api/admin/metrics',
      method: 'GET',
      headers: { Authorization: `Bearer ${forgedToken}` },
    });
    assert.strictEqual(r.status, 401);
  });

  await check('Rejects requests without Authorization header (401)', async () => {
    const r = await request({ ...base, path: '/api/credits/balance', method: 'GET' });
    assert.strictEqual(r.status, 401);
  });

  // ── Teardown ──────────────────────────────────────────────────────────────
  await new Promise((resolve) => server.close(resolve));

  console.log('\n================================================================');
  console.log(`  AUDIT RESULTS: ${passed} Passed, ${failed} Failed`);
  if (failed === 0) {
    console.log('  🎉 100% OF SECURITY CHECKS PASSED. OWASP HARDENED!');
  } else {
    console.log('  ⚠️  SOME SECURITY CHECKS FAILED.');
    process.exit(1);
  }
  console.log('================================================================\n');
}

runSecurityAudit().catch((err) => {
  console.error('Fatal security audit error:', err);
  process.exit(1);
});
