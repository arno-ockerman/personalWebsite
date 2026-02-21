import type { Allergy, Diet, Goal, Macros, MealPlan, MealType, Preferences, Recipe, ShoppingListItem } from "@/lib/mealplanner/types";
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

  const breakfastPool = byType("breakfast");
  const lunchPool = byType("lunch");
  const dinnerPool = byType("dinner");
  const snackPool = byType("snack");

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

  for (const day of dayKeys) {
    const breakfast = pickRecipe({ pool: shuffle(breakfastPool, rand), rand, recentIds: recentByType.breakfast });
    pushRecent("breakfast", breakfast.id);

    const lunch = pickRecipe({ pool: shuffle(lunchPool, rand), rand, recentIds: recentByType.lunch });
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
      const snack = pickRecipe({ pool: shuffle(snackPool, rand), rand, recentIds: recentByType.snack });
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

