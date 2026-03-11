import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { ServiceCard } from "@/components/ServiceCard";

export const metadata: Metadata = {
  title: "Coaching & Voeding Aanbod | Lifestyle Coaching Online België",
  description:
    "Lifestyle coaching, 21-dagen challenge en voedingsbegeleiding. Afvallen, spiermassa opbouwen of meer energie? Start vandaag met Arno Ockerman.",
  alternates: {
    canonical: "https://arnoockerman.vercel.app/aanbod",
  },
  openGraph: {
    title: "Coaching & Voeding Aanbod | Lifestyle Coaching Online België",
    description:
      "Lifestyle coaching, 21-dagen challenge en voedingsbegeleiding. Afvallen, spiermassa opbouwen of meer energie?",
    url: "https://arnoockerman.vercel.app/aanbod",
  },
};

export default function AanbodPage() {
  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <SectionTitle
              eyebrow="Aanbod"
              title={<span className="font-serif">Kies je startpunt.</span>}
              subtitle="Je hoeft niet meteen alles perfect te doen. Kies wat bij je past en we maken het concreet."
            />
            <div className="mt-7 rounded-3xl border border-black/5 bg-white p-6 shadow-soft">
              <p className="text-sm font-semibold text-black/80">Twijfel?</p>
              <p className="mt-2 text-sm text-black/70">
                Stuur me je doel. Ik zeg je eerlijk wat de snelste route is — en wat je best laat liggen.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:col-span-7">
            <ServiceCard
              title="Begeleiding"
              description="Persoonlijke begeleiding met duidelijke afspraken, check-ins en een plan dat je volhoudt."
              highlights={[
                "Intake + doelbepaling",
                "Training & voeding structuur",
                "Wekelijkse bijsturing en accountability",
              ]}
              priceHint={
                <span>
                  Prijs hangt af van je traject (duur + intensiteit). Vraag je voorstel via{" "}
                  <span className="font-semibold text-black/80">contact</span>.
                </span>
              }
              ctaHref="/contact"
              ctaLabel="Vraag mijn voorstel"
            />

            <ServiceCard
              title="21-Dagen Challenge"
              description="Kickstart programma voor structuur, energie en momentum — samen met de community."
              highlights={["Dagelijkse structuur", "Community support", "Focus op consistentie"]}
              priceHint={<span>Perfect als je snel wil starten met een duidelijk kader.</span>}
              ctaHref="https://www.we-makeithappen.com/coach/ZUdkhMQZeCN1mT11mu1XxGntxXS2"
              ctaLabel="Bekijk de challenge"
            />

            <ServiceCard
              title="Herbalife Producten"
              description="Supplementen en shakes als handige ondersteuning — altijd in functie van je doel."
              highlights={["Eenvoudig inzetten", "Praktisch voor drukke dagen", "Afgestemd op jouw routine"]}
              priceHint={<span>Geen verkooppraat: je krijgt advies op maat en alleen wat je echt nodig hebt.</span>}
              ctaHref="/contact"
              ctaLabel="Vraag advies"
            />

            <ServiceCard
              title="Business Opportunity"
              description="Voor ambitieuze mensen die ook willen bouwen aan een extra inkomen en impact."
              highlights={["Mentorship", "Training & systemen", "Community + events"]}
              priceHint={<span>Je hoeft geen ervaring te hebben. Wel goesting om te groeien.</span>}
              ctaHref="/contact"
              ctaLabel="Plan een gesprek"
            />
          </div>
        </div>
      </Container>
    </main>
  );
}

