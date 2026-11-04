const http = require('http');
const app = require('../src/app');
const generateToken = require('../src/utils/generateToken');
const { authorize } = require('../src/middleware/auth');

async function runTests() {
  console.log('--- Starting Phase 2 Verification Suite ---');
  let passed = 0;
  let failed = 0;

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Ephemeral test server running at ${baseUrl}`);

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Test 1: API root discovery includes auth and users endpoints
    const rootRes = await fetch(`${baseUrl}/api`);
    const rootData = await rootRes.json();
    assert(rootRes.status === 200, 'GET /api returns HTTP 200');
    assert(rootData.endpoints.auth === '/api/auth', 'GET /api lists /api/auth endpoint');
    assert(rootData.endpoints.users === '/api/users', 'GET /api lists /api/users endpoint');

    // Test 2: Input validation rejects invalid registration
    const invalidRegRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'A', // too short
        email: 'invalid-email',
        password: '123', // too short
      }),
    });
    const invalidRegData = await invalidRegRes.json();
    assert(invalidRegRes.status === 400, 'POST /api/auth/register with invalid data returns HTTP 400');
    assert(invalidRegData.success === false, 'POST /api/auth/register returns success: false on validation error');
    assert(Array.isArray(invalidRegData.errors), 'POST /api/auth/register returns Zod validation errors array');

    // Test 3: Input validation rejects empty login
    const invalidLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(invalidLoginRes.status === 400, 'POST /api/auth/login with empty body returns HTTP 400');

    // Test 4: Unauthenticated access to /api/auth/me is rejected
    const unauthMeRes = await fetch(`${baseUrl}/api/auth/me`);
    assert(unauthMeRes.status === 401, 'GET /api/auth/me without token returns HTTP 401');

    // Test 5: Unauthenticated access to /api/users/profile is rejected
    const unauthProfileRes = await fetch(`${baseUrl}/api/users/profile`);
    assert(unauthProfileRes.status === 401, 'GET /api/users/profile without token returns HTTP 401');

    // Test 6: Malformed Bearer token is rejected
    const malformedTokenRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer this.is.invalid.token' },
    });
    assert(malformedTokenRes.status === 401, 'GET /api/auth/me with invalid token returns HTTP 401');

    // Test 7: JWT generateToken utility test
    const dummyId = '507f1f77bcf86cd799439011';
    const token = generateToken(dummyId, 'LEARNER');
    assert(typeof token === 'string' && token.length > 20, 'generateToken returns valid JWT string');

    // Test 8: RBAC authorize middleware unit test
    let authorizedPassed = false;
    let forbiddenPassed = false;
    const reqProvider = { user: { role: 'PROVIDER' } };
    const reqLearner = { user: { role: 'LEARNER' } };
    const resMock = {
      status: (code) => ({
        json: () => {
          if (code === 403) forbiddenPassed = true;
        },
      }),
    };

    authorize('PROVIDER', 'ADMIN')(reqProvider, resMock, () => {
      authorizedPassed = true;
    });
    authorize('ADMIN')(reqLearner, resMock, () => {});

    assert(authorizedPassed, 'authorize middleware allows authorized roles');
    assert(forbiddenPassed, 'authorize middleware rejects unauthorized roles with 403');

    console.log(`\nVerification Complete: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
