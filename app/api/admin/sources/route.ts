import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import {
  addSource,
  getSources,
  removeSource,
  setSourceEnabled,
} from "@/lib/sourceStore";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getSources());
}

/** Neue RSS-Quelle hinzufügen (mit Feed-Validierung). */
export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const input = await request.json().catch(() => null);
  const name = String(input?.name || "").trim();
  const url = String(input?.url || "").trim();
  const mode = ["filter-health", "filter-it", "none"].includes(input?.mode)
    ? input.mode
    : "none";
  const language = input?.language === "en" ? "en" : "de";

  if (!name || !/^https?:\/\//.test(url)) {
    return NextResponse.json(
      { error: "Name und gültige Feed-URL (https://…) angeben." },
      { status: 400 }
    );
  }

  // Feed testen, bevor er gespeichert wird
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (MedicalITPost NewsBot)" },
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.text()).trimStart();
    if (!body.startsWith("<?xml") && !/^<(rss|feed)[\s>]/.test(body)) {
      throw new Error("Antwort ist kein RSS/Atom-Feed (XML).");
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: `Feed nicht nutzbar: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      { status: 400 }
    );
  }

  try {
    return NextResponse.json(addSource({ name, url, mode, language }));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    );
  }
}

/** Quelle aktivieren/deaktivieren. */
export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, enabled } = await request.json().catch(() => ({}));
  const ok = setSourceEnabled(String(id || ""), Boolean(enabled));
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Quelle nicht gefunden." }, { status: 404 });
}

/** Quelle entfernen. */
export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await request.json().catch(() => ({}));
  const ok = removeSource(String(id || ""));
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Quelle nicht gefunden." }, { status: 404 });
}
