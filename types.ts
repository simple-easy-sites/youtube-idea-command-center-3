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
  duration?: string; // e.g., "2:35", "0:45"
  videoType?: 'Video' | 'Short' | 'Unknown'; // Classification
}

export interface TitleSuggestion {
  suggestedTitle: string;
  rationale: string;
}

export interface VideoIdea {
  id: string;
  text: string;
  niche: string; // This will store the name from NicheDefinition
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
  scriptLengthMinutes?: number; // Target length, can be up to 20 minutes now
  
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

// --- NEW FLAT NICHE STRUCTURE BASED ON USER'S IMAGE ---
export interface NicheDefinition {
  id: string; // A unique identifier, e.g., "accounting_bookkeeping_software_tools"
  name: string; // The display name, e.g., "Accounting & Bookkeeping Software and Tools"
  originalNameFromImage: string; // Original name from the user-provided image
  description: string; // A brief description of the niche
  examples: string[]; // Prominent software, tools, or platforms in this niche
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

// Niches based on the user-provided image, transformed as requested.
export const USER_DEFINED_NICHES: NicheDefinition[] = [
  {
    id: "accounting_bookkeeping_software_tools",
    name: "Accounting & Bookkeeping Software and Tools",
    originalNameFromImage: "Accounting & Bookkeeping Software Tutorials",
    description: "Software and tools for managing financial records, invoicing, payroll, and tax preparation for businesses and individuals.",
    examples: ["QuickBooks Online", "QuickBooks Desktop", "Xero", "FreshBooks", "Wave Accounting", "Zoho Books", "Sage Intacct", "NetSuite (Finance Modules)", "MYOB", "Oracle Financials Cloud", "SAP S/4HANA Finance", "FreeAgent", "KashFlow", "GnuCash", "Manager.io"]
  },
  {
    id: "ai_machine_learning_software_tools",
    name: "Artificial Intelligence & Machine Learning Software and Tools",
    originalNameFromImage: "AI Tools for Business & Workflow Automation", // User specified this rename
    description: "Platforms, libraries, frameworks, and applications for developing, deploying, and utilizing AI and machine learning models.",
    examples: ["ChatGPT (OpenAI)", "Gemini API (Google)", "Claude AI (Anthropic)", "DALL-E 3 / ChatGPT Vision", "Midjourney", "Stable Diffusion", "Hugging Face Transformers", "TensorFlow", "PyTorch", "Scikit-learn", "Keras", "LangChain", "LlamaIndex", "Google Vertex AI Platform", "AWS SageMaker", "Azure Machine Learning", "RunwayML", "Colab / Jupyter Notebooks", "RapidMiner", "DataRobot", "H2O.ai", "KNIME"]
  },
  {
    id: "business_productivity_project_management_software_tools",
    name: "Business Productivity & Project Management Software and Tools",
    originalNameFromImage: "Business Productivity & Project Management Software Tutorials",
    description: "Applications and suites for task management, team collaboration, project planning, and enhancing overall business efficiency.",
    examples: ["Asana", "Monday.com", "ClickUp", "Trello", "Jira (Atlassian)", "Notion", "Slack", "Microsoft Teams", "Google Workspace (Docs, Sheets, Slides, Meet)", "Microsoft 365 (Word, Excel, PowerPoint, Planner)", "Smartsheet", "Wrike", "Basecamp", "Airtable", "Todoist", "Evernote", "Confluence (Atlassian)"]
  },
  {
    id: "cloud_computing_infrastructure_management_software_tools",
    name: "Cloud Computing & Infrastructure Management Software and Tools",
    originalNameFromImage: "Cloud Computing & Infrastructure Management",
    description: "Platforms, services, and tools for managing cloud-based resources, infrastructure as code, containerization, and CI/CD pipelines.",
    examples: ["Amazon Web Services (AWS - EC2, S3, Lambda, RDS, etc.)", "Microsoft Azure (VMs, Blob Storage, Functions, Azure DevOps, etc.)", "Google Cloud Platform (GCP - Compute Engine, Cloud Storage, Kubernetes Engine, etc.)", "Docker", "Kubernetes (K8s)", "Terraform", "Ansible", "Jenkins", "GitLab CI/CD", "GitHub Actions", "OpenShift", "VMware vSphere", "DigitalOcean", "Linode", "Vercel", "Netlify", "Heroku", "Cloudflare"]
  },
  {
    id: "crm_software_tools",
    name: "CRM (Customer Relationship Management) Software and Tools",
    originalNameFromImage: "CRM (Customer Relationship Management) Software Tutorials",
    description: "Software solutions for managing customer interactions, sales pipelines, marketing campaigns, and customer service.",
    examples: ["Salesforce Sales Cloud", "HubSpot CRM", "Zoho CRM", "Pipedrive", "ActiveCampaign (CRM)", "Microsoft Dynamics 365 Sales", "Monday.com Sales CRM", "Oracle Siebel CRM", "SAP Sales Cloud", "NetSuite CRM", "Zendesk Sell", "Insightly", "Copper (formerly ProsperWorks)", "Agile CRM", "Capsule CRM"]
  },
  {
    id: "crypto_trading_defi_web3_software_tools",
    name: "Crypto Trading, DeFi, & Web3 Software and Tools",
    originalNameFromImage: "Crypto Trading, DeFi, & Web3 Tool Tutorials",
    description: "Platforms, wallets, and tools for trading cryptocurrencies, interacting with decentralized finance protocols, and engaging with Web3 applications.",
    examples: ["Binance", "Coinbase", "Kraken", "MetaMask", "Ledger Nano (Hardware Wallet)", "Trezor (Hardware Wallet)", "Trust Wallet", "Exodus Wallet", "Uniswap (DEX)", "PancakeSwap (DEX)", "Aave", "Compound", "Curve Finance", "OpenSea (NFT Marketplace)", "Blur (NFT Marketplace)", "Phantom Wallet (Solana)", "TradingView (for crypto charts)", "CoinMarketCap", "CoinGecko", "Etherscan", "PolygonScan"]
  },
  {
    id: "cybersecurity_data_protection_software_tools",
    name: "Cybersecurity & Data Protection Software and Tools",
    originalNameFromImage: "Cybersecurity & Data Protection for Business",
    description: "Software and practices for network security, endpoint protection, data privacy, threat detection, and incident response.",
    examples: ["CrowdStrike Falcon", "Palo Alto Networks Next-Generation Firewalls", "Fortinet FortiGate", "Splunk (for SIEM)", "Wireshark", "Nmap", "Metasploit Framework", "Kali Linux", "Burp Suite", "LastPass (for Business)", "1Password (for Teams)", "NordVPN/NordLayer", "ProtonVPN", "OpenVPN", "Various EDR/XDR Solutions (e.g., SentinelOne, Microsoft Defender for Endpoint)", "SIEM Platforms (e.g., IBM QRadar, LogRhythm)", "Bitdefender GravityZone", "Malwarebytes for Business", "HashiCorp Vault"]
  },
  {
    id: "ecommerce_platform_business_automation_software_tools",
    name: "E-commerce Platform & Business Automation Software and Tools",
    originalNameFromImage: "E-commerce Platform & Business Automation Tutorials",
    description: "Platforms for building online stores, managing inventory and sales, and tools for automating e-commerce workflows.",
    examples: ["Shopify", "WooCommerce (WordPress)", "BigCommerce", "Magento (Adobe Commerce)", "Squarespace Commerce", "Wix eCommerce", "Etsy Seller Tools", "Amazon Seller Central (FBA/FBM)", "Zapier (for automation)", "Make (formerly Integromat, for automation)", "Shopify Flow", "ShipStation", "Printful / Printify (Print-on-Demand integration)", "Jungle Scout / Helium 10 (Amazon Seller Tools)"]
  },
  {
    id: "email_marketing_sales_automation_software_tools",
    name: "Email Marketing & Sales Automation Software and Tools",
    originalNameFromImage: "Email Marketing & Sales Automation Software Tutorials",
    description: "Tools for creating email campaigns, managing subscriber lists, automating marketing communications, and streamlining sales processes.",
    examples: ["Mailchimp", "ConvertKit", "ActiveCampaign", "HubSpot Marketing Hub", "Klaviyo", "Brevo (formerly Sendinblue)", "MailerLite", "Constant Contact", "GetResponse", "Moosend", "Salesforce Marketing Cloud / Pardot", "Marketo (Adobe)", "Lemlist", "Woodpecker.co", "Apollo.io"]
  },
  {
    id: "erp_software_tools",
    name: "ERP (Enterprise Resource Planning) Software and Tools",
    originalNameFromImage: "ERP (Enterprise Resource Planning) Software Tutorials",
    description: "Integrated systems for managing core business processes including finance, HR, supply chain, manufacturing, and services.",
    examples: ["SAP S/4HANA", "Oracle NetSuite", "Microsoft Dynamics 365 (Finance & Operations, Business Central)", "Oracle ERP Cloud", "Infor ERP", "Epicor ERP", "Odoo", "Sage Intacct (as an ERP component)", "IFS Applications", "Deltek", "Workday (HR/Finance focus)"]
  },
  {
    id: "general_business_saas_b2b_software_tools",
    name: "General Business SaaS & B2B Software and Tools",
    originalNameFromImage: "General Business SaaS (Software as a Service) & B2B Tools",
    description: "A broad category of cloud-based software catering to various business needs and B2B interactions.",
    examples: ["Slack", "Zoom", "Microsoft Teams", "Google Workspace", "DocuSign", "Dropbox Business", "Box", "SurveyMonkey", "Typeform", "Calendly", "Intercom", "Zendesk (Customer Service)", "Salesforce (various clouds)", "HubSpot (various hubs)", "Hootsuite / Sprout Social (Social Media Management)", "Canva for Teams", "Figma / Miro (Collaboration)"]
  },
  {
    id: "personal_finance_software_strategies_tools",
    name: "Personal Finance Software, Strategies, and Tools",
    originalNameFromImage: "High-Value Personal Finance Software & Strategies",
    description: "Applications and platforms for budgeting, expense tracking, investment management, tax preparation, and financial planning for individuals.",
    examples: ["YNAB (You Need A Budget)", "Mint (by Intuit)", "Personal Capital (Empower)", "Quicken", "TurboTax", "H&R Block Software", "Credit Karma", "Rocket Money (formerly Truebill)", "Simplifi by Quicken", "PocketGuard", "Wealthfront", "Betterment", "Acorns", "Stash", "EveryDollar (Ramsey Solutions)"]
  },
  {
    id: "legal_tech_business_compliance_software_tools",
    name: "Legal Tech & Business Compliance Software and Tools",
    originalNameFromImage: "Legal Tech & Business Compliance Software",
    description: "Technology and software for legal practice management, legal research, e-discovery, contract management, and regulatory compliance.",
    examples: ["Clio", "LexisNexis", "Westlaw", "DocuSign (for legal agreements)", "ContractSafe / Ironclad (Contract Lifecycle Management)", "OneTrust (Privacy & Compliance)", "Relativity (eDiscovery)", "Everlaw (eDiscovery)", "MyCase", "PracticePanther", "CaseFox", "Logikcull"]
  },
  {
    id: "online_mobile_banking_apps_tools",
    name: "Online & Mobile Banking Apps and Tools",
    originalNameFromImage: "Online & Mobile Banking App Tutorials",
    description: "Digital platforms and applications provided by financial institutions for managing bank accounts, making payments, and other banking services.",
    examples: ["Chase Mobile App", "Bank of America Mobile App", "Wells Fargo Mobile App", "Capital One Mobile App", "Ally Bank App", "Chime", "Revolut", "Monzo", "N26", "Wise (formerly TransferWise)", "Zelle", "Venmo (P2P Payments)", "PayPal Mobile App (P2P & Business)", "Cash App (P2P & Investing)", "Current"]
  },
  {
    id: "paid_social_media_advertising_analytics_software_tools",
    name: "Paid Social Media Advertising & Analytics Software and Tools",
    originalNameFromImage: "Paid Social Media Advertising & Analytics Tutorials",
    description: "Platforms for creating, managing, and analyzing paid advertising campaigns on social media networks, along with associated analytics tools.",
    examples: ["Meta Ads Manager (Facebook & Instagram Ads)", "Google Ads (for YouTube Ads)", "LinkedIn Ads", "TikTok Ads Manager", "X Ads (Twitter Ads)", "Pinterest Ads Manager", "Snapchat Ads Manager", "Google Analytics 4 (for tracking campaign performance)", "Sprout Social (Ads Management features)", "Hootsuite Ads", "AdEspresso", "Buffer (Ads features)", "Supermetrics / Funnel.io (Data Aggregation)"]
  },
  {
    id: "payment_processing_business_pos_systems_tools",
    name: "Payment Processing & Business POS Systems and Tools",
    originalNameFromImage: "Payment Processing & Business POS System Tutorials",
    description: "Systems and gateways for accepting various forms of payment, managing sales transactions, and point-of-sale operations.",
    examples: ["Stripe", "PayPal (Business / Zettle)", "Square (POS & Payments)", "Shopify Payments / Shopify POS", "Clover POS", "Toast POS (Restaurant focus)", "Lightspeed POS", "Adyen", "Braintree (A PayPal Service)", "Authorize.net", "2Checkout (Verifone)", "Worldpay from FIS", "NCR Aloha POS"]
  },
  {
    id: "personal_investing_brokerage_platforms_tools",
    name: "Personal Investing & Brokerage Platforms and Tools",
    originalNameFromImage: "Personal Investing & Brokerage Platform Tutorials",
    description: "Online platforms that enable individuals to buy, sell, and manage investments such as stocks, bonds, ETFs, and mutual funds.",
    examples: ["Robinhood", "Fidelity", "Charles Schwab", "Vanguard", "TD Ameritrade (Thinkorswim)", "E*TRADE (from Morgan Stanley)", "Interactive Brokers (IBKR Lite/Pro)", "Webull", "M1 Finance", "Public.com", "SoFi Invest", "Betterment (Robo-advisor & Investing)", "Wealthfront (Robo-advisor & Investing)", "StockCharts.com", "TradingView (Charting & Social)"]
  },
  {
    id: "seo_advanced_content_marketing_software_tools",
    name: "SEO & Advanced Content Marketing Software and Tools",
    originalNameFromImage: "SEO & Advanced Content Marketing Tools Tutorials",
    description: "Software for keyword research, site audits, rank tracking, content optimization, link building, and overall content strategy enhancement.",
    examples: ["Ahrefs", "Semrush", "Moz Pro", "Google Search Console", "Google Analytics 4", "Screaming Frog SEO Spider", "Surfer SEO", "Clearscope", "MarketMuse", "Frase.io", "Yoast SEO (WordPress)", "Rank Math (WordPress)", "AnswerThePublic", "AlsoAsked", "BuzzSumo", "Grammarly (Content Quality)", "Jasper / Copy.ai / Writesonic (AI Writing Assistants)", "Ubersuggest"]
  },
  {
    id: "small_business_funding_capital_acquisition_platforms_tools",
    name: "Small Business Funding & Capital Acquisition Platforms and Tools",
    originalNameFromImage: "Small Business Funding & Capital Acquisition",
    description: "Platforms and services that help small businesses secure funding through loans, lines of credit, grants, or equity investment.",
    examples: ["Lendio (Loan Marketplace)", "Fundbox (Line of Credit/Invoice Financing)", "BlueVine (Line of Credit/Checking)", "OnDeck (Term Loans/Line of Credit)", "Kabbage (Now Amex Business Blueprint Line of Credit)", "SBA Loans (via various lenders)", "Kickstarter (Crowdfunding)", "Indiegogo (Crowdfunding)", "GoFundMe (for certain business causes)", "AngelList (Startup Funding)", "SeedInvest (Equity Crowdfunding)", "Nav (Business Credit & Financing Options)"]
  },
  {
    id: "web_hosting_enterprise_web_development_software_tools",
    name: "Web Hosting & Enterprise Web Development Software and Tools",
    originalNameFromImage: "Web Hosting & Enterprise Web Development Tutorials",
    description: "Services for hosting websites and applications, alongside tools and frameworks used for large-scale web development projects.",
    examples: ["Bluehost", "SiteGround", "Hostinger", "WP Engine (Managed WordPress)", "Kinsta (Managed WordPress)", "Cloudways (Managed Cloud Hosting)", "AWS Amplify / Lightsail / EC2+S3", "Google Cloud Hosting / Firebase Hosting", "Azure App Service", "Vercel (Frontend Cloud)", "Netlify (Frontend Cloud)", "DigitalOcean (Droplets/App Platform)", "WordPress.org (Self-hosted)", "Drupal", "Joomla", "Contentful (Headless CMS)", "Sanity.io (Headless CMS)", "Strapi (Headless CMS)", "Pantheon (WebOps)"]
  }
];
