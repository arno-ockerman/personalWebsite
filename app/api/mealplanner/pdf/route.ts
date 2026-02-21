import { NextResponse } from "next/server";
import { base64UrlDecodeToString } from "@/lib/mealplanner/base64url";
import { renderMealPlanPdf } from "@/lib/mealplanner/pdf";
import type { MealPlan } from "@/lib/mealplanner/types";

export const runtime = "nodejs";

function safeJsonParse(input: string) {
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return null;
  }
}

function isMealPlan(value: unknown): value is MealPlan {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "string") return false;
  if (typeof v.createdAt !== "string") return false;
  if (typeof v.goal !== "string") return false;
  if (!Array.isArray(v.days)) return false;
  if (!Array.isArray(v.shoppingList)) return false;
  return true;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const payload = url.searchParams.get("payload");
    if (!payload) return NextResponse.json({ ok: false, error: "Missing payload." }, { status: 400 });
    if (payload.length > 80_000) {
      return NextResponse.json({ ok: false, error: "Payload too large." }, { status: 400 });
    }

    const json = base64UrlDecodeToString(payload);
    const parsed = safeJsonParse(json);
    if (!isMealPlan(parsed)) return NextResponse.json({ ok: false, error: "Invalid plan." }, { status: 400 });

    const pdf = renderMealPlanPdf(parsed);

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="weekmenu-${parsed.id}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Onbekende fout." },
      { status: 500 },
    );
  }
}

