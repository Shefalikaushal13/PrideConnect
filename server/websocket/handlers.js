import { setupAnonymousChatHandlers } from './anonymousChat.js';

export const setupWebSocketHandlers = (io, supabase) => {
  // Setup anonymous chat handlers
  const anonymousChat = setupAnonymousChatHandlers(io);
  
  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);
    
    // Join user to their personal room
    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined personal room`);
    });
    
    // Join community rooms
    socket.on('join:community', (communityId) => {
      socket.join(`community:${communityId}`);
      console.log(`User joined community: ${communityId}`);
    });
    
    // Real-time chat messages
    socket.on('chat:message', async (data) => {
      try {
        const { message, userId, chatId, type } = data;
        
        // Store message in database
        if (supabase) {
          const { data: savedMessage, error } = await supabase
            .from('chat_messages')
            .insert({
              content: message,
              user_id: userId,
              chat_id: chatId,
              message_type: type,
              timestamp: new Date()
            })
            .select()
            .single();
          
          if (!error) {
            // Broadcast to chat participants
            io.to(`chat:${chatId}`).emit('chat:message', savedMessage);
          }
        }
      } catch (error) {
        console.error('Chat message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Real-time job alerts
    socket.on('jobs:subscribe', (preferences) => {
      socket.join('job-alerts');
      socket.jobPreferences = preferences;
      console.log(`User subscribed to job alerts with preferences:`, preferences);
    });
    
    // Real-time event updates
    socket.on('events:subscribe', (location) => {
      socket.join(`events:${location}`);
      console.log(`User subscribed to events in: ${location}`);
    });
    
    // Community status updates
    socket.on('user:status', async (data) => {
      try {
        const { userId, status, activity } = data;
        
        // Update user status in database
        if (supabase) {
          await supabase
            .from('user_status')
            .upsert({
              user_id: userId,
              status: status,
              activity: activity,
              last_seen: new Date()
            });
        }
        
        // Broadcast status to community
        socket.broadcast.emit('user:status:update', {
          userId,
          status,
          activity,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Status update error:', error);
      }
    });
    
    // Therapist connection requests
    socket.on('therapist:request', async (data) => {
      try {
        const { userId, therapistId, sessionType, preferredTime } = data;
        
        // Store request in database
        if (supabase) {
          const { data: request, error } = await supabase
            .from('therapist_requests')
            .insert({
              user_id: userId,
              therapist_id: therapistId,
              session_type: sessionType,
              preferred_time: preferredTime,
              status: 'pending',
              created_at: new Date()
            })
            .select()
            .single();
          
          if (!error) {
            // Notify therapist
            io.to(`user:${therapistId}`).emit('therapist:request:new', request);
            
            // Confirm to user
            socket.emit('therapist:request:sent', request);
          }
        }
      } catch (error) {
        console.error('Therapist request error:', error);
        socket.emit('error', { message: 'Failed to send therapist request' });
      }
    });
    
    // Crisis support alerts
    socket.on('crisis:alert', async (data) => {
      try {
        const { userId, severity, message, location } = data;
        
        // Log crisis alert
        if (supabase) {
          await supabase
            .from('crisis_alerts')
            .insert({
              user_id: userId,
              severity: severity,
              message: message,
              location: location,
              timestamp: new Date(),
              status: 'active'
            });
        }
        
        // Notify crisis support team (if available)
        io.to('crisis-support').emit('crisis:alert:new', {
          userId,
          severity,
          message,
          location,
          timestamp: new Date()
        });
        
        // Send immediate resources to user
        socket.emit('crisis:resources', {
          hotlines: [
            { name: 'National Suicide Prevention', number: '9152987821' },
            { name: 'LGBTQ+ Crisis Support', number: '+91-9999-46-5428' },
            { name: 'Emergency Services', number: '112' }
          ],
          message: 'Help is available. You are not alone.'
        });
        
      } catch (error) {
        console.error('Crisis alert error:', error);
      }
    });
    
    // Real-time notifications
    socket.on('notifications:subscribe', (userId) => {
      socket.join(`notifications:${userId}`);
    });
    
    // Typing indicators for chat
    socket.on('chat:typing', (data) => {
      socket.to(`chat:${data.chatId}`).emit('chat:typing', {
        userId: data.userId,
        isTyping: data.isTyping
      });
    });
    
    // Voice call signaling
    socket.on('call:offer', (data) => {
      socket.to(`user:${data.targetUserId}`).emit('call:offer', {
        from: data.fromUserId,
        offer: data.offer,
        callType: data.callType
      });
    });
    
    socket.on('call:answer', (data) => {
      socket.to(`user:${data.targetUserId}`).emit('call:answer', {
        from: data.fromUserId,
        answer: data.answer
      });
    });
    
    socket.on('call:ice-candidate', (data) => {
      socket.to(`user:${data.targetUserId}`).emit('call:ice-candidate', {
        from: data.fromUserId,
        candidate: data.candidate
      });
    });
    
    socket.on('call:end', (data) => {
      socket.to(`user:${data.targetUserId}`).emit('call:end', {
        from: data.fromUserId
      });
    });
    
    // Disconnect handler
    socket.on('disconnect', async () => {
      console.log(`👤 User disconnected: ${socket.id}`);
      
      // Update user status to offline
      if (socket.userId && supabase) {
        try {
          await supabase
            .from('user_status')
            .update({
              status: 'offline',
              last_seen: new Date()
            })
            .eq('user_id', socket.userId);
        } catch (error) {
          console.error('Error updating offline status:', error);
        }
      }
    });
  });
  
  // Broadcast system-wide updates
  setInterval(() => {
    io.emit('system:heartbeat', {
      timestamp: new Date(),
      activeUsers: io.engine.clientsCount
    });
  }, 30000); // Every 30 seconds
  
  // Return anonymous chat utilities for admin/monitoring
  return {
    anonymousChat
  };
};