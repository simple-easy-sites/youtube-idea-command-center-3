// Define a type for Grounding Chunks if you have a more specific structure,
// otherwise any[] or a generic object is fine for now.
// Based on Gemini documentation, a web grounding chunk looks like: { web: { uri: string, title: string } }
export interface WebGroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}
export interface GroundingChunk extends WebGroundingChunk {} // Allow for other types later if needed

export enum IdeaStatus {
  NEW = 'New',
  PRIORITIZED = 'Prioritized',
  IN_PROGRESS = 'In Progress',
  VIDEO_MADE = 'Video Made',
  // ARCHIVED = 'Archived', // Removed status
  DISCARDED = 'Discarded',
}

export enum IdeaPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

export type UntappedScore = 'High' | 'Medium' | 'Low' | 'Not Assessed' | 'Error';

export interface YouTubeVideoResult {
  title: string;
  videoId: string;
  thumbnailUrl?: string;
  channelTitle?: string;
  viewCountText?: string; // e.g., "1.2M views"
  publishedAtText?: string; // e.g., "3 years ago"
  publishedAtDate?: Date; // Added for easier sorting/comparison
  descriptionSnippet?: string; // NEW: For AI competitor analysis
}

export interface TitleSuggestion {
  suggestedTitle: string;
  rationale: string;
}

export interface VideoIdea {
  id: string;
  text: string;
  niche: string;
  appSoftware: string;
  source: string; // 'AI Generated', 'YouTube Search Inspiration' (future), 'Expanded from [IdeaTitle]'
  priority: IdeaPriority;
  status: IdeaStatus;
  createdAt: string; // ISO date string
  lastUpdatedAt: string; // ISO date string
  
  optimalKeywords?: string[]; // NEW: Stores optimal keywords for this idea (e.g., from initial generation)
  suggestedKeywords?: string[]; // Keywords from the "Research Keywords" feature
  
  script?: string; 
  videoInstructions?: string; 
  suggestedResources?: string[]; 
  scriptLengthMinutes?: number; 
  
  expandedIdeas?: string[]; 
  expandedIdeasWithKeywords?: Array<{text: string, keywords: string[]}>; // NEW: For storing expanded ideas with their keywords

  youtubeResults?: YouTubeVideoResult[]; 
  youtubeAnalysis?: string; // NEW: AI's analysis of competitor angles/improvements
  
  isScriptLoading?: boolean;
  isExpanding?: boolean;
  isYouTubeLoading?: boolean;
  isKeywordsLoading?: boolean;
  isTitleOptimizing?: boolean;
  
  untappedScore?: UntappedScore;
  validationSummary?: string;
  lastValidatedAt?: string; 
  aiRationale?: string; 
  titleSuggestions?: TitleSuggestion[];
  keywordSearchGroundingChunks?: GroundingChunk[];
}

export interface NewIdeaData {
  text: string;
  niche: string;
  appSoftware: string;
  source: string;
  aiRationale?: string;
  optimalKeywords?: string[];
}

export interface CategorizedIdeas {
  [IdeaStatus.NEW]: VideoIdea[];
  [IdeaStatus.PRIORITIZED]: VideoIdea[];
  [IdeaStatus.IN_PROGRESS]: VideoIdea[];
  [IdeaStatus.VIDEO_MADE]: VideoIdea[];
  // [IdeaStatus.ARCHIVED]: VideoIdea[]; // Removed status
  [IdeaStatus.DISCARDED]: VideoIdea[];
}

export interface FlashMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

// NEW: For AI Strategic Guidance (PRD 1.7)
export interface AIStrategicGuidance {
  mainRecommendation?: string; // e.g., "Focus on beginner guides for Zelle as search volume is high..."
  recommendedNiches?: string[]; // e.g., ["AI & Machine Learning", "Personal Finance"]
  recommendedApps?: { niche: string; apps: string[] }[]; // e.g., [{niche: "AI & Machine Learning", apps: ["ChatGPT", "Midjourney"]}]
  recommendedVideoTypes?: string[]; // e.g., ["Beginner Guides", "Troubleshooting", "Comparison Videos"]
}

export interface HighRpmNicheInfo {
  name: string; 
  examples?: string; 
  label: string; 
}

// PRD 1.7 specified `HIGH_RPM_NICHES: string[]` in one section.
// However, the existing code and UI rely on the more structured `HighRpmNicheInfo[]`.
// For now, `HighRpmNicheInfo[]` is maintained for stability. If a simple string array is strictly needed later for a specific function, it can be derived.
export const HIGH_RPM_NICHES: HighRpmNicheInfo[] = [
  { name: 'Personal Finance', label: 'Personal Finance (e.g., Budgeting, Investing, Debt)' },
  { name: 'Online Banking', examples: 'Zelle, Venmo, Chime', label: 'Online Banking (e.g. Zelle, Venmo)' },
  { name: 'Accounting Software', examples: 'QuickBooks, Xero, Wave', label: 'Accounting Software (e.g. QuickBooks, Xero)' },
  { name: 'Personal Investing Platforms', examples: 'Thinkorswim, eToro, Robinhood', label: 'Personal Investing (e.g. Thinkorswim, eToro)' },
  { name: 'Cryptocurrency & Blockchain', examples: 'Bitcoin, Ethereum, Exchanges', label: 'Cryptocurrency & Blockchain' },
  { name: 'Web Hosting & Development', examples: 'Bluehost, GoDaddy, WordPress', label: 'Web Hosting & Development' },
  { name: 'Email Marketing Platforms', examples: 'Mailchimp, ConvertKit, ActiveCampaign', label: 'Email Marketing (e.g. Mailchimp, ConvertKit)' },
  { name: 'Social Media Marketing', examples: 'Facebook Ads, Instagram Marketing, TikTok Strategy', label: 'Social Media Marketing (Facebook, Instagram, TikTok Ads)' },
  { name: 'E-commerce Platforms', examples: 'Shopify, Amazon FBA, Etsy', label: 'E-commerce (e.g. Shopify, Amazon FBA)' },
  { name: 'SEO & Content Marketing', examples: 'Keyword Research, Link Building, Content Strategy', label: 'SEO & Content Marketing' },
  { name: 'Affiliate Marketing', examples: 'Amazon Associates, ClickBank', label: 'Affiliate Marketing' },
  { name: 'Software Development Tutorials', examples: 'Python, JavaScript, React, Node.js', label: 'Software Development & Programming Tutorials' },
  { name: 'Cloud Computing Platforms', examples: 'AWS, Azure, Google Cloud', label: 'Cloud Computing (AWS, Azure, Google Cloud)' },
  { name: 'Cybersecurity', examples: 'VPNs, Antivirus, Ethical Hacking', label: 'Cybersecurity' },
  { name: 'AI & Machine Learning', examples: 'ChatGPT, Sora, Midjourney, Prompt Engineering', label: 'AI & Machine Learning (ChatGPT, Sora, Midjourney, Prompt Engineering)' },
  { name: 'Real Estate Investing', examples: 'Flipping Houses, Rental Properties', label: 'Real Estate Investing' },
  { name: 'Dropshipping', label: 'Dropshipping' },
  { name: 'Online Course Platforms', examples: 'Teachable, Udemy, Skillshare', label: 'Online Courses & Education Platforms' },
  { name: 'Productivity Software & Tools', examples: 'Notion, Asana, Trello', label: 'Productivity Software & Tools' },
  { name: 'Graphic Design Software', examples: 'Canva, Adobe Photoshop, Illustrator', label: 'Graphic Design (e.g. Canva, Adobe Suite)' },
  { name: 'Video Editing Software', examples: 'DaVinci Resolve, Premiere Pro, Final Cut Pro', label: 'Video Editing (e.g. DaVinci Resolve, Premiere Pro)' },
];