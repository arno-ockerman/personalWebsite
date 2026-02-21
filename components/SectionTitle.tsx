import { ReactNode } from "react";

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-accent">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl tracking-tight text-brand-text sm:text-4xl">{title}</h2>
      {subtitle ? (
        <p className="mt-4 text-sm leading-relaxed text-black/70 sm:text-base">{subtitle}</p>
      ) : null}
    </div>
  );
}

