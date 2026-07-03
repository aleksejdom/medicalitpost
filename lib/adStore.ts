import { getSetting, setSetting } from "./db";

/**
 * Vom Admin gestaltete Werbe-Section, die im Newsletter
 * zwischen den beiden News platziert wird (mp_settings).
 */
export interface NewsletterAd {
  enabled: boolean;
  title: string;
  text: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
}

const KEY = "newsletter_ad";

const DEFAULT_AD: NewsletterAd = {
  enabled: false,
  title: "",
  text: "",
  imageUrl: "",
  linkUrl: "",
  buttonText: "Mehr erfahren",
};

export async function getNewsletterAd(): Promise<NewsletterAd> {
  const stored = await getSetting<Partial<NewsletterAd>>(KEY, {});
  return { ...DEFAULT_AD, ...stored };
}

export async function saveNewsletterAd(
  ad: Partial<NewsletterAd>
): Promise<NewsletterAd> {
  const merged = { ...(await getNewsletterAd()), ...ad };
  await setSetting(KEY, merged);
  return merged;
}
