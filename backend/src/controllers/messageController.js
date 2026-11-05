const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

/**
 * @desc    Get all conversations for the authenticated user
 * @route   GET /api/conversations
 * @access  Private
 */
const getConversations = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const userId = req.user._id;

    if (!isConnected) {
      return res.json({
        success: true,
        count: 2,
        data: [
          {
            _id: 'demo_conv_001',
            participants: [
              { _id: userId, name: req.user.name || 'You', username: req.user.username },
              {
                _id: 'candidate_elena_001',
                name: 'Elena Rostova',
                username: 'elena_dev',
                profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
                role: 'PROVIDER',
              },
            ],
            lastMessage: {
              text: 'Looking forward to our Python session on Thursday!',
              senderId: 'candidate_elena_001',
              createdAt: new Date(Date.now() - 1800000),
            },
            updatedAt: new Date(Date.now() - 1800000),
          },
          {
            _id: 'demo_conv_002',
            participants: [
              { _id: userId, name: req.user.name || 'You', username: req.user.username },
              {
                _id: 'candidate_marcus_002',
                name: 'Marcus Chen',
                username: 'marcus_guitar',
                profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
                role: 'PROVIDER',
              },
            ],
            lastMessage: {
              text: 'Hey! Are you available this weekend for a Spanish practice swap?',
              senderId: 'candidate_marcus_002',
              createdAt: new Date(Date.now() - 86400000),
            },
            updatedAt: new Date(Date.now() - 86400000),
          },
        ],
      });
    }

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'name username profilePicture role city')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Find or create 1-on-1 conversation with a user
 * @route   POST /api/conversations
 * @access  Private
 */
const getOrCreateConversation = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const userId = req.user._id;
    const { recipientId, initialMessage } = req.body;

    if (userId.toString() === recipientId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start a conversation with yourself',
      });
    }

    if (!isConnected) {
      return res.status(201).json({
        success: true,
        data: {
          _id: 'demo_conv_created_001',
          participants: [
            { _id: userId, name: 'You' },
            { _id: recipientId, name: 'Partner' },
          ],
          lastMessage: {
            text: initialMessage || 'Conversation started',
            senderId: userId,
            createdAt: new Date(),
          },
        },
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId], $size: 2 },
    }).populate('participants', 'name username profilePicture role city');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, recipientId],
        lastMessage: {
          text: initialMessage || '',
          senderId: userId,
          createdAt: new Date(),
        },
      });

      if (initialMessage) {
        await Message.create({
          conversationId: conversation._id,
          senderId: userId,
          text: initialMessage,
        });

        await createNotification(
          recipientId,
          'MESSAGE',
          'New Message',
          `${req.user.name || 'A user'} sent you a message: "${initialMessage.slice(0, 50)}..."`,
          conversation._id,
          'Conversation'
        );
      }

      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'name username profilePicture role city'
      );
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all messages for a specific conversation
 * @route   GET /api/conversations/:id/messages
 * @access  Private
 */
const getMessages = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const { id } = req.params;
    const userId = req.user._id.toString();

    if (!isConnected) {
      return res.json({
        success: true,
        count: 3,
        data: [
          {
            _id: 'demo_msg_001',
            conversationId: id,
            senderId: 'candidate_elena_001',
            text: 'Hi there! I saw you requested a Python mentoring session.',
            createdAt: new Date(Date.now() - 3600000 * 2),
            isRead: true,
          },
          {
            _id: 'demo_msg_002',
            conversationId: id,
            senderId: userId,
            text: 'Yes! Really looking forward to learning data analysis and Pandas with you.',
            createdAt: new Date(Date.now() - 3600000),
            isRead: true,
          },
          {
            _id: 'demo_msg_003',
            conversationId: id,
            senderId: 'candidate_elena_001',
            text: 'Awesome! I will have the dataset prepared for our scheduled time.',
            createdAt: new Date(Date.now() - 1800000),
            isRead: true,
          },
        ],
      });
    }

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Verify participation
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId
    );
    if (!isParticipant && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages in this conversation',
      });
    }

    // Retrieve messages in chronological order
    const messages = await Message.find({ conversationId: id })
      .populate('senderId', 'name username profilePicture')
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    // Mark unread messages as read
    await Message.updateMany(
      { conversationId: id, senderId: { $ne: req.user._id }, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a message in a conversation
 * @route   POST /api/conversations/:id/messages
 * @access  Private
 */
const sendMessage = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!isConnected) {
      return res.status(201).json({
        success: true,
        data: {
          _id: 'demo_msg_created_001',
          conversationId: id,
          senderId: userId,
          text,
          createdAt: new Date(),
          isRead: false,
        },
      });
    }

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation',
      });
    }

    const message = await Message.create({
      conversationId: id,
      senderId: userId,
      text,
      isRead: false,
    });

    // Update conversation lastMessage and timestamp
    conversation.lastMessage = {
      text,
      senderId: userId,
      createdAt: new Date(),
    };
    await conversation.save();

    // Determine recipient to send notification
    const recipientId = conversation.participants.find(
      (p) => p.toString() !== userId.toString()
    );

    if (recipientId) {
      await createNotification(
        recipientId,
        'MESSAGE',
        'New Message',
        `${req.user.name || 'Partner'}: "${text.slice(0, 60)}${text.length > 60 ? '...' : ''}"`,
        conversation._id,
        'Conversation'
      );
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
};

