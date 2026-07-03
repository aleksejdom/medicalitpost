import crypto from "crypto";
import { db } from "./db";

/**
 * Newsletter-Abonnenten in Supabase (Tabelle mp_subscribers), DSGVO-konform:
 *  - Double-Opt-in (Status "pending" bis zur Bestätigung per E-Mail)
 *  - Einwilligung wird mit Zeitpunkt und Wortlaut dokumentiert
 *  - Abmeldung jederzeit per One-Click-Link (Token) möglich
 *  - Daten können im Admin-Backend vollständig gelöscht werden
 */
export interface Subscriber {
  email: string;
  token: string; // für Bestätigung und Abmeldung
  status: "pending" | "active" | "unsubscribed";
  createdAt: string;
  confirmedAt?: string;
  unsubscribedAt?: string;
  consentText: string;
}

export const CONSENT_TEXT =
  "Ich möchte den täglichen Newsletter von The Medical IT Post erhalten. " +
  "Die Einwilligung kann ich jederzeit über den Abmeldelink im Newsletter widerrufen.";

function rowToSubscriber(row: Record<string, unknown>): Subscriber {
  return {
    email: String(row.email),
    token: String(row.token),
    status: row.status as Subscriber["status"],
    createdAt: String(row.created_at || ""),
    confirmedAt: row.confirmed_at ? String(row.confirmed_at) : undefined,
    unsubscribedAt: row.unsubscribed_at
      ? String(row.unsubscribed_at)
      : undefined,
    consentText: String(row.consent_text || ""),
  };
}

export async function getSubscribers(): Promise<Subscriber[]> {
  const { data, error } = await db()
    .from("mp_subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Abonnenten laden fehlgeschlagen:", error.message);
    return [];
  }
  return (data || []).map(rowToSubscriber);
}

export async function getActiveSubscribers(): Promise<Subscriber[]> {
  const { data, error } = await db()
    .from("mp_subscribers")
    .select("*")
    .eq("status", "active");
  if (error) {
    console.error("Abonnenten laden fehlgeschlagen:", error.message);
    return [];
  }
  return (data || []).map(rowToSubscriber);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Legt einen Abonnenten an (Status pending) bzw. reaktiviert ihn. */
export async function subscribe(email: string): Promise<Subscriber> {
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) {
    throw new Error("Bitte eine gültige E-Mail-Adresse angeben.");
  }

  const { data: existing } = await db()
    .from("mp_subscribers")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();

  if (existing && existing.status === "active") {
    throw new Error("Diese E-Mail-Adresse ist bereits angemeldet.");
  }

  const subscriber = {
    email: normalized,
    token: crypto.randomBytes(24).toString("hex"),
    status: "pending",
    created_at: new Date().toISOString(),
    confirmed_at: null,
    unsubscribed_at: null,
    consent_text: CONSENT_TEXT,
  };

  const { error } = await db()
    .from("mp_subscribers")
    .upsert(subscriber, { onConflict: "email" });
  if (error) throw new Error(`Anmeldung speichern: ${error.message}`);

  return rowToSubscriber(subscriber);
}

/** Double-Opt-in: bestätigt eine Anmeldung über den Token aus der E-Mail. */
export async function confirmSubscription(
  token: string
): Promise<Subscriber | null> {
  if (!token) return null;
  const { data } = await db()
    .from("mp_subscribers")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (!data) return null;

  if (data.status !== "active") {
    await db()
      .from("mp_subscribers")
      .update({ status: "active", confirmed_at: new Date().toISOString() })
      .eq("token", token);
  }
  return rowToSubscriber({ ...data, status: "active" });
}

/** One-Click-Abmeldung über den Token aus dem Newsletter (DSGVO). */
export async function unsubscribeByToken(
  token: string
): Promise<Subscriber | null> {
  if (!token) return null;
  const { data } = await db()
    .from("mp_subscribers")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (!data) return null;

  await db()
    .from("mp_subscribers")
    .update({
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("token", token);
  return rowToSubscriber({ ...data, status: "unsubscribed" });
}

/** Admin: Status einer Adresse ändern (z.B. abmelden). */
export async function setSubscriberStatus(
  email: string,
  status: Subscriber["status"]
): Promise<boolean> {
  const update: Record<string, unknown> = { status };
  if (status === "unsubscribed") {
    update.unsubscribed_at = new Date().toISOString();
  }
  const { data, error } = await db()
    .from("mp_subscribers")
    .update(update)
    .eq("email", email)
    .select("email");
  return !error && (data || []).length > 0;
}

/** Admin/DSGVO: Daten einer Adresse vollständig löschen. */
export async function deleteSubscriber(email: string): Promise<boolean> {
  const { data, error } = await db()
    .from("mp_subscribers")
    .delete()
    .eq("email", email)
    .select("email");
  return !error && (data || []).length > 0;
}
