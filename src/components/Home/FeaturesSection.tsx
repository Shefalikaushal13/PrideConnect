import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Briefcase, 
  Users, 
  BookOpen, 
  Calendar, 
  Shield,
  Heart,
  Globe,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'AI Mental Health Support',
      description: 'Multilingual AI chatbot providing 24/7 mental health support with sentiment analysis',
      link: '/chat',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: Briefcase,
      title: 'LGBTQ+ Friendly Jobs',
      description: 'Curated job opportunities from inclusive companies and government initiatives',
      link: '/jobs',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Users,
      title: 'Community Connect',
      description: 'Safe space to connect with like-minded individuals and build meaningful relationships',
      link: '/community',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BookOpen,
      title: 'Awareness Blogs',
      description: 'Educational content on pride, mental health, and community resources',
      link: '/blogs',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Calendar,
      title: 'Local Events',
      description: 'Discover pride parades, support groups, and community events near you',
      link: '/events',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Trusted authentication and privacy-first approach to protect your identity',
      link: '/auth',
      gradient: 'from-violet-500 to-purple-500'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Everything You Need in One Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive support system designed specifically for the LGBTQ+ community in India
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link
                to={feature.link}
                className="block h-full backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-8 hover:bg-white/30 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-4 group-hover:text-purple-600 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="mt-6 flex items-center text-purple-600 font-medium">
                  <span>Explore</span>
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Multilingual Support</h4>
            <p className="text-gray-600">Available in 13+ Indian languages including Hindi, Bengali, Tamil, and more</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Professional Support</h4>
            <p className="text-gray-600">Connect with licensed mental health professionals and counselors</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">AI-Powered</h4>
            <p className="text-gray-600">Advanced AI with sentiment analysis and personalized recommendations</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;