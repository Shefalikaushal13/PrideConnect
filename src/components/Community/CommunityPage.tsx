import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Heart, MapPin, Star, UserPlus, UserX, Shield } from 'lucide-react';
import { User } from '../../types';
import { mockUsers } from '../../data/mockData';
import AnonymousChat from './AnonymousChat';

const CommunityPage: React.FC = () => {
  const [users] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAnonymousChat, setShowAnonymousChat] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  React.useEffect(() => {
    // Load user profile from localStorage
    const userData = localStorage.getItem('prideconnect_user');
    if (userData) {
      setUserProfile(JSON.parse(userData));
    }
  }, []);

  const handleConnect = (user: User) => {
    setSelectedUser(user);
    // In a real app, this would initiate a connection request
    console.log('Connecting with:', user.name);
  };

  return (
    <div className="min-h-screen pt-8 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Community Connect
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with like-minded individuals in the LGBTQ+ community. Build friendships, find support, and grow together.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: Users, label: 'Active Members', value: '2,847' },
            { icon: MessageCircle, label: 'Conversations', value: '15,623' },
            { icon: Heart, label: 'Connections Made', value: '1,234' },
            { icon: Star, label: 'Support Given', value: '8,901' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="backdrop-blur-md bg-white/20 rounded-xl border border-white/30 p-4 text-center"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Anonymous Chat Feature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <UserX className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Anonymous Chat Rooms</h2>
                <p className="text-gray-600">
                  Connect with others anonymously in safe, moderated chat rooms. Your identity remains completely private.
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAnonymousChat(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Join Anonymous Chat</span>
            </motion.button>
          </div>

          {/* Anonymous Chat Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium text-gray-800">Complete Privacy</div>
                <div className="text-sm text-gray-600">No personal information shared</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium text-gray-800">Topic-Based Rooms</div>
                <div className="text-sm text-gray-600">Mental health, coming out, family support</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
              <Heart className="w-5 h-5 text-pink-500" />
              <div>
                <div className="font-medium text-gray-800">24/7 Support</div>
                <div className="text-sm text-gray-600">Always someone to talk to</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Community Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Community Members</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="backdrop-blur-md bg-white/30 rounded-xl border border-white/30 p-6 hover:bg-white/40 transition-all duration-300 group"
              >
                {/* Profile Header */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    {user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{user.name}</h3>
                    {user.pronouns && (
                      <p className="text-sm text-gray-600">({user.pronouns})</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                {user.location && (
                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {user.location}
                  </div>
                )}

                {/* Interests */}
                {user.interests && user.interests.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Interests:</p>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.slice(0, 3).map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connect Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleConnect(user)}
                  className="w-full flex items-center justify-center space-x-2 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Connect</span>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Community Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Community Guidelines</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Heart className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Be Respectful</h3>
                  <p className="text-sm text-gray-600">Treat everyone with kindness and respect, regardless of their identity or background.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Create Safe Spaces</h3>
                  <p className="text-sm text-gray-600">Help maintain an inclusive environment where everyone feels safe to be themselves.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageCircle className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Support Each Other</h3>
                  <p className="text-sm text-gray-600">Offer support, encouragement, and resources to fellow community members.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Star className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Celebrate Diversity</h3>
                  <p className="text-sm text-gray-600">Embrace and celebrate the beautiful diversity within our community.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Connection Modal */}
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="backdrop-blur-md bg-white/90 rounded-2xl border border-white/30 p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Connect with {selectedUser.name}
              </h3>
              <p className="text-gray-600 mb-6">
                Send a connection request to start building a meaningful relationship within our community.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle connection logic here
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Send Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Anonymous Chat Modal */}
        <AnonymousChat
          isOpen={showAnonymousChat}
          onClose={() => setShowAnonymousChat(false)}
          userId={userProfile?.id}
        />
      </div>
    </div>
  );
};

export default CommunityPage;