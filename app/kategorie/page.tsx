import React from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import HeaderBlock from "@/app/components/header";
import NavigationBlock from "@/app/components/navigation";
import FooterBlock from "@/app/components/footer";
import { getAllArticles } from "@/lib/articleStore";
import { CATEGORIES } from "@/lib/categorize";

export const dynamic = "force-dynamic";

export default async function KategorienUebersicht() {
  const articles = await getAllArticles();
  const counts = new Map<string, number>();
  for (const article of articles) {
    counts.set(article.category, (counts.get(article.category) || 0) + 1);
  }

  return (
    <div className="flex bg-zinc-50 font-sans dark:bg-black flex-col items-center justify-center w-full p-4 md:p-3">
      <HeaderBlock />
      <NavigationBlock />

      <div className="p-5 w-full max-w-6xl mt-5">
        <p className="text-xs text-gray-500 uppercase">Tech & Gesundheit</p>
        <h3 className="text-3xl mb-6">Alle Kategorien</h3>

        <div className="grid md:grid-cols-3 gap-5">
          {Object.entries(CATEGORIES).map(([slug, label]) => (
            <Link
              key={slug}
              href={`/kategorie/${slug}`}
              className="border border-gray-300 bg-white p-5 hover:border-blue-500 transition-colors"
            >
              <h2 className="text-2xl font-serif font-bold mb-2">{label}</h2>
              <p className="text-sm text-gray-500 inline-flex items-center gap-1.5">
                <Newspaper className="w-4 h-4" />
                {counts.get(slug) || 0} Artikel im Archiv
              </p>
            </Link>
          ))}
        </div>
      </div>

      <FooterBlock />
    </div>
  );
}
