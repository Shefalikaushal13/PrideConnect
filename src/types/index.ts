export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  pronouns?: string;
  location?: string;
  interests?: string[];
  isOnline?: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements: string[];
  isLGBTQFriendly: boolean;
  postedDate: Date;
  applyUrl: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'pride' | 'mental-health' | 'community' | 'resources';
  author: string;
  publishedDate: Date;
  readTime: number;
  tags: string[];
  imageUrl?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  coordinates?: { lat: number; lng: number };
  organizer: string;
  category: 'pride' | 'support-group' | 'social' | 'educational';
  attendees: number;
  maxAttendees?: number;
  isVirtual: boolean;
  registrationUrl?: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}