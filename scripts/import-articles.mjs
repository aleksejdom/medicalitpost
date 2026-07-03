/**
 * Einmaliger Import: überträgt die Markdown-Artikel aus public/articles/
 * in die Supabase-Tabelle mp_articles.
 *
 *   node scripts/import-articles.mjs
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

// .env einlesen (ohne dotenv-Abhängigkeit)
const envFile = path.join(process.cwd(), ".env");
for (const line of fs.readFileSync(envFile, "utf-8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen in .env");
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

const articlesDir = path.join(process.cwd(), "public", "articles");
const rows = [];

for (const dir of fs.readdirSync(articlesDir, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const category = dir.name;
  for (const file of fs.readdirSync(path.join(articlesDir, category))) {
    if (!file.endsWith(".md")) continue;
    const raw = fs.readFileSync(path.join(articlesDir, category, file), "utf-8");
    const { data, content } = matter(raw);
    if (!data.title || !data.link) continue;
    rows.push({
      id: data.id || path.basename(file, ".md"),
      title: data.title,
      description: data.description || "",
      body: content.trim(),
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      source: data.source || "",
      category: String(data.category || category).toLowerCase(),
      image: data.image || null,
      link: data.link,
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      language: data.language === "en" ? "en" : "de",
    });
  }
}

console.log(`${rows.length} Artikel gefunden, importiere…`);

// Innerhalb des Imports doppelte Links/IDs vermeiden
const seen = new Set();
const unique = rows.filter((r) => {
  if (seen.has(r.link) || seen.has(r.id)) return false;
  seen.add(r.link);
  seen.add(r.id);
  return true;
});

let imported = 0;
for (let i = 0; i < unique.length; i += 50) {
  const chunk = unique.slice(i, i + 50);
  const { error } = await supabase
    .from("mp_articles")
    .upsert(chunk, { onConflict: "link", ignoreDuplicates: true });
  if (error) {
    console.error("Fehler beim Import:", error.message);
    process.exit(1);
  }
  imported += chunk.length;
}

const { count } = await supabase
  .from("mp_articles")
  .select("*", { count: "exact", head: true });
console.log(`Fertig: ${imported} übertragen, ${count} Artikel in der Datenbank.`);
