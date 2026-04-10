import { profile } from "@/lib/data";

export function Hero() {
  return (
    <div
      id="top"
      className="relative isolate overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-24"
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.18),transparent_70%)] blur-2xl"
      />
      <div className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
        {profile.role}
      </div>
      <h1 className="mt-4 bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-7xl">
        {profile.name}
      </h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
        {profile.tagline}
      </p>

      <div className="mt-8 flex items-center gap-3 text-sm">
        <a
          href="#tools"
          className="rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-elev)] px-4 py-2 text-[var(--color-fg)] transition hover:border-white/30"
        >
          Browse tools
        </a>
        <a
          href="#tsr"
          className="rounded-full px-4 py-2 text-[var(--color-muted)] transition hover:text-[var(--color-fg)]"
        >
          Tax Sale Resources →
        </a>
      </div>
    </div>
  );
}
