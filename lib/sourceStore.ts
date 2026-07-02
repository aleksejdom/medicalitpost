import crypto from "crypto";
import { readJson, writeJson } from "./jsonStore";
import { RSS_SOURCES, RssSource } from "./sources";

/**
 * Verwaltbare News-Quellen (Admin-Backend). Wird beim ersten Zugriff
 * mit den Standard-Quellen aus lib/sources.ts befüllt.
 */
export interface ManagedSource extends RssSource {
  id: string;
  enabled: boolean;
}

const FILE = "sources.json";

function seed(): ManagedSource[] {
  const seeded = RSS_SOURCES.map((source) => ({
    ...source,
    id: crypto.createHash("sha1").update(source.url).digest("hex").slice(0, 8),
    enabled: true,
  }));
  writeJson(FILE, seeded);
  return seeded;
}

export function getSources(): ManagedSource[] {
  const sources = readJson<ManagedSource[] | null>(FILE, null);
  return sources ?? seed();
}

export function getEnabledSources(): ManagedSource[] {
  return getSources().filter((source) => source.enabled);
}

export function addSource(input: {
  name: string;
  url: string;
  language?: "de" | "en";
  mode?: RssSource["mode"];
}): ManagedSource {
  const sources = getSources();
  if (sources.some((source) => source.url === input.url)) {
    throw new Error("Diese Quelle existiert bereits.");
  }
  const source: ManagedSource = {
    id: crypto.createHash("sha1").update(input.url).digest("hex").slice(0, 8),
    name: input.name,
    url: input.url,
    language: input.language || "de",
    mode: input.mode || "none",
    enabled: true,
  };
  sources.push(source);
  writeJson(FILE, sources);
  return source;
}

export function removeSource(id: string): boolean {
  const sources = getSources();
  const remaining = sources.filter((source) => source.id !== id);
  if (remaining.length === sources.length) return false;
  writeJson(FILE, remaining);
  return true;
}

export function setSourceEnabled(id: string, enabled: boolean): boolean {
  const sources = getSources();
  const source = sources.find((s) => s.id === id);
  if (!source) return false;
  source.enabled = enabled;
  writeJson(FILE, sources);
  return true;
}
