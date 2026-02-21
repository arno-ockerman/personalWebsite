import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { getInstagramMedia } from "@/lib/instagram/server";

export async function InstagramFeed({ limit = 6 }: { limit?: number }) {
  const media = await getInstagramMedia(limit);

  return (
    <section className="py-14 sm:py-18">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-accent">Instagram</p>
            <h2 className="mt-3 font-serif text-4xl text-brand-text">Laatste posts.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/70 sm:text-base">
              Volg mee via <span className="font-semibold text-black/80">@arnoockerman</span>.
            </p>
          </div>
          <Button href="https://instagram.com/arnoockerman" variant="secondary">
            Volg op Instagram
          </Button>
        </div>

        {media?.length ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((item) => {
              const imageUrl = item.mediaType === "VIDEO" ? item.thumbnailUrl : item.mediaUrl;
              if (!imageUrl) return null;
              return (
                <a
                  key={item.id}
                  href={item.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-3xl border border-black/5 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-brand"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={item.caption ?? "Instagram post"}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="max-h-12 overflow-hidden text-sm text-black/70 group-hover:text-black">
                      {item.caption ?? "Bekijk post"}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-black/5 bg-white p-6 shadow-soft">
            <p className="text-sm text-black/70">
              Instagram feed is nog niet gekoppeld. Zet <span className="font-semibold">INSTAGRAM_ACCESS_TOKEN</span>{" "}
              in Vercel om automatisch de laatste posts te tonen.
            </p>
            <Button href="https://instagram.com/arnoockerman" className="mt-5">
              Open Instagram
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
