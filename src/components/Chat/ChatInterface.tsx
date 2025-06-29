import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Heart, Brain, Briefcase, Globe, Mic, UserCheck, Settings } from 'lucide-react';
import { ChatMessage } from '../../types';
import { generateChatResponse, analyzeSentiment, detectCrisis } from '../../utils/geminiApi';
import { supportedLanguages } from '../../utils/languages';
import VoiceAssistant from './VoiceAssistant';
import TherapistConnect from './TherapistConnect';
import AnimatedResponse from './AnimatedResponse';
import toast from 'react-hot-toast';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI mental health companion. I\'m here to provide support, resources, and connect you with professional help when needed. How are you feeling today?',
      sender: 'bot',
      timestamp: new Date(),
      sentiment: 'positive'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [chatContext, setChatContext] = useState<'mental-health' | 'general' | 'job-search'>('mental-health');
  const [showTherapistConnect, setShowTherapistConnect] = useState(false);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load user profile from localStorage
    const userData = localStorage.getItem('prideconnect_user');
    if (userData) {
      setUserProfile(JSON.parse(userData));
      setSelectedLanguage(JSON.parse(userData).preferredLanguage || 'en');
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickSuggestions = [
    { text: 'I\'m feeling anxious about coming out', context: 'mental-health' as const },
    { text: 'Help me find LGBTQ+ friendly jobs', context: 'job-search' as const },
    { text: 'I need someone to talk to', context: 'mental-health' as const },
    { text: 'Connect me with a therapist', context: 'mental-health' as const },
    { text: 'Tell me about pride events', context: 'general' as const },
    { text: 'I\'m struggling with family acceptance', context: 'mental-health' as const }
  ];

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    // Check for therapist connection request
    if (text.toLowerCase().includes('therapist') || text.toLowerCase().includes('counselor') || text.toLowerCase().includes('professional help')) {
      setShowTherapistConnect(true);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: text,
      sender: 'user',
      timestamp: new Date(),
      language: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Crisis detection
      const crisisAnalysis = await detectCrisis(text);
      if (crisisAnalysis.isCrisis) {
        const crisisMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `I'm concerned about what you've shared. Please know that you're not alone and help is available. Here are immediate resources:\n\n${crisisAnalysis.resources.join('\n')}\n\nWould you like me to connect you with a crisis counselor right now?`,
          sender: 'bot',
          timestamp: new Date(),
          language: selectedLanguage,
          sentiment: 'neutral'
        };
        setMessages(prev => [...prev, crisisMessage]);
        setIsLoading(false);
        return;
      }

      const sentiment = await analyzeSentiment(text);
      
      // Personalized context based on user profile
      let personalizedContext = chatContext;
      if (userProfile?.seekingTherapist && sentiment === 'negative') {
        personalizedContext = 'mental-health';
      }

      const response = await generateChatResponse(text, selectedLanguage, personalizedContext, userProfile);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date(),
        language: selectedLanguage,
        sentiment: 'positive'
      };

      setMessages(prev => [...prev, botMessage]);

      // Show therapist suggestion for negative sentiment
      if (sentiment === 'negative' && userProfile?.seekingTherapist) {
        setTimeout(() => {
          const therapistSuggestion: ChatMessage = {
            id: (Date.now() + 2).toString(),
            content: 'I notice you might be going through a difficult time. Would you like me to connect you with one of our LGBTQ+ affirming therapists for professional support?',
            sender: 'bot',
            timestamp: new Date(),
            language: selectedLanguage,
            sentiment: 'positive'
          };
          setMessages(prev => [...prev, therapistSuggestion]);
        }, 2000);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m having trouble responding right now. Please try again, or if this is urgent, consider reaching out to a crisis helpline.',
        sender: 'bot',
        timestamp: new Date(),
        sentiment: 'neutral'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceMessage = (voiceText: string) => {
    handleSendMessage(voiceText);
  };

  const getLastBotMessage = () => {
    const botMessages = messages.filter(m => m.sender === 'bot');
    return botMessages.length > 0 ? botMessages[botMessages.length - 1].content : '';
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentEmoji = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Mental Health Companion
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your personalized, multilingual AI assistant for mental health support, career guidance, and community connections.
          </p>
          {userProfile && (
            <div className="mt-4 text-sm text-gray-600">
              Welcome back, {userProfile.name}! 👋
            </div>
          )}
        </motion.div>

        {/* Enhanced Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 justify-center mb-6"
        >
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-4 py-2 rounded-lg backdrop-blur-md bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {supportedLanguages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName}
              </option>
            ))}
          </select>

          {/* Context Selector */}
          <div className="flex rounded-lg backdrop-blur-md bg-white/20 border border-white/30 overflow-hidden">
            {[
              { value: 'mental-health', icon: Brain, label: 'Mental Health' },
              { value: 'job-search', icon: Briefcase, label: 'Career' },
              { value: 'general', icon: Heart, label: 'General' }
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setChatContext(value as any)}
                className={`flex items-center space-x-2 px-4 py-2 transition-all duration-200 ${
                  chatContext === value
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-700 hover:bg-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* Voice Assistant Toggle */}
          <button
            onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              showVoiceAssistant
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'backdrop-blur-md bg-white/20 border border-white/30 text-gray-700 hover:bg-white/30'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span className="text-sm">Voice Assistant</span>
          </button>

          {/* Therapist Connect */}
          <button
            onClick={() => setShowTherapistConnect(!showTherapistConnect)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              showTherapistConnect
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'backdrop-blur-md bg-white/20 border border-white/30 text-gray-700 hover:bg-white/30'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span className="text-sm">Therapists</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              showSettings
                ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white'
                : 'backdrop-blur-md bg-white/20 border border-white/30 text-gray-700 hover:bg-white/30'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </button>
        </motion.div>

        {/* Voice Assistant */}
        <AnimatePresence>
          {showVoiceAssistant && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <VoiceAssistant
                onVoiceMessage={handleVoiceMessage}
                currentLanguage={selectedLanguage}
                lastBotMessage={getLastBotMessage()}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Chat Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Voice Features</span>
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      voiceEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      voiceEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Auto-speak Responses</span>
                  <button
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      autoSpeak ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      autoSpeak ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Therapist Connect */}
        <AnimatePresence>
          {showTherapistConnect && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <TherapistConnect />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 shadow-xl overflow-hidden"
        >
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'bg-white/40 backdrop-blur-sm text-gray-800'
                    }`}>
                      {message.sender === 'bot' ? (
                        <AnimatedResponse text={message.content} />
                      ) : (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                      
                      <div className={`flex items-center justify-between mt-2 text-xs ${
                        message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.sentiment && (
                          <span className={`flex items-center space-x-1 ${
                            message.sender === 'user' ? 'text-white/70' : getSentimentColor(message.sentiment)
                          }`}>
                            <span>{getSentimentEmoji(message.sentiment)}</span>
                            <span>{message.sentiment}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
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
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-6 py-3 border-t border-white/20">
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => {
                    setChatContext(suggestion.context);
                    handleSendMessage(suggestion.text);
                  }}
                  className="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-full border border-white/30 transition-all duration-200 text-gray-700"
                >
                  {suggestion.text}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-white/20">
            <div className="flex space-x-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder={`Type your message in ${supportedLanguages.find(l => l.code === selectedLanguage)?.nativeName}...`}
                className="flex-1 px-4 py-3 rounded-xl backdrop-blur-md bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                disabled={isLoading}
              />
              
              {/* Voice Input Button */}
              {voiceEnabled && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowVoiceAssistant(!showVoiceAssistant)}
                  className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  <Mic className="w-5 h-5" />
                </motion.button>
              )}
              
              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Crisis Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 p-4 backdrop-blur-md bg-red-50/50 rounded-xl border border-red-200/50"
        >
          <p className="text-sm text-red-700 mb-2">
            <strong>Crisis Support:</strong> If you're in immediate danger or having thoughts of self-harm, please reach out immediately.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-red-600">
            <span><strong>National:</strong> 9152987821</span>
            <span><strong>LGBTQ+ Crisis:</strong> +91-9999-46-5428</span>
            <span><strong>Emergency:</strong> 112</span>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-4 text-sm text-gray-600"
        >
          <p>
            This AI assistant provides support but is not a replacement for professional mental health care.
            All conversations are private and secure.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatInterface;