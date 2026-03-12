import type { Metadata } from "next";
import { Badge } from "@/components/Badge";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { KickstartForm } from "@/components/kickstart/KickstartForm";

export const metadata: Metadata = {
  title: "Gratis 7-Daagse Kickstart Gids | Arno Ockerman",
  description:
    "Download gratis het 7-daagse eetplan dat drukke mannen helpt vet te verliezen zonder complexe diëten. Met macro's, boodschappenlijst en pro tips.",
  alternates: {
    canonical: "https://www.beinspiredbyus.be/kickstart",
  },
  openGraph: {
    title: "Gratis 7-Daagse Kickstart Gids",
    description:
      "7 dagen. Simpel eetplan. Resultaten die blijven. Download nu gratis.",
    url: "https://www.beinspiredbyus.be/kickstart",
    type: "website",
  },
};

const BENEFITS = [
  { emoji: "📋", text: "7 dagen compleet dagmenu met macro's" },
  { emoji: "🛒", text: "Boodschappenlijst inbegrepen" },
  { emoji: "⚡", text: "Geen fancy dieet — gewoon eten dat werkt" },
  { emoji: "🕐", text: "Aangepast voor drukke mannen" },
  { emoji: "📬", text: "Direct in je mailbox — geen wachten" },
];

const MEAL_PREVIEW = [
  {
    dag: "Dag 1",
    maaltijden: [
      { icon: "🌅", label: "Ontbijt", meal: "4 eieren + 2 sneetjes volkorenbrood + komkommer" },
      { icon: "☀️", label: "Lunch", meal: "200g kipfilet + 150g rijst + groene salade" },
      { icon: "🌙", label: "Avondeten", meal: "200g zalm + geroosterde groenten" },
    ],
    kcal: 1920,
    proteine: 165,
  },
  {
    dag: "Dag 2",
    maaltijden: [
      { icon: "🌅", label: "Ontbijt", meal: "200g Griekse yoghurt + 50g havermout + bessen" },
      { icon: "☀️", label: "Lunch", meal: "150g tonijn op rijstwafels + avocado" },
      { icon: "🌙", label: "Avondeten", meal: "200g mager rundergehakt + spinazie" },
    ],
    kcal: 1850,
    proteine: 158,
  },
  {
    dag: "Dag 3",
    maaltijden: [
      { icon: "🌅", label: "Ontbijt", meal: "3 eieren + 150g kwark + 1 appel" },
      { icon: "☀️", label: "Lunch", meal: "200g kalkoenfilet + 120g quinoa + salade" },
      { icon: "🌙", label: "Avondeten", meal: "200g kipfilet in kruiden + asperges" },
    ],
    kcal: 1880,
    proteine: 162,
  },
];

export default function KickstartPage() {
  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-12 pb-10 sm:pt-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            {/* Left — copy */}
            <div>
              <Badge>100% Gratis • Direct in je mailbox</Badge>

              <h1 className="mt-5 font-display text-5xl font-extrabold tracking-tight text-brand-text sm:text-6xl">
                Download de
                <br />
                <span className="text-brand-primary">7-Daagse</span>
                <br />
                Kickstart Gids
              </h1>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-black/70 sm:text-lg">
                Geen crashdieet. Geen portieweegschaal. Gewoon{" "}
                <strong>7 dagen simpel eten</strong> dat je vetverbranding op gang brengt
                terwijl je spieren behoudt — zelfs als je een druk leven hebt.
              </p>

              {/* Social proof */}
              <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-black/5 bg-white px-5 py-3 shadow-soft">
                <div className="flex -space-x-2">
                  {["👨", "👨", "👨", "👨"].map((emoji, i) => (
                    <span
                      key={i}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-sm ring-2 ring-white"
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
                <p className="text-sm font-semibold text-black/80">
                  <span className="text-brand-primary">200+</span> mannen gingen jou voor
                </p>
              </div>

              {/* Benefits list */}
              <ul className="mt-7 space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b.text} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-xs">
                      {b.emoji}
                    </span>
                    <span className="text-sm font-medium text-black/80">{b.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — form */}
            <div className="lg:sticky lg:top-24">
              <KickstartForm />
            </div>
          </div>
        </Container>
      </section>

      {/* ── Meal Preview ─────────────────────────────────────────────────── */}
      <section className="py-14 bg-white border-y border-black/5">
        <Container>
          <SectionTitle
            eyebrow="Preview"
            title="Wat zit er in de gids?"
            subtitle="Hier is een voorproefje van de eerste 3 dagen. Elke dag is volledig uitgewerkt met macro's en bereidingstips."
          />

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MEAL_PREVIEW.map((dag) => (
              <div
                key={dag.dag}
                className="rounded-3xl border border-black/5 bg-brand-bg p-6 shadow-soft"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-display text-sm font-extrabold text-brand-primary uppercase tracking-widest">
                    {dag.dag}
                  </span>
                  <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                    {dag.kcal} kcal
                  </span>
                </div>

                <ul className="space-y-2.5 mb-4">
                  {dag.maaltijden.map((m) => (
                    <li key={m.label} className="flex gap-2.5 text-sm">
                      <span className="shrink-0 text-base">{m.icon}</span>
                      <span className="text-black/70">
                        <strong className="text-black/90">{m.label}:</strong> {m.meal}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="rounded-2xl bg-white px-4 py-2.5 text-center">
                  <span className="text-xs font-semibold text-black/50">
                    💪 {dag.proteine}g proteïne
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-black/50">
            + 4 meer dagen, boodschappenlijst, en pro tips in de volledige gids.
          </p>
        </Container>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-2xl rounded-3xl bg-brand-primary px-8 py-12 text-center shadow-brand">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              Klaar om te starten?
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl">
              7 dagen. Simpel plan.
              <br />
              Resultaten die blijven.
            </h2>
            <p className="mt-4 text-white/80 leading-relaxed">
              Download nu gratis en begin morgen al.
            </p>
            <a
              href="#ks-voornaam"
              className="mt-6 inline-block rounded-2xl bg-white px-7 py-3.5 text-sm font-semibold text-brand-primary shadow-soft transition hover:opacity-95"
            >
              Stuur mij de gids →
            </a>
          </div>
        </Container>
      </section>
    </main>
  );
}
