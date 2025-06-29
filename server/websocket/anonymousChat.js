export const setupAnonymousChatHandlers = (io) => {
  // Store anonymous users and rooms
  const anonymousUsers = new Map();
  const chatRooms = new Map();
  
  // Initialize default rooms
  const defaultRooms = [
    'general',
    'mental-health',
    'coming-out',
    'family',
    'workplace',
    'crisis'
  ];
  
  defaultRooms.forEach(room => {
    chatRooms.set(room, {
      id: room,
      users: new Set(),
      messages: [],
      createdAt: new Date()
    });
  });

  io.on('connection', (socket) => {
    
    // Join anonymous chat room
    socket.on('anonymous:join', (data) => {
      const { anonymousId, room, mood } = data;
      
      // Store anonymous user info
      anonymousUsers.set(socket.id, {
        anonymousId,
        room,
        mood,
        joinedAt: new Date(),
        socketId: socket.id
      });
      
      // Join the room
      socket.join(`anonymous:${room}`);
      
      // Add user to room
      if (chatRooms.has(room)) {
        chatRooms.get(room).users.add(anonymousId);
      }
      
      // Notify others in the room
      socket.to(`anonymous:${room}`).emit('anonymous:user-joined', {
        anonymousId,
        mood,
        timestamp: new Date()
      });
      
      // Send room statistics
      const roomData = chatRooms.get(room);
      io.to(`anonymous:${room}`).emit('anonymous:room-stats', {
        room,
        activeUsers: roomData ? roomData.users.size : 0
      });
      
      console.log(`Anonymous user ${anonymousId} joined room ${room}`);
    });
    
    // Leave anonymous chat room
    socket.on('anonymous:leave', (data) => {
      const { anonymousId, room } = data;
      
      socket.leave(`anonymous:${room}`);
      
      // Remove user from room
      if (chatRooms.has(room)) {
        chatRooms.get(room).users.delete(anonymousId);
      }
      
      // Notify others in the room
      socket.to(`anonymous:${room}`).emit('anonymous:user-left', {
        anonymousId,
        timestamp: new Date()
      });
      
      // Send updated room statistics
      const roomData = chatRooms.get(room);
      io.to(`anonymous:${room}`).emit('anonymous:room-stats', {
        room,
        activeUsers: roomData ? roomData.users.size : 0
      });
      
      // Remove from anonymous users
      anonymousUsers.delete(socket.id);
      
      console.log(`Anonymous user ${anonymousId} left room ${room}`);
    });
    
    // Handle anonymous messages
    socket.on('anonymous:message', (data) => {
      const { id, content, senderId, room, mood, timestamp } = data;
      
      // Validate message
      if (!content || !senderId || !room) {
        return;
      }
      
      // Check if user is in the room
      const user = anonymousUsers.get(socket.id);
      if (!user || user.room !== room) {
        return;
      }
      
      // Create message object
      const message = {
        id,
        content: content.substring(0, 500), // Limit message length
        senderId,
        room,
        mood,
        timestamp: new Date(timestamp),
        socketId: socket.id
      };
      
      // Store message in room (keep last 100 messages)
      if (chatRooms.has(room)) {
        const roomData = chatRooms.get(room);
        roomData.messages.push(message);
        
        // Keep only last 100 messages
        if (roomData.messages.length > 100) {
          roomData.messages = roomData.messages.slice(-100);
        }
      }
      
      // Broadcast message to room
      io.to(`anonymous:${room}`).emit('anonymous:message', message);
      
      // Log for moderation (in production, implement proper logging)
      console.log(`Anonymous message in ${room}: ${content.substring(0, 50)}...`);
      
      // Crisis detection for crisis room
      if (room === 'crisis' || containsCrisisKeywords(content)) {
        handleCrisisMessage(socket, message);
      }
    });
    
    // Handle typing indicators
    socket.on('anonymous:typing', (data) => {
      const { senderId, room, isTyping } = data;
      
      // Broadcast typing indicator to others in the room
      socket.to(`anonymous:${room}`).emit('anonymous:typing', {
        senderId,
        isTyping,
        timestamp: new Date()
      });
    });
    
    // Change anonymous ID
    socket.on('anonymous:change-id', (data) => {
      const { oldId, newId, room } = data;
      
      // Update user info
      const user = anonymousUsers.get(socket.id);
      if (user) {
        user.anonymousId = newId;
        
        // Update room user list
        if (chatRooms.has(room)) {
          const roomData = chatRooms.get(room);
          roomData.users.delete(oldId);
          roomData.users.add(newId);
        }
        
        // Notify room of ID change
        socket.to(`anonymous:${room}`).emit('anonymous:user-id-changed', {
          oldId,
          newId,
          timestamp: new Date()
        });
      }
    });
    
    // Get room history (last 20 messages)
    socket.on('anonymous:get-history', (data) => {
      const { room } = data;
      
      if (chatRooms.has(room)) {
        const roomData = chatRooms.get(room);
        const recentMessages = roomData.messages.slice(-20);
        
        socket.emit('anonymous:history', {
          room,
          messages: recentMessages
        });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      const user = anonymousUsers.get(socket.id);
      
      if (user) {
        const { anonymousId, room } = user;
        
        // Remove from room
        if (chatRooms.has(room)) {
          chatRooms.get(room).users.delete(anonymousId);
        }
        
        // Notify others
        socket.to(`anonymous:${room}`).emit('anonymous:user-left', {
          anonymousId,
          timestamp: new Date()
        });
        
        // Send updated room statistics
        const roomData = chatRooms.get(room);
        io.to(`anonymous:${room}`).emit('anonymous:room-stats', {
          room,
          activeUsers: roomData ? roomData.users.size : 0
        });
        
        // Remove from anonymous users
        anonymousUsers.delete(socket.id);
        
        console.log(`Anonymous user ${anonymousId} disconnected from room ${room}`);
      }
    });
  });
  
  // Helper function to detect crisis keywords
  const containsCrisisKeywords = (message) => {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'want to die', 'hurt myself',
      'self harm', 'cutting', 'overdose', 'jump', 'hanging'
    ];
    
    const lowerMessage = message.toLowerCase();
    return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
  };
  
  // Handle crisis messages
  const handleCrisisMessage = (socket, message) => {
    // Send immediate crisis resources to the user
    socket.emit('anonymous:crisis-detected', {
      message: 'We noticed you might be going through a difficult time. Help is available.',
      resources: [
        { name: 'National Suicide Prevention', number: '9152987821' },
        { name: 'LGBTQ+ Crisis Support', number: '+91-9999-46-5428' },
        { name: 'Emergency Services', number: '112' },
        { name: 'Vandrevala Foundation', number: '1860-2662-345' }
      ],
      timestamp: new Date()
    });
    
    // Alert moderators (in production, implement proper moderation system)
    console.log(`CRISIS ALERT: Anonymous user in ${message.room} - ${message.content}`);
    
    // In production, you would:
    // 1. Alert trained crisis counselors
    // 2. Log the incident for follow-up
    // 3. Provide immediate automated support resources
    // 4. Potentially escalate to emergency services if needed
  };
  
  // Cleanup function to remove old messages and inactive rooms
  setInterval(() => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    chatRooms.forEach((room, roomId) => {
      // Remove messages older than 1 hour
      room.messages = room.messages.filter(msg => msg.timestamp > oneHourAgo);
      
      // Clean up empty rooms (except default rooms)
      if (room.users.size === 0 && !defaultRooms.includes(roomId)) {
        chatRooms.delete(roomId);
      }
    });
  }, 300000); // Run every 5 minutes
  
  return {
    getActiveRooms: () => {
      const rooms = [];
      chatRooms.forEach((room, roomId) => {
        rooms.push({
          id: roomId,
          activeUsers: room.users.size,
          messageCount: room.messages.length,
          createdAt: room.createdAt
        });
      });
      return rooms;
    },
    
    getRoomStats: (roomId) => {
      const room = chatRooms.get(roomId);
      return room ? {
        id: roomId,
        activeUsers: room.users.size,
        messageCount: room.messages.length,
        recentActivity: room.messages.slice(-10)
      } : null;
    }
  };
};