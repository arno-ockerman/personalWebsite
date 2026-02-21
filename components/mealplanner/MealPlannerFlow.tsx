"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import type { Allergy, Diet, Goal, MealPlan } from "@/lib/mealplanner/types";

type Step = 1 | 2 | 3 | 4;

const goalOptions: { value: Goal; label: string; sub: string }[] = [
  { value: "weight_loss", label: "Afvallen", sub: "Strakker worden, simpel houden" },
  { value: "muscle", label: "Spieropbouw", sub: "Meer eiwit, stevige maaltijden" },
  { value: "maintenance", label: "Onderhoud", sub: "In balans, consistent blijven" },
];

const allergyOptions: { value: Allergy; label: string }[] = [
  { value: "gluten", label: "Gluten" },
  { value: "lactose", label: "Lactose" },
  { value: "nuts", label: "Noten" },
  { value: "egg", label: "Ei" },
  { value: "soy", label: "Soja" },
  { value: "fish", label: "Vis/schaaldieren" },
];

const dietOptions: { value: Diet; label: string }[] = [
  { value: "none", label: "Geen restrictie" },
  { value: "vegetarian", label: "Vegetarisch" },
  { value: "vegan", label: "Vegan" },
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function base64UrlEncodeUtf8(str: string) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function dayLabel(day: MealPlan["days"][number]["day"]) {
  switch (day) {
    case "Mon":
      return "Ma";
    case "Tue":
      return "Di";
    case "Wed":
      return "Wo";
    case "Thu":
      return "Do";
    case "Fri":
      return "Vr";
    case "Sat":
      return "Za";
    case "Sun":
      return "Zo";
  }
}

function mealTypeLabel(t: MealPlan["days"][number]["meals"][number]["type"]) {
  switch (t) {
    case "breakfast":
      return "Ontbijt";
    case "lunch":
      return "Lunch";
    case "dinner":
      return "Diner";
    case "snack":
      return "Snack";
  }
}

export function MealPlannerFlow() {
  const [step, setStep] = useState<Step>(1);

  const [goal, setGoal] = useState<Goal>("weight_loss");
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [diet, setDiet] = useState<Diet>("none");
  const [mealsPerDay, setMealsPerDay] = useState<3 | 4 | 5>(4);

  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<MealPlan | null>(null);

  const progress = useMemo(() => {
    const labels = ["Doel", "Voorkeuren", "Email", "Resultaat"] as const;
    return labels.map((label, idx) => ({
      label,
      idx: (idx + 1) as Step,
      done: idx + 1 < step,
      active: idx + 1 === step,
    }));
  }, [step]);

  const prefs = useMemo(
    () => ({
      allergies,
      diet,
      mealsPerDay,
    }),
    [allergies, diet, mealsPerDay],
  );

  async function nextFromStep2() {
    setError(null);
    setStep(3);
  }

  async function submitEmail() {
    setError(null);
    const e = email.trim().toLowerCase();
    if (!isValidEmail(e)) return setError("Vul een geldig emailadres in.");
    if (!consent) return setError("Vink aan dat je akkoord gaat.");

    setLoading(true);
    try {
      const [subRes, genRes] = await Promise.all([
        fetch("/api/mealplanner/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: e, consent, goal, preferences: prefs }),
        }),
        fetch("/api/mealplanner/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goal, preferences: prefs, seed: `${e}:${Date.now()}` }),
        }),
      ]);

      const subJson = (await subRes.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!subRes.ok || !subJson?.ok) {
        throw new Error(subJson?.error ?? "Opslaan mislukt. Probeer opnieuw.");
      }

      const genJson = (await genRes.json().catch(() => null)) as { ok?: boolean; plan?: MealPlan; error?: string } | null;
      if (!genRes.ok || !genJson?.ok || !genJson.plan) {
        throw new Error(genJson?.error ?? "Genereren mislukt. Probeer opnieuw.");
      }

      setPlan(genJson.plan);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout.");
    } finally {
      setLoading(false);
    }
  }

  function downloadPdf() {
    if (!plan) return;
    const payload = base64UrlEncodeUtf8(JSON.stringify(plan));
    const url = `/api/mealplanner/pdf?payload=${encodeURIComponent(payload)}`;
    window.open(url, "_blank", "noopener,noreferrer");
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
            <h2 className="font-serif text-2xl text-brand-text">2) Voorkeuren</h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="rounded-3xl border border-black/5 bg-brand-bg p-5">
                <p className="text-sm font-semibold text-black/80">Allergieën</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {allergyOptions.map((a) => {
                    const checked = allergies.includes(a.value);
                    return (
                      <label
                        key={a.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition ${
                          checked ? "border-brand-primary/30 bg-white" : "border-black/5 bg-white/60 hover:bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setAllergies((curr) =>
                              e.target.checked ? [...curr, a.value] : curr.filter((x) => x !== a.value),
                            );
                          }}
                        />
                        {a.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-black/5 bg-brand-bg p-5">
                <p className="text-sm font-semibold text-black/80">Dieet</p>
                <div className="mt-3 grid gap-2">
                  {dietOptions.map((d) => {
                    const active = diet === d.value;
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDiet(d.value)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          active ? "border-brand-primary/30 bg-white text-brand-primary" : "border-black/5 bg-white/60"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-5 text-sm font-semibold text-black/80">Aantal maaltijden per dag</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[3, 4, 5].map((n) => {
                    const active = mealsPerDay === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setMealsPerDay(n as 3 | 4 | 5)}
                        className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                          active ? "border-brand-primary/30 bg-white text-brand-primary" : "border-black/5 bg-white/60"
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
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
                onClick={nextFromStep2}
              >
                Verder
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="animate-[fadeIn_200ms_ease-out]">
            <h2 className="font-serif text-2xl text-brand-text">3) Email om je PDF te ontvangen</h2>
            <p className="mt-2 text-sm text-black/70">
              Vul je email in om je persoonlijk weekmenu te ontvangen (PDF download). We sturen geen spam.
            </p>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-black/80">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="jij@voorbeeld.com"
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-soft outline-none focus:border-brand-primary/30 focus:ring-2 focus:ring-brand-primary/20"
                />
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-black/5 bg-brand-bg p-4 text-sm text-black/70">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  Ik ga akkoord dat ik mijn weekmenu per mail ontvang en dat ik af en toe tips of updates krijg. Uitschrijven
                  kan altijd.
                </span>
              </label>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                className="rounded-2xl px-3 py-2 text-sm font-semibold text-black/70 hover:bg-black/5"
                onClick={() => setStep(2)}
                disabled={loading}
              >
                Terug
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-bg shadow-brand transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={submitEmail}
                disabled={loading}
              >
                {loading ? "Even wachten..." : "Genereer mijn weekmenu"}
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-black/50">
              <div className="rounded-2xl border border-black/5 bg-white p-3">100% gratis</div>
              <div className="rounded-2xl border border-black/5 bg-white p-3">Geen spam</div>
              <div className="rounded-2xl border border-black/5 bg-white p-3">Direct PDF</div>
            </div>
          </div>
        ) : null}

        {step === 4 && plan ? (
          <div className="animate-[fadeIn_200ms_ease-out]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-serif text-2xl text-brand-text">4) Jouw resultaat</h2>
                <p className="mt-1 text-sm text-black/70">Weekmenu (Ma–Zo) + boodschappenlijst.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={downloadPdf}
                  className="inline-flex items-center justify-center rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-bg shadow-brand transition hover:opacity-95"
                >
                  Download PDF
                </button>
                <Button href="/contact" variant="secondary" className="px-5 py-3">
                  Boek gratis gesprek
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-black/5 bg-brand-bg p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/60">Week totaal</p>
                <p className="mt-2 font-display text-4xl text-brand-primary">{plan.weekMacros.calories} kcal</p>
                <p className="mt-2 text-sm text-black/70">
                  P {plan.weekMacros.protein}g • C {plan.weekMacros.carbs}g • F {plan.weekMacros.fat}g
                </p>
              </div>
              <div className="rounded-3xl border border-black/5 bg-brand-bg p-5 sm:col-span-2">
                <p className="text-sm font-semibold text-black/80">Boodschappenlijst (preview)</p>
                <ul className="mt-3 grid max-h-36 grid-cols-1 gap-2 overflow-auto pr-2 text-sm text-black/70 sm:grid-cols-2">
                  {plan.shoppingList.slice(0, 14).map((i) => (
                    <li key={i.item} className="flex items-baseline justify-between gap-3">
                      <span>• {i.item}</span>
                      {i.count > 1 ? <span className="text-xs font-semibold text-black/40">x{i.count}</span> : null}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-black/50">Volledige lijst in de PDF.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {plan.days.map((d) => (
                <div key={d.day} className="rounded-3xl border border-black/5 bg-white p-5 shadow-soft">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-display text-2xl text-brand-primary">{dayLabel(d.day)}</p>
                    <p className="text-sm text-black/60">
                      {d.macros.calories} kcal • P {d.macros.protein}g • C {d.macros.carbs}g • F {d.macros.fat}g
                    </p>
                  </div>
                  <ul className="mt-4 grid gap-2 text-sm text-black/70 sm:grid-cols-2">
                    {d.meals.map((m, idx) => (
                      <li key={`${m.type}-${idx}`} className="rounded-2xl border border-black/5 bg-brand-bg px-4 py-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-black/50">
                          {mealTypeLabel(m.type)}
                        </span>
                        <p className="mt-1 font-semibold text-black/80">{m.recipe.name}</p>
                        <p className="mt-1 text-xs text-black/50">
                          {m.recipe.calories} kcal • P {m.recipe.protein}g • C {m.recipe.carbs}g • F {m.recipe.fat}g
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-brand-light bg-brand-light/25 p-5">
              <p className="text-sm font-semibold text-black/80">Wil je meer?</p>
              <p className="mt-2 text-sm text-black/70">
                Als je wil dat ik dit 100% op maat maak (porties, voorkeuren, jouw ritme), boek dan een gratis gesprek.
              </p>
              <div className="mt-4">
                <Button href="/contact">Boek gratis gesprek</Button>
              </div>
            </div>
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
