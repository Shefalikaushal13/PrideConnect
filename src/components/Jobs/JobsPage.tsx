import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Heart, 
  Filter, 
  Star,
  DollarSign,
  Home,
  Briefcase,
  TrendingUp,
  Bell,
  Bookmark
} from 'lucide-react';
import { JobOpportunity } from '../../types';
import { mockJobs } from '../../data/mockData';
import { 
  scrapeAllJobs, 
  filterLGBTQFriendlyJobs, 
  getPersonalizedJobRecommendations,
  setupJobAlerts,
  ScrapedJob 
} from '../../utils/jobScraper';
import toast from 'react-hot-toast';

const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<(JobOpportunity | ScrapedJob)[]>(mockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [salaryFilter, setSalaryFilter] = useState('');
  const [remoteFilter, setRemoteFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [jobAlerts, setJobAlerts] = useState(false);

  useEffect(() => {
    // Load user profile
    const userData = localStorage.getItem('prideconnect_user');
    if (userData) {
      setUserProfile(JSON.parse(userData));
    }

    // Load saved jobs
    const saved = localStorage.getItem('prideconnect_saved_jobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }

    // Load real-time jobs
    loadRealTimeJobs();
  }, []);

  const loadRealTimeJobs = async () => {
    setIsLoading(true);
    try {
      const scrapedJobs = await scrapeAllJobs();
      const lgbtqFriendlyJobs = filterLGBTQFriendlyJobs(scrapedJobs);
      
      // Combine with mock jobs and get personalized recommendations
      const allJobs = [...mockJobs, ...lgbtqFriendlyJobs];
      const personalizedJobs = userProfile 
        ? getPersonalizedJobRecommendations(userProfile, allJobs)
        : allJobs;
      
      setJobs(personalizedJobs);
      toast.success(`Loaded ${lgbtqFriendlyJobs.length} new LGBTQ+ friendly jobs!`);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load latest jobs. Showing cached results.');
    } finally {
      setIsLoading(false);
    }
  };

  const setupAlerts = () => {
    if (jobAlerts) {
      toast.success('Job alerts enabled! You\'ll be notified of new opportunities.');
      const cleanup = setupJobAlerts(['lgbtq', 'diversity', 'inclusion'], (newJobs) => {
        if (newJobs.length > 0) {
          toast.success(`${newJobs.length} new LGBTQ+ friendly jobs found!`);
          setJobs(prev => [...newJobs, ...prev]);
        }
      });
      
      // Cleanup on component unmount
      return cleanup;
    }
  };

  useEffect(() => {
    const cleanup = setupAlerts();
    return cleanup;
  }, [jobAlerts]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = !typeFilter || job.type === typeFilter;
    const matchesRemote = !remoteFilter || ('remote' in job && job.remote);
    
    let matchesSalary = true;
    if (salaryFilter && 'salary' in job) {
      // Simple salary filtering logic
      matchesSalary = job.salary?.includes(salaryFilter) || false;
    }
    
    return matchesSearch && matchesLocation && matchesType && matchesRemote && matchesSalary;
  });

  const saveJob = (jobId: string) => {
    const newSavedJobs = savedJobs.includes(jobId) 
      ? savedJobs.filter(id => id !== jobId)
      : [...savedJobs, jobId];
    
    setSavedJobs(newSavedJobs);
    localStorage.setItem('prideconnect_saved_jobs', JSON.stringify(newSavedJobs));
    
    toast.success(savedJobs.includes(jobId) ? 'Job removed from saved' : 'Job saved!');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-green-100 text-green-800';
      case 'part-time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'internship': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDiversityScore = (job: JobOpportunity | ScrapedJob) => {
    if ('diversityScore' in job && job.diversityScore) {
      return job.diversityScore;
    }
    return job.isLGBTQFriendly ? 85 : 70;
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
            LGBTQ+ Friendly Career Opportunities
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover inclusive workplaces and opportunities from verified LGBTQ+ friendly companies, 
            government initiatives, and progressive organizations across India.
          </p>
          {userProfile && (
            <div className="mt-4 text-sm text-gray-600">
              Personalized recommendations for {userProfile.name} in {userProfile.location}
            </div>
          )}
        </motion.div>

        {/* Stats and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="backdrop-blur-md bg-white/20 rounded-xl border border-white/30 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{filteredJobs.length}</div>
            <div className="text-sm text-gray-600">Available Jobs</div>
          </div>
          <div className="backdrop-blur-md bg-white/20 rounded-xl border border-white/30 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{savedJobs.length}</div>
            <div className="text-sm text-gray-600">Saved Jobs</div>
          </div>
          <div className="backdrop-blur-md bg-white/20 rounded-xl border border-white/30 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredJobs.filter(job => 'remote' in job && job.remote).length}
            </div>
            <div className="text-sm text-gray-600">Remote Jobs</div>
          </div>
          <div className="backdrop-blur-md bg-white/20 rounded-xl border border-white/30 p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">
              {filteredJobs.filter(job => job.isLGBTQFriendly).length}
            </div>
            <div className="text-sm text-gray-600">LGBTQ+ Verified</div>
          </div>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
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

            {/* Job Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 rounded-lg backdrop-blur-md bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>

            {/* Salary Range */}
            <select
              value={salaryFilter}
              onChange={(e) => setSalaryFilter(e.target.value)}
              className="px-4 py-3 rounded-lg backdrop-blur-md bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Salaries</option>
              <option value="5">5+ LPA</option>
              <option value="10">10+ LPA</option>
              <option value="15">15+ LPA</option>
              <option value="20">20+ LPA</option>
            </select>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => setRemoteFilter(!remoteFilter)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                  remoteFilter
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                    : 'backdrop-blur-md bg-white/20 border border-white/30 text-gray-700 hover:bg-white/30'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="text-sm">Remote</span>
              </button>
            </div>
          </div>

          {/* Additional Controls */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/20">
            <button
              onClick={() => setJobAlerts(!jobAlerts)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                jobAlerts
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'backdrop-blur-md bg-white/20 border border-white/30 text-gray-700 hover:bg-white/30'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="text-sm">{jobAlerts ? 'Alerts On' : 'Enable Alerts'}</span>
            </button>

            <button
              onClick={loadRealTimeJobs}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">{isLoading ? 'Loading...' : 'Refresh Jobs'}</span>
            </button>
          </div>
        </motion.div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="backdrop-blur-md bg-white/20 rounded-2xl border border-white/30 p-6 hover:bg-white/30 transition-all duration-300 group"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                      {job.title}
                    </h3>
                    {('recommendationScore' in job && job.recommendationScore && job.recommendationScore > 50) && (
                      <div className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs">
                        Recommended
                      </div>
                    )}
                  </div>
                  <p className="text-lg text-gray-600 mb-1">{job.company}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    {'remote' in job && job.remote && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Home className="w-4 h-4" />
                        <span>Remote</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {job.isLGBTQFriendly && (
                    <div className="flex items-center space-x-1 bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm">
                      <Heart className="w-4 h-4" />
                      <span>LGBTQ+ Friendly</span>
                    </div>
                  )}
                  <button
                    onClick={() => saveJob(job.id)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      savedJobs.includes(job.id)
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-white/20 text-gray-600 hover:bg-white/30'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-4 flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(job.type)}`}>
                    {job.type.replace('-', ' ').toUpperCase()}
                  </span>
                  
                  {'salary' in job && job.salary && (
                    <div className="flex items-center space-x-1 text-green-600 text-sm">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.salary}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1 text-gray-500 text-sm">
                    <Clock className="w-4 h-4" />
                    {job.postedDate.toLocaleDateString()}
                  </div>

                  {/* Diversity Score */}
                  <div className="flex items-center space-x-1 text-purple-600 text-sm">
                    <Star className="w-4 h-4" />
                    <span>{getDiversityScore(job)}% Inclusive</span>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed line-clamp-3">{job.description}</p>

                {/* Benefits */}
                {'benefits' in job && job.benefits && job.benefits.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Benefits:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.benefits.slice(0, 4).map((benefit, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Requirements:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {job.requirements.slice(0, 3).map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Apply Button */}
              <motion.a
                href={'applyUrl' in job ? job.applyUrl : job.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center space-x-2 w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <span>Apply Now</span>
                <ExternalLink className="w-4 h-4" />
              </motion.a>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredJobs.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or check back later for new opportunities.</p>
            <button
              onClick={loadRealTimeJobs}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Refresh Jobs
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Latest Jobs...</h3>
            <p className="text-gray-600">Fetching LGBTQ+ friendly opportunities from across India</p>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 p-8 backdrop-blur-md bg-white/20 rounded-2xl border border-white/30"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Looking to Post a Job?</h3>
          <p className="text-gray-600 mb-6">
            Help us build a more inclusive workplace by posting LGBTQ+ friendly job opportunities.
            Join our network of progressive employers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
              Post a Job
            </button>
            <button className="px-8 py-3 backdrop-blur-md bg-white/20 border border-white/30 text-gray-700 rounded-lg hover:bg-white/30 transition-all duration-200">
              Become a Partner
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JobsPage;