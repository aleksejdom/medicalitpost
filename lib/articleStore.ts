import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Article, StoredArticle } from "./types";
import { hasHealthRelevance } from "./categorize";

const ARTICLES_DIR = path.join(process.cwd(), "public", "articles");

function articleToMarkdown(article: Article): string {
  // Zusammenfassung so ausführlich wie möglich: Beschreibung als Einstieg,
  // dazu der volle Meldungstext, sofern er mehr hergibt.
  // Quelle, Datum, Kategorie und Original-Link rendert die Beitragsseite
  // selbst – deshalb gehören sie nicht (doppelt) in den Markdown-Text.
  const summary = article.description || article.content;
  const hasDetails =
    article.content &&
    article.content !== article.description &&
    article.content.length > article.description.length;

  const body = [
    ...(article.image ? [`![${article.title}](${article.image})`, ""] : []),
    "## Zusammenfassung",
    "",
    summary || "Keine Beschreibung verfügbar.",
    "",
    ...(hasDetails ? ["## Im Detail", "", article.content, ""] : []),
  ].join("\n");

  return matter.stringify(body, {
    id: article.id,
    title: article.title,
    description: article.description,
    date: article.date,
    source: article.source,
    category: article.category,
    image: article.image || "",
    link: article.link,
    keywords: article.keywords,
    language: article.language,
  });
}

function parseFile(filePath: string, category: string): StoredArticle | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    if (!data.title) return null;
    return {
      id: data.id || path.basename(filePath, ".md"),
      title: data.title,
      description: data.description || "",
      content: "",
      date: data.date ? new Date(data.date).toISOString() : "",
      source: data.source || "",
      category: data.category?.toLowerCase?.() || category,
      image: data.image || undefined,
      link: data.link || "",
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      language: data.language === "en" ? "en" : "de",
      body: content,
    };
  } catch {
    return null;
  }
}

function listCategoryDirs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

/** Alle bereits archivierten Original-Links (zur Deduplizierung). */
export function getArchivedLinks(): Set<string> {
  const links = new Set<string>();
  for (const article of getAllArticles()) {
    if (article.link) links.add(article.link);
  }
  return links;
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9äöüß]+/g, " ").trim();
}

/** Speichert neue Artikel als .md-Dateien; gibt Anzahl neu gespeicherter zurück. */
export function saveArticles(articles: Article[]): number {
  const existingLinks = getArchivedLinks();
  const existingTitles = new Set(
    getAllArticles().map((a) => normalizeTitle(a.title))
  );
  let saved = 0;

  for (const article of articles) {
    // Dedupe über Original-Link und Titel (derselbe Artikel kann über
    // mehrere Feeds mit unterschiedlichen URLs hereinkommen)
    if (existingLinks.has(article.link)) continue;
    if (existingTitles.has(normalizeTitle(article.title))) continue;

    const dir = path.join(ARTICLES_DIR, article.category);
    fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${article.id}.md`);
    if (fs.existsSync(filePath)) continue;

    fs.writeFileSync(filePath, articleToMarkdown(article), "utf-8");
    existingLinks.add(article.link);
    existingTitles.add(normalizeTitle(article.title));
    saved++;
  }

  return saved;
}

/**
 * Alle archivierten Artikel, neueste zuerst.
 * Publiziert werden nur deutschsprachige Beiträge mit medizinischem
 * Bezug; Dubletten (gleicher Titel oder Link) werden auch beim Lesen
 * gefiltert – so verschwinden auch Altbestände, die die aktuellen
 * Kriterien nicht erfüllen.
 */
export function getAllArticles(): StoredArticle[] {
  const articles: StoredArticle[] = [];

  for (const category of listCategoryDirs()) {
    const dir = path.join(ARTICLES_DIR, category);
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".md")) continue;
      const article = parseFile(path.join(dir, file), category);
      if (
        article &&
        article.language === "de" &&
        hasHealthRelevance(`${article.title} ${article.description} ${article.body}`)
      ) {
        articles.push(article);
      }
    }
  }

  articles.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const seen = new Set<string>();
  return articles.filter((article) => {
    const titleKey = `t:${normalizeTitle(article.title)}`;
    const linkKey = `l:${article.link}`;
    if (seen.has(titleKey) || (article.link && seen.has(linkKey))) {
      return false;
    }
    seen.add(titleKey);
    seen.add(linkKey);
    return true;
  });
}

export function getArticlesByCategory(category: string): StoredArticle[] {
  return getAllArticles().filter((a) => a.category === category);
}

export function getArticle(
  category: string,
  id: string
): StoredArticle | null {
  const filePath = path.join(ARTICLES_DIR, category, `${id}.md`);
  if (!fs.existsSync(filePath)) return null;
  return parseFile(filePath, category);
}
