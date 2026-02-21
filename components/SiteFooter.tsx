import Link from "next/link";
import { Container } from "@/components/Container";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white">
      <Container>
        <div className="flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-black/80">Arno Ockerman</p>
            <p className="mt-1 text-xs text-black/60">Be Inspired By Us — Make it happen.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-black/70">
            <Link className="hover:text-black" href="/mijn-verhaal">
              Mijn verhaal
            </Link>
            <Link className="hover:text-black" href="/contact">
              Contact
            </Link>
            <a className="hover:text-black" href="https://www.instagram.com/" target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

