import { profile } from "@/lib/data";

const links = [
  { href: "#tools", label: "Tools" },
  { href: "#tsr", label: "Tax Sale Resources" },
  { href: "#docs", label: "Docs" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a
          href="#top"
          className="font-mono text-sm font-medium tracking-tight"
        >
          {profile.name.toLowerCase().replace(/\s+/g, "")}
        </a>
        <nav className="flex items-center gap-6 text-sm text-[var(--color-muted)]">
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
