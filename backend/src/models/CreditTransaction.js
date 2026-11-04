const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    type: {
      type: String,
      enum: ['SESSION_EARN', 'SESSION_SPEND', 'SESSION_REFUND', 'WELCOME_BONUS', 'ADMIN_ADJUSTMENT'],
      required: [true, 'Transaction type is required'],
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

creditTransactionSchema.index({ receiverId: 1, createdAt: -1 });
creditTransactionSchema.index({ senderId: 1, createdAt: -1 });

const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema);

module.exports = CreditTransaction;

