import type { Metadata } from "next";
import { CopyBlock } from "@/components/CopyBlock";
import { caseStudies, site } from "@/lib/content";

// Private brand + Upwork asset kit. Unlisted and noindexed.
export const metadata: Metadata = {
  title: "Brand Kit (Private)",
  robots: { index: false, follow: false, nocache: true },
};

const profileTitle = "AI Engineer — Agentic Automation, RAG & Knowledge Bases, Full-Stack";

const overview = `I build AI systems that run autonomously — and the full-stack products around them.

I'm an engineer and founder who ships production software fast. I operate a dedicated compute cluster for always-on agents, which means I can build you systems that work on a schedule — overnight research runs, continuously-updated knowledge bases, recurring data pipelines — not just code that sits idle until someone clicks a button.

What I do:
• AI knowledge bases & RAG — turn your docs into a searchable, citation-backed source your team and your AI can both query
• Autonomous & agentic systems — recursive research agents and self-updating pipelines that run 24/7
• Web scraping & data pipelines — reliable extraction at scale, structured and delivered on a schedule
• Full-stack product builds — Next.js, TypeScript, Supabase/Postgres, deployed on Vercel; idea to live in days
• AI feature integration — RAG, structured output, and tool-calling added to your product, without the hallucinations or runaway cost

I've designed and shipped a dozen production systems across real estate, fintech, and AI — most of them solo, end to end. I move fast, I architect before I build, and I hand off clean, documented, deployed systems.

If you have a problem that sounds hard, that's usually a good sign we should talk. Send me the outcome you're after and I'll tell you whether I can build it, how, and how fast.`;

const shortBio = `Engineer and founder. I build AI knowledge bases, autonomous agents, and full-stack products — and run a dedicated compute cluster so they keep working after launch.`;

const skillTags = `Artificial Intelligence, Large Language Models, RAG, Retrieval-Augmented Generation, AI Agent Development, Agentic Workflows, LangChain, Next.js, React, TypeScript, Node.js, Python, Supabase, PostgreSQL, Vector Databases, Web Scraping, Data Extraction, Web Crawling, OpenAI API, Anthropic Claude API, API Integration, Automation, Full-Stack Development, Computer Vision, OpenCV, Prompt Engineering, Vercel`;

const rateNote = `RATE STRATEGY (not pasted into Upwork — guidance for you)

• Account has 0 reviews → set rate at $65–85/hr for your first ~5 contracts.
  Goal of the first 5 jobs is 5-star reviews + Job Success Score, NOT money.
• After ~5 strong reviews → raise to $110–150/hr, or move to fixed-scope.
• Fixed-price sweet spots:
    - Knowledge base / RAG build: $3,000–$8,000
    - Full-stack MVP: $5,000–$15,000
    - Scraping → recurring dataset: $1,000–$3,000/mo retainer
• Always frame fixed bids around the OUTCOME and your speed, not hours.`;

const specializedProfiles = `SPECIALIZED PROFILES (Upwork lets you create up to 2 beyond your main one)

1. "AI Agents & Automation" — recursive agents, RAG, always-on pipelines, LLM workflows.
2. "Full-Stack Web Development" — Next.js + Supabase product builds, programmatic SEO.

Keep the main profile broad (the overview above). Tailor each specialized
profile's intro to that niche so you show up in more category searches.`;

// Paste-ready Upwork portfolio items, generated from the live case studies.
const portfolioItems = caseStudies.map((c) => ({
  label: `Portfolio item — ${c.name}`,
  hint: c.tag,
  text: `${c.name} — ${c.tag}

${c.summary}

${c.outcome}

Built with: ${c.stack.join(", ")}.${c.live ? `\nLive: ${c.live}` : ""}`,
}));

const proposalGeneral = `Hi [Client name],

You're looking for [restate their goal in one sentence]. I can build that.

Quick proof I'm the right fit: I've shipped [most relevant 1–2 systems, e.g. "a 56-jurisdiction self-updating AI knowledge base" and "a Next.js + Supabase marketplace"] — solo, end to end. Here's my work: https://wyattcase.com

How I'd approach yours:
1. [First concrete step tailored to their post]
2. [Second step]
3. [What "done" looks like]

I can start [this week] and have something working in your hands within [X days]. I also run a dedicated compute cluster, so if any part of this needs to run on a schedule (overnight, recurring), that's handled.

One question to make sure I scope this right: [one sharp question about their post].

— Wyatt`;

const proposalKB = `Hi [Client name],

Turning [their docs / PDFs / scattered knowledge] into a searchable, citation-backed knowledge base is exactly the kind of system I build. I recently built a 56-jurisdiction legal knowledge base that's generated and kept current by a recursive research agent — every claim links back to its source, and it refreshes itself instead of going stale.

For your project I'd:
1. Ingest and chunk [their content] into a vector store
2. Build retrieval with citations so answers are traceable, not hallucinated
3. Wrap it in [a simple search UI / an API your app can call]
4. (Optional) Add a pipeline that keeps it updated automatically

Portfolio: https://wyattcase.com

I can have a working prototype you can query within [X days]. One question: roughly how many documents/pages are we starting with, and do they change often?

— Wyatt`;

const proposalAgent = `Hi [Client name],

You want [the recurring/automated outcome] to just happen — without someone babysitting it. That's my specialty. I build recursive agents and self-updating pipelines, and I run a dedicated 3-node compute cluster specifically for always-on jobs, so this can run 24/7 without a cloud bill that balloons.

For your project I'd:
1. Define the trigger and the exact output you want [daily report / dataset / action]
2. Build the agent loop with a human-in-the-loop review step where it matters
3. Run it on a schedule and deliver [where: email, Sheet, your DB, Slack]

Recent example: an autonomous research engine that generates hypotheses, backtests them against live data, and surfaces ranked results — unattended. Work: https://wyattcase.com

What's the ideal cadence — hourly, daily, on an event?

— Wyatt`;

const proposalScrape = `Hi [Client name],

I can build you a reliable scraper for [target site/data] and deliver the data [structured, deduped, on a schedule]. I build anti-brittle scrapers and run them on dedicated hardware, so you get a recurring, structured dataset — not a one-off script that breaks next week.

Plan:
1. Map the target and confirm the exact fields you need
2. Build a resilient extractor (handles pagination, rate limits, layout changes)
3. Output to [CSV / Google Sheet / your database / API]
4. Schedule recurring runs + alerting if the source changes

Portfolio: https://wyattcase.com

Two quick questions: which fields matter most, and how often do you need fresh data?

— Wyatt`;

const brandKit = `WYATT CASE — BRAND KIT

Name:        Wyatt Case
Role:        AI Systems Engineer & Full-Stack Builder
One-liner:   ${site.tagline}
Site:        https://wyattcase.com
Email:       ${site.email}
GitHub:      ${site.github}
X:           ${site.x}
Location:    ${site.location}

COLORS (from the site's cinematic shader palette)
  Background     #0A0A0C  (near-black)
  Surface        #0B0B0E
  Accent (gold)  #F2A93C  → Tailwind amber-400/500
  Accent deep    #6B4A1E
  Teal undertone #1A2428
  Text           #FFFFFF / white at 65–75% opacity for body

TYPE
  Headings & body: Geist Sans (light / 300 weight for display)
  Labels & code:   Geist Mono (uppercase, letter-spacing ~0.2em)`;

function Section({
  n,
  title,
  desc,
  children,
}: {
  n: string;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/10 pt-10">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300/70">
        {n}
      </div>
      <h2 className="mt-2 text-2xl font-light tracking-tight text-white">{title}</h2>
      {desc ? <p className="mt-2 max-w-2xl text-[14px] font-light text-white/55">{desc}</p> : null}
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

export default function HiddenPage() {
  return (
    <main className="relative z-10 mx-auto max-w-3xl px-6 pb-28 pt-32 sm:px-10">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/55">
        Private · not linked publicly · noindexed
      </div>
      <h1 className="mt-6 text-4xl font-light tracking-tight text-white sm:text-5xl">
        Upwork Asset Kit
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] font-light leading-relaxed text-white/65">
        Everything to set up a profile that wins clients. Tap{" "}
        <span className="text-white/90">Copy</span> on any block and paste it
        straight into Upwork. Replace anything in [brackets] per job.
      </p>

      <div className="mt-12 space-y-12">
        <Section n="01" title="Profile title" desc="Goes at the very top of your Upwork profile. Lead with the rare stuff.">
          <CopyBlock label="Profile title" text={profileTitle} />
        </Section>

        <Section n="02" title="Profile overview" desc="The first two lines show in search results — they do the heavy lifting.">
          <CopyBlock label="Overview" text={overview} />
          <CopyBlock label="Short bio (for tagline / one-liner fields)" text={shortBio} />
        </Section>

        <Section n="03" title="Skills" desc="Add as many relevant tags as Upwork allows — they drive search visibility.">
          <CopyBlock label="Skill tags" text={skillTags} />
        </Section>

        <Section n="04" title="Rate & profile strategy">
          <CopyBlock label="Rate strategy" text={rateNote} />
          <CopyBlock label="Specialized profiles" text={specializedProfiles} />
        </Section>

        <Section
          n="05"
          title="Portfolio items"
          desc="One paste-ready entry per project. Add each as a portfolio item with a screenshot of the live site."
        >
          {portfolioItems.map((p) => (
            <CopyBlock key={p.label} label={p.label} hint={p.hint} text={p.text} />
          ))}
        </Section>

        <Section
          n="06"
          title="Proposal templates"
          desc="Lead with the outcome, prove it with one relevant project + your site link, ask one sharp question. Always tailor the [brackets]."
        >
          <CopyBlock label="General / cover proposal" text={proposalGeneral} />
          <CopyBlock label="AI knowledge base / RAG" text={proposalKB} />
          <CopyBlock label="Agentic automation / always-on" text={proposalAgent} />
          <CopyBlock label="Web scraping retainer" text={proposalScrape} />
        </Section>

        <Section n="07" title="Brand kit" desc="Colors, type, and links — for your Upwork banner, screenshots, and anywhere else.">
          <CopyBlock label="Brand kit" text={brandKit} />
        </Section>
      </div>
    </main>
  );
}
