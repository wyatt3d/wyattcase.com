// Single source of truth for the portfolio. Edit copy here; pages render from it.

export const site = {
  name: "Wyatt Case",
  role: "AI Systems Engineer & Full-Stack Builder",
  // One-line positioning used in hero + metadata.
  tagline:
    "I design and build AI systems that run themselves — knowledge bases, autonomous agents, and the full-stack products around them.",
  location: "Bay Area, California",
  email: "wyattdcase@gmail.com",
  github: "https://github.com/wyattcase",
  x: "https://x.com/wyattdcase",
  // TODO(wyatt): paste your real Upwork profile URL here once the profile is live.
  upwork: "https://www.upwork.com/freelancers/wyattcase",
  available: true,
};

export type Service = {
  title: string;
  blurb: string;
  points: string[];
};

export const services: Service[] = [
  {
    title: "AI Knowledge Bases & RAG",
    blurb:
      "Turn scattered docs, PDFs, and tribal knowledge into a searchable, citation-backed knowledge base your team and your AI can both query.",
    points: ["Document ingestion & chunking", "Cited, hallucination-resistant answers", "Self-updating content pipelines"],
  },
  {
    title: "Autonomous & Agentic Systems",
    blurb:
      "Recursive agents and self-updating pipelines that research, monitor, and produce work on a schedule — running 24/7 on dedicated hardware.",
    points: ["Recursive research loops", "Scheduled, unattended runs", "Human-in-the-loop review queues"],
  },
  {
    title: "Web Scraping & Data Pipelines",
    blurb:
      "Reliable extraction at scale — cleaned, structured, and delivered on a recurring schedule. From a one-off dataset to an always-on monitor.",
    points: ["Resilient, anti-brittle scrapers", "Structured + deduped output", "Recurring delivery on cron"],
  },
  {
    title: "Full-Stack Product Builds",
    blurb:
      "Production web apps end to end — Next.js, TypeScript, Supabase/Postgres, auth, payments — deployed on Vercel. Idea to live in days, not months.",
    points: ["Next.js 16 + Supabase", "Auth, payments, dashboards", "Shipped to production fast"],
  },
  {
    title: "AI Feature Integration",
    blurb:
      "Add RAG, structured output, tool-calling, and LLM workflows to an existing product — without the hallucinations and the runaway cost.",
    points: ["Structured output & tool use", "Cost & latency control", "Eval-backed reliability"],
  },
  {
    title: "Programmatic SEO",
    blurb:
      "Hundreds of fast, statically-rendered pages generated from your data — built to rank and to convert, not to look spammy.",
    points: ["Data-driven page generation", "Static rendering at scale", "Clean internal linking"],
  },
];

export type CaseStudy = {
  slug: string;
  name: string;
  tag: string;
  emoji: string;
  // One-line for the card.
  summary: string;
  // Short metric/credibility line for the card.
  metric: string;
  stack: string[];
  live?: string;
  liveLabel?: string;
  // Detail page narrative.
  problem: string;
  approach: string;
  built: string[];
  outcome: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "tax-foreclosure-wiki",
    name: "Tax Foreclosure Wiki",
    tag: "AI Knowledge Base",
    emoji: "📚",
    summary:
      "A 56-jurisdiction reference on tax- and mortgage-foreclosure law, generated and kept current by a recursive research agent.",
    metric: "56 jurisdictions · self-updating",
    stack: ["Next.js", "TypeScript", "LLM autoresearch loop", "Structured citations"],
    problem:
      "Foreclosure surplus law is fragmented across every state, county, and municipality, changes constantly, and is buried in statutes and county procedures. Keeping a reference accurate by hand is effectively impossible.",
    approach:
      "I built a recursive research harness — an agent that researches a jurisdiction, drafts cited reference articles, critiques its own gaps, and loops until coverage is complete. A neutral-reference editorial voice and a citation layer keep every claim traceable to source.",
    built: [
      "An autoresearch loop that fans out across jurisdictions and self-checks for missing coverage",
      "A citation system so every legal claim links back to its source",
      "A fast statically-rendered wiki front end with a built-in feedback widget that files trouble tickets",
      "An automated pipeline that turns wiki content into cited short-form videos",
    ],
    outcome:
      "A continuously-updated legal knowledge base spanning 56 jurisdictions that refreshes itself rather than going stale — the kind of asset that normally requires a research team.",
  },
  {
    slug: "auctionblock",
    name: "AuctionBlock",
    tag: "Full-Stack Product",
    emoji: "⚖️",
    summary:
      "A surplus-recovery platform that helps people reclaim excess proceeds from foreclosure auctions — built to run with minimal human intervention.",
    metric: "Flat fee vs. 25–40% industry norm",
    stack: ["Next.js", "Supabase", "Postgres", "Vercel"],
    live: "https://auctionblock.org",
    liveLabel: "auctionblock.org",
    problem:
      "When a foreclosed property sells for more than the debt owed, the former owner is often entitled to the surplus — but recovery firms routinely take 25–40% to claim it, and most people never learn the money exists.",
    approach:
      "I designed AuctionBlock as a mission-driven, for-profit platform charging a flat fee far below the industry norm, with the operational workflow automated so a solo operator can run it at scale.",
    built: [
      "A full intake and case-management workflow",
      "A free education layer covering tax-lien and foreclosure-surplus law",
      "AI-assisted internal processes so the business runs lean",
    ],
    outcome:
      "A live platform turning an opaque, high-fee industry into a transparent flat-fee service — with the heavy lifting handled by automation rather than headcount.",
  },
  {
    slug: "contract4deed",
    name: "Contract4Deed",
    tag: "Marketplace + SEO",
    emoji: "🏠",
    summary:
      "An owner-finance real-estate marketplace and operator toolkit, with a deal-state machine and a 51-state operations library.",
    metric: "481 programmatic routes · 51-state coverage",
    stack: ["Next.js 16", "Supabase", "Programmatic SEO", "Vercel"],
    live: "https://contract4deed.com",
    liveLabel: "contract4deed.com",
    problem:
      "Owner-financed real estate (contract for deed) is legally intricate and varies by state, with no good marketplace and no operational tooling for the people structuring these deals.",
    approach:
      "I built a marketplace plus an operator toolkit on top of a deal-state machine that walks a transaction from listing to close, backed by a 51-state operations library — and layered hundreds of programmatic SEO pages to capture demand.",
    built: [
      "A deal-state machine modeling the full owner-finance transaction lifecycle",
      "A 51-state operations and legal-process library",
      "481 statically-rendered SEO routes (states, cities, glossary, pillar guides)",
      "A subscription + fee revenue model",
    ],
    outcome:
      "A defensible marketplace where the moat is the brand and a closed-deal track record, with programmatic SEO driving organic discovery across every state.",
  },
  {
    slug: "autonomous-research-engine",
    name: "Autonomous Research Engine",
    tag: "Agentic System",
    emoji: "🛰️",
    summary:
      "A recursive harness that continuously generates hypotheses, backtests them against live market data, and surfaces ranked signals — unattended.",
    metric: "Runs 24/7 on dedicated hardware",
    stack: ["Python", "Recursive agent loop", "Backtesting engine", "Next.js dashboard"],
    live: "https://yacht.bot",
    liveLabel: "yacht.bot",
    problem:
      "Finding edge in prediction markets means testing an endless space of strategies against constantly-moving data — far more than a person can evaluate by hand.",
    approach:
      "I ported a recursive autoresearch pattern into a harness that proposes strategies, backtests them against real market history, keeps what survives, and feeds the findings back into the next round — running continuously on a dedicated machine.",
    built: [
      "A recursive research loop that proposes and self-evaluates strategies",
      "A backtesting engine validating against live market history",
      "A monitoring dashboard surfacing ranked, hold-to-settlement signals",
    ],
    outcome:
      "An always-on research engine that does the work of a quant research desk on a single dedicated node — and surfaced that a maker, hold-to-settlement strategy beat the naive live approach.",
  },
  {
    slug: "royale-coach",
    name: "royale.coach",
    tag: "Computer Vision",
    emoji: "🎯",
    summary:
      "A real-time game coach that captures a live mobile screen, reads game state with OpenCV and OCR, and renders coaching on a web dashboard.",
    metric: "Real-time CV · no LLM in the hot path",
    stack: ["Python", "ADB capture", "OpenCV", "OCR", "Next.js"],
    problem:
      "Coaching a fast real-time game requires reading the screen and reacting within the frame budget — too fast for an LLM call in the loop, and too noisy for naive image matching.",
    approach:
      "I built a capture-and-vision pipeline: pull the live device screen over ADB, parse game state with OpenCV and OCR, and stream structured state to a web dashboard — keeping the hot path purely computer-vision so it stays real-time.",
    built: [
      "An ADB screen-capture pipeline",
      "An OpenCV + OCR state-reading layer tuned for speed",
      "A Next.js dashboard rendering live coaching",
    ],
    outcome:
      "A working real-time coaching tool that proves heavy CV work can run inside the frame budget — LLMs reserved for analysis after the fact, not the hot path.",
  },
  {
    slug: "tax-sale-resources",
    name: "Tax Sale Resources",
    tag: "Content Platform",
    emoji: "🗂️",
    summary:
      "Restructured a 45-article educational knowledge base for a tax-sale data company and built an automated social-content pipeline behind it.",
    metric: "45-article KB · automated content",
    stack: ["Next.js", "Supabase", "HubSpot KB", "Python content generator"],
    live: "https://taxsaleresources.com",
    liveLabel: "taxsaleresources.com",
    problem:
      "An established tax-sale data company needed its educational content consolidated, structured, and turned into a repeatable engine for ongoing publishing — without adding staff.",
    approach:
      "I migrated and restructured the full lesson library into a clean knowledge base, then built an automated carousel/social-content generator that plugs into the admin and produces shareable content from existing material.",
    built: [
      "A 45-article knowledge base, migration-ready and structured",
      "An automated social-carousel generator embedded in the admin",
      "Secure, role-gated integration between the two systems",
    ],
    outcome:
      "A content operation that scales without headcount — the lesson library became both a reference and a source for continuous social output.",
  },
  {
    slug: "bigskyharvest",
    name: "BigSkyHarvest",
    tag: "Marketplace MVP",
    emoji: "🌾",
    summary:
      "A two-sided job marketplace connecting Montana farms and ranches with seasonal workers — designed, built, and deployed as a full MVP.",
    metric: "Full MVP, idea to live",
    stack: ["Next.js 16", "Supabase", "Magic-link auth", "Vercel"],
    problem:
      "Agricultural employers in Montana struggle to find seasonal labor, and the workers who want the work have nowhere central to find it.",
    approach:
      "I built a complete two-sided marketplace MVP — listings, role-based onboarding, magic-link auth, seed content so it never looks empty — following a repeatable playbook that takes a raw idea to a deployed product.",
    built: [
      "A two-sided listings marketplace with role-based onboarding",
      "Passwordless magic-link authentication",
      "A built-in feedback/trouble-ticket system and admin panel",
    ],
    outcome:
      "A reference implementation of my MVP playbook: a real, deployed two-sided marketplace built solo and fast.",
  },
];

export const dedicatedMachine = {
  price: "$1,500",
  cadence: "/ month",
  // Capabilities radiating from the machine in the showcase graphic. Keep labels short.
  capabilities: [
    { icon: "📚", label: "Self-updating knowledge bases" },
    { icon: "🌙", label: "Overnight research runs" },
    { icon: "🕸️", label: "Scheduled web scraping" },
    { icon: "📊", label: "Recurring data pipelines" },
    { icon: "🤖", label: "Custom agents & automations" },
    { icon: "📥", label: "Reports to your inbox or Slack" },
    { icon: "🛠️", label: "New tools added on request" },
    { icon: "⚡", label: "Always-on, 24/7" },
  ],
  included: [
    "A Mac mini reserved entirely for you, running 24/7",
    "I build your first agent, scraper, or pipeline to get going",
    "Any new tool or workflow you want — added on request",
    "Ongoing monitoring, upkeep, and fixes",
    "A direct line to me — no ticket queue",
    "Month-to-month. Cancel anytime.",
  ],
};

export type Step = { n: string; title: string; body: string };

export const approach: Step[] = [
  {
    n: "01",
    title: "Scope",
    body: "A short call to pin down the outcome, the constraints, and exactly what 'done' looks like. No 50-page spec.",
  },
  {
    n: "02",
    title: "Architect",
    body: "I design the system before writing code — data model, interfaces, and failure modes — so it survives contact with reality.",
  },
  {
    n: "03",
    title: "Ship",
    body: "Working software fast, deployed to production. You get something real in days, not a status update in weeks.",
  },
  {
    n: "04",
    title: "Iterate & hand off",
    body: "Tight feedback loops, then a clean handoff — documented, deployed, and built to keep running after I'm gone.",
  },
];
