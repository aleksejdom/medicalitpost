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
