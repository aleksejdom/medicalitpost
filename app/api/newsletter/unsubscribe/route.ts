import { NextRequest, NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/subscriberStore";

export const dynamic = "force-dynamic";

/** One-Click-Abmeldung über den Link im Newsletter (DSGVO). */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const subscriber = await unsubscribeByToken(token);
  const target = subscriber
    ? "/newsletter?status=abgemeldet"
    : "/newsletter?status=ungueltig";
  return NextResponse.redirect(new URL(target, request.nextUrl.origin));
}

/**
 * One-Click-Unsubscribe nach RFC 8058: Gmail/Yahoo rufen die URL aus dem
 * List-Unsubscribe-Header per POST auf (ohne Nutzer-Interaktion) und
 * erwarten eine 2xx-Antwort ohne Redirect.
 */
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const subscriber = await unsubscribeByToken(token);
  if (!subscriber) {
    return NextResponse.json({ error: "Ungültiger Token" }, { status: 404 });
  }
  return NextResponse.json({ status: "abgemeldet" });
}
