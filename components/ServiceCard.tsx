import { ReactNode } from "react";
import { Button } from "@/components/Button";

export function ServiceCard({
  title,
  description,
  highlights,
  priceHint,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  highlights: string[];
  priceHint?: ReactNode;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <article className="rounded-3xl border border-black/5 bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-2xl text-brand-primary">{title}</p>
          <p className="mt-2 text-sm leading-relaxed text-black/70">{description}</p>
        </div>
        <span className="rounded-full bg-brand-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
          Aanbod
        </span>
      </div>

      <ul className="mt-5 space-y-2 text-sm text-black/70">
        {highlights.map((h) => (
          <li key={h} className="flex gap-3">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
            <span>{h}</span>
          </li>
        ))}
      </ul>

      {priceHint ? (
        <div className="mt-5 rounded-2xl border border-brand-light bg-brand-light/20 p-4 text-sm text-black/70">
          {priceHint}
        </div>
      ) : null}

      <div className="mt-6">
        <Button href={ctaHref} className="w-full">
          {ctaLabel}
        </Button>
      </div>
    </article>
  );
}

