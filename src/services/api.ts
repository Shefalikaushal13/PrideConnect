import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Dynamically determine WebSocket URL based on current page protocol
const getWebSocketURL = (): string => {
  const baseURL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
  
  // If we're on HTTPS, use WSS; if HTTP, use WS
  if (window.location.protocol === 'https:') {
    return baseURL.replace(/^http:/, 'https:');
  }
  
  return baseURL;
};

const WS_URL = getWebSocketURL();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// WebSocket connection
let socket: Socket | null = null;

export const connectWebSocket = (userId?: string): Socket | null => {
  // If already connected, return existing socket
  if (socket?.connected) {
    console.log('🔌 WebSocket already connected:', socket.id);
    return socket;
  }
  
  console.log('🔌 Connecting to WebSocket:', WS_URL);
  
  try {
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5,
      autoConnect: true,
      secure: window.location.protocol === 'https:',
      rejectUnauthorized: false, // For development environments
    });
    
    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket?.id);
      if (userId) {
        socket?.emit('join:user', userId);
      }
    });
    
    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });
    
    socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
    });
    
    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_error', (error) => {
      console.error('🔄 WebSocket reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('🔄 WebSocket reconnection failed after all attempts');
    });
    
    return socket;
  } catch (error) {
    console.error('🔌 Failed to create WebSocket connection:', error);
    return null;
  }
};

export const disconnectWebSocket = () => {
  if (socket) {
    console.log('🔌 Disconnecting WebSocket');
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => {
  if (!socket) {
    console.log('🔌 No WebSocket instance, creating new connection...');
    return connectWebSocket();
  }
  
  if (!socket.connected) {
    console.log('🔌 WebSocket not connected, attempting to reconnect...');
    socket.connect();
  }
  
  return socket;
};

// API Services
export const authService = {
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.session?.access_token) {
      localStorage.setItem('auth_token', response.data.session.access_token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    disconnectWebSocket();
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  updateProfile: async (updates: any) => {
    const response = await api.put('/auth/profile', updates);
    return response.data;
  }
};

export const jobsService = {
  getJobs: async (filters: any = {}) => {
    const response = await api.get('/jobs', { params: filters });
    return response.data;
  },
  
  getJob: async (id: string) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },
  
  saveJob: async (jobId: string, userId: string) => {
    const response = await api.post(`/jobs/${jobId}/save`, { userId });
    return response.data;
  },
  
  getRecommendations: async (userId: string, limit = 10) => {
    const response = await api.get(`/jobs/recommendations/${userId}`, { params: { limit } });
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/jobs/stats/overview');
    return response.data;
  },
  
  triggerScraping: async () => {
    const response = await api.post('/jobs/scrape');
    return response.data;
  }
};

export const eventsService = {
  getEvents: async (filters: any = {}) => {
    const response = await api.get('/events', { params: filters });
    return response.data;
  },
  
  createEvent: async (eventData: any) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },
  
  rsvpEvent: async (eventId: string, userId: string, status: string) => {
    const response = await api.post(`/events/${eventId}/rsvp`, { userId, status });
    return response.data;
  }
};

export const communityService = {
  getMembers: async (filters: any = {}) => {
    const response = await api.get('/community/members', { params: filters });
    return response.data;
  },
  
  sendConnectionRequest: async (fromUserId: string, toUserId: string, message?: string) => {
    const response = await api.post('/community/connect', { fromUserId, toUserId, message });
    return response.data;
  },
  
  getConnections: async (userId: string) => {
    const response = await api.get(`/community/connections/${userId}`);
    return response.data;
  }
};

export const chatService = {
  getChatHistory: async (chatId: string, page = 1, limit = 50) => {
    const response = await api.get(`/chat/${chatId}/messages`, { params: { page, limit } });
    return response.data;
  },
  
  saveAIChat: async (userId: string, messages: any[], sessionId: string, context: string) => {
    const response = await api.post('/chat/ai/save', { userId, messages, sessionId, context });
    return response.data;
  },
  
  getAIChatHistory: async (userId: string, limit = 10) => {
    const response = await api.get(`/chat/ai/history/${userId}`, { params: { limit } });
    return response.data;
  }
};

// Real-time event handlers
export const setupRealtimeHandlers = (callbacks: {
  onJobsUpdate?: (jobs: any[]) => void;
  onEventUpdate?: (event: any) => void;
  onChatMessage?: (message: any) => void;
  onConnectionRequest?: (request: any) => void;
  onUserStatusUpdate?: (status: any) => void;
  onCrisisAlert?: (alert: any) => void;
  onAnonymousMessage?: (message: any) => void;
  onAnonymousUserJoined?: (user: any) => void;
  onAnonymousUserLeft?: (user: any) => void;
  onAnonymousRoomStats?: (stats: any) => void;
  onAnonymousTyping?: (typing: any) => void;
}) => {
  const socket = getSocket();
  if (!socket) {
    console.error('❌ No WebSocket connection available for real-time handlers');
    return;
  }
  
  console.log('🔧 Setting up real-time handlers');
  
  if (callbacks.onJobsUpdate) {
    socket.on('jobs:updated', callbacks.onJobsUpdate);
  }
  
  if (callbacks.onEventUpdate) {
    socket.on('events:new', callbacks.onEventUpdate);
    socket.on('events:rsvp:update', callbacks.onEventUpdate);
  }
  
  if (callbacks.onChatMessage) {
    socket.on('chat:message', callbacks.onChatMessage);
  }
  
  if (callbacks.onConnectionRequest) {
    socket.on('connection:request', callbacks.onConnectionRequest);
  }
  
  if (callbacks.onUserStatusUpdate) {
    socket.on('user:status:update', callbacks.onUserStatusUpdate);
  }
  
  if (callbacks.onCrisisAlert) {
    socket.on('crisis:resources', callbacks.onCrisisAlert);
  }
  
  // Anonymous chat handlers
  if (callbacks.onAnonymousMessage) {
    socket.on('anonymous:message', callbacks.onAnonymousMessage);
  }
  
  if (callbacks.onAnonymousUserJoined) {
    socket.on('anonymous:user-joined', callbacks.onAnonymousUserJoined);
  }
  
  if (callbacks.onAnonymousUserLeft) {
    socket.on('anonymous:user-left', callbacks.onAnonymousUserLeft);
  }
  
  if (callbacks.onAnonymousRoomStats) {
    socket.on('anonymous:room-stats', callbacks.onAnonymousRoomStats);
  }
  
  if (callbacks.onAnonymousTyping) {
    socket.on('anonymous:typing', callbacks.onAnonymousTyping);
  }
};

// Real-time actions
export const realtimeActions = {
  subscribeToJobs: (preferences: any) => {
    const socket = getSocket();
    socket?.emit('jobs:subscribe', preferences);
  },
  
  subscribeToEvents: (location: string) => {
    const socket = getSocket();
    socket?.emit('events:subscribe', location);
  },
  
  updateUserStatus: (userId: string, status: string, activity?: string) => {
    const socket = getSocket();
    socket?.emit('user:status', { userId, status, activity });
  },
  
  sendChatMessage: (message: string, userId: string, chatId: string, type = 'text') => {
    const socket = getSocket();
    socket?.emit('chat:message', { message, userId, chatId, type });
  },
  
  sendCrisisAlert: (userId: string, severity: string, message: string, location?: string) => {
    const socket = getSocket();
    socket?.emit('crisis:alert', { userId, severity, message, location });
  },
  
  requestTherapist: (userId: string, therapistId: string, sessionType: string, preferredTime: string) => {
    const socket = getSocket();
    socket?.emit('therapist:request', { userId, therapistId, sessionType, preferredTime });
  },
  
  // Anonymous chat actions
  joinAnonymousChat: (anonymousId: string, room: string, mood: string) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      console.log('🎭 Joining anonymous chat:', { anonymousId, room, mood });
      socket.emit('anonymous:join', { anonymousId, room, mood });
    } else {
      console.error('🎭 Cannot join anonymous chat: WebSocket not connected');
    }
  },
  
  leaveAnonymousChat: (anonymousId: string, room: string) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      console.log('🎭 Leaving anonymous chat:', { anonymousId, room });
      socket.emit('anonymous:leave', { anonymousId, room });
    }
  },
  
  sendAnonymousMessage: (messageData: any) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      console.log('🎭 Sending anonymous message:', messageData);
      socket.emit('anonymous:message', messageData);
    } else {
      console.error('🎭 Cannot send anonymous message: WebSocket not connected');
    }
  },
  
  sendAnonymousTyping: (anonymousId: string, room: string, isTyping: boolean) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('anonymous:typing', { senderId: anonymousId, room, isTyping });
    }
  },
  
  changeAnonymousId: (oldId: string, newId: string, room: string) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('anonymous:change-id', { oldId, newId, room });
    }
  },
  
  getAnonymousHistory: (room: string) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('anonymous:get-history', { room });
    }
  }
};

export default api;