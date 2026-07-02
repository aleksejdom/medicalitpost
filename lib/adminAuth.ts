import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Einfache Admin-Authentifizierung über ADMIN_PASSWORD (.env) und ein
 * httpOnly-Session-Cookie. Ohne gesetztes Passwort bleibt das Backend
 * gesperrt.
 */
export const ADMIN_COOKIE = "admin_session";

export function sessionToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return crypto
    .createHash("sha256")
    .update(`medicalposts-admin:${password}`)
    .digest("hex");
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const token = sessionToken();
  if (!token) return false;
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === token;
}
