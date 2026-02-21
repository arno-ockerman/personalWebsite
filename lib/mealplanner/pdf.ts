import type { MealPlan, MealType } from "@/lib/mealplanner/types";

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
  // Keep ASCII-only to avoid encoding/xref offset issues with UTF-8.
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

function mealTypeLabel(t: MealType) {
  switch (t) {
    case "breakfast":
      return "Ontbijt";
    case "lunch":
      return "Lunch";
    case "dinner":
      return "Diner";
    case "snack":
      return "Snack";
  }
}

function dayLabel(day: MealPlan["days"][number]["day"]) {
  switch (day) {
    case "Mon":
      return "Ma";
    case "Tue":
      return "Di";
    case "Wed":
      return "Wo";
    case "Thu":
      return "Do";
    case "Fri":
      return "Vr";
    case "Sat":
      return "Za";
    case "Sun":
      return "Zo";
  }
}

function goalLabel(goal: MealPlan["goal"]) {
  if (goal === "weight_loss") return "Afvallen";
  if (goal === "muscle") return "Spieropbouw";
  return "Onderhoud";
}

export function renderMealPlanPdf(plan: MealPlan) {
  const A4 = { w: 595.28, h: 841.89 };
  const margin = 44;

  const brandPrimary = { r: 0x62 / 255, g: 0x0e / 255, b: 0x06 / 255 };
  const brandAccent = { r: 0x42 / 255, g: 0x5c / 255, b: 0x59 / 255 };

  const headerHeight = 64;

  const page1: string[] = [];
  page1.push("q");
  page1.push(`${brandPrimary.r.toFixed(3)} ${brandPrimary.g.toFixed(3)} ${brandPrimary.b.toFixed(3)} rg`);
  page1.push(`0 ${A4.h - headerHeight} ${A4.w} ${headerHeight} re f`);
  page1.push("Q");

  page1.push("BT");
  page1.push("/F1 22 Tf");
  page1.push("1 1 1 rg");
  page1.push(`${margin} ${A4.h - 42} Td`);
  page1.push(`(${escapePdfText("Jouw persoonlijk weekmenu")}) Tj`);
  page1.push("ET");

  page1.push("BT");
  page1.push("/F1 11 Tf");
  page1.push("1 1 1 rg");
  page1.push(`${margin} ${A4.h - 60} Td`);
  page1.push(
    `(${escapePdfText(`Doel: ${goalLabel(plan.goal)} • ${new Date(plan.createdAt).toLocaleDateString("nl-BE")}`)}) Tj`,
  );
  page1.push("ET");

  let cursorY = A4.h - headerHeight - 26;
  const lineHeight = 14;

  page1.push("BT");
  page1.push("/F1 11 Tf");
  page1.push("0 0 0 rg");
  page1.push(`${margin} ${cursorY} Td`);
  page1.push(`(${escapePdfText("Overzicht (Ma-Zo)")}) Tj`);
  page1.push("ET");
  cursorY -= 14;

  const maxLinesOnPage1 = 42;
  let usedLines = 0;

  for (const day of plan.days) {
    if (usedLines > maxLinesOnPage1) break;

    page1.push("BT");
    page1.push("/F1 11 Tf");
    page1.push(`${brandAccent.r.toFixed(3)} ${brandAccent.g.toFixed(3)} ${brandAccent.b.toFixed(3)} rg`);
    page1.push(`${margin} ${cursorY} Td`);
    page1.push(`(${escapePdfText(dayLabel(day.day))}) Tj`);
    page1.push("ET");

    const startX = margin + 30;
    let rowY = cursorY;
    for (const meal of day.meals) {
      const label = `${mealTypeLabel(meal.type)}: ${meal.recipe.name}`;
      const lines = wrapText(label, 62);
      for (const line of lines) {
        if (usedLines > maxLinesOnPage1) break;
        page1.push("BT");
        page1.push("/F1 10 Tf");
        page1.push("0 0 0 rg");
        page1.push(`${startX} ${rowY} Td`);
        page1.push(`(${escapePdfText(line)}) Tj`);
        page1.push("ET");
        rowY -= lineHeight;
        usedLines += 1;
      }
    }

    cursorY = rowY - 6;
    usedLines += 1;
  }

  const weekMacroText = `Week totaal: ${plan.weekMacros.calories} kcal | P ${plan.weekMacros.protein}g | C ${plan.weekMacros.carbs}g | F ${plan.weekMacros.fat}g`;
  page1.push("BT");
  page1.push("/F1 10 Tf");
  page1.push("0 0 0 rg");
  page1.push(`${margin} ${margin + 18} Td`);
  page1.push(`(${escapePdfText(weekMacroText)}) Tj`);
  page1.push("ET");

  page1.push("BT");
  page1.push("/F1 9 Tf");
  page1.push("0 0 0 rg");
  page1.push(`${margin} ${margin} Td`);
  page1.push(
    `(${escapePdfText("Tip: dit is een voorbeeldweek. Pas porties aan op je energieverbruik. - Be Inspired By Us")}) Tj`,
  );
  page1.push("ET");

  const page2: string[] = [];
  page2.push("q");
  page2.push(`${brandAccent.r.toFixed(3)} ${brandAccent.g.toFixed(3)} ${brandAccent.b.toFixed(3)} rg`);
  page2.push(`0 ${A4.h - headerHeight} ${A4.w} ${headerHeight} re f`);
  page2.push("Q");

  page2.push("BT");
  page2.push("/F1 22 Tf");
  page2.push("1 1 1 rg");
  page2.push(`${margin} ${A4.h - 42} Td`);
  page2.push(`(${escapePdfText("Boodschappenlijst")}) Tj`);
  page2.push("ET");

  let listY = A4.h - headerHeight - 26;
  page2.push("BT");
  page2.push("/F1 10 Tf");
  page2.push("0 0 0 rg");
  page2.push(`${margin} ${listY} Td`);
  page2.push(`(${escapePdfText("Geaggregeerd op basis van je weekmenu.")}) Tj`);
  page2.push("ET");
  listY -= 22;

  const maxChars = 84;
  for (const item of plan.shoppingList) {
    const line = item.count > 1 ? `${item.item} (x${item.count})` : item.item;
    const lines = wrapText(line, maxChars);
    for (const l of lines) {
      if (listY < margin + 18) break;
      page2.push("BT");
      page2.push("/F1 10 Tf");
      page2.push("0 0 0 rg");
      page2.push(`${margin} ${listY} Td`);
      page2.push(`(${escapePdfText(`- ${l}`)}) Tj`);
      page2.push("ET");
      listY -= 13;
    }
    if (listY < margin + 18) break;
  }

  page2.push("BT");
  page2.push("/F1 9 Tf");
  page2.push("0 0 0 rg");
  page2.push(`${margin} ${margin} Td`);
  page2.push(`(${escapePdfText("Klaar voor een plan op maat? Boek je gratis gesprek via beinspiredbyus.be/contact")}) Tj`);
  page2.push("ET");

  const content1 = page1.join("\n") + "\n";
  const content2 = page2.join("\n") + "\n";

  const objects: PdfObject[] = [];
  let id = 1;

  const catalogId = id++;
  const pagesId = id++;
  const fontId = id++;
  const page1Id = id++;
  const page2Id = id++;
  const content1Id = id++;
  const content2Id = id++;

  objects.push({ id: catalogId, body: `<< /Type /Catalog /Pages ${pagesId} 0 R >>` });
  objects.push({
    id: pagesId,
    body: `<< /Type /Pages /Kids [${page1Id} 0 R ${page2Id} 0 R] /Count 2 >>`,
  });
  objects.push({
    id: fontId,
    body: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
  });
  objects.push({
    id: page1Id,
    body:
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${A4.w} ${A4.h}] ` +
      `/Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${content1Id} 0 R >>`,
  });
  objects.push({
    id: page2Id,
    body:
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${A4.w} ${A4.h}] ` +
      `/Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${content2Id} 0 R >>`,
  });

  objects.push({
    id: content1Id,
    body: `<< /Length ${Buffer.byteLength(content1, "utf8")} >>\nstream\n${content1}endstream`,
  });
  objects.push({
    id: content2Id,
    body: `<< /Length ${Buffer.byteLength(content2, "utf8")} >>\nstream\n${content2}endstream`,
  });

  return buildPdf(objects, catalogId);
}
