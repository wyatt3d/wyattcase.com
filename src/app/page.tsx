import { Footer } from "@/components/Footer";
import { Grid } from "@/components/Grid";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ItemCard } from "@/components/ItemCard";
import { Section } from "@/components/Section";
import { documents, featured, tools, tsrResources } from "@/lib/data";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-6">
        <Hero />

        {/* Featured strip — pinned quick-access to the most-used tools */}
        <section id="featured" className="pb-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
              Featured
            </div>
            <div className="h-px flex-1 mx-6 bg-[var(--color-border)]" />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {featured.map((item) => (
              <ItemCard key={item.url} item={item} />
            ))}
          </div>
        </section>

        <Section
          id="tools"
          eyebrow="Tools"
          title="Things I've built"
          description="Small tools and experiments shipped on Vercel. Most are public — grab what's useful."
        >
          <Grid items={tools} />
        </Section>

        <Section
          id="tsr"
          eyebrow="Tax Sale Resources"
          title="TSR work"
          description="Projects tied to my work at Tax Sale Resources."
        >
          <Grid items={tsrResources} />
        </Section>

        <Section
          id="docs"
          eyebrow="Docs"
          title="Shared documents"
          description="Reference sites and docs I share with friends and coworkers."
        >
          <Grid items={documents} />
        </Section>

        <Footer />
      </main>
    </>
  );
}
