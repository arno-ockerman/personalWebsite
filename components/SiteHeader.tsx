"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Container } from "@/components/Container";

const links = [
  { href: "/", label: "Home" },
  { href: "/mijn-verhaal", label: "Mijn verhaal" },
  { href: "/aanbod", label: "Aanbod" },
  { href: "/transformaties", label: "Transformaties" },
  { href: "/mealplanner", label: "Weekmenu" },
  { href: "/macros", label: "Macros" },
  { href: "/kickstart", label: "Kickstart Gids" },
  { href: "/contact", label: "Contact" },
];

/** Links with a special "gratis" highlight badge in the desktop nav */
const FREE_HREFS = new Set(["/kickstart"]);

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const activeHref = useMemo(() => {
    if (!pathname) return "/";
    if (pathname.startsWith("/mijn-verhaal")) return "/mijn-verhaal";
    if (pathname.startsWith("/aanbod")) return "/aanbod";
    if (pathname.startsWith("/transformaties")) return "/transformaties";
    if (pathname.startsWith("/mealplanner")) return "/mealplanner";
    if (pathname.startsWith("/macros")) return "/macros";
    if (pathname.startsWith("/kickstart")) return "/kickstart";
    if (pathname.startsWith("/contact")) return "/contact";
    return "/";
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-brand-bg/90 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="font-display text-lg font-extrabold tracking-[0.12em] text-brand-primary"
            aria-label="Be Inspired By Us"
          >
            BEINSPIRED
          </Link>

          <nav className="hidden items-center gap-7 sm:flex" aria-label="Primary">
            {links.map((l) => {
              const active = l.href === activeHref;
              const isFree = FREE_HREFS.has(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative text-sm font-semibold transition ${
                    active ? "text-brand-primary" : "text-black/70 hover:text-black"
                  }`}
                >
                  {l.label}
                  {isFree && (
                    <span className="ml-1.5 rounded-full bg-brand-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                      gratis
                    </span>
                  )}
                </Link>
              );
            })}
            <Link
              href="/contact"
              className="rounded-2xl bg-brand-primary px-4 py-2 text-sm font-semibold text-brand-bg shadow-brand transition hover:opacity-95"
            >
              Start hier
            </Link>
          </nav>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black/80 shadow-soft sm:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            Menu
          </button>
        </div>
      </Container>

      {open ? (
        <div id="mobile-nav" className="border-t border-black/5 bg-brand-bg sm:hidden">
          <Container>
            <nav className="flex flex-col gap-2 py-4" aria-label="Mobile">
              {links.map((l) => {
                const active = l.href === activeHref;
                const isFree = FREE_HREFS.has(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-brand-primary/5 text-brand-primary"
                        : "text-black/70 hover:bg-black/5 hover:text-black"
                    }`}
                  >
                    {l.label}
                    {isFree && (
                      <span className="rounded-full bg-brand-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                        gratis
                      </span>
                    )}
                  </Link>
                );
              })}
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-2xl bg-brand-primary px-4 py-3 text-center text-sm font-semibold text-brand-bg shadow-brand transition hover:opacity-95"
              >
                Start je transformatie
              </Link>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
