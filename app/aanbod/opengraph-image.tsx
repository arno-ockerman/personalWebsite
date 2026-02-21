import { createOgImage } from "@/lib/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return createOgImage({
    title: "Aanbod",
    subtitle: "1-op-1 coaching • 21-dagen challenge • Herbalife • Business.",
  });
}

