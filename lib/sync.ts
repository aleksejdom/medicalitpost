import { collectArticles } from "./newsService";
import { saveArticles, countArticles } from "./articleStore";
import { getSetting, setSetting } from "./db";

const LAST_SYNC_KEY = "last_sync";

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
  const saved = await saveArticles(articles);

  const result: SyncResult = {
    fetched: articles.length,
    saved,
    total: await countArticles(),
    errors,
    timestamp: new Date().toISOString(),
  };

  await setSetting(LAST_SYNC_KEY, result);
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

/**
 * Hält das Archiv tagesaktuell: synchronisiert automatisch,
 * wenn der letzte Sync älter als maxAgeMinutes ist.
 */
export async function ensureFreshArticles(maxAgeMinutes = 60): Promise<void> {
  try {
    const last = await getSetting<SyncResult | null>(LAST_SYNC_KEY, null);
    const ageMinutes = last
      ? (Date.now() - new Date(last.timestamp).getTime()) / 60000
      : Infinity;
    if (ageMinutes < maxAgeMinutes) return;
    await syncNews();
  } catch (error) {
    console.error("News-Sync fehlgeschlagen:", error);
  }
}
