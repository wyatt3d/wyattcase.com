import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { DedicatedMachine } from "@/components/DedicatedMachine";
import { site, services, caseStudies, approach, dedicatedMachine } from "@/lib/content";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber-300/80">
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative z-10">
      {/* ---------- Hero ---------- */}
      <section className="mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-6 pb-24 pt-32 sm:px-10">
        <Reveal>
          {site.available ? (
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[12px] font-light text-white/70 backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Available for select projects
            </div>
          ) : null}
        </Reveal>

        <Reveal delay={60}>
          <h1 className="max-w-4xl text-balance text-[clamp(2.75rem,8vw,6.5rem)] font-light leading-[0.95] tracking-[-0.03em] text-white">
            AI systems that
            <br className="hidden sm:block" /> run themselves.
          </h1>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-7 max-w-2xl text-balance text-lg font-light leading-relaxed text-white/75 sm:text-xl">
            I&apos;m Wyatt Case — an engineer and founder who builds AI knowledge
            bases, autonomous agents, and the full-stack products around them. I
            ship production software fast, and I run my own compute cluster so I
            can hand you systems that keep working after launch.
          </p>
        </Reveal>

        <Reveal delay={180}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="#work"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:-translate-y-0.5"
            >
              View selected work
            </Link>
            <Link
              href={site.upwork}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-xl transition-colors hover:bg-white/15"
            >
              Hire me on Upwork →
            </Link>
          </div>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
            <span>AI Knowledge Bases</span>
            <span>Agentic Automation</span>
            <span>Web Scraping</span>
            <span>Next.js + Supabase</span>
            <span>Computer Vision</span>
          </div>
        </Reveal>
      </section>

      {/* ---------- Selected work ---------- */}
      <section id="work" className="scroll-mt-24 border-t border-white/10 bg-[#0a0a0c]/55 backdrop-blur-2xl">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
          <Reveal>
            <Eyebrow>Selected work</Eyebrow>
            <h2 className="mt-3 max-w-2xl text-3xl font-light tracking-tight text-white sm:text-4xl">
              Systems I&apos;ve designed and shipped — solo, end to end.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((c, i) => (
              <Reveal key={c.slug} as="article" delay={(i % 3) * 70}>
                <Link
                  href={`/work/${c.slug}`}
                  className="group flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-6 ring-1 ring-transparent transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl" aria-hidden>
                      {c.emoji}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">
                      {c.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-medium text-white">{c.name}</h3>
                  <p className="mt-2 flex-1 text-[14px] font-light leading-relaxed text-white/65">
                    {c.summary}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-[12px] font-light text-amber-300/80">{c.metric}</span>
                    <span className="text-[13px] text-white/50 transition-colors group-hover:text-white">
                      Read →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Services ---------- */}
      <section id="services" className="scroll-mt-24 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
          <Reveal>
            <Eyebrow>What I do</Eyebrow>
            <h2 className="mt-3 max-w-2xl text-3xl font-light tracking-tight text-white sm:text-4xl">
              Six ways I can move your roadmap forward.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={(i % 3) * 70} className="h-full">
                <div className="flex h-full flex-col bg-[#0b0b0e]/85 p-7">
                  <h3 className="text-lg font-medium text-white">{s.title}</h3>
                  <p className="mt-2.5 flex-1 text-[14px] font-light leading-relaxed text-white/65">
                    {s.blurb}
                  </p>
                  <ul className="mt-5 space-y-1.5">
                    {s.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-[13px] font-light text-white/55">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-400/80" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Dedicated machine offer ---------- */}
      <section id="dedicated" className="scroll-mt-24 border-t border-white/10 bg-[#0a0a0c]/60 backdrop-blur-2xl">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
          <Reveal className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-amber-200/90">
              Dedicated Machine · {dedicatedMachine.price}{dedicatedMachine.cadence}
            </div>
            <h2 className="mx-auto mt-5 max-w-3xl text-balance text-3xl font-light tracking-tight text-white sm:text-4xl">
              Rent a machine that works only for you.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] font-light leading-relaxed text-white/70">
              A dedicated Apple Silicon Mac mini, set up as your private
              automation engine and running 24/7. I build and maintain the
              agents, scrapers, and pipelines on it — and add any new tool you
              want, whenever you think of it. No cloud bills, no cold starts, no
              per-token surprises. One flat monthly price.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-14">
            <DedicatedMachine />
          </Reveal>

          {/* Pricing card */}
          <Reveal delay={120} className="mt-14">
            <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/12 bg-white/[0.04]">
              <div className="flex flex-col items-baseline gap-2 border-b border-white/10 px-7 py-7 sm:flex-row sm:justify-between">
                <div>
                  <div className="text-lg font-medium text-white">Your own dedicated machine</div>
                  <div className="mt-1 text-[13px] font-light text-white/55">
                    Reserved hardware + me, building whatever you need on it.
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-light text-white">{dedicatedMachine.price}</span>
                  <span className="text-[13px] font-light text-white/55">{dedicatedMachine.cadence}</span>
                </div>
              </div>
              <ul className="grid gap-3 px-7 py-7 sm:grid-cols-2">
                {dedicatedMachine.included.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] font-light leading-relaxed text-white/75">
                    <span className="mt-0.5 text-amber-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="px-7 pb-7">
                <a
                  href={`mailto:${site.email}?subject=Dedicated%20Machine%20(%241%2C500%2Fmo)`}
                  className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:-translate-y-0.5 sm:w-auto"
                >
                  Claim your machine →
                </a>
                <p className="mt-3 text-[12px] font-light text-white/40">
                  Tell me what you want it to do and I&apos;ll have it running for you, usually within a week.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Approach ---------- */}
      <section id="approach" className="scroll-mt-24 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
          <Reveal>
            <Eyebrow>How I work</Eyebrow>
            <h2 className="mt-3 max-w-2xl text-3xl font-light tracking-tight text-white sm:text-4xl">
              Clear scope, fast shipping, clean handoff.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {approach.map((step, i) => (
              <Reveal key={step.n} delay={(i % 4) * 60}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="font-mono text-sm text-amber-300/70">{step.n}</div>
                  <h3 className="mt-3 text-lg font-medium text-white">{step.title}</h3>
                  <p className="mt-2 text-[13.5px] font-light leading-relaxed text-white/60">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- About ---------- */}
      <section id="about" className="scroll-mt-24 border-t border-white/10 bg-[#0a0a0c]/55 backdrop-blur-2xl">
        <div className="mx-auto max-w-3xl px-6 py-24 sm:px-10">
          <Reveal>
            <Eyebrow>About</Eyebrow>
            <div className="mt-5 space-y-5 text-[16px] font-light leading-relaxed text-white/75">
              <p>
                I&apos;m a solo founder and engineer. I&apos;ve designed and
                shipped a dozen production systems across real estate, fintech,
                and AI — most of them alone, from blank repo to live product.
              </p>
              <p>
                I stay at the frontier of AI tooling and build the things most
                teams consider too ambitious: recursive research agents,
                self-updating knowledge bases, computer-vision pipelines. The
                same toolkit that runs my own companies is what I bring to client
                work — which means you get systems that are efficient, polished,
                and built to run with minimal human intervention.
              </p>
              <p>
                If you have a problem that sounds hard, that&apos;s usually a good
                sign we should talk.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Contact CTA ---------- */}
      <section id="contact" className="scroll-mt-24 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-28 text-center sm:px-10">
          <Reveal>
            <h2 className="mx-auto max-w-3xl text-balance text-4xl font-light leading-tight tracking-tight text-white sm:text-5xl">
              Have something ambitious to build?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] font-light leading-relaxed text-white/65">
              Tell me the outcome you&apos;re after. I&apos;ll tell you whether I
              can build it, how, and how fast.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={site.upwork}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:-translate-y-0.5"
              >
                Hire me on Upwork →
              </Link>
              <a
                href={`mailto:${site.email}`}
                className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-xl transition-colors hover:bg-white/15"
              >
                Email me directly
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
