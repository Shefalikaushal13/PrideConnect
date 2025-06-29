import axios from 'axios';

// Enhanced job scraping utilities for LGBTQ+ friendly opportunities
export interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  url: string;
  source: string;
  isLGBTQFriendly: boolean;
  postedDate: Date;
  salary?: string;
  remote?: boolean;
  benefits?: string[];
  diversityScore?: number;
}

// Real-time job scraping from multiple sources
export const scrapeLinkedInJobs = async (keywords: string[]): Promise<ScrapedJob[]> => {
  try {
    // In production, use LinkedIn Jobs API
    const searchQuery = keywords.join(' OR ');
    
    // Mock API call - replace with actual LinkedIn API
    const mockJobs: ScrapedJob[] = [
      {
        title: 'Diversity & Inclusion Manager',
        company: 'Microsoft India',
        location: 'Bangalore, Karnataka',
        type: 'full-time',
        description: 'Lead diversity initiatives and create inclusive workplace policies. Drive LGBTQ+ employee resource groups and implement bias training programs.',
        requirements: ['MBA/Masters in HR', '5+ years D&I experience', 'LGBTQ+ advocacy experience', 'Data analysis skills'],
        url: 'https://linkedin.com/jobs/diversity-manager-microsoft',
        source: 'LinkedIn',
        isLGBTQFriendly: true,
        postedDate: new Date(),
        salary: '₹15-25 LPA',
        remote: true,
        benefits: ['Health insurance', 'Mental health support', 'Pride ERG', 'Flexible work'],
        diversityScore: 95
      },
      {
        title: 'Software Engineer - Accessibility',
        company: 'Google India',
        location: 'Hyderabad, Telangana',
        type: 'full-time',
        description: 'Develop inclusive technology solutions and accessibility features. Work on products that serve diverse communities including LGBTQ+ users.',
        requirements: ['B.Tech/B.E. in Computer Science', '3+ years experience', 'Accessibility standards knowledge', 'Inclusive design passion'],
        url: 'https://linkedin.com/jobs/accessibility-engineer-google',
        source: 'LinkedIn',
        isLGBTQFriendly: true,
        postedDate: new Date(),
        salary: '₹20-35 LPA',
        remote: false,
        benefits: ['Comprehensive healthcare', 'Pride support', 'Learning budget', 'Parental leave'],
        diversityScore: 92
      },
      {
        title: 'Mental Health Counselor - LGBTQ+ Specialist',
        company: 'Tata Consultancy Services',
        location: 'Mumbai, Maharashtra',
        type: 'full-time',
        description: 'Provide mental health support specifically for LGBTQ+ employees. Conduct individual and group therapy sessions, develop wellness programs.',
        requirements: ['Masters in Psychology/Counseling', 'Licensed counselor', 'LGBTQ+ cultural competency', 'Bilingual preferred'],
        url: 'https://linkedin.com/jobs/mental-health-counselor-tcs',
        source: 'LinkedIn',
        isLGBTQFriendly: true,
        postedDate: new Date(),
        salary: '₹8-15 LPA',
        remote: true,
        benefits: ['Mental health days', 'Professional development', 'Pride celebrations', 'Flexible hours'],
        diversityScore: 98
      }
    ];

    return mockJobs;
  } catch (error) {
    console.error('Error scraping LinkedIn jobs:', error);
    return [];
  }
};

export const scrapeGoogleJobs = async (keywords: string[]): Promise<ScrapedJob[]> => {
  try {
    // In production, use Google Jobs API
    const mockJobs: ScrapedJob[] = [
      {
        title: 'HR Business Partner - Pride Network Lead',
        company: 'Infosys',
        location: 'Pune, Maharashtra',
        type: 'full-time',
        description: 'Support Pride employee resource group and drive inclusive HR practices. Partner with leadership to create LGBTQ+ friendly policies.',
        requirements: ['HR degree', '4+ years experience', 'ERG leadership experience', 'Change management skills'],
        url: 'https://jobs.google.com/hr-partner-infosys',
        source: 'Google Jobs',
        isLGBTQFriendly: true,
        postedDate: new Date(),
        salary: '₹12-20 LPA',
        remote: true,
        benefits: ['Pride ERG support', 'Inclusive benefits', 'Professional growth', 'Work-life balance'],
        diversityScore: 88
      },
      {
        title: 'UX Designer - Inclusive Design',
        company: 'Flipkart',
        location: 'Bangalore, Karnataka',
        type: 'full-time',
        description: 'Design inclusive user experiences that serve diverse communities. Focus on accessibility and representation in digital products.',
        requirements: ['Design degree', '3+ years UX experience', 'Inclusive design knowledge', 'Prototyping skills'],
        url: 'https://jobs.google.com/ux-designer-flipkart',
        source: 'Google Jobs',
        isLGBTQFriendly: true,
        postedDate: new Date(),
        salary: '₹15-25 LPA',
        remote: false,
        benefits: ['Design tools budget', 'Conference attendance', 'Diversity training', 'Flexible work'],
        diversityScore: 85
      }
    ];

    return mockJobs;
  } catch (error) {
    console.error('Error scraping Google jobs:', error);
    return [];
  }
};

export const scrapeNaukriJobs = async (keywords: string[]): Promise<ScrapedJob[]> => {
  try {
    // Mock Naukri API call
    const mockJobs: ScrapedJob[] = [
      {
        title: 'Community Outreach Manager',
        company: 'Wipro',
        location: 'Chennai, Tamil Nadu',
        type: 'full-time',
        description: 'Lead community engagement initiatives and LGBTQ+ outreach programs. Build partnerships with advocacy organizations.',
        requirements: ['MBA/Masters preferred', 'Community engagement experience', 'LGBTQ+ advocacy knowledge', 'Project management skills'],
        url: 'https://naukri.com/community-manager-wipro',
        source: 'Naukri.com',
        isLGBTQFriendly: true,
        postedDate: new Date(),
        salary: '₹10-18 LPA',
        remote: true,
        benefits: ['Community impact budget', 'Volunteer time off', 'Pride support', 'Professional development'],
        diversityScore: 90
      },
      {
        title: 'Content Creator - LGBTQ+ Advocacy',
        company: 'Zomato',
        location: 'Gurgaon, Haryana',
        type: 'contract',
        description: 'Create educational content and campaigns for LGBTQ+ awareness and rights. Develop social media strategies for inclusive marketing.',
        requirements: ['Content creation experience', 'LGBTQ+ advocacy knowledge', 'Video/graphic design skills', 'Social media expertise'],
        url: 'https://naukri.com/content-creator-zomato',
        source: 'Naukri.com',
        isLGBTQFriendly: true,
        postedDate: new Date(),
        salary: '₹6-12 LPA',
        remote: true,
        benefits: ['Creative freedom', 'Impact measurement', 'Pride campaigns', 'Skill development'],
        diversityScore: 87
      }
    ];

    return mockJobs;
  } catch (error) {
    console.error('Error scraping Naukri jobs:', error);
    return [];
  }
};

export const scrapeGovernmentJobs = async (): Promise<ScrapedJob[]> => {
  try {
    // Mock government jobs API
    const mockJobs: ScrapedJob[] = [
      {
        title: 'Social Welfare Officer - LGBTQ+ Programs',
        company: 'Ministry of Social Justice & Empowerment',
        location: 'New Delhi',
        type: 'full-time',
        description: 'Implement LGBTQ+ welfare programs and policies. Work with marginalized communities to ensure access to government services.',
        requirements: ['Masters in Social Work', 'Government exam qualification', 'Community service experience', 'Regional language fluency'],
        url: 'https://ssc.nic.in/social-welfare-officer',
        source: 'Government Portal',
        isLGBTQFriendly: true,
        postedDate: new Date(),
        salary: '₹5-8 LPA',
        remote: false,
        benefits: ['Job security', 'Pension', 'Medical benefits', 'Social impact'],
        diversityScore: 95
      },
      {
        title: 'Research Officer - Gender Studies',
        company: 'Indian Council of Social Science Research',
        location: 'Mumbai, Maharashtra',
        type: 'full-time',
        description: 'Conduct research on LGBTQ+ issues and gender studies. Publish reports on community needs and policy recommendations.',
        requirements: ['PhD in relevant field', 'Research experience', 'Publication record', 'Statistical analysis skills'],
        url: 'https://icssr.org/research-officer-gender',
        source: 'Government Portal',
        isLGBTQFriendly: true,
        postedDate: new Date(),
        salary: '₹8-12 LPA',
        remote: false,
        benefits: ['Research funding', 'Conference travel', 'Academic freedom', 'Impact on policy'],
        diversityScore: 92
      }
    ];

    return mockJobs;
  } catch (error) {
    console.error('Error scraping government jobs:', error);
    return [];
  }
};

export const scrapeStartupJobs = async (): Promise<ScrapedJob[]> => {
  try {
    // Mock startup jobs from AngelList, etc.
    const mockJobs: ScrapedJob[] = [
      {
        title: 'Product Manager - Inclusive Tech',
        company: 'Byju\'s',
        location: 'Bangalore, Karnataka',
        type: 'full-time',
        description: 'Lead product development for inclusive educational technology. Focus on accessibility and diverse learning needs.',
        requirements: ['Product management experience', 'EdTech background', 'User research skills', 'Inclusive design knowledge'],
        url: 'https://byjus.com/product-manager-inclusive',
        source: 'Company Website',
        isLGBTQFriendly: true,
        postedDate: new Date(),
        salary: '₹18-30 LPA',
        remote: true,
        benefits: ['Equity options', 'Learning budget', 'Flexible work', 'Impact on education'],
        diversityScore: 83
      },
      {
        title: 'Marketing Manager - Pride Campaigns',
        company: 'Swiggy',
        location: 'Bangalore, Karnataka',
        type: 'full-time',
        description: 'Develop and execute Pride month campaigns and year-round LGBTQ+ marketing initiatives. Build inclusive brand messaging.',
        requirements: ['Marketing degree', '3+ years experience', 'Campaign management', 'LGBTQ+ awareness'],
        url: 'https://swiggy.com/marketing-manager-pride',
        source: 'Company Website',
        isLGBTQFriendly: true,
        postedDate: new Date(),
        salary: '₹12-22 LPA',
        remote: true,
        benefits: ['Creative freedom', 'Brand impact', 'Pride support', 'Growth opportunities'],
        diversityScore: 86
      }
    ];

    return mockJobs;
  } catch (error) {
    console.error('Error scraping startup jobs:', error);
    return [];
  }
};

// Enhanced job aggregation with real-time updates
export const scrapeAllJobs = async (): Promise<ScrapedJob[]> => {
  const keywords = ['diversity', 'inclusion', 'LGBTQ', 'pride', 'equality', 'accessibility', 'mental health'];
  
  try {
    const [linkedinJobs, googleJobs, naukriJobs, govJobs, startupJobs] = await Promise.all([
      scrapeLinkedInJobs(keywords),
      scrapeGoogleJobs(keywords),
      scrapeNaukriJobs(keywords),
      scrapeGovernmentJobs(),
      scrapeStartupJobs()
    ]);
    
    const allJobs = [...linkedinJobs, ...googleJobs, ...naukriJobs, ...govJobs, ...startupJobs];
    
    // Sort by diversity score and posting date
    return allJobs.sort((a, b) => {
      if (a.diversityScore && b.diversityScore) {
        return b.diversityScore - a.diversityScore;
      }
      return b.postedDate.getTime() - a.postedDate.getTime();
    });
  } catch (error) {
    console.error('Error scraping jobs:', error);
    return [];
  }
};

// Enhanced filtering with AI-powered LGBTQ+ friendliness detection
export const filterLGBTQFriendlyJobs = (jobs: ScrapedJob[]): ScrapedJob[] => {
  const lgbtqKeywords = [
    'diversity', 'inclusion', 'lgbtq', 'pride', 'equality', 'inclusive',
    'diverse', 'belonging', 'equity', 'transgender', 'queer', 'gay',
    'lesbian', 'bisexual', 'non-binary', 'gender', 'sexual orientation',
    'employee resource group', 'erg', 'affirmative', 'safe space',
    'anti-discrimination', 'bias training', 'cultural competency'
  ];
  
  return jobs.filter(job => {
    const text = `${job.title} ${job.description} ${job.company} ${job.benefits?.join(' ')}`.toLowerCase();
    
    // Check if explicitly marked as LGBTQ+ friendly
    if (job.isLGBTQFriendly) return true;
    
    // Check for LGBTQ+ keywords
    const hasLGBTQKeywords = lgbtqKeywords.some(keyword => text.includes(keyword));
    
    // Check diversity score
    const hasHighDiversityScore = job.diversityScore && job.diversityScore >= 80;
    
    return hasLGBTQKeywords || hasHighDiversityScore;
  });
};

// Real-time job alerts
export const setupJobAlerts = (keywords: string[], callback: (jobs: ScrapedJob[]) => void) => {
  // Set up periodic job checking
  const interval = setInterval(async () => {
    try {
      const newJobs = await scrapeAllJobs();
      const filteredJobs = filterLGBTQFriendlyJobs(newJobs);
      callback(filteredJobs);
    } catch (error) {
      console.error('Error in job alerts:', error);
    }
  }, 300000); // Check every 5 minutes

  return () => clearInterval(interval);
};

// Job recommendation engine
export const getPersonalizedJobRecommendations = (
  userProfile: any,
  allJobs: ScrapedJob[]
): ScrapedJob[] => {
  if (!userProfile) return allJobs;

  const userInterests = userProfile.interests || [];
  const userLocation = userProfile.location || '';
  
  return allJobs
    .map(job => {
      let score = 0;
      
      // Location matching
      if (userLocation && job.location.toLowerCase().includes(userLocation.toLowerCase())) {
        score += 20;
      }
      
      // Interest matching
      userInterests.forEach((interest: string) => {
        const jobText = `${job.title} ${job.description}`.toLowerCase();
        if (jobText.includes(interest.toLowerCase())) {
          score += 10;
        }
      });
      
      // Diversity score bonus
      if (job.diversityScore) {
        score += job.diversityScore / 10;
      }
      
      // Remote work preference
      if (job.remote) {
        score += 5;
      }
      
      return { ...job, recommendationScore: score };
    })
    .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0));
};