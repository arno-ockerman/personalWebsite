/**
 * POST /api/kickstart
 *
 * Registers a lead for the "7-Daagse Kickstart Gids" and sends a welcome
 * email containing the full 7-day meal plan.
 *
 * Supabase table (run once in SQL editor):
 * ─────────────────────────────────────────
 * CREATE TABLE kickstart_leads (
 *   id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
 *   voornaam    TEXT        NOT NULL,
 *   email       TEXT        NOT NULL,
 *   created_at  TIMESTAMPTZ DEFAULT NOW(),
 *   ip_address  TEXT,
 *   source      TEXT        DEFAULT 'website'
 * );
 * CREATE UNIQUE INDEX kickstart_leads_email_idx ON kickstart_leads (email);
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// ── helpers ──────────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clean(input: unknown, max: number): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, max);
}

// ── 7-day meal plan data ──────────────────────────────────────────────────────

interface DayPlan {
  dag: string;
  ontbijt: string;
  lunch: string;
  avondeten: string;
  kcal: number;
  proteine: number;
}

const WEEK_PLAN: DayPlan[] = [
  {
    dag: "Dag 1 — Maandag",
    ontbijt: "4 eieren (roerei) + 2 sneetjes volkorenbrood + komkommer",
    lunch: "200g kipfilet (gegrild) + 150g rijst + grote groene salade",
    avondeten: "200g zalm + geroosterde groenten (broccoli, paprika, courgette)",
    kcal: 1920,
    proteine: 165,
  },
  {
    dag: "Dag 2 — Dinsdag",
    ontbijt: "200g Griekse yoghurt (0%) + 50g havermout + handjevol bessen",
    lunch: "150g tonijn op 2 rijstwafels + tomaat + ui + 1 avocado",
    avondeten: "200g rundergehakt (mager) + gestoofde spinazie + champignons",
    kcal: 1850,
    proteine: 158,
  },
  {
    dag: "Dag 3 — Woensdag",
    ontbijt: "3 eieren + 150g kwark + 1 appel",
    lunch: "200g kalkoenfilet + 120g quinoa + cherry tomaten + veldsla",
    avondeten: "200g kipfilet in kruiden + geroosterde asperges + courgette",
    kcal: 1880,
    proteine: 162,
  },
  {
    dag: "Dag 4 — Donderdag",
    ontbijt: "50g havermout met water + 2 gekookte eieren + 1 banaan",
    lunch: "200g garnalen (gestoomd) + 150g rijst + broccoli",
    avondeten: "200g zeebaars + gestoofde prei + wortel + champignons",
    kcal: 1900,
    proteine: 160,
  },
  {
    dag: "Dag 5 — Vrijdag",
    ontbijt: "200g kwark + 1 eetlepel pindakaas (naturel) + 1 peer",
    lunch: "150g kipfilet + 2 volkoren wraps + sla + komkommer + hüttenkäse",
    avondeten: "200g kabeljauw + geroosterde paprika + ui + courgette",
    kcal: 1870,
    proteine: 157,
  },
  {
    dag: "Dag 6 — Zaterdag",
    ontbijt: "3 eieren (omelet) + 50g havergrutten + handje noten",
    lunch: "200g biefstuk (mager) + 130g aardappel (gekookt) + sperziebonen",
    avondeten: "200g kip (oven) + ruwe groenten (wortel, selderij) + salsa",
    kcal: 1950,
    proteine: 168,
  },
  {
    dag: "Dag 7 — Zondag",
    ontbijt: "4 eiwitten + 2 hele eieren (roerei) + 1 volkorenboterham + tomaat",
    lunch: "200g tonijn + 100g kikkererwten + komkommer + olijfolie + citroensap",
    avondeten: "200g zalm + gestoomde broccoli + bloemkool + spinazie",
    kcal: 1910,
    proteine: 163,
  },
];

// ── email HTML ────────────────────────────────────────────────────────────────

function buildEmailHtml(voornaam: string): string {
  const rows = WEEK_PLAN.map(
    (d) => `
    <tr>
      <td style="padding:16px;border-bottom:1px solid #f0e8e8;vertical-align:top;min-width:110px;">
        <strong style="color:#620E06;">${d.dag}</strong>
      </td>
      <td style="padding:16px;border-bottom:1px solid #f0e8e8;vertical-align:top;">
        <p style="margin:0 0 8px;"><strong>🌅 Ontbijt:</strong> ${d.ontbijt}</p>
        <p style="margin:0 0 8px;"><strong>☀️ Lunch:</strong> ${d.lunch}</p>
        <p style="margin:0 0 8px;"><strong>🌙 Avondeten:</strong> ${d.avondeten}</p>
        <p style="margin:0;font-size:12px;color:#888;">
          🔥 ${d.kcal} kcal &nbsp;|&nbsp; 💪 ${d.proteine}g proteïne
        </p>
      </td>
    </tr>`,
  ).join("");

  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fdf8f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(98,14,6,0.08);">
    <!-- Header -->
    <tr>
      <td colspan="2" style="background:#620E06;padding:32px;text-align:center;">
        <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:#e8c4c0;">Be Inspired By Us</p>
        <h1 style="margin:0;font-size:26px;font-weight:800;color:#fff;line-height:1.2;">
          🚀 Jouw 7-Daagse Kickstart Gids
        </h1>
      </td>
    </tr>
    <!-- Intro -->
    <tr>
      <td colspan="2" style="padding:28px 32px 8px;">
        <p style="margin:0 0 12px;font-size:16px;color:#1a1a1a;">Hey <strong>${voornaam}</strong>! 👋</p>
        <p style="margin:0 0 12px;color:#444;line-height:1.6;">
          Welkom bij de <strong>7-Daagse Kickstart</strong>! Dit plan is gemaakt voor drukke mannen die resultaat
          willen zonder uren in de keuken te staan.
        </p>
        <p style="margin:0 0 20px;color:#444;line-height:1.6;">
          <strong>3 gouden regels:</strong><br>
          ✅ Geen koolhydraten bij het avondeten<br>
          ✅ Drink minstens 2L water per dag<br>
          ✅ Sla geen maaltijd over
        </p>
      </td>
    </tr>
    <!-- Plan table -->
    <tr>
      <td colspan="2" style="padding:0 32px 16px;">
        <h2 style="color:#620E06;font-size:18px;margin:0 0 16px;">📋 Het Weekplan</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #f0e8e8;border-radius:8px;overflow:hidden;">
          ${rows}
        </table>
      </td>
    </tr>
    <!-- Tips -->
    <tr>
      <td colspan="2" style="padding:16px 32px 24px;">
        <div style="background:#fdf2f2;border-left:4px solid #620E06;border-radius:8px;padding:16px;">
          <p style="margin:0 0 8px;font-weight:700;color:#620E06;">💡 Pro Tips</p>
          <ul style="margin:0;padding-left:20px;color:#555;line-height:1.8;">
            <li>Meal prep op zondag = succes de rest van de week</li>
            <li>Heb je honger? Voeg extra groenten toe — geen extra koolhydraten</li>
            <li>Kruiden en specerijen zijn onbeperkt — houd het lekker!</li>
            <li>Weeg je proteïne rauw voor de nauwkeurigste macro's</li>
          </ul>
        </div>
      </td>
    </tr>
    <!-- CTA -->
    <tr>
      <td colspan="2" style="padding:0 32px 32px;text-align:center;">
        <p style="color:#555;margin:0 0 16px;">Wil je een stap verder gaan?</p>
        <a href="https://www.beinspiredbyus.be/contact"
           style="display:inline-block;background:#620E06;color:#fff;text-decoration:none;border-radius:12px;padding:14px 28px;font-weight:700;font-size:15px;">
          Start je transformatie →
        </a>
        <p style="margin:20px 0 0;font-size:13px;color:#999;">
          Je ontvangt deze mail omdat je de Kickstart Gids hebt aangevraagd op beinspiredbyus.be.<br>
          <a href="https://www.beinspiredbyus.be" style="color:#620E06;">beinspiredbyus.be</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ ok: false, error: "Ongeldige aanvraag." }, { status: 400 });
    }

    // Honeypot (bot protection)
    const website = clean(body.website, 200);
    if (website.length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const voornaam = clean(body.voornaam, 80);
    if (voornaam.length < 2) {
      return NextResponse.json({ ok: false, error: "Voer je voornaam in (min. 2 tekens)." }, { status: 400 });
    }

    const email = clean(body.email, 160).toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json({ ok: false, error: "Voer een geldig e-mailadres in." }, { status: 400 });
    }

    // Get IP for dedup / abuse prevention
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;

    // ── Supabase upsert ───────────────────────────────────────────────────────
    const supabase = getSupabaseAdmin();
    const { error: dbError } = await supabase.from("kickstart_leads").upsert(
      { voornaam, email, ip_address: ip, source: "website" },
      { onConflict: "email", ignoreDuplicates: false },
    );

    if (dbError) {
      console.error("[kickstart] Supabase error:", dbError.message);
      // Don't block the user on DB errors — still try to send the email
    }

    // ── Resend email ──────────────────────────────────────────────────────────
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.warn("[kickstart] RESEND_API_KEY not set — skipping email");
    } else {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Arno Ockerman <arno@beinspiredbyus.be>",
          to: [email],
          subject: "🚀 Jouw 7-Daagse Kickstart Gids staat klaar!",
          html: buildEmailHtml(voornaam),
        }),
      });

      if (!emailRes.ok) {
        const errBody = await emailRes.text().catch(() => "");
        console.error("[kickstart] Resend error:", emailRes.status, errBody);
        // Still return success — lead is saved
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[kickstart] Unexpected error:", err);
    return NextResponse.json({ ok: false, error: "Er is iets misgegaan. Probeer het opnieuw." }, { status: 500 });
  }
}
