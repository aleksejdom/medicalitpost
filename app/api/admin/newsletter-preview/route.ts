import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { buildNewsletterHtml, pickNewsletterArticles } from "@/lib/newsletter";
import { getAllArticles } from "@/lib/articleStore";

export const dynamic = "force-dynamic";

/** HTML-Vorschau des nächsten Newsletters (inkl. Werbe-Section). */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Vorschau: die nächsten ungesendeten News, sonst die 2 neuesten
  let articles = await pickNewsletterArticles();
  if (articles.length === 0) {
    articles = (await getAllArticles()).slice(0, 2);
  }
  const html = await buildNewsletterHtml(articles, "#abmelden-beispiel");
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
