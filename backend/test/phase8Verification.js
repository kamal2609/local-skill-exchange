/**
 * Phase 8 Verification Suite – Premium UI, 3D Visuals & Admin Dashboard
 * Run with: node backend/test/phase8Verification.js
 *
 * Ephemeral HTTP server testing admin authentication guards, metric retrieval,
 * user status management, report moderation, and taxonomy registration.
 */

const http = require('http');
const assert = require('assert');
const path = require('path');

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

// Load App
const app = require(path.join(__dirname, '../src/app'));

// Load Validators
const {
  updateUserStatusSchema,
  updateUserRoleSchema,
  resolveReportSchema,
  createCategorySchema,
} = require('../src/validators/adminValidators');

const generateToken = require('../src/utils/generateToken');

function authHeader(role = 'ADMIN') {
  const token = generateToken('507f1f77bcf86cd799439099', role);
  return `Bearer ${token}`;
}

async function main() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const base = { hostname: '127.0.0.1', port };

  console.log(`\n🧪  Phase 8 Verification Suite  (port ${port})\n`);

  // ── 1. Admin Validators ──────────────────────────────────────────────────
  console.log('── Admin Validators ────────────────────────────────────────────');

  await test('updateUserStatusSchema: valid boolean passes', () => {
    const res = updateUserStatusSchema.safeParse({ isActive: false });
    assert.ok(res.success, 'Expected success for boolean isActive');
  });

  await test('updateUserStatusSchema: missing isActive fails', () => {
    const res = updateUserStatusSchema.safeParse({});
    assert.ok(!res.success, 'Expected failure for missing isActive');
  });

  await test('updateUserRoleSchema: valid roles pass', () => {
    assert.ok(updateUserRoleSchema.safeParse({ role: 'LEARNER' }).success);
    assert.ok(updateUserRoleSchema.safeParse({ role: 'PROVIDER' }).success);
    assert.ok(updateUserRoleSchema.safeParse({ role: 'ADMIN' }).success);
  });

  await test('updateUserRoleSchema: invalid role fails', () => {
    const res = updateUserRoleSchema.safeParse({ role: 'SUPERUSER' });
    assert.ok(!res.success, 'Expected failure for invalid role');
  });

  await test('resolveReportSchema: valid status passes', () => {
    const res = resolveReportSchema.safeParse({ status: 'RESOLVED', adminNotes: 'Handled' });
    assert.ok(res.success, 'Expected success for valid status');
  });

  await test('resolveReportSchema: invalid status fails', () => {
    const res = resolveReportSchema.safeParse({ status: 'IGNORED' });
    assert.ok(!res.success, 'Expected failure for invalid status');
  });

  await test('createCategorySchema: valid category passes', () => {
    const res = createCategorySchema.safeParse({ name: 'Robotics', description: 'Hardware and robotics' });
    assert.ok(res.success, 'Expected success for valid category');
  });

  // ── 2. Discovery Endpoint ────────────────────────────────────────────────
  console.log('\n── Root Discovery ──────────────────────────────────────────────');

  await test('GET /api → lists /api/admin endpoint', async () => {
    const r = await request({ ...base, path: '/api', method: 'GET' });
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.body.endpoints?.admin, '/api/admin');
  });

  // ── 3. Admin Authentication & Role Guards ─────────────────────────────────
  console.log('\n── Admin RBAC Guards ───────────────────────────────────────────');

  await test('GET /api/admin/metrics without token → 401', async () => {
    const r = await request({ ...base, path: '/api/admin/metrics', method: 'GET' });
    assert.strictEqual(r.status, 401);
  });

  await test('GET /api/admin/metrics with LEARNER token → 403', async () => {
    const r = await request({
      ...base,
      path: '/api/admin/metrics',
      method: 'GET',
      headers: { Authorization: authHeader('LEARNER') },
    });
    assert.strictEqual(r.status, 403);
  });

  await test('GET /api/admin/metrics with PROVIDER token → 403', async () => {
    const r = await request({
      ...base,
      path: '/api/admin/metrics',
      method: 'GET',
      headers: { Authorization: authHeader('PROVIDER') },
    });
    assert.strictEqual(r.status, 403);
  });

  await test('GET /api/admin/metrics with ADMIN token → 200 with platform metrics', async () => {
    const r = await request({
      ...base,
      path: '/api/admin/metrics',
      method: 'GET',
      headers: { Authorization: authHeader('ADMIN') },
    });
    assert.strictEqual(r.status, 200);
    assert.ok(r.body.success, 'Expected success: true');
    assert.ok('totalUsers' in r.body.data, 'Expected totalUsers in data');
    assert.ok('activeUsers' in r.body.data, 'Expected activeUsers in data');
    assert.ok('completedSessions' in r.body.data, 'Expected completedSessions in data');
    assert.ok('totalCreditsExchanged' in r.body.data, 'Expected totalCreditsExchanged in data');
  });

  // ── 4. Admin User Management ──────────────────────────────────────────────
  console.log('\n── Admin User Management ───────────────────────────────────────');

  await test('GET /api/admin/users without token → 401', async () => {
    const r = await request({ ...base, path: '/api/admin/users', method: 'GET' });
    assert.strictEqual(r.status, 401);
  });

  await test('GET /api/admin/users with ADMIN token → 200 with users list', async () => {
    const r = await request({
      ...base,
      path: '/api/admin/users',
      method: 'GET',
      headers: { Authorization: authHeader('ADMIN') },
    });
    assert.strictEqual(r.status, 200);
    assert.ok(r.body.success, 'Expected success: true');
    assert.ok(Array.isArray(r.body.data), 'Expected data to be array of users');
  });

  await test('PUT /api/admin/users/:id/status toggles account suspension', async () => {
    const r = await request(
      {
        ...base,
        path: '/api/admin/users/507f1f77bcf86cd799439011/status',
        method: 'PUT',
        headers: { Authorization: authHeader('ADMIN') },
      },
      { isActive: false }
    );
    assert.strictEqual(r.status, 200);
    assert.ok(r.body.success, 'Expected success: true');
  });

  await test('PUT /api/admin/users/:id/role updates role', async () => {
    const r = await request(
      {
        ...base,
        path: '/api/admin/users/507f1f77bcf86cd799439011/role',
        method: 'PUT',
        headers: { Authorization: authHeader('ADMIN') },
      },
      { role: 'PROVIDER' }
    );
    assert.strictEqual(r.status, 200);
    assert.ok(r.body.success, 'Expected success: true');
  });

  // ── 5. Moderation Reports & Skill Taxonomy ────────────────────────────────
  console.log('\n── Moderation Reports & Skill Taxonomy ─────────────────────────');

  await test('GET /api/admin/reports with ADMIN token → 200 with reports', async () => {
    const r = await request({
      ...base,
      path: '/api/admin/reports',
      method: 'GET',
      headers: { Authorization: authHeader('ADMIN') },
    });
    assert.strictEqual(r.status, 200);
    assert.ok(r.body.success, 'Expected success: true');
    assert.ok(Array.isArray(r.body.data), 'Expected reports array');
  });

  await test('PUT /api/admin/reports/:id updates status to RESOLVED', async () => {
    const r = await request(
      {
        ...base,
        path: '/api/admin/reports/demo_report_001',
        method: 'PUT',
        headers: { Authorization: authHeader('ADMIN') },
      },
      { status: 'RESOLVED', adminNotes: 'User was issued a formal warning.' }
    );
    assert.strictEqual(r.status, 200);
    assert.ok(r.body.success, 'Expected success: true');
  });

  await test('POST /api/admin/categories registers new skill category', async () => {
    const r = await request(
      {
        ...base,
        path: '/api/admin/categories',
        method: 'POST',
        headers: { Authorization: authHeader('ADMIN') },
      },
      { name: 'Astronomy', category: 'Academic', description: 'Stargazing and telescopes' }
    );
    assert.strictEqual(r.status, 201);
    assert.ok(r.body.success, 'Expected success: true');
  });

  // ── Teardown ──────────────────────────────────────────────────────────────
  await new Promise((resolve) => server.close(resolve));

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Phase 8 Verification: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('🎉  All Phase 8 checks passed!\n');
  } else {
    console.log('⚠️   Some checks failed — review output above.\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

