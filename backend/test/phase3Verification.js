const http = require('http');
const app = require('../src/app');
const generateToken = require('../src/utils/generateToken');

async function runTests() {
  console.log('--- Starting Phase 3 Verification Suite ---');
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
    // Test 1: API root discovery includes skills, offers, and requests endpoints
    const rootRes = await fetch(`${baseUrl}/api`);
    const rootData = await rootRes.json();
    assert(rootRes.status === 200, 'GET /api returns HTTP 200');
    assert(rootData.endpoints.skills === '/api/skills', 'GET /api lists /api/skills endpoint');
    assert(rootData.endpoints.offers === '/api/offers', 'GET /api lists /api/offers endpoint');
    assert(rootData.endpoints.requests === '/api/requests', 'GET /api lists /api/requests endpoint');

    // Test 2: Public skills list endpoint returns HTTP 200
    const skillsRes = await fetch(`${baseUrl}/api/skills`);
    const skillsData = await skillsRes.json();
    assert(skillsRes.status === 200, 'GET /api/skills returns HTTP 200');
    assert(skillsData.success === true, 'GET /api/skills returns success: true');
    assert(Array.isArray(skillsData.data), 'GET /api/skills returns data array');

    // Test 3: Unauthenticated skill creation is blocked
    const unauthSkillRes = await fetch(`${baseUrl}/api/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Skill', category: 'Technology', description: 'Sample description' }),
    });
    assert(unauthSkillRes.status === 401, 'POST /api/skills without token returns HTTP 401');

    // Test 4: Skill validation rejects invalid payload
    const token = generateToken('507f1f77bcf86cd799439011', 'PROVIDER');
    const invalidSkillRes = await fetch(`${baseUrl}/api/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: 'A', category: 'InvalidCategory', description: 'short' }),
    });
    const invalidSkillData = await invalidSkillRes.json();
    assert(invalidSkillRes.status === 400, 'POST /api/skills with invalid data returns HTTP 400');
    assert(invalidSkillData.success === false, 'POST /api/skills returns success: false on validation error');
    assert(Array.isArray(invalidSkillData.errors), 'POST /api/skills returns Zod validation error details');

    // Test 5: Public offers list endpoint returns HTTP 200
    const offersRes = await fetch(`${baseUrl}/api/offers`);
    const offersData = await offersRes.json();
    assert(offersRes.status === 200, 'GET /api/offers returns HTTP 200');
    assert(offersData.success === true, 'GET /api/offers returns success: true');
    assert(Array.isArray(offersData.data), 'GET /api/offers returns data array');

    // Test 6: Unauthenticated offer creation is blocked
    const unauthOfferRes = await fetch(`${baseUrl}/api/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillId: '507f1f77bcf86cd799439011', description: 'Teaching basics' }),
    });
    assert(unauthOfferRes.status === 401, 'POST /api/offers without token returns HTTP 401');

    // Test 7: Offer validation rejects invalid payload
    const invalidOfferRes = await fetch(`${baseUrl}/api/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ skillId: 'not-valid-id', description: 'short' }),
    });
    assert(invalidOfferRes.status === 400, 'POST /api/offers with invalid format returns HTTP 400');

    // Test 8: Public requests list endpoint returns HTTP 200
    const requestsRes = await fetch(`${baseUrl}/api/requests`);
    const requestsData = await requestsRes.json();
    assert(requestsRes.status === 200, 'GET /api/requests returns HTTP 200');
    assert(requestsData.success === true, 'GET /api/requests returns success: true');
    assert(Array.isArray(requestsData.data), 'GET /api/requests returns data array');

    // Test 9: Unauthenticated request creation is blocked
    const unauthRequestRes = await fetch(`${baseUrl}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillId: '507f1f77bcf86cd799439011', title: 'Learn Python', description: 'Beginner' }),
    });
    assert(unauthRequestRes.status === 401, 'POST /api/requests without token returns HTTP 401');

    // Test 10: Request validation rejects invalid payload
    const invalidRequestRes = await fetch(`${baseUrl}/api/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ skillId: 'bad-id', title: 'A', description: 'too-short' }),
    });
    assert(invalidRequestRes.status === 400, 'POST /api/requests with invalid format returns HTTP 400');

    console.log(`\nPhase 3 API Verification Complete: ${passed} passed, ${failed} failed.`);
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
