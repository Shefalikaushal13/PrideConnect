import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, ExternalLink, Filter, Search, Heart } from 'lucide-react';
import { Event } from '../../types';
import { mockEvents } from '../../data/mockData';

const EventsPage: React.FC = () => {
  const [events] = useState<Event[]>(mockEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user's location for nearby events
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const categories = [
    { value: '', label: 'All Events' },
    { value: 'pride', label: 'Pride Events' },
    { value: 'support-group', label: 'Support Groups' },
    { value: 'social', label: 'Social Events' },
    { value: 'educational', label: 'Educational' }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || event.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesCategory = !categoryFilter || event.category === categoryFilter;
    
    return matchesSearch && matchesLocation && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'pride': return 'from-pink-500 to-purple-600';
      case 'support-group': return 'from-green-500 to-emerald-600';
      case 'social': return 'from-blue-500 to-indigo-600';
      case 'educational': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getEventDistance = (event: Event) => {
    if (!userLocation || !event.coordinates) return null;
    return calculateDistance(
      userLocation.lat,
      userLocation.lng,
      event.coordinates.lat,
      event.coordinates.lng
    );
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
            Community Events
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover pride parades, support groups, and community events happening near you.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg backdrop-blur-md bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              />
            </div>

            {/* Location */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg backdrop-blur-md bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
              />
            </div>

            {/* Category */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 rounded-lg backdrop-blur-md bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            {/* Filter Button */}
            <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
          </div>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event, index) => {
            const distance = getEventDistance(event);
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-6 hover:bg-white/30 transition-all duration-300 group"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getCategoryColor(event.category)} text-white`}>
                        {event.category.replace('-', ' ').toUpperCase()}
                      </span>
                      {event.isVirtual && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                          Virtual
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{event.description}</p>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{event.date.toLocaleDateString('en-IN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{event.date.toLocaleTimeString('en-IN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.location}</span>
                    {distance && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">
                        {distance.toFixed(1)} km away
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{event.attendees} attending</span>
                    {event.maxAttendees && (
                      <span className="text-gray-400"> / {event.maxAttendees} max</span>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    Organized by: <span className="font-medium">{event.organizer}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {event.registrationUrl ? (
                    <motion.a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                      <span>Register</span>
                      <ExternalLink className="w-4 h-4" />
                    </motion.a>
                  ) : (
                    <button className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
                      Join Event
                    </button>
                  )}
                  
                  <button className="px-4 py-3 backdrop-blur-md bg-white/20 border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-200">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No events found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or check back later for new events.</p>
          </motion.div>
        )}

        {/* Create Event CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 p-8 backdrop-blur-md bg-white/20 rounded-2xl border border-white/30"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Want to Host an Event?</h3>
          <p className="text-gray-600 mb-6">
            Help build our community by organizing events, support groups, or educational workshops.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
            Create Event
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default EventsPage;