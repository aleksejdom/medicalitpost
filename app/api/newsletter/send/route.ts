import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { sendDailyNewsletter } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

/**
 * Versendet den täglichen Newsletter (1–2 aktuelle News) an alle aktiven
 * Abonnenten. Trigger: Admin-Backend oder Cron-Job, z.B. täglich 07:00:
 *   curl -X POST -H "Authorization: Bearer $SYNC_API_KEY" https://domain/api/newsletter/send
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.SYNC_API_KEY;
  const bearerOk =
    apiKey && request.headers.get("authorization") === `Bearer ${apiKey}`;

  if (!bearerOk && !(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const report = await sendDailyNewsletter();
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
