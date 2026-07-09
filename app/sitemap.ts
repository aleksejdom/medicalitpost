import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articleStore";
import { CATEGORIES } from "@/lib/categorize";
import { getBaseUrl } from "@/lib/mailer";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const articles = await getAllArticles();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/archiv`, changeFrequency: "daily", priority: 0.6 },
    { url: `${baseUrl}/newsletter`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/datenschutz`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = Object.keys(CATEGORIES).map(
    (slug) => ({
      url: `${baseUrl}/kategorie/${slug}`,
      changeFrequency: "daily",
      priority: 0.8,
    })
  );

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/kategorie/${article.category}/${article.id}`,
    lastModified: article.date ? new Date(article.date) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...articlePages];
}
