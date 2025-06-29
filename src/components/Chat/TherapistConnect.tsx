import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCheck, 
  Calendar, 
  Clock, 
  Star, 
  MapPin, 
  Phone, 
  Video, 
  MessageCircle,
  Heart,
  Shield,
  Award,
  Languages
} from 'lucide-react';

interface Therapist {
  id: string;
  name: string;
  specialization: string[];
  languages: string[];
  experience: number;
  rating: number;
  reviews: number;
  location: string;
  availability: string[];
  sessionTypes: ('video' | 'audio' | 'chat')[];
  priceRange: string;
  bio: string;
  credentials: string[];
  isLGBTQSpecialist: boolean;
  nextAvailable: string;
}

const TherapistConnect: React.FC = () => {
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [sessionType, setSessionType] = useState<'video' | 'audio' | 'chat'>('video');

  const therapists: Therapist[] = [
    {
      id: '1',
      name: 'Dr. Priya Sharma',
      specialization: ['LGBTQ+ Counseling', 'Gender Identity', 'Coming Out Support', 'Family Therapy'],
      languages: ['English', 'Hindi', 'Punjabi'],
      experience: 8,
      rating: 4.9,
      reviews: 127,
      location: 'Mumbai, Maharashtra',
      availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      sessionTypes: ['video', 'audio', 'chat'],
      priceRange: '₹1,500 - ₹2,500',
      bio: 'Specialized in LGBTQ+ mental health with 8+ years of experience. I provide a safe, non-judgmental space for individuals exploring their identity and relationships.',
      credentials: ['PhD in Clinical Psychology', 'LGBTQ+ Affirmative Therapy Certified', 'Registered Clinical Psychologist'],
      isLGBTQSpecialist: true,
      nextAvailable: '2024-02-15'
    },
    {
      id: '2',
      name: 'Dr. Arjun Mehta',
      specialization: ['Anxiety & Depression', 'LGBTQ+ Issues', 'Relationship Counseling', 'Trauma Therapy'],
      languages: ['English', 'Hindi', 'Gujarati'],
      experience: 12,
      rating: 4.8,
      reviews: 203,
      location: 'Delhi, NCR',
      availability: ['Mon', 'Wed', 'Fri', 'Sat'],
      sessionTypes: ['video', 'audio'],
      priceRange: '₹2,000 - ₹3,000',
      bio: 'Experienced therapist specializing in LGBTQ+ mental health, anxiety, and relationship issues. I believe in creating an inclusive and supportive therapeutic environment.',
      credentials: ['MD Psychiatry', 'LGBTQ+ Mental Health Specialist', 'Trauma-Informed Care Certified'],
      isLGBTQSpecialist: true,
      nextAvailable: '2024-02-16'
    },
    {
      id: '3',
      name: 'Dr. Kavya Reddy',
      specialization: ['Gender Dysphoria', 'Transition Support', 'Family Counseling', 'Group Therapy'],
      languages: ['English', 'Telugu', 'Tamil'],
      experience: 6,
      rating: 4.9,
      reviews: 89,
      location: 'Bangalore, Karnataka',
      availability: ['Tue', 'Thu', 'Fri', 'Sat', 'Sun'],
      sessionTypes: ['video', 'chat'],
      priceRange: '₹1,200 - ₹2,000',
      bio: 'Passionate about supporting transgender and non-binary individuals through their journey. I offer specialized care for gender-related concerns and family support.',
      credentials: ['MSc Clinical Psychology', 'Gender Affirmative Therapy Certified', 'WPATH Member'],
      isLGBTQSpecialist: true,
      nextAvailable: '2024-02-14'
    },
    {
      id: '4',
      name: 'Dr. Sam Gupta',
      specialization: ['Youth Counseling', 'LGBTQ+ Adolescents', 'School Issues', 'Self-Esteem'],
      languages: ['English', 'Hindi', 'Bengali'],
      experience: 5,
      rating: 4.7,
      reviews: 156,
      location: 'Kolkata, West Bengal',
      availability: ['Mon', 'Tue', 'Wed', 'Thu'],
      sessionTypes: ['video', 'audio', 'chat'],
      priceRange: '₹1,000 - ₹1,800',
      bio: 'Specialized in working with LGBTQ+ youth and adolescents. I help young people navigate identity, school challenges, and family relationships.',
      credentials: ['MA Psychology', 'Child & Adolescent Therapy Certified', 'LGBTQ+ Youth Specialist'],
      isLGBTQSpecialist: true,
      nextAvailable: '2024-02-17'
    }
  ];

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', 
    '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
  ];

  const handleBookSession = () => {
    if (!selectedDate || !selectedTime || !selectedTherapist) return;
    
    // In production, this would make an API call to book the session
    alert(`Session booked with ${selectedTherapist.name} on ${selectedDate} at ${selectedTime} via ${sessionType}`);
    setShowBooking(false);
    setSelectedTherapist(null);
  };

  const getSessionIcon = (type: 'video' | 'audio' | 'chat') => {
    switch (type) {
      case 'video': return Video;
      case 'audio': return Phone;
      case 'chat': return MessageCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Connect with LGBTQ+ Affirming Therapists
        </h2>
        <p className="text-gray-600">
          Professional, licensed therapists who understand and support the LGBTQ+ community
        </p>
      </div>

      {/* Therapist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {therapists.map((therapist, index) => (
          <motion.div
            key={therapist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-6 hover:bg-white/30 transition-all duration-300"
          >
            {/* Therapist Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-800">{therapist.name}</h3>
                  {therapist.isLGBTQSpecialist && (
                    <div className="flex items-center space-x-1 bg-pink-100 text-pink-600 px-2 py-1 rounded-full text-xs">
                      <Heart className="w-3 h-3" />
                      <span>LGBTQ+ Specialist</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{therapist.rating}</span>
                    <span>({therapist.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>{therapist.experience} years</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{therapist.location}</span>
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Specializations:</h4>
              <div className="flex flex-wrap gap-2">
                {therapist.specialization.slice(0, 3).map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs"
                  >
                    {spec}
                  </span>
                ))}
                {therapist.specialization.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    +{therapist.specialization.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Languages */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Languages className="w-4 h-4" />
                <span>{therapist.languages.join(', ')}</span>
              </div>
            </div>

            {/* Session Types */}
            <div className="mb-4">
              <div className="flex items-center space-x-3">
                {therapist.sessionTypes.map((type) => {
                  const Icon = getSessionIcon(type);
                  return (
                    <div key={type} className="flex items-center space-x-1 text-sm text-gray-600">
                      <Icon className="w-4 h-4" />
                      <span className="capitalize">{type}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price and Availability */}
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="font-medium text-gray-800">{therapist.priceRange}</span>
              <div className="flex items-center space-x-1 text-green-600">
                <Clock className="w-4 h-4" />
                <span>Next: {new Date(therapist.nextAvailable).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedTherapist(therapist);
                  setShowBooking(true);
                }}
                className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                Book Session
              </motion.button>
              <button
                onClick={() => setSelectedTherapist(therapist)}
                className="px-4 py-2 backdrop-blur-md bg-white/20 border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-200"
              >
                View Profile
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Booking Modal */}
      {showBooking && selectedTherapist && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowBooking(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="backdrop-blur-md bg-white/90 rounded-2xl border border-white/30 max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Book Session with {selectedTherapist.name}
            </h3>

            {/* Session Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {selectedTherapist.sessionTypes.map((type) => {
                  const Icon = getSessionIcon(type);
                  return (
                    <button
                      key={type}
                      onClick={() => setSessionType(type)}
                      className={`flex flex-col items-center space-y-1 p-3 rounded-lg border transition-all duration-200 ${
                        sessionType === type
                          ? 'bg-purple-100 text-purple-600 border-purple-300'
                          : 'bg-white/20 text-gray-600 border-white/30 hover:bg-white/30'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs capitalize">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Time Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time
              </label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-3 text-sm rounded-lg border transition-all duration-200 ${
                      selectedTime === time
                        ? 'bg-purple-100 text-purple-600 border-purple-300'
                        : 'bg-white/20 text-gray-600 border-white/30 hover:bg-white/30'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBooking(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBookSession}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Booking
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Therapist Profile Modal */}
      {selectedTherapist && !showBooking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTherapist(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="backdrop-blur-md bg-white/90 rounded-2xl border border-white/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedTherapist.name}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{selectedTherapist.rating} ({selectedTherapist.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>{selectedTherapist.experience} years experience</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTherapist(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
              <p className="text-gray-600 leading-relaxed">{selectedTherapist.bio}</p>
            </div>

            {/* Credentials */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Credentials</h3>
              <div className="space-y-2">
                {selectedTherapist.credentials.map((credential, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">{credential}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {selectedTherapist.specialization.map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Book Session Button */}
            <button
              onClick={() => setShowBooking(true)}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Book Session - {selectedTherapist.priceRange}
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* Emergency Support */}
      <div className="backdrop-blur-md bg-red-50/50 rounded-2xl border border-red-200/50 p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Crisis Support</h3>
            <p className="text-red-700 mb-3">
              If you're in immediate crisis or having thoughts of self-harm, please reach out for help immediately.
            </p>
            <div className="space-y-2 text-sm">
              <div><strong>National Suicide Prevention:</strong> 9152987821</div>
              <div><strong>LGBTQ+ Crisis Line:</strong> +91-9999-46-5428</div>
              <div><strong>Emergency Services:</strong> 112</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistConnect;