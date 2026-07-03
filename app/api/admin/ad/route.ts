import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getNewsletterAd, saveNewsletterAd } from "@/lib/adStore";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getNewsletterAd());
}

/** Werbe-Section des Newsletters speichern. */
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== "object") {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  const saved = await saveNewsletterAd({
    enabled: Boolean(input.enabled),
    title: String(input.title ?? ""),
    text: String(input.text ?? ""),
    imageUrl: String(input.imageUrl ?? ""),
    linkUrl: String(input.linkUrl ?? ""),
    buttonText: String(input.buttonText ?? "Mehr erfahren"),
  });
  return NextResponse.json(saved);
}
