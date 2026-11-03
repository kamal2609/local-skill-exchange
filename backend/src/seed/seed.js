require('dotenv').config();
const mongoose = require('mongoose');
const {
  User,
  Skill,
  SkillOffer,
  LearningRequest,
  Availability,
  Session,
  CreditTransaction,
  Review,
  Conversation,
  Message,
  Notification,
  Report,
} = require('../models');

const connectDB = require('../config/db');

const seedData = async () => {
  try {
    console.log('🌱 Starting Local Skill Exchange database seed...');
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️  MongoDB is not connected. Seed script requires an active MongoDB instance.');
      console.log('💡 Ensure MongoDB is running locally (mongodb://127.0.0.1:27017) or set MONGODB_URI in backend/.env');
      process.exit(0);
    }

    // Clear existing data safely
    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Skill.deleteMany({}),
      SkillOffer.deleteMany({}),
      LearningRequest.deleteMany({}),
      Availability.deleteMany({}),
      Session.deleteMany({}),
      CreditTransaction.deleteMany({}),
      Review.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({}),
      Report.deleteMany({}),
    ]);

    // 1. Seed Skills (16 diverse skills across 6 categories)
    console.log('📚 Seeding skill catalog...');
    const skillsData = [
      {
        name: 'Python Programming',
        category: 'Technology',
        description: 'Learn foundational Python syntax, data structures, scripting, and automation.',
        difficulty: 'BEGINNER',
        tags: ['coding', 'python', 'scripting', 'backend'],
        icon: 'Code',
        popularity: 95,
      },
      {
        name: 'TypeScript & React Web Architecture',
        category: 'Technology',
        description: 'Modern frontend development with TypeScript, React 19, hooks, and clean component architecture.',
        difficulty: 'INTERMEDIATE',
        tags: ['react', 'typescript', 'frontend', 'web'],
        icon: 'Laptop',
        popularity: 90,
      },
      {
        name: 'Web Fundamentals (HTML/CSS)',
        category: 'Technology',
        description: 'Semantic HTML5, CSS Flexbox/Grid, and responsive layout foundations.',
        difficulty: 'BEGINNER',
        tags: ['html', 'css', 'web'],
        icon: 'Layout',
        popularity: 75,
      },
      {
        name: 'Linux & Command Line Basics',
        category: 'Technology',
        description: 'Master bash navigation, package managers, permissions, and shell scripting.',
        difficulty: 'INTERMEDIATE',
        tags: ['linux', 'bash', 'terminal'],
        icon: 'Terminal',
        popularity: 70,
      },
      {
        name: 'UI/UX Design with Figma',
        category: 'Design',
        description: 'Wireframing, auto-layout, design systems, and clickable prototypes in Figma.',
        difficulty: 'INTERMEDIATE',
        tags: ['figma', 'ui', 'ux', 'design'],
        icon: 'Palette',
        popularity: 88,
      },
      {
        name: 'Acoustic Guitar & Open Chords',
        category: 'Creative',
        description: 'Fingerpicking fundamentals, rhythm strumming, and classic song accompaniment.',
        difficulty: 'BEGINNER',
        tags: ['music', 'guitar', 'instrument'],
        icon: 'Music',
        popularity: 85,
      },
      {
        name: 'Classical Piano & Music Theory',
        category: 'Creative',
        description: 'Sheet music reading, two-hand coordination, scales, and basic chord progression theory.',
        difficulty: 'INTERMEDIATE',
        tags: ['piano', 'music', 'theory'],
        icon: 'Music2',
        popularity: 80,
      },
      {
        name: 'Oil Painting & Color Mixing',
        category: 'Creative',
        description: 'Canvas preparation, brush technique, glazing, and composition for still life and landscape.',
        difficulty: 'ALL_LEVELS',
        tags: ['art', 'painting', 'creative'],
        icon: 'Brush',
        popularity: 65,
      },
      {
        name: 'Conversational Spanish',
        category: 'Academic',
        description: 'Natural spoken dialogue, essential idioms, travel vocabulary, and everyday pronunciation.',
        difficulty: 'BEGINNER',
        tags: ['spanish', 'language', 'speaking'],
        icon: 'MessageSquare',
        popularity: 92,
      },
      {
        name: 'French for Beginners',
        category: 'Academic',
        description: 'French grammar essentials, phonetics, formal/informal greetings, and dining etiquette.',
        difficulty: 'BEGINNER',
        tags: ['french', 'language'],
        icon: 'Globe',
        popularity: 78,
      },
      {
        name: 'Sourdough Bread Baking',
        category: 'Lifestyle',
        description: 'Wild yeast starter maintenance, autolyse, stretch-and-fold techniques, and Dutch oven baking.',
        difficulty: 'INTERMEDIATE',
        tags: ['baking', 'cooking', 'sourdough'],
        icon: 'Utensils',
        popularity: 86,
      },
      {
        name: 'Artisan Pastry & Croissants',
        category: 'Lifestyle',
        description: 'Butter lamination, dough proofing, shaping, and achieving flaky French pastries.',
        difficulty: 'ADVANCED',
        tags: ['pastry', 'baking', 'culinary'],
        icon: 'Coffee',
        popularity: 72,
      },
      {
        name: 'Vinyasa Yoga & Breathwork',
        category: 'Lifestyle',
        description: 'Dynamic flowing sequences, breath synchronization (pranayama), and core stability.',
        difficulty: 'ALL_LEVELS',
        tags: ['yoga', 'fitness', 'wellness'],
        icon: 'Heart',
        popularity: 84,
      },
      {
        name: 'Bicycle Maintenance & Tune-up',
        category: 'Other',
        description: 'Derailleur adjustment, brake bleeding, flat tire repair, and chain lubrication.',
        difficulty: 'BEGINNER',
        tags: ['bicycle', 'repair', 'diy', 'mechanics'],
        icon: 'Wrench',
        popularity: 82,
      },
      {
        name: 'Basic Home Carpentry',
        category: 'Other',
        description: 'Hand tool safety, accurate measuring, wood joining techniques, and floating shelf building.',
        difficulty: 'INTERMEDIATE',
        tags: ['woodworking', 'carpentry', 'diy'],
        icon: 'Hammer',
        popularity: 74,
      },
      {
        name: 'Urban Balcony Gardening',
        category: 'Lifestyle',
        description: 'Container vegetable growing, organic pest control, and compact composting.',
        difficulty: 'BEGINNER',
        tags: ['gardening', 'plants', 'organic'],
        icon: 'Sprout',
        popularity: 79,
      },
    ];

    const createdSkills = await Skill.insertMany(skillsData);
    const skillMap = {};
    createdSkills.forEach((s) => {
      skillMap[s.name] = s;
    });

    // 2. Seed Users (1 Admin + 5 Community members)
    console.log('👥 Seeding users with hashed passwords and starter credits...');
    const defaultPassword = 'password123';
    const passwordHash = await User.hashPassword(defaultPassword);

    const usersData = [
      {
        name: 'Community Admin',
        username: 'admin',
        email: 'admin@skills.local',
        passwordHash,
        bio: 'Local Skill Exchange coordinator. Here to keep the community safe, welcoming, and egalitarian.',
        city: 'Brooklyn, NY',
        role: 'ADMIN',
        creditsBalance: 10.0,
        isVerified: true,
      },
      {
        name: 'Elena Rostova',
        username: 'elena_music',
        email: 'elena.rostova@skills.local',
        passwordHash,
        bio: 'Classically trained musician and avid painter. Passionate about sharing music and learning web coding to build an interactive audio art portfolio.',
        city: 'Brooklyn, NY',
        preferredLearningMode: 'IN_PERSON',
        languages: ['English', 'Russian'],
        skillsOffered: [
          skillMap['Acoustic Guitar & Open Chords']._id,
          skillMap['Classical Piano & Music Theory']._id,
          skillMap['Oil Painting & Color Mixing']._id,
        ],
        skillsWanted: [skillMap['Python Programming']._id, skillMap['TypeScript & React Web Architecture']._id],
        role: 'PROVIDER',
        creditsBalance: 4.0, // earned 1 credit in sample session
        completedSessions: 1,
        averageRating: 5.0,
        isVerified: true,
      },
      {
        name: 'Marcus Chen',
        username: 'marcus_code',
        email: 'marcus.chen@skills.local',
        passwordHash,
        bio: 'Full-stack software developer by day. Looking to improve conversational Spanish for upcoming community volunteering and learn guitar.',
        city: 'Queens, NY',
        preferredLearningMode: 'ONLINE',
        languages: ['English', 'Mandarin'],
        skillsOffered: [
          skillMap['Python Programming']._id,
          skillMap['TypeScript & React Web Architecture']._id,
          skillMap['Linux & Command Line Basics']._id,
        ],
        skillsWanted: [skillMap['Conversational Spanish']._id, skillMap['Acoustic Guitar & Open Chords']._id],
        role: 'PROVIDER',
        creditsBalance: 2.0, // spent 1 credit in sample session
        completedSessions: 1,
        averageRating: 5.0,
        isVerified: true,
      },
      {
        name: 'Sarah Jenkins',
        username: 'sarah_bakes',
        email: 'sarah.jenkins@skills.local',
        passwordHash,
        bio: 'Artisan baker with 7 years of wild fermentation experience. Excited to teach sourdough techniques in exchange for balcony gardening and bicycle repair advice.',
        city: 'Manhattan, NY',
        preferredLearningMode: 'IN_PERSON',
        languages: ['English'],
        skillsOffered: [
          skillMap['Sourdough Bread Baking']._id,
          skillMap['Artisan Pastry & Croissants']._id,
        ],
        skillsWanted: [skillMap['Urban Balcony Gardening']._id, skillMap['Bicycle Maintenance & Tune-up']._id],
        role: 'PROVIDER',
        creditsBalance: 3.0,
        completedSessions: 0,
        averageRating: 5.0,
        isVerified: true,
      },
      {
        name: 'David Miller',
        username: 'david_diy',
        email: 'david.miller@skills.local',
        passwordHash,
        bio: 'Hands-on bicycle mechanic and hobby woodworker. Eager to help neighbors fix their bikes and build custom shelves, while learning yoga for posture and flexibility.',
        city: 'Brooklyn, NY',
        preferredLearningMode: 'IN_PERSON',
        languages: ['English'],
        skillsOffered: [
          skillMap['Bicycle Maintenance & Tune-up']._id,
          skillMap['Basic Home Carpentry']._id,
        ],
        skillsWanted: [skillMap['Vinyasa Yoga & Breathwork']._id, skillMap['Sourdough Bread Baking']._id],
        role: 'PROVIDER',
        creditsBalance: 3.0,
        completedSessions: 0,
        averageRating: 5.0,
        isVerified: true,
      },
      {
        name: 'Maya Patel',
        username: 'maya_yoga',
        email: 'maya.patel@skills.local',
        passwordHash,
        bio: 'Certified yoga instructor and native Spanish speaker. I love community wellness and want to learn conversational French and Figma design.',
        city: 'Manhattan, NY',
        preferredLearningMode: 'HYBRID',
        languages: ['English', 'Spanish', 'Hindi'],
        skillsOffered: [
          skillMap['Conversational Spanish']._id,
          skillMap['Vinyasa Yoga & Breathwork']._id,
        ],
        skillsWanted: [skillMap['French for Beginners']._id, skillMap['UI/UX Design with Figma']._id],
        role: 'PROVIDER',
        creditsBalance: 3.0,
        completedSessions: 0,
        averageRating: 5.0,
        isVerified: true,
      },
    ];

    const createdUsers = await User.insertMany(usersData);
    const userMap = {};
    createdUsers.forEach((u) => {
      userMap[u.username] = u;
    });

    // 3. Seed Skill Offers
    console.log('🤝 Seeding skill offers...');
    const offersData = [
      {
        providerId: userMap['elena_music']._id,
        skillId: skillMap['Acoustic Guitar & Open Chords']._id,
        description: 'Patient 1-on-1 guitar lessons tailored for beginners. We cover finger posture, the four foundational open chords (G, C, Em, D), and simple strumming patterns.',
        experienceLevel: 'ADVANCED',
        teachingLanguage: 'English',
        learningMode: 'IN_PERSON',
        sessionDuration: 60,
        neighborhood: 'Brooklyn (Park Slope)',
        teachingApproach: 'Gentle, structured, hands-on practice with sheet tabs provided.',
        status: 'ACTIVE',
      },
      {
        providerId: userMap['elena_music']._id,
        skillId: skillMap['Classical Piano & Music Theory']._id,
        description: 'Explore the keyboard, note reading, and classical miniatures. Open to complete novices or returning students.',
        experienceLevel: 'EXPERT',
        teachingLanguage: 'English',
        learningMode: 'IN_PERSON',
        sessionDuration: 60,
        neighborhood: 'Brooklyn (Park Slope)',
        status: 'ACTIVE',
      },
      {
        providerId: userMap['marcus_code']._id,
        skillId: skillMap['Python Programming']._id,
        description: 'Interactive Python coding sessions. Learn how to write clean functions, process CSV data, or build simple web scrapers.',
        experienceLevel: 'EXPERT',
        teachingLanguage: 'English',
        learningMode: 'ONLINE',
        sessionDuration: 60,
        neighborhood: 'Queens (Astoria)',
        teachingApproach: 'Live pair programming over Zoom / Google Meet with code reviews.',
        status: 'ACTIVE',
      },
      {
        providerId: userMap['marcus_code']._id,
        skillId: skillMap['TypeScript & React Web Architecture']._id,
        description: 'Level up your web frontend skills. We will review component patterns, state management, and TypeScript typing best practices.',
        experienceLevel: 'ADVANCED',
        teachingLanguage: 'English',
        learningMode: 'ONLINE',
        sessionDuration: 60,
        neighborhood: 'Queens (Astoria)',
        status: 'ACTIVE',
      },
      {
        providerId: userMap['sarah_bakes']._id,
        skillId: skillMap['Sourdough Bread Baking']._id,
        description: 'Bake your first crusty artisan loaf from scratch! I will bring active starter and walk you through mixing, stretch & fold, and shaping.',
        experienceLevel: 'ADVANCED',
        teachingLanguage: 'English',
        learningMode: 'IN_PERSON',
        sessionDuration: 90,
        neighborhood: 'Manhattan (Upper West Side)',
        status: 'ACTIVE',
      },
      {
        providerId: userMap['david_diy']._id,
        skillId: skillMap['Bicycle Maintenance & Tune-up']._id,
        description: 'Stop paying expensive bike shop fees. Bring your bicycle and learn how to index your gears, align disc brakes, and fix chain skips.',
        experienceLevel: 'EXPERT',
        teachingLanguage: 'English',
        learningMode: 'IN_PERSON',
        sessionDuration: 60,
        neighborhood: 'Brooklyn (Williamsburg)',
        status: 'ACTIVE',
      },
      {
        providerId: userMap['david_diy']._id,
        skillId: skillMap['Basic Home Carpentry']._id,
        description: 'Learn how to use power drills, stud finders, and saws safely to mount floating shelves or repair furniture.',
        experienceLevel: 'INTERMEDIATE',
        teachingLanguage: 'English',
        learningMode: 'IN_PERSON',
        sessionDuration: 60,
        neighborhood: 'Brooklyn (Williamsburg)',
        status: 'ACTIVE',
      },
      {
        providerId: userMap['maya_yoga']._id,
        skillId: skillMap['Conversational Spanish']._id,
        description: 'Immersive Spanish conversation practice. Focus on building speaking confidence, everyday phrasing, and colloquial idioms.',
        experienceLevel: 'EXPERT',
        teachingLanguage: 'Spanish',
        learningMode: 'ONLINE',
        sessionDuration: 60,
        neighborhood: 'Manhattan',
        status: 'ACTIVE',
      },
      {
        providerId: userMap['maya_yoga']._id,
        skillId: skillMap['Vinyasa Yoga & Breathwork']._id,
        description: 'A calming yet energizing 60-minute flow focused on spinal alignment, breath awareness, and gentle hip openers.',
        experienceLevel: 'EXPERT',
        teachingLanguage: 'English',
        learningMode: 'HYBRID',
        sessionDuration: 60,
        neighborhood: 'Manhattan',
        status: 'ACTIVE',
      },
    ];

    await SkillOffer.insertMany(offersData);

    // 4. Seed Learning Requests
    console.log('📝 Seeding learning requests...');
    const requestsData = [
      {
        learnerId: userMap['elena_music']._id,
        skillId: skillMap['Python Programming']._id,
        title: 'Looking for Python mentor to analyze MIDI and audio files',
        description: 'I want to write a simple script that reads MIDI notes and converts them into frequency tables. Need someone patient to guide me through basic syntax.',
        preferredDifficulty: 'BEGINNER',
        preferredDuration: 60,
        preferredMode: 'ONLINE',
        preferredSchedule: 'Tuesday or Thursday evenings',
        status: 'OPEN',
      },
      {
        learnerId: userMap['marcus_code']._id,
        skillId: skillMap['Conversational Spanish']._id,
        title: 'Practicing Spanish for trip to Latin America',
        description: 'I know grammar basics from high school but freeze up when speaking. Seeking a conversation partner for casual weekly dialogues.',
        preferredDifficulty: 'BEGINNER',
        preferredDuration: 60,
        preferredMode: 'ONLINE',
        preferredSchedule: 'Saturday mornings',
        status: 'OPEN',
      },
      {
        learnerId: userMap['sarah_bakes']._id,
        skillId: skillMap['Urban Balcony Gardening']._id,
        title: 'Need advice on setting up an organic herb & tomato planter',
        description: 'I have a sunny South-facing balcony and want to grow rosemary, basil, and cherry tomatoes. Looking for someone with green thumb experience.',
        preferredDifficulty: 'BEGINNER',
        preferredDuration: 60,
        preferredMode: 'IN_PERSON',
        preferredSchedule: 'Sunday afternoons',
        status: 'OPEN',
      },
      {
        learnerId: userMap['david_diy']._id,
        skillId: skillMap['Vinyasa Yoga & Breathwork']._id,
        title: 'Stiff lower back from woodworking; seeking gentle yoga guidance',
        description: 'Looking for an instructor who can teach me safe hamstring and lower back stretching routines to practice daily.',
        preferredDifficulty: 'BEGINNER',
        preferredDuration: 60,
        preferredMode: 'IN_PERSON',
        preferredSchedule: 'Weekday mornings',
        status: 'OPEN',
      },
      {
        learnerId: userMap['maya_yoga']._id,
        skillId: skillMap['UI/UX Design with Figma']._id,
        title: 'Learn Figma to create custom schedule cards for students',
        description: 'Want to design clean class schedules and meditation routine PDFs in Figma.',
        preferredDifficulty: 'BEGINNER',
        preferredDuration: 60,
        preferredMode: 'ONLINE',
        preferredSchedule: 'Flexible',
        status: 'OPEN',
      },
    ];

    await LearningRequest.insertMany(requestsData);

    // 5. Seed Availability
    console.log('📅 Seeding weekly availability schedules...');
    const availabilityData = [
      // Elena: Saturdays 10:00 - 16:00
      {
        userId: userMap['elena_music']._id,
        dayOfWeek: 6,
        startTime: '10:00',
        endTime: '16:00',
        learningMode: 'IN_PERSON',
        timezone: 'America/New_York',
      },
      // Marcus: Saturdays 09:00 - 13:00, Sundays 14:00 - 18:00
      {
        userId: userMap['marcus_code']._id,
        dayOfWeek: 6,
        startTime: '09:00',
        endTime: '13:00',
        learningMode: 'ONLINE',
        timezone: 'America/New_York',
      },
      {
        userId: userMap['marcus_code']._id,
        dayOfWeek: 0,
        startTime: '14:00',
        endTime: '18:00',
        learningMode: 'ONLINE',
        timezone: 'America/New_York',
      },
      // Maya: Weekdays 17:00 - 20:00
      {
        userId: userMap['maya_yoga']._id,
        dayOfWeek: 2,
        startTime: '17:00',
        endTime: '20:00',
        learningMode: 'ONLINE',
        timezone: 'America/New_York',
      },
    ];

    await Availability.insertMany(availabilityData);

    // 6. Seed Welcome Bonus Transactions (3 credits each for all 6 users)
    console.log('💳 Seeding credit ledger welcome bonuses (3.0 credits each)...');
    const welcomeTransactions = createdUsers.map((user) => ({
      senderId: null,
      receiverId: user._id,
      amount: 3.0,
      type: 'WELCOME_BONUS',
      description: 'Initial community welcome credit grant (3 hours of learning)',
    }));

    await CreditTransaction.insertMany(welcomeTransactions);

    // 7. Seed 1 Completed Sample Session (Marcus learned Guitar from Elena)
    console.log('🎓 Seeding sample completed session with review & credit transfer...');
    const sampleSession = await Session.create({
      learnerId: userMap['marcus_code']._id,
      providerId: userMap['elena_music']._id,
      skillId: skillMap['Acoustic Guitar & Open Chords']._id,
      bookingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      startTime: '11:00',
      endTime: '12:00',
      duration: 60,
      creditValue: 1.0,
      status: 'COMPLETED',
      learnerConfirmed: true,
      providerConfirmed: true,
      notes: 'First guitar lesson. Covered tuning, G, C, and D chords.',
      meetingLink: 'Park Slope Community Studio',
    });

    // Credit transfer for sample session: Marcus -1 credit (SESSION_SPEND), Elena +1 credit (SESSION_EARN)
    await CreditTransaction.create([
      {
        senderId: userMap['marcus_code']._id,
        receiverId: userMap['elena_music']._id,
        amount: 1.0,
        type: 'SESSION_SPEND',
        sessionId: sampleSession._id,
        description: 'Completed 1-hour session: Acoustic Guitar & Open Chords',
      },
      {
        senderId: userMap['marcus_code']._id,
        receiverId: userMap['elena_music']._id,
        amount: 1.0,
        type: 'SESSION_EARN',
        sessionId: sampleSession._id,
        description: 'Earned 1 credit teaching: Acoustic Guitar & Open Chords',
      },
    ]);

    // Review from Marcus to Elena
    await Review.create({
      sessionId: sampleSession._id,
      reviewerId: userMap['marcus_code']._id,
      reviewedUserId: userMap['elena_music']._id,
      rating: 5,
      comment: 'Elena is an exceptional guitar teacher! She broke down finger placement so simply and was very encouraging. Highly recommend her sessions!',
    });

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${createdUsers.length} (including 1 Admin)`);
    console.log(`   - Skills: ${createdSkills.length}`);
    console.log(`   - Skill Offers: ${offersData.length}`);
    console.log(`   - Learning Requests: ${requestsData.length}`);
    console.log(`   - Availability Slots: ${availabilityData.length}`);
    console.log(`   - Completed Sessions: 1`);
    console.log(`   - Credit Transactions: ${welcomeTransactions.length + 2}`);
    console.log(`   - Reviews: 1`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
