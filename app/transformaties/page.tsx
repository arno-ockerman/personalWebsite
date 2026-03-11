import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { TransformationCard } from "@/components/TransformationCard";
import { TestimonialCard } from "@/components/TestimonialCard";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Transformaties & Resultaten | Fitness Coach Arno Ockerman",
  description:
    "Bekijk echte voor/na transformaties. Mannen die structuur pakten en resultaat boekten met coaching van Arno Ockerman.",
  alternates: {
    canonical: "https://arnoockerman.vercel.app/transformaties",
  },
  openGraph: {
    title: "Transformaties & Resultaten | Fitness Coach Arno Ockerman",
    description:
      "Bekijk echte voor/na transformaties. Mannen die structuur pakten en resultaat boekten met coaching van Arno Ockerman.",
    url: "https://arnoockerman.vercel.app/transformaties",
  },
};

const transformations = [
  { name: "Tom", result: "-6 kg • meer energie" },
  { name: "Yannick", result: "+kracht • strakkere look" },
  { name: "Kevin", result: "-4 kg • routine terug" },
  { name: "Sven", result: "-8 kg • focus & structuur" },
  { name: "Niels", result: "consistent trainen" },
  { name: "Bram", result: "meer discipline" },
];

const testimonials = [
  {
    name: "Tom, 32",
    result: "-6 kg",
    quote: "Ik had eindelijk structuur. Geen crash-dieet, wel stappen die ik kon volhouden naast mijn job.",
  },
  { name: "Yannick, 27", result: "meer energie", quote: "3 weken later: meer energie, betere focus en ik bleef consistent trainen." },
  { name: "Kevin, 38", result: "routine", quote: "Arno houdt het simpel. Dat was exact wat ik nodig had om weer vooruit te gaan." },
];

export default function TransformatiesPage() {
  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <SectionTitle
              eyebrow="Transformaties"
              title={<span className="font-serif">Voor/na. Geen excuses.</span>}
              subtitle="Resultaat komt van basics + consistentie + begeleiding. Hieronder zie je voorbeelden en korte quotes uit de community."
            />
            <div className="mt-7 rounded-3xl border border-black/5 bg-gradient-to-br from-white via-brand-bg to-brand-light/40 p-6 shadow-soft">
              <p className="text-sm font-semibold text-black/80">Dit kan jij ook.</p>
              <p className="mt-2 text-sm text-black/70">
                Vertel me je doel en je huidige situatie. Ik geef je een concreet plan voor de komende 7 dagen.
              </p>
              <Button href="/contact" className="mt-5 w-full">
                Start hier
              </Button>
              <Button
                href="https://www.we-makeithappen.com/coach/ZUdkhMQZeCN1mT11mu1XxGntxXS2"
                variant="secondary"
                className="mt-3 w-full"
              >
                Doe de 21-dagen challenge
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              {transformations.map((t) => (
                <TransformationCard key={`${t.name}-${t.result}`} name={t.name} result={t.result} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 sm:mt-18">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <SectionTitle
                eyebrow="Testimonials"
                title={<span className="font-serif">Korte woorden. Duidelijk resultaat.</span>}
                subtitle="We houden het simpel. Structuur werkt — en dat voel je."
              />
            </div>
            <div className="grid gap-4 lg:col-span-7 sm:grid-cols-3">
              {testimonials.map((t) => (
                <TestimonialCard key={t.name} name={t.name} result={t.result} quote={t.quote} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

