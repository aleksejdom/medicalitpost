import React from "react";
import Link from "next/link";
import { Archive } from "lucide-react";
import HeaderBlock from "@/app/components/header";
import NavigationBlock from "@/app/components/navigation";
import FooterBlock from "@/app/components/footer";
import { getAllArticles } from "@/lib/articleStore";
import { CATEGORIES } from "@/lib/categorize";

export const dynamic = "force-dynamic";

export default function ArchivPage() {
  const articles = getAllArticles();

  // Nach Monat gruppieren
  const groups = new Map<string, typeof articles>();
  for (const article of articles) {
    const date = article.date ? new Date(article.date) : null;
    const key = date
      ? date.toLocaleDateString("de-DE", { year: "numeric", month: "long" })
      : "Ohne Datum";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(article);
  }

  return (
    <div className="flex bg-zinc-50 font-sans dark:bg-black flex-col items-center justify-center w-full p-4 md:p-3">
      <HeaderBlock />
      <NavigationBlock />

      <div className="p-5 w-full max-w-6xl mt-5">
        <p className="text-xs text-gray-500 uppercase">Tech & Gesundheit</p>
        <h3 className="text-3xl mb-6 flex items-center gap-3">
          <Archive className="w-7 h-7 text-gray-400" />
          Archiv ({articles.length} Artikel)
        </h3>

        {groups.size === 0 && (
          <p className="text-sm text-gray-500">
            Das Archiv ist noch leer.
          </p>
        )}

        {[...groups.entries()].map(([month, monthArticles]) => (
          <div key={month} className="mb-10">
            <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">
              {month}
            </h2>
            <ul className="flex flex-col gap-3">
              {monthArticles.map((article) => {
                const date = article.date ? new Date(article.date) : null;
                return (
                  <li
                    key={`${article.category}-${article.id}`}
                    className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4"
                  >
                    <span className="text-sm text-gray-500 md:w-24 shrink-0">
                      {date &&
                        date.toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                    </span>
                    <span className="text-xs text-blue-600 uppercase md:w-36 shrink-0">
                      {CATEGORIES[article.category] || article.category}
                    </span>
                    <Link
                      href={`/kategorie/${article.category}/${article.id}`}
                      className="hover:text-blue-600 font-medium"
                    >
                      {article.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <FooterBlock />
    </div>
  );
}
