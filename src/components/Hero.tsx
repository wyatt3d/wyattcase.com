import { profile } from "@/lib/data";

export function Hero() {
  return (
    <div id="top" className="pt-16 pb-8 sm:pt-24 sm:pb-12">
      <div className="font-mono text-xs uppercase tracking-wider text-[var(--color-muted)]">
        {profile.role}
      </div>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        {profile.name}
      </h1>
      <p className="mt-5 max-w-xl text-base text-[var(--color-muted)] sm:text-lg">
        {profile.tagline}
      </p>
    </div>
  );
}
