import { Server } from "socket.io";

let ioInstance = null;

export function initSocket(httpServer, allowedOrigins) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log('🔌 New socket connection:', socket.id);

    // Handle user authentication and joining
    socket.on('authenticate', (userData) => {
      console.log(' User authenticated:', userData);
      
      // Store user info in socket
      socket.userId = userData.userId;
      socket.userName = userData.userName;
      socket.userRole = userData.userRole;
      
      // Join user-specific room for notifications
      socket.join(`user_${userData.userId}`);
      
      console.log(`User ${userData.userName} (${userData.userRole}) joined room user_${userData.userId}`);
      
      // Broadcast user online status to other users
      socket.broadcast.emit('user_online', {
        userId: userData.userId,
        name: userData.userName,
        role: userData.userRole
      });
      
      // Get all connected sockets and send online users list
      const connectedSockets = Array.from(ioInstance.sockets.sockets.values());
      const onlineUsers = connectedSockets
        .filter(s => s.userId && s.userId !== userData.userId)
        .map(s => ({
          userId: s.userId,
          name: s.userName,
          role: s.userRole
        }));
      
      // Send current online users to the newly connected user
      socket.emit('online_users', onlineUsers);
      console.log(` Sent ${onlineUsers.length} online users to ${userData.userName}`);
    });

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId) => {
      console.log(` User ${socket.userName} joining conversation: ${conversationId}`);
      socket.join(conversationId);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId) => {
      console.log(` User ${socket.userName} leaving conversation: ${conversationId}`);
      socket.leave(conversationId);
    });

    // Handle connection requests
    socket.on('send_connection_request', (data) => {
      console.log('Connection request from:', socket.userName, 'to:', data.toUserId);
      
      const requestData = {
        fromUserId: socket.userId,
        fromUserName: socket.userName,
        fromUserRole: socket.userRole,
        message: data.message || `Hi! I'd like to connect with you.`
      };

      // Send to specific user
      ioInstance.to(`user_${data.toUserId}`).emit('connection_request', requestData);
      console.log(' Connection request sent to user_' + data.toUserId);
    });

    // Handle connection acceptance
    socket.on('accept_connection', (data) => {
      console.log(' Connection accepted by:', socket.userName, 'for:', data.fromUserId);
      
      const acceptanceData = {
        byUserId: socket.userId,
        byUserName: socket.userName,
        byUserRole: socket.userRole
      };

      // Notify the original requester
      ioInstance.to(`user_${data.fromUserId}`).emit('connection_accepted', acceptanceData);
      console.log(' Connection acceptance sent to user_' + data.fromUserId);
    });

    // Handle connection rejection
    socket.on('reject_connection', (data) => {
      console.log(' Connection rejected by:', socket.userName, 'for:', data.fromUserId);
      
      const rejectionData = {
        byUserId: socket.userId,
        byUserName: socket.userName,
        byUserRole: socket.userRole
      };

      // Notify the original requester
      ioInstance.to(`user_${data.fromUserId}`).emit('connection_rejected', rejectionData);
      console.log(' Connection rejection sent to user_' + data.fromUserId);
    });

    // Notify the other participant that a conversation was created so they can refresh
    socket.on('conversation_created', (data) => {
      try {
        const { conversationId, targetUserId } = data || {};
        if (!conversationId || !targetUserId) {
          console.warn('conversation_created missing fields:', data);
          return;
        }
        console.log(` Notifying user_${targetUserId} about new conversation ${conversationId}`);
        ioInstance.to(`user_${targetUserId}`).emit('new_conversation_created', {
          conversationId,
          message: 'A new conversation was created with you'
        });
      } catch (err) {
        console.error('Error handling conversation_created:', err);
      }
    });

    // Remove socket-level echo to prevent duplicate on sender.
    // Realtime delivery is handled after persistence in routes/chat.js

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.to(data.conversationId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
        typing: true
      });
    });

    socket.on('stop_typing', (data) => {
      socket.to(data.conversationId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
        typing: false
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(' Socket disconnected:', socket.id, socket.userName || 'Unknown user');
      
      // Broadcast user offline status if user was authenticated
      if (socket.userId) {
        socket.broadcast.emit('user_offline', {
          userId: socket.userId,
          userName: socket.userName,
          role: socket.userRole
        });
        console.log(` User ${socket.userName} went offline`);
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(' Socket error:', error);
    });
  });

  return ioInstance;
}

export function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized. Call initSocket(server) first.");
  }
  return ioInstance;
}


