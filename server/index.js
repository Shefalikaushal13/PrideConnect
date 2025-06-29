import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { initializeSupabase } from './config/supabase.js';
import { initializeFirebase } from './config/firebase.js';
import { jobScrapingService } from './services/jobScraping.js';
import { authRoutes } from './routes/auth.js';
import { jobRoutes } from './routes/jobs.js';
import { eventRoutes } from './routes/events.js';
import { communityRoutes } from './routes/community.js';
import { chatRoutes } from './routes/chat.js';
import { setupWebSocketHandlers } from './websocket/handlers.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Get allowed origins - support both HTTP and HTTPS versions
const getAllowedOrigins = () => {
  const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const origins = [baseUrl];
  
  // Add HTTPS version if base is HTTP
  if (baseUrl.startsWith('http://')) {
    origins.push(baseUrl.replace('http://', 'https://'));
  }
  
  // Add HTTP version if base is HTTPS
  if (baseUrl.startsWith('https://')) {
    origins.push(baseUrl.replace('https://', 'http://'));
  }
  
  return origins;
};

const allowedOrigins = getAllowedOrigins();

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Initialize services
const supabase = initializeSupabase();
const firebase = initializeFirebase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/chat', chatRoutes);

// WebSocket setup with anonymous chat
const { anonymousChat } = setupWebSocketHandlers(io, supabase);

// Real-time job scraping - runs every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log('Starting scheduled job scraping...');
  try {
    await jobScrapingService.scrapeAndUpdateJobs();
    
    // Broadcast new jobs to connected clients
    const newJobs = await jobScrapingService.getLatestJobs(50);
    io.emit('jobs:updated', newJobs);
    
    console.log('Job scraping completed successfully');
  } catch (error) {
    console.error('Error in scheduled job scraping:', error);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      supabase: !!supabase,
      firebase: !!firebase,
      websocket: io.engine.clientsCount,
      anonymousChat: anonymousChat ? anonymousChat.getActiveRooms().length : 0
    }
  });
});

// WebSocket connection logging
io.on('connection', (socket) => {
  console.log(`🔌 WebSocket client connected: ${socket.id}`);
  
  socket.on('disconnect', (reason) => {
    console.log(`🔌 WebSocket client disconnected: ${socket.id}, reason: ${reason}`);
  });
  
  socket.on('error', (error) => {
    console.error(`🔌 WebSocket error for ${socket.id}:`, error);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 WebSocket server ready`);
  console.log(`📊 Real-time job scraping scheduled`);
  console.log(`💬 Anonymous chat system initialized`);
  console.log(`🔗 CORS enabled for origins:`, allowedOrigins);
});

export { io, supabase, firebase };