import axios from 'axios';

// Sarvam AI API configuration
const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY;
const SARVAM_BASE_URL = 'https://api.sarvam.ai';

// Check if API key is properly configured
const isApiKeyValid = SARVAM_API_KEY && 
                     SARVAM_API_KEY !== 'your_sarvam_api_key_here' && 
                     SARVAM_API_KEY !== 'sk_zki2f2qi_Gx5KklYFU4C0tYBrkVApKQBs' && // Remove example key
                     SARVAM_API_KEY.trim() !== '' &&
                     SARVAM_API_KEY.startsWith('sk_'); // Ensure it's a valid Sarvam key format

// Create axios instance for Sarvam API
const sarvamApi = axios.create({
  baseURL: SARVAM_BASE_URL,
  headers: {
    'Authorization': `Bearer ${SARVAM_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Language mapping for Sarvam API
export const sarvamLanguages = {
  'en': { code: 'en-IN', name: 'English', nativeName: 'English' },
  'hi': { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
  'bn': { code: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা' },
  'te': { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు' },
  'mr': { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी' },
  'ta': { code: 'ta-IN', name: 'Tamil', nativeName: 'தமিழ்' },
  'gu': { code: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  'kn': { code: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  'ml': { code: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം' },
  'pa': { code: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  'or': { code: 'or-IN', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  'as': { code: 'as-IN', name: 'Assamese', nativeName: 'অসমীয়া' },
  'ur': { code: 'ur-IN', name: 'Urdu', nativeName: 'اردو' }
};

// Enhanced Text-to-Speech using Sarvam API with robust fallback
export const sarvamTextToSpeech = async (
  text: string, 
  language: string = 'en',
  speaker: string = 'meera'
): Promise<string | null> => {
  console.log('🎤 TTS Request:', { 
    text: text.substring(0, 50) + '...', 
    language, 
    speaker, 
    apiKeyValid: isApiKeyValid 
  });

  if (!isApiKeyValid) {
    console.warn('🎤 Sarvam API key not configured, using fallback TTS');
    return 'fallback'; // Indicate fallback should be used
  }

  try {
    const languageCode = sarvamLanguages[language as keyof typeof sarvamLanguages]?.code || 'en-IN';
    
    console.log('🎤 Calling Sarvam TTS API with:', { languageCode, speaker });
    
    const response = await sarvamApi.post('/text-to-speech', {
      inputs: [text],
      target_language_code: languageCode,
      speaker: speaker,
      pitch: 0,
      pace: 1.0,
      loudness: 1.0,
      speech_sample_rate: 8000,
      enable_preprocessing: true,
      model: "bulbul:v1"
    });

    if (response.data && response.data.audios && response.data.audios.length > 0) {
      console.log('🎤 Sarvam TTS successful');
      return response.data.audios[0];
    }

    console.warn('🎤 Sarvam TTS returned no audio data');
    return 'fallback';
  } catch (error) {
    console.error('🎤 Sarvam TTS error:', error);
    
    // Check for specific error types
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error('🎤 Invalid Sarvam API key');
      } else if (error.response?.status === 429) {
        console.error('🎤 Sarvam API rate limit exceeded');
      } else if (error.code === 'ECONNABORTED') {
        console.error('🎤 Sarvam API timeout');
      }
    }
    
    return 'fallback';
  }
};

// Enhanced Speech-to-Text using Sarvam API with robust fallback
export const sarvamSpeechToText = async (
  audioBlob: Blob,
  language: string = 'en'
): Promise<string | null> => {
  console.log('🎤 STT Request:', { 
    language, 
    apiKeyValid: isApiKeyValid, 
    blobSize: audioBlob.size 
  });

  if (!isApiKeyValid) {
    console.warn('🎤 Sarvam API key not configured, STT not available');
    return null;
  }

  try {
    const languageCode = sarvamLanguages[language as keyof typeof sarvamLanguages]?.code || 'en-IN';
    
    // Convert blob to base64
    const base64Audio = await blobToBase64(audioBlob);
    
    console.log('🎤 Calling Sarvam STT API with:', { languageCode });
    
    const response = await sarvamApi.post('/speech-to-text', {
      language_code: languageCode,
      audio: base64Audio,
      model: "saaras:v1"
    });

    if (response.data && response.data.transcript) {
      console.log('🎤 Sarvam STT successful:', response.data.transcript);
      return response.data.transcript;
    }

    console.warn('🎤 Sarvam STT returned no transcript');
    return null;
  } catch (error) {
    console.error('🎤 Sarvam STT error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        console.error('🎤 Invalid Sarvam API key for STT');
      } else if (error.response?.status === 429) {
        console.error('🎤 Sarvam STT API rate limit exceeded');
      }
    }
    
    return null;
  }
};

// Enhanced Translation using Sarvam API
export const sarvamTranslate = async (
  text: string,
  sourceLanguage: string = 'en',
  targetLanguage: string = 'hi'
): Promise<string | null> => {
  console.log('🌐 Translation Request:', { 
    text: text.substring(0, 50) + '...', 
    sourceLanguage, 
    targetLanguage, 
    apiKeyValid: isApiKeyValid 
  });

  if (!isApiKeyValid) {
    console.warn('🌐 Sarvam API key not configured, translation not available');
    return text; // Return original text if no translation available
  }

  // Don't translate if source and target are the same
  if (sourceLanguage === targetLanguage) {
    return text;
  }

  try {
    const sourceLangCode = sarvamLanguages[sourceLanguage as keyof typeof sarvamLanguages]?.code || 'en-IN';
    const targetLangCode = sarvamLanguages[targetLanguage as keyof typeof sarvamLanguages]?.code || 'hi-IN';
    
    console.log('🌐 Calling Sarvam Translation API with:', { sourceLangCode, targetLangCode });
    
    const response = await sarvamApi.post('/translate', {
      input: text,
      source_language_code: sourceLangCode,
      target_language_code: targetLangCode,
      speaker_gender: "Female",
      mode: "formal",
      model: "mayura:v1",
      enable_preprocessing: true
    });

    if (response.data && response.data.translated_text) {
      console.log('🌐 Sarvam translation successful');
      return response.data.translated_text;
    }

    console.warn('🌐 Sarvam translation returned no result');
    return text; // Return original if translation fails
  } catch (error) {
    console.error('🌐 Sarvam translation error:', error);
    return text; // Return original text on error
  }
};

// Enhanced multilingual chat response with Sarvam translation
export const generateMultilingualResponse = async (
  message: string,
  targetLanguage: string = 'en',
  context: 'mental-health' | 'general' | 'job-search' = 'general'
): Promise<{ text: string; audio?: string }> => {
  try {
    console.log('🤖 Generating multilingual response:', { 
      message: message.substring(0, 50) + '...', 
      targetLanguage, 
      context 
    });

    // First get response in English (assuming Gemini works best in English)
    const { generateChatResponse } = await import('./geminiApi');
    const englishResponse = await generateChatResponse(message, 'en', context);
    
    let finalText = englishResponse;
    
    // Translate to target language if not English
    if (targetLanguage !== 'en') {
      const translatedText = await sarvamTranslate(englishResponse, 'en', targetLanguage);
      if (translatedText && translatedText !== englishResponse) {
        finalText = translatedText;
      }
    }
    
    // Generate audio using Sarvam TTS
    const audioData = await sarvamTextToSpeech(finalText, targetLanguage);
    
    return {
      text: finalText,
      audio: audioData && audioData !== 'fallback' ? audioData : undefined
    };
  } catch (error) {
    console.error('🤖 Multilingual response generation error:', error);
    
    // Fallback response in the target language
    const fallbackResponses: { [key: string]: string } = {
      'en': 'I apologize, but I\'m having trouble responding right now. Please try again.',
      'hi': 'मुझे खुशी है कि आप यहाँ हैं। कृपया फिर से कोशिश करें।',
      'bn': 'আমি দুঃখিত, কিন্তু আমি এখন উত্তর দিতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
      'te': 'నేను క్ష‌మాపణలు, కానీ నేను ఇప్పుడు ప్రతిస్పందించడంలో ఇబ్బంది పడుతున్నాను। దయచేసి మళ్లీ ప్రయత్నించండి।',
      'ta': 'நான் மன்னிக்கிறேன், ஆனால் நான் இப்போது பதிலளிப்பதில் சிக்கல் உள்ளது। தயவுசெய்து மீண்டும் முயற்சிக்கவும்।',
      'mr': 'मला माफ करा, पण मला आत्ता उत्तर देण्यात अडचण येत आहे. कृपया पुन्हा प्रयत्न करा.',
      'gu': 'હું માફી માંગુ છું, પરંતુ મને અત્યારે જવાબ આપવામાં મુશ્કેલી આવી રહી છે. કૃપા કરીને ફરીથી પ્રયાસ કરો.',
      'kn': 'ನಾನು ಕ್ಷಮಿಸಿ, ಆದರೆ ನಾನು ಈಗ ಪ್ರತಿಕ್ರಿಯಿಸಲು ತೊಂದರೆ ಹೊಂದಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      'ml': 'ഞാൻ ക്ഷമാപണം, പക്ഷേ എനിക്ക് ഇപ്പോൾ പ്രതികരിക്കാൻ പ്രശ്നമുണ്ട്. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
      'pa': 'ਮੈਂ ਮਾਫੀ ਚਾਹੁੰਦਾ ਹਾਂ, ਪਰ ਮੈਨੂੰ ਹੁਣ ਜਵਾਬ ਦੇਣ ਵਿੱਚ ਮੁਸ਼ਕਲ ਆ ਰਹੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
      'or': 'ମୁଁ କ୍ଷମା ପ୍ରାର୍ଥନା କରୁଛି, କିନ୍ତୁ ମୁଁ ବର୍ତ୍ତମାନ ଉତ୍ତର ଦେବାରେ ଅସୁବିଧା ହେଉଛି। ଦୟାକରି ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।',
      'as': 'মই ক্ষমা বিচাৰো, কিন্তু মই এতিয়া উত্তৰ দিয়াত অসুবিধা পাইছো। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
      'ur': 'میں معذرت خواہ ہوں، لیکن مجھے ابھی جواب دینے میں مشکل ہو رہی ہے۔ براہ کرم دوبارہ کوشش کریں۔'
    };
    
    return { 
      text: fallbackResponses[targetLanguage] || fallbackResponses['en']
    };
  }
};

// Voice conversation handler with improved error handling
export const handleVoiceConversation = async (
  audioBlob: Blob,
  language: string = 'en',
  context: 'mental-health' | 'general' | 'job-search' = 'general'
): Promise<{ transcript: string; response: string; responseAudio?: string }> => {
  try {
    console.log('🎙️ Handling voice conversation:', { 
      language, 
      context, 
      blobSize: audioBlob.size 
    });

    // Convert speech to text using Sarvam API
    const transcript = await sarvamSpeechToText(audioBlob, language);
    
    if (!transcript) {
      throw new Error('Could not transcribe audio');
    }

    console.log('🎙️ Transcript received:', transcript);

    // Generate multilingual response
    const { text: response, audio: responseAudio } = await generateMultilingualResponse(
      transcript,
      language,
      context
    );
    
    return {
      transcript,
      response,
      responseAudio
    };
  } catch (error) {
    console.error('🎙️ Voice conversation error:', error);
    
    const errorResponses: { [key: string]: string } = {
      'en': 'I had trouble understanding your voice message. Please try speaking again or type your message.',
      'hi': 'मुझे आपका वॉयस मैसेज समझने में परेशानी हुई। कृपया फिर से बोलने की कोशिश करें या अपना संदेश टाइप करें।',
      'bn': 'আমি আপনার ভয়েস বার্তা বুঝতে সমস্যা হয়েছে। অনুগ্রহ করে আবার বলার চেষ্টা করুন বা আপনার বার্তা টাইপ করুন।',
      'te': 'మీ వాయిస్ సందేశాన్ని అర్థం చేసుకోవడంలో నాకు ఇబ్బంది ఉంది। దయచేసి మళ్లీ మాట్లాడటానికి ప్రయత్నించండి లేదా మీ సందేశాన్ని టైప్ చేయండి।',
      'ta': 'உங்கள் குரல் செய்தியைப் புரிந்துகொள்வதில் எனக்கு சிக்கல் இருந்தது. தயவுசெய்து மீண்டும் பேச முயற்சிக்கவும் அல்லது உங்கள் செய்தியை தட்டச்சு செய்யவும்।',
      'mr': 'तुमचा व्हॉइस मेसेज समजण्यात मला अडचण आली. कृपया पुन्हा बोलण्याचा प्रयत्न करा किंवा तुमचा मेसेज टाइप करा.',
      'gu': 'તમારા વૉઇસ મેસેજને સમજવામાં મને મુશ્કેલી પડી. કૃપા કરીને ફરીથી બોલવાનો પ્રયાસ કરો અથવા તમારો મેસેજ ટાઇપ કરો.',
      'kn': 'ನಿಮ್ಮ ಧ್ವನಿ ಸಂದೇಶವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವಲ್ಲಿ ನನಗೆ ತೊಂದರೆ ಇತ್ತು. ದಯವಿಟ್ಟು ಮತ್ತೆ ಮಾತನಾಡಲು ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ.',
      'ml': 'നിങ്ങളുടെ വോയ്‌സ് സന്ദേശം മനസ്സിലാക്കാൻ എനിക്ക് ബുദ്ധിമുട്ടുണ്ടായി. ദയവായി വീണ്ടും സംസാരിക്കാൻ ശ്രമിക്കുക അല്ലെങ്കിൽ നിങ്ങളുടെ സന്ദേശം ടൈപ്പ് ചെയ്യുക.',
      'pa': 'ਮੈਨੂੰ ਤੁਹਾਡੇ ਵੌਇਸ ਮੈਸੇਜ ਨੂੰ ਸਮਝਣ ਵਿੱਚ ਮੁਸ਼ਕਲ ਆਈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਬੋਲਣ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ ਆਪਣਾ ਮੈਸੇਜ ਟਾਈਪ ਕਰੋ।',
      'ur': 'مجھے آپ کا وائس میسج سمجھنے میں مشکل ہوئی۔ براہ کرم دوبارہ بولنے کی کوشش کریں یا اپنا پیغام ٹائپ کریں۔'
    };
    
    return {
      transcript: '',
      response: errorResponses[language] || errorResponses['en'],
      responseAudio: undefined
    };
  }
};

// Language detection using enhanced fallback
export const detectLanguage = async (text: string): Promise<string | null> => {
  if (!isApiKeyValid) {
    // Enhanced language detection based on script and common words
    const patterns = {
      hi: /[\u0900-\u097F]|और|है|में|को|से|का|की|के|यह|वह|हम|आप|मैं|तुम|हो|हूं|गया|गई|करना|होना|जाना|आना|देना|लेना|कहना|देखना|मिलना|चलना|बनना|रहना/,
      bn: /[\u0980-\u09FF]|এবং|হয়|মধ্যে|থেকে|এর|এই|সেই|আমরা|আপনি|আমি|তুমি|হও|হই|গেছে|গেল|করা|হওয়া|যাওয়া|আসা|দেওয়া|নেওয়া|বলা|দেখা|পাওয়া|চলা|হওয়া|থাকা/,
      te: /[\u0C00-\u0C7F]|మరియు|ఉంది|లో|నుండి|యొక్క|ఈ|ఆ|మేము|మీరు|నేను|నువ్వు|ఉన్నాను|ఉన్నావు|అయ్యాను|అయ్యావు|చేయడం|ఉండటం|వెళ్లడం|రావడం|ఇవ్వడం|తీసుకోవడం|చెప్పడం|చూడడం|పొందడం|వెళ్లడం|అవ్వడం|ఉండటం/,
      ta: /[\u0B80-\u0BFF]|மற்றும்|உள்ளது|இல்|இருந்து|இன்|இந்த|அந்த|நாம்|நீங்கள்|நான்|நீ|இருக்கிறேன்|இருக்கிறாய்|ஆனேன்|ஆனாய்|செய்வது|இருப்பது|போவது|வருவது|கொடுப்பது|எடுப்பது|சொல்வது|பார்ப்பது|பெறுவது|செல்வது|ஆவது|இருப்பது/,
      mr: /[\u0900-\u097F]|आणि|आहे|मध्ये|पासून|चा|हा|तो|आम्ही|तुम्ही|मी|तू|आहे|आहेस|झाले|झालेस|करणे|असणे|जाणे|येणे|देणे|घेणे|म्हणणे|पाहणे|मिळणे|चालणे|होणे|राहणे/,
      gu: /[\u0A80-\u0AFF]|અને|છે|માં|થી|ના|આ|તે|અમે|તમે|હું|તું|છું|છો|થયું|થયો|કરવું|હોવું|જવું|આવવું|આપવું|લેવું|કહેવું|જોવું|મળવું|ચાલવું|થવું|રહેવું/,
      kn: /[\u0C80-\u0CFF]|ಮತ್ತು|ಇದೆ|ನಲ್ಲಿ|ಇಂದ|ದ|ಈ|ಆ|ನಾವು|ನೀವು|ನಾನು|ನೀನು|ಇದ್ದೇನೆ|ಇದ್ದೀಯ|ಆದೆ|ಆದೀಯ|ಮಾಡುವುದು|ಇರುವುದು|ಹೋಗುವುದು|ಬರುವುದು|ಕೊಡುವುದು|ತೆಗೆದುಕೊಳ್ಳುವುದು|ಹೇಳುವುದು|ನೋಡುವುದು|ಪಡೆಯುವುದು|ನಡೆಯುವುದು|ಆಗುವುದು|ಇರುವುದು/,
      ml: /[\u0D00-\u0D7F]|ഒപ്പം|ഉണ്ട്|ൽ|നിന്ന്|ന്റെ|ഈ|ആ|ഞങ്ങൾ|നിങ്ങൾ|ഞാൻ|നീ|ഉണ്ട്|ഉണ്ട്|ആയി|ആയി|ചെയ്യുക|ആകുക|പോകുക|വരിക|കൊടുക്കുക|എടുക്കുക|പറയുക|കാണുക|കിട്ടുക|നടക്കുക|ആകുക|ഇരിക്കുക/,
      pa: /[\u0A00-\u0A7F]|ਅਤੇ|ਹੈ|ਵਿੱਚ|ਤੋਂ|ਦਾ|ਇਹ|ਉਹ|ਅਸੀਂ|ਤੁਸੀਂ|ਮੈਂ|ਤੂੰ|ਹਾਂ|ਹੈਂ|ਹੋਇਆ|ਹੋਈ|ਕਰਨਾ|ਹੋਣਾ|ਜਾਣਾ|ਆਉਣਾ|ਦੇਣਾ|ਲੈਣਾ|ਕਹਿਣਾ|ਵੇਖਣਾ|ਮਿਲਣਾ|ਚੱਲਣਾ|ਬਣਨਾ|ਰਹਿਣਾ/,
      ur: /[\u0600-\u06FF]|اور|ہے|میں|سے|کا|یہ|وہ|ہم|آپ|میں|تم|ہوں|ہو|ہوا|ہوئی|کرنا|ہونا|جانا|آنا|دینا|لینا|کہنا|دیکھنا|ملنا|چلنا|بننا|رہنا/
    };
    
    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        console.log('🌐 Language detected (fallback):', lang);
        return lang;
      }
    }
    
    return 'en';
  }

  try {
    console.log('🌐 Detecting language for text:', text.substring(0, 50) + '...');
    const response = await sarvamApi.post('/language-detection', {
      input: text
    });

    if (response.data && response.data.language_code) {
      const detectedLang = Object.entries(sarvamLanguages).find(
        ([_, lang]) => lang.code === response.data.language_code
      );
      
      const result = detectedLang ? detectedLang[0] : 'en';
      console.log('🌐 Language detected (Sarvam):', result);
      return result;
    }

    return null;
  } catch (error) {
    console.error('🌐 Language detection error:', error);
    return null;
  }
};

// Sentiment analysis in multiple languages
export const multilingualSentimentAnalysis = async (
  text: string,
  language: string = 'en'
): Promise<'positive' | 'negative' | 'neutral'> => {
  try {
    // If not English, translate to English first for better sentiment analysis
    let textToAnalyze = text;
    if (language !== 'en') {
      const translatedText = await sarvamTranslate(text, language, 'en');
      if (translatedText && translatedText !== text) {
        textToAnalyze = translatedText;
      }
    }
    
    // Use existing sentiment analysis
    const { analyzeSentiment } = await import('./geminiApi');
    return await analyzeSentiment(textToAnalyze);
  } catch (error) {
    console.error('🎭 Multilingual sentiment analysis error:', error);
    return 'neutral';
  }
};

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Helper function to play base64 audio
export const playBase64Audio = (base64Audio: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      if (base64Audio === 'fallback') {
        resolve(); // Fallback TTS already handled
        return;
      }
      
      console.log('🔊 Playing Sarvam audio...');
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      
      audio.onended = () => {
        console.log('🔊 Audio playback completed');
        resolve();
      };
      
      audio.onerror = (error) => {
        console.error('🔊 Audio playback failed:', error);
        reject(new Error('Audio playback failed'));
      };
      
      audio.oncanplaythrough = () => {
        audio.play().catch(reject);
      };
      
      audio.load();
    } catch (error) {
      console.error('🔊 Audio setup failed:', error);
      reject(error);
    }
  });
};

// API key validation with detailed feedback
export const validateSarvamApiKey = (): { isValid: boolean; message: string } => {
  if (!SARVAM_API_KEY) {
    return {
      isValid: false,
      message: 'VITE_SARVAM_API_KEY environment variable is not set. Using browser speech features as fallback.'
    };
  }
  
  if (SARVAM_API_KEY === 'your_sarvam_api_key_here' || SARVAM_API_KEY === 'sk_zki2f2qi_Gx5KklYFU4C0tYBrkVApKQBs') {
    return {
      isValid: false,
      message: 'Please replace the placeholder Sarvam API key with your actual API key. Using browser speech features as fallback.'
    };
  }
  
  if (SARVAM_API_KEY.trim() === '') {
    return {
      isValid: false,
      message: 'VITE_SARVAM_API_KEY is empty. Using browser speech features as fallback.'
    };
  }
  
  if (!SARVAM_API_KEY.startsWith('sk_')) {
    return {
      isValid: false,
      message: 'Invalid Sarvam API key format. Keys should start with "sk_". Using browser speech features as fallback.'
    };
  }
  
  return {
    isValid: true,
    message: 'Sarvam AI API is configured and ready for enhanced multilingual features.'
  };
};

// Get available voices for TTS
export const getSarvamVoices = async (language: string = 'en'): Promise<string[]> => {
  const voicesByLanguage: { [key: string]: string[] } = {
    'en': ['meera', 'arjun', 'kavya'],
    'hi': ['meera', 'arjun', 'kavya'],
    'bn': ['meera', 'arjun'],
    'te': ['meera', 'arjun'],
    'ta': ['meera', 'arjun'],
    'mr': ['meera', 'arjun'],
    'gu': ['meera', 'arjun'],
    'kn': ['meera', 'arjun'],
    'ml': ['meera', 'arjun'],
    'pa': ['meera', 'arjun'],
    'or': ['meera'],
    'as': ['meera'],
    'ur': ['meera', 'arjun']
  };
  
  return voicesByLanguage[language] || voicesByLanguage['en'];
};

export default {
  textToSpeech: sarvamTextToSpeech,
  speechToText: sarvamSpeechToText,
  translate: sarvamTranslate,
  generateMultilingualResponse,
  handleVoiceConversation,
  detectLanguage,
  multilingualSentimentAnalysis,
  playBase64Audio,
  validateSarvamApiKey,
  getSarvamVoices,
  languages: sarvamLanguages
};