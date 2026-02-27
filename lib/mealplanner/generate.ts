import type {
  Allergy,
  Diet,
  Goal,
  Macros,
  MealPlan,
  MealType,
  Preferences,
  Recipe,
  ShoppingListItem,
} from "@/lib/mealplanner/types";
import { recipes } from "@/lib/mealplanner/recipes";

function clampInt(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function xfnv1a(str: string) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sumMacros(items: Macros[]): Macros {
  return items.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

function recipeMacros(r: Recipe): Macros {
  return { calories: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat };
}

function shuffle<T>(input: T[], rand: () => number): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function filterRecipes({
  goal,
  diet,
  allergies,
}: {
  goal: Goal;
  diet: Diet;
  allergies: Allergy[];
}): Recipe[] {
  return recipes.filter((r) => {
    if (!r.suitable_for.includes(goal)) return false;

    if (diet === "vegetarian" && !r.tags.includes("vegetarian")) return false;
    if (diet === "vegan" && !r.tags.includes("vegan")) return false;

    for (const a of allergies) {
      if (r.allergens.includes(a)) return false;
    }
    return true;
  });
}

function pickRecipe({
  pool,
  rand,
  recentIds,
  maxTries = 20,
}: {
  pool: Recipe[];
  rand: () => number;
  recentIds: Set<string>;
  maxTries?: number;
}): Recipe {
  if (pool.length === 0) {
    throw new Error("Geen recepten beschikbaar met deze voorkeuren.");
  }

  for (let i = 0; i < maxTries; i++) {
    const candidate = pool[Math.floor(rand() * pool.length)]!;
    if (!recentIds.has(candidate.id)) return candidate;
  }

  return pool[Math.floor(rand() * pool.length)]!;
}

function buildShoppingList(plan: MealPlan): ShoppingListItem[] {
  const map = new Map<string, number>();
  for (const day of plan.days) {
    for (const meal of day.meals) {
      for (const ing of meal.recipe.ingredients) {
        const key = ing.trim();
        if (!key) continue;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
  }
  return [...map.entries()]
    .map(([item, count]) => ({ item, count }))
    .sort((a, b) => a.item.localeCompare(b.item, "nl"));
}

/**
 * Pick which days of the week should feature a Herbalife recipe (1-2 per week).
 * We pick 2 pseudo-random day indices out of 7.
 */
function pickHerbalifeSlots(rand: () => number): Set<number> {
  const slots = new Set<number>();
  // First slot — any day
  const first = Math.floor(rand() * 7);
  slots.add(first);
  // Second slot — different from first, at least 2 days apart
  for (let tries = 0; tries < 30; tries++) {
    const second = Math.floor(rand() * 7);
    if (second !== first && Math.abs(second - first) >= 2) {
      slots.add(second);
      break;
    }
  }
  return slots;
}

export function generateMealPlan({
  goal,
  preferences,
  seed,
}: {
  goal: Goal;
  preferences: Preferences;
  seed?: string;
}): MealPlan {
  const mealsPerDay = clampInt(preferences.mealsPerDay, 3, 5) as 3 | 4 | 5;
  const normalizedPrefs: Preferences = {
    allergies: (preferences.allergies ?? []).slice(0, 10),
    diet: preferences.diet ?? "none",
    mealsPerDay,
  };

  const key = seed ?? JSON.stringify({ goal, ...normalizedPrefs });
  const rand = mulberry32(xfnv1a(key));

  const pool = filterRecipes({ goal, diet: normalizedPrefs.diet, allergies: normalizedPrefs.allergies });
  const byType = (type: MealType) => pool.filter((r) => r.mealType === type);
  const byTypeHerbalife = (type: MealType) =>
    pool.filter((r) => r.mealType === type && r.herbalife === true);
  const byTypeRegular = (type: MealType) =>
    pool.filter((r) => r.mealType === type && !r.herbalife);

  const breakfastPool = byType("breakfast");
  const lunchPool = byType("lunch");
  const dinnerPool = byType("dinner");
  const snackPool = byType("snack");

  const breakfastHerbalife = byTypeHerbalife("breakfast");
  const snackHerbalife = byTypeHerbalife("snack");
  const lunchHerbalife = byTypeHerbalife("lunch");

  const breakfastRegular = byTypeRegular("breakfast");
  const lunchRegular = byTypeRegular("lunch");
  const snackRegular = byTypeRegular("snack");

  // Determine days where Herbalife gets featured (1-2 per week, naturally)
  const herbalifeSlots = pickHerbalifeSlots(rand);

  const days: MealPlan["days"] = [];
  const dayKeys: MealPlan["days"][number]["day"][] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const recentByType: Record<MealType, Set<string>> = {
    breakfast: new Set(),
    lunch: new Set(),
    dinner: new Set(),
    snack: new Set(),
  };

  const maxRecent = 3;
  const pushRecent = (type: MealType, id: string) => {
    const set = recentByType[type];
    set.add(id);
    if (set.size > maxRecent) {
      const first = set.values().next().value as string | undefined;
      if (first) set.delete(first);
    }
  };

  for (let dayIdx = 0; dayIdx < dayKeys.length; dayIdx++) {
    const day = dayKeys[dayIdx]!;
    const isHerbalifeDay = herbalifeSlots.has(dayIdx);

    // On Herbalife days: feature an HL breakfast or snack
    let breakfastCandidates = breakfastPool;
    if (isHerbalifeDay && breakfastHerbalife.length > 0) {
      breakfastCandidates = breakfastHerbalife;
    } else if (breakfastRegular.length > 0) {
      breakfastCandidates = breakfastRegular;
    }

    const breakfast = pickRecipe({
      pool: shuffle(breakfastCandidates, rand),
      rand,
      recentIds: recentByType.breakfast,
    });
    pushRecent("breakfast", breakfast.id);

    const lunchCandidates =
      !isHerbalifeDay && lunchRegular.length > 0 ? lunchRegular : lunchPool;
    const lunch = pickRecipe({
      pool: shuffle(lunchCandidates, rand),
      rand,
      recentIds: recentByType.lunch,
    });
    pushRecent("lunch", lunch.id);

    const dinner = pickRecipe({ pool: shuffle(dinnerPool, rand), rand, recentIds: recentByType.dinner });
    pushRecent("dinner", dinner.id);

    const meals: Array<{ type: MealType; recipe: Recipe }> = [
      { type: "breakfast", recipe: breakfast },
      { type: "lunch", recipe: lunch },
      { type: "dinner", recipe: dinner },
    ];

    const snacksNeeded = mealsPerDay - 3;
    for (let i = 0; i < snacksNeeded; i++) {
      // On Herbalife days: try to feature an HL snack for at least 1 slot
      let snackCandidates = snackPool;
      if (isHerbalifeDay && i === 0 && snackHerbalife.length > 0) {
        snackCandidates = snackHerbalife;
      } else if (snackRegular.length > 0) {
        snackCandidates = snackRegular;
      }
      const snack = pickRecipe({ pool: shuffle(snackCandidates, rand), rand, recentIds: recentByType.snack });
      pushRecent("snack", snack.id);
      meals.push({ type: "snack", recipe: snack });
    }

    const macros = sumMacros(meals.map((m) => recipeMacros(m.recipe)));
    days.push({ day, meals, macros });
  }

  const weekMacros = sumMacros(days.map((d) => d.macros));
  const plan: MealPlan = {
    id: `mp_${Math.floor(rand() * 1e9).toString(36)}${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    goal,
    preferences: normalizedPrefs,
    days,
    weekMacros,
    shoppingList: [],
  };

  plan.shoppingList = buildShoppingList(plan);
  return plan;
}
