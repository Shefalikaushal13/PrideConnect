import { JobOpportunity, BlogPost, Event, User } from '../types';

export const mockJobs: JobOpportunity[] = [
  {
    id: '1',
    title: 'Diversity & Inclusion Specialist',
    company: 'Tech Mahindra',
    location: 'Mumbai, Maharashtra',
    type: 'full-time',
    description: 'Lead diversity initiatives and create inclusive workplace policies. Work with leadership to foster an environment where all employees can thrive.',
    requirements: ['Bachelor\'s degree in HR/Psychology', '3+ years D&I experience', 'LGBTQ+ advocacy experience', 'Strong communication skills'],
    isLGBTQFriendly: true,
    postedDate: new Date('2025-06-29'),
    applyUrl: 'https://example.com/apply/1'
  },
  {
    id: '2',
    title: 'Mental Health Counselor',
    company: 'Rainbow Foundation',
    location: 'Delhi, NCR',
    type: 'full-time',
    description: 'Provide mental health support specifically for LGBTQ+ individuals. Conduct individual and group therapy sessions.',
    requirements: ['Masters in Psychology/Counseling', 'Licensed counselor', 'LGBTQ+ cultural competency', 'Bilingual preferred'],
    isLGBTQFriendly: true,
    postedDate: new Date('2025-06-29'),
    applyUrl: 'https://example.com/apply/2'
  },
  {
    id: '3',
    title: 'Community Outreach Coordinator',
    company: 'Pride India',
    location: 'Bangalore, Karnataka',
    type: 'part-time',
    description: 'Organize community events and awareness programs. Build partnerships with local organizations.',
    requirements: ['Event management experience', 'Community engagement skills', 'Bilingual preferred', 'Social media knowledge'],
    isLGBTQFriendly: true,
    postedDate: new Date('2025-06-28'),
    applyUrl: 'https://example.com/apply/3'
  },
  {
    id: '4',
    title: 'Software Engineer - Accessibility',
    company: 'Microsoft India',
    location: 'Hyderabad, Telangana',
    type: 'full-time',
    description: 'Develop inclusive technology solutions and accessibility features for diverse users.',
    requirements: ['B.Tech in Computer Science', '2+ years experience', 'Accessibility standards knowledge', 'Inclusive design passion'],
    isLGBTQFriendly: true,
    postedDate: new Date('2025-06-27'),
    applyUrl: 'https://example.com/apply/4'
  },
  {
    id: '5',
    title: 'Social Welfare Officer',
    company: 'Government of India',
    location: 'Chennai, Tamil Nadu',
    type: 'full-time',
    description: 'Implement LGBTQ+ welfare programs and policies. Work with marginalized communities.',
    requirements: ['Masters in Social Work', 'Government exam qualification', 'Community service experience', 'Regional language fluency'],
    isLGBTQFriendly: true,
    postedDate: new Date('2025-06-27'),
    applyUrl: 'https://example.com/apply/5'
  },
  {
    id: '6',
    title: 'Content Creator - LGBTQ+ Advocacy',
    company: 'Humsafar Trust',
    location: 'Mumbai, Maharashtra',
    type: 'contract',
    description: 'Create educational content and campaigns for LGBTQ+ awareness and rights.',
    requirements: ['Content creation experience', 'LGBTQ+ advocacy knowledge', 'Video/graphic design skills', 'Social media expertise'],
    isLGBTQFriendly: true,
    postedDate: new Date('2025-06-26'),
    applyUrl: 'https://example.com/apply/6'
  }
];

export const mockBlogs: BlogPost[] = [
  {
    id: '1',
    title: 'Understanding Your Mental Health Journey as an LGBTQ+ Individual',
    excerpt: 'A comprehensive guide to mental wellness, self-care, and finding support within the LGBTQ+ community.',
    content: `Mental health is a crucial aspect of overall well-being, and for LGBTQ+ individuals, this journey can come with unique challenges and experiences. Understanding these aspects is the first step toward building resilience and finding the support you need.

**The Unique Mental Health Challenges**

LGBTQ+ individuals often face minority stress - the chronic stress experienced by stigmatized minority groups. This can manifest as:
- Internalized homophobia or transphobia
- Fear of rejection or discrimination
- Identity concealment stress
- Lack of family or social support

**Building Your Support Network**

Creating a strong support system is essential:
1. Connect with LGBTQ+ affirming mental health professionals
2. Join support groups or community organizations
3. Build relationships with accepting friends and chosen family
4. Engage with online communities for additional support

**Self-Care Strategies**

Developing healthy coping mechanisms:
- Practice mindfulness and meditation
- Engage in regular physical activity
- Maintain a journal for emotional processing
- Set boundaries to protect your mental health
- Celebrate your identity and achievements

**When to Seek Professional Help**

Consider reaching out to a mental health professional if you experience:
- Persistent feelings of sadness or anxiety
- Difficulty functioning in daily life
- Thoughts of self-harm
- Substance abuse issues
- Relationship difficulties

Remember, seeking help is a sign of strength, not weakness. Your mental health matters, and you deserve support and care.`,
    category: 'mental-health',
    author: 'Dr. Priya Sharma',
    publishedDate: new Date('2024-01-10'),
    readTime: 8,
    tags: ['mental-health', 'wellness', 'self-care', 'support'],
    imageUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg'
  },
  {
    id: '2',
    title: 'Pride Month: Celebrating Diversity and Progress in India',
    excerpt: 'Exploring the history, significance, and evolution of Pride celebrations across India.',
    content: `Pride Month is a time of celebration, reflection, and advocacy for LGBTQ+ rights and visibility. In India, the Pride movement has grown significantly over the past decades, marking important milestones in the fight for equality and acceptance.

**The History of Pride in India**

The first Pride march in India took place in Kolkata in 1999, organized by the Counsel Club. Since then, Pride celebrations have spread across major cities:
- Delhi Pride (since 2008)
- Mumbai Pride (since 2008)
- Bangalore Pride (since 2008)
- Chennai Pride (since 2009)

**Significant Legal Milestones**

India has seen remarkable progress in LGBTQ+ rights:
- 2009: Delhi High Court decriminalizes homosexuality
- 2013: Supreme Court reverses the decision
- 2018: Supreme Court strikes down Section 377
- 2019: Transgender Persons Act passed

**The Importance of Visibility**

Pride celebrations serve multiple purposes:
1. Increasing visibility and awareness
2. Building community and solidarity
3. Advocating for equal rights
4. Celebrating diversity and identity
5. Educating the public about LGBTQ+ issues

**How to Participate**

You can be part of the Pride movement by:
- Attending local Pride events
- Supporting LGBTQ+ organizations
- Educating yourself and others
- Being an ally to the community
- Sharing your story (if comfortable)

**Looking Forward**

While significant progress has been made, challenges remain:
- Social acceptance and family support
- Workplace discrimination
- Access to healthcare
- Legal recognition of relationships

Pride Month reminds us that the journey toward full equality continues, and every voice matters in this movement.`,
    category: 'pride',
    author: 'Arjun Mehta',
    publishedDate: new Date('2024-01-12'),
    readTime: 6,
    tags: ['pride', 'history', 'celebration', 'rights', 'india'],
    imageUrl: 'https://images.pexels.com/photos/4098369/pexels-photo-4098369.jpeg'
  },
  {
    id: '3',
    title: 'Building Supportive Communities: A Guide to Connection',
    excerpt: 'How to create safe spaces and meaningful connections within the LGBTQ+ community.',
    content: `Community support is essential for LGBTQ+ individuals, providing a sense of belonging, understanding, and shared experience. Building and maintaining these supportive communities requires intentional effort and commitment from all members.

**The Power of Community**

Strong LGBTQ+ communities provide:
- Emotional support and understanding
- Shared resources and information
- Advocacy and collective action
- Celebration of identity and achievements
- Mentorship and guidance

**Creating Safe Spaces**

Essential elements of safe spaces include:
1. Respect for all identities and experiences
2. Confidentiality and privacy protection
3. Non-judgmental attitudes
4. Inclusive language and behavior
5. Clear community guidelines

**Online vs. Offline Communities**

Both have unique benefits:

**Online Communities:**
- Accessibility regardless of location
- Anonymity when needed
- 24/7 availability
- Diverse perspectives from around the world

**Offline Communities:**
- Face-to-face connection
- Local support and resources
- Physical safe spaces
- Real-world advocacy opportunities

**How to Get Involved**

Steps to join or build community:
1. Research local LGBTQ+ organizations
2. Attend community events and meetings
3. Volunteer for causes you care about
4. Join online forums and social groups
5. Start your own support group if needed

**Supporting Others**

Ways to be a supportive community member:
- Listen without judgment
- Share resources and information
- Offer practical help when possible
- Celebrate others' achievements
- Respect boundaries and privacy

**Overcoming Challenges**

Common community challenges and solutions:
- Inclusivity across all identities
- Generational differences
- Resource limitations
- Geographic barriers
- Maintaining engagement

Remember, building community is an ongoing process that requires patience, understanding, and commitment from everyone involved.`,
    category: 'community',
    author: 'Kavya Patel',
    publishedDate: new Date('2024-01-14'),
    readTime: 5,
    tags: ['community', 'support', 'connection', 'safe-spaces'],
    imageUrl: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg'
  },
  {
    id: '4',
    title: 'Navigating Workplace Challenges as an LGBTQ+ Professional',
    excerpt: 'Strategies for creating inclusive work environments and advancing your career while being authentic.',
    content: `The workplace can present unique challenges for LGBTQ+ professionals, from deciding whether to come out to dealing with discrimination. This guide offers strategies for navigating these challenges while building a successful career.

**Common Workplace Challenges**

LGBTQ+ professionals often face:
- Decision about disclosure of identity
- Lack of inclusive policies
- Microaggressions and bias
- Limited career advancement opportunities
- Absence of visible role models

**Creating Your Strategy**

Consider these factors when developing your approach:
1. Company culture and policies
2. Legal protections in your region
3. Your personal comfort level
4. Support systems available
5. Career goals and aspirations

**Building Allies**

Strategies for finding workplace allies:
- Identify inclusive colleagues and leaders
- Join or create employee resource groups
- Participate in diversity and inclusion initiatives
- Share your expertise on LGBTQ+ issues
- Mentor others in similar situations

**Advancing Your Career**

Tips for professional growth:
- Focus on performance and results
- Seek out sponsors and mentors
- Develop leadership skills
- Build a strong professional network
- Consider LGBTQ+ friendly companies

**Know Your Rights**

Understanding legal protections:
- Anti-discrimination laws
- Company policies and procedures
- Reporting mechanisms for harassment
- Resources for legal support
- Documentation best practices

**Self-Care at Work**

Maintaining well-being:
- Set healthy boundaries
- Find supportive colleagues
- Take breaks when needed
- Seek professional help if necessary
- Celebrate your achievements

Remember, you have the right to be authentic and successful in your career. While challenges exist, there are also many opportunities to create positive change and build inclusive workplaces.`,
    category: 'resources',
    author: 'Rajesh Kumar',
    publishedDate: new Date('2024-01-16'),
    readTime: 7,
    tags: ['workplace', 'career', 'professional', 'inclusion'],
    imageUrl: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg'
  }
];

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Delhi Pride Parade 2024',
    description: 'Annual pride parade celebrating LGBTQ+ rights and visibility. Join thousands in a colorful celebration of love, diversity, and equality.',
    date: new Date('2024-06-29'),
    location: 'Connaught Place, New Delhi',
    coordinates: { lat: 28.6315, lng: 77.2167 },
    organizer: 'Delhi Queer Pride Committee',
    category: 'pride',
    attendees: 5000,
    maxAttendees: 10000,
    isVirtual: false,
    registrationUrl: 'https://example.com/delhi-pride'
  },
  {
    id: '2',
    title: 'Mental Health Support Group - Mumbai',
    description: 'Weekly support group for LGBTQ+ individuals focusing on mental health, wellness, and peer support.',
    date: new Date('2024-02-15'),
    location: 'Mumbai Community Center, Bandra',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    organizer: 'Mumbai Pride Foundation',
    category: 'support-group',
    attendees: 25,
    maxAttendees: 30,
    isVirtual: false,
    registrationUrl: 'https://example.com/support-group'
  },
  {
    id: '3',
    title: 'LGBTQ+ Career Workshop',
    description: 'Professional development and networking event focusing on career advancement and workplace inclusion.',
    date: new Date('2024-02-20'),
    location: 'Bangalore Tech Hub',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    organizer: 'Queer Professionals Network',
    category: 'educational',
    attendees: 150,
    maxAttendees: 200,
    isVirtual: true,
    registrationUrl: 'https://example.com/career-workshop'
  },
  {
    id: '4',
    title: 'Rainbow Film Festival',
    description: 'Screening of LGBTQ+ themed films from around the world, followed by panel discussions.',
    date: new Date('2024-03-15'),
    location: 'Chennai Cultural Center',
    coordinates: { lat: 13.0827, lng: 80.2707 },
    organizer: 'Chennai Rainbow Collective',
    category: 'social',
    attendees: 200,
    maxAttendees: 300,
    isVirtual: false,
    registrationUrl: 'https://example.com/film-festival'
  },
  {
    id: '5',
    title: 'Trans Rights Workshop',
    description: 'Educational workshop on transgender rights, healthcare access, and legal protections in India.',
    date: new Date('2024-03-20'),
    location: 'Kolkata University',
    coordinates: { lat: 22.5726, lng: 88.3639 },
    organizer: 'Trans Rights Collective',
    category: 'educational',
    attendees: 80,
    maxAttendees: 100,
    isVirtual: false,
    registrationUrl: 'https://example.com/trans-workshop'
  },
  {
    id: '6',
    title: 'Virtual Pride Celebration',
    description: 'Online celebration featuring performances, speakers, and community connections from across India.',
    date: new Date('2024-06-15'),
    location: 'Online Event',
    coordinates: null,
    organizer: 'India Pride Network',
    category: 'pride',
    attendees: 1500,
    maxAttendees: 5000,
    isVirtual: true,
    registrationUrl: 'https://example.com/virtual-pride'
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Kumar',
    email: 'alex@example.com',
    pronouns: 'they/them',
    location: 'Mumbai, Maharashtra',
    interests: ['art', 'activism', 'mental health', 'photography'],
    isOnline: true
  },
  {
    id: '2',
    name: 'Priya Singh',
    email: 'priya@example.com',
    pronouns: 'she/her',
    location: 'Delhi, NCR',
    interests: ['photography', 'community building', 'literature'],
    isOnline: false
  },
  {
    id: '3',
    name: 'Rohan Patel',
    email: 'rohan@example.com',
    pronouns: 'he/him',
    location: 'Bangalore, Karnataka',
    interests: ['technology', 'pride events', 'music'],
    isOnline: true
  },
  {
    id: '4',
    name: 'Kavya Reddy',
    email: 'kavya@example.com',
    pronouns: 'she/her',
    location: 'Hyderabad, Telangana',
    interests: ['mental health', 'support groups', 'yoga'],
    isOnline: true
  },
  {
    id: '5',
    name: 'Sam Gupta',
    email: 'sam@example.com',
    pronouns: 'he/him',
    location: 'Chennai, Tamil Nadu',
    interests: ['activism', 'education', 'sports'],
    isOnline: false
  },
  {
    id: '6',
    name: 'Jordan Das',
    email: 'jordan@example.com',
    pronouns: 'they/them',
    location: 'Kolkata, West Bengal',
    interests: ['art', 'culture', 'community building'],
    isOnline: true
  }
];
