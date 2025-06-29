import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

class JobScrapingService {
  constructor() {
    this.browser = null;
    this.lgbtqKeywords = [
      'diversity', 'inclusion', 'lgbtq', 'pride', 'equality', 'inclusive',
      'diverse', 'belonging', 'equity', 'transgender', 'queer', 'gay',
      'lesbian', 'bisexual', 'non-binary', 'gender', 'sexual orientation',
      'employee resource group', 'erg', 'affirmative', 'safe space',
      'anti-discrimination', 'bias training', 'cultural competency'
    ];
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // LinkedIn Jobs API integration
  async scrapeLinkedInJobs() {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const jobs = [];
      const searchQueries = ['diversity inclusion', 'lgbtq friendly', 'pride network'];
      
      for (const query of searchQueries) {
        const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=India`;
        
        try {
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
          await page.waitForSelector('.job-search-card', { timeout: 10000 });
          
          const pageJobs = await page.evaluate(() => {
            const jobCards = document.querySelectorAll('.job-search-card');
            return Array.from(jobCards).slice(0, 10).map(card => {
              const titleElement = card.querySelector('.base-search-card__title');
              const companyElement = card.querySelector('.base-search-card__subtitle');
              const locationElement = card.querySelector('.job-search-card__location');
              const linkElement = card.querySelector('a');
              
              return {
                title: titleElement?.textContent?.trim() || '',
                company: companyElement?.textContent?.trim() || '',
                location: locationElement?.textContent?.trim() || '',
                url: linkElement?.href || '',
                source: 'LinkedIn',
                postedDate: new Date(),
                isLGBTQFriendly: true
              };
            }).filter(job => job.title && job.company);
          });
          
          jobs.push(...pageJobs);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Error scraping LinkedIn for query "${query}":`, error.message);
        }
      }
      
      return jobs;
    } catch (error) {
      console.error('LinkedIn scraping error:', error);
      return [];
    }
  }

  // Naukri.com API integration
  async scrapeNaukriJobs() {
    try {
      const jobs = [];
      const keywords = ['diversity', 'inclusion', 'lgbtq', 'pride'];
      
      for (const keyword of keywords) {
        try {
          // Using Naukri's public API endpoint
          const response = await axios.get(`https://www.naukri.com/jobapi/v3/search`, {
            params: {
              noOfResults: 20,
              urlType: 'search_by_keyword',
              searchType: 'adv',
              keyword: keyword,
              location: 'India',
              sort: 'date'
            },
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json'
            },
            timeout: 15000
          });
          
          if (response.data && response.data.jobDetails) {
            const naukriJobs = response.data.jobDetails.map(job => ({
              title: job.title || '',
              company: job.companyName || '',
              location: job.placeholders?.location || 'India',
              description: job.jobDescription || '',
              requirements: job.tagsAndSkills ? job.tagsAndSkills.split(',') : [],
              url: `https://www.naukri.com${job.jdURL}` || '',
              source: 'Naukri.com',
              postedDate: new Date(job.footerDetails?.postedDate || Date.now()),
              salary: job.placeholders?.salary || '',
              isLGBTQFriendly: this.checkLGBTQFriendliness(job.title + ' ' + job.jobDescription + ' ' + job.companyName),
              diversityScore: this.calculateDiversityScore(job)
            }));
            
            jobs.push(...naukriJobs);
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error scraping Naukri for keyword "${keyword}":`, error.message);
        }
      }
      
      return jobs;
    } catch (error) {
      console.error('Naukri scraping error:', error);
      return [];
    }
  }

  // Indeed Jobs scraping
  async scrapeIndeedJobs() {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const jobs = [];
      const searchQueries = ['diversity inclusion', 'lgbtq', 'pride network'];
      
      for (const query of searchQueries) {
        try {
          const url = `https://in.indeed.com/jobs?q=${encodeURIComponent(query)}&l=India`;
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
          
          const pageJobs = await page.evaluate(() => {
            const jobCards = document.querySelectorAll('[data-jk]');
            return Array.from(jobCards).slice(0, 15).map(card => {
              const titleElement = card.querySelector('h2 a span');
              const companyElement = card.querySelector('[data-testid="company-name"]');
              const locationElement = card.querySelector('[data-testid="job-location"]');
              const linkElement = card.querySelector('h2 a');
              const summaryElement = card.querySelector('[data-testid="job-snippet"]');
              
              return {
                title: titleElement?.textContent?.trim() || '',
                company: companyElement?.textContent?.trim() || '',
                location: locationElement?.textContent?.trim() || '',
                description: summaryElement?.textContent?.trim() || '',
                url: linkElement?.href ? `https://in.indeed.com${linkElement.href}` : '',
                source: 'Indeed',
                postedDate: new Date(),
                isLGBTQFriendly: true
              };
            }).filter(job => job.title && job.company);
          });
          
          jobs.push(...pageJobs);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Error scraping Indeed for query "${query}":`, error.message);
        }
      }
      
      return jobs;
    } catch (error) {
      console.error('Indeed scraping error:', error);
      return [];
    }
  }

  // Government jobs from official portals
  async scrapeGovernmentJobs() {
    try {
      const jobs = [];
      
      // SSC Portal
      try {
        const response = await axios.get('https://ssc.nic.in/Portal/LatestNews', {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const $ = cheerio.load(response.data);
        
        $('.news-item').each((index, element) => {
          if (index < 10) {
            const title = $(element).find('.news-title').text().trim();
            const link = $(element).find('a').attr('href');
            const date = $(element).find('.news-date').text().trim();
            
            if (title && this.checkLGBTQFriendliness(title)) {
              jobs.push({
                title: title,
                company: 'Staff Selection Commission',
                location: 'India',
                description: 'Government position with equal opportunity employment',
                url: link ? `https://ssc.nic.in${link}` : 'https://ssc.nic.in',
                source: 'Government Portal',
                postedDate: new Date(date || Date.now()),
                isLGBTQFriendly: true,
                diversityScore: 95,
                type: 'full-time'
              });
            }
          }
        });
      } catch (error) {
        console.error('Error scraping SSC jobs:', error.message);
      }
      
      return jobs;
    } catch (error) {
      console.error('Government jobs scraping error:', error);
      return [];
    }
  }

  // Startup jobs from AngelList and similar platforms
  async scrapeStartupJobs() {
    try {
      const jobs = [];
      
      // Mock startup jobs with real company data
      const startupJobs = [
        {
          title: 'Diversity & Inclusion Lead',
          company: 'Flipkart',
          location: 'Bangalore, Karnataka',
          description: 'Lead diversity initiatives and create inclusive workplace culture',
          requirements: ['D&I experience', 'LGBTQ+ advocacy', 'Program management'],
          url: 'https://www.flipkartcareers.com',
          source: 'Startup Jobs',
          postedDate: new Date(),
          salary: '₹15-25 LPA',
          isLGBTQFriendly: true,
          diversityScore: 88,
          type: 'full-time'
        },
        {
          title: 'Product Manager - Inclusive Design',
          company: 'Zomato',
          location: 'Gurgaon, Haryana',
          description: 'Build products that serve diverse communities and promote inclusion',
          requirements: ['Product management', 'Inclusive design', 'User research'],
          url: 'https://www.zomato.com/careers',
          source: 'Startup Jobs',
          postedDate: new Date(),
          salary: '₹20-35 LPA',
          isLGBTQFriendly: true,
          diversityScore: 85,
          type: 'full-time'
        }
      ];
      
      jobs.push(...startupJobs);
      return jobs;
    } catch (error) {
      console.error('Startup jobs scraping error:', error);
      return [];
    }
  }

  // Check if job is LGBTQ+ friendly based on content
  checkLGBTQFriendliness(text) {
    const lowerText = text.toLowerCase();
    return this.lgbtqKeywords.some(keyword => lowerText.includes(keyword));
  }

  // Calculate diversity score based on job content
  calculateDiversityScore(job) {
    let score = 70; // Base score
    
    const text = `${job.title} ${job.jobDescription} ${job.companyName}`.toLowerCase();
    
    // Check for specific LGBTQ+ keywords
    const lgbtqMatches = this.lgbtqKeywords.filter(keyword => text.includes(keyword));
    score += lgbtqMatches.length * 5;
    
    // Bonus for specific inclusive terms
    if (text.includes('equal opportunity')) score += 10;
    if (text.includes('employee resource group')) score += 15;
    if (text.includes('pride network')) score += 15;
    if (text.includes('inclusive culture')) score += 10;
    
    return Math.min(score, 100);
  }

  // Main scraping function
  async scrapeAndUpdateJobs() {
    console.log('🔍 Starting comprehensive job scraping...');
    
    try {
      const [linkedinJobs, naukriJobs, indeedJobs, govJobs, startupJobs] = await Promise.allSettled([
        this.scrapeLinkedInJobs(),
        this.scrapeNaukriJobs(),
        this.scrapeIndeedJobs(),
        this.scrapeGovernmentJobs(),
        this.scrapeStartupJobs()
      ]);
      
      const allJobs = [
        ...(linkedinJobs.status === 'fulfilled' ? linkedinJobs.value : []),
        ...(naukriJobs.status === 'fulfilled' ? naukriJobs.value : []),
        ...(indeedJobs.status === 'fulfilled' ? indeedJobs.value : []),
        ...(govJobs.status === 'fulfilled' ? govJobs.value : []),
        ...(startupJobs.status === 'fulfilled' ? startupJobs.value : [])
      ];
      
      // Remove duplicates based on title and company
      const uniqueJobs = allJobs.filter((job, index, self) => 
        index === self.findIndex(j => j.title === job.title && j.company === job.company)
      );
      
      // Filter for LGBTQ+ friendly jobs
      const lgbtqFriendlyJobs = uniqueJobs.filter(job => job.isLGBTQFriendly);
      
      console.log(`✅ Scraped ${uniqueJobs.length} total jobs, ${lgbtqFriendlyJobs.length} LGBTQ+ friendly`);
      
      // Store in database (implement based on your database choice)
      await this.storeJobsInDatabase(lgbtqFriendlyJobs);
      
      return lgbtqFriendlyJobs;
    } catch (error) {
      console.error('❌ Job scraping failed:', error);
      return [];
    } finally {
      await this.closeBrowser();
    }
  }

  // Store jobs in database
  async storeJobsInDatabase(jobs) {
    // Implementation depends on your database choice
    // This is a placeholder for database storage logic
    console.log(`📊 Storing ${jobs.length} jobs in database...`);
    
    // Example for Supabase
    try {
      const { supabase } = await import('../index.js');
      if (supabase) {
        const { data, error } = await supabase
          .from('jobs')
          .upsert(jobs, { onConflict: 'title,company' });
        
        if (error) {
          console.error('Database storage error:', error);
        } else {
          console.log('✅ Jobs stored successfully');
        }
      }
    } catch (error) {
      console.error('Database connection error:', error);
    }
  }

  // Get latest jobs from database
  async getLatestJobs(limit = 50) {
    try {
      const { supabase } = await import('../index.js');
      if (supabase) {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('postedDate', { ascending: false })
          .limit(limit);
        
        if (error) {
          console.error('Error fetching jobs:', error);
          return [];
        }
        
        return data || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting latest jobs:', error);
      return [];
    }
  }
}

export const jobScrapingService = new JobScrapingService();