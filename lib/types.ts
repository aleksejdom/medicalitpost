export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string; // ISO 8601
  source: string;
  category: string; // Kategorie-Slug, z.B. "telematik"
  image?: string;
  link: string;
  keywords: string[];
  language: "de" | "en";
}

export interface StoredArticle extends Article {
  body: string; // Markdown-Inhalt (ohne Frontmatter)
}
