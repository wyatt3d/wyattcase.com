import type { Item } from "@/lib/data";

const accentMap: Record<NonNullable<Item["accent"]>, string> = {
  blue: "bg-[var(--color-accent-blue)]",
  green: "bg-[var(--color-accent-green)]",
  purple: "bg-[var(--color-accent-purple)]",
  orange: "bg-[var(--color-accent-orange)]",
  pink: "bg-[var(--color-accent-pink)]",
};

function hostFromUrl(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ItemCard({ item }: { item: Item }) {
  const dot = accentMap[item.accent ?? "blue"];
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="group relative flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition hover:border-[var(--color-fg)]/30 hover:shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`}
          aria-hidden
        />
        {item.tag && (
          <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-muted)]">
            {item.tag}
          </span>
        )}
      </div>

      <h3 className="text-base font-medium tracking-tight">{item.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-[var(--color-muted)]">
        {item.description}
      </p>

      <div className="mt-6 flex items-center justify-between font-mono text-xs text-[var(--color-muted)]">
        <span className="truncate">{hostFromUrl(item.url)}</span>
        <span
          aria-hidden
          className="translate-x-0 transition-transform group-hover:translate-x-0.5"
        >
          ↗
        </span>
      </div>
    </a>
  );
}
