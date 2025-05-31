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
// Expanded examples for each niche.
export const USER_DEFINED_NICHES: NicheDefinition[] = [
  {
    id: "accounting_bookkeeping_software_tools",
    name: "Accounting & Bookkeeping Software and Tools",
    originalNameFromImage: "Accounting & Bookkeeping Software Tutorials",
    description: "Software and tools for managing financial records, invoicing, payroll, and tax preparation for businesses and individuals.",
    examples: ["QuickBooks Online", "QuickBooks Desktop", "Xero", "FreshBooks", "Wave Accounting", "Zoho Books", "Sage Intacct", "NetSuite (Finance Modules)", "MYOB", "Oracle Financials Cloud", "SAP S/4HANA Finance", "FreeAgent", "KashFlow", "GnuCash", "Manager.io", "Patriot Software", "OneUp Accounting", "Bench (Bookkeeping Service + Software)", "Pilot (Bookkeeping Service + Software)", "Botkeeper"]
  },
  {
    id: "ai_machine_learning_software_tools",
    name: "Artificial Intelligence & Machine Learning Software and Tools",
    originalNameFromImage: "AI Tools for Business & Workflow Automation", // User specified this rename
    description: "Platforms, libraries, frameworks, and applications for developing, deploying, and utilizing AI and machine learning models, including AI agents.",
    examples: [
        "ChatGPT (OpenAI)", "Gemini API (Google)", "Claude AI (Anthropic)", "Perplexity AI", "Poe (by Quora)",
        "DALL-E 3 / ChatGPT Vision", "Midjourney", "Stable Diffusion", "Leonardo.ai", "Magnific AI",
        "Hugging Face Transformers", "Hugging Face Spaces", "TensorFlow", "PyTorch", "Scikit-learn", "Keras", "OpenCV",
        "LangChain", "LlamaIndex", "AutoGPT", "BabyAGI", "CrewAI", "DeepSeek", "Manus AI (AI Agent Tool)", 
        "Google Vertex AI Platform", "AWS SageMaker", "Azure Machine Learning", "Databricks",
        "RunwayML", "Colab / Jupyter Notebooks", "Kaggle Kernels",
        "RapidMiner", "DataRobot", "H2O.ai", "KNIME", "Alteryx",
        "ElevenLabs (Voice AI)", "Synthesia (Video AI)", "Descript (AI Editing)", "Notion AI", "GitHub Copilot", "Tabnine"
    ]
  },
  {
    id: "business_productivity_project_management_software_tools",
    name: "Business Productivity & Project Management Software and Tools",
    originalNameFromImage: "Business Productivity & Project Management Software Tutorials",
    description: "Applications and suites for task management, team collaboration, project planning, and enhancing overall business efficiency.",
    examples: ["Asana", "Monday.com", "ClickUp", "Trello", "Jira (Atlassian)", "Notion", "Slack", "Microsoft Teams", "Google Workspace (Docs, Sheets, Slides, Meet, Calendar)", "Microsoft 365 (Word, Excel, PowerPoint, Planner, Outlook)", "Smartsheet", "Wrike", "Basecamp", "Airtable", "Todoist", "Evernote", "Confluence (Atlassian)", "Zoom", "Webex", "Miro", "Figma (for collaborative design)", "Zapier (for workflow automation)", "Make (formerly Integromat, for workflow automation)"]
  },
  {
    id: "cloud_computing_infrastructure_management_software_tools",
    name: "Cloud Computing & Infrastructure Management Software and Tools",
    originalNameFromImage: "Cloud Computing & Infrastructure Management",
    description: "Platforms, services, and tools for managing cloud-based resources, infrastructure as code, containerization, and CI/CD pipelines.",
    examples: [
        "Amazon Web Services (AWS - EC2, S3, Lambda, RDS, VPC, CloudFormation, IAM, EKS, ECS, etc.)", 
        "Microsoft Azure (VMs, Blob Storage, Functions, Azure DevOps, Azure Kubernetes Service (AKS), etc.)", 
        "Google Cloud Platform (GCP - Compute Engine, Cloud Storage, Cloud Functions, Kubernetes Engine (GKE), BigQuery, etc.)", 
        "Docker", "Kubernetes (K8s)", "Podman",
        "Terraform", "Pulumi", "Ansible", "Chef", "Puppet", 
        "Jenkins", "GitLab CI/CD", "GitHub Actions", "CircleCI", "Argo CD",
        "OpenShift", "Rancher", "VMware vSphere / Tanzu", 
        "DigitalOcean", "Linode", "Vultr",
        "Vercel", "Netlify", "Heroku", "Fly.io",
        "Cloudflare (Workers, R2, Pages, CDN)", "Fastly", "Akamai"
    ]
  },
  {
    id: "crm_software_tools",
    name: "CRM (Customer Relationship Management) Software and Tools",
    originalNameFromImage: "CRM (Customer Relationship Management) Software Tutorials",
    description: "Software solutions for managing customer interactions, sales pipelines, marketing campaigns, and customer service.",
    examples: ["Salesforce Sales Cloud", "HubSpot CRM", "Zoho CRM", "Pipedrive", "ActiveCampaign (CRM)", "Microsoft Dynamics 365 Sales", "Monday.com Sales CRM", "Oracle Siebel CRM", "SAP Sales Cloud", "NetSuite CRM", "Zendesk Sell", "Insightly", "Copper (formerly ProsperWorks)", "Agile CRM", "Capsule CRM", "Freshsales (Freshworks)", "Keap (formerly Infusionsoft)", "Salesloft", "Outreach.io", "Gong.io", "Chorus.ai"]
  },
  {
    id: "crypto_trading_defi_web3_software_tools",
    name: "Crypto Trading, DeFi, & Web3 Software and Tools",
    originalNameFromImage: "Crypto Trading, DeFi, & Web3 Tool Tutorials",
    description: "Platforms, wallets, and tools for trading cryptocurrencies, interacting with decentralized finance protocols, and engaging with Web3 applications.",
    examples: [
        "Binance", "Coinbase (Exchange & Wallet)", "Kraken", "Bybit", "OKX", "KuCoin",
        "MetaMask", "Ledger Nano (Hardware Wallet)", "Trezor (Hardware Wallet)", "Trust Wallet", "Exodus Wallet", "Phantom Wallet (Solana)", "Rabby Wallet",
        "Uniswap (DEX)", "PancakeSwap (DEX)", "SushiSwap (DEX)", "Curve Finance", "Balancer",
        "Aave", "Compound", "MakerDAO", "Lido", "Rocket Pool",
        "OpenSea (NFT Marketplace)", "Blur (NFT Marketplace)", "Magic Eden (NFT Marketplace)", "LooksRare",
        "TradingView (for crypto charts)", "CoinMarketCap", "CoinGecko", "DeFi Llama", "Dune Analytics",
        "Etherscan", "PolygonScan", "Solscan", "BscScan",
        "Alchemy", "Infura", "Moralis", "Tenderly", "Hardhat", "Truffle Suite", "Foundry"
    ]
  },
  {
    id: "cybersecurity_data_protection_software_tools",
    name: "Cybersecurity & Data Protection Software and Tools",
    originalNameFromImage: "Cybersecurity & Data Protection for Business",
    description: "Software and practices for network security, endpoint protection, data privacy, threat detection, and incident response.",
    examples: [
        "CrowdStrike Falcon", "SentinelOne Singularity", "Microsoft Defender for Endpoint", "Palo Alto Networks Next-Generation Firewalls (NGFW)", "Fortinet FortiGate", "Cisco Secure Firewall",
        "Splunk (for SIEM)", "IBM QRadar", "LogRhythm", "Elastic SIEM (ELK Stack)", "Graylog",
        "Wireshark", "Nmap", "Metasploit Framework", "Kali Linux", "Burp Suite", "OWASP ZAP",
        "LastPass (for Business)", "1Password (for Teams)", "Bitwarden", "Keeper Security", "HashiCorp Vault",
        "NordVPN/NordLayer", "ProtonVPN for Business", "OpenVPN", "WireGuard", "Tailscale",
        "Various EDR/XDR Solutions", "SOAR Platforms (e.g., Splunk SOAR, Cortex XSOAR)",
        "Bitdefender GravityZone", "Malwarebytes for Business", "Sophos Intercept X",
        "Proofpoint (Email Security)", "Mimecast (Email Security)", "Okta (IAM)", "Azure Active Directory (IAM)", "Duo Security (MFA)"
    ]
  },
  {
    id: "ecommerce_platform_business_automation_software_tools",
    name: "E-commerce Platform & Business Automation Software and Tools",
    originalNameFromImage: "E-commerce Platform & Business Automation Tutorials",
    description: "Platforms for building online stores, managing inventory and sales, and tools for automating e-commerce workflows.",
    examples: [
        "Shopify", "WooCommerce (WordPress)", "BigCommerce", "Magento (Adobe Commerce)", "Squarespace Commerce", "Wix eCommerce", "Ecwid",
        "Etsy Seller Tools", "Amazon Seller Central (FBA/FBM)", "eBay Seller Hub", "Walmart Marketplace",
        "Zapier (for automation)", "Make (formerly Integromat, for automation)", "Shopify Flow", "n8n.io",
        "ShipStation", "Shippo", "Easyship", 
        "Printful / Printify (Print-on-Demand integration)", "Gelato",
        "Jungle Scout / Helium 10 (Amazon Seller Tools)", "SellerApp",
        "Klaviyo (E-commerce Email Marketing)", "Omnisend", "LoyaltyLion", "Gorgias (Customer Service for E-commerce)", "ReCharge (Subscriptions)"
    ]
  },
  {
    id: "email_marketing_sales_automation_software_tools",
    name: "Email Marketing & Sales Automation Software and Tools",
    originalNameFromImage: "Email Marketing & Sales Automation Software Tutorials",
    description: "Tools for creating email campaigns, managing subscriber lists, automating marketing communications, and streamlining sales processes.",
    examples: ["Mailchimp", "ConvertKit", "ActiveCampaign", "HubSpot Marketing Hub", "Klaviyo", "Brevo (formerly Sendinblue)", "MailerLite", "Constant Contact", "GetResponse", "Moosend", "Drip", "Salesforce Marketing Cloud / Pardot", "Marketo (Adobe)", "Customer.io", "Lemlist", "Woodpecker.co", "Reply.io", "Apollo.io", "Salesloft", "Outreach.io", "Mailshake"]
  },
  {
    id: "erp_software_tools",
    name: "ERP (Enterprise Resource Planning) Software and Tools",
    originalNameFromImage: "ERP (Enterprise Resource Planning) Software Tutorials",
    description: "Integrated systems for managing core business processes including finance, HR, supply chain, manufacturing, and services.",
    examples: ["SAP S/4HANA", "Oracle NetSuite", "Microsoft Dynamics 365 (Finance, Supply Chain Management, Business Central)", "Oracle ERP Cloud", "Infor CloudSuite", "Epicor ERP", "Odoo", "Sage Intacct (as an ERP component)", "IFS Applications", "Deltek", "Workday (HR/Finance focus)", "Plex Systems (Manufacturing ERP)", "Acumatica Cloud ERP", "SYSPRO", "QAD Adaptive ERP"]
  },
  {
    id: "general_business_saas_b2b_software_tools",
    name: "General Business SaaS & B2B Software and Tools",
    originalNameFromImage: "General Business SaaS (Software as a Service) & B2B Tools",
    description: "A broad category of cloud-based software catering to various business needs and B2B interactions.",
    examples: ["Slack", "Zoom", "Microsoft Teams", "Google Workspace", "DocuSign", "Dropbox Business", "Box", "SurveyMonkey", "Typeform", "Jotform", "Calendly", "Chili Piper", "Intercom", "Drift", "Zendesk (Customer Service)", "Salesforce (various clouds)", "HubSpot (various hubs)", "Hootsuite / Sprout Social (Social Media Management)", "Buffer / Later (Social Media Scheduling)", "Canva for Teams", "Figma / Miro (Collaboration)", "Airtable", "Notion", "Asana", "ClickUp"]
  },
  {
    id: "personal_finance_software_strategies_tools",
    name: "Personal Finance Software, Strategies, and Tools",
    originalNameFromImage: "High-Value Personal Finance Software & Strategies",
    description: "Applications and platforms for budgeting, expense tracking, investment management, tax preparation, and financial planning for individuals.",
    examples: [
        "YNAB (You Need A Budget)", "Mint (by Intuit - Note: sunsetting, but tutorials may still exist)", "Monarch Money", "Personal Capital (Empower)", "Quicken (Simplifi by Quicken)", "Copilot Money", "Tiller Money (Google Sheets/Excel based)",
        "TurboTax", "H&R Block Software", "FreeTaxUSA", "Cash App Taxes (formerly Credit Karma Tax)",
        "Credit Karma", "Experian Boost", "Credit Sesame",
        "Rocket Money (formerly Truebill)", "PocketGuard", 
        "Wealthfront", "Betterment", "Acorns", "Stash", "Robinhood (for budgeting features if any)",
        "EveryDollar (Ramsey Solutions)", "Goodbudget", "Undebt.it", "Lunch Money"
    ]
  },
  {
    id: "legal_tech_business_compliance_software_tools",
    name: "Legal Tech & Business Compliance Software and Tools",
    originalNameFromImage: "Legal Tech & Business Compliance Software",
    description: "Technology and software for legal practice management, legal research, e-discovery, contract management, and regulatory compliance.",
    examples: ["Clio", "LexisNexis", "Westlaw", "Bloomberg Law", "DocuSign (for legal agreements)", "PandaDoc", "ContractSafe / Ironclad (Contract Lifecycle Management)", "LinkSquares", "OneTrust (Privacy & Compliance)", "TrustArc", "Relativity (eDiscovery)", "Everlaw (eDiscovery)", "Logikcull", "MyCase", "PracticePanther", "CaseFox", "Filevine", "Smokeball", "NetDocuments", "iManage", "Kira Systems (AI Contract Analysis)"]
  },
  {
    id: "online_mobile_banking_apps_tools",
    name: "Online & Mobile Banking Apps and Tools",
    originalNameFromImage: "Online & Mobile Banking App Tutorials",
    description: "Digital platforms and applications provided by financial institutions for managing bank accounts, making payments, and other banking services.",
    examples: [
        "Chase Mobile App", "Bank of America Mobile App", "Wells Fargo Mobile App", "Citibank Mobile App", "Capital One Mobile App", "U.S. Bank Mobile App", "PNC Mobile Banking",
        "Ally Bank App", "Discover Mobile", "Charles Schwab Bank Mobile App", "Fidelity Bloom (Spending/Saving App)",
        "Chime", "Varo Bank", "SoFi Money / Banking App", "Current", 
        "Revolut", "Monzo", "N26", "Starling Bank",
        "Wise (formerly TransferWise)", "Zelle", "Venmo (P2P Payments)", "PayPal Mobile App (P2P & Business)", "Cash App (P2P & Investing)"
    ]
  },
  {
    id: "paid_social_media_advertising_analytics_software_tools",
    name: "Paid Social Media Advertising & Analytics Software and Tools",
    originalNameFromImage: "Paid Social Media Advertising & Analytics Tutorials",
    description: "Platforms for creating, managing, and analyzing paid advertising campaigns on social media networks, along with associated analytics tools.",
    examples: [
        "Meta Ads Manager (Facebook & Instagram Ads)", "Google Ads (for YouTube Ads & Display)", "LinkedIn Ads", "TikTok Ads Manager", "X Ads (Twitter Ads)", "Pinterest Ads Manager", "Snapchat Ads Manager", "Reddit Ads",
        "Google Analytics 4 (for tracking campaign performance)", "Adobe Analytics",
        "Sprout Social (Ads Management features)", "Hootsuite Ads", "Buffer (Ads features)", "Agorapulse",
        "AdEspresso", "Smartly.io", "WordStream", "Revealbot",
        "Supermetrics / Funnel.io (Data Aggregation)", "Triple Whale (E-commerce Analytics)", "Hyros (Ad Tracking)", "Hotjar (Website Behavior Analytics)"
    ]
  },
  {
    id: "payment_processing_business_pos_systems_tools",
    name: "Payment Processing & Business POS Systems and Tools",
    originalNameFromImage: "Payment Processing & Business POS System Tutorials",
    description: "Systems and gateways for accepting various forms of payment, managing sales transactions, and point-of-sale operations.",
    examples: [
        "Stripe", "PayPal (Business / Zettle)", "Square (POS & Payments)", "Shopify Payments / Shopify POS", 
        "Clover POS", "Toast POS (Restaurant focus)", "Lightspeed POS (Retail, Restaurant, Golf)", "Revel Systems (iPad POS)",
        "Adyen", "Braintree (A PayPal Service)", "Authorize.net (CyberSource)", "2Checkout (Verifone)", "Worldpay from FIS",
        "NCR Aloha POS / NCR Silver", "Oracle MICROS Simphony (Restaurant)", "TouchBistro (Restaurant)", 
        "Helcim", "PaymentCloud", "Fattmerchant (Stax)"
    ]
  },
  {
    id: "personal_investing_brokerage_platforms_tools",
    name: "Personal Investing & Brokerage Platforms and Tools",
    originalNameFromImage: "Personal Investing & Brokerage Platform Tutorials",
    description: "Online platforms that enable individuals to buy, sell, and manage investments such as stocks, bonds, ETFs, and mutual funds.",
    examples: [
        "Robinhood", "Fidelity", "Charles Schwab (Brokerage Platform/App)", "Thinkorswim (by Charles Schwab)", "Vanguard", "E*TRADE (from Morgan Stanley)", 
        "Interactive Brokers (IBKR Lite/Pro)", "Webull", "M1 Finance", "Public.com", "SoFi Invest", 
        "Betterment (Robo-advisor & Investing)", "Wealthfront (Robo-advisor & Investing)", "Empower Personal Dashboard (formerly Personal Capital Investing Tools)",
        "StockCharts.com", "TradingView (Charting & Social)", "Seeking Alpha", "Morningstar", "FINVIZ",
        "Coinbase (for crypto investing)", "Binance.US (for crypto investing)", "Kraken (for crypto investing)"
    ]
  },
  {
    id: "seo_advanced_content_marketing_software_tools",
    name: "SEO & Advanced Content Marketing Software and Tools",
    originalNameFromImage: "SEO & Advanced Content Marketing Tools Tutorials",
    description: "Software for keyword research, site audits, rank tracking, content optimization, link building, and overall content strategy enhancement.",
    examples: [
        "Ahrefs", "Semrush", "Moz Pro", "Ubersuggest", "Mangools (KWFinder, SERPChecker, etc.)",
        "Google Search Console", "Google Analytics 4", "Google Keyword Planner", "Google Trends",
        "Screaming Frog SEO Spider", "Sitebulb", "Majestic SEO", 
        "Surfer SEO", "Clearscope", "MarketMuse", "Frase.io", "NeuronWriter", "Contentful (Headless CMS for content strategy)",
        "Yoast SEO (WordPress)", "Rank Math (WordPress)", "All in One SEO Pack (WordPress)",
        "AnswerThePublic", "AlsoAsked", "KeywordTool.io", 
        "BuzzSumo", "HARO (Help A Reporter Out for PR/links)", "Hunter.io / Snov.io (Email outreach for link building)",
        "Grammarly (Content Quality)", "Jasper / Copy.ai / Writesonic / Rytr (AI Writing Assistants)", "Copyscape (Plagiarism Checker)"
    ]
  },
  {
    id: "small_business_funding_capital_acquisition_platforms_tools",
    name: "Small Business Funding & Capital Acquisition Platforms and Tools",
    originalNameFromImage: "Small Business Funding & Capital Acquisition",
    description: "Platforms and services that help small businesses secure funding through loans, lines of credit, grants, or equity investment.",
    examples: [
        "Lendio (Loan Marketplace)", "Fundbox (Line of Credit/Invoice Financing)", "BlueVine (Line of Credit/Checking)", "OnDeck (Term Loans/Line of Credit)", "Kabbage (Now Amex Business Blueprint Line of Credit)", 
        "SBA Loans (via various lenders like Live Oak Bank, Celtic Bank)", "Accion Opportunity Fund (Nonprofit Lender)", "Kiva (Microloans)",
        "Kickstarter (Crowdfunding)", "Indiegogo (Crowdfunding)", "GoFundMe (for certain business causes)", 
        "AngelList (Startup Funding)", "SeedInvest (Equity Crowdfunding)", "Republic (Equity Crowdfunding)", "Wefunder",
        "Nav (Business Credit & Financing Options)", "Fundera (by NerdWallet)", "Brex (Corporate Cards & Financing)", "Ramp (Corporate Cards & Financing)", "Clearco (Revenue-Based Financing)"
    ]
  },
  {
    id: "web_hosting_enterprise_web_development_software_tools",
    name: "Web Hosting & Enterprise Web Development Software and Tools",
    originalNameFromImage: "Web Hosting & Enterprise Web Development Tutorials",
    description: "Services for hosting websites and applications, alongside tools and frameworks used for large-scale web development projects.",
    examples: [
        "Bluehost", "SiteGround", "Hostinger", "HostGator", "GoDaddy Hosting", "DreamHost",
        "WP Engine (Managed WordPress)", "Kinsta (Managed WordPress)", "Flywheel (Managed WordPress)",
        "Cloudways (Managed Cloud Hosting)", "A2 Hosting",
        "AWS (EC2, S3, Lightsail, Amplify)", "Google Cloud Platform (Compute Engine, App Engine, Firebase Hosting)", "Microsoft Azure (App Service, VMs)", 
        "Vercel (Frontend Cloud)", "Netlify (Frontend Cloud)", "Render.com", "Platform.sh",
        "DigitalOcean (Droplets/App Platform)", "Linode (Akamai)", "Vultr",
        "WordPress.org (Self-hosted)", "Drupal", "Joomla", 
        "Contentful (Headless CMS)", "Sanity.io (Headless CMS)", "Strapi (Headless CMS)", "Storyblok (Headless CMS)",
        "Pantheon (WebOps)", "Acquia (Drupal Cloud)", "GitHub Pages", "GitLab Pages"
    ]
  }
];