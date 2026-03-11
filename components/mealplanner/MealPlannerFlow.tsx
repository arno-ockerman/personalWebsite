"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import type { Allergy, Diet, Goal, MealPlan } from "@/lib/mealplanner/types";

type Step = 1 | 2 | 3 | 4;

const goalOptions: { value: Goal; label: string; sub: string; emoji: string }[] = [
  { value: "weight_loss", label: "Afvallen",     sub: "Strakker worden, simpel houden",    emoji: "🔥" },
  { value: "muscle",      label: "Spieropbouw",  sub: "Meer eiwit, stevige maaltijden",    emoji: "💪" },
  { value: "maintenance", label: "Onderhoud",    sub: "In balans, consistent blijven",     emoji: "⚖️" },
];

const allergyOptions: { value: Allergy; label: string }[] = [
  { value: "gluten",  label: "Gluten" },
  { value: "lactose", label: "Lactose" },
  { value: "nuts",    label: "Noten" },
  { value: "egg",     label: "Ei" },
  { value: "soy",     label: "Soja" },
  { value: "fish",    label: "Vis/schaaldieren" },
];

const dietOptions: { value: Diet; label: string; sub: string }[] = [
  { value: "none",        label: "Geen restrictie", sub: "Alles is mogelijk" },
  { value: "vegetarian",  label: "Vegetarisch",     sub: "Geen vlees of vis" },
  { value: "vegan",       label: "Vegan",            sub: "100% plantaardig" },
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  return /^[\+\d\s\-\(\)]{7,20}$/.test(phone);
}

function base64UrlEncodeUtf8(str: string) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function dayLabel(day: MealPlan["days"][number]["day"]) {
  const map: Record<string, string> = { Mon: "Maandag", Tue: "Dinsdag", Wed: "Woensdag", Thu: "Donderdag", Fri: "Vrijdag", Sat: "Zaterdag", Sun: "Zondag" };
  return map[day] ?? day;
}

function dayShort(day: MealPlan["days"][number]["day"]) {
  const map: Record<string, string> = { Mon: "Ma", Tue: "Di", Wed: "Wo", Thu: "Do", Fri: "Vr", Sat: "Za", Sun: "Zo" };
  return map[day] ?? day;
}

function mealTypeLabel(t: MealPlan["days"][number]["meals"][number]["type"]) {
  const map: Record<string, string> = { breakfast: "Ontbijt", lunch: "Lunch", dinner: "Diner", snack: "Snack" };
  return map[t] ?? t;
}

// ── Food image via Unsplash (free, no API key needed) ────────────────────────
function foodImageUrl(keyword: string, width = 400, height = 260): string {
  // Use picsum.photos as a reliable fallback (deterministic seed from keyword)
  const seed = keyword.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 1000;
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

// ── Loading animation ─────────────────────────────────────────────────────────
function CookingLoader() {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-primary opacity-20" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-2xl">
          🍳
        </span>
      </div>
      <div className="text-center">
        <p className="font-semibold text-brand-text">Je weekmenu wordt gegenereerd…</p>
        <p className="mt-1 text-sm text-black/60">Even geduld, we stellen alles samen op maat!</p>
      </div>
      <div className="mt-2 flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-brand-primary"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}


function PremiumBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
      ★ {name}
    </span>
  );
}

// ── Recipe card ───────────────────────────────────────────────────────────────
function RecipeCard({
  recipe,
  mealType,
}: {
  recipe: MealPlan["days"][number]["meals"][number]["recipe"];
  mealType: MealPlan["days"][number]["meals"][number]["type"];
}) {
  const [expanded, setExpanded] = useState(false);
  const imgUrl = recipe.imageKeyword ? foodImageUrl(recipe.imageKeyword) : null;

  return (
    <li
      className={`group relative overflow-hidden rounded-2xl border border-black/5 bg-brand-bg transition-all duration-200 ${
        expanded ? "shadow-md" : "hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      {/* Food image */}
      {imgUrl && (
        <div className="relative h-28 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl}
            alt={recipe.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Meal type pill */}
          <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {mealTypeLabel(mealType)}
          </span>
          {recipe.premium && (
            <span className="absolute right-2 top-2 rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-bold text-white">
              ★ HL
            </span>
          )}
        </div>
      )}

      <div className="p-3">
        {!imgUrl && (
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-black/50">
            {mealTypeLabel(mealType)}
          </span>
        )}
        <p className="font-semibold leading-snug text-black/80">{recipe.name}</p>

        {recipe.premium && recipe.premiumProduct && (
          <div className="mt-1">
            <PremiumBadge name={recipe.premiumProduct} />
          </div>
        )}

        <p className="mt-1 text-xs text-black/50">
          {recipe.calories} kcal • P {recipe.protein}g • C {recipe.carbs}g • F {recipe.fat}g
        </p>

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-xs font-semibold text-brand-primary hover:underline"
        >
          {expanded ? "Verberg ingrediënten ↑" : "Bekijk ingrediënten ↓"}
        </button>

        {expanded && (
          <ul className="mt-2 space-y-0.5 text-xs text-black/60">
            {recipe.ingredients.map((ing) => (
              <li key={ing}>• {ing}</li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

// ── Share buttons ─────────────────────────────────────────────────────────────
function ShareButtons({ plan }: { plan: MealPlan }) {
  const shareText = encodeURIComponent(
    `🥗 Mijn persoonlijk weekmenu — gegenereerd via beinspiredbyus.be/mealplanner\n\n` +
      `Doel: ${plan.goal === "weight_loss" ? "Afvallen" : plan.goal === "muscle" ? "Spieropbouw" : "Onderhoud"}\n` +
      `Gem. ${Math.round(plan.weekMacros.calories / 7)} kcal/dag\n\n` +
      `Maak jouw gratis weekmenu op beinspiredbyus.be/mealplanner 👆`,
  );
  const waUrl = `https://wa.me/?text=${shareText}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-black/60">Deel via:</span>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-2xl border border-black/5 bg-white px-3 py-2 text-xs font-semibold text-black/80 shadow-soft transition hover:bg-green-50 hover:text-green-700"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.983-1.412A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 01-4.079-1.124l-.292-.175-3.027.857.844-3.025-.19-.307A7.946 7.946 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
        </svg>
        WhatsApp
      </a>

      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText("https://beinspiredbyus.be/mealplanner").catch(() => null);
        }}
        className="inline-flex items-center gap-1.5 rounded-2xl border border-black/5 bg-white px-3 py-2 text-xs font-semibold text-black/80 shadow-soft transition hover:bg-brand-bg"
      >
        🔗 Kopieer link
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function MealPlannerFlow() {
  const [step, setStep] = useState<Step>(1);

  const [goal, setGoal] = useState<Goal>("weight_loss");
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [diet, setDiet] = useState<Diet>("none");
  const [mealsPerDay, setMealsPerDay] = useState<3 | 4 | 5>(4);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(true);
  const [wantCoaching, setWantCoaching] = useState(false);

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

  const prefs = useMemo(() => ({ allergies, diet, mealsPerDay }), [allergies, diet, mealsPerDay]);

  async function submitEmail() {
    setError(null);
    const e = email.trim().toLowerCase();
    if (!isValidEmail(e)) return setError("Vul een geldig emailadres in.");
    if (!consent) return setError("Vink aan dat je akkoord gaat.");
    if (phone && !isValidPhone(phone)) return setError("Telefoonnummer is ongeldig.");

    setLoading(true);
    try {
      const genRes = await fetch("/api/mealplanner/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, preferences: prefs, seed: `${e}:${Date.now()}` }),
      });

      const genJson = (await genRes.json().catch(() => null)) as {
        ok?: boolean;
        plan?: MealPlan;
        error?: string;
      } | null;

      if (!genRes.ok || !genJson?.ok || !genJson.plan) {
        throw new Error(genJson?.error ?? "Genereren mislukt. Probeer opnieuw.");
      }

      const generatedPlan = genJson.plan;

      // Subscribe in parallel (non-blocking: don't fail if it errors)
      fetch("/api/mealplanner/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: e,
          phone: phone || undefined,
          consent,
          goal,
          preferences: prefs,
          wantCoaching,
          planId: generatedPlan.id,
        }),
      }).catch(() => null);

      setPlan(generatedPlan);
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

  const premiumCount = plan
    ? plan.days.flatMap((d) => d.meals).filter((m) => m.recipe.premium).length
    : 0;

  return (
    <div>
      {/* ── Progress ── */}
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
                p.active
                  ? "bg-brand-primary text-brand-bg"
                  : p.done
                    ? "bg-brand-accent text-brand-bg"
                    : "bg-black/10"
              }`}
            >
              {p.done ? "✓" : p.idx}
            </span>
            {p.label}
          </li>
        ))}
      </ol>

      {/* ── Error ── */}
      {error && (
        <div className="mt-4 rounded-2xl border border-brand-primary/20 bg-brand-primary/5 p-4 text-sm text-brand-primary">
          {error}
        </div>
      )}

      <div className="mt-6">
        {/* ── Step 1: Goal ── */}
        {step === 1 && (
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
                    className={`rounded-3xl border p-4 text-left shadow-soft transition hover:-translate-y-0.5 ${
                      active
                        ? "border-brand-primary/30 bg-brand-primary/5 shadow-brand"
                        : "border-black/5 bg-white hover:bg-black/5"
                    }`}
                  >
                    <span className="text-3xl">{o.emoji}</span>
                    <p className="mt-2 font-display text-2xl text-brand-primary">{o.label}</p>
                    <p className="mt-1 text-sm text-black/70">{o.sub}</p>
                  </button>
                );
              })}
            </div>

            {/* Social proof */}
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-black/5 bg-brand-bg px-4 py-3">
              <span className="text-lg">👥</span>
              <span className="text-sm text-black/70">
                <strong className="text-black/90">500+</strong> mensen gingen jou voor. Gratis, geen spam.
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-black/50">100% gratis • Geen spam</span>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-bg shadow-brand transition hover:opacity-95"
                onClick={() => setStep(2)}
              >
                Verder →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Preferences ── */}
        {step === 2 && (
          <div className="animate-[fadeIn_200ms_ease-out]">
            <h2 className="font-serif text-2xl text-brand-text">2) Jouw voorkeuren</h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {/* Allergies */}
              <div className="rounded-3xl border border-black/5 bg-brand-bg p-5">
                <p className="text-sm font-semibold text-black/80">Allergieën / intoleranties</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {allergyOptions.map((a) => {
                    const checked = allergies.includes(a.value);
                    return (
                      <label
                        key={a.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition hover:bg-white ${
                          checked ? "border-brand-primary/30 bg-white" : "border-black/5 bg-white/60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            setAllergies((curr) =>
                              e.target.checked ? [...curr, a.value] : curr.filter((x) => x !== a.value),
                            )
                          }
                          className="accent-brand-primary"
                        />
                        {a.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4">
                {/* Diet */}
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
                          className={`rounded-2xl border px-4 py-2.5 text-left text-sm font-semibold transition ${
                            active
                              ? "border-brand-primary/30 bg-white text-brand-primary"
                              : "border-black/5 bg-white/60 hover:bg-white"
                          }`}
                        >
                          {d.label}
                          <span className="ml-1 font-normal text-black/50">— {d.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Meals per day */}
                <div className="rounded-3xl border border-black/5 bg-brand-bg p-5">
                  <p className="text-sm font-semibold text-black/80">Aantal maaltijden per dag</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[3, 4, 5].map((n) => {
                      const active = mealsPerDay === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setMealsPerDay(n as 3 | 4 | 5)}
                          className={`flex-1 rounded-2xl border py-3 text-center text-sm font-semibold transition ${
                            active
                              ? "border-brand-primary/30 bg-white text-brand-primary shadow-brand"
                              : "border-black/5 bg-white/60 hover:bg-white"
                          }`}
                        >
                          {n}
                          <span className="block text-xs font-normal text-black/50">
                            {n === 3 ? "basis" : n === 4 ? "aanbevolen" : "actief"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                className="rounded-2xl px-3 py-2 text-sm font-semibold text-black/70 hover:bg-black/5"
                onClick={() => setStep(1)}
              >
                ← Terug
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-bg shadow-brand transition hover:opacity-95"
                onClick={() => setStep(3)}
              >
                Verder →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Email ── */}
        {step === 3 && (
          <div className="animate-[fadeIn_200ms_ease-out]">
            <h2 className="font-serif text-2xl text-brand-text">3) Ontvang je weekmenu</h2>
            <p className="mt-2 text-sm text-black/70">
              Vul je email in. Je krijgt je persoonlijk weekmenu direct als PDF. Geen spam.
            </p>

            {loading ? (
              <CookingLoader />
            ) : (
              <>
                <div className="mt-5 grid gap-3">
                  {/* Email */}
                  <label className="grid gap-1.5">
                    <span className="text-sm font-semibold text-black/80">Email *</span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="jij@voorbeeld.com"
                      className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-soft outline-none transition focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </label>

                  {/* Phone (optional) */}
                  <label className="grid gap-1.5">
                    <span className="text-sm font-semibold text-black/80">
                      Telefoonnummer{" "}
                      <span className="font-normal text-black/40">(optioneel)</span>
                    </span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      placeholder="+32 470 00 00 00"
                      className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-soft outline-none transition focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/20"
                    />
                  </label>

                  {/* Coaching checkbox */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-black/5 bg-brand-bg p-4 text-sm transition hover:bg-brand-bg/80">
                    <input
                      type="checkbox"
                      checked={wantCoaching}
                      onChange={(e) => setWantCoaching(e.target.checked)}
                      className="mt-1 accent-brand-primary"
                    />
                    <span>
                      <strong className="text-black/90">Ja, ik wil persoonlijk advies van Arno</strong>
                      <span className="mt-0.5 block text-black/60">
                        Ik ben geïnteresseerd in een gratis gesprek over mijn voeding & doelen.
                      </span>
                    </span>
                  </label>

                  {/* Consent */}
                  <label className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white/50 p-4 text-sm text-black/70">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 accent-brand-primary"
                    />
                    <span>
                      Ik ga akkoord dat ik mijn weekmenu ontvang en af en toe tips of updates krijg. Uitschrijven
                      kan altijd.
                    </span>
                  </label>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="rounded-2xl px-3 py-2 text-sm font-semibold text-black/70 hover:bg-black/5"
                    onClick={() => setStep(2)}
                  >
                    ← Terug
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-bg shadow-brand transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={submitEmail}
                    disabled={loading}
                  >
                    🍽️ Genereer mijn weekmenu
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-black/50">
                  <div className="rounded-2xl border border-black/5 bg-white p-3">100% gratis</div>
                  <div className="rounded-2xl border border-black/5 bg-white p-3">Geen spam</div>
                  <div className="rounded-2xl border border-black/5 bg-white p-3">Direct PDF</div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Step 4: Result ── */}
        {step === 4 && plan && (
          <div className="animate-[fadeIn_200ms_ease-out]">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-serif text-2xl text-brand-text">🎉 Jouw weekmenu is klaar!</h2>
                <p className="mt-1 text-sm text-black/70">Maandag t/m zondag • Inclusief boodschappenlijst.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={downloadPdf}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-brand-bg shadow-brand transition hover:opacity-95"
                >
                  ⬇️ Download PDF
                </button>
                <Button href="/contact" variant="secondary" className="px-5 py-3">
                  Gratis gesprek
                </Button>
              </div>
            </div>

            {/* Share buttons */}
            <div className="mt-4">
              <ShareButtons plan={plan} />
            </div>

            {/* Macro summary */}
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {[
                { label: "Gem. kcal/dag", val: `${Math.round(plan.weekMacros.calories / 7)}` },
                { label: "Eiwit/dag",     val: `${Math.round(plan.weekMacros.protein / 7)}g` },
                { label: "Koolh./dag",    val: `${Math.round(plan.weekMacros.carbs / 7)}g` },
                { label: "Vet/dag",       val: `${Math.round(plan.weekMacros.fat / 7)}g` },
              ].map((s) => (
                <div key={s.label} className="rounded-3xl border border-black/5 bg-brand-bg p-4 text-center">
                  <p className="font-display text-3xl text-brand-primary">{s.val}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-black/50">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Premium note */}
            {premiumCount > 0 && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-brand-primary/15 bg-brand-primary/5 p-4">
                <span className="text-xl">🌿</span>
                <div>
                  <p className="text-sm font-semibold text-brand-primary">
                    {premiumCount} Proteïnerecepten in jouw plan
                  </p>
                  <p className="mt-0.5 text-xs text-black/60">
                    Gemarkeerd met ★. Vragen?{" "}
                    <a href="/contact" className="font-semibold underline">
                      Neem contact op
                    </a>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Shopping list preview */}
            <div className="mt-5 rounded-3xl border border-black/5 bg-brand-bg p-5">
              <p className="text-sm font-semibold text-black/80">🛒 Boodschappenlijst (preview)</p>
              <ul className="mt-3 grid max-h-40 grid-cols-1 gap-1.5 overflow-auto pr-2 text-sm text-black/70 sm:grid-cols-2">
                {plan.shoppingList.slice(0, 18).map((i) => (
                  <li key={i.item} className="flex items-baseline justify-between gap-3">
                    <span>• {i.item}</span>
                    {i.count > 1 && (
                      <span className="shrink-0 text-xs font-semibold text-black/40">x{i.count}</span>
                    )}
                  </li>
                ))}
              </ul>
              {plan.shoppingList.length > 18 && (
                <p className="mt-2 text-xs text-black/40">
                  + {plan.shoppingList.length - 18} meer items in de PDF.
                </p>
              )}
            </div>

            {/* Day-by-day meal plan */}
            <div className="mt-6 grid gap-5">
              {plan.days.map((d) => (
                <div key={d.day} className="rounded-3xl border border-black/5 bg-white p-5 shadow-soft">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-display text-2xl text-brand-primary">
                      {dayShort(d.day)}
                      <span className="ml-2 text-base font-normal text-black/50">{dayLabel(d.day)}</span>
                    </p>
                    <p className="text-sm text-black/60">
                      {d.macros.calories} kcal • P {d.macros.protein}g • C {d.macros.carbs}g • F {d.macros.fat}g
                    </p>
                  </div>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {d.meals.map((m, idx) => (
                      <RecipeCard key={`${m.type}-${idx}`} recipe={m.recipe} mealType={m.type} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-6 rounded-3xl border border-brand-light bg-brand-light/25 p-5">
              <p className="text-sm font-semibold text-black/80">Wil je meer?</p>
              <p className="mt-2 text-sm text-black/70">
                Als je wilt dat ik dit 100% op maat maak — porties, timing, jouw ritme en doelen — boek dan een
                gratis gesprek. Geen verplichtingen.
              </p>
              <div className="mt-4">
                <Button href="/contact">Boek gratis gesprek</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
