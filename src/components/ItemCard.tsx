import Image from "next/image";
import { imageForItem, type Item } from "@/lib/data";

const accentGlow: Record<NonNullable<Item["accent"]>, string> = {
  blue: "before:bg-[var(--color-accent-blue)]",
  green: "before:bg-[var(--color-accent-green)]",
  purple: "before:bg-[var(--color-accent-purple)]",
  orange: "before:bg-[var(--color-accent-orange)]",
  pink: "before:bg-[var(--color-accent-pink)]",
};

function hostFromUrl(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ItemCard({ item }: { item: Item }) {
  const glow = accentGlow[item.accent ?? "blue"];
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elev)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]
        before:absolute before:left-1/2 before:top-0 before:h-px before:w-0 before:-translate-x-1/2 before:transition-all before:duration-500 group-hover:before:w-2/3 ${glow}`}
    >
      {/* Screenshot */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--color-subtle)]">
        <Image
          src={imageForItem(item)}
          alt={`${item.name} preview`}
          fill
          sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          unoptimized
        />
        {/* Top-to-transparent gradient for legibility of tags */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[var(--color-bg-elev)]" />
        {item.tag && (
          <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white/90 backdrop-blur">
            {item.tag}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight text-[var(--color-fg)]">
            {item.name}
          </h3>
          <span
            aria-hidden
            className="mt-1 inline-block text-[var(--color-muted)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            ↗
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--color-muted)]">
          {item.description}
        </p>
        <div className="mt-4 font-mono text-[11px] uppercase tracking-wider text-[var(--color-muted)]/70">
          {hostFromUrl(item.url)}
        </div>
      </div>
    </a>
  );
}
