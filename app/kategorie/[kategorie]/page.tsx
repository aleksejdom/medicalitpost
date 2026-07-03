import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import HeaderBlock from "@/app/components/header";
import NavigationBlock from "@/app/components/navigation";
import FooterBlock from "@/app/components/footer";
import ArticlesBlock from "@/app/components/articles";
import { getArticlesByCategory } from "@/lib/articleStore";
import { CATEGORIES } from "@/lib/categorize";

export const dynamic = "force-dynamic";

export default async function KategoriePage({
  params,
}: {
  params: Promise<{ kategorie: string }>;
}) {
  const { kategorie } = await params;
  const articles = await getArticlesByCategory(kategorie);
  const label = CATEGORIES[kategorie];

  if (!label && articles.length === 0) {
    notFound();
  }

  return (
    <div className="flex bg-zinc-50 font-sans dark:bg-black flex-col items-center justify-center w-full p-4 md:p-3">
      <HeaderBlock />
      <NavigationBlock />

      <div className="w-full max-w-6xl px-5 mt-5">
        <nav className="text-sm text-gray-500 flex items-center gap-1">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>{label || kategorie}</span>
        </nav>
      </div>

      <ArticlesBlock articles={articles} title={label || kategorie} />

      <FooterBlock />
    </div>
  );
}
