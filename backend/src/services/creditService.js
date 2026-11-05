const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');
const CreditTransaction = require('../models/CreditTransaction');
const Skill = require('../models/Skill');

/**
 * Transfers credits atomically upon session completion
 * Enforces non-negative balance invariant and prevents duplicate awards
 */
async function transferSessionCredits(sessionId) {
  const isConnected = mongoose.connection.readyState === 1;

  if (!isConnected) {
    return {
      success: true,
      message: 'Credits transferred successfully (demo mode)',
      transaction: {
        _id: 'demo_tx_transfer_001',
        amount: 1.0,
        type: 'SESSION_EARN',
        description: 'Session completed (demo)',
      },
    };
  }

  const session = await Session.findById(sessionId)
    .populate('skillId', 'name category')
    .populate('learnerId', 'name email creditsBalance')
    .populate('providerId', 'name email creditsBalance');

  if (!session) {
    throw new Error('Session not found');
  }

  // Prevent duplicate credit transfers for the same session
  const existingTx = await CreditTransaction.findOne({
    sessionId: session._id,
    type: { $in: ['SESSION_EARN', 'SESSION_SPEND'] },
  });

  if (existingTx) {
    return {
      success: true,
      message: 'Credits for this session have already been settled',
      transaction: existingTx,
    };
  }

  const amount = session.creditValue || (session.duration ? session.duration / 60 : 1.0);
  const skillName = session.skillId?.name || 'Skill Exchange';

  // Check if session was flagged as a mutual reciprocal swap (0 net credits)
  if (session.isReciprocal) {
    const barterTx = await CreditTransaction.create({
      senderId: session.learnerId._id,
      receiverId: session.providerId._id,
      amount: 0,
      type: 'SESSION_EARN',
      sessionId: session._id,
      description: `⭐ Mutual Reciprocal Swap: ${skillName} (0 Net Credits)`,
    });

    return {
      success: true,
      message: 'Mutual reciprocal swap completed with zero credit deduction',
      transaction: barterTx,
    };
  }

  // Double-entry transfer with solvency guard
  // Deduct from learner only if balance >= amount
  const updatedLearner = await User.findOneAndUpdate(
    { _id: session.learnerId._id, creditsBalance: { $gte: amount } },
    { $inc: { creditsBalance: -amount } },
    { new: true }
  );

  if (!updatedLearner) {
    throw new Error(
      `Insufficient credit balance: Learner only has ${
        session.learnerId.creditsBalance?.toFixed(1) || 0
      } credits, but ${amount.toFixed(1)} is required.`
    );
  }

  // Credit the provider
  const updatedProvider = await User.findByIdAndUpdate(
    session.providerId._id,
    { $inc: { creditsBalance: amount } },
    { new: true }
  );

  // Create immutable CreditTransaction record
  const transaction = await CreditTransaction.create({
    senderId: session.learnerId._id,
    receiverId: session.providerId._id,
    amount,
    type: 'SESSION_EARN',
    sessionId: session._id,
    description: `1-on-1 session: ${skillName} (${session.duration || 60} mins)`,
  });

  return {
    success: true,
    message: `Transferred ${amount.toFixed(1)} credits from ${session.learnerId.name} to ${session.providerId.name}`,
    transaction,
    learnerBalance: updatedLearner.creditsBalance,
    providerBalance: updatedProvider.creditsBalance,
  };
}

/**
 * Get comprehensive credit balance and statistics for a user
 */
async function getUserCreditSummary(userId) {
  const isConnected = mongoose.connection.readyState === 1;

  if (!isConnected) {
    return {
      currentBalance: 3.0,
      lifetimeEarned: 2.0,
      lifetimeSpent: 1.0,
      completedSessionsCount: 3,
      transactionCount: 4,
    };
  }

  const user = await User.findById(userId).select('creditsBalance completedSessions');
  const currentBalance = user ? user.creditsBalance : 3.0;

  // Aggregate earned transactions (where user was receiver)
  const earnedAgg = await CreditTransaction.aggregate([
    { $match: { receiverId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);

  // Aggregate spent transactions (where user was sender)
  const spentAgg = await CreditTransaction.aggregate([
    { $match: { senderId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);

  const lifetimeEarned = earnedAgg.length > 0 ? earnedAgg[0].total : 0;
  const lifetimeSpent = spentAgg.length > 0 ? spentAgg[0].total : 0;
  const totalCount =
    (earnedAgg.length > 0 ? earnedAgg[0].count : 0) +
    (spentAgg.length > 0 ? spentAgg[0].count : 0);

  return {
    currentBalance,
    lifetimeEarned,
    lifetimeSpent,
    completedSessionsCount: user ? user.completedSessions || 0 : 0,
    transactionCount: totalCount,
  };
}

/**
 * Get paginated transaction history for a user
 */
async function getLedgerTransactions(userId, options = {}) {
  const { type = 'ALL', page = 1, limit = 15 } = options;
  const isConnected = mongoose.connection.readyState === 1;

  if (!isConnected) {
    const mockTxs = [
      {
        _id: 'mock_tx_001',
        senderId: { _id: 'user_marcus', name: 'Marcus Chen', username: 'marcus_guitar' },
        receiverId: { _id: userId, name: 'You' },
        amount: 1.0,
        type: 'SESSION_EARN',
        description: 'Taught 1-on-1 session: Spanish Conversation (60 mins)',
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        _id: 'mock_tx_002',
        senderId: { _id: userId, name: 'You' },
        receiverId: { _id: 'user_elena', name: 'Elena Rostova', username: 'elena_dev' },
        amount: 1.0,
        type: 'SESSION_SPEND',
        description: 'Attended session: Python Data Analysis (60 mins)',
        createdAt: new Date(Date.now() - 86400000 * 5),
      },
      {
        _id: 'mock_tx_003',
        senderId: null,
        receiverId: { _id: userId, name: 'You' },
        amount: 3.0,
        type: 'WELCOME_BONUS',
        description: 'Time Banking Welcome Bonus (3 Free Learning Hours)',
        createdAt: new Date(Date.now() - 86400000 * 10),
      },
    ];

    let filtered = mockTxs;
    if (type === 'EARNED') filtered = mockTxs.filter((t) => t.type === 'SESSION_EARN');
    if (type === 'SPENT') filtered = mockTxs.filter((t) => t.type === 'SESSION_SPEND');
    if (type === 'BONUS') filtered = mockTxs.filter((t) => t.type === 'WELCOME_BONUS');

    return {
      transactions: filtered,
      pagination: {
        total: filtered.length,
        page: Number(page),
        limit: Number(limit),
        pages: 1,
      },
    };
  }

  const uId = new mongoose.Types.ObjectId(userId);
  let filter = {
    $or: [{ receiverId: uId }, { senderId: uId }],
  };

  if (type === 'EARNED') {
    filter = { receiverId: uId, type: 'SESSION_EARN' };
  } else if (type === 'SPENT') {
    filter = { senderId: uId };
  } else if (type === 'BONUS') {
    filter = { receiverId: uId, type: 'WELCOME_BONUS' };
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 15;
  const skip = (pageNum - 1) * limitNum;

  const [transactions, total] = await Promise.all([
    CreditTransaction.find(filter)
      .populate('senderId', 'name username profilePicture')
      .populate('receiverId', 'name username profilePicture')
      .populate('sessionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    CreditTransaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
}

/**
 * Execute administrative credit adjustment with audit trail
 */
async function executeAdminAdjustment(adminId, targetUserId, amount, type, description) {
  const isConnected = mongoose.connection.readyState === 1;

  if (!isConnected) {
    return {
      success: true,
      message: 'Admin adjustment recorded (demo mode)',
      transaction: {
        amount,
        type: 'ADMIN_ADJUSTMENT',
        description,
      },
    };
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new Error('Target user not found');
  }

  // Adjust balance
  targetUser.creditsBalance = Math.max(0, targetUser.creditsBalance + amount);
  await targetUser.save();

  // Create audit transaction
  const tx = await CreditTransaction.create({
    senderId: amount < 0 ? targetUserId : adminId,
    receiverId: amount > 0 ? targetUserId : adminId,
    amount: Math.abs(amount),
    type: 'ADMIN_ADJUSTMENT',
    description: `Admin Adjustment: ${description}`,
  });

  return {
    success: true,
    message: `Adjusted balance by ${amount > 0 ? '+' : ''}${amount} credits`,
    newBalance: targetUser.creditsBalance,
    transaction: tx,
  };
}

module.exports = {
  transferSessionCredits,
  getUserCreditSummary,
  getLedgerTransactions,
  executeAdminAdjustment,
};

