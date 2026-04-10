import { profile } from "@/lib/data";

const links = [
  { href: "#tools", label: "Tools" },
  { href: "#tsr", label: "TSR" },
  { href: "#docs", label: "Docs" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-bg)]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--color-accent-blue)] shadow-[0_0_12px_var(--color-accent-blue)]" />
          <span className="font-mono text-sm font-medium tracking-tight text-[var(--color-fg)]">
            {profile.name.toLowerCase().replace(/\s+/g, "")}
          </span>
        </a>
        <nav className="flex items-center gap-7 text-sm text-[var(--color-muted)]">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hidden transition hover:text-[var(--color-fg)] sm:inline"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
