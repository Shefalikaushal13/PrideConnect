import { useState, useEffect } from 'react';
import { jobsService, setupRealtimeHandlers, realtimeActions } from '../services/api';
import toast from 'react-hot-toast';

export const useRealTimeJobs = (filters: any = {}, userPreferences?: any) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Load initial jobs
  useEffect(() => {
    loadJobs();
    loadStats();
  }, [JSON.stringify(filters)]);

  // Setup real-time updates
  useEffect(() => {
    if (userPreferences) {
      realtimeActions.subscribeToJobs(userPreferences);
    }

    setupRealtimeHandlers({
      onJobsUpdate: (newJobs) => {
        setJobs(prevJobs => {
          // Merge new jobs with existing ones, avoiding duplicates
          const existingIds = new Set(prevJobs.map(job => job.id));
          const uniqueNewJobs = newJobs.filter(job => !existingIds.has(job.id));
          
          if (uniqueNewJobs.length > 0) {
            toast.success(`${uniqueNewJobs.length} new LGBTQ+ friendly jobs found!`);
            return [...uniqueNewJobs, ...prevJobs].slice(0, 100); // Keep only latest 100
          }
          
          return prevJobs;
        });
        
        // Update stats
        loadStats();
      }
    });
  }, [userPreferences]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobsService.getJobs(filters);
      setJobs(response.jobs || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load jobs');
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await jobsService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load job stats:', err);
    }
  };

  const saveJob = async (jobId: string, userId: string) => {
    try {
      await jobsService.saveJob(jobId, userId);
      toast.success('Job saved successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save job');
    }
  };

  const triggerScraping = async () => {
    try {
      const result = await jobsService.triggerScraping();
      toast.success(`Job scraping started! Found ${result.jobsFound} new jobs.`);
      
      // Reload jobs after scraping
      setTimeout(() => {
        loadJobs();
      }, 5000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to trigger job scraping');
    }
  };

  const getRecommendations = async (userId: string, limit = 10) => {
    try {
      const recommendations = await jobsService.getRecommendations(userId, limit);
      return recommendations;
    } catch (err: any) {
      toast.error('Failed to get job recommendations');
      return [];
    }
  };

  return {
    jobs,
    loading,
    error,
    stats,
    saveJob,
    triggerScraping,
    getRecommendations,
    refetch: loadJobs
  };
};