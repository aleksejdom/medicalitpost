import { getAllArticles } from "./articleStore";
import { StoredArticle } from "./types";
import { CATEGORIES } from "./categorize";
import { getNewsletterAd, NewsletterAd } from "./adStore";
import { getActiveSubscribers, Subscriber } from "./subscriberStore";
import { getBaseUrl, sendMail } from "./mailer";
import { getSetting, setSetting } from "./db";

const LOG_KEY = "newsletter_log";

interface NewsletterLog {
  sentArticleIds: string[];
  lastSentAt?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function articleSection(article: StoredArticle): string {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/kategorie/${article.category}/${article.id}`;
  const label = CATEGORIES[article.category] || article.category;
  const date = article.date
    ? new Date(article.date).toLocaleDateString("de-DE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return `
    <tr><td style="padding:24px 32px;border-bottom:1px solid #e4e4e7;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#2563eb;">${escapeHtml(label)}</p>
      ${
        article.image
          ? `<img src="${escapeHtml(article.image)}" alt="" width="536" style="width:100%;max-width:536px;height:auto;margin:0 0 12px;" />`
          : ""
      }
      <h2 style="margin:0 0 10px;font-family:Georgia,serif;font-size:22px;color:#18181b;">${escapeHtml(article.title)}</h2>
      <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#3f3f46;">${escapeHtml(article.description.slice(0, 400))}${article.description.length > 400 ? "…" : ""}</p>
      <p style="margin:0 0 14px;font-size:12px;color:#a1a1aa;">${escapeHtml(date)} · Quelle: ${escapeHtml(article.source)}</p>
      <a href="${escapeHtml(url)}" style="display:inline-block;padding:10px 18px;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;">Beitrag lesen</a>
    </td></tr>`;
}

function adSection(ad: NewsletterAd): string {
  if (!ad.enabled || (!ad.title && !ad.text && !ad.imageUrl)) return "";
  const content = `
      <p style="margin:0 0 6px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#a1a1aa;">Anzeige</p>
      ${
        ad.imageUrl
          ? `<img src="${escapeHtml(ad.imageUrl)}" alt="" width="536" style="width:100%;max-width:536px;height:auto;margin:0 0 12px;" />`
          : ""
      }
      ${ad.title ? `<h2 style="margin:0 0 10px;font-family:Georgia,serif;font-size:20px;color:#18181b;">${escapeHtml(ad.title)}</h2>` : ""}
      ${ad.text ? `<p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#3f3f46;">${escapeHtml(ad.text)}</p>` : ""}
      ${
        ad.linkUrl
          ? `<a href="${escapeHtml(ad.linkUrl)}" style="display:inline-block;padding:10px 18px;background:#18181b;color:#ffffff;text-decoration:none;font-size:14px;">${escapeHtml(ad.buttonText || "Mehr erfahren")}</a>`
          : ""
      }`;

  return `
    <tr><td style="padding:24px 32px;background:#fafafa;border-bottom:1px solid #e4e4e7;">
      ${content}
    </td></tr>`;
}

function layout(bodyRows: string, unsubscribeUrl: string): string {
  return `<!doctype html>
<html lang="de"><body style="margin:0;padding:0;background:#f4f4f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e4e4e7;">
  <tr><td style="padding:28px 32px;text-align:center;border-bottom:2px solid #18181b;">
    <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;color:#18181b;">THE MEDICAL IT POST</h1>
    <p style="margin:6px 0 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#a1a1aa;">Aktuelle IT-Fakten für die Medizin</p>
  </td></tr>
  ${bodyRows}
  <tr><td style="padding:20px 32px;background:#18181b;">
    <p style="margin:0 0 8px;font-size:12px;color:#a1a1aa;">
      Sie erhalten diese E-Mail, weil Sie den Newsletter von The Medical IT Post abonniert und die Anmeldung bestätigt haben.
    </p>
    <p style="margin:0;font-size:12px;color:#a1a1aa;">
      <a href="${escapeHtml(unsubscribeUrl)}" style="color:#ffffff;">Newsletter abbestellen</a> ·
      <a href="${getBaseUrl()}/datenschutz" style="color:#ffffff;">Datenschutz</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

/** Baut den kompletten Newsletter: News 1 – Werbe-Section – News 2. */
export async function buildNewsletterHtml(
  articles: StoredArticle[],
  unsubscribeUrl: string
): Promise<string> {
  const ad = await getNewsletterAd();
  const [first, second] = articles;
  const rows = [
    first ? articleSection(first) : "",
    adSection(ad),
    second ? articleSection(second) : "",
  ].join("\n");
  return layout(rows, unsubscribeUrl);
}

/** Die 1–2 neuesten Beiträge, die noch in keinem Newsletter waren. */
export async function pickNewsletterArticles(): Promise<StoredArticle[]> {
  const log = await getSetting<NewsletterLog>(LOG_KEY, { sentArticleIds: [] });
  const sent = new Set(log.sentArticleIds);
  const articles = await getAllArticles();
  return articles.filter((article) => !sent.has(article.id)).slice(0, 2);
}

export interface SendReport {
  recipients: number;
  articles: string[];
  errors: string[];
  skipped?: string;
}

/** Versendet den täglichen Newsletter an alle aktiven Abonnenten. */
export async function sendDailyNewsletter(): Promise<SendReport> {
  const articles = await pickNewsletterArticles();
  if (articles.length === 0) {
    return {
      recipients: 0,
      articles: [],
      errors: [],
      skipped: "Keine neuen Beiträge für den Newsletter.",
    };
  }

  const subscribers = await getActiveSubscribers();
  const errors: string[] = [];
  let recipients = 0;

  for (const subscriber of subscribers) {
    try {
      await sendMail({
        to: subscriber.email,
        subject: `Ihre News aus IT & Gesundheitswesen: ${articles[0].title}`,
        html: await buildNewsletterHtml(articles, unsubscribeUrl(subscriber)),
      });
      recipients++;
    } catch (error) {
      errors.push(`${subscriber.email}: ${String(error)}`);
    }
  }

  const log = await getSetting<NewsletterLog>(LOG_KEY, { sentArticleIds: [] });
  log.sentArticleIds = [
    ...log.sentArticleIds,
    ...articles.map((a) => a.id),
  ].slice(-500);
  log.lastSentAt = new Date().toISOString();
  await setSetting(LOG_KEY, log);

  return { recipients, articles: articles.map((a) => a.title), errors };
}

export function unsubscribeUrl(subscriber: Subscriber): string {
  return `${getBaseUrl()}/api/newsletter/unsubscribe?token=${subscriber.token}`;
}

export function confirmUrl(subscriber: Subscriber): string {
  return `${getBaseUrl()}/api/newsletter/confirm?token=${subscriber.token}`;
}

/** Bestätigungs-Mail für das Double-Opt-in (DSGVO). */
export async function sendConfirmationMail(
  subscriber: Subscriber
): Promise<void> {
  const rows = `
    <tr><td style="padding:24px 32px;">
      <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-size:22px;color:#18181b;">Bitte bestätigen Sie Ihre Anmeldung</h2>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">
        Sie haben den täglichen Newsletter von The Medical IT Post angefordert.
        Bitte bestätigen Sie Ihre Anmeldung mit einem Klick – erst danach
        erhalten Sie unseren Newsletter (Double-Opt-in).
      </p>
      <a href="${escapeHtml(confirmUrl(subscriber))}" style="display:inline-block;padding:12px 22px;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;">Anmeldung bestätigen</a>
      <p style="margin:16px 0 0;font-size:12px;color:#a1a1aa;">
        Falls Sie sich nicht angemeldet haben, ignorieren Sie diese E-Mail einfach –
        es werden dann keine weiteren E-Mails verschickt und Ihre Daten werden nicht
        für den Newsletter-Versand verwendet.
      </p>
    </td></tr>`;
  await sendMail({
    to: subscriber.email,
    subject: "Bitte bestätigen: Newsletter-Anmeldung bei The Medical IT Post",
    html: layout(rows, unsubscribeUrl(subscriber)),
  });
}
