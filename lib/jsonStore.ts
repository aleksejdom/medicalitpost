import fs from "fs";
import path from "path";

/**
 * Kleine Helfer für JSON-Dateien im (nicht öffentlichen) data/-Verzeichnis.
 * Dort liegen u.a. personenbezogene Daten (Abonnenten) – das Verzeichnis
 * ist per .gitignore vom Repository ausgeschlossen.
 */
const DATA_DIR = path.join(process.cwd(), "data");

export function readJson<T>(fileName: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, fileName), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(fileName: string, data: unknown): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(DATA_DIR, fileName),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}
