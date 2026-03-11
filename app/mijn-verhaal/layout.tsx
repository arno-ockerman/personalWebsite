import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mijn Verhaal — Van -18kg naar Fitness Coach | Arno Ockerman",
  description:
    "Van overgewicht naar coaching. Lees het eerlijke verhaal van Arno: -18kg afvallen, spiermassa opbouwen, en anderen helpen ondanks Ankylosing Spondylitis.",
  alternates: {
    canonical: "https://arnoockerman.vercel.app/mijn-verhaal",
  },
  openGraph: {
    title: "Mijn Verhaal — Van -18kg naar Fitness Coach | Arno Ockerman",
    description:
      "Van overgewicht naar coaching. Lees het eerlijke verhaal van Arno: -18kg afvallen, spiermassa opbouwen, en anderen helpen ondanks Ankylosing Spondylitis.",
    url: "https://arnoockerman.vercel.app/mijn-verhaal",
  },
};

export default function MijnVerhaalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
