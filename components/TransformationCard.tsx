import Image from "next/image";

function Placeholder({ label }: { label: string }) {
  return (
    <div className="relative flex aspect-[4/5] items-end justify-start overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-brand-primary/10 via-white to-brand-accent/10 p-4">
      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-black/60 shadow-soft">
        {label}
      </span>
    </div>
  );
}

export function TransformationCard({
  name,
  result,
  beforeImageSrc,
  afterImageSrc,
}: {
  name: string;
  result: string;
  beforeImageSrc?: string;
  afterImageSrc?: string;
}) {
  return (
    <article className="rounded-3xl border border-black/5 bg-white p-5 shadow-soft">
      <div className="grid gap-3 sm:grid-cols-2">
        {beforeImageSrc ? (
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-black/5">
            <Image
              src={beforeImageSrc}
              alt={`Voor - ${name}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 300px"
            />
            <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-black/60 shadow-soft">
              Voor
            </div>
          </div>
        ) : (
          <Placeholder label="Voor" />
        )}

        {afterImageSrc ? (
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-black/5">
            <Image
              src={afterImageSrc}
              alt={`Na - ${name}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 300px"
            />
            <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-black/60 shadow-soft">
              Na
            </div>
          </div>
        ) : (
          <Placeholder label="Na" />
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-black/80">{name}</p>
          <p className="mt-1 text-sm text-black/60">{result}</p>
        </div>
        <span className="mt-0.5 rounded-full bg-brand-light/30 px-3 py-1 text-xs font-semibold text-brand-primary">
          Transformatie
        </span>
      </div>
    </article>
  );
}

