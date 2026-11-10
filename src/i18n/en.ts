// src/i18n/en.ts
import type { SiteDictionary } from "./types";

export const en: SiteDictionary = {
  meta: {
    title: "RUNLY ERP - Business in motion | Modular, multi-company software",
    description:
      "RUNLY is Racoon Devs modular, multi-company, collaborative ERP. Pick the modules you need, connect your team, and grow your business.",
  },
  nav: {
    platform: "Platform",
    product: "Product",
    modules: "Modules",
    rm3: "RM3 Architecture",
    mirai: "MirAI",
    marketplace: "Marketplace",
    docs: "Documentation",
    docsHome: "Documentation home",
    docsGuides: "Step-by-step guides",
    docsModules: "Modules",
    docsDevelopers: "Developers",
    docsApi: "Module API",
    descriptions: {
      modules: "Pick only the modules your business needs.",
      rm3: "How the platform is built and scales.",
      mirai: "Artificial intelligence built into your operation.",
      marketplace: "Templates and automations ready to use in Runly (in Spanish).",
      docsHome: "Everything you need to get started with RUNLY.",
      docsGuides: "Tutorials for everyday tasks.",
      docsModules: "Functional reference for every module.",
      docsDevelopers: "Workflows, integration and best practices.",
      docsApi: "Module endpoints and contracts.",
    },
    implementation: "Implementation",
    contact: "Contact",
    requestDemo: "Request a demo",
    back: "Back",
  },
  footer: {
    tagline:
      "RUNLY - Business in motion. The modular, multi-company, collaborative operating system for businesses that move fast.",
    platformHeading: "Platform",
    ecosystemHeading: "Ecosystem",
    legalHeading: "Legal & Company",
    uptime: "Implementation and support tailored to your project",
    copyright: "RUNLY ERP - runly.mx. All rights reserved.",
    builtBy: "Built with passion by",
    links: {
      modulesCatalog: "Module Catalog",
      rm3Architecture: "RM3 Architecture",
      mirai: "MirAI (Artificial Intelligence)",
      marketplace: "Resource Marketplace",
      customImplementation: "Custom Implementation",
      officialModules: "Official Modules",
      customDevelopment: "Developing with code",
      docsHome: "Documentation",
      guides: "Step-by-step guides",
      apiDocs: "API Documentation",
      privacyNotice: "Privacy Notice",
      termsOfService: "Terms of Service",
      dataSecurity: "Data Security",
      supportContact: "Support Contact",
    },
  },
  hero: {
    imageAlt: "RUNLY ERP main interface",
    badge: "Your business. Your way of working.",
    titleLine1: "Your business in motion.",
    titleLine2: "Everything connected with RUNLY.",
    subtitle:
      "Manage your operations from a single platform. Choose the modules you need, connect your team, and grow your business with an ERP that adapts to you.",
    ctaPrimary: "Discover RUNLY",
    ctaSecondary: "Request a demo",
    badgeModular: "Modular",
    badgeMultiCompany: "Multi-company",
    badgeCustomizable: "Customizable",
    windowUrl: "app.runly.mx/dashboard",
    floatingMultiBranchTitle: "Connected multi-branch",
    floatingMultiBranchSubtitle: "2 companies synced",
    floatingMiraiTitle: "MirAI assistant ready",
    floatingMiraiSubtitle: "100% contextual active",
    tourTabs: [
      { label: "Home", alt: "RUNLY ERP home screen with installed modules" },
      { label: "Calendar", alt: "RUNLY ERP calendar in month view" },
      { label: "Company", alt: "Company profile overview in RUNLY ERP" },
    ],
  },
  about: {
    eyebrow: "About RUNLY",
    title: "What is RUNLY?",
    paragraphs: [
      "RUNLY is a modular business management platform (ERP), built by Racoon Devs, that lets companies manage their operations, projects, finances, inventory, employees, and internal communication from one place.",
      "The platform brings together collaboration tools, messaging, meetings, and calendar management to help teams organize their work.",
    ],
  },
  flexibility: {
    eyebrow: "Flexibility without strings attached",
    title: "Do not change how you work to fit a piece of software.",
    description:
      "RUNLY adapts to your processes, your team, and your needs. Start with the tools you need and expand your platform as your company grows.",
    cards: [
      {
        icon: "PuzzlePiece",
        color: "orange",
        title: "Modular by nature",
        description:
          "Install and use only what you need. Turn modules on or off with one click without affecting system stability.",
      },
      {
        icon: "Zap",
        color: "blue",
        title: "Everything connected",
        description:
          "Information synced in real time. A contact created in chat is instantly reflected in quotes and projects.",
      },
      {
        icon: "Building2",
        color: "purple",
        title: "A space for every company",
        description:
          "Multi-company with strict isolation and defined roles. Switch between legal entities without logging out.",
      },
      {
        icon: "TrendingUp",
        color: "emerald",
        title: "Grow at your own pace",
        description:
          "Frictionless scalability. Go from 3 to 300 employees without disproportionate costs or painful migrations.",
      },
    ],
  },
  modulesCatalog: {
    eyebrow: "RUNLY Core Catalog",
    title: "A complete ecosystem to run your business.",
    description:
      "From your team collaboration to organizing your resources and operations, RUNLY brings different tools together in one place.",
    viewAllCta: "View all 27 modules",
    roadmapTitle: "And this is just the beginning. RUNLY keeps evolving.",
    roadmapDescription:
      "Our team at Racoon Devs ships new modules and improvements every month. All clients with active support get immediate access to updates.",
    comingSoonLabel: "Coming soon",
  },
  modulesPage: {
    metaTitle: "Module catalog — RUNLY ERP",
    metaDescription: "Explore RUNLY ERP's 27 modules: identity, contacts, finance, inventory, point of sale, and more.",
    eyebrow: "Full catalog",
    title: "Every RUNLY module, in one place.",
    description: "Filter by category and click (or hover) any card to see what each module solves.",
    backToHome: "Back to home",
  },
  architecturePage: {
    metaTitle: "RM3 Architecture — RUNLY ERP",
    metaDescription: "How RUNLY's RM3 modular engine works: core, official modules, custom development, and community modules.",
    backToHome: "Back to home",
  },
  miraiPage: {
    metaTitle: "MirAI — RUNLY ERP's AI assistant",
    metaDescription: "MirAI, the AI assistant built into RUNLY ERP: what it can do and how it helps you day to day.",
    backToHome: "Back to home",
  },
  rm3: {
    badge: "Cutting-edge architecture",
    title: "One platform. Infinite ways to adapt.",
    description:
      "RUNLY is built on the RM3 modular engine, designed to decouple processes, enable stable microservices, and guarantee updates with zero operational downtime.",
    coreTitle: "RUNLY CORE",
    coreSubtitle: "RM3 Modular Engine",
    coreDescription: "Event orchestrator, federated authentication, RBAC access control, and global synchronization.",
    leftNodes: [
      { icon: "Boxes", label: "Core Inventory", tag: "Micro-app" },
      { icon: "MessageCircle", label: "Real-time Chat", tag: "Websockets" },
      { icon: "BuildingComplex", label: "Multi-Tenant Hub", tag: "Isolation" },
    ],
    rightNodes: [
      { icon: "Sparkles", label: "MirAI Engine", tag: "LLM Context" },
      { icon: "GitBranch", label: "Custom Modules", tag: "Tailor-made" },
      { icon: "CloudUpload", label: "External APIs", tag: "Banks / Tax authority" },
    ],
    pillars: [
      {
        icon: "Boxes",
        title: "Independent, integrable modules",
        description:
          "Each module works as a decoupled component. You can update or migrate one specific area without risking a system-wide outage.",
      },
      {
        icon: "Split",
        title: "Dynamic expansion",
        description:
          "Add custom fields, specific reports, and new flows without breaking compatibility with future versions of RUNLY.",
      },
      {
        icon: "ShieldCheck",
        title: "Secure operational flexibility",
        description:
          "Guaranteed optimal performance with fine-grained control over permissions, access traceability, and change auditing.",
      },
    ],
  },
  classification: {
    eyebrow: "Solutions ecosystem",
    title: "Your business is unique. Your software can be too.",
    description:
      "Extend RUNLY with tools built for different needs and put together a platform that truly fits your operation.",
    official: {
      badge: "Racoon-certified",
      title: "Official Modules",
      description:
        "Built, maintained, and supported directly by the Racoon Devs engineering team. Maximum stability, automatic updates, and guaranteed compatibility.",
      bullets: [
        "Updates at no extra cost",
        "Priority support in Spanish",
        "Immediate native integration",
      ],
    },
    custom: {
      tag: "Made to measure",
      badge: "Specific workflows",
      title: "Custom Modules",
      description:
        "Does your industry have a unique business rule or calculation? We design and build custom modules that integrate seamlessly into your RUNLY screens.",
      bullets: [
        "Technical process discovery",
        "Adapts to your legacy software",
        "Exclusive to your organization",
      ],
    },
    community: {
      badge: "Ecosystem in the works",
      title: "Community Modules",
      description:
        "We are laying the groundwork so certified developers and partners can contribute extensions and connectors in the future, under our team security review.",
      bullets: [
        "Open standards and SDK in progress",
        "Security and code review",
        "Not publicly available yet",
      ],
    },
    bannerTitle: "Have an idea for a module that does not exist yet?",
    bannerDescription: "We build the exact tool to remove the friction from your daily operation.",
    bannerCta: "Let us talk about your project",
  },
  mirai: {
    badge: "Practical Artificial Intelligence",
    title: "Meet MirAI.",
    titleHighlight: "Intelligence that works alongside you.",
    description:
      "RUNLY includes AI-powered tools to speed up repetitive tasks, make sense of unstructured information, and help you make better decisions in seconds. MirAI is a single assistant across all of Runly: it has its own conversation in Chat and a side tab on every screen that understands the record you are looking at (an item, an employee, a project) and can propose actions you confirm.",
    capabilities: [
      {
        icon: "MessageCircle",
        color: "purple",
        title: "Built-in conversational assistant",
        description: "Ask about inventory, request meeting summaries, or check project status using natural Spanish or English.",
      },
      {
        icon: "FileText",
        color: "orange",
        title: "Receipt and invoice interpretation",
        description: "Upload photos of receipts or vouchers from your phone; MirAI extracts amount, date, tax ID, and accounting category automatically.",
      },
      {
        icon: "Brain",
        color: "blue",
        title: "Contextual help per module",
        description: "In Projects, MirAI helps you draft acceptance criteria. In CRM, it suggests sales follow-ups.",
      },
      {
        icon: "ShieldCheck",
        color: "emerald",
        title: "Privacy and an extensible foundation",
        description: "Your business data stays strictly confidential and isolated inside your private environment.",
      },
    ],
    demoLabel: "MirAI Assistant",
    demoContext: "Illustrative example, not a live conversation",
    demoDisclaimer: "Sample view of how MirAI responds inside Runly ERP",
    demoScenarios: [
      {
        userMessage: "MirAI, what is the projected payroll balance at month end across both companies?",
        assistantIntro: "Analyzing the ledgers for Racoon Devs and Grupo Aurora:",
        lines: ["Racoon Devs (8 employees): $148,500 MXN", "Grupo Aurora (12 employees): $210,000 MXN"],
        highlightLine: "Estimated total commitment: $358,500 MXN",
        confirmation: "You have enough recorded liquidity given the customer payments scheduled for September 25.",
      },
      {
        userMessage: "MirAI, give me a summary of this week's pending tasks",
        assistantIntro: "Checking your active projects:",
        lines: ["Runly Development: 3 tasks 'In review'", "Q4 Website: 1 overdue task (yesterday)"],
        highlightLine: "5 tasks need your attention this week",
        confirmation: "The overdue task is 'Fix blog SEO' — want me to take you straight to it?",
      },
      {
        userMessage: "MirAI, read the fuel receipt I attached",
        assistantIntro: "Analyzing the receipt photo:",
        lines: ["Merchant: Insurgentes Gas Station", "Amount: $850.00 MXN — Sep 9, 2026"],
        highlightLine: "Suggested category: Transportation",
        confirmation: "Expense logged to your 'Cash' wallet — check it in Personal Finance.",
      },
    ],
    demoPromptsLabel: "Try asking:",
    demoPrompt1: "Summary of this week pending tasks",
    demoPrompt2: "Read the attached fuel receipt",
    teaserCta: "See MirAI in depth",
    previewAlt: "MirAI answering inside a Chat conversation in RUNLY",
  },
  multiCompany: {
    eyebrow: "Native Multi-tenancy",
    title: "One place to connect your whole team.",
    description:
      "Work with your team from a platform that brings together information, communication, and tools for every area of your organization.",
    mockActiveCompany: "Racoon Devs",
    mockActiveInstance: "Active Instance",
    mockAdminUser: "Raul (Admin)",
    mockSwitcherLabel: "Switch legal entity / branch",
    mockCompanyA: "Racoon Devs S.A.S.",
    mockCompanyB: "Grupo Aurora",
    mockChangeLabel: "Switch",
    mockAddCompany: "Create or link a new company",
    mockRoleFinance: "Finance",
    mockRoleFinanceAccess: "Restricted access",
    mockRoleWarehouse: "Warehouse",
    mockRoleWarehouseAccess: "Read/Write",
    mockRoleDirection: "Management",
    mockRoleDirectionAccess: "Global audit",
    pillars: [
      {
        icon: "Users",
        color: "orange",
        title: "Truly connected teams",
        description: "Avoid the sprawl of 5 disconnected apps. In RUNLY, project chats, attached files, and payment statuses live under one roof.",
      },
      {
        icon: "Flag",
        color: "blue",
        title: "Different companies, one platform",
        description: "Running a business group or multiple brands? Manage each company with a fully independent catalog, bank accounts, and inventory.",
      },
      {
        icon: "UserCog",
        color: "emerald",
        title: "Organized access and permissions",
        description: "Granular role-based control. Your sales team only accesses quotes and catalog, while accountants manage ledgers and invoices with full security.",
      },
    ],
  },
  implementation: {
    badge: "Transparency and business honesty",
    title: "We do not sell packages. We build the solution you need.",
    description:
      "Every company has different needs. That is why RUNLY offers custom implementations that fit your operation, your goals, and your budget.",
    steps: [
      { number: "01", title: "Tell us about your company", description: "We analyze your current processes, operational pain points, and the tools your team already uses day to day." },
      { number: "02", title: "We design your solution", description: "We select the exact modules and define the custom adaptations required, with no unnecessary modules." },
      { number: "03", title: "We implement RUNLY", description: "We configure your cloud instance, migrate base catalogs, and train your area leads hands-on." },
      { number: "04", title: "We evolve with you", description: "Ongoing support, direct access to developers, and fast rollout of new modules as your business grows." },
    ],
    valueTitle: "Enterprise software that is accessible, without paying for what you do not need.",
    valueDescription:
      "We want high-end enterprise technology to be within reach for more businesses across Mexico and Latin America. Forget the thousand-dollar-per-user licenses of traditional ERPs.",
    valueCta: "Request a custom proposal",
  },
  whyChoose: {
    eyebrow: "Key Differentiators",
    title: "Enterprise technology that works in your favor.",
    description: "Built from the ground up to eliminate unnecessary complexity and give real agility to fast-growing teams.",
    cards: [
      { icon: "Boxes", color: "orange", title: "Modular and adaptable", description: "Pay for and install only the modules your operation needs today." },
      { icon: "HandCoins", color: "emerald", title: "No inflated costs", description: "Zero overhead for features your team will never open." },
      { icon: "BuildingComplex", color: "blue", title: "Native multi-company", description: "Manage different companies or branches with strict isolation." },
      { icon: "Headset", color: "purple", title: "Direct support from developers", description: "Spanish and English support straight from the creators at Racoon Devs." },
      { icon: "Sparkles", color: "pink", title: "Practical, not decorative AI", description: "MirAI automates receipt reading and real stock lookups." },
      { icon: "CloudUpload", color: "amber", title: "Continuous innovation", description: "New features and optimizations every month at no hidden cost." },
      { icon: "Smartphone", color: "cyan", title: "100% cloud and responsive", description: "Access from your computer, tablet, or smartphone with high fluency." },
      { icon: "ShieldCheck", color: "indigo", title: "Security and backups", description: "Automatic daily backups and data encryption at rest and in transit." },
    ],
  },
  faq: {
    eyebrow: "Common questions",
    title: "Frequently Asked Questions",
    description: "Everything you need to know before implementing RUNLY at your company.",
    items: [
      {
        question: "Does RUNLY work for small businesses or only large organizations?",
        answer: "RUNLY is built with a modular architecture precisely so it adapts to any size. A 3-person company can start with just Chat, Calendar, and Finance, while an established company can run complex multi-warehouse inventory and multiple legal entities.",
      },
      {
        question: "Do I have to purchase every module?",
        answer: "No. RUNLY does not believe in forced bundles. You choose exactly which modules to enable on your instance. If you need an additional module later, you turn it on with one click, no reinstall or migration required.",
      },
      {
        question: "Can I request custom modules or features for my company?",
        answer: "Yes, it is one of our main strengths. Our team at Racoon Devs can build exclusive custom modules on the RM3 architecture that match your exact calculations, approvals, or industry regulations.",
      },
      {
        question: "How does multi-company management work?",
        answer: "You can register multiple entities or brands under one master account. Each company has logically isolated data (inventory, employees, bank accounts), letting admins switch between them with one click.",
      },
      {
        question: "Is my data protected and backed up?",
        answer: "Security configuration, backups and recovery procedures are defined and verified for your implementation. We review these requirements with your team before go-live.",
      },
      {
        question: "How is the cost of RUNLY calculated if there are no published fixed prices?",
        answer: "We quote fairly based on: the exact modules required, the number of concurrent active users, and whether you need custom development. This keeps you from paying for inflated features that add no value to your business.",
      },
      {
        question: "How long does implementation and go-live take?",
        answer: "The timeline is agreed after reviewing the modules, custom development, data migration and training your project requires. We define delivery stages with your team before implementation.",
      },
    ],
  },
  contact: {
    eyebrow: "Start today",
    title: "Let us move your business forward.",
    description: "Tell us what your business needs and see how we can adapt RUNLY to the way you work. No forced commitments.",
    whatsappTitle: "Would you rather talk right away?",
    whatsappDescription: "Fast attention from one of our consultants.",
    whatsappCta: "Contact us on WhatsApp",
    whatsappMessage: "Hi, I would like to request a demo of RUNLY ERP",
    emailLabel: "hola@runly.mx",
    locationLabel: "Mexico. Coverage and deployment across Latin America",
    ndaLabel: "Non-disclosure agreement (NDA) available for companies",
    formTitle: "Request a proposal or demo",
    fields: {
      fullName: "Full name *",
      fullNamePlaceholder: "E.g. Raul Gomez",
      company: "Company name *",
      companyPlaceholder: "E.g. Grupo Aurora",
      email: "Business email *",
      emailPlaceholder: "raul@mycompany.com",
      phone: "Phone or WhatsApp *",
      phonePlaceholder: "+52 55 1234 5678",
      teamSize: "Approximate team size",
      teamSizeOptions: [
        { value: "1_5", label: "1 to 5 people" },
        { value: "6_20", label: "6 to 20 people" },
        { value: "21_50", label: "21 to 50 people" },
        { value: "50_plus", label: "More than 50 people" },
      ],
      interest: "Main interest *",
      interestOptions: [
        { value: "virtual_demo", label: "Request a live demo" },
        { value: "modules_scope", label: "Learn about modules and scope" },
        { value: "enterprise_impl", label: "Enterprise implementation" },
        { value: "custom_module", label: "Custom module development" },
        { value: "tech_questions", label: "Resolve technical questions" },
      ],
      needs: "What processes do you need RUNLY to manage? *",
      needsPlaceholder: "E.g. Multi-warehouse inventory, expense control across two companies, integrated support chat...",
      consent: "I accept the Privacy Notice and agree to be contacted by Racoon Devs.",
    },
    submit: "Send request",
    submitting: "Submitting request...",
    successMessage: "Thanks for your interest! A Racoon Devs consultant will reach out shortly.",
    errorMessage: "We could not send your request. Try again or message us on WhatsApp.",
    privacyNotice: "By submitting this form you accept our Privacy Notice. Your information is never shared.",
  },
  legal: {
    privacy: {
      metaTitle: "Privacy Notice | RUNLY",
      metaDescription:
        "RUNLY's privacy notice under Mexico's LFPDPPP: what data we collect, how we use it, and how to exercise your ARCO rights.",
      eyebrow: "Legal",
      title: "Privacy Notice",
      lastUpdated: "Last updated: September 21, 2026",
      intro:
        "This Privacy Notice describes how Racoon Devs collects, uses, and protects the personal data of visitors to this site, prospects requesting information about RUNLY, and users of the platform, in accordance with Mexico's Federal Law on Protection of Personal Data Held by Private Parties (LFPDPPP).",
      sections: [
        {
          heading: "Identity and address of the data controller",
          paragraphs: [
            "The controller responsible for processing your personal data is [RACOON DEVS' LEGAL BUSINESS NAME], located at [FULL REGISTERED ADDRESS], Mexico, with tax ID (RFC) [RFC].",
          ],
        },
        {
          heading: "Personal data we collect",
          paragraphs: [
            "We collect personal data you provide directly when requesting a demo, contacting us, or using RUNLY, as well as technical data generated by your use of the platform.",
          ],
          list: [
            "Identification and contact data: name, email address, phone number, company, and job title.",
            "Request data: team size, main interest, and needs described in the contact form.",
            "Account data: access credentials and configuration of your RUNLY instance.",
            "Usage data: activity logs generated within the modules you use.",
            "Technical data: IP address, device and browser type, collected automatically.",
            "Communications: the content of messages you send us by email, WhatsApp, or the support chat.",
          ],
        },
        {
          heading: "Purposes of the processing",
          paragraphs: [
            "Primary purposes, necessary for our relationship with you: responding to your request for information or a demo, providing and supporting the RUNLY platform, managing your account, and complying with legal and contractual obligations.",
            "Secondary purposes, not essential: sending you commercial communications about new modules or features. You may object to these secondary purposes at any time by writing to privacy@runly.mx, without affecting the services you already contracted.",
          ],
        },
        {
          heading: "Data transfers",
          paragraphs: [
            "Your personal data may be shared only with the following third parties, and only to the extent necessary to operate the service:",
          ],
          list: [
            "Infrastructure and hosting providers that host the RUNLY platform.",
            "Payment processing providers, where applicable, for billing the service.",
            "Competent authorities, where a valid legal request exists.",
          ],
        },
        {
          heading: "ARCO rights and how to exercise them",
          paragraphs: [
            "You have the right to Access, Rectify, and Cancel your personal data, and to Object to its processing (ARCO rights), as well as to revoke any consent you may have given us. To exercise any of these rights, write to privacy@runly.mx stating your full name and the right you wish to exercise; we will respond within a maximum of 20 business days.",
          ],
        },
        {
          heading: "Use of cookies and tracking technologies",
          paragraphs: [
            "This site uses cookies and similar technologies solely for analytics and basic functionality purposes. We do not use these technologies for targeted advertising or to share data with advertising networks.",
          ],
        },
        {
          heading: "Data retention",
          paragraphs: [
            "We retain your personal data for as long as necessary to fulfill the purposes described in this notice and any applicable legal obligations; once that period ends, we securely delete or anonymize it.",
          ],
        },
        {
          heading: "Changes to this privacy notice",
          paragraphs: [
            "We may update this privacy notice to reflect changes in our practices or applicable regulations. We will publish any changes on this same page along with its update date.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: ["If you have questions about this privacy notice or how we process your data, contact us at privacy@runly.mx."],
        },
      ],
    },
    terms: {
      metaTitle: "Terms of Service | RUNLY",
      metaDescription: "Terms of Service governing use of the RUNLY ERP platform, operated by Racoon Devs.",
      eyebrow: "Legal",
      title: "Terms of Service",
      lastUpdated: "Last updated: September 21, 2026",
      intro:
        "These Terms of Service govern access to and use of RUNLY, the modular ERP platform operated by Racoon Devs. By using RUNLY or requesting a demo, you agree to these terms.",
      sections: [
        {
          heading: "Acceptance of these terms",
          paragraphs: [
            "By creating an account, requesting a demo, or using RUNLY in any way, you agree to be bound by these Terms of Service and our Privacy Notice. If you do not agree, you must not use the platform.",
          ],
        },
        {
          heading: "Description of the service",
          paragraphs: [
            "RUNLY is a modular, multi-company, collaborative ERP platform offered as software as a service (SaaS), made up of official modules and, where applicable, custom development for your company.",
          ],
        },
        {
          heading: "Accounts and subscriptions",
          paragraphs: ["Access to RUNLY is granted through user accounts associated with the company that contracts the service."],
          list: [
            "You are responsible for keeping your access credentials confidential.",
            "You must provide accurate and up-to-date information when creating your account.",
            "The contracting company is responsible for managing the permissions and access of its users.",
            "Specific commercial terms (contracted modules, scope, fees) are agreed separately in the proposal or contract signed with each customer.",
          ],
        },
        {
          heading: "Acceptable use",
          paragraphs: ["When using RUNLY, you agree not to:"],
          list: [
            "Use the platform for unlawful purposes or in a way that violates third-party rights.",
            "Attempt to breach the platform's security or access other companies' data without authorization.",
            "Reverse-engineer the software, except where permitted by law.",
            "Deliberately overload the service's infrastructure.",
            "Resell or sublicense access to RUNLY without prior written authorization.",
          ],
        },
        {
          heading: "Intellectual property",
          paragraphs: [
            "RUNLY, its code, design, brand, and documentation are the property of Racoon Devs or its licensors. These terms grant you no ownership rights over the platform, only a right of use under the applicable contract. Data you enter into the platform remains your property.",
          ],
        },
        {
          heading: "Fees and billing",
          paragraphs: [
            "Fees applicable to each customer are set out in the corresponding commercial proposal or contract and may vary based on contracted modules and usage volume. Failure to pay may result in suspension of access to the service, following notice.",
          ],
        },
        {
          heading: "Service availability",
          paragraphs: [
            "We work to keep RUNLY continuously available, but we do not guarantee uninterrupted or error-free operation. We may perform scheduled maintenance, providing reasonable advance notice when possible.",
          ],
        },
        {
          heading: "Limitation of liability",
          paragraphs: [
            "To the maximum extent permitted by law, Racoon Devs will not be liable for indirect, incidental, or consequential damages arising from the use of RUNLY. Our total liability to you is limited to the amount actually paid for the service in the preceding 12 months.",
          ],
        },
        {
          heading: "Termination",
          paragraphs: [
            "You may stop using RUNLY at any time in accordance with your contract's cancellation terms. We may suspend or terminate your access if you breach these terms, with notice where circumstances allow.",
          ],
        },
        {
          heading: "Changes to these terms",
          paragraphs: [
            "We may update these Terms of Service periodically. We will publish any material changes on this page along with the update date; continued use of RUNLY after a change constitutes acceptance of it.",
          ],
        },
        {
          heading: "Governing law and jurisdiction",
          paragraphs: [
            "These terms are governed by the laws of Mexico. For any dispute related to these terms, the parties submit to the competent courts of Mexico, unless the contract signed with your company states otherwise.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: ["If you have questions about these Terms of Service, write to us at hola@runly.mx."],
        },
      ],
    },
    security: {
      metaTitle: "Data Security | RUNLY",
      metaDescription: "Learn about the technical and organizational measures RUNLY uses to protect your company's information.",
      eyebrow: "Legal",
      title: "Data Security",
      lastUpdated: "Last updated: September 21, 2026",
      intro:
        "At Racoon Devs, we protect the information you manage in RUNLY with technical and organizational measures designed to preserve its confidentiality, integrity, and availability.",
      sections: [
        {
          heading: "Our commitment to security",
          paragraphs: [
            "Data security is a priority in the design and operation of RUNLY, not an afterthought. We apply industry best practices at every layer of the platform.",
          ],
        },
        {
          heading: "Encryption and data protection",
          paragraphs: ["We protect information both in transit and at rest through encryption."],
          list: [
            "All communication between your browser and RUNLY travels encrypted over HTTPS/TLS.",
            "Data stored on our infrastructure is safeguarded with encryption at rest.",
            "Access credentials are stored using secure hashing algorithms, never in plain text.",
          ],
        },
        {
          heading: "Infrastructure and hosting",
          paragraphs: [
            "RUNLY is hosted on infrastructure from providers recognized for their physical and operational security standards, with access controls and continuous monitoring of the environment where the platform runs.",
          ],
        },
        {
          heading: "Access control",
          paragraphs: ["Access to your company's data is restricted following the principle of least privilege."],
          list: [
            "Each company operates in a logically isolated space within the multi-company platform.",
            "Permissions within RUNLY are configured by module and by user role.",
            "Internal access by the Racoon Devs team to customer data is limited and audited.",
            "We recommend enabling strong password practices for all of your team's accounts.",
          ],
        },
        {
          heading: "Backups and continuity",
          paragraphs: [
            "We perform periodic backups of information to reduce the risk of data loss and to support recovery plans in the event of an incident.",
          ],
        },
        {
          heading: "Monitoring and incident response",
          paragraphs: [
            "We monitor the platform's operation to detect anomalous behavior and maintain an internal process to address and resolve security incidents when they occur.",
          ],
        },
        {
          heading: "Providers and subprocessors",
          paragraphs: [
            "We work with a limited number of infrastructure and service providers to operate RUNLY, selected for their security standards, and we share with them only the information strictly necessary.",
          ],
        },
        {
          heading: "Responsible vulnerability disclosure",
          paragraphs: [
            "If you identify a potential security vulnerability in RUNLY, please report it responsibly by writing to support@runly.mx before disclosing it publicly, so we can investigate and fix it.",
          ],
        },
        {
          heading: "Security contact",
          paragraphs: ["For questions or reports related to the security of your data, contact us at support@runly.mx."],
        },
      ],
    },
    support: {
      metaTitle: "Support Contact | RUNLY",
      metaDescription: "Channels, hours, and response times for RUNLY's technical support for active customers.",
      eyebrow: "Legal",
      title: "Support Contact",
      lastUpdated: "Last updated: September 21, 2026",
      intro:
        "This channel is for customers already using RUNLY who need technical help. If you're not yet a customer and want a demo or quote, use the sales form on the main page.",
      sections: [
        {
          heading: "Support channels",
          paragraphs: ["You can reach our support team through the following channels:"],
          list: [
            "Email: support@runly.mx — we follow up on your case right there.",
            "WhatsApp: +52 322 135 8808 — for urgent questions or quick follow-up.",
          ],
        },
        {
          heading: "Support hours",
          paragraphs: [
            "Our support team is available Monday through Friday, during Mexico business hours. Outside these hours, your message is logged and we address it as soon as we reopen.",
          ],
        },
        {
          heading: "What technical support covers",
          paragraphs: [
            "Technical support handles usage questions about your contracted modules, platform issues, and configuration requests within the scope of your contract. For new quotes, additional modules, or demos, use the sales form on the main page instead of this channel.",
          ],
        },
        {
          heading: "Response times",
          paragraphs: [
            "We aim to give a first response to support reports on the same business day they are received. Times may vary depending on the complexity of the case; for critical issues, reach us on WhatsApp.",
          ],
        },
        {
          heading: "Before writing to us",
          paragraphs: ["To help you faster, please include in your message:"],
          list: [
            "Your company name and the module related to your question or issue.",
            "The exact steps you took before the problem occurred.",
            "Screenshots of the error, if applicable.",
            "The user account affected, if your account manages multiple logins.",
          ],
        },
      ],
    },
  },
};
