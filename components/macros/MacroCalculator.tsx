"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";

type Step = 1 | 2 | 3 | 4;
type Goal = "afvallen" | "spiermassa" | "onderhoud";
type Geslacht = "man" | "vrouw";
type Activiteitsniveau = "sedentair" | "licht" | "matig" | "actief" | "zeer_actief";

type StatsForm = {
  geslacht: Geslacht;
  leeftijd: string;
  gewicht: string;
  lengte: string;
  activiteitsniveau: Activiteitsniveau;
};

type ParsedStats = {
  geslacht: Geslacht;
  leeftijd: number;
  gewicht: number;
  lengte: number;
  activiteitsniveau: Activiteitsniveau;
};

type MacroResults = {
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

const goalOptions: { value: Goal; label: string; sub: string }[] = [
  { value: "afvallen", label: "Afvallen", sub: "Vet verbranden, strakker worden" },
  { value: "spiermassa", label: "Spiermassa", sub: "Meer eiwitten, groeien en sterker worden" },
  { value: "onderhoud", label: "Onderhoud", sub: "In balans blijven, consistentie" },
];

const activityOptions: { value: Activiteitsniveau; label: string; multiplier: number }[] = [
  { value: "sedentair", label: "Zittend (weinig/geen sport)", multiplier: 1.2 },
  { value: "licht", label: "Licht actief (1-3x/week)", multiplier: 1.375 },
  { value: "matig", label: "Matig actief (3-5x/week)", multiplier: 1.55 },
  { value: "actief", label: "Actief (6-7x/week)", multiplier: 1.725 },
  { value: "zeer_actief", label: "Zeer actief (zwaar werk + dagelijks sporten)", multiplier: 1.9 },
];

const macroSplit: Record<Goal, { protein: number; carbs: number; fat: number }> = {
  afvallen: { protein: 35, carbs: 35, fat: 30 },
  spiermassa: { protein: 30, carbs: 45, fat: 25 },
  onderhoud: { protein: 30, carbs: 40, fat: 30 },
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseNumber(value: string) {
  return Number(value.replace(",", "."));
}

function calculateMacros(stats: ParsedStats, goal: Goal): MacroResults {
  const activityMultiplier = activityOptions.find((o) => o.value === stats.activiteitsniveau)?.multiplier ?? 1.2;
  const bmr =
    stats.geslacht === "man"
      ? 10 * stats.gewicht + 6.25 * stats.lengte - 5 * stats.leeftijd + 5
      : 10 * stats.gewicht + 6.25 * stats.lengte - 5 * stats.leeftijd - 161;

  const tdee = bmr * activityMultiplier;
  const adjustedKcal =
    goal === "afvallen" ? tdee - 300 : goal === "spiermassa" ? tdee + 250 : tdee;

  const split = macroSplit[goal];
  const kcal = Math.round(adjustedKcal);
  const protein_g = Math.round(((kcal * split.protein) / 100) / 4);
  const carbs_g = Math.round(((kcal * split.carbs) / 100) / 4);
  const fat_g = Math.round(((kcal * split.fat) / 100) / 9);

  return { kcal, protein_g, carbs_g, fat_g };
}

export function MacroCalculator() {
  const [step, setStep] = useState<Step>(1);
  const [goal, setGoal] = useState<Goal>("afvallen");
  const [stats, setStats] = useState<StatsForm>({
    geslacht: "man",
    leeftijd: "30",
    gewicht: "85",
    lengte: "180",
    activiteitsniveau: "matig",
  });
  const [parsedStats, setParsedStats] = useState<ParsedStats | null>(null);
  const [results, setResults] = useState<MacroResults | null>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const progress = useMemo(() => {
    const labels = ["Doel", "Gegevens", "Resultaat", "Email"] as const;
    return labels.map((label, idx) => ({
      label,
      idx: (idx + 1) as Step,
      done: idx + 1 < step,
      active: idx + 1 === step,
    }));
  }, [step]);

  const split = macroSplit[goal];
  const emailError = email.trim().length > 0 && !isValidEmail(email.trim().toLowerCase());

  function goToStep3() {
    setError(null);
    const leeftijd = parseNumber(stats.leeftijd);
    const gewicht = parseNumber(stats.gewicht);
    const lengte = parseNumber(stats.lengte);

    if (!Number.isFinite(leeftijd) || leeftijd < 16 || leeftijd > 80) {
      return setError("Leeftijd moet tussen 16 en 80 jaar liggen.");
    }
    if (!Number.isFinite(gewicht) || gewicht < 40 || gewicht > 200) {
      return setError("Gewicht moet tussen 40 en 200 kg liggen.");
    }
    if (!Number.isFinite(lengte) || lengte < 140 || lengte > 220) {
      return setError("Lengte moet tussen 140 en 220 cm liggen.");
    }

    const cleanStats: ParsedStats = {
      geslacht: stats.geslacht,
      leeftijd,
      gewicht,
      lengte,
      activiteitsniveau: stats.activiteitsniveau,
    };

    setParsedStats(cleanStats);
    setResults(calculateMacros(cleanStats, goal));
    setStep(3);
  }

  async function submitLead() {
    setError(null);
    if (!parsedStats || !results) return setError("Bereken eerst je macro's.");
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) return setError("Vul een geldig e-mailadres in.");
    if (!consent) return setError("Je moet akkoord gaan met de verwerking van je gegevens.");

    setLoading(true);
    try {
      const res = await fetch("/api/macros/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          consent,
          goal,
          stats: parsedStats,
          results,
        }),
      });

      const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Opslaan mislukt. Probeer opnieuw.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <ol className="flex flex-wrap gap-2" aria-label="Voortgang">
        {progress.map((p) => (
          <li
            key={p.label}
            className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
              p.active
                ? "border-brand-primary/20 bg-brand-primary/5 text-brand-primary"
                : p.done
                  ? "border-black/5 bg-brand-bg text-black/70"
                  : "border-black/5 bg-white text-black/50"
            }`}
          >
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                p.active ? "bg-brand-primary text-brand-bg" : p.done ? "bg-brand-accent text-brand-bg" : "bg-black/10"
              }`}
            >
              {p.idx}
            </span>
            {p.label}
          </li>
        ))}
      </ol>

      {error ? (
        <div className="mt-4 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4 text-sm text-brand-primary">
          {error}
        </div>
      ) : null}

      <div className="mt-6">
        {step === 1 ? (
          <div className="animate-[fadeIn_200ms_ease-out]">
            <h2 className="font-serif text-2xl text-brand-text">1) Wat is je doel?</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {goalOptions.map((o) => {
                const active = goal === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setGoal(o.value)}
                    className={`rounded-3xl border p-4 text-left shadow-soft transition ${
                      active ? "border-brand-primary/30 bg-brand-primary/5" : "border-black/5 bg-white hover:bg-black/5"
                    }`}
                  >
                    <p className="font-display text-2xl text-brand-primary">{o.label}</p>
                    <p className="mt-1 text-sm text-black/70">{o.sub}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-black/50">100% gratis • Geen spam</span>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-bg shadow-brand transition hover:opacity-95"
                onClick={() => setStep(2)}
              >
                Verder
              </button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="animate-[fadeIn_200ms_ease-out]">
            <h2 className="font-serif text-2xl text-brand-text">2) Jouw gegevens</h2>
            <div className="mt-5 grid gap-5">
              <div className="rounded-3xl border border-black/5 bg-brand-bg p-5">
                <p className="text-sm font-semibold text-black/80">Geslacht</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(["man", "vrouw"] as const).map((g) => {
                    const active = stats.geslacht === g;
                    return (
                      <label
                        key={g}
                        className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                          active ? "border-brand-primary/30 bg-white text-brand-primary" : "border-black/5 bg-white/60"
                        }`}
                      >
                        <input
                          type="radio"
                          name="geslacht"
                          value={g}
                          checked={active}
                          onChange={() => setStats((curr) => ({ ...curr, geslacht: g }))}
                        />
                        {g === "man" ? "Man" : "Vrouw"}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-black/80">Leeftijd</span>
                  <input
                    type="number"
                    min={16}
                    max={80}
                    value={stats.leeftijd}
                    onChange={(e) => setStats((curr) => ({ ...curr, leeftijd: e.target.value }))}
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-soft outline-none focus:border-brand-primary/30 focus:ring-2 focus:ring-brand-primary/20"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-black/80">Gewicht (kg)</span>
                  <input
                    type="number"
                    min={40}
                    max={200}
                    value={stats.gewicht}
                    onChange={(e) => setStats((curr) => ({ ...curr, gewicht: e.target.value }))}
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-soft outline-none focus:border-brand-primary/30 focus:ring-2 focus:ring-brand-primary/20"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-black/80">Lengte (cm)</span>
                  <input
                    type="number"
                    min={140}
                    max={220}
                    value={stats.lengte}
                    onChange={(e) => setStats((curr) => ({ ...curr, lengte: e.target.value }))}
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-soft outline-none focus:border-brand-primary/30 focus:ring-2 focus:ring-brand-primary/20"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-black/80">Activiteitsniveau</span>
                  <select
                    value={stats.activiteitsniveau}
                    onChange={(e) =>
                      setStats((curr) => ({ ...curr, activiteitsniveau: e.target.value as Activiteitsniveau }))
                    }
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-soft outline-none focus:border-brand-primary/30 focus:ring-2 focus:ring-brand-primary/20"
                  >
                    {activityOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                className="rounded-2xl px-3 py-2 text-sm font-semibold text-black/70 hover:bg-black/5"
                onClick={() => setStep(1)}
              >
                Terug
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-bg shadow-brand transition hover:opacity-95"
                onClick={goToStep3}
              >
                Bereken mijn macro&apos;s
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 && results ? (
          <div className="animate-[fadeIn_200ms_ease-out]">
            <h2 className="font-serif text-2xl text-brand-text">3) Jouw resultaten</h2>
            <p className="mt-2 text-sm text-black/70">Dagelijkse richtlijn op basis van Mifflin-St Jeor.</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-black/5 bg-brand-bg p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Calorieën</p>
                <p className="mt-2 font-display text-4xl text-brand-primary">{results.kcal} kcal</p>
              </div>
              <div className="rounded-3xl border border-black/5 bg-brand-bg p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Eiwitten</p>
                <p className="mt-2 font-display text-4xl text-brand-primary">{results.protein_g} g</p>
              </div>
              <div className="rounded-3xl border border-black/5 bg-brand-bg p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Koolhydraten</p>
                <p className="mt-2 font-display text-4xl text-brand-primary">{results.carbs_g} g</p>
              </div>
              <div className="rounded-3xl border border-black/5 bg-brand-bg p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Vetten</p>
                <p className="mt-2 font-display text-4xl text-brand-primary">{results.fat_g} g</p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-black/5 bg-white p-5 shadow-soft">
              <p className="text-sm font-semibold text-black/80">Macroverdeling</p>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-black/80">Eiwitten</span>
                    <span className="text-black/60">{split.protein}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/5">
                    <div className="h-2 rounded-full bg-brand-primary" style={{ width: `${split.protein}%` }} />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-black/80">Koolhydraten</span>
                    <span className="text-black/60">{split.carbs}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/5">
                    <div className="h-2 rounded-full bg-brand-accent" style={{ width: `${split.carbs}%` }} />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-semibold text-black/80">Vetten</span>
                    <span className="text-black/60">{split.fat}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/5">
                    <div className="h-2 rounded-full bg-amber-500" style={{ width: `${split.fat}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                className="rounded-2xl px-3 py-2 text-sm font-semibold text-black/70 hover:bg-black/5"
                onClick={() => setStep(2)}
              >
                Terug
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-bg shadow-brand transition hover:opacity-95"
                onClick={() => setStep(4)}
              >
                Ontvang mijn macro plan
              </button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="animate-[fadeIn_200ms_ease-out]">
            <h2 className="font-serif text-2xl text-brand-text">4) Ontvang je macro plan</h2>
            <p className="mt-2 text-sm text-black/70">Laat je email achter en ontvang je resultaten + volgende stap.</p>

            {!success ? (
              <>
                <div className="mt-5 grid gap-3">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-black/80">Email</span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="jij@voorbeeld.com"
                      className={`rounded-2xl border bg-white px-4 py-3 text-sm shadow-soft outline-none focus:ring-2 ${
                        emailError
                          ? "border-brand-primary/50 focus:border-brand-primary/50 focus:ring-brand-primary/20"
                          : "border-black/10 focus:border-brand-primary/30 focus:ring-brand-primary/20"
                      }`}
                    />
                    {emailError ? <span className="text-xs font-semibold text-brand-primary">Vul een geldig e-mailadres in.</span> : null}
                  </label>

                  <label className="flex items-start gap-3 rounded-2xl border border-black/5 bg-brand-bg p-4 text-sm text-black/70">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1"
                    />
                    <span>Ik ga akkoord met de verwerking van mijn gegevens.</span>
                  </label>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="rounded-2xl px-3 py-2 text-sm font-semibold text-black/70 hover:bg-black/5"
                    onClick={() => setStep(3)}
                    disabled={loading}
                  >
                    Terug
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-bg shadow-brand transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={submitLead}
                    disabled={loading}
                  >
                    {loading ? "Bezig met opslaan..." : "Verstuur mijn plan"}
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-5 rounded-3xl border border-brand-accent/20 bg-brand-accent/5 p-5">
                <p className="text-base font-semibold text-brand-accent">Gelukt. Je macro plan is opgeslagen.</p>
                <p className="mt-2 text-sm text-black/70">
                  Klaar voor de volgende stap? Genereer ook je persoonlijke weekmenu.
                </p>
                <div className="mt-4">
                  <Button href="/mealplanner">Ga naar weekmenu</Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
