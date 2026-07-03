import { Article, StoredArticle } from "./types";
import { hasHealthRelevance } from "./categorize";
import { db } from "./db";

/**
 * Artikel-Archiv in Supabase (Tabelle mp_articles).
 * Ersetzt die frühere Markdown-Datei-Ablage, weil das Dateisystem
 * auf Vercel (Serverless) read-only ist.
 */

function buildBody(article: Article): string {
  // Zusammenfassung so ausführlich wie möglich; Quelle, Datum, Kategorie
  // und Original-Link rendert die Beitragsseite selbst.
  const summary = article.description || article.content;
  const hasDetails =
    article.content &&
    article.content !== article.description &&
    article.content.length > article.description.length;

  return [
    ...(article.image ? [`![${article.title}](${article.image})`, ""] : []),
    "## Zusammenfassung",
    "",
    summary || "Keine Beschreibung verfügbar.",
    "",
    ...(hasDetails ? ["## Im Detail", "", article.content, ""] : []),
  ].join("\n");
}

function rowToArticle(row: Record<string, unknown>): StoredArticle {
  return {
    id: String(row.id),
    title: String(row.title || ""),
    description: String(row.description || ""),
    content: "",
    date: row.date ? new Date(String(row.date)).toISOString() : "",
    source: String(row.source || ""),
    category: String(row.category || "digitalisierung"),
    image: row.image ? String(row.image) : undefined,
    link: String(row.link || ""),
    keywords: Array.isArray(row.keywords) ? (row.keywords as string[]) : [],
    language: row.language === "en" ? "en" : "de",
    body: String(row.body || ""),
  };
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9äöüß]+/g, " ").trim();
}

/** Speichert neue Artikel; gibt Anzahl neu gespeicherter zurück. */
export async function saveArticles(articles: Article[]): Promise<number> {
  const { data: existing, error } = await db()
    .from("mp_articles")
    .select("link, title");
  if (error) throw new Error(`Artikel laden: ${error.message}`);

  const existingLinks = new Set((existing || []).map((r) => r.link));
  const existingTitles = new Set(
    (existing || []).map((r) => normalizeTitle(String(r.title)))
  );

  const rows: Record<string, unknown>[] = [];
  for (const article of articles) {
    // Dedupe über Original-Link und Titel (derselbe Artikel kann über
    // mehrere Feeds mit unterschiedlichen URLs hereinkommen)
    if (existingLinks.has(article.link)) continue;
    if (existingTitles.has(normalizeTitle(article.title))) continue;

    rows.push({
      id: article.id,
      title: article.title,
      description: article.description,
      body: buildBody(article),
      date: article.date,
      source: article.source,
      category: article.category,
      image: article.image || null,
      link: article.link,
      keywords: article.keywords,
      language: article.language,
    });
    existingLinks.add(article.link);
    existingTitles.add(normalizeTitle(article.title));
  }

  if (rows.length === 0) return 0;

  const { error: insertError } = await db()
    .from("mp_articles")
    .upsert(rows, { onConflict: "link", ignoreDuplicates: true });
  if (insertError) {
    throw new Error(`Artikel speichern: ${insertError.message}`);
  }
  return rows.length;
}

/**
 * Alle archivierten Artikel, neueste zuerst.
 * Publiziert werden nur deutschsprachige Beiträge mit medizinischem
 * Bezug; Dubletten (gleicher Titel) werden auch beim Lesen gefiltert.
 */
export async function getAllArticles(): Promise<StoredArticle[]> {
  const { data, error } = await db()
    .from("mp_articles")
    .select("*")
    .eq("language", "de")
    .order("date", { ascending: false });
  if (error) {
    console.error("Artikel laden fehlgeschlagen:", error.message);
    return [];
  }

  const seen = new Set<string>();
  return (data || [])
    .map(rowToArticle)
    .filter((article) =>
      hasHealthRelevance(
        `${article.title} ${article.description} ${article.body}`
      )
    )
    .filter((article) => {
      const key = normalizeTitle(article.title);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export async function getArticlesByCategory(
  category: string
): Promise<StoredArticle[]> {
  const articles = await getAllArticles();
  return articles.filter((a) => a.category === category);
}

export async function getArticle(
  category: string,
  id: string
): Promise<StoredArticle | null> {
  const { data, error } = await db()
    .from("mp_articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const article = rowToArticle(data);
  return article.category === category ? article : article;
}

/** Anzahl aller gespeicherten Artikel (für Sync-Statistik). */
export async function countArticles(): Promise<number> {
  const { count } = await db()
    .from("mp_articles")
    .select("*", { count: "exact", head: true });
  return count || 0;
}
