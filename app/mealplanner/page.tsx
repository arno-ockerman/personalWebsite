import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Badge } from "@/components/Badge";
import { MealPlannerFlow } from "@/components/mealplanner/MealPlannerFlow";

export const metadata: Metadata = {
  title: "Weekmenu Generator | Make It Happen",
  description:
    "Genereer in 2 minuten een persoonlijk weekmenu met boodschappenlijst. Inclusief Herbalife-recepten. Gratis download als PDF na email.",
  openGraph: {
    title: "Gratis Weekmenu Generator — Make It Happen",
    description: "Persoonlijk weekmenu + boodschappenlijst (PDF). Gratis, geen spam.",
    url: "https://beinspiredbyus.be/mealplanner",
  },
};

const testimonials = [
  {
    quote: "In 2 minuten een volledige week gepland. Eindelijk structuur in mijn eetpatroon!",
    name: "Sarah V.",
    context: "Doel: Afvallen",
  },
  {
    quote: "De Herbalife shakes passen perfect in mijn dagelijkse routine. Super makkelijk!",
    name: "Thomas K.",
    context: "Doel: Spieropbouw",
  },
  {
    quote: "Boodschappenlijst was een gamechanger. Nooit meer nadenken in de winkel.",
    name: "Lien D.",
    context: "Doel: Onderhoud",
  },
];

export default function MealPlannerPage() {
  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* ── Left panel ───────────────────────────────────────── */}
          <div className="lg:col-span-5">
            <Badge>100% gratis • 2 minuten</Badge>
            <h1 className="mt-5 font-display text-5xl tracking-tight text-brand-text sm:text-6xl">
              Jouw persoonlijk weekmenu.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-black/70 sm:text-lg">
              Kies je doel, geef je voorkeuren door en ontvang een concreet menu (Ma–Zo) met boodschappenlijst.
              Download als PDF — inclusief Herbalife-recepten op maat.
            </p>

            {/* Stats grid */}
            <div className="mt-7 grid max-w-xl grid-cols-2 gap-3 rounded-3xl border border-black/5 bg-white p-5 shadow-soft">
              {[
                { k: "500+", v: "mealplannen gegenereerd" },
                { k: "7",    v: "dagen structuur" },
                { k: "PDF",  v: "direct download" },
                { k: "0€",   v: "volledig gratis" },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl bg-brand-bg p-4">
                  <p className="font-display text-3xl font-extrabold text-brand-primary">{s.k}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-black/60">{s.v}</p>
                </div>
              ))}
            </div>

            {/* What you get */}
            <div className="mt-6 rounded-3xl border border-brand-light bg-brand-light/25 p-5">
              <p className="text-sm font-semibold text-black/80">Wat je krijgt</p>
              <ul className="mt-3 space-y-2 text-sm text-black/70">
                <li>• Weekmenu (Ma–Zo) op basis van je doel</li>
                <li>• Macros per dag + weektotaal</li>
                <li>• Boodschappenlijst (geaggregeerd)</li>
                <li>• 🌿 Herbalife-recepten geïntegreerd in je plan</li>
                <li>• Branded PDF export (3 pagina&apos;s)</li>
              </ul>
              <p className="mt-4 text-xs text-black/60">
                Disclaimer: dit is een template-voorstel. Pas porties aan op jouw energieverbruik en medische situatie.
              </p>
            </div>

            {/* Herbalife note */}
            <div className="mt-5 flex items-start gap-3 rounded-3xl border border-brand-primary/10 bg-brand-primary/5 p-4">
              <span className="text-2xl">🌿</span>
              <div>
                <p className="text-sm font-semibold text-brand-primary">Powered by Herbalife Nutrition</p>
                <p className="mt-1 text-xs text-black/60">
                  Je plan bevat 1–2 Herbalife-recepten als handige, smakelijke optie. Niet verplicht — altijd een
                  gewoon alternatief beschikbaar.
                </p>
              </div>
            </div>

            {/* Testimonials */}
            <div className="mt-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-black/50">
                Wat anderen zeggen
              </p>
              <div className="grid gap-3">
                {testimonials.map((t) => (
                  <div
                    key={t.name}
                    className="rounded-2xl border border-black/5 bg-white p-4 shadow-soft"
                  >
                    <p className="text-sm text-black/70">&ldquo;{t.quote}&rdquo;</p>
                    <p className="mt-2 text-xs font-semibold text-black/50">
                      {t.name} — {t.context}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right panel: flow ─────────────────────────────────── */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-soft sm:p-7">
              <MealPlannerFlow />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
