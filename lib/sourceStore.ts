import crypto from "crypto";
import { db } from "./db";
import { RSS_SOURCES, RssSource } from "./sources";

/**
 * Verwaltbare News-Quellen (Admin-Backend) in Supabase (Tabelle mp_sources).
 * Wird beim ersten Zugriff mit den Standard-Quellen aus lib/sources.ts befüllt.
 */
export interface ManagedSource extends RssSource {
  id: string;
  enabled: boolean;
}

function sourceId(url: string): string {
  return crypto.createHash("sha1").update(url).digest("hex").slice(0, 8);
}

export async function getSources(): Promise<ManagedSource[]> {
  const { data, error } = await db()
    .from("mp_sources")
    .select("*")
    .order("name");
  if (error) {
    console.error("Quellen laden fehlgeschlagen:", error.message);
    return [];
  }

  if (!data || data.length === 0) {
    // Erststart: mit Standard-Quellen befüllen
    const seeded = RSS_SOURCES.map((source) => ({
      id: sourceId(source.url),
      name: source.name,
      url: source.url,
      language: source.language,
      mode: source.mode,
      enabled: true,
    }));
    const { error: seedError } = await db()
      .from("mp_sources")
      .upsert(seeded, { onConflict: "url", ignoreDuplicates: true });
    if (seedError) {
      console.error("Quellen-Seed fehlgeschlagen:", seedError.message);
    }
    return seeded as ManagedSource[];
  }

  return data as ManagedSource[];
}

export async function getEnabledSources(): Promise<ManagedSource[]> {
  return (await getSources()).filter((source) => source.enabled);
}

export async function addSource(input: {
  name: string;
  url: string;
  language?: "de" | "en";
  mode?: RssSource["mode"];
}): Promise<ManagedSource> {
  const source: ManagedSource = {
    id: sourceId(input.url),
    name: input.name,
    url: input.url,
    language: input.language || "de",
    mode: input.mode || "none",
    enabled: true,
  };
  const { error } = await db().from("mp_sources").insert(source);
  if (error) {
    if (error.code === "23505") {
      throw new Error("Diese Quelle existiert bereits.");
    }
    throw new Error(`Quelle speichern: ${error.message}`);
  }
  return source;
}

export async function removeSource(id: string): Promise<boolean> {
  const { data, error } = await db()
    .from("mp_sources")
    .delete()
    .eq("id", id)
    .select("id");
  return !error && (data || []).length > 0;
}

export async function setSourceEnabled(
  id: string,
  enabled: boolean
): Promise<boolean> {
  const { data, error } = await db()
    .from("mp_sources")
    .update({ enabled })
    .eq("id", id)
    .select("id");
  return !error && (data || []).length > 0;
}
