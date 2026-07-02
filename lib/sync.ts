import fs from "fs";
import path from "path";
import { collectArticles } from "./newsService";
import { saveArticles, getAllArticles } from "./articleStore";

const SYNC_STATE_FILE = path.join(
  process.cwd(),
  "public",
  "articles",
  ".last-sync.json"
);

export interface SyncResult {
  fetched: number;
  saved: number;
  total: number;
  errors: string[];
  timestamp: string;
}

let syncInFlight: Promise<SyncResult> | null = null;

async function runSync(): Promise<SyncResult> {
  const { articles, errors } = await collectArticles();
  const saved = saveArticles(articles);

  const result: SyncResult = {
    fetched: articles.length,
    saved,
    total: getAllArticles().length,
    errors,
    timestamp: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(SYNC_STATE_FILE), { recursive: true });
  fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(result, null, 2), "utf-8");

  return result;
}

/** Sync ausführen; parallele Aufrufe teilen sich einen Lauf. */
export function syncNews(): Promise<SyncResult> {
  if (!syncInFlight) {
    syncInFlight = runSync().finally(() => {
      syncInFlight = null;
    });
  }
  return syncInFlight;
}

function lastSyncAgeMinutes(): number {
  try {
    const state = JSON.parse(fs.readFileSync(SYNC_STATE_FILE, "utf-8"));
    return (Date.now() - new Date(state.timestamp).getTime()) / 60000;
  } catch {
    return Infinity;
  }
}

/**
 * Hält das Archiv tagesaktuell: synchronisiert automatisch,
 * wenn der letzte Sync älter als maxAgeMinutes ist.
 */
export async function ensureFreshArticles(maxAgeMinutes = 60): Promise<void> {
  if (lastSyncAgeMinutes() < maxAgeMinutes) return;
  try {
    await syncNews();
  } catch (error) {
    console.error("News-Sync fehlgeschlagen:", error);
  }
}
