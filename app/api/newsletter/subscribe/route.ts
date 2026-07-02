import { NextRequest, NextResponse } from "next/server";
import { subscribe } from "@/lib/subscriberStore";
import { sendConfirmationMail } from "@/lib/newsletter";

export const dynamic = "force-dynamic";

/** Newsletter-Anmeldung (Schritt 1 des Double-Opt-in). */
export async function POST(request: NextRequest) {
  const { email, consent } = await request
    .json()
    .catch(() => ({ email: "", consent: false }));

  if (!consent) {
    return NextResponse.json(
      { error: "Bitte der Einwilligung zustimmen (DSGVO)." },
      { status: 400 }
    );
  }

  try {
    const subscriber = subscribe(String(email || ""));
    await sendConfirmationMail(subscriber);
    return NextResponse.json({
      ok: true,
      message:
        "Fast geschafft! Bitte bestätigen Sie Ihre Anmeldung über den Link in der E-Mail, die wir Ihnen gerade geschickt haben.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 400 }
    );
  }
}
