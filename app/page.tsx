import HeaderBlock from "./components/header";
import NavigationBlock from "./components/navigation";
import WarnungenBlock from "./components/warnungen";
import FooterBlock from "./components/footer";
import ArticlesBlock from "./components/articles";
import NewsletterSignup from "./components/newsletter-signup";
import { ensureFreshArticles } from "@/lib/sync";
import { getAllArticles } from "@/lib/articleStore";
import { CATEGORIES } from "@/lib/categorize";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Hält das Archiv tagesaktuell (synct höchstens einmal pro Stunde)
  await ensureFreshArticles(60);

  const articles = getAllArticles();
  const latest = articles.slice(0, 6);

  // Pro Kategorie eine eigene Sektion mit den neuesten Beiträgen
  const sections = Object.entries(CATEGORIES)
    .map(([slug, label]) => ({
      slug,
      label,
      articles: articles.filter((a) => a.category === slug).slice(0, 3),
    }))
    .filter((section) => section.articles.length > 0);

  return (
    <div className="flex bg-zinc-50 font-sans dark:bg-black flex-col items-center justify-center w-full p-4 md:p-3">
      <HeaderBlock />
      <NavigationBlock />

      <ArticlesBlock articles={latest} title="Aktuelle Meldungen" />

      {sections.map((section) => (
        <ArticlesBlock
          key={section.slug}
          articles={section.articles}
          title={section.label}
          moreHref={`/kategorie/${section.slug}`}
        />
      ))}

      <div className="p-5 w-full max-w-6xl">
        <NewsletterSignup />
      </div>
      <WarnungenBlock />
      <FooterBlock />
    </div>
  );
}
