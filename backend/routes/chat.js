import express from "express";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import ConnectionRequest from "../models/ConnectionRequest.js";
import Student from "../models/Student.js";
import Landlord from "../models/Landlord.js";
import auth from "../middleware/auth.js";

// Helper function to populate participants from mixed models
const populateParticipants = async (conversation) => {
  const populatedParticipants = [];
  
  for (const participantId of conversation.participants) {
    // Try to find in Student collection first
    let participant = await Student.findById(participantId).select('name email profilePicture');
    if (participant) {
      populatedParticipants.push({
        ...participant.toObject(),
        id: participant._id.toString(),
        role: 'student'
      });
    } else {
      // Try Landlord collection
      participant = await Landlord.findById(participantId).select('name email profilePicture');
      if (participant) {
        populatedParticipants.push({
          ...participant.toObject(),
          id: participant._id.toString(),
          role: 'landlord'
        });
      }
    }
  }
  
  return {
    ...conversation.toObject(),
    participants: populatedParticipants
  };
};

const router = express.Router();

// Get user's conversations
router.get("/conversations", auth, async (req, res) => {
  try {
    const conversations = await Chat.find({
      participants: req.user.id
    })
    .populate({
      path: 'lastMessage',
      select: 'content sender createdAt'
    })
    .sort({ updatedAt: -1 });

    // Populate participants and get unread counts
    const conversationsWithData = await Promise.all(
      conversations.map(async (conversation) => {
        const populatedConversation = await populateParticipants(conversation);
        
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: req.user.id },
          read: false
        });
        
        return {
          ...populatedConversation,
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      data: conversationsWithData
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversations"
    });
  }
});

// Get messages for a conversation
router.get("/conversations/:conversationId/messages", auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of conversation
    const conversation = await Chat.findOne({
      _id: conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found"
      });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      { 
        conversation: conversationId, 
        sender: { $ne: req.user.id },
        read: false 
      },
      { $set: { read: true } }
    );

    // Emit read receipt via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(conversationId).emit('messages_read', {
        userId: req.user.id,
        conversationId: conversationId
      });
    }

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(conversation.messageCount / limit),
        totalMessages: conversation.messageCount
      }
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch messages"
    });
  }
});

// Send a message
router.post("/conversations/:conversationId/messages", auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text' } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "Message content is required"
      });
    }

    // Verify user is part of conversation
    const conversation = await Chat.findOne({
      _id: conversationId,
      participants: req.user.id
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found"
      });
    }

    const message = new Message({
      conversation: conversationId,
      sender: req.user.id,
      senderModel: req.user.role === 'student' ? 'Student' : 'Landlord',
      content: content.trim(),
      type,
      read: false
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.messageCount += 1;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Populate sender info for response
    await message.populate('sender', 'name profilePicture');

    // Emit real-time event only to the other participant (avoid echoing to sender)
    const io = req.app.get('io');
    if (io) {
      try {
        const otherParticipantId = (conversation.participants || [])
          .map(p => p.toString())
          .find(p => p !== req.user.id.toString());
        if (otherParticipantId) {
          io.to(`user_${otherParticipantId}`).emit('new_message', message);
        }
      } catch (e) {
        console.warn('Realtime emit failed, falling back to room broadcast');
        io.to(conversationId).emit('new_message', message);
      }
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send message"
    });
  }
});

// Start new conversation
router.post("/conversations/start", auth, async (req, res) => {
  try {
    const { participantId, participantType, initialMessage } = req.body;

    if (!participantId || !participantType) {
      return res.status(400).json({
        success: false,
        error: "Participant ID and type are required"
      });
    }

    // Check if conversation already exists
    let conversation = await Chat.findOne({
      participants: { $all: [req.user.id, participantId] },
      type: 'direct'
    });

    if (!conversation) {
      conversation = new Chat({
        participants: [req.user.id, participantId],
        type: 'direct',
        messageCount: 0,
        createdBy: req.user.id,
        createdByModel: req.user.role === 'student' ? 'Student' : 'Landlord'
      });
      await conversation.save();
    }

    let message = null;

    // Send initial message if provided
    if (initialMessage && initialMessage.trim() !== '') {
      message = new Message({
        conversation: conversation._id,
        sender: req.user.id,
        senderModel: req.user.role === 'student' ? 'Student' : 'Landlord',
        content: initialMessage.trim(),
        type: 'text',
        read: false
      });
      await message.save();

      conversation.lastMessage = message._id;
      conversation.messageCount += 1;
      await conversation.save();

      await message.populate('sender', 'name profilePicture');
    }

    // Populate participants using our helper function
    const populatedConversation = await populateParticipants(conversation);
    
    if (message) {
      await conversation.populate('lastMessage');
      populatedConversation.lastMessage = conversation.lastMessage;
    }

    res.status(201).json({
      success: true,
      data: populatedConversation,
      initialMessage: message
    });
  } catch (error) {
    console.error("Error starting conversation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to start conversation"
    });
  }
});

// Get conversation by participant
router.get("/conversations/with/:participantId", auth, async (req, res) => {
  try {
    const { participantId } = req.params;

    const conversation = await Chat.findOne({
      participants: { $all: [req.user.id, participantId] },
      type: 'direct'
    })
    .populate('lastMessage');

    if (conversation) {
      const populatedConversation = await populateParticipants(conversation);
      populatedConversation.lastMessage = conversation.lastMessage;
      
      res.json({
        success: true,
        data: populatedConversation
      });
    } else {
      res.json({
        success: true,
        data: null
      });
    }
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch conversation"
    });
  }
});

// Get online users (for proof of work connection)
router.get("/online-users", auth, async (req, res) => {
  try {
    // Get the io instance from the app
    const io = req.app.get('io');
    if (!io) {
      return res.status(500).json({
        success: false,
        error: "Socket.io not available"
      });
    }

    // Get all connected sockets
    const sockets = await io.fetchSockets();
    const onlineUsers = sockets
      .filter(socket => socket.userId && socket.userId !== req.user.id)
      .map(socket => ({
        userId: socket.userId,
        name: socket.userName,
        role: socket.userRole,
        socketId: socket.id
      }));

    res.json({
      success: true,
      data: onlineUsers
    });
  } catch (error) {
    console.error("Error fetching online users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch online users"
    });
  }
});

// Get users by role (for connection purposes)
router.get("/users/:role", auth, async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!['student', 'landlord'].includes(role.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: "Invalid role. Must be 'student' or 'landlord'"
      });
    }

    // Import models dynamically
    let Model;
    if (role.toLowerCase() === 'student') {
      const Student = (await import('../models/Student.js')).default;
      Model = Student;
    } else {
      const Landlord = (await import('../models/Landlord.js')).default;
      Model = Landlord;
    }

    const users = await Model.find({
      _id: { $ne: req.user.id } // Exclude current user
    }).select('name email profilePicture').limit(20);

    res.json({
      success: true,
      data: users.map(user => ({
        ...user.toObject(),
        id: user._id.toString(), // Add id field for frontend
        role: role.toLowerCase()
      }))
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users"
    });
  }
});

// Persistent connection requests
// Create a request (so receiver can accept later even if offline)
router.post('/requests', auth, async (req, res) => {
  try {
    const { toUserId, message } = req.body;
    if (!toUserId) {
      return res.status(400).json({ success: false, error: 'toUserId is required' });
    }

    // Avoid duplicate pending requests from same sender to same receiver
    const existing = await ConnectionRequest.findOne({ fromUser: req.user.id, toUser: toUserId, status: 'pending' });
    if (existing) {
      return res.json({ success: true, data: existing });
    }

    const request = await ConnectionRequest.create({
      fromUser: req.user.id,
      toUser: toUserId,
      fromRole: req.user.role,
      message: (message || '').trim()
    });

    // Try real-time notify if online
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${toUserId}`).emit('connection_request', {
        fromUserId: req.user.id,
        fromUserName: req.user.name || 'User',
        fromUserRole: req.user.role,
        message: request.message
      });
    }

    return res.status(201).json({ success: true, data: request });
  } catch (err) {
    console.error('Error creating request:', err);
    return res.status(500).json({ success: false, error: 'Failed to create request' });
  }
});

// List pending requests for current user
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({ toUser: req.user.id, status: 'pending' })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: requests.map(r => ({
      id: r._id.toString(),
      fromUserId: r.fromUser.toString(),
      fromUserName: 'Incoming user', // optionally populate if needed
      fromUserRole: r.fromRole,
      message: r.message,
      createdAt: r.createdAt
    })) });
  } catch (err) {
    console.error('Error listing requests:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch requests' });
  }
});

// Accept a request -> create conversation and send initial message (optional)
router.post('/requests/:id/accept', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await ConnectionRequest.findOne({ _id: id, toUser: req.user.id, status: 'pending' });
    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });

    // Create or fetch conversation
    let conversation = await Chat.findOne({ participants: { $all: [request.fromUser, request.toUser] }, type: 'direct' });
    if (!conversation) {
      conversation = new Chat({
        participants: [request.fromUser, request.toUser],
        type: 'direct',
        messageCount: 0,
        createdBy: req.user.id,
        createdByModel: req.user.role === 'student' ? 'Student' : 'Landlord'
      });
      await conversation.save();
    }

    // Mark request accepted
    request.status = 'accepted';
    await request.save();

    // Populate conversation for frontend
    const populatedConversation = await populateParticipants(conversation);

    // Real-time notify requester if online
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${request.fromUser.toString()}`).emit('connection_accepted', {
        byUserId: req.user.id,
        byUserName: req.user.name || 'User',
        byUserRole: req.user.role
      });
      io.to(`user_${request.fromUser.toString()}`).emit('new_conversation_created', {
        conversationId: conversation._id.toString(),
        message: 'A new conversation was created with you'
      });
    }

    return res.json({ success: true, data: populatedConversation });
  } catch (err) {
    console.error('Error accepting request:', err);
    return res.status(500).json({ success: false, error: 'Failed to accept request' });
  }
});

// Reject a request
router.post('/requests/:id/reject', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const request = await ConnectionRequest.findOne({ _id: id, toUser: req.user.id, status: 'pending' });
    if (!request) return res.status(404).json({ success: false, error: 'Request not found' });
    request.status = 'rejected';
    await request.save();
    return res.json({ success: true });
  } catch (err) {
    console.error('Error rejecting request:', err);
    return res.status(500).json({ success: false, error: 'Failed to reject request' });
  }
});

export default router;