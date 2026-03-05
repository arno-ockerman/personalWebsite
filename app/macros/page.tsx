import type { Metadata } from "next";
import { Badge } from "@/components/Badge";
import { Container } from "@/components/Container";
import { MacroCalculator } from "@/components/macros/MacroCalculator";

export const metadata: Metadata = {
  title: "Macro Calculator",
  description: "Bereken jouw dagelijkse calorieën en macro's op basis van je doel, lichaamsdata en activiteit.",
  openGraph: {
    title: "Macro Calculator",
    description: "Bereken jouw dagelijkse calorieën & macros in een paar minuten.",
    url: "https://beinspiredbyus.be/macros",
  },
};

export default function MacrosPage() {
  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <Badge>100% gratis • 5 minuten</Badge>
            <h1 className="mt-5 font-display text-5xl tracking-tight text-brand-text sm:text-6xl">
              Bereken jouw macro&apos;s.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-black/70 sm:text-lg">
              Krijg direct een persoonlijk calorie- en macrodoel op basis van je lichaam, activiteit en ambitie. Gericht
              op mannen die resultaat willen.
            </p>

            <div className="mt-7 grid max-w-xl grid-cols-2 gap-3 rounded-3xl border border-black/5 bg-white p-5 shadow-soft">
              {[
                { k: "Mifflin-St Jeor", v: "bewezen formule" },
                { k: "5 minuten", v: "snel ingevuld" },
                { k: "Gratis", v: "zonder kosten" },
                { k: "Gepersonaliseerd", v: "afgestemd op jou" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl bg-brand-bg p-4">
                  <p className="font-display text-3xl font-extrabold text-brand-primary">{s.k}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-black/60">{s.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-brand-light bg-brand-light/25 p-5">
              <p className="text-sm font-semibold text-black/80">Wat je krijgt</p>
              <ul className="mt-3 space-y-2 text-sm text-black/70">
                <li>• Dagelijks calorie-doel op maat</li>
                <li>• Eiwitten, koolhydraten en vetten in gram</li>
                <li>• Heldere macroverdeling per doel</li>
              </ul>
              <p className="mt-4 text-xs text-black/60">
                Disclaimer: deze tool geeft een richtlijn. Stem je voeding af op je gezondheid, herstel en medisch advies.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-soft sm:p-7">
              <MacroCalculator />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
