import { profile } from "@/lib/data";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--color-border)] py-10">
      <div className="flex flex-col items-start justify-between gap-4 text-sm text-[var(--color-muted)] sm:flex-row sm:items-center">
        <span className="font-mono">
          © {new Date().getFullYear()} {profile.name}
        </span>
        <div className="flex items-center gap-6">
          <a
            href={`mailto:${profile.email}`}
            className="transition hover:text-[var(--color-fg)]"
          >
            {profile.email}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-[var(--color-fg)]"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
