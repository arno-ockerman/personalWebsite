import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type Goal = "afvallen" | "spiermassa" | "onderhoud";
type Geslacht = "man" | "vrouw";
type Activiteitsniveau = "sedentair" | "licht" | "matig" | "actief" | "zeer_actief";

const allowedGoals: Goal[] = ["afvallen", "spiermassa", "onderhoud"];
const allowedGeslacht: Geslacht[] = ["man", "vrouw"];
const allowedActiviteitsniveau: Activiteitsniveau[] = ["sedentair", "licht", "matig", "actief", "zeer_actief"];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanString(input: unknown, max: number) {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, max);
}

function parseNumber(input: unknown) {
  const n = Number(input);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ ok: false, error: "Ongeldige JSON-data." }, { status: 400 });
    }

    const email = cleanString(body.email, 160).toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "Vul een geldig e-mailadres in." }, { status: 400 });
    }

    const consent = body.consent === true;
    if (!consent) {
      return NextResponse.json(
        { ok: false, error: "Je moet akkoord gaan met de verwerking van je gegevens." },
        { status: 400 },
      );
    }

    const goal = cleanString(body.goal, 32) as Goal;
    if (!allowedGoals.includes(goal)) {
      return NextResponse.json({ ok: false, error: "Kies een geldig doel." }, { status: 400 });
    }

    const stats = (body.stats ?? {}) as Record<string, unknown>;
    const geslacht = cleanString(stats.geslacht, 12) as Geslacht;
    if (!allowedGeslacht.includes(geslacht)) {
      return NextResponse.json({ ok: false, error: "Kies een geldig geslacht." }, { status: 400 });
    }

    const leeftijd = parseNumber(stats.leeftijd);
    if (leeftijd === null || leeftijd < 16 || leeftijd > 80) {
      return NextResponse.json({ ok: false, error: "Leeftijd moet tussen 16 en 80 liggen." }, { status: 400 });
    }

    const gewicht = parseNumber(stats.gewicht);
    if (gewicht === null || gewicht < 40 || gewicht > 200) {
      return NextResponse.json({ ok: false, error: "Gewicht moet tussen 40 en 200 kg liggen." }, { status: 400 });
    }

    const lengte = parseNumber(stats.lengte);
    if (lengte === null || lengte < 140 || lengte > 220) {
      return NextResponse.json({ ok: false, error: "Lengte moet tussen 140 en 220 cm liggen." }, { status: 400 });
    }

    const activiteitsniveau = cleanString(stats.activiteitsniveau, 32) as Activiteitsniveau;
    if (!allowedActiviteitsniveau.includes(activiteitsniveau)) {
      return NextResponse.json({ ok: false, error: "Kies een geldig activiteitsniveau." }, { status: 400 });
    }

    const results = (body.results ?? {}) as Record<string, unknown>;
    const kcal = parseNumber(results.kcal);
    const protein_g = parseNumber(results.protein_g);
    const carbs_g = parseNumber(results.carbs_g);
    const fat_g = parseNumber(results.fat_g);

    if ([kcal, protein_g, carbs_g, fat_g].some((n) => n === null)) {
      return NextResponse.json({ ok: false, error: "Resultaten zijn ongeldig of onvolledig." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("macro_leads").insert({
      email,
      goal,
      geslacht,
      leeftijd,
      gewicht,
      lengte,
      activiteitsniveau,
      kcal,
      protein_g,
      carbs_g,
      fat_g,
      consent: true,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: "Opslaan mislukt. Probeer opnieuw." }, { status: 500 });
    }

    const goalText = goal === "afvallen" ? "Afvallen" : goal === "spiermassa" ? "Spiermassa opbouwen" : "Onderhoud";
    try {
      const { data: existing } = await supabase
        .from("clients")
        .select("id, tags")
        .eq("email", email)
        .maybeSingle();

      if (!existing) {
        await supabase.from("clients").insert({
          name: email.split("@")[0],
          email,
          status: "lead",
          tags: ["macros", "website"],
          source: "website",
          notes: `Macro calculator lead - Doel: ${goalText}, kcal: ${kcal}, P/C/F: ${protein_g}/${carbs_g}/${fat_g}`,
          next_follow_up: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          next_action: `Macro calculator follow-up - interesse in ${goalText}`,
        });
      } else {
        const updatedTags = [...new Set([...(existing.tags || []), "macros"])];
        await supabase
          .from("clients")
          .update({
            tags: updatedTags,
            notes: `[${new Date().toISOString().slice(0, 16).replace("T", " ")}] Macro calculator aangevraagd - Doel: ${goalText}`,
            updated_at: new Date().toISOString(),
          })
          .eq("email", email);
      }
    } catch {
      // Laat macro lead-opslag slagen, ook als CRM-upsert faalt.
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Onbekende fout." },
      { status: 500 },
    );
  }
}
