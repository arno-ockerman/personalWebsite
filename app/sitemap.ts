import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://beinspiredbyus.be/", lastModified: new Date() },
    { url: "https://beinspiredbyus.be/mijn-verhaal", lastModified: new Date() },
    { url: "https://beinspiredbyus.be/contact", lastModified: new Date() },
  ];
}

