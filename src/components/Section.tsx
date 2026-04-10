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
    <section id={id} className="scroll-mt-24 py-16 sm:py-20">
      <div className="mb-10 max-w-2xl">
        {eyebrow && (
          <div className="mb-2 font-mono text-xs uppercase tracking-wider text-[var(--color-muted)]">
            {eyebrow}
          </div>
        )}
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-base text-[var(--color-muted)]">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
