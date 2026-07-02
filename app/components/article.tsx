import React from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Rss } from "lucide-react";
import ArticleImage from "./article-image";
import { StoredArticle } from "@/lib/types";
import { CATEGORIES } from "@/lib/categorize";

function ArticlePage({
  articles,
  title = "Aktuelle Meldungen",
  moreHref,
}: {
  articles: StoredArticle[];
  title?: string;
  moreHref?: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase">Tech & Gesundheit</p>
      <div className="flex items-baseline justify-between mb-6 gap-4">
        <h3 className="text-3xl">{title}</h3>
        {moreHref && (
          <Link
            href={moreHref}
            className="text-sm text-blue-600 hover:underline whitespace-nowrap inline-flex items-center gap-1"
          >
            Alle Beiträge
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {articles.map((article) => {
          const date = article.date ? new Date(article.date) : null;
          const categoryLabel =
            CATEGORIES[article.category] || article.category;

          return (
            <Link
              key={`${article.category}-${article.id}`}
              href={`/kategorie/${article.category}/${article.id}`}
              className="border border-gray-300 p-5 flex flex-col bg-white hover:border-blue-500 transition-colors"
            >
              {article.image && (
                <ArticleImage
                  src={article.image}
                  alt={article.title}
                  className="w-full h-40 object-cover mb-3"
                />
              )}

              <p className="text-xs text-blue-600 uppercase tracking-wide">
                {categoryLabel}
              </p>

              <h2 className="text-2xl font-serif font-bold mt-2 mb-2">
                {article.title}
              </h2>

              <p className="text-gray-700 mb-3 flex-grow">
                {article.description
                  ? article.description.slice(0, 180) +
                    (article.description.length > 180 ? "…" : "")
                  : "Keine Beschreibung verfügbar."}
              </p>

              <div className="text-sm text-gray-500 flex items-center justify-between gap-2">
                {date && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {date.toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Rss className="w-3.5 h-3.5" />
                  {article.source}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default ArticlePage;
