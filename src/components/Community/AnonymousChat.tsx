import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  UserX, 
  Shield, 
  Eye, 
  EyeOff, 
  Heart,
  AlertTriangle,
  Users,
  Clock,
  Shuffle,
  X,
  Settings,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff
} from 'lucide-react';
import { getSocket, realtimeActions, setupRealtimeHandlers, connectWebSocket } from '../../services/api';
import toast from 'react-hot-toast';

interface AnonymousMessage {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  isSupport?: boolean;
  mood?: 'happy' | 'sad' | 'anxious' | 'angry' | 'neutral';
}

interface AnonymousChatProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

const AnonymousChat: React.FC<AnonymousChatProps> = ({ isOpen, onClose, userId }) => {
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [anonymousId, setAnonymousId] = useState<string>('');
  const [chatRoom, setChatRoom] = useState<string>('general');
  const [userMood, setUserMood] = useState<'happy' | 'sad' | 'anxious' | 'angry' | 'neutral'>('neutral');
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeUsers, setActiveUsers] = useState(0);
  const [connectionTime, setConnectionTime] = useState(0);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const connectionTimerRef = useRef<NodeJS.Timeout>();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const chatRooms = [
    { id: 'general', name: 'General Support', icon: '💬', description: 'Open discussions and general support' },
    { id: 'mental-health', name: 'Mental Health', icon: '🧠', description: 'Mental health support and resources' },
    { id: 'coming-out', name: 'Coming Out', icon: '🌈', description: 'Support for coming out journeys' },
    { id: 'family', name: 'Family Issues', icon: '👨‍👩‍👧‍👦', description: 'Family acceptance and relationship advice' },
    { id: 'workplace', name: 'Workplace', icon: '💼', description: 'Professional and workplace discussions' },
    { id: 'crisis', name: 'Crisis Support', icon: '🆘', description: 'Immediate support for crisis situations' }
  ];

  const moods = [
    { value: 'happy', emoji: '😊', color: 'text-green-500' },
    { value: 'sad', emoji: '😢', color: 'text-blue-500' },
    { value: 'anxious', emoji: '😰', color: 'text-yellow-500' },
    { value: 'angry', emoji: '😠', color: 'text-red-500' },
    { value: 'neutral', emoji: '😐', color: 'text-gray-500' }
  ];

  useEffect(() => {
    if (isOpen) {
      initializeAnonymousChat();
    } else {
      disconnectFromChat();
    }

    return () => {
      disconnectFromChat();
    };
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isConnected) {
      connectionTimerRef.current = setInterval(() => {
        setConnectionTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (connectionTimerRef.current) {
        clearInterval(connectionTimerRef.current);
      }
    };
  }, [isConnected]);

  const initializeAnonymousChat = async () => {
    console.log('🎭 Initializing anonymous chat...');
    
    // Generate anonymous ID
    const anonId = `anon_${Math.random().toString(36).substr(2, 9)}`;
    setAnonymousId(anonId);

    // Add initial connection message
    const connectingMessage: AnonymousMessage = {
      id: Date.now().toString(),
      content: `Connecting to anonymous chat as ${anonId}...`,
      senderId: 'system',
      timestamp: new Date(),
      isSupport: true
    };
    setMessages([connectingMessage]);

    // Attempt to connect
    await attemptConnection(anonId);
  };

  const attemptConnection = async (anonId: string, retryCount = 0) => {
    try {
      console.log(`🎭 Connection attempt ${retryCount + 1}...`);
      setConnectionAttempts(retryCount + 1);

      // Ensure WebSocket connection
      const socket = connectWebSocket();
      
      if (!socket) {
        throw new Error('Failed to create WebSocket connection');
      }

      // Wait for connection with timeout
      const connectionPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000); // 10 second timeout

        if (socket.connected) {
          clearTimeout(timeout);
          resolve();
        } else {
          socket.once('connect', () => {
            clearTimeout(timeout);
            resolve();
          });
          
          socket.once('connect_error', (error) => {
            clearTimeout(timeout);
            reject(error);
          });
        }
      });

      await connectionPromise;

      // Setup event listeners
      setupEventListeners(socket);

      // Join chat room
      joinChatRoom(anonId);

      // Update connection status
      setIsConnected(true);
      setConnectionAttempts(0);

      // Add success message
      const successMessage: AnonymousMessage = {
        id: (Date.now() + 1).toString(),
        content: `✅ Connected successfully! Welcome to ${getCurrentRoom()?.name}. Your identity is completely private and secure.`,
        senderId: 'system',
        timestamp: new Date(),
        isSupport: true
      };
      setMessages(prev => [...prev.filter(m => !m.content.includes('Connecting')), successMessage]);

      toast.success('Connected to anonymous chat');

    } catch (error) {
      console.error('🎭 Connection failed:', error);
      
      if (retryCount < 3) {
        // Retry connection
        const retryMessage: AnonymousMessage = {
          id: (Date.now() + retryCount).toString(),
          content: `Connection failed. Retrying... (${retryCount + 1}/3)`,
          senderId: 'system',
          timestamp: new Date(),
          isSupport: true
        };
        setMessages(prev => [...prev, retryMessage]);

        reconnectTimeoutRef.current = setTimeout(() => {
          attemptConnection(anonId, retryCount + 1);
        }, 2000 * (retryCount + 1)); // Exponential backoff
      } else {
        // Final failure
        const failureMessage: AnonymousMessage = {
          id: (Date.now() + 10).toString(),
          content: `❌ Failed to connect to chat server. Please check your internet connection and try again. You can still browse other features of the platform.`,
          senderId: 'system',
          timestamp: new Date(),
          isSupport: true
        };
        setMessages(prev => [...prev, failureMessage]);
        
        toast.error('Failed to connect to chat server');
        setIsConnected(false);
      }
    }
  };

  const setupEventListeners = (socket: any) => {
    console.log('🎭 Setting up event listeners...');

    // Remove existing listeners to prevent duplicates
    socket.off('anonymous:message');
    socket.off('anonymous:typing');
    socket.off('anonymous:user-joined');
    socket.off('anonymous:user-left');
    socket.off('anonymous:room-stats');
    socket.off('disconnect');

    // Setup new listeners
    socket.on('anonymous:message', handleIncomingMessage);
    socket.on('anonymous:typing', handleTypingIndicator);
    socket.on('anonymous:user-joined', handleUserJoined);
    socket.on('anonymous:user-left', handleUserLeft);
    socket.on('anonymous:room-stats', handleRoomStats);
    
    socket.on('disconnect', (reason: string) => {
      console.log('🎭 WebSocket disconnected:', reason);
      setIsConnected(false);
      
      const disconnectMessage: AnonymousMessage = {
        id: Date.now().toString(),
        content: `Disconnected from chat: ${reason}. Attempting to reconnect...`,
        senderId: 'system',
        timestamp: new Date(),
        isSupport: true
      };
      setMessages(prev => [...prev, disconnectMessage]);
      
      // Attempt to reconnect
      if (anonymousId) {
        reconnectTimeoutRef.current = setTimeout(() => {
          attemptConnection(anonymousId);
        }, 3000);
      }
    });
  };

  const joinChatRoom = (anonId: string) => {
    console.log('🎭 Joining chat room:', { anonId, room: chatRoom, mood: userMood });
    
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('anonymous:join', { 
        anonymousId: anonId, 
        room: chatRoom,
        mood: userMood 
      });
    }
  };

  const disconnectFromChat = () => {
    console.log('🎭 Disconnecting from anonymous chat...');
    
    // Clear timeouts
    if (connectionTimerRef.current) {
      clearInterval(connectionTimerRef.current);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Leave chat room
    if (anonymousId && chatRoom && isConnected) {
      const socket = getSocket();
      if (socket) {
        socket.emit('anonymous:leave', { anonymousId, room: chatRoom });
      }
    }

    // Reset state
    setIsConnected(false);
    setConnectionTime(0);
    setMessages([]);
    setAnonymousId('');
    setConnectionAttempts(0);
  };

  const handleIncomingMessage = (data: any) => {
    console.log('🎭 Received anonymous message:', data);
    
    const message: AnonymousMessage = {
      id: data.id,
      content: data.content,
      senderId: data.senderId,
      timestamp: new Date(data.timestamp),
      mood: data.mood
    };

    setMessages(prev => [...prev, message]);

    // Play notification sound
    if (soundEnabled && message.senderId !== anonymousId) {
      playNotificationSound();
    }
  };

  const handleTypingIndicator = (data: any) => {
    if (data.senderId !== anonymousId) {
      setIsTyping(data.isTyping);
    }
  };

  const handleUserJoined = (data: any) => {
    if (data.anonymousId !== anonymousId) {
      const joinMessage: AnonymousMessage = {
        id: Date.now().toString(),
        content: `Someone joined the chat`,
        senderId: 'system',
        timestamp: new Date(),
        isSupport: true
      };
      setMessages(prev => [...prev, joinMessage]);
    }
  };

  const handleUserLeft = (data: any) => {
    const leaveMessage: AnonymousMessage = {
      id: Date.now().toString(),
      content: `Someone left the chat`,
      senderId: 'system',
      timestamp: new Date(),
      isSupport: true
    };
    setMessages(prev => [...prev, leaveMessage]);
  };

  const handleRoomStats = (data: any) => {
    console.log('🎭 Room stats updated:', data);
    setActiveUsers(data.activeUsers || 0);
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !isConnected || !anonymousId) {
      if (!isConnected) {
        toast.error('Not connected to chat server');
      }
      return;
    }

    const messageData = {
      id: Date.now().toString(),
      content: inputMessage,
      senderId: anonymousId,
      room: chatRoom,
      mood: userMood,
      timestamp: new Date()
    };

    console.log('🎭 Sending anonymous message:', messageData);

    // Add message to local state immediately for better UX
    const localMessage: AnonymousMessage = {
      id: messageData.id,
      content: messageData.content,
      senderId: messageData.senderId,
      timestamp: messageData.timestamp,
      mood: messageData.mood
    };
    setMessages(prev => [...prev, localMessage]);

    // Send via WebSocket
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('anonymous:message', messageData);
    }

    setInputMessage('');
    
    // Stop typing indicator
    if (socket && socket.connected) {
      socket.emit('anonymous:typing', { 
        senderId: anonymousId, 
        room: chatRoom, 
        isTyping: false 
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    // Send typing indicator
    if (isConnected && anonymousId) {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('anonymous:typing', { 
          senderId: anonymousId, 
          room: chatRoom, 
          isTyping: true 
        });

        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit('anonymous:typing', { 
            senderId: anonymousId, 
            room: chatRoom, 
            isTyping: false 
          });
        }, 2000);
      }
    }
  };

  const switchRoom = (roomId: string) => {
    if (roomId === chatRoom || !anonymousId || !isConnected) return;

    console.log('🎭 Switching room from', chatRoom, 'to', roomId);

    const socket = getSocket();
    if (socket && socket.connected) {
      // Leave current room
      socket.emit('anonymous:leave', { anonymousId, room: chatRoom });
      
      // Join new room
      socket.emit('anonymous:join', { 
        anonymousId, 
        room: roomId,
        mood: userMood 
      });
    }
    
    setChatRoom(roomId);
    setMessages([]);
    
    // Add room switch message
    const switchMessage: AnonymousMessage = {
      id: Date.now().toString(),
      content: `Switched to ${chatRooms.find(r => r.id === roomId)?.name} room`,
      senderId: 'system',
      timestamp: new Date(),
      isSupport: true
    };
    setMessages([switchMessage]);

    toast.success(`Switched to ${chatRooms.find(r => r.id === roomId)?.name}`);
  };

  const generateNewId = () => {
    const newId = `anon_${Math.random().toString(36).substr(2, 9)}`;
    const oldId = anonymousId;
    
    setAnonymousId(newId);
    
    if (isConnected) {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('anonymous:change-id', { oldId, newId, room: chatRoom });
      }
    }

    toast.success('New anonymous ID generated');
  };

  const reconnectManually = () => {
    if (anonymousId) {
      toast.info('Attempting to reconnect...');
      attemptConnection(anonymousId);
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors
      });
    } catch (error) {
      // Ignore audio errors
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentRoom = () => {
    return chatRooms.find(room => room.id === chatRoom);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="backdrop-blur-md bg-white/90 rounded-2xl border border-white/30 w-full max-w-4xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <UserX className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Anonymous Chat</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Secure & Private</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{activeUsers} online</span>
                </span>
                {isConnected && (
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(connectionTime)}</span>
                  </span>
                )}
                <span className={`flex items-center space-x-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                </span>
                {connectionAttempts > 0 && !isConnected && (
                  <span className="text-yellow-600 text-xs">
                    Attempt {connectionAttempts}/3
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isConnected && (
              <button
                onClick={reconnectManually}
                className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-all duration-200"
                title="Reconnect"
              >
                <Wifi className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                showSettings
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-white/20 text-gray-600 hover:bg-white/30'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-white/20 text-gray-600 hover:bg-white/30 rounded-lg transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-b border-white/20 bg-white/10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Mood Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Mood</label>
                  <div className="flex space-x-2">
                    {moods.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setUserMood(mood.value as any)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          userMood === mood.value
                            ? 'bg-purple-100 text-purple-600 scale-110'
                            : 'bg-white/20 hover:bg-white/30'
                        }`}
                        title={mood.value}
                      >
                        <span className="text-lg">{mood.emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Privacy Controls */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Privacy</label>
                  <div className="space-y-2">
                    <button
                      onClick={generateNewId}
                      className="flex items-center space-x-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 text-sm"
                    >
                      <Shuffle className="w-4 h-4" />
                      <span>New Anonymous ID</span>
                    </button>
                  </div>
                </div>

                {/* Sound Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Settings</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                        soundEnabled
                          ? 'bg-green-100 text-green-600'
                          : 'bg-white/20 text-gray-600 hover:bg-white/30'
                      }`}
                    >
                      {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      <span>Sound {soundEnabled ? 'On' : 'Off'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Room Selection */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Chat Rooms:</span>
            <span className="text-xs text-gray-500">Choose a topic-specific room</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {chatRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => switchRoom(room.id)}
                disabled={!isConnected}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  chatRoom === room.id
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                    : isConnected
                    ? 'bg-white/20 text-gray-700 hover:bg-white/30'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                title={room.description}
              >
                <span>{room.icon}</span>
                <span>{room.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Room Info */}
        <div className="px-4 py-2 bg-white/10 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getCurrentRoom()?.icon}</span>
              <div>
                <span className="font-medium text-gray-800">{getCurrentRoom()?.name}</span>
                <p className="text-xs text-gray-600">{getCurrentRoom()?.description}</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              ID: {anonymousId || 'Connecting...'}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.senderId === anonymousId ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${
                  message.senderId === anonymousId ? 'order-2' : 'order-1'
                }`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.isSupport
                      ? 'bg-blue-100 text-blue-800 text-center text-sm'
                      : message.senderId === anonymousId
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                      : 'bg-white/40 backdrop-blur-sm text-gray-800'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    <div className={`flex items-center justify-between mt-2 text-xs ${
                      message.senderId === anonymousId ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      {message.mood && !message.isSupport && (
                        <span className="flex items-center space-x-1">
                          <span>{moods.find(m => m.value === message.mood)?.emoji}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/20">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={isConnected ? `Send anonymous message to ${getCurrentRoom()?.name}...` : 'Connecting to chat...'}
              className="flex-1 px-4 py-3 rounded-xl backdrop-blur-md bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 disabled:opacity-50"
              disabled={!isConnected}
            />
            <motion.button
              whileHover={{ scale: isConnected ? 1.05 : 1 }}
              whileTap={{ scale: isConnected ? 0.95 : 1 }}
              onClick={sendMessage}
              disabled={!isConnected || !inputMessage.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Privacy Notice */}
          <div className="mt-3 text-xs text-gray-600 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-3 h-3" />
              <span>Your identity is completely anonymous and secure. Messages are not stored permanently.</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnonymousChat;