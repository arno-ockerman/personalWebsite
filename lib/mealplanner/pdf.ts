import type { MealPlan, MealType } from "@/lib/mealplanner/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function toAscii(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdfText(input: string) {
  const ascii = toAscii(input);
  return ascii.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapText(text: string, maxChars: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line.length === 0 ? w : `${line} ${w}`;
    if (next.length > maxChars && line.length > 0) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line.length > 0) lines.push(line);
  return lines;
}

type PdfObject = { id: number; body: string };

function buildPdf(objects: PdfObject[], rootId: number) {
  let out = "%PDF-1.4\n%\n";

  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(out, "utf8"));
    out += `${obj.id} 0 obj\n${obj.body}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(out, "utf8");
  out += `xref\n0 ${objects.length + 1}\n`;
  out += `0000000000 65535 f \n`;
  for (const off of offsets) {
    out += `${off.toString().padStart(10, "0")} 00000 n \n`;
  }

  out += `trailer\n<< /Size ${objects.length + 1} /Root ${rootId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(out, "utf8");
}

// ─── Labels ─────────────────────────────────────────────────────────────────

function mealTypeLabel(t: MealType) {
  switch (t) {
    case "breakfast": return "Ontbijt";
    case "lunch":     return "Lunch";
    case "dinner":    return "Diner";
    case "snack":     return "Snack";
  }
}

function dayLabel(day: MealPlan["days"][number]["day"]) {
  switch (day) {
    case "Mon": return "Maandag";
    case "Tue": return "Dinsdag";
    case "Wed": return "Woensdag";
    case "Thu": return "Donderdag";
    case "Fri": return "Vrijdag";
    case "Sat": return "Zaterdag";
    case "Sun": return "Zondag";
  }
}

function dayShort(day: MealPlan["days"][number]["day"]) {
  switch (day) {
    case "Mon": return "Ma";
    case "Tue": return "Di";
    case "Wed": return "Wo";
    case "Thu": return "Do";
    case "Fri": return "Vr";
    case "Sat": return "Za";
    case "Sun": return "Zo";
  }
}

function goalLabel(goal: MealPlan["goal"]) {
  if (goal === "weight_loss") return "Afvallen";
  if (goal === "muscle") return "Spieropbouw";
  return "Onderhoud";
}

// ─── PDF Stream Builder ──────────────────────────────────────────────────────

type Rgb = { r: number; g: number; b: number };

function rgb(hex: string): Rgb {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: ((n >> 16) & 0xff) / 255, g: ((n >> 8) & 0xff) / 255, b: (n & 0xff) / 255 };
}

// Brand colours
const BURGUNDY = rgb("#620E06");
const GREEN    = rgb("#425C59");
const AMBER    = rgb("#D5CBBA");
const WHITE    = { r: 1, g: 1, b: 1 };
const DARK     = { r: 0.12, g: 0.12, b: 0.12 };
const MUTED    = { r: 0.45, g: 0.45, b: 0.45 };

function setRgbFill(c: Rgb) {
  return `${c.r.toFixed(3)} ${c.g.toFixed(3)} ${c.b.toFixed(3)} rg`;
}

function setRgbStroke(c: Rgb) {
  return `${c.r.toFixed(3)} ${c.g.toFixed(3)} ${c.b.toFixed(3)} RG`;
}

function rect(x: number, y: number, w: number, h: number, fill: Rgb, stroke?: Rgb): string[] {
  const ops: string[] = ["q"];
  ops.push(setRgbFill(fill));
  if (stroke) {
    ops.push(setRgbStroke(stroke));
    ops.push("0.5 w");
    ops.push(`${x} ${y} ${w} ${h} re B`);
  } else {
    ops.push(`${x} ${y} ${w} ${h} re f`);
  }
  ops.push("Q");
  return ops;
}

function text(
  content: string,
  x: number,
  y: number,
  size: number,
  color: Rgb,
  font: "/F1" | "/F2" = "/F1",
): string[] {
  return [
    "BT",
    `${font} ${size} Tf`,
    setRgbFill(color),
    `${x} ${y} Td`,
    `(${escapePdfText(content)}) Tj`,
    "ET",
  ];
}

function hLine(x: number, y: number, w: number, color: Rgb, thickness = 0.5): string[] {
  return [
    "q",
    setRgbStroke(color),
    `${thickness} w`,
    `${x} ${y} m ${x + w} ${y} l S`,
    "Q",
  ];
}

// ─── Main render ────────────────────────────────────────────────────────────

export function renderMealPlanPdf(plan: MealPlan) {
  const A4  = { w: 595.28, h: 841.89 };
  const M   = 40;          // margin
  const CW  = A4.w - M * 2; // content width

  const HEADER_H = 72;
  const FOOTER_H = 32;
  const CONTENT_BOT = M + FOOTER_H + 8;

  // ── Page factory ──────────────────────────────────────────────────────────

  function makePage(
    title: string,
    subtitle: string,
    bodyCb: (ops: string[], cursorY: { v: number }) => void,
  ): string {
    const ops: string[] = [];

    // Header background
    ops.push(...rect(0, A4.h - HEADER_H, A4.w, HEADER_H, BURGUNDY));

    // Header accent bar (top 4px green)
    ops.push(...rect(0, A4.h - 4, A4.w, 4, GREEN));

    // Logo area — "Make It Happen" word-mark
    ops.push(...text("MAKE IT HAPPEN", M, A4.h - 28, 16, WHITE, "/F2"));
    ops.push(...text("by beinspiredbyus.be", M, A4.h - 44, 8, { r: 0.85, g: 0.7, b: 0.65 }));

    // Page title right-aligned-ish
    ops.push(...text(title,    M, A4.h - 60, 11, WHITE));
    ops.push(...text(subtitle, M, A4.h - 72 + 4, 8, { r: 0.85, g: 0.7, b: 0.65 }));

    // Amber separator
    ops.push(...hLine(M, A4.h - HEADER_H - 6, CW, AMBER));

    // Body
    const cursor = { v: A4.h - HEADER_H - 22 };
    bodyCb(ops, cursor);

    // Footer background
    ops.push(...rect(0, 0, A4.w, CONTENT_BOT - 8, AMBER));

    // Footer text
    ops.push(
      ...text(
        "Generated by beinspiredbyus.be",
        M,
        12,
        7.5,
        GREEN,
      ),
    );
    ops.push(
      ...text(
        `Plan ID: ${plan.id}  |  ${new Date(plan.createdAt).toLocaleDateString("nl-BE")}`,
        A4.w - M - 160,
        12,
        7.5,
        GREEN,
      ),
    );

    return ops.join("\n") + "\n";
  }

  // ── Page 1: Cover / Overview ──────────────────────────────────────────────

  const page1Content = makePage(
    `Weekmenu - Doel: ${goalLabel(plan.goal)}`,
    `${new Date(plan.createdAt).toLocaleDateString("nl-BE")}  |  ${plan.preferences.mealsPerDay} maaltijden/dag`,
    (ops, cursor) => {
      // Week macro summary box
      const boxH = 50;
      ops.push(...rect(M, cursor.v - boxH, CW, boxH, AMBER));

      ops.push(...text("Week samenvatting", M + 10, cursor.v - 14, 9, GREEN, "/F2"));

      const weekMacros = plan.weekMacros;
      const avg = {
        cal:   Math.round(weekMacros.calories / 7),
        prot:  Math.round(weekMacros.protein / 7),
        carbs: Math.round(weekMacros.carbs / 7),
        fat:   Math.round(weekMacros.fat / 7),
      };

      const macroBoxW = CW / 4;
      const macroItems = [
        { label: "Gem. kcal/dag", val: `${avg.cal} kcal` },
        { label: "Gem. eiwit/dag", val: `${avg.prot}g` },
        { label: "Gem. koolh/dag", val: `${avg.carbs}g` },
        { label: "Gem. vet/dag",   val: `${avg.fat}g` },
      ];

      macroItems.forEach((item, idx) => {
        const bx = M + idx * macroBoxW;
        ops.push(...text(item.val,   bx + 10, cursor.v - 32, 12, BURGUNDY, "/F2"));
        ops.push(...text(item.label, bx + 10, cursor.v - 44, 7.5, MUTED));
      });

      cursor.v -= boxH + 16;

      // Day-by-day overview table
      for (const day of plan.days) {
        if (cursor.v < CONTENT_BOT + 40) break;

        // Day row header
        ops.push(...rect(M, cursor.v - 16, CW, 16, GREEN));
        ops.push(...text(dayLabel(day.day), M + 6, cursor.v - 11, 9, WHITE, "/F2"));

        const dayMacroTxt = `${day.macros.calories} kcal  |  P ${day.macros.protein}g  |  C ${day.macros.carbs}g  |  F ${day.macros.fat}g`;
        ops.push(...text(dayMacroTxt, M + 90, cursor.v - 11, 7.5, { r: 0.8, g: 0.9, b: 0.88 }));

        cursor.v -= 16;

        for (const meal of day.meals) {
          if (cursor.v < CONTENT_BOT + 12) break;
          const mealLine = `${mealTypeLabel(meal.type)}: ${meal.recipe.name}`;
          const hlTag = meal.recipe.premium ? " [HL]" : "";
          const lines = wrapText(mealLine + hlTag, 80);
          for (const line of lines) {
            if (cursor.v < CONTENT_BOT + 12) break;
            ops.push(...text(line, M + 10, cursor.v - 10, 8.5, DARK));
            cursor.v -= 12;
          }
          ops.push(
            ...text(
              `${meal.recipe.calories} kcal • P ${meal.recipe.protein}g • C ${meal.recipe.carbs}g • F ${meal.recipe.fat}g`,
              M + 10,
              cursor.v - 8,
              7,
              MUTED,
            ),
          );
          cursor.v -= 11;
        }

        ops.push(...hLine(M, cursor.v - 3, CW, { r: 0.88, g: 0.88, b: 0.88 }));
        cursor.v -= 8;
      }
    },
  );

  // ── Page 2: Detailed Recipe Cards + Shopping List ─────────────────────────

  const page2Content = makePage(
    "Recepten details",
    "Ingrediënten per maaltijd",
    (ops, cursor) => {
      for (const day of plan.days) {
        if (cursor.v < CONTENT_BOT + 60) break;

        // Day header
        ops.push(...rect(M, cursor.v - 14, CW, 14, BURGUNDY));
        ops.push(...text(dayShort(day.day) + "  " + dayLabel(day.day), M + 6, cursor.v - 10, 9, WHITE, "/F2"));
        cursor.v -= 14;

        for (const meal of day.meals) {
          if (cursor.v < CONTENT_BOT + 50) break;

          // Meal type badge
          ops.push(...rect(M + 6, cursor.v - 12, 50, 12, meal.recipe.premium ? BURGUNDY : GREEN));
          ops.push(...text(mealTypeLabel(meal.type), M + 8, cursor.v - 9, 7, WHITE));

          // Premium badge
          if (meal.recipe.premium && meal.recipe.premiumProduct) {
            ops.push(...rect(M + 60, cursor.v - 12, 90, 12, { r: 0.98, g: 0.92, b: 0.85 }));
            ops.push(...text(`★ ${meal.recipe.premiumProduct}`, M + 63, cursor.v - 9, 6.5, BURGUNDY));
          }

          cursor.v -= 14;

          // Recipe name
          ops.push(...text(meal.recipe.name, M + 6, cursor.v - 10, 9.5, DARK, "/F2"));
          cursor.v -= 12;

          // Macros inline
          ops.push(
            ...text(
              `${meal.recipe.calories} kcal  •  Eiwit ${meal.recipe.protein}g  •  Koolh. ${meal.recipe.carbs}g  •  Vet ${meal.recipe.fat}g`,
              M + 6,
              cursor.v - 9,
              7.5,
              GREEN,
            ),
          );
          cursor.v -= 12;

          // Ingredients
          for (const ing of meal.recipe.ingredients) {
            if (cursor.v < CONTENT_BOT + 12) break;
            ops.push(...text(`• ${ing}`, M + 14, cursor.v - 8, 7.5, MUTED));
            cursor.v -= 10;
          }

          cursor.v -= 5;
          ops.push(...hLine(M + 6, cursor.v, CW - 12, AMBER, 0.3));
          cursor.v -= 6;
        }

        cursor.v -= 8;
      }
    },
  );

  // ── Page 3: Shopping List ─────────────────────────────────────────────────

  const page3Content = makePage(
    "Boodschappenlijst",
    "Alle ingrediënten voor de week, gesorteerd",
    (ops, cursor) => {
      // Grouped shopping list — two columns
      const colW = (CW - 10) / 2;
      const left  = M;
      const right = M + colW + 10;

      let col = 0;
      let leftY  = cursor.v;
      let rightY = cursor.v;

      ops.push(
        ...text(
          "Tip: vink af terwijl je winkelt.",
          M,
          cursor.v - 10,
          7.5,
          MUTED,
        ),
      );
      cursor.v -= 20;
      leftY  = cursor.v;
      rightY = cursor.v;

      for (const item of plan.shoppingList) {
        const label = item.count > 1 ? `${item.item} (x${item.count})` : item.item;
        const curX = col === 0 ? left : right;
        const curY = col === 0 ? leftY : rightY;

        if (curY < CONTENT_BOT + 14) break;

        // Highlight premium products
        const isHL = label.toLowerCase().includes("formula 1") ||
          label.toLowerCase().includes("herbal tea") ||
          label.toLowerCase().includes("aloe vera") ||
          label.toLowerCase().includes("protein bar") ||
          label.toLowerCase().includes("protein drink mix");

        ops.push(
          ...text(
            `${isHL ? "★ " : "• "}${label}`,
            curX + 4,
            curY - 9,
            8,
            isHL ? BURGUNDY : DARK,
          ),
        );

        if (col === 0) {
          leftY -= 13;
          col = 1;
        } else {
          rightY -= 13;
          col = 0;
        }
      }

      // Promo note
      const noteY = Math.min(leftY, rightY) - 20;
      if (noteY > CONTENT_BOT + 30) {
        ops.push(...rect(M, noteY - 28, CW, 28, { r: 0.98, g: 0.94, b: 0.91 }));
        ops.push(
          ...text(
            "Proteïneproducten (★) verkrijgbaar via beinspiredbyus.be/contact",
            M + 8,
            noteY - 14,
            8,
            BURGUNDY,
            "/F2",
          ),
        );
        ops.push(
          ...text(
            "Gratis persoonlijk advies? Boek een gratis gesprek via de website.",
            M + 8,
            noteY - 24,
            7.5,
            GREEN,
          ),
        );
      }
    },
  );

  // ── Assemble PDF objects ───────────────────────────────────────────────────

  const objects: PdfObject[] = [];
  let id = 1;

  const catalogId   = id++;
  const pagesId     = id++;
  const fontRegId   = id++;
  const fontBoldId  = id++;
  const page1Id     = id++;
  const page2Id     = id++;
  const page3Id     = id++;
  const content1Id  = id++;
  const content2Id  = id++;
  const content3Id  = id++;

  objects.push({ id: catalogId, body: `<< /Type /Catalog /Pages ${pagesId} 0 R >>` });
  objects.push({
    id: pagesId,
    body: `<< /Type /Pages /Kids [${page1Id} 0 R ${page2Id} 0 R ${page3Id} 0 R] /Count 3 >>`,
  });
  objects.push({ id: fontRegId,  body: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>` });
  objects.push({ id: fontBoldId, body: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>` });

  const fontResources = `/Font << /F1 ${fontRegId} 0 R /F2 ${fontBoldId} 0 R >>`;

  for (const [pgId, contId, content] of [
    [page1Id, content1Id, page1Content],
    [page2Id, content2Id, page2Content],
    [page3Id, content3Id, page3Content],
  ] as [number, number, string][]) {
    objects.push({
      id: pgId,
      body:
        `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${A4.w} ${A4.h}] ` +
        `/Resources << ${fontResources} >> /Contents ${contId} 0 R >>`,
    });
    objects.push({
      id: contId,
      body: `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}endstream`,
    });
  }

  return buildPdf(objects, catalogId);
}
