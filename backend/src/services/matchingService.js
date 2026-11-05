const mongoose = require('mongoose');
const {
  User,
  Skill,
  SkillOffer,
  LearningRequest,
  Availability,
} = require('../models');

// Day of week labels for explanations
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Experience level numeric weights for comparison
const EXPERIENCE_LEVELS = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
  ALL_LEVELS: 2,
};

/**
 * Extracts normalized skill IDs, names, categories, and tags from user arrays / offers / requests
 */
function extractSkillProfile(user, offers = [], requests = []) {
  const offered = [];
  const wanted = [];

  const parseSkillId = (s) => {
    if (!s) return undefined;
    if (s._id) return s._id.toString();
    if (s.id) return s.id.toString();
    if (typeof s === 'string') return s;
    return undefined;
  };

  // 1. From User document skillsOffered / skillsWanted
  if (Array.isArray(user.skillsOffered)) {
    user.skillsOffered.forEach((s) => {
      if (s) {
        offered.push({
          id: parseSkillId(s),
          name: s.name ? s.name.trim() : (typeof s === 'string' ? s : ''),
          category: s.category || '',
          tags: Array.isArray(s.tags) ? s.tags : [],
        });
      }
    });
  }

  if (Array.isArray(user.skillsWanted)) {
    user.skillsWanted.forEach((s) => {
      if (s) {
        wanted.push({
          id: parseSkillId(s),
          name: s.name ? s.name.trim() : (typeof s === 'string' ? s : ''),
          category: s.category || '',
          tags: Array.isArray(s.tags) ? s.tags : [],
        });
      }
    });
  }

  // 2. From SkillOffers
  offers.forEach((offer) => {
    const s = offer.skillId;
    if (s) {
      offered.push({
        id: parseSkillId(s),
        name: s.name ? s.name.trim() : (offer.title || ''),
        category: s.category || '',
        tags: Array.isArray(s.tags) ? s.tags : [],
        level: offer.experienceLevel || 'INTERMEDIATE',
        neighborhood: offer.neighborhood || '',
        mode: offer.learningMode || 'ONLINE',
      });
    }
  });

  // 3. From LearningRequests
  requests.forEach((req) => {
    const s = req.skillId;
    if (s) {
      wanted.push({
        id: parseSkillId(s),
        name: s.name ? s.name.trim() : (req.title || ''),
        category: s.category || '',
        tags: Array.isArray(s.tags) ? s.tags : [],
        difficulty: req.preferredDifficulty || 'ALL_LEVELS',
        neighborhood: req.neighborhood || '',
        mode: req.preferredMode || 'ONLINE',
      });
    }
  });

  return { offered, wanted };
}

/**
 * Checks skill overlap between User A's wanted skills and User B's offered skills
 * Returns { score: number, matchingSkills: string[], matchedCategories: string[] }
 */
function evaluateSkillOverlap(wantedList, offeredList) {
  let directMatches = [];
  let categoryMatches = [];

  for (const wanted of wantedList) {
    for (const offered of offeredList) {
      const idMatch = wanted.id && offered.id && wanted.id === offered.id;
      const nameMatch =
        wanted.name &&
        offered.name &&
        wanted.name.toLowerCase() === offered.name.toLowerCase();

      if (idMatch || nameMatch) {
        const skillName = offered.name || wanted.name || 'Skill';
        if (!directMatches.includes(skillName)) {
          directMatches.push(skillName);
        }
      } else if (
        (wanted.category && offered.category && wanted.category.toLowerCase() === offered.category.toLowerCase()) ||
        (Array.isArray(wanted.tags) && Array.isArray(offered.tags) && wanted.tags.some((t) => offered.tags.includes(t)))
      ) {
        const cat = offered.category || wanted.category || 'Related';
        if (!categoryMatches.includes(cat)) {
          categoryMatches.push(cat);
        }
      }
    }
  }

  if (directMatches.length > 0) {
    return { score: 40, matchingSkills: directMatches, matchedCategories: categoryMatches };
  } else if (categoryMatches.length > 0) {
    return { score: 20, matchingSkills: [], matchedCategories: categoryMatches };
  }

  return { score: 0, matchingSkills: [], matchedCategories: [] };
}

/**
 * Core mathematical compatibility calculation between two users (6-factor formula)
 * Total Score S in [0, 100]
 */
function calculateCompatibility(userA, userB, context = {}) {
  const explanations = [];

  // Extract profiles
  const profileA = extractSkillProfile(userA, context.offersA || userA.offers || [], context.requestsA || userA.requests || []);
  const profileB = extractSkillProfile(userB, context.offersB || userB.offers || [], context.requestsB || userB.requests || []);

  // 1. Skill Compatibility (Max 40 points) - Does B offer what A wants?
  const skillEval = evaluateSkillOverlap(profileA.wanted, profileB.offered);
  const skillScore = skillEval.score;

  if (skillScore === 40) {
    explanations.push(
      `Direct Match: ${userB.name || 'Partner'} offers ${skillEval.matchingSkills.join(', ')}, matching your learning goals.`
    );
  } else if (skillScore === 20) {
    explanations.push(
      `Category Match: Shares mutual focus in ${skillEval.matchedCategories.join(', ')}.`
    );
  }

  // 2. Reciprocal Exchange Bonus (Max 25 points) - Does A also offer what B wants?
  const reciprocalEval = evaluateSkillOverlap(profileB.wanted, profileA.offered);
  const isReciprocal = skillScore >= 20 && reciprocalEval.score >= 20;
  let reciprocalScore = 0;

  if (isReciprocal) {
    reciprocalScore = 25;
    const taughtSkills = reciprocalEval.matchingSkills.length > 0
      ? reciprocalEval.matchingSkills.join(', ')
      : (reciprocalEval.matchedCategories.join(', ') || 'skills');
    explanations.push(
      `⭐ Mutual Skill Swap: ${userB.name || 'Partner'} wants to learn ${taughtSkills}, which you teach! No credits needed.`
    );
  }

  // 3. Availability & Schedule Overlap (Max 15 points)
  const availA = context.availA || userA.availabilities || [];
  const availB = context.availB || userB.availabilities || [];
  let availabilityScore = 5; // Default flexible baseline
  let overlappingDays = [];

  if (availA.length > 0 && availB.length > 0) {
    const daysA = new Set(availA.map((a) => a.dayOfWeek));
    overlappingDays = availB.filter((b) => daysA.has(b.dayOfWeek)).map((b) => b.dayOfWeek);
    const uniqueDays = [...new Set(overlappingDays)];

    if (uniqueDays.length >= 3) {
      availabilityScore = 15;
      const dayNames = uniqueDays.slice(0, 3).map((d) => DAYS_OF_WEEK[d]).join(', ');
      explanations.push(`Schedule Aligned: High overlap across ${uniqueDays.length} days (${dayNames}).`);
    } else if (uniqueDays.length >= 1) {
      availabilityScore = 10;
      const dayNames = uniqueDays.map((d) => DAYS_OF_WEEK[d]).join(', ');
      explanations.push(`Schedule Aligned: Common availability on ${dayNames}.`);
    } else {
      availabilityScore = 0;
      explanations.push(`Schedule Notice: Different weekly time preferences.`);
    }
  } else {
    explanations.push(`Flexible Schedule: Compatible for flexible or asynchronous coordination.`);
  }

  // 4. Experience Level Match (Max 10 points)
  let experienceScore = 7; // Default peer balance
  const providerOffers = profileB.offered;
  const learnerRequests = profileA.wanted;

  if (providerOffers.length > 0 && learnerRequests.length > 0) {
    const provLevelStr = providerOffers[0].level || 'INTERMEDIATE';
    const learnLevelStr = learnerRequests[0].difficulty || 'ALL_LEVELS';
    const provLevel = EXPERIENCE_LEVELS[provLevelStr] || 2;
    const learnLevel = EXPERIENCE_LEVELS[learnLevelStr] || 2;

    if (provLevel >= learnLevel) {
      experienceScore = 10;
      explanations.push(`Experience Level: Strong mentor proficiency match (${provLevelStr} provider).`);
    } else if (provLevel === learnLevel - 1) {
      experienceScore = 7;
      explanations.push(`Experience Level: Peer-to-peer collaborative exchange.`);
    } else {
      experienceScore = 2;
      explanations.push(`Experience Level: Level difference (${provLevelStr} vs ${learnLevelStr}).`);
    }
  } else {
    explanations.push(`Experience Level: Balanced skill pairing.`);
  }

  // 5. Location & Neighborhood Proximity (Max 5 points)
  let locationScore = 3;
  const cityA = (userA.city || '').trim().toLowerCase();
  const cityB = (userB.city || '').trim().toLowerCase();
  const hoodA = (userA.neighborhood || '').trim().toLowerCase();
  const hoodB = (userB.neighborhood || '').trim().toLowerCase();

  const modeA = userA.preferredLearningMode || 'ONLINE';
  const modeB = userB.preferredLearningMode || 'ONLINE';

  if (hoodA && hoodB && hoodA === hoodB) {
    locationScore = 5;
    explanations.push(`Neighborhood Match: Both in ${userB.neighborhood}.`);
  } else if (cityA && cityB && cityA === cityB && cityA !== 'local community') {
    locationScore = 3;
    explanations.push(`Local Partner: Both located in ${userB.city}.`);
  } else if (modeA === 'ONLINE' || modeB === 'ONLINE' || modeA === 'HYBRID' || modeB === 'HYBRID') {
    locationScore = 4;
    explanations.push(`Remote Ready: Both accommodate online exchange.`);
  } else {
    locationScore = 0;
    explanations.push(`Location Notice: Different geographic zones.`);
  }

  // 6. Language Compatibility (Max 5 points)
  const langsA = (userA.languages || ['English']).map((l) => l.trim().toLowerCase());
  const langsB = (userB.languages || ['English']).map((l) => l.trim().toLowerCase());
  const commonLanguages = (userB.languages || ['English']).filter((l) =>
    langsA.includes(l.trim().toLowerCase())
  );

  let languageScore = 0;
  if (commonLanguages.length > 0) {
    languageScore = 5;
    explanations.push(`Languages: Both speak ${commonLanguages.join(', ')}.`);
  } else {
    languageScore = 0;
    explanations.push(`Language Notice: No common spoken languages detected.`);
  }

  // Total Score clamped strictly between 0 and 100
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      skillScore + reciprocalScore + availabilityScore + experienceScore + locationScore + languageScore
    )
  );

  return {
    score: totalScore,
    breakdown: {
      skill: skillScore,
      reciprocal: reciprocalScore,
      availability: availabilityScore,
      experience: experienceScore,
      location: locationScore,
      language: languageScore,
    },
    isReciprocal,
    matchingSkills: {
      theyTeachYou: skillEval.matchingSkills,
      youTeachThem: reciprocalEval.matchingSkills,
    },
    explanations,
    partner: {
      _id: userB._id,
      name: userB.name,
      username: userB.username,
      profilePicture: userB.profilePicture,
      bio: userB.bio,
      city: userB.city,
      neighborhood: userB.neighborhood,
      role: userB.role,
      averageRating: userB.averageRating || 5.0,
      completedSessions: userB.completedSessions || 0,
      preferredLearningMode: userB.preferredLearningMode || 'ONLINE',
      languages: userB.languages || ['English'],
    },
  };
}

/**
 * In-memory demo profiles for offline testing and initial demonstration
 */
function getDemoCandidates(userA) {
  const currentId = userA._id ? userA._id.toString() : 'demo_user_a';

  return [
    {
      _id: 'candidate_elena_001',
      name: 'Elena Rostova',
      username: 'elena_dev',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      bio: 'Full-stack software engineer & mentor. Passionate about Python, React, and Spanish conversation.',
      city: userA.city || 'San Francisco',
      neighborhood: 'Mission District',
      role: 'PROVIDER',
      averageRating: 4.95,
      completedSessions: 34,
      preferredLearningMode: 'ONLINE',
      languages: ['English', 'Spanish'],
      skillsOffered: [{ name: 'Python Programming', category: 'Technology', tags: ['python', 'coding'] }],
      skillsWanted: [{ name: 'Spanish Conversation', category: 'Language', tags: ['spanish', 'language'] }],
      offers: [{ skillId: { name: 'Python Programming', category: 'Technology' }, experienceLevel: 'EXPERT', learningMode: 'ONLINE' }],
      requests: [{ skillId: { name: 'Spanish Conversation', category: 'Language' }, preferredDifficulty: 'BEGINNER', preferredMode: 'ONLINE' }],
      availabilities: [{ dayOfWeek: 2 }, { dayOfWeek: 4 }, { dayOfWeek: 6 }],
    },
    {
      _id: 'candidate_marcus_002',
      name: 'Marcus Chen',
      username: 'marcus_guitar',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      bio: 'Classical and acoustic guitar instructor with 8 years of teaching experience. Learning digital photography.',
      city: userA.city || 'San Francisco',
      neighborhood: 'SoMa',
      role: 'PROVIDER',
      averageRating: 4.88,
      completedSessions: 22,
      preferredLearningMode: 'HYBRID',
      languages: ['English', 'Mandarin'],
      skillsOffered: [{ name: 'Acoustic Guitar', category: 'Music', tags: ['guitar', 'music'] }],
      skillsWanted: [{ name: 'Digital Photography', category: 'Art & Design', tags: ['photography'] }],
      offers: [{ skillId: { name: 'Acoustic Guitar', category: 'Music' }, experienceLevel: 'ADVANCED', learningMode: 'HYBRID' }],
      requests: [{ skillId: { name: 'Digital Photography', category: 'Art & Design' }, preferredDifficulty: 'INTERMEDIATE', preferredMode: 'HYBRID' }],
      availabilities: [{ dayOfWeek: 1 }, { dayOfWeek: 3 }, { dayOfWeek: 5 }],
    },
    {
      _id: 'candidate_sophia_003',
      name: 'Sophia Rodriguez',
      username: 'sophia_chef',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: 'Culinary arts enthusiast, home baking specialist, and organic gardening practitioner.',
      city: userA.city || 'San Francisco',
      neighborhood: 'Mission District',
      role: 'PROVIDER',
      averageRating: 4.92,
      completedSessions: 18,
      preferredLearningMode: 'IN_PERSON',
      languages: ['English', 'Spanish'],
      skillsOffered: [{ name: 'Sourdough Bread Baking', category: 'Culinary', tags: ['baking', 'cooking'] }],
      skillsWanted: [{ name: 'Python Programming', category: 'Technology', tags: ['python'] }],
      offers: [{ skillId: { name: 'Sourdough Bread Baking', category: 'Culinary' }, experienceLevel: 'EXPERT', neighborhood: 'Mission District' }],
      requests: [{ skillId: { name: 'Python Programming', category: 'Technology' }, preferredDifficulty: 'BEGINNER' }],
      availabilities: [{ dayOfWeek: 0 }, { dayOfWeek: 6 }],
    },
    {
      _id: 'candidate_alex_004',
      name: 'Alex Kim',
      username: 'alex_yoga',
      profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      bio: 'Certified Vinyasa yoga instructor and mindfulness coach. Looking to learn web design.',
      city: userA.city || 'San Francisco',
      neighborhood: 'Marina',
      role: 'PROVIDER',
      averageRating: 4.85,
      completedSessions: 15,
      preferredLearningMode: 'ONLINE',
      languages: ['English', 'Korean'],
      skillsOffered: [{ name: 'Mindfulness & Meditation', category: 'Health & Wellness', tags: ['yoga', 'meditation'] }],
      skillsWanted: [{ name: 'Graphic Design', category: 'Art & Design', tags: ['design'] }],
      offers: [{ skillId: { name: 'Mindfulness & Meditation', category: 'Health & Wellness' }, experienceLevel: 'ADVANCED' }],
      requests: [{ skillId: { name: 'Graphic Design', category: 'Art & Design' }, preferredDifficulty: 'BEGINNER' }],
      availabilities: [{ dayOfWeek: 2 }, { dayOfWeek: 4 }],
    },
  ].filter((c) => c._id !== currentId);
}

/**
 * Finds and ranks matching partners for a given user
 */
async function findMatchesForUser(userId, options = {}) {
  const { minScore = 20, reciprocalOnly = false, limit = 20, page = 1 } = options;
  const isConnected = mongoose.connection.readyState === 1;

  let userA = null;
  let offersA = [];
  let requestsA = [];
  let availA = [];
  let candidates = [];

  if (isConnected) {
    try {
      userA = await User.findById(userId)
        .populate('skillsOffered')
        .populate('skillsWanted')
        .lean();

      if (userA) {
        [offersA, requestsA, availA] = await Promise.all([
          SkillOffer.find({ providerId: userId, status: 'ACTIVE' }).populate('skillId').lean(),
          LearningRequest.find({ learnerId: userId, status: 'OPEN' }).populate('skillId').lean(),
          Availability.find({ userId, isActive: true }).lean(),
        ]);

        // Query candidate users excluding self
        const candidateUsers = await User.find({ _id: { $ne: userId }, isActive: true })
          .populate('skillsOffered')
          .populate('skillsWanted')
          .lean();

        if (candidateUsers.length > 0) {
          const candidateIds = candidateUsers.map((u) => u._id);
          const [allOffers, allRequests, allAvail] = await Promise.all([
            SkillOffer.find({ providerId: { $in: candidateIds }, status: 'ACTIVE' }).populate('skillId').lean(),
            LearningRequest.find({ learnerId: { $in: candidateIds }, status: 'OPEN' }).populate('skillId').lean(),
            Availability.find({ userId: { $in: candidateIds }, isActive: true }).lean(),
          ]);

          candidates = candidateUsers.map((u) => {
            const uIdStr = u._id.toString();
            return {
              ...u,
              offers: allOffers.filter((o) => o.providerId.toString() === uIdStr),
              requests: allRequests.filter((r) => r.learnerId.toString() === uIdStr),
              availabilities: allAvail.filter((a) => a.userId.toString() === uIdStr),
            };
          });
        }
      }
    } catch (err) {
      console.warn('MatchingService DB query notice:', err.message);
    }
  }

  // Fallback to demo profile if userA wasn't found or DB is offline
  if (!userA) {
    userA = {
      _id: userId || 'demo_user_a',
      name: 'Current User',
      username: 'current_user',
      city: 'San Francisco',
      neighborhood: 'Mission District',
      preferredLearningMode: 'ONLINE',
      languages: ['English', 'Spanish'],
      skillsOffered: [{ name: 'Spanish Conversation', category: 'Language', tags: ['spanish', 'language'] }],
      skillsWanted: [{ name: 'Python Programming', category: 'Technology', tags: ['python', 'coding'] }],
      offers: [{ skillId: { name: 'Spanish Conversation', category: 'Language' }, experienceLevel: 'EXPERT' }],
      requests: [{ skillId: { name: 'Python Programming', category: 'Technology' }, preferredDifficulty: 'BEGINNER' }],
      availabilities: [{ dayOfWeek: 2 }, { dayOfWeek: 4 }, { dayOfWeek: 6 }],
    };
  }

  // If candidate pool from DB is empty, use rich demo candidates to guarantee results
  if (candidates.length === 0) {
    candidates = getDemoCandidates(userA);
  }

  // Calculate compatibility for each candidate
  const contextA = { offersA, requestsA, availA };
  let matches = candidates.map((candidate) => {
    return calculateCompatibility(userA, candidate, {
      ...contextA,
      offersB: candidate.offers || [],
      requestsB: candidate.requests || [],
      availB: candidate.availabilities || [],
    });
  });

  // Filter by minScore
  matches = matches.filter((m) => m.score >= Number(minScore));

  // Filter if reciprocalOnly requested
  if (reciprocalOnly === true || reciprocalOnly === 'true') {
    matches = matches.filter((m) => m.isReciprocal);
  }

  // Sort descending by score, prioritizing reciprocal matches
  matches.sort((a, b) => {
    if (a.isReciprocal !== b.isReciprocal) {
      return a.isReciprocal ? -1 : 1;
    }
    return b.score - a.score;
  });

  // Pagination
  const total = matches.length;
  const skip = (Number(page) - 1) * Number(limit);
  const paginatedMatches = matches.slice(skip, skip + Number(limit));

  return {
    matches: paginatedMatches,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)) || 1,
      reciprocalCount: matches.filter((m) => m.isReciprocal).length,
    },
  };
}

/**
 * Finds only reciprocal matches for a user
 */
async function findReciprocalMatches(userId, options = {}) {
  return findMatchesForUser(userId, { ...options, reciprocalOnly: true });
}

/**
 * Detailed pairwise compatibility breakdown between two specific users
 */
async function getPairwiseDetail(userId, partnerId) {
  const isConnected = mongoose.connection.readyState === 1;
  let userA = null;
  let userB = null;

  if (isConnected) {
    try {
      [userA, userB] = await Promise.all([
        User.findById(userId).populate('skillsOffered').populate('skillsWanted').lean(),
        User.findById(partnerId).populate('skillsOffered').populate('skillsWanted').lean(),
      ]);

      if (userA && userB) {
        const [offersA, requestsA, availA, offersB, requestsB, availB] = await Promise.all([
          SkillOffer.find({ providerId: userId, status: 'ACTIVE' }).populate('skillId').lean(),
          LearningRequest.find({ learnerId: userId, status: 'OPEN' }).populate('skillId').lean(),
          Availability.find({ userId, isActive: true }).lean(),
          SkillOffer.find({ providerId: partnerId, status: 'ACTIVE' }).populate('skillId').lean(),
          LearningRequest.find({ learnerId: partnerId, status: 'OPEN' }).populate('skillId').lean(),
          Availability.find({ userId: partnerId, isActive: true }).lean(),
        ]);

        return calculateCompatibility(userA, userB, {
          offersA,
          requestsA,
          availA,
          offersB,
          requestsB,
          availB,
        });
      }
    } catch (err) {
      console.warn('Pairwise DB query notice:', err.message);
    }
  }

  // Offline / Demo fallback
  const fallbackUserA = {
    _id: userId,
    name: 'Current User',
    city: 'San Francisco',
    neighborhood: 'Mission District',
    preferredLearningMode: 'ONLINE',
    languages: ['English', 'Spanish'],
    skillsOffered: [{ name: 'Spanish Conversation', category: 'Language' }],
    skillsWanted: [{ name: 'Python Programming', category: 'Technology' }],
    availabilities: [{ dayOfWeek: 2 }, { dayOfWeek: 4 }],
  };

  const demoCandidates = getDemoCandidates(fallbackUserA);
  const matchedCandidate = demoCandidates.find((c) => c._id.toString() === partnerId.toString()) || demoCandidates[0];

  return calculateCompatibility(fallbackUserA, matchedCandidate);
}

module.exports = {
  calculateCompatibility,
  findMatchesForUser,
  findReciprocalMatches,
  getPairwiseDetail,
  extractSkillProfile,
  evaluateSkillOverlap,
};
