import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { Allergy, Diet, Goal } from "@/lib/mealplanner/types";

const allowedGoals: Goal[] = ["weight_loss", "muscle", "maintenance"];
const allowedDiets: Diet[] = ["none", "vegetarian", "vegan"];
const allowedAllergies: Allergy[] = ["gluten", "lactose", "nuts", "egg", "soy", "fish"];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string) {
  // Accepts Belgian and international phone formats
  return /^[\+\d\s\-\(\)]{7,20}$/.test(phone);
}

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

    // ── Required fields ────────────────────────────────────────────────────
    const email = cleanString(body.email, 160).toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "Email is ongeldig." }, { status: 400 });
    }

    const consent = Boolean(body.consent);
    if (!consent) {
      return NextResponse.json({ ok: false, error: "Bevestig dat je akkoord gaat." }, { status: 400 });
    }

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

    // ── Optional fields ────────────────────────────────────────────────────
    const phoneRaw = cleanString(body.phone, 30);
    const phone    = phoneRaw && isValidPhone(phoneRaw) ? phoneRaw : null;
    const wantCoaching = Boolean(body.wantCoaching);
    const planId   = cleanString(body.planId, 60) || null;

    // ── Build data ─────────────────────────────────────────────────────────
    const supabase   = getSupabaseAdmin();
    const preferences = { diet, mealsPerDay, allergies };

    // Build CRM tags
    const tags: string[] = ["mealplanner-lead"];
    if (wantCoaching) tags.push("coaching-interested");

    // ── 1. Upsert mealplanner_leads ────────────────────────────────────────
    const { error: leadError } = await supabase.from("mealplanner_leads").upsert(
      {
        email,
        goal,
        preferences,
        consent: true,
        phone,
        want_coaching: wantCoaching,
        plan_id: planId,
        download_count: 1,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "email",
        ignoreDuplicates: false,
      },
    );

    if (leadError) {
      console.error("[mealplanner/subscribe] lead upsert error:", leadError);
      return NextResponse.json({ ok: false, error: "Opslaan mislukt. Probeer opnieuw." }, { status: 500 });
    }

    // ── 2. Upsert clients table (CRM) ─────────────────────────────────────
    // We try a soft upsert: if the client already exists, merge tags.
    // If clients table doesn't exist yet, we swallow the error gracefully.
    try {
      const { data: existing } = await supabase
        .from("clients")
        .select("id, tags")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        // Merge tags
        const existingTags: string[] = Array.isArray(existing.tags) ? existing.tags : [];
        const mergedTags = Array.from(new Set([...existingTags, ...tags]));

        await supabase
          .from("clients")
          .update({
            tags: mergedTags,
            phone: phone ?? undefined,
            updated_at: new Date().toISOString(),
            metadata: {
              last_mealplan_goal: goal,
              last_mealplan_diet: diet,
              last_mealplan_allergies: allergies,
              last_mealplan_id: planId,
              want_coaching: wantCoaching,
            },
          })
          .eq("id", existing.id);
      } else {
        // Create new client record
        await supabase.from("clients").insert({
          email,
          phone,
          tags,
          source: "mealplanner",
          status: wantCoaching ? "coaching-interested" : "lead",
          metadata: {
            last_mealplan_goal: goal,
            last_mealplan_diet: diet,
            last_mealplan_allergies: allergies,
            last_mealplan_id: planId,
            want_coaching: wantCoaching,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (clientsErr) {
      // Clients table might not exist yet — don't fail the whole request
      console.warn("[mealplanner/subscribe] clients upsert skipped:", clientsErr);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Onbekende fout." },
      { status: 500 },
    );
  }
}
