import React from "react";
import ArticlePage from "./article";
import { StoredArticle } from "@/lib/types";

function ArticlesBlock({
  articles,
  title,
  moreHref,
}: {
  articles: StoredArticle[];
  title?: string;
  moreHref?: string;
}) {
  if (!articles || articles.length === 0) {
    return (
      <div className="p-5 w-full max-w-6xl mt-5">
        <p className="text-sm text-gray-500">
          Aktuell sind keine Meldungen verfügbar.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 w-full max-w-6xl mt-5 flex flex-col gap-18">
      <ArticlePage articles={articles} title={title} moreHref={moreHref} />
    </div>
  );
}

export default ArticlesBlock;
