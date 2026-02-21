import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Neem contact op met Arno. Vertel waar je hulp bij nodig hebt en krijg snel een concreet antwoord.",
};

export default function ContactPage() {
  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-accent">Contact</p>
            <h1 className="mt-4 font-display text-5xl tracking-tight text-brand-text sm:text-6xl">
              Vertel me je doel.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-black/70 sm:text-lg">
              Vul dit kort in. Ik reageer met een concreet startadvies (en als het matcht: een plan voor de komende 7
              dagen).
            </p>
            <div className="mt-7 rounded-3xl border border-black/5 bg-white p-6 shadow-soft">
              <p className="text-sm font-semibold text-black/80">Tip</p>
              <p className="mt-2 text-sm text-black/70">
                Hoe duidelijker je doel, hoe scherper mijn antwoord. Denk aan: gewicht, deadline, trainingservaring en
                je grootste struggle.
              </p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </Container>
    </main>
  );
}
