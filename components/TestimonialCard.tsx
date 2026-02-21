export function TestimonialCard({
  quote,
  name,
  result,
}: {
  quote: string;
  name: string;
  result?: string;
}) {
  return (
    <figure className="rounded-3xl border border-black/5 bg-white p-6 shadow-soft">
      <blockquote className="text-sm leading-relaxed text-black/70">“{quote}”</blockquote>
      <figcaption className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-black/80">
        <span>{name}</span>
        {result ? <span className="text-black/50">• {result}</span> : null}
      </figcaption>
    </figure>
  );
}

