import { NextRequest, NextResponse } from "next/server";
import { confirmSubscription } from "@/lib/subscriberStore";

export const dynamic = "force-dynamic";

/** Double-Opt-in-Bestätigung über den Link aus der E-Mail. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const subscriber = confirmSubscription(token);
  const target = subscriber
    ? "/newsletter?status=bestaetigt"
    : "/newsletter?status=ungueltig";
  return NextResponse.redirect(new URL(target, request.nextUrl.origin));
}
