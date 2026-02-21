import type { Metadata } from "next";
import { Bebas_Neue, Playfair_Display, Red_Hat_Display } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

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
  metadataBase: new URL("https://beinspiredbyus.be"),
  title: {
    default: "Arno Ockerman | Be Inspired By Us",
    template: "%s | Be Inspired By Us",
  },
  description:
    "Personal branding website van Arno Ockerman. Coaching, voeding en mindset voor ambitieuze mannen — met echte begeleiding en duidelijke stappen.",
  openGraph: {
    title: "Arno Ockerman | Be Inspired By Us",
    description:
      "Coaching, voeding en mindset voor ambitieuze mannen. Maak je transformatie concreet met duidelijke stappen.",
    url: "https://beinspiredbyus.be",
    siteName: "Be Inspired By Us",
    locale: "nl_BE",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${bebas.variable} ${playfair.variable} ${redHat.variable}`}>
      <body className="font-body">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
