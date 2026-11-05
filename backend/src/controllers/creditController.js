const creditService = require('../services/creditService');

/**
 * @desc    Get authenticated user's credit balance and exchange statistics
 * @route   GET /api/credits/balance
 * @access  Private
 */
const getBalanceSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const summary = await creditService.getUserCreditSummary(userId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated credit transaction ledger history
 * @route   GET /api/credits/ledger
 * @access  Private
 */
const getLedgerHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type = 'ALL', page = 1, limit = 15 } = req.query;

    const result = await creditService.getLedgerTransactions(userId, {
      type,
      page,
      limit,
    });

    res.json({
      success: true,
      count: result.transactions.length,
      total: result.pagination.total,
      pages: result.pagination.pages,
      currentPage: result.pagination.page,
      data: result.transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin manual adjustment of a user's credit balance
 * @route   POST /api/credits/admin-adjust
 * @access  Private (Admin only)
 */
const adminAdjustCredits = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const { targetUserId, amount, description } = req.body;

    const result = await creditService.executeAdminAdjustment(
      adminId,
      targetUserId,
      amount,
      'ADMIN_ADJUSTMENT',
      description
    );

    res.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBalanceSummary,
  getLedgerHistory,
  adminAdjustCredits,
};

