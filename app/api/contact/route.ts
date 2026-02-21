import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type Topic =
  | "Afvallen"
  | "Spiermassa opbouwen"
  | "Gezonder leven"
  | "Extra inkomen / business"
  | "Anders";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanString(input: unknown, max: number) {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, max);
}

const allowedTopics: Topic[] = [
  "Afvallen",
  "Spiermassa opbouwen",
  "Gezonder leven",
  "Extra inkomen / business",
  "Anders",
];

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });

    // Honeypot
    const company = cleanString(body.company, 200);
    if (company.length > 0) return NextResponse.json({ ok: true }, { status: 200 });

    const name = cleanString(body.name, 120);
    const email = cleanString(body.email, 160).toLowerCase();
    const phone = cleanString(body.phone, 60);
    const topic = cleanString(body.topic, 60) as Topic;
    const message = cleanString(body.message, 1500);

    if (name.length < 2) return NextResponse.json({ ok: false, error: "Naam is te kort." }, { status: 400 });
    if (!isValidEmail(email))
      return NextResponse.json({ ok: false, error: "Email is ongeldig." }, { status: 400 });
    if (!allowedTopics.includes(topic))
      return NextResponse.json({ ok: false, error: "Kies een geldig onderwerp." }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const userAgent = req.headers.get("user-agent") ?? undefined;
    const forwardedFor = req.headers.get("x-forwarded-for") ?? undefined;
    const ip = forwardedFor ? forwardedFor.split(",")[0]?.trim() : undefined;
    const source = req.headers.get("referer") ?? undefined;

    const { error } = await supabase.from("contact_submissions").insert({
      name,
      email,
      phone: phone.length > 0 ? phone : null,
      topic,
      message: message.length > 0 ? message : null,
      source,
      user_agent: userAgent,
      ip,
    });

    if (error) {
      return NextResponse.json({ ok: false, error: "Opslaan mislukt. Probeer opnieuw." }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Onbekende fout." },
      { status: 500 },
    );
  }
}

