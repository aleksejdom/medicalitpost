import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  CalendarDays,
  ChevronRight,
  ExternalLink,
  Rss,
} from "lucide-react";
import HeaderBlock from "@/app/components/header";
import NavigationBlock from "@/app/components/navigation";
import FooterBlock from "@/app/components/footer";
import { getArticle, getArticlesByCategory } from "@/lib/articleStore";
import { CATEGORIES } from "@/lib/categorize";
import ArticleImage from "@/app/components/article-image";
import NewsletterSignup from "@/app/components/newsletter-signup";

export const dynamic = "force-dynamic";

export default async function ArtikelPage({
  params,
}: {
  params: Promise<{ kategorie: string; id: string }>;
}) {
  const { kategorie, id } = await params;
  const article = await getArticle(kategorie, id);

  if (!article) {
    notFound();
  }

  const label = CATEGORIES[kategorie] || kategorie;
  const date = article.date ? new Date(article.date) : null;
  const related = (await getArticlesByCategory(kategorie))
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  // Ältere Archiv-Dateien enthalten Metadaten und den Original-Link noch
  // im Markdown-Text – die rendert die Seite selbst, daher hier entfernen.
  const body = article.body
    .replace(/^#\s.*$/m, "")
    .replace(/^\*\*(Quelle|Datum|Kategorie):\*\*.*$/gm, "")
    .replace(/\n---\s*\n\s*\[Zum Originalartikel\]\([^)]*\)\s*$/, "")
    .trim();

  return (
    <div className="flex bg-zinc-50 font-sans dark:bg-black flex-col items-center justify-center w-full p-4 md:p-3">
      <HeaderBlock />
      <NavigationBlock />

      <div className="w-full max-w-6xl px-5 mt-5">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1 flex-wrap">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/kategorie/${kategorie}`}
            className="hover:text-blue-600"
          >
            {label}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="truncate max-w-60">{article.title}</span>
        </nav>

        <article className="bg-white border border-gray-300 p-6 md:p-10">
          <p className="text-xs text-blue-600 uppercase tracking-wide mb-2">
            {label}
          </p>

          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            {article.title}
          </h1>

          <div className="text-sm text-gray-500 mb-6 flex flex-wrap gap-x-4 gap-y-1">
            {date && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                {date.toLocaleDateString("de-DE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
            {article.source && (
              <span className="inline-flex items-center gap-1.5">
                <Rss className="w-4 h-4" />
                Quelle: {article.source}
              </span>
            )}
          </div>

          <div className="prose prose-zinc max-w-none [&_h1]:hidden [&_img]:w-full">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Bilder aus dem Markdown mit Lade-Fallback rendern:
                // schlägt das Laden fehl, wird das Bild ganz weggelassen
                img: ({ src, alt }) => (
                  <ArticleImage
                    src={typeof src === "string" ? src : undefined}
                    alt={alt}
                    className="w-full"
                    fallback="hide"
                  />
                ),
              }}
            >
              {body}
            </ReactMarkdown>
          </div>

          {article.link && (
            <a
              href={article.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 mt-8 text-sm text-blue-600 underline"
            >
              Zum Originalartikel
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </article>

        {/* Verwandte Artikel */}
        {related.length > 0 && (
          <div className="mt-10 mb-10">
            <h2 className="text-xl font-bold mb-4">
              Weitere Artikel aus {label}
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/kategorie/${kategorie}/${rel.id}`}
                  className="border border-gray-300 bg-white p-4 hover:border-blue-500 transition-colors"
                >
                  <h3 className="font-serif font-bold mb-2">{rel.title}</h3>
                  <p className="text-sm text-gray-600">
                    {rel.description.slice(0, 100)}…
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <NewsletterSignup />
      </div>

      <FooterBlock />
    </div>
  );
}
