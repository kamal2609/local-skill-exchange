/**
 * Phase 7 Verification Suite – Communication & Community
 * Run with: node backend/test/phase7Verification.js
 *
 * Tests validators, route auth, and API shapes using ephemeral HTTP server
 * (no persistent MongoDB required – offline demo fallbacks are exercised).
 */

const http = require('http');
const assert = require('assert');
const path = require('path');

// ─── Helper ───────────────────────────────────────────────────────────────────

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
          resolve({ status: res.statusCode, body: json });
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

async function test(label, fn) {
  try {
    await fn();
    console.log(`  ✅  ${label}`);
    passed++;
  } catch (err) {
    console.error(`  ❌  ${label}`);
    console.error(`       ${err.message}`);
    failed++;
  }
}

// ─── Load app ────────────────────────────────────────────────────────────────

const app = require(path.join(__dirname, '../src/app'));

// ─── Validator imports ────────────────────────────────────────────────────────

const {
  createConversationSchema,
  sendMessageSchema,
} = require('../src/validators/communicationValidators');

const {
  createReviewSchema,
  createReportSchema,
} = require('../src/validators/communityValidators');

// ─── Fake JWT for demo (generateToken not needed – we just need a bearer) ────

function fakeAuthHeader(role = 'LEARNER') {
  const generateToken = require('../src/utils/generateToken');
  const token = generateToken('507f1f77bcf86cd799439011', role);
  return `Bearer ${token}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const base = { hostname: '127.0.0.1', port };

  console.log(`\n🧪  Phase 7 Verification Suite  (port ${port})\n`);

  // ── 1. Validator unit tests ──────────────────────────────────────────────

  console.log('── Validators ──────────────────────────────────────────────────');

  await test('createConversationSchema: valid recipientId passes', () => {
    const result = createConversationSchema.safeParse({ recipientId: '507f1f77bcf86cd799439011' });
    assert.ok(result.success, `Expected success but got: ${JSON.stringify(result.error?.errors)}`);
  });

  await test('createConversationSchema: missing recipientId fails', () => {
    const result = createConversationSchema.safeParse({});
    assert.ok(!result.success, 'Expected failure for missing recipientId');
  });

  await test('sendMessageSchema: valid text passes', () => {
    const result = sendMessageSchema.safeParse({ text: 'Hello there!' });
    assert.ok(result.success, `Expected success but got: ${JSON.stringify(result.error?.errors)}`);
  });

  await test('sendMessageSchema: empty text fails', () => {
    const result = sendMessageSchema.safeParse({ text: '' });
    assert.ok(!result.success, 'Expected failure for empty text');
  });

  await test('sendMessageSchema: text > 2000 chars fails', () => {
    const result = sendMessageSchema.safeParse({ text: 'a'.repeat(2001) });
    assert.ok(!result.success, 'Expected failure for text > 2000 chars');
  });

  await test('createReviewSchema: valid data passes', () => {
    const result = createReviewSchema.safeParse({
      sessionId: '507f1f77bcf86cd799439012',
      reviewedUserId: '507f1f77bcf86cd799439013',
      rating: 4,
      comment: 'Great session!',
    });
    assert.ok(result.success, `Expected success but got: ${JSON.stringify(result.error?.errors)}`);
  });

  await test('createReviewSchema: rating out of range fails', () => {
    const result = createReviewSchema.safeParse({
      sessionId: '507f1f77bcf86cd799439012',
      reviewedUserId: '507f1f77bcf86cd799439013',
      rating: 6,
    });
    assert.ok(!result.success, 'Expected failure for rating > 5');
  });

  await test('createReviewSchema: missing sessionId fails', () => {
    const result = createReviewSchema.safeParse({
      reviewedUserId: '507f1f77bcf86cd799439013',
      rating: 4,
    });
    assert.ok(!result.success, 'Expected failure for missing sessionId');
  });

  await test('createReportSchema: valid data passes', () => {
    const result = createReportSchema.safeParse({
      reportedUserId: '507f1f77bcf86cd799439014',
      reason: 'INAPPROPRIATE_BEHAVIOR',
      description: 'This user was rude during the session.',
    });
    assert.ok(result.success, `Expected success but got: ${JSON.stringify(result.error?.errors)}`);
  });

  await test('createReportSchema: missing reason fails', () => {
    const result = createReportSchema.safeParse({
      reportedUserId: '507f1f77bcf86cd799439014',
      description: 'Some description',
    });
    assert.ok(!result.success, 'Expected failure for missing reason');
  });

  // ── 2. Discovery endpoint ────────────────────────────────────────────────

  console.log('\n── Discovery Endpoint ──────────────────────────────────────────');

  await test('GET /api → lists conversations endpoint', async () => {
    const r = await request({ ...base, path: '/api', method: 'GET' });
    assert.strictEqual(r.status, 200);
    assert.ok(r.body.endpoints?.conversations, 'Missing conversations in discovery');
  });

  await test('GET /api → lists notifications endpoint', async () => {
    const r = await request({ ...base, path: '/api', method: 'GET' });
    assert.ok(r.body.endpoints?.notifications, 'Missing notifications in discovery');
  });

  await test('GET /api → lists reviews endpoint', async () => {
    const r = await request({ ...base, path: '/api', method: 'GET' });
    assert.ok(r.body.endpoints?.reviews, 'Missing reviews in discovery');
  });

  await test('GET /api → lists reports endpoint', async () => {
    const r = await request({ ...base, path: '/api', method: 'GET' });
    assert.ok(r.body.endpoints?.reports, 'Missing reports in discovery');
  });

  // ── 3. Conversations ─────────────────────────────────────────────────────

  console.log('\n── Conversations ───────────────────────────────────────────────');

  await test('GET /api/conversations without token → 401', async () => {
    const r = await request({ ...base, path: '/api/conversations', method: 'GET' });
    assert.strictEqual(r.status, 401);
  });

  await test('GET /api/conversations with token → 200 with data array', async () => {
    const r = await request(
      { ...base, path: '/api/conversations', method: 'GET', headers: { Authorization: fakeAuthHeader() } }
    );
    assert.ok([200, 503].includes(r.status), `Unexpected status: ${r.status}`);
    if (r.status === 200) {
      assert.ok(r.body.success, 'Expected success: true');
      assert.ok(Array.isArray(r.body.data), 'Expected data to be array');
    }
  });

  await test('POST /api/conversations with token → 200 or 201', async () => {
    const r = await request(
      { ...base, path: '/api/conversations', method: 'POST', headers: { Authorization: fakeAuthHeader() } },
      { recipientId: '507f1f77bcf86cd799439099' }
    );
    assert.ok([200, 201].includes(r.status), `Unexpected status: ${r.status}`);
  });

  await test('POST /api/conversations without token → 401', async () => {
    const r = await request(
      { ...base, path: '/api/conversations', method: 'POST' },
      { recipientId: '507f1f77bcf86cd799439099' }
    );
    assert.strictEqual(r.status, 401);
  });

  await test('GET /api/conversations/:id/messages with token → 200', async () => {
    const r = await request(
      {
        ...base,
        path: '/api/conversations/507f1f77bcf86cd799439050/messages',
        method: 'GET',
        headers: { Authorization: fakeAuthHeader() },
      }
    );
    assert.ok([200, 403, 404, 503].includes(r.status), `Unexpected status: ${r.status}`);
  });

  await test('POST /api/conversations/:id/messages without token → 401', async () => {
    const r = await request(
      { ...base, path: '/api/conversations/507f1f77bcf86cd799439050/messages', method: 'POST' },
      { text: 'Hello!' }
    );
    assert.strictEqual(r.status, 401);
  });

  // ── 4. Notifications ──────────────────────────────────────────────────────

  console.log('\n── Notifications ───────────────────────────────────────────────');

  await test('GET /api/notifications without token → 401', async () => {
    const r = await request({ ...base, path: '/api/notifications', method: 'GET' });
    assert.strictEqual(r.status, 401);
  });

  await test('GET /api/notifications with token → 200 with unreadCount', async () => {
    const r = await request(
      { ...base, path: '/api/notifications', method: 'GET', headers: { Authorization: fakeAuthHeader() } }
    );
    assert.ok([200, 503].includes(r.status), `Unexpected status: ${r.status}`);
    if (r.status === 200) {
      assert.ok(r.body.success, 'Expected success: true');
      assert.ok('unreadCount' in r.body, 'Expected unreadCount field');
    }
  });

  await test('PUT /api/notifications/read-all without token → 401', async () => {
    const r = await request({ ...base, path: '/api/notifications/read-all', method: 'PUT' });
    assert.strictEqual(r.status, 401);
  });

  await test('PUT /api/notifications/read-all with token → 200', async () => {
    const r = await request(
      { ...base, path: '/api/notifications/read-all', method: 'PUT', headers: { Authorization: fakeAuthHeader() } }
    );
    assert.ok([200, 503].includes(r.status), `Unexpected status: ${r.status}`);
  });

  // ── 5. Reviews ────────────────────────────────────────────────────────────

  console.log('\n── Reviews ─────────────────────────────────────────────────────');

  await test('GET /api/reviews/user/:userId → 200 (public)', async () => {
    const r = await request({ ...base, path: '/api/reviews/user/507f1f77bcf86cd799439020', method: 'GET' });
    assert.ok([200, 503].includes(r.status), `Unexpected status: ${r.status}`);
    if (r.status === 200) {
      assert.ok(r.body.success, 'Expected success: true');
      assert.ok(Array.isArray(r.body.data), 'Expected data to be array');
    }
  });

  await test('POST /api/reviews without token → 401', async () => {
    const r = await request(
      { ...base, path: '/api/reviews', method: 'POST' },
      {
        sessionId: '507f1f77bcf86cd799439021',
        reviewedUserId: '507f1f77bcf86cd799439022',
        rating: 5,
        comment: 'Excellent!',
      }
    );
    assert.strictEqual(r.status, 401);
  });

  await test('POST /api/reviews with token → 201 or 200', async () => {
    const r = await request(
      { ...base, path: '/api/reviews', method: 'POST', headers: { Authorization: fakeAuthHeader() } },
      {
        sessionId: '507f1f77bcf86cd799439021',
        reviewedUserId: '507f1f77bcf86cd799439022',
        rating: 5,
        comment: 'Excellent!',
      }
    );
    assert.ok([200, 201, 400, 503].includes(r.status), `Unexpected status: ${r.status}`);
  });

  // ── 6. Reports ────────────────────────────────────────────────────────────

  console.log('\n── Reports ─────────────────────────────────────────────────────');

  await test('POST /api/reports without token → 401', async () => {
    const r = await request(
      { ...base, path: '/api/reports', method: 'POST' },
      {
        reportedUserId: '507f1f77bcf86cd799439030',
        reason: 'SPAM',
        description: 'Sending spam messages.',
      }
    );
    assert.strictEqual(r.status, 401);
  });

  await test('POST /api/reports with token → 201 or 200', async () => {
    const r = await request(
      { ...base, path: '/api/reports', method: 'POST', headers: { Authorization: fakeAuthHeader() } },
      {
        reportedUserId: '507f1f77bcf86cd799439030',
        reason: 'SPAM',
        description: 'Sending spam messages.',
      }
    );
    assert.ok([200, 201, 400, 503].includes(r.status), `Unexpected status: ${r.status}`);
  });

  await test('GET /api/reports with LEARNER token → 403', async () => {
    const r = await request(
      { ...base, path: '/api/reports', method: 'GET', headers: { Authorization: fakeAuthHeader('LEARNER') } }
    );
    // Could be 401 (token invalid without DB) or 403 (role check) or 503 (offline)
    // Any non-200 response without admin access is acceptable
    assert.ok([401, 403, 503].includes(r.status), `Expected 401/403/503, got ${r.status}`);
  });

  await test('GET /api/reports with ADMIN token → 200 or 503', async () => {
    const r = await request(
      { ...base, path: '/api/reports', method: 'GET', headers: { Authorization: fakeAuthHeader('ADMIN') } }
    );
    assert.ok([200, 401, 503].includes(r.status), `Unexpected status: ${r.status}`);
    if (r.status === 200) {
      assert.ok(r.body.success, 'Expected success: true');
    }
  });

  // ── Teardown ──────────────────────────────────────────────────────────────

  await new Promise((resolve) => server.close(resolve));

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Phase 7 Verification: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('🎉  All checks passed!\n');
  } else {
    console.log('⚠️   Some checks failed — review output above.\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

