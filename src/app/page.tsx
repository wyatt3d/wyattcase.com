import { Footer } from "@/components/Footer";
import { Grid } from "@/components/Grid";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { documents, tools, tsrResources } from "@/lib/data";

export default function Home() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6">
        <Hero />

        <Section
          id="tools"
          eyebrow="Tools"
          title="Things I've built"
          description="Small tools and experiments I've shipped on Vercel. Most are public — grab what's useful."
        >
          <Grid items={tools} />
        </Section>

        <Section
          id="tsr"
          eyebrow="Tax Sale Resources"
          title="TSR work"
          description="Projects and resources tied to my work at Tax Sale Resources."
        >
          <Grid items={tsrResources} />
        </Section>

        <Section
          id="docs"
          eyebrow="Docs"
          title="Shared documents"
          description="Reference sites and documents I share with friends and coworkers."
        >
          <Grid items={documents} />
        </Section>

        <Footer />
      </main>
    </>
  );
}
