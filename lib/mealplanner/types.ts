export type Goal = "weight_loss" | "muscle" | "maintenance";
export type Diet = "none" | "vegetarian" | "vegan";
export type Allergy = "gluten" | "lactose" | "nuts" | "egg" | "soy" | "fish";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type RecipeTag =
  | "vegetarian"
  | "vegan"
  | "gluten_free"
  | "lactose_free"
  | "nut_free"
  | "high_protein";

export type GoalLabel = "Afvallen" | "Spieropbouw" | "Onderhoud";

export type AllergyLabel = "Gluten" | "Lactose" | "Noten" | "Ei" | "Soja" | "Vis/schaaldieren";

export type DietLabel = "Geen restrictie" | "Vegetarisch" | "Vegan";

export type Macros = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Recipe = {
  id: string;
  mealType: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  suitable_for: Goal[];
  tags: RecipeTag[];
  allergens: Allergy[];
};

export type Preferences = {
  allergies: Allergy[];
  diet: Diet;
  mealsPerDay: 3 | 4 | 5;
};

export type PlannedMeal = {
  type: MealType;
  recipe: Recipe;
};

export type DayPlan = {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  meals: PlannedMeal[];
  macros: Macros;
};

export type ShoppingListItem = {
  item: string;
  count: number;
};

export type MealPlan = {
  id: string;
  createdAt: string;
  goal: Goal;
  preferences: Preferences;
  days: DayPlan[];
  weekMacros: Macros;
  shoppingList: ShoppingListItem[];
};

