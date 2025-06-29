import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Briefcase, Users, BookOpen } from 'lucide-react';

interface QuickSuggestionsProps {
  onSuggestionClick: (suggestion: string, context: string) => void;
  language: string;
}

const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({ onSuggestionClick, language }) => {
  const suggestions = {
    en: [
      { text: "I'm feeling anxious about coming out", context: 'mental-health', icon: Heart },
      { text: "Help me find LGBTQ+ friendly jobs", context: 'job-search', icon: Briefcase },
      { text: "I need someone to talk to", context: 'mental-health', icon: Users },
      { text: "Tell me about pride events near me", context: 'general', icon: BookOpen },
      { text: "How do I deal with discrimination?", context: 'mental-health', icon: Heart },
      { text: "What are my rights in India?", context: 'general', icon: BookOpen }
    ],
    hi: [
      { text: "मैं बाहर आने को लेकर चिंतित हूं", context: 'mental-health', icon: Heart },
      { text: "LGBTQ+ मित्रवत नौकरियां खोजने में मदद करें", context: 'job-search', icon: Briefcase },
      { text: "मुझे किसी से बात करने की जरूरत है", context: 'mental-health', icon: Users },
      { text: "मेरे पास के प्राइड इवेंट्स के बारे में बताएं", context: 'general', icon: BookOpen }
    ]
  };

  const currentSuggestions = suggestions[language as keyof typeof suggestions] || suggestions.en;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {currentSuggestions.map((suggestion, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSuggestionClick(suggestion.text, suggestion.context)}
          className="flex items-center space-x-3 p-3 text-left bg-white/20 hover:bg-white/30 rounded-lg border border-white/30 transition-all duration-200 group"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <suggestion.icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-gray-700 group-hover:text-purple-600 transition-colors">
            {suggestion.text}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickSuggestions;