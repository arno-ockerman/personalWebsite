"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";

/* ─────────────────────────────────────────────
   Animated counter hook
───────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let frame: number;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, start]);
  return value;
}

/* ─────────────────────────────────────────────
   Stats bar
───────────────────────────────────────────── */
const STATS = [
  { value: 50, suffix: "+", label: "Transformaties begeleid" },
  { value: 18, suffix: "kg", label: "Eigen gewichtsverlies" },
  { value: 9, suffix: "kg", label: "Spiermassa opgebouwd" },
  { value: 21, suffix: "-daagse", label: "Challenge methode" },
];

function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-12">
      <Container>
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-black/5 bg-white p-7 shadow-soft sm:p-10 lg:grid-cols-4">
          {STATS.map((s) => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const n = useCountUp(s.value, 1800, visible);
            return (
              <div key={s.label} className="flex flex-col items-center text-center">
                <span className="font-display text-5xl text-brand-primary sm:text-6xl">
                  {n}
                  <span className="text-3xl">{s.suffix}</span>
                </span>
                <span className="mt-2 text-sm font-medium text-black/60">{s.label}</span>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Timeline
───────────────────────────────────────────── */
const TIMELINE = [
  {
    icon: "🔥",
    year: "2018",
    title: "Het startpunt",
    body: "Overgewicht, vermoeidheid, diagnose Ankylosing Spondylitis. Ik wist dat er iets moest veranderen — maar wist nog niet hoe.",
  },
  {
    icon: "⚖️",
    year: "2019–2020",
    title: "-18 kg transformatie",
    body: "Door structuur, eerlijk voedingsplan en slimme training verloor ik 18 kg. Geen crash-dieet, geen extreme regels — gewoon consistentie.",
  },
  {
    icon: "💪",
    year: "2021–2022",
    title: "+9 kg spiermassa",
    body: "Na het vetgewicht kwamen de spieren. Trainen met AS leerde me techniek, progressie en luisteren naar mijn lichaam.",
  },
  {
    icon: "🧭",
    year: "2023",
    title: "Andere mannen helpen",
    body: "Van mijn eigen transformatie naar het coachen van anderen. De 21-Dag Challenge werd de methode die werkt voor drukke mannen.",
  },
  {
    icon: "🚀",
    year: "Nu",
    title: "Fit Men / Make It Happen",
    body: "Community, coaching en het bewijs dat je een gezond leven kunt opbouwen naast werk, gezin en alles er tussenin.",
  },
];

function Timeline() {
  return (
    <section className="mt-16">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-accent">Journey</p>
          <h2 className="mt-3 font-serif text-4xl text-brand-text sm:text-5xl">
            Van herstart naar coaching
          </h2>
          <p className="mt-4 text-base text-black/60">
            Elk groot resultaat begint met een eerlijk startpunt.
          </p>
        </div>

        <div className="relative mt-12">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 h-full w-0.5 bg-brand-primary/20 lg:left-1/2 lg:-translate-x-px" />

          <div className="space-y-10">
            {TIMELINE.map((item, i) => (
              <div
                key={item.year}
                className={`relative flex gap-6 lg:items-center lg:gap-0 ${
                  i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Icon bubble */}
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xl shadow-md lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                  {item.icon}
                </div>

                {/* Card */}
                <div
                  className={`ml-4 flex-1 rounded-3xl border border-black/5 bg-white p-6 shadow-soft lg:ml-0 lg:w-[calc(50%-2.5rem)] ${
                    i % 2 === 0 ? "lg:mr-auto lg:pr-10" : "lg:ml-auto lg:pl-10"
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-widest text-brand-accent">
                    {item.year}
                  </span>
                  <h3 className="mt-1 font-display text-xl text-brand-text">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-black/70">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Photo gallery
───────────────────────────────────────────── */
const PHOTOS = [
  { src: "/images/arno-portfolio-1.jpg", alt: "Arno training 1", gradient: "from-brand-primary/30 to-brand-accent/30" },
  { src: "/images/arno-portfolio-2.jpg", alt: "Arno training 2", gradient: "from-brand-accent/30 to-brand-light/60" },
  { src: "/images/arno-portfolio-3.jpg", alt: "Arno training 3", gradient: "from-brand-light/60 to-brand-primary/20" },
  { src: "/images/arno-portfolio-4.jpg", alt: "Arno coaching 4", gradient: "from-brand-primary/20 to-brand-accent/40" },
  { src: "/images/arno-portfolio-5.jpg", alt: "Arno coaching 5", gradient: "from-brand-accent/40 to-brand-light/50" },
  { src: "/images/arno-portfolio-6.jpg", alt: "Arno coaching 6", gradient: "from-brand-light/50 to-brand-primary/30" },
];

function PhotoGallery() {
  return (
    <section className="mt-16">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-accent">Foto&apos;s</p>
          <h2 className="mt-3 font-serif text-4xl text-brand-text sm:text-5xl">
            Resultaten in beeld
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PHOTOS.map((photo, i) => (
            <div
              key={i}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-black/5 shadow-soft"
            >
              {/* Placeholder gradient — replace img tag with real photo */}
              {/* TODO: Replace with real photo: <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover" /> */}
              <div
                className={`h-full w-full bg-gradient-to-br ${photo.gradient} transition-transform duration-500 group-hover:scale-105`}
              />
              {/* Photo number overlay (remove when real photos are added) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="rounded-2xl bg-white/80 px-4 py-2 text-sm font-semibold text-brand-primary backdrop-blur-sm">
                  📸 Foto {i + 1}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-black/40">
          {/* TODO: Remove note when real photos are placed in /public/images/ */}
          Professionele foto&apos;s komen hier — plaats ze in /public/images/arno-portfolio-1.jpg t/m 6.jpg
        </p>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Philosophy pillars
───────────────────────────────────────────── */
const PILLARS = [
  {
    icon: "📐",
    title: "Structuur",
    body: "Een plan dat werkt op je drukste week. Niet alleen bij ideale omstandigheden. Structuur is de ruggengraat van elk resultaat.",
  },
  {
    icon: "🥗",
    title: "Voeding",
    body: "Geen verboden voedingsmiddelen, wel een helder kader. Eten dat je versterkt, niet uitput — en dat je ook in het weekend kunt volhouden.",
  },
  {
    icon: "🧠",
    title: "Mindset",
    body: "Consistent > perfect. Kleine acties, elke dag. Dat is de mentaliteit die -18 kg mogelijk maakte — en nu anderen helpt hetzelfde te doen.",
  },
];

function Philosophy() {
  return (
    <section className="mt-16">
      <Container>
        <div className="rounded-3xl border border-black/5 bg-white p-8 shadow-soft sm:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-accent">Filosofie</p>
            <h2 className="mt-3 font-serif text-4xl text-brand-text sm:text-5xl">
              De 3 pijlers
            </h2>
            <p className="mt-4 text-base text-black/60">
              Niet één magische formule — wel een systeem dat werkt voor drukke mannen.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className="flex flex-col items-center rounded-3xl border border-brand-primary/10 bg-brand-primary/5 p-7 text-center"
              >
                <span className="text-4xl">{p.icon}</span>
                <h3 className="mt-4 font-display text-2xl text-brand-primary">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-black/70">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────────
   AS story block
───────────────────────────────────────────── */
function ASStory() {
  return (
    <section className="mt-16">
      <Container>
        <div className="grid gap-8 rounded-3xl border border-black/5 bg-brand-primary p-8 shadow-soft sm:p-12 lg:grid-cols-2 lg:items-center">
          {/* Text */}
          <div>
            <Badge>Mijn diagnose</Badge>
            <h2 className="mt-5 font-serif text-4xl text-white sm:text-5xl">
              Trainen mét Ankylosing Spondylitis
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/80">
              AS is een chronische reumatische aandoening die mijn rug en gewrichten treft. Pijn, stijfheid, slechte
              dagen — het hoort erbij. Maar stoppen? Dat was geen optie.
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              Ik leerde om slim te trainen: techniek boven gewicht, mobiliteit even belangrijk als kracht, en luisteren
              naar mijn lichaam. Die aanpak maak ik nu toegankelijk voor iedereen die met beperkingen te maken heeft.
            </p>
            <p className="mt-4 font-semibold text-white">
              Niet perfect. Wel consistent. Elke dag opnieuw.
            </p>
          </div>

          {/* Photo placeholder */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            {/* TODO: Replace with real photo: <img src="/images/arno-as-story.jpg" alt="Arno training met AS" className="h-full w-full object-cover" /> */}
            <div className="h-full w-full bg-gradient-to-br from-white/10 to-white/5" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-2xl bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                📸 Foto placeholder
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CTA
───────────────────────────────────────────── */
function CTA() {
  return (
    <section className="mt-16 mb-4">
      <Container>
        <div className="rounded-3xl border border-black/5 bg-white p-10 text-center shadow-soft sm:p-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-accent">Klaar om te starten?</p>
          <h2 className="mt-4 font-display text-5xl text-brand-text sm:text-6xl">
            Start je transformatie
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-black/60">
            Of je nu 10 kg wilt verliezen of spiermassa wilt opbouwen — ik help je een plan maken dat werkt voor jouw
            leven. Eerlijk, praktisch, en met resultaten die blijven.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button href="/contact">Start gratis intake</Button>
            <Button href="/" variant="ghost">Terug naar home</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Hero
───────────────────────────────────────────── */
function Hero() {
  return (
    <section className="pt-10 sm:pt-14">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Text */}
          <div>
            <Badge>Mijn verhaal</Badge>
            <h1 className="mt-5 font-display text-6xl tracking-tight text-brand-text sm:text-7xl lg:text-8xl">
              Niet perfect.{" "}
              <span className="text-brand-primary">Wel consistent.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-black/70">
              Ik ben Arno Ockerman. Van overgewicht en AS-diagnose naar -18 kg, +9 kg spiermassa en een coaching
              methode die werkt voor drukke mannen — naast gezin, werk en het echte leven.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/contact">Ik wil starten</Button>
              <Button href="#journey" variant="ghost">Lees mijn verhaal</Button>
            </div>
          </div>

          {/* Hero photo */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-black/5 shadow-soft lg:aspect-auto lg:h-[600px]">
            {/* TODO: Replace with real hero photo: <img src="/images/arno-hero.jpg" alt="Arno Ockerman" className="h-full w-full object-cover object-top" /> */}
            <div className="h-full w-full bg-gradient-to-br from-brand-primary/20 via-brand-accent/20 to-brand-light/40" />
            {/* Stats overlay */}
            <div className="absolute bottom-6 left-6 right-6 flex gap-3">
              <div className="flex-1 rounded-2xl bg-white/90 p-4 text-center backdrop-blur-sm">
                <p className="font-display text-3xl text-brand-primary">-18kg</p>
                <p className="text-xs text-black/60">Transformatie</p>
              </div>
              <div className="flex-1 rounded-2xl bg-white/90 p-4 text-center backdrop-blur-sm">
                <p className="font-display text-3xl text-brand-primary">50+</p>
                <p className="text-xs text-black/60">Coachees</p>
              </div>
              <div className="flex-1 rounded-2xl bg-white/90 p-4 text-center backdrop-blur-sm">
                <p className="font-display text-3xl text-brand-primary">21d</p>
                <p className="text-xs text-black/60">Challenge</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function MijnVerhaalPage() {
  return (
    <main>
      <Hero />
      <StatsBar />
      <div id="journey">
        <Timeline />
      </div>
      <ASStory />
      <PhotoGallery />
      <Philosophy />
      <CTA />
    </main>
  );
}
