import type { Metadata } from "next";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "Mijn verhaal",
  description:
    "Van -18kg naar een sterke routine. Mijn journey met discipline, gezin, werk en Ankylosing Spondylitis — en waarom ik nu anderen help.",
};

export default function MijnVerhaalPage() {
  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="max-w-3xl">
          <Badge>Mijn verhaal</Badge>
          <h1 className="mt-5 font-display text-5xl tracking-tight text-brand-text sm:text-6xl">
            Niet perfect. Wel consistent.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-black/70 sm:text-lg">
            Ik ben Arno Ockerman. Ik weet hoe het voelt om opnieuw te moeten starten — met een druk leven, gezin, werk,
            en een lichaam dat niet altijd meewerkt. Daarom coach ik vandaag mannen die resultaat willen, zonder drama.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/contact">Ik wil starten</Button>
            <Button href="/" variant="ghost">
              Terug naar Home
            </Button>
          </div>
        </div>
      </Container>

      <section className="mt-12">
        <Container>
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionTitle
                eyebrow="De kern"
                title={<span className="font-serif">De 3 dingen die alles veranderden</span>}
                subtitle="Niet één magische hack. Wel heldere afspraken, herhaling en de juiste omgeving."
              />
            </div>
            <div className="grid gap-4 lg:col-span-7 sm:grid-cols-3">
              {[
                {
                  title: "Structuur",
                  text: "Een plan dat je kunt volgen op je drukste week. Consistent > intens.",
                },
                { title: "Eerlijk meten", text: "Progressie tracken en tijdig bijsturen. Wat je meet, verbeter je." },
                { title: "Support", text: "Je hoeft het niet alleen te dragen. Accountability maakt het verschil." },
              ].map((card) => (
                <div key={card.title} className="rounded-3xl border border-black/5 bg-white p-6 shadow-soft">
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

      <section className="mt-12">
        <Container>
          <div className="grid gap-6 rounded-3xl border border-black/5 bg-white p-7 shadow-soft sm:p-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-accent">Journey</p>
              <h2 className="mt-3 font-serif text-4xl text-brand-text">
                -18kg en daarna: sterker bouwen
              </h2>
            </div>
            <div className="lg:col-span-7">
              <div className="space-y-4 text-sm leading-relaxed text-black/70 sm:text-base">
                <p>
                  Ik begon ooit met één doel: me terug goed voelen in mijn eigen lichaam. Geen extreme regels, wel een
                  plan dat ik kon volhouden naast mijn leven.
                </p>
                <p>
                  Het resultaat was niet alleen gewicht verliezen, maar vooral een routine bouwen. Daarna kwam de
                  volgende stap: spiermassa opbouwen, sterker worden, en mijn energie terug op orde krijgen.
                </p>
                <p>
                  En ja — ik heb{" "}
                  <span className="font-semibold text-black/80">Ankylosing Spondylitis</span>. Dat betekent dat ik slim
                  moet trainen, mijn lichaam respecteren en focus houden op techniek. Precies daarom is mijn coaching
                  praktisch: veilig, progressief en duurzaam.
                </p>
              </div>
              <div className="mt-7 rounded-3xl border border-brand-primary/10 bg-brand-primary/5 p-6">
                <p className="text-sm font-semibold text-brand-primary">Mijn belofte</p>
                <p className="mt-2 text-sm text-black/70">
                  We maken het simpel. Jij krijgt duidelijke stappen voor training, voeding en mindset — en ik help je
                  om ze vol te houden.
                </p>
                <Button href="/contact" className="mt-5">
                  Start met een korte intake
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
