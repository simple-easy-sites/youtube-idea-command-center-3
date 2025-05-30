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
  channelId?: string; 
  channelSubscriberCountText?: string; 
  viewCountText?: string; 
  publishedAtText?: string; 
  publishedAtDate?: Date; 
  descriptionSnippet?: string; 
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
  source: string; 
  priority: IdeaPriority;
  status: IdeaStatus;
  createdAt: string; 
  lastUpdatedAt: string; 
  
  optimalKeywords?: string[]; 
  suggestedKeywords?: string[]; 
  
  script?: string; 
  videoInstructions?: string; 
  suggestedResources?: string[]; 
  scriptLengthMinutes?: number; 
  
  expandedIdeas?: string[]; 
  expandedIdeasWithKeywords?: Array<{text: string, keywords: string[]}>; 

  youtubeResults?: YouTubeVideoResult[]; 
  aiCompetitiveAngle?: string; 
  
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
  [IdeaStatus.DISCARDED]: VideoIdea[];
}

export interface FlashMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface AIStrategicGuidance {
  mainRecommendation?: string; 
  recommendedNiches?: string[]; 
  recommendedApps?: { niche: string; apps: string[] }[]; 
  recommendedVideoTypes?: string[]; 
}

// --- NEW HIGH RPM NICHE STRUCTURE ---
export interface HighRpmNicheDetail {
  name: string; // e.g., "Online & Mobile Banking App Tutorials"
  description: string;
  examples: string[]; // e.g., ["Zelle", "Venmo", ...]
  category: string; // To which category it belongs
}

export interface HighRpmNicheCategory {
  categoryName: string; // e.g., "Core Finance & Wealth Management"
  niches: HighRpmNicheDetail[];
}

export const NEW_HIGH_RPM_CATEGORIES: HighRpmNicheCategory[] = [
  {
    categoryName: "Core Finance & Wealth Management (Highest RPM Potential)",
    niches: [
      { name: "Online & Mobile Banking App Tutorials", category: "Core Finance & Wealth Management", description: "How-to guides for consumer and business banking applications.", examples: ["Zelle", "Venmo", "Chime", "Monzo", "Revolut", "Wise", "Bank of America Mobile App", "Wells Fargo Mobile App"] },
      { name: "Personal Investing & Brokerage Platform Tutorials", category: "Core Finance & Wealth Management", description: "Guides on using platforms for stocks, ETFs, options, mutual funds, retirement accounts.", examples: ["Robinhood", "Fidelity", "Charles Schwab", "Vanguard", "Thinkorswim", "eToro", "Trading 212", "M1 Finance"] },
      { name: "Crypto Trading, DeFi, & Web3 Tool Tutorials", category: "Core Finance & Wealth Management", description: "How-to guides for cryptocurrency exchanges, decentralized finance (DeFi) platforms, NFT marketplaces, and crypto wallets.", examples: ["Coinbase", "Binance", "Kraken", "MetaMask", "Ledger", "Trezor", "Uniswap", "OpenSea"] },
      { name: "High-Value Personal Finance Software & Strategies", category: "Core Finance & Wealth Management", description: "Tutorials for tax software, budgeting tools, credit management, and significant financial planning (e.g., mortgages, retirement).", examples: ["TurboTax", "Quicken", "Rocket Mortgage", "Credit Karma", "YNAB (You Need A Budget)", "Mint"] },
      { name: "Small Business Funding & Capital Acquisition", category: "Core Finance & Wealth Management", description: "Guides on obtaining business loans, grants, venture capital, and other funding sources.", examples: ["SBA Loans", "Kabbage", "Fundbox", "Main Street Lending Program", "Specific Business Credit Card Platforms"] }
    ]
  },
  {
    categoryName: "Business Software & Operations (Very High RPM Potential)",
    niches: [
      { name: "Accounting & Bookkeeping Software Tutorials", category: "Business Software & Operations", description: "How-to guides for managing business finances, invoicing, payroll, and tax preparation.", examples: ["QuickBooks (Online/Desktop)", "Xero", "FreshBooks", "Zoho Books", "Sage", "Wave Accounting"] },
      { name: "CRM (Customer Relationship Management) Software Tutorials", category: "Business Software & Operations", description: "Guides on managing customer interactions, sales pipelines, and marketing automation.", examples: ["Salesforce", "HubSpot CRM", "Zoho CRM", "Pipedrive", "monday.com CRM"] },
      { name: "ERP (Enterprise Resource Planning) Software Tutorials", category: "Business Software & Operations", description: "Complex enterprise system guides for managing core business processes (e.g., procurement, manufacturing, HR, finance).", examples: ["SAP (e.g., S/4HANA)", "Oracle ERP Cloud", "Microsoft Dynamics 365", "NetSuite"] },
      { name: "Payment Processing & Business POS System Tutorials", category: "Business Software & Operations", description: "How-to guides for accepting payments, managing point-of-sale systems, and online transactions.", examples: ["Stripe", "Square (POS/Payments)", "PayPal for Business", "Shopify Payments", "Clover", "Adyen"] },
      { name: "E-commerce Platform & Business Automation Tutorials", category: "Business Software & Operations", description: "Guides on setting up, managing, and automating online stores and sales processes.", examples: ["Shopify", "WooCommerce", "Amazon FBA Seller Central", "Etsy Seller", "BigCommerce", "Magento"] },
      { name: "Web Hosting & Enterprise Web Development Tutorials", category: "Business Software & Operations", description: "Guides on setting up business websites, web hosting management, and advanced site development tools.", examples: ["Kinsta", "WP Engine", "SiteGround", "Cloudways", "DigitalOcean", "Wix Business", "Squarespace Business"] },
      { name: "Email Marketing & Sales Automation Software Tutorials", category: "Business Software & Operations", description: "How-to guides for building email lists, creating campaigns, and automating sales outreach.", examples: ["Mailchimp", "ConvertKit", "Klaviyo", "ActiveCampaign", "Constant Contact", "Beehiiv"] },
      { name: "Paid Social Media Advertising & Analytics Tutorials", category: "Business Software & Operations", description: "Guides on running ads campaigns and analyzing performance on social media platforms.", examples: ["Facebook Ads Manager", "TikTok Ads Manager", "Google Ads (for video/display)", "LinkedIn Ads", "Google Analytics 4 (for paid traffic analysis)"] },
      { name: "SEO & Advanced Content Marketing Tools Tutorials", category: "Business Software & Operations", description: "How-to guides for optimizing websites for search engines, keyword research, and content strategy.", examples: ["Ahrefs", "Semrush", "Moz Pro", "Google Search Console", "Screaming Frog", "Surfer SEO", "Clearscope"] },
      { name: "Business Productivity & Project Management Software Tutorials", category: "Business Software & Operations", description: "Guides on managing team projects, workflows, and boosting business efficiency.", examples: ["Asana", "Monday.com", "ClickUp", "Notion (for teams)", "Microsoft Teams", "Slack (advanced features)", "Trello"] },
      { name: "General Business SaaS (Software as a Service) & B2B Tools", category: "Business Software & Operations", description: "Catch-all for other high-value business software not explicitly listed.", examples: ["Zoom (business features)", "Calendly (for business scheduling)", "DocuSign", "Intercom", "Zendesk", "Zapier (for business automation)"] }
    ]
  },
  {
    categoryName: "Specialized & Emerging Business Tech (High-Value, Often Complex)",
    niches: [
      { name: "Cloud Computing & Infrastructure Management", category: "Specialized & Emerging Business Tech", description: "Tutorials on managing cloud services, deploying applications, and cloud security.", examples: ["AWS (Amazon Web Services)", "Azure (Microsoft)", "Google Cloud Platform (GCP)", "Docker", "Kubernetes", "Terraform"] },
      { name: "Cybersecurity & Data Protection for Business", category: "Specialized & Emerging Business Tech", description: "Guides on implementing security solutions, protecting business data, and compliance.", examples: ["CrowdStrike", "Palo Alto Networks", "Fortinet", "LastPass (for business)", "NordLayer (VPN for teams)", "HIPAA Compliance Software"] },
      { name: "AI Tools for Business & Workflow Automation", category: "Specialized & Emerging Business Tech", description: "How to use AI models and platforms to automate tasks, generate content, and analyze data for business purposes.", examples: ["ChatGPT (Plus/Enterprise)", "Midjourney (for commercial use)", "Jasper AI", "Google Bard (for business)", "AI copywriting tools"] },
      { name: "Legal Tech & Business Compliance Software", category: "Specialized & Emerging Business Tech", description: "Tutorials for software assisting with contracts, legal research, regulatory compliance, and governance.", examples: ["Clio", "Contract Lifecycle Management (CLM) platforms", "e-Discovery software", "GDPR compliance tools"] }
    ]
  }
];

// --- OLD HIGH RPM NICHE STRUCTURE (TO BE REMOVED/REPLACED) ---
// This structure is now superseded by NEW_HIGH_RPM_CATEGORIES
export interface HighRpmNicheInfo {
  name: string; 
  examples?: string; 
  label: string; 
}

// This constant is being replaced. Keeping it temporarily to avoid breaking imports immediately,
// but it should be removed once constants.ts is updated.
export const HIGH_RPM_NICHES: HighRpmNicheInfo[] = [
  { name: 'Placeholder Niche', label: 'This is a placeholder, update constants.ts' }
];
// --- END OF OLD STRUCTURE ---
