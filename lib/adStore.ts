import { readJson, writeJson } from "./jsonStore";

/**
 * Vom Admin gestaltete Werbe-Section, die im Newsletter
 * zwischen den beiden News platziert wird.
 */
export interface NewsletterAd {
  enabled: boolean;
  title: string;
  text: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
}

const FILE = "newsletter-ad.json";

const DEFAULT_AD: NewsletterAd = {
  enabled: false,
  title: "",
  text: "",
  imageUrl: "",
  linkUrl: "",
  buttonText: "Mehr erfahren",
};

export function getNewsletterAd(): NewsletterAd {
  return { ...DEFAULT_AD, ...readJson<Partial<NewsletterAd>>(FILE, {}) };
}

export function saveNewsletterAd(ad: Partial<NewsletterAd>): NewsletterAd {
  const merged = { ...getNewsletterAd(), ...ad };
  writeJson(FILE, merged);
  return merged;
}
