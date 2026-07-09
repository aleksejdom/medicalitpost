import { XMLParser } from "fast-xml-parser";
import crypto from "crypto";
import { Article } from "./types";
import { RssSource } from "./sources";
import { getEnabledSources } from "./sourceStore";
import { categorize, hasHealthRelevance, isRelevant } from "./categorize";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

interface RawItem {
  title: string;
  link: string;
  description: string;
  content: string;
  date: string;
  image?: string;
}

// Häufige benannte HTML-Entities deutscher Feeds (Umlaute, Anführungszeichen)
const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  auml: "ä",
  ouml: "ö",
  uuml: "ü",
  Auml: "Ä",
  Ouml: "Ö",
  Uuml: "Ü",
  szlig: "ß",
  euro: "€",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  bdquo: "„",
  ldquo: "“",
  rdquo: "”",
  lsquo: "‚",
  rsquo: "’",
  laquo: "«",
  raquo: "»",
};

function stripHtml(html: string): string {
  return (
    html
      .replace(/<[^>]*>/g, " ")
      .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
      .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
        String.fromCodePoint(parseInt(code, 16))
      )
      .replace(/&(\w+);/g, (match, name) => NAMED_ENTITIES[name] ?? match)
      .replace(/\s+/g, " ")
      // Durch das Ersetzen von Tags durch Leerzeichen entstehen Lücken
      // vor Satzzeichen ("Wort , Wort") und nach öffnenden Klammern
      .replace(/\s+([,.;:!?)\]])/g, "$1")
      .replace(/([([])\s+/g, "$1")
      .trim()
  );
}

// Werbe-/Angebotsmeldungen, die keine News sind
const TITLE_BLOCKLIST = [/^heise-angebot/i, /^anzeige[:\s]/i];

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "#text" in value) {
    return String((value as Record<string, unknown>)["#text"]);
  }
  return "";
}

/** Extrahiert Items aus RSS-2.0- und Atom-Feeds. */
function parseFeed(xml: string): RawItem[] {
  const doc = parser.parse(xml);

  // RSS 2.0
  if (doc.rss?.channel) {
    return asArray(doc.rss.channel.item).map((item: any) => ({
      title: stripHtml(text(item.title)),
      link: text(item.link).trim(),
      description: stripHtml(text(item.description)),
      content: stripHtml(text(item["content:encoded"])),
      date: text(item.pubDate) || text(item["dc:date"]),
      image:
        item.enclosure?.["@_url"] ||
        item["media:content"]?.["@_url"] ||
        item["media:thumbnail"]?.["@_url"] ||
        undefined,
    }));
  }

  // Atom
  if (doc.feed) {
    return asArray(doc.feed.entry).map((entry: any) => {
      const links = asArray(entry.link);
      const alternate =
        links.find((l: any) => l["@_rel"] === "alternate" || !l["@_rel"]) ||
        links[0];
      return {
        title: stripHtml(text(entry.title)),
        link: alternate ? String(alternate["@_href"] || "") : "",
        description: stripHtml(text(entry.summary)),
        content: stripHtml(text(entry.content)),
        date: text(entry.updated) || text(entry.published),
        image: undefined,
      };
    });
  }

  return [];
}

function shortHash(input: string): string {
  return crypto.createHash("sha1").update(input).digest("hex").slice(0, 8);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Ältere Meldungen ignorieren (manche Feeds liefern ihr komplettes Archiv mit)
const MAX_AGE_DAYS = 45;

/** Parst Feed-Daten inkl. Zeitzonen-Kürzel wie CET/CEST, die JS nicht kennt. */
function parseDate(value: string): Date | null {
  if (!value) return null;
  const normalized = value
    .trim()
    .replace(/\bCEST\b/, "+0200")
    .replace(/\bCET\b/, "+0100")
    .replace(/\bMESZ\b/, "+0200")
    .replace(/\bMEZ\b/, "+0100");
  const date = new Date(normalized);
  return isNaN(date.getTime()) ? null : date;
}

function toArticle(item: RawItem, source: RssSource): Article | null {
  if (!item.title || !item.link) return null;
  if (TITLE_BLOCKLIST.some((pattern) => pattern.test(item.title))) return null;
  // Es werden nur deutschsprachige Beiträge publiziert
  if (source.language !== "de") return null;

  const searchText = `${item.title} ${item.description} ${item.content}`;
  if (!isRelevant(searchText, source.mode)) return null;
  // Beiträge müssen immer einen medizinischen Bezug haben –
  // unabhängig davon, aus welcher Quelle sie kommen
  if (!hasHealthRelevance(searchText)) return null;

  const date = parseDate(item.date) || new Date();
  const ageDays = (Date.now() - date.getTime()) / 86_400_000;
  if (ageDays > MAX_AGE_DAYS) return null;

  const { category, keywords } = categorize(searchText);

  return {
    id: `${slugify(item.title)}-${shortHash(item.link)}`,
    title: item.title,
    description: item.description || item.content.slice(0, 300),
    content: item.content,
    date: date.toISOString(),
    source: source.name,
    category,
    image: item.image,
    link: item.link,
    keywords,
    language: source.language,
  };
}

/**
 * Dekodiert den Feed mit dem richtigen Zeichensatz. `res.text()` nimmt
 * stur UTF-8 an – Feeds wie Golem.de liefern aber ISO-8859-1, wodurch
 * Umlaute als U+FFFD (�) in der Datenbank landen würden.
 */
function decodeFeed(buffer: ArrayBuffer, contentType: string | null): string {
  const utf8 = new TextDecoder("utf-8").decode(buffer);
  // Sauberes UTF-8 (keine Ersatzzeichen) -> fertig
  if (!utf8.includes("�")) return utf8;

  // Sonst deklarierten Zeichensatz aus HTTP-Header oder XML-Deklaration
  // verwenden; Fallback windows-1252 (Obermenge von ISO-8859-1)
  const declared =
    contentType?.match(/charset=["']?([\w-]+)/i)?.[1] ||
    utf8.slice(0, 200).match(/encoding=["']([\w-]+)["']/i)?.[1] ||
    "windows-1252";
  try {
    return new TextDecoder(declared).decode(buffer);
  } catch {
    return utf8;
  }
}

async function fetchRssSource(source: RssSource): Promise<Article[]> {
  const res = await fetch(source.url, {
    headers: { "User-Agent": "Mozilla/5.0 (MedicalITPost NewsBot)" },
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`${source.name}: HTTP ${res.status}`);
  }
  const xml = decodeFeed(
    await res.arrayBuffer(),
    res.headers.get("content-type")
  );
  return parseFeed(xml)
    .map((item) => toArticle(item, source))
    .filter((a): a is Article => a !== null);
}

/** Zusätzliche Quelle: newsdata.io API (kostenloser Plan). */
async function fetchNewsdata(): Promise<Article[]> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) return [];

  const url =
    `https://newsdata.io/api/1/latest?apikey=${apiKey}` +
    `&language=de&category=technology,health`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`newsdata.io: HTTP ${res.status}`);
  }
  const data = await res.json();

  const items: RawItem[] = (data.results || []).map((r: any) => ({
    title: r.title || "",
    link: r.link || "",
    description: stripHtml(r.description || ""),
    content: stripHtml(r.content || ""),
    date: r.pubDate || "",
    image: r.image_url || undefined,
  }));

  // API liefert Technik & Gesundheit getrennt -> beidseitig filtern:
  // nur behalten, was Gesundheits- UND IT-Bezug hat.
  const pseudoSource: RssSource = {
    name: "newsdata.io",
    url,
    language: "de",
    mode: "filter-health",
  };
  return items
    .map((item) => toArticle(item, pseudoSource))
    .filter((a): a is Article => a !== null)
    .filter((a) =>
      isRelevant(`${a.title} ${a.description} ${a.content}`, "filter-it")
    );
}

export interface CollectResult {
  articles: Article[];
  errors: string[];
}

/** Sammelt Artikel aus allen Quellen. Fehler einzelner Quellen brechen nichts ab. */
export async function collectArticles(): Promise<CollectResult> {
  const sources = await getEnabledSources();
  const tasks: Array<Promise<Article[]>> = [
    ...sources.map((source) => fetchRssSource(source)),
    fetchNewsdata(),
  ];

  const results = await Promise.allSettled(tasks);
  const articles: Article[] = [];
  const errors: string[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    } else {
      errors.push(String(result.reason));
    }
  }

  return { articles, errors };
}
