/**
 * Site content.
 *
 * Adding a new tool:
 *   1. Add an entry to the `tools` or `tsrResources` array below.
 *   2. That's it. No components to touch.
 *
 * Fields:
 *   name        — display title
 *   description — one short sentence
 *   url         — where the card links to
 *   tag         — optional pill (e.g. "beta", "internal", "new")
 *   accent      — optional color hint: "blue" | "green" | "purple" | "orange" | "pink"
 */

export type Item = {
  name: string;
  description: string;
  url: string;
  tag?: string;
  accent?: "blue" | "green" | "purple" | "orange" | "pink";
};

export const profile = {
  name: "Wyatt Case",
  role: "Building at Tax Sale Resources",
  tagline:
    "A small hub for the tools, docs, and experiments I share with friends and coworkers.",
  email: "wyatt@auctionblock.org",
  github: "https://github.com/wyatt3d",
};

/** General tools — projects I've built and want to share broadly. */
export const tools: Item[] = [
  {
    name: "Acrobat Reader",
    description: "Lightweight PDF reader in the browser.",
    url: "https://acrobat-reader.vercel.app",
    accent: "orange",
  },
  {
    name: "Storyboard Generator",
    description: "Batch-generate storyboard images from a JSON schema.",
    url: "https://storyboard-generator-blush.vercel.app",
    accent: "purple",
  },
  {
    name: "Scraper",
    description: "Quick web scraping utility.",
    url: "https://scraper.bot",
    accent: "green",
  },
  {
    name: "Gameboy Studio",
    description: "A Game Boy emulator and studio built in v0.",
    url: "https://gameboy-studio.vercel.app",
    accent: "pink",
  },
  {
    name: "Psyop365",
    description: "Daily generative art experiment.",
    url: "https://psyop365.vercel.app",
    accent: "blue",
  },
];

/** Tax Sale Resources — tools and docs tied to my work at TSR. */
export const tsrResources: Item[] = [
  {
    name: "TSR Redesign Concept",
    description:
      "Multi-source commercial real estate aggregator with an AI chat panel.",
    url: "https://tsr-redesign-concept-one.vercel.app",
    tag: "preview",
    accent: "blue",
  },
  {
    name: "Tax Sale News",
    description: "Headlines and briefings from the tax sale industry.",
    url: "https://tax-sale-news.vercel.app",
    accent: "green",
  },
  {
    name: "TSR Social Posts",
    description: "Drafting and scheduling utility for TSR social content.",
    url: "https://tsr-social-posts.vercel.app",
    tag: "internal",
    accent: "purple",
  },
  {
    name: "Property Disposition",
    description: "Workflows for tracking property dispositions.",
    url: "https://property-disposition-site.vercel.app",
    accent: "orange",
  },
];

/** Documents — shareable links (Google Docs, PDFs, Notion pages, etc.). */
export const documents: Item[] = [
  {
    name: "AuctionBlock Overview",
    description: "How our surplus recovery service works — for homeowners.",
    url: "https://www.auctionblock.org",
    accent: "blue",
  },
  {
    name: "Contract for Deed",
    description: "Reference site on contract-for-deed transactions.",
    url: "https://www.contract4deed.com",
    accent: "green",
  },
];
