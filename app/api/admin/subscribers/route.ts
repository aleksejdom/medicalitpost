import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import {
  deleteSubscriber,
  getSubscribers,
  setSubscriberStatus,
} from "@/lib/subscriberStore";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getSubscribers());
}

/** Abo-Status ändern (aktivieren/abmelden). */
export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { email, status } = await request.json().catch(() => ({}));
  if (!email || !["pending", "active", "unsubscribed"].includes(status)) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  const ok = setSubscriberStatus(email, status);
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Adresse nicht gefunden." }, { status: 404 });
}

/** DSGVO: Abonnenten-Daten vollständig löschen. */
export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { email } = await request.json().catch(() => ({}));
  const ok = deleteSubscriber(String(email || ""));
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Adresse nicht gefunden." }, { status: 404 });
}
