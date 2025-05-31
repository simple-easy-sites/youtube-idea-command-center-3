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
  tutorialType?: string; // Optional: if we decide to store this on the idea
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

// --- REVISED HIGH RPM NICHE STRUCTURE ---
export interface HighRpmNicheDetail {
  name: string; // e.g., "Artificial Intelligence & Machine Learning"
  description: string; // General description of the niche
  examples: string[]; // Prominent software, tools, or platforms in this niche
  category: string; // To which category it belongs
}

export interface HighRpmNicheCategory {
  categoryName: string; // e.g., "Technology & Software"
  niches: HighRpmNicheDetail[];
}

export enum TutorialType {
  GENERAL_OVERVIEW = "General Overview/Introduction",
  BEGINNER_GUIDE = "Beginner Guide (Step-by-Step)",
  ADVANCED_TECHNIQUES = "Advanced Techniques & Features",
  TROUBLESHOOTING_FIXES = "Troubleshooting & Common Fixes",
  FEATURE_DEEP_DIVE = "Specific Feature Deep Dive",
  COMPARISON_VS = "Comparison (vs. Other Tools/Methods)",
  PRACTICAL_USE_CASES = "Practical Use Cases & Examples",
  NEWS_UPDATES_CHANGES = "News, Updates, & Recent Changes",
  INSTALLATION_SETUP = "Installation & Setup Guide",
  INTEGRATIONS_WORKFLOWS = "Integrations & Workflows",
  API_AUTOMATION_SCRIPTING = "API Usage, Automation & Scripting",
  BEST_PRACTICES_TIPS = "Best Practices & Pro Tips",
  CASE_STUDIES_ANALYSIS = "Case Studies & Analysis",
  REVIEW_FIRST_LOOK = "Review & First Look",
  CHALLENGES_SOLUTIONS = "Specific Challenges & Solutions"
}


export const NEW_HIGH_RPM_CATEGORIES: HighRpmNicheCategory[] = [
  {
    categoryName: "Technology & Software Platforms",
    niches: [
      { 
        name: "Artificial Intelligence & Machine Learning", 
        category: "Technology & Software Platforms", 
        description: "Covers AI models, libraries, frameworks, platforms, and applications for AI and ML development and usage.", 
        examples: ["ChatGPT (OpenAI)", "Gemini API (Google)", "Claude AI (Anthropic)", "Midjourney", "DALL-E 3", "Stable Diffusion", "TensorFlow", "PyTorch", "Scikit-learn", "Keras", "Hugging Face Transformers", "LangChain", "Google Vertex AI", "AWS SageMaker", "Azure Machine Learning", "RunwayML", "Llama (Meta)", "Mistral AI Models"] 
      },
      { 
        name: "Cloud Computing & DevOps", 
        category: "Technology & Software Platforms", 
        description: "Platforms and tools for cloud infrastructure, services, containerization, orchestration, and development operations.", 
        examples: ["Amazon Web Services (AWS EC2, S3, Lambda, etc.)", "Microsoft Azure (VMs, Blob Storage, Functions, etc.)", "Google Cloud Platform (GCP Compute Engine, Cloud Storage, etc.)", "Docker", "Kubernetes (K8s)", "Terraform", "Ansible", "Jenkins", "GitLab CI/CD", "GitHub Actions", "DigitalOcean", "Linode", "Vercel", "Netlify", "OpenShift"] 
      },
      { 
        name: "Cybersecurity & Data Protection", 
        category: "Technology & Software Platforms", 
        description: "Tools and practices for cybersecurity, network security, data privacy, and threat protection.", 
        examples: ["CrowdStrike", "Palo Alto Networks Firewalls", "Fortinet FortiGate", "Splunk", "Wireshark", "Nmap", "Metasploit Framework", "Kali Linux", "LastPass (for business)", "1Password (for teams)", "NordVPN/NordLayer", "ProtonVPN", "OpenVPN", "Various EDR/XDR solutions", "SIEM platforms"] 
      },
      {
        name: "Web Development & Hosting",
        category: "Technology & Software Platforms",
        description: "Frameworks, libraries, CMS, and platforms for building and hosting websites and web applications.",
        examples: ["React.js", "Angular", "Vue.js", "Node.js", "Express.js", "Django", "Ruby on Rails", "WordPress", "Drupal", "Joomla", "Shopify (Theme Dev/APIs)", "Wix (Dev Mode)", "Squarespace (Dev Mode)", "Kinsta", "WP Engine", "SiteGround", "Cloudways", "Netlify", "Vercel", "Firebase Hosting"]
      },
       {
        name: "Mobile App Development",
        category: "Technology & Software Platforms",
        description: "Frameworks, tools, and platforms for creating native and cross-platform mobile applications.",
        examples: ["Swift (iOS)", "Kotlin (Android)", "Java (Android)", "React Native", "Flutter", "Xamarin", "Ionic", "NativeScript", "Xcode", "Android Studio", "Firebase (for mobile)", "AWS Amplify"]
      },
      {
        name: "Game Development Engines & Tools",
        category: "Technology & Software Platforms",
        description: "Software for creating 2D and 3D video games for various platforms.",
        examples: ["Unity", "Unreal Engine", "Godot Engine", "CryEngine", "Blender (for 3D modeling)", "Maya", "3ds Max", "Aseprite (pixel art)"]
      },
    ]
  },
  {
    categoryName: "Business Operations & Productivity Software",
    niches: [
      { 
        name: "Accounting & Bookkeeping Software", 
        category: "Business Operations & Productivity Software", 
        description: "Tools for managing business and personal finances, invoicing, payroll, and tax preparation.", 
        examples: ["QuickBooks Online", "QuickBooks Desktop", "Xero", "FreshBooks", "Zoho Books", "Sage Accounting (Intacct)", "Wave Accounting", "MYOB", "NetSuite ERP (Finance modules)", "SAP S/4HANA (Finance modules)"] 
      },
      { 
        name: "CRM (Customer Relationship Management) Platforms", 
        category: "Business Operations & Productivity Software", 
        description: "Software for managing customer interactions, sales pipelines, marketing automation, and service.", 
        examples: ["Salesforce Sales Cloud", "HubSpot CRM", "Zoho CRM", "Pipedrive", "Monday.com Sales CRM", "ActiveCampaign (CRM features)", "Microsoft Dynamics 365 Sales", "SAP Sales Cloud", "Oracle Siebel CRM", "NetSuite CRM"] 
      },
      { 
        name: "ERP (Enterprise Resource Planning) Systems", 
        category: "Business Operations & Productivity Software", 
        description: "Integrated management of main business processes, often in real time, mediated by software and technology.", 
        examples: ["SAP S/4HANA", "Oracle NetSuite", "Microsoft Dynamics 365 (Finance & Operations, Business Central)", "Oracle ERP Cloud", "Infor ERP", "Epicor ERP", "Odoo"] 
      },
      { 
        name: "Payment Processing & POS Systems", 
        category: "Business Operations & Productivity Software", 
        description: "Platforms and tools for accepting payments, managing point-of-sale transactions, and online payment gateways.", 
        examples: ["Stripe", "Square (POS/Payments)", "PayPal for Business", "Shopify Payments", "Adyen", "Clover POS", "Toast POS", "Lightspeed POS", "Authorize.net", "Braintree"] 
      },
      { 
        name: "E-commerce Platforms & Tools", 
        category: "Business Operations & Productivity Software", 
        description: "Software for building, managing, and scaling online stores and e-commerce operations.", 
        examples: ["Shopify", "WooCommerce (WordPress)", "BigCommerce", "Magento (Adobe Commerce)", "Squarespace Commerce", "Wix eCommerce", "Etsy Seller Platform", "Amazon Seller Central (FBA/FBM)", "PrestaShop", "OpenCart"] 
      },
      { 
        name: "Email Marketing & Automation Platforms", 
        category: "Business Operations & Productivity Software", 
        description: "Tools for creating email campaigns, managing subscriber lists, and automating marketing/sales workflows.", 
        examples: ["Mailchimp", "ConvertKit", "ActiveCampaign", "Klaviyo", "Brevo (formerly Sendinblue)", "MailerLite", "Constant Contact", "HubSpot Marketing Hub", "Beehiiv", "Substack (for newsletters)", "Moosend", "GetResponse"] 
      },
      { 
        name: "Digital Advertising Platforms", 
        category: "Business Operations & Productivity Software", 
        description: "Platforms for managing and optimizing paid advertising campaigns across various online channels.", 
        examples: ["Google Ads (Search, Display, YouTube)", "Meta Ads Manager (Facebook & Instagram)", "TikTok Ads Manager", "LinkedIn Ads", "X Ads (Twitter Ads)", "Pinterest Ads", "Amazon Advertising", "Microsoft Advertising (Bing Ads)", "Programmatic Ad Platforms (e.g., Google DV360, The Trade Desk)"] 
      },
      { 
        name: "SEO & Content Marketing Tools", 
        category: "Business Operations & Productivity Software", 
        description: "Software for keyword research, site audits, rank tracking, content optimization, and link building.", 
        examples: ["Ahrefs", "Semrush", "Moz Pro", "Google Search Console", "Google Analytics 4", "Screaming Frog SEO Spider", "Surfer SEO", "Clearscope", "Yoast SEO (WordPress)", "Rank Math (WordPress)", "AnswerThePublic", "AlsoAsked"] 
      },
      { 
        name: "Project Management & Productivity Suites", 
        category: "Business Operations & Productivity Software", 
        description: "Tools for team collaboration, task management, project planning, and overall business productivity.", 
        examples: ["Asana", "Monday.com", "ClickUp", "Notion (for teams)", "Trello", "Jira (for software development)", "Microsoft Project", "Microsoft Teams", "Slack", "Google Workspace (Docs, Sheets, Slides, Meet)", "Microsoft 365 (Word, Excel, PowerPoint, Teams)", "Smartsheet", "Wrike", "Basecamp"] 
      },
      { 
        name: "Business Intelligence & Data Analytics Tools", 
        category: "Business Operations & Productivity Software", 
        description: "Software for data visualization, reporting, and gaining insights from business data.", 
        examples: ["Microsoft Power BI", "Tableau", "Google Looker Studio (formerly Data Studio)", "Qlik Sense", "Sisense", "Mode Analytics", "ThoughtSpot", "Zoho Analytics", "Google Analytics 4"]
      }
    ]
  },
  {
    categoryName: "Personal Finance & Investment Platforms",
    niches: [
      { 
        name: "Online & Mobile Banking Applications", 
        category: "Personal Finance & Investment Platforms", 
        description: "Consumer and business banking applications for managing accounts, payments, and transfers.", 
        examples: ["Zelle", "Venmo", "PayPal (Personal)", "Cash App", "Chime", "Monzo", "Revolut", "Wise (formerly TransferWise)", "N26", "Ally Bank App", "Capital One Mobile App", "Bank of America Mobile App", "Chase Mobile App", "Wells Fargo Mobile App"] 
      },
      { 
        name: "Investing & Brokerage Platforms", 
        category: "Personal Finance & Investment Platforms", 
        description: "Platforms for trading stocks, ETFs, options, mutual funds, and managing retirement accounts.", 
        examples: ["Robinhood", "Fidelity", "Charles Schwab", "Vanguard", "TD Ameritrade (Thinkorswim)", "E*TRADE", "Interactive Brokers", "Webull", "M1 Finance", "Public.com", "Betterment", "Wealthfront"] 
      },
      { 
        name: "Cryptocurrency Exchanges & Wallets", 
        category: "Personal Finance & Investment Platforms", 
        description: "Platforms for buying, selling, trading, and storing cryptocurrencies and digital assets.", 
        examples: ["Coinbase", "Binance", "Kraken", "Gemini Exchange", "Crypto.com", "MetaMask", "Ledger Nano (Hardware Wallet)", "Trezor (Hardware Wallet)", "Exodus Wallet", "Trust Wallet", "Uniswap (DEX)", "PancakeSwap (DEX)", "OpenSea (NFT Marketplace)", "Blur (NFT Marketplace)"] 
      },
      { 
        name: "Personal Finance & Budgeting Software", 
        category: "Personal Finance & Investment Platforms", 
        description: "Tools for budgeting, expense tracking, financial planning, tax preparation, and credit management.", 
        examples: ["YNAB (You Need A Budget)", "Mint (Intuit)", "Quicken", "Personal Capital (Empower)", "TurboTax", "H&R Block Software", "Credit Karma", "Rocket Money (formerly Truebill)", "Simplifi by Quicken", "PocketGuard", "Goodbudget"] 
      },
      {
        name: "Real Estate & Mortgage Platforms",
        category: "Personal Finance & Investment Platforms",
        description: "Online platforms for property search, real estate investment, mortgage applications, and management.",
        examples: ["Zillow", "Redfin", "Realtor.com", "Rocket Mortgage", "Better.com", "Fundrise", "Roofstock", "Trulia", "Apartments.com"]
      }
    ]
  },
  {
    categoryName: "Creative & Design Software",
    niches: [
      {
        name: "Graphic Design & Photo Editing Software",
        category: "Creative & Design Software",
        description: "Tools for creating and manipulating digital images, illustrations, and layouts.",
        examples: ["Adobe Photoshop", "Adobe Illustrator", "Adobe InDesign", "Canva", "Figma (for design)", "Affinity Photo", "Affinity Designer", "Procreate (iPad)", "GIMP", "Krita", "CorelDRAW", "Inkscape"]
      },
      {
        name: "Video Editing & Motion Graphics Software",
        category: "Creative & Design Software",
        description: "Software for editing video footage, creating visual effects, and motion graphics.",
        examples: ["Adobe Premiere Pro", "Adobe After Effects", "Final Cut Pro X", "DaVinci Resolve", "CapCut", "Filmora", "iMovie", "HitFilm Express", "Blender (Video Editing Sequence Editor)", "VEGAS Pro", "Avid Media Composer"]
      },
      {
        name: "3D Modeling & Animation Software",
        category: "Creative & Design Software",
        description: "Tools for creating 3D models, sculptures, animations, and visual effects.",
        examples: ["Blender", "Autodesk Maya", "Autodesk 3ds Max", "Cinema 4D", "ZBrush", "Substance Painter", "Substance Designer", "Houdini", "Modo", "SketchUp"]
      },
      {
        name: "UI/UX Design & Prototyping Tools",
        category: "Creative & Design Software",
        description: "Software for designing user interfaces, user experiences, and interactive prototypes.",
        examples: ["Figma", "Adobe XD", "Sketch", "InVision", "Axure RP", "Marvel App", "Proto.io", "Balsamiq", "Framer"]
      },
      {
        name: "Audio Production & Music Software (DAWs)",
        category: "Creative & Design Software",
        description: "Digital Audio Workstations and tools for recording, editing, mixing, and mastering audio and music.",
        examples: ["Ableton Live", "Logic Pro X", "Pro Tools", "FL Studio", "Cubase", "Reaper", "Studio One", "GarageBand", "Audacity", "Bitwig Studio"]
      }
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
