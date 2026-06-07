import Link from "next/link";
import { site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#08080a]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div>
          <div className="text-sm font-medium text-white/90">{site.name}</div>
          <div className="mt-1 text-[13px] font-light text-white/45">
            {site.role} · {site.location}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-[13px] font-light text-white/60">
          <a href={`mailto:${site.email}`} className="transition-colors hover:text-white">
            Email
          </a>
          <Link href={site.upwork} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
            Upwork
          </Link>
          <Link href={site.github} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
            GitHub
          </Link>
          <Link href={site.x} target="_blank" rel="noreferrer" className="transition-colors hover:text-white">
            X
          </Link>
          <span className="text-white/30">© {2026}</span>
        </div>
      </div>
    </footer>
  );
}
