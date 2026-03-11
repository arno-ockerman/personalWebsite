import type { Metadata } from "next";
import Script from "next/script";
import { Badge } from "@/components/Badge";
import { Container } from "@/components/Container";
import { MacroCalculator } from "@/components/macros/MacroCalculator";

export const metadata: Metadata = {
  title: "Gratis Macro Calculator | Bereken je Calorieën & Macro's",
  description:
    "Bereken gratis jouw dagelijkse calorieën, eiwitten, koolhydraten en vetten. Persoonlijk berekend op basis van jouw lichaam en doel.",
  alternates: {
    canonical: "https://arnoockerman.vercel.app/macros",
  },
  openGraph: {
    title: "Gratis Macro Calculator | Bereken je Calorieën & Macro's",
    description:
      "Bereken gratis jouw dagelijkse calorieën, eiwitten, koolhydraten en vetten. Persoonlijk berekend op basis van jouw lichaam en doel.",
    url: "https://arnoockerman.vercel.app/macros",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Hoeveel calorieën heb ik nodig om af te vallen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Om af te vallen heb je een calorietekort nodig van 300-500 kcal onder je onderhoudsniveau. Gebruik onze gratis macro calculator om je persoonlijke behoefte te berekenen.",
      },
    },
    {
      "@type": "Question",
      name: "Hoeveel eiwit heb ik nodig voor spiermassa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Voor spiermassa opbouwen adviseren we 1.6-2.2 gram eiwit per kilogram lichaamsgewicht. Bij 80kg is dat 128-176 gram eiwit per dag.",
      },
    },
    {
      "@type": "Question",
      name: "Wat zijn macro's?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Macro's (macronutriënten) zijn eiwitten, koolhydraten en vetten. Ze vormen de basis van je voeding en bepalen of je afvalt, spiermassa opbouwt of op gewicht blijft.",
      },
    },
  ],
};

export default function MacrosPage() {
  return (
    <main className="py-10 sm:py-14">
      <Script
        id="schema-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
