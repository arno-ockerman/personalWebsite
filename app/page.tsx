import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";

export default function HomePage() {
  return (
    <main>
      <section className="pt-10 sm:pt-14">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <Badge>Coach • Voeding • Mindset</Badge>
              <h1 className="mt-5 font-display text-5xl tracking-tight text-brand-text sm:text-6xl">
                De beste persoon om jou te helpen met je doelen.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-black/70 sm:text-lg">
                Ik ben Arno Ockerman. Ik help ambitieuze mannen om een strakke, sterke body te bouwen én die levensstijl
                vol te houden — zonder onnodige complexiteit.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="/contact">Start je transformatie</Button>
                <Button href="/mijn-verhaal" variant="secondary">
                  Lees mijn verhaal
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3 rounded-3xl border border-black/5 bg-white p-5 shadow-soft sm:max-w-xl">
                <div>
                  <p className="font-display text-3xl font-extrabold text-brand-primary">
                    50+
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">
                    Transformaties
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl font-extrabold text-brand-primary">
                    -18kg
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Mijn journey</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-extrabold text-brand-primary">
                    21
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Dagen kickstart</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-br from-brand-primary/8 via-white to-brand-accent/10 p-6 shadow-soft">
                <div className="rounded-3xl bg-white p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-accent">
                    Waar we aan werken
                  </p>
                  <ul className="mt-5 space-y-3 text-sm text-black/70">
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-brand-primary" />
                      Duidelijke structuur: training, voeding en mindset in één plan.
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-brand-primary" />
                      Resultaatgericht: meten, bijsturen, volhouden.
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-brand-primary" />
                      Support: je hoeft het niet alleen te doen.
                    </li>
                  </ul>
                  <div className="mt-6 rounded-2xl border border-brand-light bg-brand-light/25 p-4">
                    <p className="text-sm font-semibold text-black/80">Eerste stap</p>
                    <p className="mt-1 text-sm text-black/70">
                      Vertel me waar je nu staat. Ik geef je een concreet plan voor de komende 7 dagen.
                    </p>
                    <Button href="/contact" className="mt-4 w-full">
                      Contact opnemen
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-18">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <SectionTitle
                eyebrow="Wat ik doe"
                title={
                  <span className="font-serif">3 pijlers die je vooruit duwen.</span>
                }
                subtitle="Geen hype. Geen ruis. Gewoon de basics keihard goed doen — met begeleiding en een plan dat bij je leven past."
              />
            </div>
            <div className="grid gap-4 lg:col-span-7 sm:grid-cols-3">
              {[
                {
                  title: "Coaching",
                  text: "Training die werkt, afgestemd op je niveau. Progressie zonder ego-lifts.",
                },
                { title: "Voeding", text: "Praktische voeding die je volhoudt. Simpel, consistent en meetbaar." },
                { title: "Mindset", text: "Focus op routine, energie en discipline. Resultaat is een gevolg." },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-3xl border border-black/5 bg-white p-6 shadow-soft"
                >
                  <p className="font-display text-xl text-brand-primary">
                    {card.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-black/70">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-14 sm:pb-18">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <SectionTitle
                eyebrow="Social proof"
                title={<span className="font-serif">Resultaat dat je kunt voelen.</span>}
                subtitle="Korte quotes uit de community. (In Phase 2 vullen we dit aan met voor/na foto’s en video’s.)"
              />
            </div>
            <div className="grid gap-4 lg:col-span-7 sm:grid-cols-3">
              {[
                {
                  name: "Tom, 32",
                  quote:
                    "Ik had eindelijk structuur. Geen crash-dieet, wel stappen die ik kon volhouden naast mijn job.",
                },
                {
                  name: "Yannick, 27",
                  quote: "3 weken later: meer energie, betere focus en ik bleef consistent trainen.",
                },
                {
                  name: "Kevin, 38",
                  quote: "Arno houdt het simpel. Dat was exact wat ik nodig had om weer vooruit te gaan.",
                },
              ].map((t) => (
                <figure key={t.name} className="rounded-3xl border border-black/5 bg-white p-6 shadow-soft">
                  <blockquote className="text-sm leading-relaxed text-black/70">“{t.quote}”</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-black/80">{t.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-16 sm:pb-20">
        <Container>
          <div className="rounded-3xl border border-black/5 bg-gradient-to-br from-white via-brand-bg to-brand-light/40 p-7 shadow-soft sm:p-10">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-accent">Klaar om te starten?</p>
                <h3 className="mt-3 font-serif text-4xl text-brand-text">
                  Maak de komende 7 dagen simpel.
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-black/70 sm:text-base">
                  Je hoeft niet alles ineens te veranderen. Start met een duidelijk plan, een paar scherpe afspraken en
                  support die je op koers houdt.
                </p>
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-3xl bg-white p-6 shadow-soft">
                  <p className="text-sm font-semibold text-black/80">Wat je krijgt</p>
                  <ul className="mt-4 space-y-2 text-sm text-black/70">
                    <li>• Snelle intake (5 minuten)</li>
                    <li>• Richting: afvallen, spiermassa of energie</li>
                    <li>• Concreet advies voor de komende week</li>
                  </ul>
                  <Button href="/contact" className="mt-6 w-full">
                    Plan mijn start
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
