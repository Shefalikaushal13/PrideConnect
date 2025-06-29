import express from 'express';
import { jobScrapingService } from '../services/jobScraping.js';

const router = express.Router();

// Get all jobs with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      location,
      type,
      remote,
      salary,
      company,
      source
    } = req.query;
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,company.ilike.%${search}%`);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    if (remote === 'true') {
      query = query.eq('remote', true);
    }
    
    if (company) {
      query = query.ilike('company', `%${company}%`);
    }
    
    if (source) {
      query = query.eq('source', source);
    }
    
    // Pagination
    const offset = (page - 1) * limit;
    query = query
      .order('postedDate', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({
      jobs: data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
    
  } catch (error) {
    console.error('Jobs API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Job detail API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Trigger manual job scraping (admin only)
router.post('/scrape', async (req, res) => {
  try {
    // Add authentication check here for admin users
    
    const jobs = await jobScrapingService.scrapeAndUpdateJobs();
    
    res.json({
      message: 'Job scraping completed',
      jobsFound: jobs.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Manual scraping error:', error);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

// Get job statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const [totalJobs, lgbtqJobs, remoteJobs, recentJobs] = await Promise.all([
      supabase.from('jobs').select('id', { count: 'exact', head: true }),
      supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('isLGBTQFriendly', true),
      supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('remote', true),
      supabase.from('jobs').select('id', { count: 'exact', head: true }).gte('postedDate', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    ]);
    
    res.json({
      total: totalJobs.count,
      lgbtqFriendly: lgbtqJobs.count,
      remote: remoteJobs.count,
      recentlyPosted: recentJobs.count
    });
  } catch (error) {
    console.error('Job stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save job for user
router.post('/:id/save', async (req, res) => {
  try {
    const { userId } = req.body;
    const jobId = req.params.id;
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const { data, error } = await supabase
      .from('saved_jobs')
      .upsert({
        user_id: userId,
        job_id: jobId,
        saved_at: new Date()
      });
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    res.json({ message: 'Job saved successfully' });
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get personalized job recommendations
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;
    
    const { supabase } = await import('../index.js');
    
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    // Get user profile and preferences
    const { data: userProfile } = await supabase
      .from('users')
      .select('location, interests, skills, experience_level')
      .eq('id', userId)
      .single();
    
    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get jobs with scoring based on user profile
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('isLGBTQFriendly', true)
      .order('postedDate', { ascending: false })
      .limit(limit * 3); // Get more to filter and score
    
    const { data: jobs, error } = await query;
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // Score and rank jobs based on user profile
    const scoredJobs = jobs.map(job => {
      let score = 0;
      
      // Location matching
      if (userProfile.location && job.location.toLowerCase().includes(userProfile.location.toLowerCase())) {
        score += 20;
      }
      
      // Interest matching
      if (userProfile.interests) {
        const jobText = `${job.title} ${job.description}`.toLowerCase();
        userProfile.interests.forEach(interest => {
          if (jobText.includes(interest.toLowerCase())) {
            score += 10;
          }
        });
      }
      
      // Skills matching
      if (userProfile.skills && job.requirements) {
        const skillMatches = userProfile.skills.filter(skill =>
          job.requirements.some(req => req.toLowerCase().includes(skill.toLowerCase()))
        );
        score += skillMatches.length * 5;
      }
      
      // Diversity score bonus
      if (job.diversityScore) {
        score += job.diversityScore / 10;
      }
      
      return { ...job, recommendationScore: score };
    });
    
    // Sort by score and return top results
    const recommendations = scoredJobs
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Job recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as jobRoutes };