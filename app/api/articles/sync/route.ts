import { NextRequest, NextResponse } from "next/server";
import { syncNews } from "@/lib/sync";

export const dynamic = "force-dynamic";

/**
 * Manueller/automatisierter Sync-Trigger, z.B. für einen Cron-Job:
 *   curl http://localhost:3000/api/articles/sync
 * Optional abgesichert über die Umgebungsvariable SYNC_API_KEY.
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.SYNC_API_KEY;
  if (apiKey) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await syncNews();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
