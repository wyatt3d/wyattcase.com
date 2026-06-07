import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { caseStudies } from "@/lib/content";
import { Reveal } from "@/components/Reveal";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = caseStudies.find((x) => x.slug === slug);
  if (!c) return { title: "Not found" };
  return {
    title: `${c.name} — ${c.tag}`,
    description: c.summary,
    openGraph: { title: `${c.name} — ${c.tag}`, description: c.summary },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = caseStudies.find((x) => x.slug === slug);
  if (!c) notFound();

  const idx = caseStudies.findIndex((x) => x.slug === slug);
  const next = caseStudies[(idx + 1) % caseStudies.length];

  return (
    <main className="relative z-10">
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-32 sm:px-10">
        <Reveal>
          <Link
            href="/#work"
            className="font-mono text-[12px] uppercase tracking-[0.18em] text-white/50 transition-colors hover:text-white"
          >
            ← All work
          </Link>

          <div className="mt-8 flex items-center gap-3">
            <span className="text-3xl" aria-hidden>
              {c.emoji}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-amber-300/80">
              {c.tag}
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-light tracking-tight text-white sm:text-5xl">
            {c.name}
          </h1>
          <p className="mt-4 text-lg font-light leading-relaxed text-white/75">
            {c.summary}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3.5 py-1.5 text-[13px] font-light text-amber-200/90">
              {c.metric}
            </span>
            {c.live ? (
              <a
                href={c.live}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-white/15"
              >
                Visit {c.liveLabel ?? "live site"} ↗
              </a>
            ) : null}
          </div>
        </Reveal>

        <div className="mt-14 space-y-12">
          <Reveal as="section">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300/70">
              The problem
            </h2>
            <p className="mt-3 text-[16px] font-light leading-relaxed text-white/75">
              {c.problem}
            </p>
          </Reveal>

          <Reveal as="section">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300/70">
              The approach
            </h2>
            <p className="mt-3 text-[16px] font-light leading-relaxed text-white/75">
              {c.approach}
            </p>
          </Reveal>

          <Reveal as="section">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300/70">
              What I built
            </h2>
            <ul className="mt-4 space-y-3">
              {c.built.map((b) => (
                <li key={b} className="flex items-start gap-3 text-[15.5px] font-light leading-relaxed text-white/75">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/80" />
                  {b}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal as="section">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300/70">
              The outcome
            </h2>
            <p className="mt-3 text-[16px] font-light leading-relaxed text-white/75">
              {c.outcome}
            </p>
          </Reveal>

          <Reveal as="section">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-300/70">
              Stack
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {c.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12.5px] font-light text-white/70"
                >
                  {s}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Next case + CTA */}
        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/work/${next.slug}`}
            className="group text-white/70 transition-colors hover:text-white"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
              Next
            </span>
            <div className="mt-1 text-lg font-light">
              {next.name} <span className="text-white/40 group-hover:text-white">→</span>
            </div>
          </Link>
          <Link
            href="/#contact"
            className="self-start rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:-translate-y-0.5 sm:self-auto"
          >
            Build something like this →
          </Link>
        </div>
      </article>
    </main>
  );
}
