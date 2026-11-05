const http = require('http');
const app = require('../src/app');
const generateToken = require('../src/utils/generateToken');
const { adminAdjustSchema } = require('../src/validators/creditValidators');
const creditService = require('../src/services/creditService');

async function runTests() {
  console.log('--- Starting Phase 6 Verification Suite: Time-Banking Credit System & Ledger ---');
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
    // -------------------------------------------------------------
    // UNIT TESTS: VALIDATORS & SERVICE LOGIC
    // -------------------------------------------------------------
    console.log('\n--- Wave 1: Credit Validators & Service Logic Tests ---');

    // Unit 1: Admin adjust schema validation
    const invalidAdjustResult = adminAdjustSchema.safeParse({
      targetUserId: 'invalid_id',
      amount: 0,
      description: 'short',
    });
    assert(!invalidAdjustResult.success, 'adminAdjustSchema rejects zero amount and invalid ID');

    const validAdjustResult = adminAdjustSchema.safeParse({
      targetUserId: '507f1f77bcf86cd799439011',
      amount: 2.0,
      description: 'Community mentor contribution bonus',
    });
    assert(validAdjustResult.success, 'adminAdjustSchema accepts valid adjustment');

    // Unit 2: getUserCreditSummary returns balance and metrics
    const summary = await creditService.getUserCreditSummary('507f1f77bcf86cd799439011');
    assert(typeof summary.currentBalance === 'number', 'getUserCreditSummary returns numeric currentBalance');
    assert(typeof summary.lifetimeEarned === 'number', 'getUserCreditSummary returns numeric lifetimeEarned');
    assert(typeof summary.lifetimeSpent === 'number', 'getUserCreditSummary returns numeric lifetimeSpent');

    // Unit 3: getLedgerTransactions returns transactions and pagination
    const ledger = await creditService.getLedgerTransactions('507f1f77bcf86cd799439011', { page: 1, limit: 10 });
    assert(Array.isArray(ledger.transactions), 'getLedgerTransactions returns transactions array');
    assert(typeof ledger.pagination.total === 'number', 'getLedgerTransactions returns pagination total');

    // Unit 4: transferSessionCredits execution in offline/demo mode returns success
    const transferResult = await creditService.transferSessionCredits('demo_session_001');
    assert(transferResult.success === true, 'transferSessionCredits executes cleanly');
    assert(typeof transferResult.transaction === 'object', 'transferSessionCredits outputs transaction record');

    // -------------------------------------------------------------
    // INTEGRATION TESTS: REST API ENDPOINTS
    // -------------------------------------------------------------
    console.log('\n--- Wave 2: Credit REST API Tests ---');

    // Test 1: Root API discovery registers credits endpoint
    const rootRes = await fetch(`${baseUrl}/api`);
    const rootData = await rootRes.json();
    assert(rootRes.status === 200, 'GET /api returns HTTP 200');
    assert(rootData.endpoints.credits === '/api/credits', 'GET /api registers /api/credits endpoint');

    // Test 2: Unauthenticated balance endpoint returns HTTP 401
    const unauthBalRes = await fetch(`${baseUrl}/api/credits/balance`);
    assert(unauthBalRes.status === 401, 'GET /api/credits/balance without token returns HTTP 401');

    // Test 3: Authenticated balance endpoint returns HTTP 200 and summary
    const testToken = generateToken('507f1f77bcf86cd799439011', 'LEARNER');
    const authBalRes = await fetch(`${baseUrl}/api/credits/balance`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    const authBalData = await authBalRes.json();
    assert(authBalRes.status === 200, 'GET /api/credits/balance with token returns HTTP 200');
    assert(authBalData.success === true, 'GET /api/credits/balance returns success: true');
    assert(typeof authBalData.data.currentBalance === 'number', 'Balance endpoint returns numeric currentBalance');

    // Test 4: Authenticated ledger endpoint returns HTTP 200 and paginated list
    const authLedgerRes = await fetch(`${baseUrl}/api/credits/ledger`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    const authLedgerData = await authLedgerRes.json();
    assert(authLedgerRes.status === 200, 'GET /api/credits/ledger with token returns HTTP 200');
    assert(authLedgerData.success === true, 'GET /api/credits/ledger returns success: true');
    assert(Array.isArray(authLedgerData.data), 'GET /api/credits/ledger returns data array');

    // Test 5: Ledger filtering by type works
    const earnedLedgerRes = await fetch(`${baseUrl}/api/credits/ledger?type=EARNED`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    const earnedLedgerData = await earnedLedgerRes.json();
    assert(earnedLedgerRes.status === 200, 'GET /api/credits/ledger?type=EARNED returns HTTP 200');
    assert(earnedLedgerData.success === true, 'Type-filtered ledger returns success: true');

    // Test 6: Non-admin user blocked from admin adjustment with HTTP 403
    const unauthAdjustRes = await fetch(`${baseUrl}/api/credits/admin-adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken}`, // LEARNER role
      },
      body: JSON.stringify({
        targetUserId: '507f1f77bcf86cd799439022',
        amount: 2.0,
        description: 'Unauthorized adjustment attempt',
      }),
    });
    assert(unauthAdjustRes.status === 403, 'POST /api/credits/admin-adjust blocks non-admin with HTTP 403');

    // Test 7: Admin user allowed to execute adjustment
    const adminToken = generateToken('507f1f77bcf86cd799439099', 'ADMIN');
    const adminAdjustRes = await fetch(`${baseUrl}/api/credits/admin-adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        targetUserId: '507f1f77bcf86cd799439022',
        amount: 1.5,
        description: 'Volunteer teaching grant',
      }),
    });
    const adminAdjustData = await adminAdjustRes.json();
    assert(adminAdjustRes.status === 200, 'POST /api/credits/admin-adjust with ADMIN token returns HTTP 200');
    assert(adminAdjustData.success === true, 'Admin adjustment returns success: true');

  } catch (error) {
    console.error('Unexpected error in Phase 6 test execution:', error);
    failed++;
  } finally {
    server.close();
  }

  console.log(`\n========================================`);
  console.log(`Phase 6 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

