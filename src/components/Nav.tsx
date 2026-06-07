import Link from "next/link";
import { site } from "@/lib/content";

const links = [
  { label: "Work", href: "/#work" },
  { label: "Services", href: "/#services" },
  { label: "Dedicated Machine", href: "/#dedicated" },
  { label: "About", href: "/#about" },
];

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
        <Link
          href="/"
          className="font-mono text-[12px] uppercase tracking-[0.24em] text-white/80 transition-colors hover:text-white"
        >
          Wyatt Case
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] font-light text-white/65 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href={site.upwork}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[13px] font-medium text-white backdrop-blur-xl transition-colors hover:bg-white/20"
        >
          Hire me
        </Link>
      </div>
    </header>
  );
}
