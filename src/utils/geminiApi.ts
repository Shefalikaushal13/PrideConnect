import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Check if API key is properly configured
const isApiKeyValid = API_KEY && API_KEY !== 'your_gemini_api_key_here' && API_KEY.trim() !== '';

let genAI: GoogleGenerativeAI | null = null;

// Initialize Gemini AI only if we have a valid API key
if (isApiKeyValid) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

// Enhanced chat response with RAG (Retrieval Augmented Generation)
export const generateChatResponse = async (
  message: string,
  language: string = 'en',
  context: 'mental-health' | 'general' | 'job-search' = 'general',
  userProfile?: any
): Promise<string> => {
  // Check if API key is configured
  if (!isApiKeyValid) {
    console.warn('Gemini API key not configured. Using fallback responses.');
    return getFallbackResponse(message, language, context, userProfile);
  }

  try {
    if (!genAI) {
      throw new Error('Gemini AI not initialized');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build context-aware system prompt with RAG
    let systemPrompt = '';
    let ragContext = '';

    // Add user profile context for personalization
    if (userProfile) {
      ragContext += `User Profile: Name: ${userProfile.name}, Location: ${userProfile.location}, Interests: ${userProfile.interests?.join(', ')}, Seeking Therapist: ${userProfile.seekingTherapist}. `;
    }

    // Add relevant knowledge base context
    if (context === 'mental-health') {
      ragContext += `
      Mental Health Resources for LGBTQ+ in India:
      - National Suicide Prevention Helpline: 9152987821
      - LGBTQ+ Crisis Support: +91-9999-46-5428
      - Vandrevala Foundation: 1860-2662-345
      - iCall Psychosocial Helpline: 9152987821
      
      Common LGBTQ+ Mental Health Challenges in India:
      - Family rejection and social stigma
      - Workplace discrimination
      - Identity concealment stress
      - Lack of affirming healthcare
      - Legal and social barriers
      
      Coping Strategies:
      - Building chosen family and support networks
      - Connecting with LGBTQ+ affirming therapists
      - Joining support groups and community organizations
      - Practicing self-care and mindfulness
      - Advocating for inclusive policies
      `;

      systemPrompt = `You are a compassionate AI mental health companion specifically designed for the LGBTQ+ community in India. 
      You have access to comprehensive knowledge about LGBTQ+ mental health resources, challenges, and support systems in India.
      
      Your role is to provide:
      - Empathetic, culturally sensitive support
      - Practical coping strategies and resources
      - Crisis intervention when needed
      - Connections to professional help
      - Validation and affirmation of identity
      
      Guidelines:
      - Always be supportive, non-judgmental, and affirming
      - Acknowledge unique challenges faced by LGBTQ+ individuals in India
      - Provide practical, actionable advice
      - Encourage professional help when appropriate
      - Be aware of cultural and family dynamics in Indian society
      - Use inclusive language and validate their identity
      - If someone expresses suicidal thoughts, provide crisis resources immediately
      - Personalize responses based on user profile when available
      
      Context Information: ${ragContext}
      
      Respond in ${language === 'en' ? 'English' : getLanguagePrompt(language)}.
      Keep responses warm, supportive, and actionable.`;
    } else if (context === 'job-search') {
      ragContext += `
      LGBTQ+ Friendly Companies in India:
      - Tech: Microsoft, Google, IBM, Accenture, TCS, Infosys
      - Consulting: McKinsey, BCG, Deloitte, PwC
      - Startups: Flipkart, Zomato, Swiggy, Byju's
      - Government: Various ministries with diversity initiatives
      
      Workplace Rights:
      - Section 377 decriminalized (2018)
      - Transgender Persons Act (2019)
      - Equal opportunity employment
      - Anti-discrimination policies
      
      Job Search Strategies:
      - Research company diversity policies
      - Look for Pride ERGs and inclusive benefits
      - Network within LGBTQ+ professional groups
      - Prepare for disclosure decisions
      - Negotiate inclusive benefits
      `;

      systemPrompt = `You are a career counselor specializing in LGBTQ+ inclusive workplaces in India. 
      You have comprehensive knowledge about LGBTQ+ friendly companies, workplace rights, and career strategies.
      
      Your expertise includes:
      - LGBTQ+ friendly companies and organizations in India
      - Workplace rights and legal protections
      - Interview strategies and disclosure decisions
      - Building inclusive professional networks
      - Navigating workplace challenges and discrimination
      - Career advancement strategies for LGBTQ+ professionals
      - Salary negotiation and inclusive benefits
      
      Context Information: ${ragContext}
      
      Provide helpful, practical job search advice while being sensitive to the unique challenges 
      LGBTQ+ individuals face in Indian workplaces.
      
      Respond in ${language === 'en' ? 'English' : getLanguagePrompt(language)}.`;
    } else {
      ragContext += `
      LGBTQ+ Rights and Resources in India:
      - Legal Status: Section 377 decriminalized, Transgender rights recognized
      - Support Organizations: Humsafar Trust, Naz Foundation, LABIA
      - Pride Events: Delhi, Mumbai, Bangalore, Chennai, Kolkata Pride
      - Healthcare: LGBTQ+ affirming doctors and clinics
      - Community Centers: Safe spaces in major cities
      
      Cultural Context:
      - Family acceptance challenges
      - Regional variations in acceptance
      - Religious and cultural considerations
      - Language and terminology preferences
      `;

      systemPrompt = `You are a helpful assistant for PrideConnect, an LGBTQ+ community platform in India. 
      You have extensive knowledge about LGBTQ+ rights, resources, community, and culture in India.
      
      You provide information about:
      - LGBTQ+ rights and legal status in India
      - Community events, Pride celebrations, and support groups
      - Educational content and awareness resources
      - Safe spaces and community building
      - Cultural sensitivity and family dynamics
      - Regional resources and support networks
      
      Context Information: ${ragContext}
      
      Be inclusive, supportive, informative, and culturally aware of the Indian LGBTQ+ experience.
      
      Respond in ${language === 'en' ? 'English' : getLanguagePrompt(language)}.`;
    }

    const prompt = `${systemPrompt}\n\nUser message: ${message}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    
    // Check if it's an API key error specifically
    if (error instanceof Error && error.message.includes('API key')) {
      console.warn('Invalid API key detected. Please check your VITE_GEMINI_API_KEY environment variable.');
    }
    
    return getFallbackResponse(message, language, context, userProfile);
  }
};

// Enhanced fallback response system
const getFallbackResponse = (
  message: string,
  language: string,
  context: 'mental-health' | 'general' | 'job-search',
  userProfile?: any
): string => {
  const lowerMessage = message.toLowerCase();
  
  // Crisis detection in fallback
  const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'hurt myself', 'no point living'];
  const isCrisis = crisisKeywords.some(keyword => lowerMessage.includes(keyword));
  
  if (isCrisis) {
    const crisisResponses = {
      en: "I'm very concerned about you right now. Please reach out for immediate help: National Suicide Prevention: 9152987821, LGBTQ+ Crisis Support: +91-9999-46-5428, Emergency: 112. You matter, and there are people who want to help you. Please don't face this alone.",
      hi: "मैं अभी आपके बारे में बहुत चिंतित हूँ। कृपया तुरंत सहायता के लिए संपर्क करें: राष्ट्रीय आत्महत्या रोकथाम: 9152987821, LGBTQ+ संकट सहायता: +91-9999-46-5428, आपातकाल: 112। आप महत्वपूर्ण हैं, और ऐसे लोग हैं जो आपकी मदद करना चाहते हैं।"
    };
    return crisisResponses[language as keyof typeof crisisResponses] || crisisResponses.en;
  }
  
  // Context-specific fallback responses
  if (context === 'mental-health') {
    const responses = {
      en: "I understand you're reaching out for support, and that takes courage. While I'm having technical difficulties connecting to my full knowledge base, I want you to know that your feelings are valid and you're not alone in this journey. The LGBTQ+ community in India faces unique challenges, but there's also incredible strength and resilience within our community. Consider reaching out to local LGBTQ+ support groups or affirming mental health professionals. Remember: you are worthy of love and acceptance exactly as you are. 🌈💜",
      hi: "मैं समझता हूँ कि आप सहारे के लिए पहुँच रहे हैं, और इसमें साहस लगता है। हालांकि मुझे अपने पूर्ण ज्ञान आधार से जुड़ने में तकनीकी कठिनाई हो रही है, मैं चाहता हूँ कि आप जानें कि आपकी भावनाएं वैध हैं और आप इस यात्रा में अकेले नहीं हैं। भारत में LGBTQ+ समुदाय अनूठी चुनौतियों का सामना करता है, लेकिन हमारे समुदाय में अविश्वसनीय शक्ति और लचीलापन भी है। 🌈💜"
    };
    return responses[language as keyof typeof responses] || responses.en;
  }
  
  if (context === 'job-search') {
    const responses = {
      en: "I'm here to help with your career journey! While I'm experiencing technical issues, I can share that many companies in India are becoming more LGBTQ+ inclusive. Consider exploring opportunities with tech companies like Microsoft, Google, TCS, and Infosys, which have strong diversity and inclusion policies. Your skills and authentic self are both valuable assets. Don't let anyone make you feel otherwise. Consider joining professional LGBTQ+ networks for additional support and opportunities.",
      hi: "मैं आपकी करियर यात्रा में मदद के लिए यहाँ हूँ! हालांकि मुझे तकनीकी समस्याएं हो रही हैं, मैं साझा कर सकता हूँ कि भारत में कई कंपनियां अधिक LGBTQ+ समावेशी बन रही हैं। Microsoft, Google, TCS, और Infosys जैसी तकनीकी कंपनियों के साथ अवसरों का पता लगाने पर विचार करें।"
    };
    return responses[language as keyof typeof responses] || responses.en;
  }
  
  // General fallback responses
  const generalResponses = {
    en: "Hello! I'm here to help and support you. While I'm having some technical difficulties right now, please know that you're part of a wonderful, diverse community that celebrates and values you. Feel free to explore our community features, events, and resources. If you need immediate support, consider reaching out to local LGBTQ+ organizations or support groups. You're not alone in this journey! 🌈",
    hi: "नमस्ते! मैं यहाँ आपकी मदद और समर्थन के लिए हूँ। हालांकि मुझे अभी कुछ तकनीकी कठिनाइयाँ हो रही हैं, कृपया जानें कि आप एक अद्भुत, विविधतापूर्ण समुदाय का हिस्सा हैं जो आपका जश्न मनाता है और आपको महत्व देता है। 🌈"
  };
  
  return generalResponses[language as keyof typeof generalResponses] || generalResponses.en;
};

const getLanguagePrompt = (languageCode: string): string => {
  const languageMap: { [key: string]: string } = {
    'hi': 'Hindi (हिन्दी)',
    'bn': 'Bengali (বাংলা)',
    'te': 'Telugu (తెలుగు)',
    'mr': 'Marathi (मराठी)',
    'ta': 'Tamil (தமிழ்)',
    'gu': 'Gujarati (ગુજરાતી)',
    'kn': 'Kannada (ಕನ್ನಡ)',
    'ml': 'Malayalam (മലയാളം)',
    'pa': 'Punjabi (ਪੰਜਾਬੀ)',
    'or': 'Odia (ଓଡ଼ିଆ)',
    'as': 'Assamese (অসমীয়া)',
    'ur': 'Urdu (اردو)'
  };
  
  return languageMap[languageCode] || 'English';
};

// Enhanced sentiment analysis with fallback
export const analyzeSentiment = async (text: string, context?: string): Promise<'positive' | 'negative' | 'neutral'> => {
  if (!isApiKeyValid || !genAI) {
    // Fallback sentiment analysis based on keywords
    return getFallbackSentiment(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Analyze the sentiment of this text in the context of LGBTQ+ mental health and experiences. 
    Consider factors like:
    - Coming out stress and family acceptance
    - Identity affirmation vs. rejection
    - Community support vs. isolation
    - Workplace discrimination concerns
    - Mental health struggles specific to LGBTQ+ individuals
    
    Respond with only one word: "positive", "negative", or "neutral". 
    
    Text: "${text}"
    Context: ${context || 'general'}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const sentiment = response.text().toLowerCase().trim();
    
    if (sentiment.includes('positive')) return 'positive';
    if (sentiment.includes('negative')) return 'negative';
    return 'neutral';
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return getFallbackSentiment(text);
  }
};

const getFallbackSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
  const negativeKeywords = ['sad', 'depressed', 'anxious', 'scared', 'rejected', 'alone', 'hate', 'discrimination', 'bullying', 'hurt', 'pain', 'struggle'];
  const positiveKeywords = ['happy', 'proud', 'accepted', 'loved', 'supported', 'confident', 'celebration', 'community', 'joy', 'grateful', 'amazing'];
  
  const lowerText = text.toLowerCase();
  const negativeCount = negativeKeywords.filter(word => lowerText.includes(word)).length;
  const positiveCount = positiveKeywords.filter(word => lowerText.includes(word)).length;
  
  if (negativeCount > positiveCount) return 'negative';
  if (positiveCount > negativeCount) return 'positive';
  return 'neutral';
};

// Enhanced motivational message generation with fallback
export const generateMotivationalMessage = async (language: string = 'en', userProfile?: any): Promise<string> => {
  if (!isApiKeyValid || !genAI) {
    return getFallbackMotivationalMessage(language, userProfile);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    let personalContext = '';
    if (userProfile) {
      personalContext = `User is from ${userProfile.location}, interested in ${userProfile.interests?.join(', ')}.`;
    }
    
    const prompt = `Generate a personalized, uplifting motivational message for LGBTQ+ individuals in India. 
    The message should be:
    - Encouraging and affirming
    - Culturally sensitive to Indian context
    - Acknowledging their strength and resilience
    - Celebrating their identity
    - Offering hope and community support
    
    ${personalContext}
    
    Respond in ${language === 'en' ? 'English' : getLanguagePrompt(language)}.
    Keep it under 100 words and make it personal and heartfelt.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating motivational message:', error);
    return getFallbackMotivationalMessage(language, userProfile);
  }
};

const getFallbackMotivationalMessage = (language: string, userProfile?: any): string => {
  const messages = [
    {
      en: "You are valid, you are loved, and you belong. Your identity is a beautiful part of who you are, and the world is better with your authentic self in it. Remember, you're part of a strong, resilient community that celebrates and supports you. 🌈💜",
      hi: "आप मान्य हैं, आप प्रिय हैं, और आप यहाँ के हैं। आपकी पहचान आपके व्यक्तित्व का एक सुंदर हिस्सा है, और आपके सच्चे स्वरूप के साथ दुनिया बेहतर है। याद रखें, आप एक मजबूत, लचीले समुदाय का हिस्सा हैं जो आपका जश्न मनाता है और आपका समर्थन करता है। 🌈💜"
    },
    {
      en: "Your courage to be yourself in a world that often asks you to be someone else is extraordinary. Every day you choose authenticity, you inspire others to do the same. You are making a difference just by being you. 🌟",
      hi: "एक ऐसी दुनिया में खुद होने का आपका साहस जो अक्सर आपसे कोई और बनने को कहती है, असाधारण है। हर दिन जब आप प्रामाणिकता चुनते हैं, आप दूसरों को भी ऐसा करने के लिए प्रेरित करते हैं। 🌟"
    }
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  return randomMessage[language as keyof typeof randomMessage] || randomMessage.en;
};

// Crisis detection with enhanced fallback
export const detectCrisis = async (message: string): Promise<{ isCrisis: boolean; severity: 'low' | 'medium' | 'high'; resources: string[] }> => {
  const resources = [
    'National Suicide Prevention: 9152987821',
    'LGBTQ+ Crisis Support: +91-9999-46-5428',
    'Emergency Services: 112',
    'Vandrevala Foundation: 1860-2662-345',
    'iCall Psychosocial Helpline: 9152987821'
  ];

  if (!isApiKeyValid || !genAI) {
    return getFallbackCrisisDetection(message, resources);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Analyze this message for signs of mental health crisis, particularly in the context of LGBTQ+ experiences. 
    Look for indicators of:
    - Suicidal ideation or self-harm
    - Severe depression or hopelessness
    - Panic attacks or severe anxiety
    - Family rejection or abuse
    - Discrimination or bullying
    - Substance abuse
    
    Respond in JSON format:
    {
      "isCrisis": boolean,
      "severity": "low" | "medium" | "high",
      "indicators": ["list of concerning elements"],
      "recommendedAction": "immediate action needed"
    }
    
    Message: "${message}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    try {
      const analysis = JSON.parse(response.text());
      
      return {
        isCrisis: analysis.isCrisis,
        severity: analysis.severity,
        resources
      };
    } catch (parseError) {
      return getFallbackCrisisDetection(message, resources);
    }
  } catch (error) {
    console.error('Error detecting crisis:', error);
    return getFallbackCrisisDetection(message, resources);
  }
};

const getFallbackCrisisDetection = (message: string, resources: string[]) => {
  const highCrisisKeywords = ['suicide', 'kill myself', 'end it all', 'want to die', 'no point living'];
  const mediumCrisisKeywords = ['hurt myself', 'self harm', 'cutting', 'hopeless', 'give up'];
  const lowCrisisKeywords = ['depressed', 'anxious', 'overwhelmed', 'struggling', 'can\'t cope'];
  
  const lowerMessage = message.toLowerCase();
  
  const hasHighCrisis = highCrisisKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasMediumCrisis = mediumCrisisKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasLowCrisis = lowCrisisKeywords.some(keyword => lowerMessage.includes(keyword));
  
  if (hasHighCrisis) {
    return { isCrisis: true, severity: 'high' as const, resources };
  } else if (hasMediumCrisis) {
    return { isCrisis: true, severity: 'medium' as const, resources };
  } else if (hasLowCrisis) {
    return { isCrisis: true, severity: 'low' as const, resources };
  }
  
  return { isCrisis: false, severity: 'low' as const, resources: [] };
};

// Real-time conversation context management
export const updateConversationContext = (messages: any[], userProfile?: any) => {
  const recentMessages = messages.slice(-5); // Last 5 messages
  const userMessages = recentMessages.filter(m => m.sender === 'user');
  
  // Analyze conversation patterns
  const topics = userMessages.map(m => m.content).join(' ');
  const sentiments = recentMessages.map(m => m.sentiment).filter(Boolean);
  
  return {
    recentTopics: topics,
    sentimentTrend: sentiments,
    conversationLength: messages.length,
    userEngagement: userMessages.length / recentMessages.length,
    lastInteraction: messages[messages.length - 1]?.timestamp
  };
};

// API key validation utility
export const validateApiKey = (): { isValid: boolean; message: string } => {
  if (!API_KEY) {
    return {
      isValid: false,
      message: 'VITE_GEMINI_API_KEY environment variable is not set. Please add it to your .env file.'
    };
  }
  
  if (API_KEY === 'your_gemini_api_key_here') {
    return {
      isValid: false,
      message: 'Please replace the placeholder API key with your actual Gemini API key from Google AI Studio.'
    };
  }
  
  if (API_KEY.trim() === '') {
    return {
      isValid: false,
      message: 'VITE_GEMINI_API_KEY is empty. Please provide a valid API key.'
    };
  }
  
  return {
    isValid: true,
    message: 'API key appears to be configured correctly.'
  };
};