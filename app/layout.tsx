import type { Metadata } from "next";
import { Bebas_Neue, Playfair_Display, Red_Hat_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: ["400"], variable: "--font-bebas" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
});
const redHat = Red_Hat_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-redhat",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arnoockerman.vercel.app"),
  title: {
    default: "Arno Ockerman | Fitness Coach voor Ambitieuze Mannen — België",
    template: "%s | Arno Ockerman",
  },
  description:
    "Fitness coach voor ambitieuze mannen in België. Afvallen, spiermassa opbouwen en meer energie met persoonlijke begeleiding van Arno Ockerman.",
  keywords: [
    "fitness coach België",
    "fitness coach mannen",
    "afvallen begeleiding",
    "hulp bij afvallen",
    "lifestyle coach online België",
    "spiermassa opbouwen coach",
    "voedingscoach België",
    "afvallen met begeleiding",
    "body transformatie programma",
    
  ],
  alternates: {
    canonical: "https://arnoockerman.vercel.app",
  },
  openGraph: {
    title: "Arno Ockerman | Fitness Coach voor Ambitieuze Mannen — België",
    description:
      "Fitness coach voor ambitieuze mannen in België. Afvallen, spiermassa opbouwen en meer energie met persoonlijke begeleiding.",
    url: "https://arnoockerman.vercel.app",
    siteName: "Arno Ockerman — Fitness Coach",
    locale: "nl_BE",
    type: "website",
  },
  robots: { index: true, follow: true },
};

const GA_ID = "G-RTHBD37PW6";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Arno Ockerman",
    url: "https://arnoockerman.vercel.app",
    jobTitle: "Lifestyle Coach",
    description:
      "Fitness coach voor ambitieuze mannen in België. Specialisatie in afvallen, spiermassa opbouwen en voedingsbegeleiding.",
    sameAs: [
      "https://instagram.com/arnoockerman",
      "https://www.we-makeithappen.com",
      
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Arno Ockerman — Fitness Coach",
    url: "https://arnoockerman.vercel.app",
    description: "Fitness coaching voor ambitieuze mannen in België",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://arnoockerman.vercel.app/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Arno Ockerman Coaching",
    description:
      "Fitness coaching, voedingsbegeleiding en mindset coaching voor mannen",
    areaServed: { "@type": "Country", name: "Belgium" },
    serviceType: ["Lifestyle Coaching", "Voedingsbegeleiding", "Mindset Coaching"],
    url: "https://arnoockerman.vercel.app",
    priceRange: "€€",
    sameAs: ["https://instagram.com/arnoockerman"],
  };

  return (
    <html lang="nl" className={`${bebas.variable} ${playfair.variable} ${redHat.variable}`}>
      <body className="font-body">
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script
          id="ga4"
          strategy="afterInteractive"
        >{`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}</Script>
        <Script
          id="schema-person"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <Script
          id="schema-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script
          id="schema-service"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
        />

        <SiteHeader />
        {children}
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
