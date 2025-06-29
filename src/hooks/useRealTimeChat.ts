import { useState, useEffect, useRef } from 'react';
import { chatService, setupRealtimeHandlers, realtimeActions } from '../services/api';
import { ChatMessage } from '../types';
import toast from 'react-hot-toast';

export const useRealTimeChat = (userId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const sessionIdRef = useRef<string>(Date.now().toString());

  useEffect(() => {
    if (userId) {
      loadChatHistory();
      setupRealtimeChat();
    }
  }, [userId]);

  const loadChatHistory = async () => {
    if (!userId) return;
    
    try {
      const history = await chatService.getAIChatHistory(userId, 5);
      if (history.length > 0) {
        const lastSession = history[0];
        setMessages(lastSession.messages || []);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const setupRealtimeChat = () => {
    setupRealtimeHandlers({
      onChatMessage: (message) => {
        setMessages(prev => [...prev, message]);
      },
      onCrisisAlert: (alert) => {
        toast.error(alert.message, {
          duration: 10000,
          icon: '🚨'
        });
      }
    });
    
    setIsConnected(true);
  };

  const sendMessage = async (content: string, context: string = 'general') => {
    if (!userId) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      language: 'en'
    };

    setMessages(prev => [...prev, userMessage]);

    // Send to real-time chat if in a group/community chat
    realtimeActions.sendChatMessage(content, userId, sessionIdRef.current);

    // Save to database
    try {
      await chatService.saveAIChat(
        userId,
        [...messages, userMessage],
        sessionIdRef.current,
        context
      );
    } catch (error) {
      console.error('Failed to save chat:', error);
    }
  };

  const sendCrisisAlert = (severity: 'low' | 'medium' | 'high', message: string, location?: string) => {
    if (!userId) return;
    
    realtimeActions.sendCrisisAlert(userId, severity, message, location);
  };

  const clearChat = () => {
    setMessages([]);
    sessionIdRef.current = Date.now().toString();
  };

  return {
    messages,
    setMessages,
    isConnected,
    typingUsers,
    sendMessage,
    sendCrisisAlert,
    clearChat
  };
};