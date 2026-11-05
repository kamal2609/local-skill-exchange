const http = require('http');
const app = require('../src/app');
const generateToken = require('../src/utils/generateToken');
const { singleSlotSchema, bulkAvailabilitySchema } = require('../src/validators/availabilityValidators');
const { createSessionSchema, updateSessionStatusSchema } = require('../src/validators/sessionValidators');

async function runTests() {
  console.log('--- Starting Phase 5 Verification Suite: Availability & Session Booking ---');
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
    // UNIT TESTS: ZOD SCHEMAS & BUSINESS LOGIC
    // -------------------------------------------------------------
    console.log('\n--- Wave 1: Availability & Session Validator Tests ---');

    // Unit 1: Single slot schema rejects endTime <= startTime
    const invalidSlotResult = singleSlotSchema.safeParse({
      dayOfWeek: 1,
      startTime: '14:00',
      endTime: '12:00', // invalid
    });
    assert(!invalidSlotResult.success, 'singleSlotSchema rejects endTime <= startTime');

    // Unit 2: Single slot schema accepts valid slot
    const validSlotResult = singleSlotSchema.safeParse({
      dayOfWeek: 2,
      startTime: '09:00',
      endTime: '12:00',
      learningMode: 'ONLINE',
      preferredDuration: 60,
    });
    assert(validSlotResult.success, 'singleSlotSchema accepts valid time slot');

    // Unit 3: Bulk availability schema validates array of slots
    const validBulkResult = bulkAvailabilitySchema.safeParse({
      slots: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '12:00' },
        { dayOfWeek: 3, startTime: '14:00', endTime: '17:00' },
      ],
    });
    assert(validBulkResult.success, 'bulkAvailabilitySchema validates array of slots');

    // Unit 4: Session creation schema validates fields and rejects endTime <= startTime
    const invalidSessionResult = createSessionSchema.safeParse({
      providerId: '507f1f77bcf86cd799439011',
      skillId: '507f1f77bcf86cd799439012',
      bookingDate: '2026-12-01',
      startTime: '15:00',
      endTime: '14:00', // invalid
    });
    assert(!invalidSessionResult.success, 'createSessionSchema rejects endTime <= startTime');

    // Unit 5: Status transition schema validates status enum
    const validStatusResult = updateSessionStatusSchema.safeParse({ status: 'ACCEPTED' });
    const invalidStatusResult = updateSessionStatusSchema.safeParse({ status: 'UNKNOWN_STATUS' });
    assert(validStatusResult.success, 'updateSessionStatusSchema accepts ACCEPTED');
    assert(!invalidStatusResult.success, 'updateSessionStatusSchema rejects invalid status');

    // -------------------------------------------------------------
    // INTEGRATION TESTS: REST API ENDPOINTS
    // -------------------------------------------------------------
    console.log('\n--- Wave 2: Availability REST API Tests ---');

    // Test 1: Root API discovery registers availability and sessions endpoints
    const rootRes = await fetch(`${baseUrl}/api`);
    const rootData = await rootRes.json();
    assert(rootRes.status === 200, 'GET /api returns HTTP 200');
    assert(rootData.endpoints.availability === '/api/availability', 'GET /api registers /api/availability');
    assert(rootData.endpoints.sessions === '/api/sessions', 'GET /api registers /api/sessions');

    // Test 2: Unauthenticated GET /api/availability/my is blocked with HTTP 401
    const unauthAvailRes = await fetch(`${baseUrl}/api/availability/my`);
    assert(unauthAvailRes.status === 401, 'GET /api/availability/my without token returns HTTP 401');

    // Test 3: Authenticated GET /api/availability/my returns user schedule
    const learnerToken = generateToken('507f1f77bcf86cd799439011', 'LEARNER');
    const authAvailRes = await fetch(`${baseUrl}/api/availability/my`, {
      headers: { Authorization: `Bearer ${learnerToken}` },
    });
    const authAvailData = await authAvailRes.json();
    assert(authAvailRes.status === 200, 'GET /api/availability/my with token returns HTTP 200');
    assert(authAvailData.success === true, 'GET /api/availability/my returns success: true');
    assert(Array.isArray(authAvailData.data), 'GET /api/availability/my returns array of slots');

    // Test 4: Bulk update PUT /api/availability/my replaces weekly schedule
    const updateAvailRes = await fetch(`${baseUrl}/api/availability/my`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${learnerToken}`,
      },
      body: JSON.stringify({
        slots: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', learningMode: 'ONLINE' },
          { dayOfWeek: 3, startTime: '15:00', endTime: '18:00', learningMode: 'HYBRID' },
        ],
      }),
    });
    const updateAvailData = await updateAvailRes.json();
    assert(updateAvailRes.status === 200, 'PUT /api/availability/my returns HTTP 200');
    assert(updateAvailData.success === true, 'PUT /api/availability/my returns success: true');

    // Test 5: Public GET /api/availability/user/:userId returns schedule
    const publicAvailRes = await fetch(`${baseUrl}/api/availability/user/507f1f77bcf86cd799439012`);
    const publicAvailData = await publicAvailRes.json();
    assert(publicAvailRes.status === 200, 'GET /api/availability/user/:userId returns HTTP 200');
    assert(publicAvailData.success === true, 'Public availability returns success: true');

    console.log('\n--- Wave 3: Session Booking & State Machine Tests ---');

    // Test 6: Unauthenticated session endpoints return HTTP 401
    const unauthSessionRes = await fetch(`${baseUrl}/api/sessions`);
    assert(unauthSessionRes.status === 401, 'GET /api/sessions without token returns HTTP 401');

    // Test 7: Prevent self-booking
    const selfBookingRes = await fetch(`${baseUrl}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${learnerToken}`,
      },
      body: JSON.stringify({
        providerId: '507f1f77bcf86cd799439011', // same as learner
        skillId: '507f1f77bcf86cd799439020',
        bookingDate: '2026-12-10',
        startTime: '10:00',
        endTime: '11:00',
      }),
    });
    assert(selfBookingRes.status === 400, 'POST /api/sessions blocks self-booking with HTTP 400');

    // Test 8: Create valid session request
    const createSessionRes = await fetch(`${baseUrl}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${learnerToken}`,
      },
      body: JSON.stringify({
        providerId: '507f1f77bcf86cd799439022',
        skillId: '507f1f77bcf86cd799439020',
        bookingDate: '2026-12-15',
        startTime: '14:00',
        endTime: '15:00',
        duration: 60,
        notes: 'Introductory mentoring session on Python data analysis',
      }),
    });
    const createSessionData = await createSessionRes.json();
    assert(createSessionRes.status === 201, 'POST /api/sessions creates booking with HTTP 201');
    assert(createSessionData.success === true, 'POST /api/sessions returns success: true');
    assert(createSessionData.data.status === 'REQUESTED', 'New session defaults to REQUESTED status');
    assert(createSessionData.data.creditValue === 1.0, '60-minute session correctly valued at 1.0 credit');

    // Test 9: Get user sessions list
    const listSessionsRes = await fetch(`${baseUrl}/api/sessions`, {
      headers: { Authorization: `Bearer ${learnerToken}` },
    });
    const listSessionsData = await listSessionsRes.json();
    assert(listSessionsRes.status === 200, 'GET /api/sessions returns HTTP 200');
    assert(listSessionsData.success === true, 'GET /api/sessions returns success: true');
    assert(Array.isArray(listSessionsData.data), 'GET /api/sessions returns array of sessions');

    // Test 10: Update session status to ACCEPTED
    const sessionId = createSessionData.data._id || 'demo_session_001';
    const acceptRes = await fetch(`${baseUrl}/api/sessions/${sessionId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${learnerToken}`,
      },
      body: JSON.stringify({ status: 'ACCEPTED' }),
    });
    const acceptData = await acceptRes.json();
    assert(acceptRes.status === 200, 'PUT /api/sessions/:id/status returns HTTP 200');
    assert(acceptData.success === true, 'Accepting session returns success: true');

    // Test 11: Confirm session completion
    const confirmRes = await fetch(`${baseUrl}/api/sessions/${sessionId}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${learnerToken}`,
      },
    });
    const confirmData = await confirmRes.json();
    assert(confirmRes.status === 200, 'POST /api/sessions/:id/confirm returns HTTP 200');
    assert(confirmData.success === true, 'Confirming session returns success: true');

  } catch (error) {
    console.error('Unexpected error in Phase 5 test execution:', error);
    failed++;
  } finally {
    server.close();
  }

  console.log(`\n========================================`);
  console.log(`Phase 5 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

