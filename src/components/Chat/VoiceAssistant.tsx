import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Play, Pause, RotateCcw, AlertTriangle, Settings } from 'lucide-react';
import sarvamApi, { validateSarvamApiKey, sarvamLanguages } from '../../utils/sarvamApi';
import toast from 'react-hot-toast';

interface VoiceAssistantProps {
  onVoiceMessage: (message: string) => void;
  currentLanguage: string;
  isListening?: boolean;
  lastBotMessage?: string;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ 
  onVoiceMessage, 
  currentLanguage,
  isListening = false,
  lastBotMessage = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAutoSpeak, setIsAutoSpeak] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'fallback'>('checking');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('meera');
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const recordingTimerRef = useRef<NodeJS.Timeout>();
  const recognitionRef = useRef<any>(null);

  // Language mapping for speech recognition
  const languageMap: { [key: string]: string } = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'bn': 'bn-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'mr': 'mr-IN',
    'gu': 'gu-IN',
    'kn': 'kn-IN',
    'ml': 'ml-IN',
    'pa': 'pa-IN',
    'ur': 'ur-IN'
  };

  // Check API status and permissions on mount
  useEffect(() => {
    checkApiStatus();
    checkMicrophonePermissions();
    initializeSpeechRecognition();
  }, []);

  // Update when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      const recognitionLang = languageMap[currentLanguage] || 'en-US';
      recognitionRef.current.lang = recognitionLang;
    }
  }, [currentLanguage]);

  // Auto-speak bot responses
  useEffect(() => {
    if (isAutoSpeak && lastBotMessage && !isSpeaking && lastBotMessage.trim()) {
      speakText(lastBotMessage);
    }
  }, [lastBotMessage, isAutoSpeak, currentLanguage]);

  const checkApiStatus = () => {
    const validation = validateSarvamApiKey();
    if (validation.isValid) {
      setApiStatus('available');
      console.log('🎤 Sarvam AI voice features available');
    } else {
      setApiStatus('fallback');
      console.log('🎤 Using browser voice features (Sarvam API not configured)');
    }
  };

  const checkMicrophonePermissions = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermissionStatus(permission.state);
        
        permission.onchange = () => {
          setPermissionStatus(permission.state);
        };
      }
    } catch (error) {
      console.warn('Could not check microphone permissions:', error);
    }
  };

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = languageMap[currentLanguage] || 'en-US';

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setSpeechError(null);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        console.log('🎤 Final transcript:', finalTranscript);
        onVoiceMessage(finalTranscript);
        setIsRecording(false);
        toast.success('Voice message sent!');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('🎤 Speech recognition error:', event.error);
      setIsRecording(false);
      
      let errorMessage = 'Voice recognition failed. ';
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage += 'Microphone access denied. Please enable microphone permissions.';
          setPermissionStatus('denied');
          break;
        case 'network':
          errorMessage += 'Network error. Please check your internet connection.';
          break;
        case 'no-speech':
          errorMessage += 'No speech detected. Please speak clearly and try again.';
          break;
        case 'audio-capture':
          errorMessage += 'Audio capture failed. Please check your microphone.';
          break;
        case 'service-not-allowed':
          errorMessage += 'Speech service not available. Try using Chrome or Firefox.';
          break;
        default:
          errorMessage += 'Please try again or use a different browser.';
      }
      
      setSpeechError(errorMessage);
      toast.error(errorMessage);
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  };

  const startRecording = async () => {
    if (!recognitionRef.current) {
      const errorMsg = 'Speech recognition not supported in this browser. Please use Chrome, Firefox, or Safari.';
      setSpeechError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (permissionStatus === 'denied') {
      const errorMsg = 'Microphone access denied. Please enable microphone permissions and refresh the page.';
      setSpeechError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      // Request microphone access and setup audio visualization
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });
      
      streamRef.current = stream;
      setPermissionStatus('granted');
      setupAudioVisualization(stream);

      // Start speech recognition
      setIsRecording(true);
      setTranscript('');
      setSpeechError(null);
      setRecordingTime(0);
      
      // Update language before starting
      const recognitionLang = languageMap[currentLanguage] || 'en-US';
      recognitionRef.current.lang = recognitionLang;
      
      recognitionRef.current.start();
      
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      const languageName = getLanguageName(currentLanguage);
      toast.success(`🎤 Listening in ${languageName}... Speak now!`);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      setPermissionStatus('denied');
      
      let errorMessage = 'Microphone access failed. ';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Please enable microphone permissions in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No microphone found. Please connect a microphone.';
        } else if (error.name === 'NotReadableError') {
          errorMessage += 'Microphone is being used by another application.';
        } else {
          errorMessage += 'Please check your microphone settings.';
        }
      }
      
      setSpeechError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    
    setIsRecording(false);
    setAudioLevel(0);
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    
    cleanup();
  };

  const setupAudioVisualization = (stream: MediaStream) => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error setting up audio visualization:', error);
    }
  };

  const updateAudioLevel = () => {
    if (analyserRef.current && isRecording) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
      
      animationRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  const speakText = async (text: string) => {
    if (isSpeaking) {
      // Stop current speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      
      // Try Sarvam TTS first if available
      if (apiStatus === 'available') {
        try {
          console.log('🔊 Attempting Sarvam TTS...');
          const audioData = await sarvamApi.textToSpeech(text, currentLanguage, selectedVoice);
          
          if (audioData && audioData !== 'fallback') {
            console.log('🔊 Playing Sarvam TTS audio');
            await sarvamApi.playBase64Audio(audioData);
            setIsSpeaking(false);
            return;
          }
        } catch (sarvamError) {
          console.warn('🔊 Sarvam TTS failed, using browser fallback:', sarvamError);
        }
      }
      
      // Fall back to browser speech synthesis
      console.log('🔊 Using browser speech synthesis');
      await useBrowserTTS(text);
      
    } catch (error) {
      console.error('🔊 Error in text-to-speech:', error);
      setIsSpeaking(false);
      toast.error('Text-to-speech not available.');
    }
  };

  const useBrowserTTS = (text: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const languageCode = sarvamLanguages[currentLanguage as keyof typeof sarvamLanguages]?.code || 'en-US';
      
      utterance.lang = languageCode;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };
      
      utterance.onerror = (error) => {
        setIsSpeaking(false);
        reject(error);
      };

      // Find appropriate voice
      const voices = window.speechSynthesis.getVoices();
      const targetLang = languageCode.split('-')[0];
      const voice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang.toLowerCase())) || 
                   voices.find(v => v.lang.startsWith('en')) || 
                   voices[0];
      
      if (voice) {
        utterance.voice = voice;
      }

      window.speechSynthesis.speak(utterance);
    });
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setAudioLevel(0);
  };

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionStatus('granted');
      setSpeechError(null);
      toast.success('Microphone access granted!');
    } catch (error) {
      setPermissionStatus('denied');
      setSpeechError('Microphone access denied. Please enable it in your browser settings.');
      toast.error('Please enable microphone access in your browser settings.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLanguageName = (code: string) => {
    const sarvamLang = sarvamLanguages[code as keyof typeof sarvamLanguages];
    if (sarvamLang) return sarvamLang.nativeName;
    
    const names: { [key: string]: string } = {
      'en': 'English',
      'hi': 'हिन्दी',
      'bn': 'বাংলা',
      'ta': 'தமিழ்',
      'te': 'తెలుగు',
      'mr': 'मराठी',
      'gu': 'ગુજરાતી',
      'kn': 'ಕನ್ನಡ',
      'ml': 'മലയാളം',
      'pa': 'ਪੰਜਾਬੀ',
      'ur': 'اردو'
    };
    return names[code] || 'English';
  };

  // Check if speech recognition is supported
  const isSupported = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

  if (!isSupported) {
    return (
      <div className="flex items-center justify-center p-4 backdrop-blur-md bg-red-50/50 rounded-xl border border-red-200/50">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 text-sm font-medium mb-1">
            Voice features not supported
          </p>
          <p className="text-red-500 text-xs">
            Please use Chrome, Firefox, or Safari for voice functionality.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Multilingual Voice Assistant</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{getLanguageName(currentLanguage)}</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              apiStatus === 'available' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-blue-100 text-blue-600'
            }`}>
              {apiStatus === 'available' ? 'AI Enhanced' : 'Browser Mode'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
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
            onClick={() => setIsAutoSpeak(!isAutoSpeak)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isAutoSpeak
                ? 'bg-blue-100 text-blue-600'
                : 'bg-white/20 text-gray-600 hover:bg-white/30'
            }`}
            title="Auto-speak bot responses"
          >
            {isAutoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
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
            className="mb-6 p-4 bg-white/10 rounded-xl border border-white/20"
          >
            <h4 className="text-sm font-medium text-gray-800 mb-3">Voice Settings</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Voice Selection for Sarvam */}
              {apiStatus === 'available' && (
                <div>
                  <label className="block text-xs text-gray-600 mb-2">Voice (Sarvam AI)</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="meera">Meera (Female)</option>
                    <option value="arjun">Arjun (Male)</option>
                    <option value="kavya">Kavya (Female)</option>
                  </select>
                </div>
              )}
              
              {/* Language Info */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">Current Language</label>
                <div className="px-3 py-2 text-sm bg-white/20 border border-white/30 rounded-lg">
                  {getLanguageName(currentLanguage)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permission Status */}
      {permissionStatus === 'denied' && (
        <div className="mb-4 p-3 bg-red-50/50 border border-red-200/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-700">Microphone Access Needed</span>
          </div>
          <p className="text-xs text-red-600 mb-2">
            Voice input requires microphone access. Please enable it to use voice features.
          </p>
          <button
            onClick={requestMicrophonePermission}
            className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
          >
            Request Permission
          </button>
        </div>
      )}

      {/* Error Display */}
      {speechError && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-orange-50/50 border border-orange-200/50 rounded-lg"
          >
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-orange-700 mb-1">Voice Recognition Issue</div>
                <div className="text-xs text-orange-600">{speechError}</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Voice Input Section */}
      <div className="flex items-center space-x-4 mb-4">
        {/* Record Button */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={permissionStatus === 'denied'}
            className={`relative p-6 rounded-full transition-all duration-200 ${
              isRecording
                ? 'bg-red-500 text-white shadow-lg'
                : permissionStatus === 'denied'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg'
            }`}
          >
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            
            {/* Audio level indicator */}
            {isRecording && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-white/30"
                animate={{ scale: [1, 1 + audioLevel * 0.5, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
            )}
          </motion.button>
          
          {/* Recording timer */}
          {isRecording && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-red-600 font-mono">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>

        {/* Status and Controls */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              isRecording ? 'bg-red-500 animate-pulse' : 
              isSpeaking ? 'bg-blue-500 animate-pulse' : 
              speechError ? 'bg-orange-500' :
              'bg-gray-400'
            }`} />
            <span className="text-sm font-medium text-gray-800">
              {isRecording ? 'Listening...' : 
               isSpeaking ? 'Speaking...' : 
               speechError ? 'Error' :
               'Ready'}
            </span>
            <span className="text-xs text-gray-500">
              {apiStatus === 'available' ? '(AI Enhanced)' : '(Browser Mode)'}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            {lastBotMessage && (
              <button
                onClick={() => speakText(lastBotMessage)}
                disabled={isRecording}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-all duration-200 ${
                  isSpeaking
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-white/20 text-gray-600 hover:bg-white/30'
                }`}
              >
                {isSpeaking ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span className="text-xs">
                  {isSpeaking ? 'Stop' : 'Speak Response'}
                </span>
              </button>
            )}
            
            {isRecording && (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-1 px-3 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audio Visualization */}
      {isRecording && !speechError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center space-x-1 mb-4"
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-gradient-to-t from-pink-500 to-purple-600 rounded-full"
              animate={{
                height: [4, 4 + audioLevel * 20 + Math.random() * 10, 4]
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                delay: i * 0.03
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Transcript Display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-white/30 rounded-lg mb-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800 mb-2">You said:</div>
                <div className="text-gray-700">{transcript}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Voice Commands */}
      <div className="border-t border-white/20 pt-4">
        <div className="text-sm font-medium text-gray-800 mb-3">Quick Voice Commands:</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            currentLanguage === 'hi' ? 'मुझे मदद चाहिए' : 'I need help',
            currentLanguage === 'hi' ? 'थेरेपिस्ट से मिलाएं' : 'Connect me with therapist',
            currentLanguage === 'hi' ? 'नौकरी खोजें' : 'Find jobs for me',
            currentLanguage === 'hi' ? 'इवेंट्स बताएं' : 'Tell me about events'
          ].map((command, index) => (
            <button
              key={index}
              onClick={() => onVoiceMessage(command)}
              className="text-xs p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 text-left"
            >
              "{command}"
            </button>
          ))}
        </div>
      </div>

      {/* Features Info */}
      <div className="mt-4 text-xs text-gray-600 space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-1 bg-purple-500 rounded-full" />
          <span>
            {apiStatus === 'available' 
              ? `AI-powered speech recognition in ${getLanguageName(currentLanguage)}`
              : `Browser speech recognition in ${getLanguageName(currentLanguage)}`
            }
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-1 h-1 bg-blue-500 rounded-full" />
          <span>
            {apiStatus === 'available' 
              ? 'Natural voice synthesis with multiple voice options'
              : 'Browser voice synthesis'
            }
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-1 h-1 bg-green-500 rounded-full" />
          <span>Real-time speech recognition and audio visualization</span>
        </div>
        {apiStatus === 'available' && (
          <div className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-pink-500 rounded-full" />
            <span>Enhanced by Sarvam AI for better Indian language support</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;