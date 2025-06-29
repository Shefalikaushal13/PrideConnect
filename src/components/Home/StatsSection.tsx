import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Briefcase, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: Users,
      number: '25,000+',
      label: 'Community Members',
      description: 'Active users across India'
    },
    {
      icon: MessageCircle,
      number: '100,000+',
      label: 'Support Sessions',
      description: 'Mental health conversations'
    },
    {
      icon: Briefcase,
      number: '2,500+',
      label: 'Job Opportunities',
      description: 'LGBTQ+ friendly positions'
    },
    {
      icon: Calendar,
      number: '500+',
      label: 'Events Hosted',
      description: 'Pride and community events'
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
            Making a Real Impact
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Together, we're building a stronger, more inclusive community across India
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
              className="text-center backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-8 hover:bg-white/30 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2"
              >
                {stat.number}
              </motion.div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {stat.label}
              </h3>
              
              <p className="text-gray-600 text-sm">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16 backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Ready to Join Our Community?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Take the first step towards connecting with a supportive community that understands and celebrates you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Journey
              </motion.button>
            </Link>
            <Link to="/community">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 backdrop-blur-md bg-white/20 text-gray-700 font-semibold rounded-full border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                Learn More
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;