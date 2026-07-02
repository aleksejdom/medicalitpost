/**
 * Keyword-basierte Relevanz-Prüfung und Kategorisierung
 * für News aus IT & Gesundheitswesen.
 */

export const CATEGORIES: Record<string, string> = {
  telematik: "Telematik",
  "it-sicherheit": "IT-Sicherheit",
  software: "Software & KI",
  medizintechnik: "Medizintechnik",
  regelungen: "Regelungen & Gesetze",
  digitalisierung: "Digitalisierung",
};

// Eindeutiger Medizin-/Gesundheitsbezug: ein Treffer genügt
const HEALTH_STRONG_KEYWORDS = [
  "gesundheit", "medizin", "klinik", "krankenhaus", "krankenhäuser", "arzt",
  "ärzt", "patient", "apotheke", "krankenkasse", "krankenversicherung",
  "versicherte", "epa", "elektronische patientenakte", "e-rezept", "erezept",
  "telematik", "gematik", "diga", "telemedizin", "videosprechstunde",
  "pharma", "medikament", "impf", "pflegeheim", "pflegedienst", "mvz",
];

// Mehrdeutige Begriffe (z.B. "Praxis", "Pflege", "Labor" auch außerhalb
// der Medizin üblich; englische Begriffe wie "Health Connect" tauchen
// auch in reinen Tech-Artikeln auf): zählen nur, wenn mindestens zwei
// zusammenkommen
const HEALTH_WEAK_KEYWORDS = [
  "praxis", "pflege", "labor", "diagnose", "diagnostik", "therapie",
  "behandlung", "versorgung", "rezept", "kasse", "care", "doctor",
  "health", "medical", "hospital", "clinic", "physician",
];

// IT/Digital-Bezug (für allgemeine Gesundheits-Quellen)
const IT_KEYWORDS = [
  "digital", "it-", "software", "cyber", "ki", "ai",
  "künstliche intelligenz", "elektronisch", "app", "telematik",
  "epa", "e-rezept", "erezept", "telemedizin", "videosprechstunde",
  "technologie", "interoperab", "cloud", "algorith", "gematik", "diga",
  "gesundheitsdaten", "e-health", "ehealth", "datenschutz", "vernetzung",
];

// Kategorien: Reihenfolge = Priorität bei der Zuordnung
const CATEGORY_KEYWORDS: Array<[string, string[]]> = [
  [
    "telematik",
    [
      "telematik", "ti-gateway", "ti gateway", "gematik", "epa",
      "elektronische patientenakte", "e-rezept", "erezept", "e-prescription",
      "kim", "konnektor", "ehba", "smc-b", "ti-messenger", "versichertenkarte",
      "egk", "health information exchange",
    ],
  ],
  [
    "it-sicherheit",
    [
      "sicherheitslücke", "cyber", "hacker", "ransomware", "datenleck",
      "datenschutz", "phishing", "malware", "angriff", "bsi", "schwachstelle",
      "verschlüsselung", "security", "breach", "vulnerability", "hipaa",
      "privacy",
    ],
  ],
  [
    "regelungen",
    [
      "gesetz", "verordnung", "regelung", "richtlinie", "referentenentwurf",
      "bundestag", "bundesrat", "mdr", "zulassung", "digitalgesetz", "gdng",
      "ehds", "regulierung", "regulation", "fda", "compliance", "lauterbach",
      "ministerium", "reform", "bmg",
    ],
  ],
  [
    "medizintechnik",
    [
      "medizintechnik", "medizinprodukt", "medtech", "robotik", "roboter",
      "implantat", "wearable", "sensor", "bildgebung", "mrt", "ct-",
      "diagnostik", "prothese", "ultraschall", "device", "imaging",
      "surgical", "scanner",
    ],
  ],
  [
    "software",
    [
      "software", "app", "ki", "künstliche intelligenz", "artificial intelligence",
      " ai ", "algorithmus", "diga", "kis", "krankenhausinformationssystem",
      "machine learning", "llm", "chatbot", "update", "betriebssystem",
      "programm", "plattform", "cloud", "ehr", "emr",
    ],
  ],
  // Fallback-Kategorie mit eigenen Keywords zuletzt
  [
    "digitalisierung",
    [
      "digitalisierung", "digital health", "ehealth", "e-health",
      "interoperab", "fhir", "hl7", "gesundheitsdaten", "telemedizin",
      "videosprechstunde", "vernetzung",
    ],
  ],
];

const WORD_CHAR = "a-z0-9äöüß";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Keyword-Match mit Wortgrenzen: Keywords müssen am Wortanfang stehen
 * (Komposita wie "Gesundheitswesen" für "gesundheit" zählen). Sehr kurze
 * Keywords (<= 3 Zeichen) müssen als ganzes Wort vorkommen, damit z.B.
 * "ki" nicht mitten in anderen Wörtern trifft.
 */
function matchKeywords(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => {
    const needsEndBoundary =
      kw.length <= 3 && new RegExp(`[${WORD_CHAR}]$`).test(kw);
    const pattern =
      `(?:^|[^${WORD_CHAR}])${escapeRegex(kw)}` +
      (needsEndBoundary ? `(?:[^${WORD_CHAR}]|$)` : "");
    return new RegExp(pattern).test(lower);
  });
}

/**
 * Medizinischer Bezug: mindestens ein eindeutiges Medizin-Keyword
 * oder mindestens zwei mehrdeutige.
 */
export function hasHealthRelevance(text: string): boolean {
  if (matchKeywords(text, HEALTH_STRONG_KEYWORDS).length > 0) return true;
  return matchKeywords(text, HEALTH_WEAK_KEYWORDS).length >= 2;
}

/** Prüft, ob ein Artikel zum Portal (IT x Gesundheitswesen) passt. */
export function isRelevant(
  text: string,
  mode: "filter-health" | "filter-it" | "none"
): boolean {
  if (mode === "none") return true;
  if (mode === "filter-health") return hasHealthRelevance(text);
  return matchKeywords(text, IT_KEYWORDS).length > 0;
}

/** Ordnet einen Artikel der passendsten Kategorie zu. */
export function categorize(text: string): {
  category: string;
  keywords: string[];
} {
  let best = { category: "digitalisierung", keywords: [] as string[] };
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    const matched = matchKeywords(text, keywords);
    if (matched.length > best.keywords.length) {
      best = { category, keywords: matched };
    }
  }
  return best;
}
