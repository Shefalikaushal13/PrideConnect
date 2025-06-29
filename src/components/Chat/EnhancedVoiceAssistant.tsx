import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle,
  Settings,
  Languages,
  Waveform,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import sarvamApi, { 
  sarvamLanguages, 
  handleVoiceConversation, 
  playBase64Audio,
  getSarvamVoices,
  validateSarvamApiKey
} from '../../utils/sarvamApi';

interface EnhancedVoiceAssistantProps {
  onVoiceMessage: (message: string) => void;
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  lastBotMessage?: string;
  context?: 'mental-health' | 'general' | 'job-search';
}

const EnhancedVoiceAssistant: React.FC<EnhancedVoiceAssistantProps> = ({ 
  onVoiceMessage, 
  currentLanguage,
  onLanguageChange,
  lastBotMessage = '',
  context = 'general'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAutoSpeak, setIsAutoSpeak] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState('meera');
  const [availableVoices, setAvailableVoices] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [lastResponseAudio, setLastResponseAudio] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  // Initialize component
  useEffect(() => {
    checkPermissions();
    loadVoices();
    validateApiKey();
  }, []);

  // Update voices when language changes
  useEffect(() => {
    loadVoices();
  }, [currentLanguage]);

  // Auto-speak bot responses
  useEffect(() => {
    if (isAutoSpeak && lastBotMessage && !isSpeaking && lastBotMessage.trim()) {
      speakText(lastBotMessage);
    }
  }, [lastBotMessage, isAutoSpeak, currentLanguage]);

  const validateApiKey = () => {
    const validation = validateSarvamApiKey();
    if (!validation.isValid) {
      toast.error(validation.message);
    }
  };

  const checkPermissions = async () => {
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

  const loadVoices = async () => {
    try {
      const voices = await getSarvamVoices(currentLanguage);
      setAvailableVoices(voices);
      
      // Set default voice if current selection is not available
      if (!voices.includes(selectedVoice)) {
        setSelectedVoice(voices[0] || 'meera');
      }
    } catch (error) {
      console.error('Error loading voices:', error);
      setAvailableVoices(['meera']);
    }
  };

  const startRecording = async () => {
    try {
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
      
      // Setup audio visualization
      setupAudioVisualization(stream);
      
      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        cleanup();
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success(`Recording in ${sarvamLanguages[currentLanguage as keyof typeof sarvamLanguages]?.nativeName}...`);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setPermissionStatus('denied');
      toast.error('Microphone access denied. Please enable microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
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

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      const result = await handleVoiceConversation(audioBlob, currentLanguage, context);
      
      if (result.transcript) {
        setTranscript(result.transcript);
        onVoiceMessage(result.transcript);
        
        // Store response audio for later playback
        if (result.responseAudio) {
          setLastResponseAudio(result.responseAudio);
          
          // Auto-play if enabled
          if (isAutoSpeak) {
            await playBase64Audio(result.responseAudio);
          }
        }
        
        toast.success('Voice message processed successfully!');
      } else {
        toast.error('Could not understand the audio. Please try again.');
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      toast.error('Failed to process voice input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = async (text: string) => {
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      const audioData = await sarvamApi.textToSpeech(text, currentLanguage, selectedVoice);
      
      if (audioData) {
        setLastResponseAudio(audioData);
        await playBase64Audio(audioData);
      } else {
        toast.error('Text-to-speech failed. Please try again.');
      }
    } catch (error) {
      console.error('TTS error:', error);
      toast.error('Text-to-speech not available.');
    } finally {
      setIsSpeaking(false);
    }
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadAudio = () => {
    if (lastResponseAudio) {
      const link = document.createElement('a');
      link.href = `data:audio/wav;base64,${lastResponseAudio}`;
      link.download = `voice-response-${Date.now()}.wav`;
      link.click();
    }
  };

  return (
    <div className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <Waveform className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Enhanced Voice Assistant</h3>
            <p className="text-sm text-gray-600">Powered by Sarvam AI</p>
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
            title="Auto-speak responses"
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
              {/* Language Selection */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">Language</label>
                <select
                  value={currentLanguage}
                  onChange={(e) => onLanguageChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {Object.entries(sarvamLanguages).map(([code, lang]) => (
                    <option key={code} value={code}>{lang.nativeName}</option>
                  ))}
                </select>
              </div>
              
              {/* Voice Selection */}
              <div>
                <label className="block text-xs text-gray-600 mb-2">Voice</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {availableVoices.map((voice) => (
                    <option key={voice} value={voice}>
                      {voice.charAt(0).toUpperCase() + voice.slice(1)}
                    </option>
                  ))}
                </select>
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
            <span className="text-sm font-medium text-red-700">Microphone Access Required</span>
          </div>
          <p className="text-xs text-red-600 mb-2">
            Voice features require microphone access. Please enable it in your browser settings.
          </p>
        </div>
      )}

      {/* Main Voice Interface */}
      <div className="flex items-center space-x-4 mb-6">
        {/* Record Button */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing || permissionStatus === 'denied'}
            className={`relative p-6 rounded-full transition-all duration-200 ${
              isRecording
                ? 'bg-red-500 text-white shadow-lg'
                : isProcessing
                ? 'bg-yellow-500 text-white'
                : permissionStatus === 'denied'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg'
            }`}
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
            
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
          <div className="flex items-center space-x-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${
              isRecording ? 'bg-red-500 animate-pulse' : 
              isProcessing ? 'bg-yellow-500 animate-pulse' :
              isSpeaking ? 'bg-blue-500 animate-pulse' : 
              'bg-gray-400'
            }`} />
            <span className="text-sm font-medium text-gray-800">
              {isRecording ? 'Listening...' : 
               isProcessing ? 'Processing...' :
               isSpeaking ? 'Speaking...' : 
               'Ready'}
            </span>
            <span className="text-xs text-gray-500">
              {sarvamLanguages[currentLanguage as keyof typeof sarvamLanguages]?.nativeName}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {lastBotMessage && (
              <button
                onClick={() => speakText(lastBotMessage)}
                disabled={isRecording || isProcessing}
                className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-lg transition-all duration-200 ${
                  isSpeaking
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-white/20 text-gray-600 hover:bg-white/30'
                }`}
              >
                {isSpeaking ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isSpeaking ? 'Stop' : 'Speak Response'}</span>
              </button>
            )}
            
            {lastResponseAudio && (
              <button
                onClick={downloadAudio}
                className="flex items-center space-x-1 px-3 py-1 text-xs bg-white/20 text-gray-600 hover:bg-white/30 rounded-lg transition-all duration-200"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
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
      {isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center space-x-1 mb-6"
        >
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-gradient-to-t from-pink-500 to-purple-600 rounded-full"
              animate={{
                height: [4, 4 + audioLevel * 30 + Math.random() * 15, 4]
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
            'मुझे मदद चाहिए', // I need help in Hindi
            'Connect me with therapist',
            'Find jobs for me',
            'Tell me about events'
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
          <span>Real-time speech recognition in {sarvamLanguages[currentLanguage as keyof typeof sarvamLanguages]?.nativeName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-1 h-1 bg-blue-500 rounded-full" />
          <span>Natural voice synthesis with multiple voice options</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-1 h-1 bg-green-500 rounded-full" />
          <span>Automatic language detection and translation</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-1 h-1 bg-pink-500 rounded-full" />
          <span>Powered by Sarvam AI for accurate Indian language support</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVoiceAssistant;