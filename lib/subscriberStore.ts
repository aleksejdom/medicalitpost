import crypto from "crypto";
import { readJson, writeJson } from "./jsonStore";

/**
 * Newsletter-Abonnenten, DSGVO-konform:
 *  - Double-Opt-in (Status "pending" bis zur Bestätigung per E-Mail)
 *  - Einwilligung wird mit Zeitpunkt und Wortlaut dokumentiert
 *  - Abmeldung jederzeit per One-Click-Link (Token) möglich
 *  - Daten liegen lokal in data/subscribers.json (nicht öffentlich,
 *    nicht im Repository) und können im Admin-Backend gelöscht werden
 */
export interface Subscriber {
  email: string;
  token: string; // für Bestätigung und Abmeldung
  status: "pending" | "active" | "unsubscribed";
  createdAt: string;
  confirmedAt?: string;
  unsubscribedAt?: string;
  consentText: string;
}

const FILE = "subscribers.json";

export const CONSENT_TEXT =
  "Ich möchte den täglichen Newsletter von The Medical IT Post erhalten. " +
  "Die Einwilligung kann ich jederzeit über den Abmeldelink im Newsletter widerrufen.";

function load(): Subscriber[] {
  return readJson<Subscriber[]>(FILE, []);
}

function save(subscribers: Subscriber[]): void {
  writeJson(FILE, subscribers);
}

export function getSubscribers(): Subscriber[] {
  return load();
}

export function getActiveSubscribers(): Subscriber[] {
  return load().filter((s) => s.status === "active");
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Legt einen Abonnenten an (Status pending) bzw. reaktiviert ihn. */
export function subscribe(email: string): Subscriber {
  const normalized = email.trim().toLowerCase();
  if (!isValidEmail(normalized)) {
    throw new Error("Bitte eine gültige E-Mail-Adresse angeben.");
  }

  const subscribers = load();
  let subscriber = subscribers.find((s) => s.email === normalized);

  if (subscriber && subscriber.status === "active") {
    throw new Error("Diese E-Mail-Adresse ist bereits angemeldet.");
  }

  if (subscriber) {
    // erneute Anmeldung nach Abmeldung oder unbestätigtem Opt-in
    subscriber.status = "pending";
    subscriber.createdAt = new Date().toISOString();
    subscriber.token = crypto.randomBytes(24).toString("hex");
    subscriber.consentText = CONSENT_TEXT;
    delete subscriber.unsubscribedAt;
  } else {
    subscriber = {
      email: normalized,
      token: crypto.randomBytes(24).toString("hex"),
      status: "pending",
      createdAt: new Date().toISOString(),
      consentText: CONSENT_TEXT,
    };
    subscribers.push(subscriber);
  }

  save(subscribers);
  return subscriber;
}

/** Double-Opt-in: bestätigt eine Anmeldung über den Token aus der E-Mail. */
export function confirmSubscription(token: string): Subscriber | null {
  const subscribers = load();
  const subscriber = subscribers.find((s) => s.token === token);
  if (!subscriber) return null;
  if (subscriber.status !== "active") {
    subscriber.status = "active";
    subscriber.confirmedAt = new Date().toISOString();
    save(subscribers);
  }
  return subscriber;
}

/** One-Click-Abmeldung über den Token aus dem Newsletter. */
export function unsubscribeByToken(token: string): Subscriber | null {
  const subscribers = load();
  const subscriber = subscribers.find((s) => s.token === token);
  if (!subscriber) return null;
  subscriber.status = "unsubscribed";
  subscriber.unsubscribedAt = new Date().toISOString();
  save(subscribers);
  return subscriber;
}

/** Admin: Status einer Adresse ändern (z.B. abmelden). */
export function setSubscriberStatus(
  email: string,
  status: Subscriber["status"]
): boolean {
  const subscribers = load();
  const subscriber = subscribers.find((s) => s.email === email);
  if (!subscriber) return false;
  subscriber.status = status;
  if (status === "unsubscribed") {
    subscriber.unsubscribedAt = new Date().toISOString();
  }
  save(subscribers);
  return true;
}

/** Admin/DSGVO: Daten einer Adresse vollständig löschen. */
export function deleteSubscriber(email: string): boolean {
  const subscribers = load();
  const remaining = subscribers.filter((s) => s.email !== email);
  if (remaining.length === subscribers.length) return false;
  save(remaining);
  return true;
}
