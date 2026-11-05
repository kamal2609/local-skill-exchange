const http = require('http');
const app = require('../src/app');
const generateToken = require('../src/utils/generateToken');
const {
  calculateCompatibility,
  evaluateSkillOverlap,
} = require('../src/services/matchingService');

async function runTests() {
  console.log('--- Starting Phase 4 Verification Suite: Smart Skill Matching Engine ⭐ ---');
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
    // UNIT TESTS: Mathematical Matching Engine (6 Dimensions)
    // -------------------------------------------------------------
    console.log('\n--- Wave 1: Formula & Mathematical Scoring Tests ---');

    // Unit 1: Direct Skill Match gives 40 points
    const userA_direct = {
      _id: 'user_a_1',
      name: 'Alice',
      skillsWanted: [{ name: 'Python Programming', category: 'Technology' }],
      skillsOffered: [],
      languages: ['English'],
    };
    const userB_direct = {
      _id: 'user_b_1',
      name: 'Bob',
      skillsOffered: [{ name: 'Python Programming', category: 'Technology' }],
      skillsWanted: [],
      languages: ['English'],
    };
    const match1 = calculateCompatibility(userA_direct, userB_direct);
    assert(match1.breakdown.skill === 40, 'Direct skill match awards exactly 40 points');
    assert(match1.breakdown.reciprocal === 0, 'One-way match awards 0 reciprocal bonus');
    assert(match1.isReciprocal === false, 'isReciprocal is false for one-way match');

    // Unit 2: Reciprocal Skill Swap gives 25 points bonus
    const userA_reciprocal = {
      _id: 'user_a_2',
      name: 'Alice',
      skillsWanted: [{ name: 'Python Programming', category: 'Technology' }],
      skillsOffered: [{ name: 'Spanish Conversation', category: 'Language' }],
      languages: ['English'],
    };
    const userB_reciprocal = {
      _id: 'user_b_2',
      name: 'Elena',
      skillsOffered: [{ name: 'Python Programming', category: 'Technology' }],
      skillsWanted: [{ name: 'Spanish Conversation', category: 'Language' }],
      languages: ['English'],
    };
    const match2 = calculateCompatibility(userA_reciprocal, userB_reciprocal);
    assert(match2.breakdown.skill === 40, 'Skill score is 40 points for direct match');
    assert(match2.breakdown.reciprocal === 25, 'Reciprocal match awards 25-point barter bonus');
    assert(match2.isReciprocal === true, 'isReciprocal flag is true for mutual barter');
    assert(match2.matchingSkills.theyTeachYou.includes('Python Programming'), 'theyTeachYou tracks Elena teaching Python');
    assert(match2.matchingSkills.youTeachThem.includes('Spanish Conversation'), 'youTeachThem tracks Alice teaching Spanish');

    // Unit 3: Category match fallback awards 20 points
    const userA_cat = {
      _id: 'user_a_3',
      name: 'Alice',
      skillsWanted: [{ name: 'Machine Learning', category: 'Technology' }],
      skillsOffered: [],
      languages: ['English'],
    };
    const userB_cat = {
      _id: 'user_b_3',
      name: 'Charlie',
      skillsOffered: [{ name: 'Web Development', category: 'Technology' }],
      skillsWanted: [],
      languages: ['English'],
    };
    const match3 = calculateCompatibility(userA_cat, userB_cat);
    assert(match3.breakdown.skill === 20, 'Category match awards 20 points');

    // Unit 4: Language scoring awards 5 points for common language, 0 for disjoint
    const userA_lang = {
      _id: 'user_a_4',
      languages: ['Spanish'],
      skillsWanted: [],
      skillsOffered: [],
    };
    const userB_lang_same = {
      _id: 'user_b_4a',
      languages: ['Spanish', 'French'],
      skillsWanted: [],
      skillsOffered: [],
    };
    const userB_lang_diff = {
      _id: 'user_b_4b',
      languages: ['German'],
      skillsWanted: [],
      skillsOffered: [],
    };
    const matchLangSame = calculateCompatibility(userA_lang, userB_lang_same);
    const matchLangDiff = calculateCompatibility(userA_lang, userB_lang_diff);
    assert(matchLangSame.breakdown.language === 5, 'Shared language awards 5 points');
    assert(matchLangDiff.breakdown.language === 0, 'Disjoint language awards 0 points');

    // Unit 5: Location scoring (5 for neighborhood, 3 for city, 4 for remote)
    const userA_loc = {
      _id: 'user_a_5',
      city: 'San Francisco',
      neighborhood: 'Mission',
      preferredLearningMode: 'IN_PERSON',
      skillsWanted: [],
      skillsOffered: [],
      languages: ['English'],
    };
    const userB_loc_hood = {
      _id: 'user_b_5a',
      city: 'San Francisco',
      neighborhood: 'Mission',
      preferredLearningMode: 'IN_PERSON',
      skillsWanted: [],
      skillsOffered: [],
      languages: ['English'],
    };
    const userB_loc_city = {
      _id: 'user_b_5b',
      city: 'San Francisco',
      neighborhood: 'Marina',
      preferredLearningMode: 'IN_PERSON',
      skillsWanted: [],
      skillsOffered: [],
      languages: ['English'],
    };
    const matchLocHood = calculateCompatibility(userA_loc, userB_loc_hood);
    const matchLocCity = calculateCompatibility(userA_loc, userB_loc_city);
    assert(matchLocHood.breakdown.location === 5, 'Same neighborhood awards 5 points');
    assert(matchLocCity.breakdown.location === 3, 'Same city awards 3 points');

    // Unit 6: Score bounds: Score is strictly clamped between 0 and 100
    assert(match2.score >= 0 && match2.score <= 100, `Score is within [0, 100] (actual: ${match2.score})`);
    assert(Array.isArray(match2.explanations) && match2.explanations.length > 0, 'Generates human-readable explanations');

    // -------------------------------------------------------------
    // INTEGRATION TESTS: REST API Endpoints (Wave 2)
    // -------------------------------------------------------------
    console.log('\n--- Wave 2: REST API Endpoints & Auth Guard Tests ---');

    // Test 1: API Discovery includes /api/matches
    const rootRes = await fetch(`${baseUrl}/api`);
    const rootData = await rootRes.json();
    assert(rootRes.status === 200, 'GET /api returns HTTP 200');
    assert(rootData.endpoints.matches === '/api/matches', 'GET /api registers /api/matches endpoint');

    // Test 2: Unauthenticated GET /api/matches returns HTTP 401
    const unauthMatchesRes = await fetch(`${baseUrl}/api/matches`);
    assert(unauthMatchesRes.status === 401, 'GET /api/matches without token returns HTTP 401');

    // Test 3: Authenticated GET /api/matches returns HTTP 200 and matches list
    const testToken = generateToken('507f1f77bcf86cd799439011', 'LEARNER');
    const authMatchesRes = await fetch(`${baseUrl}/api/matches`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    const authMatchesData = await authMatchesRes.json();
    assert(authMatchesRes.status === 200, 'GET /api/matches with token returns HTTP 200');
    assert(authMatchesData.success === true, 'GET /api/matches returns success: true');
    assert(Array.isArray(authMatchesData.data), 'GET /api/matches returns data array');
    assert(authMatchesData.data.length > 0, 'GET /api/matches returns non-empty candidate list');

    // Test 4: Each match has score, breakdown, explanations, and partner info
    const firstMatch = authMatchesData.data[0];
    assert(typeof firstMatch.score === 'number', 'Match item has numeric score');
    assert(typeof firstMatch.breakdown === 'object', 'Match item has breakdown object');
    assert(typeof firstMatch.isReciprocal === 'boolean', 'Match item has isReciprocal boolean');
    assert(Array.isArray(firstMatch.explanations), 'Match item has explanations array');
    assert(typeof firstMatch.partner === 'object', 'Match item has partner object');

    // Test 5: GET /api/matches/reciprocal returns only reciprocal matches
    const recipRes = await fetch(`${baseUrl}/api/matches/reciprocal`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    const recipData = await recipRes.json();
    assert(recipRes.status === 200, 'GET /api/matches/reciprocal returns HTTP 200');
    assert(recipData.success === true, 'GET /api/matches/reciprocal returns success: true');
    assert(
      recipData.data.every((m) => m.isReciprocal === true),
      'GET /api/matches/reciprocal contains only isReciprocal: true matches'
    );

    // Test 6: GET /api/matches/:partnerId returns pairwise comparison
    const partnerId = firstMatch.partner._id;
    const detailRes = await fetch(`${baseUrl}/api/matches/${partnerId}`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    const detailData = await detailRes.json();
    assert(detailRes.status === 200, 'GET /api/matches/:partnerId returns HTTP 200');
    assert(detailData.success === true, 'Pairwise match detail returns success: true');
    assert(typeof detailData.data.score === 'number', 'Pairwise match detail has numeric score');

    // Test 7: GET /api/matches/:partnerId rejects self-comparison
    const selfRes = await fetch(`${baseUrl}/api/matches/507f1f77bcf86cd799439011`, {
      headers: { Authorization: `Bearer ${testToken}` },
    });
    assert(selfRes.status === 400, 'GET /api/matches with self ID returns HTTP 400');

  } catch (error) {
    console.error('Unexpected error in Phase 4 test execution:', error);
    failed++;
  } finally {
    server.close();
  }

  console.log(`\n========================================`);
  console.log(`Phase 4 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

