import type { ReactNode } from "react";

type Props = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function Section({ id, eyebrow, title, description, children }: Props) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-[var(--color-border)] py-20">
      <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          {eyebrow && (
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
              {eyebrow}
            </div>
          )}
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {description && (
            <p className="mt-4 text-base text-[var(--color-muted)]">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
