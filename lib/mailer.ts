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
  return (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
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

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
