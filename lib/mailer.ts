import nodemailer from "nodemailer";

/**
 * E-Mail-Versand über SMTP (Umgebungsvariablen SMTP_HOST, SMTP_PORT,
 * SMTP_USER, SMTP_PASS, MAIL_FROM). Ohne Konfiguration werden Mails
 * nicht verschickt, sondern zur Entwicklung in die Konsole geloggt.
 */
export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM);
}

export function getBaseUrl(): string {
  // Fallback-Kette: explizite BASE_URL -> Produktions-Domain auf Vercel
  // -> lokale Entwicklung. Verhindert localhost-Links in Produktion,
  // falls BASE_URL dort nicht gesetzt ist.
  const url =
    process.env.BASE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : "http://localhost:3000");
  // BASE_URL darf auch ohne Schema gesetzt sein ("medicalitpost.de") –
  // new URL() würde daran scheitern (so schlug der Vercel-Build fehl)
  const withScheme = /^https?:\/\//.test(url) ? url : `https://${url}`;
  return withScheme.replace(/\/$/, "");
}

// Gepoolter Transporter: hält die SMTP-Verbindung über den ganzen
// Newsletter-Versand offen, statt pro Empfänger neu zu verbinden –
// viele Einzelverbindungen in kurzer Folge wirken auf Mailserver
// wie Bot-Verhalten und drücken die Reputation.
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      pool: true,
      maxConnections: 2,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

/**
 * Baut die Absender-Adresse aus MAIL_FROM. Toleriert überzählige
 * Anführungszeichen in der Env-Variable ('"adresse@domain.de"') –
 * die würden sonst als quoted local-part interpretiert und der
 * Mailserver hängt seine eigene Domain an
 * ('"redaktion@medicalitpost.de"@ispgateway.de').
 */
export function getFromAddress():
  | string
  | { name: string; address: string } {
  const raw = (process.env.MAIL_FROM || "").trim();
  const match = raw.match(/<\s*([^<>\s]+)\s*>/);
  if (match) {
    const name = raw.replace(match[0], "").replace(/["']/g, "").trim();
    return name ? { name, address: match[1] } : match[1];
  }
  return raw.replace(/["']/g, "").trim();
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  /** Reine Text-Alternative (multipart/alternative senkt den Spam-Score). */
  text?: string;
  /**
   * Abmelde-URL für die List-Unsubscribe-Header (RFC 8058 One-Click).
   * Gmail/Yahoo verlangen diese Header seit 2024 für Newsletter;
   * nur bei Massenmails setzen, nicht bei transaktionalen Mails.
   */
  unsubscribeUrl?: string;
}): Promise<void> {
  if (!isMailConfigured()) {
    console.warn(
      `[mailer] SMTP nicht konfiguriert – Mail an ${options.to} ` +
        `("${options.subject}") wurde NICHT verschickt.`
    );
    // Links aus dem Mail-Inhalt loggen, damit sich Double-Opt-in
    // und Abmeldung lokal ohne SMTP testen lassen:
    const links = options.html.match(/https?:\/\/[^"'\s<]+/g) || [];
    for (const link of links) console.warn(`[mailer]   Link: ${link}`);
    return;
  }

  await getTransporter().sendMail({
    from: getFromAddress(),
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    headers: options.unsubscribeUrl
      ? {
          "List-Unsubscribe": `<${options.unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        }
      : undefined,
  });
}
