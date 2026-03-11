import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mijn verhaal",
  description:
    "Van -18kg naar een sterke routine. Mijn journey met discipline, gezin, werk en Ankylosing Spondylitis — en waarom ik nu anderen help.",
};

export default function MijnVerhaalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
