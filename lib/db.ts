import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Serverseitiger Supabase-Client (Service-Key, umgeht RLS).
 * Der Key darf NIE in Client-Komponenten importiert werden.
 * Tabellen tragen das Präfix mp_ (geteiltes Supabase-Projekt).
 */
let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein (.env bzw. Vercel-Env)."
      );
    }
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

/** Key-Value-Einstellungen (Werbe-Section, Sende-Log, Sync-Zeitpunkt). */
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await db()
    .from("mp_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error || !data) return fallback;
  return data.value as T;
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const { error } = await db()
    .from("mp_settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw new Error(`Einstellung ${key} speichern: ${error.message}`);
}
