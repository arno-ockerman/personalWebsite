import { NextResponse } from "next/server";
import { generateMealPlan } from "@/lib/mealplanner/generate";
import type { Allergy, Diet, Goal, Preferences } from "@/lib/mealplanner/types";

const allowedGoals: Goal[] = ["weight_loss", "muscle", "maintenance"];
const allowedDiets: Diet[] = ["none", "vegetarian", "vegan"];
const allowedAllergies: Allergy[] = ["gluten", "lactose", "nuts", "egg", "soy", "fish"];

function cleanString(input: unknown, max: number) {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, max);
}

function cleanArrayOfStrings(input: unknown, maxItems: number) {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const v of input.slice(0, maxItems)) {
    if (typeof v === "string" && v.trim().length > 0) out.push(v.trim());
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });

    const goal = cleanString(body.goal, 40) as Goal;
    if (!allowedGoals.includes(goal)) {
      return NextResponse.json({ ok: false, error: "Kies een geldig doel." }, { status: 400 });
    }

    const preferencesRaw = (body.preferences ?? {}) as Record<string, unknown>;
    const diet = cleanString(preferencesRaw.diet, 40) as Diet;
    if (!allowedDiets.includes(diet)) {
      return NextResponse.json({ ok: false, error: "Kies een geldig dieet." }, { status: 400 });
    }

    const mealsPerDay = Number(preferencesRaw.mealsPerDay);
    if (![3, 4, 5].includes(mealsPerDay)) {
      return NextResponse.json({ ok: false, error: "Kies 3, 4 of 5 maaltijden per dag." }, { status: 400 });
    }

    const allergies = cleanArrayOfStrings(preferencesRaw.allergies, 12)
      .filter((a): a is Allergy => allowedAllergies.includes(a as Allergy))
      .slice(0, 12);

    const preferences: Preferences = {
      diet,
      mealsPerDay: mealsPerDay as 3 | 4 | 5,
      allergies,
    };

    const seed = cleanString(body.seed, 120) || undefined;
    const plan = generateMealPlan({ goal, preferences, seed });

    return NextResponse.json({ ok: true, plan }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Onbekende fout." },
      { status: 500 },
    );
  }
}

