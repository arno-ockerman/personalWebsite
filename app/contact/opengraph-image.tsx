import { createOgImage } from "@/lib/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return createOgImage({
    title: "Contact",
    subtitle: "Vertel me je doel. Ik reageer met concreet startadvies.",
  });
}

