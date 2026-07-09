import { StoredArticle } from "./types";
import { getBaseUrl } from "./mailer";

/**
 * Zentrale SEO-Konstanten und JSON-LD-Schemas (schema.org).
 * Fokus-Suchbegriff: "News aus IT & Gesundheitswesen".
 */

export const SITE_NAME = "The Medical IT Post";

export const SITE_TITLE =
  "News aus IT & Gesundheitswesen – The Medical IT Post";

export const SITE_DESCRIPTION =
  "Tägliche News aus IT & Gesundheitswesen: elektronische Patientenakte, " +
  "Telematikinfrastruktur, KI in der Medizin, IT-Sicherheit im Krankenhaus " +
  "und Digitalisierung im Gesundheitswesen – kompakt und relevant.";

export const SITE_KEYWORDS = [
  "News aus IT & Gesundheitswesen",
  "IT im Gesundheitswesen",
  "Gesundheits-IT News",
  "Digitalisierung Gesundheitswesen",
  "elektronische Patientenakte",
  "Telematikinfrastruktur",
  "KI in der Medizin",
  "IT-Sicherheit Krankenhaus",
];

function organization() {
  const baseUrl = getBaseUrl();
  return {
    "@type": "NewsMediaOrganization",
    "@id": `${baseUrl}/#organization`,
    name: SITE_NAME,
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/icon.svg`,
    },
  };
}

/** Site-weit: Herausgeber + Website (gehört ins Root-Layout). */
export function siteJsonLd() {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(),
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        name: SITE_NAME,
        alternateName: "News aus IT & Gesundheitswesen",
        description: SITE_DESCRIPTION,
        url: baseUrl,
        inLanguage: "de-DE",
        publisher: { "@id": `${baseUrl}/#organization` },
      },
    ],
  };
}

/** NewsArticle-Schema für die Beitragsseite. */
export function newsArticleJsonLd(
  article: StoredArticle,
  categoryLabel: string
) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/kategorie/${article.category}/${article.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${url}/#article`,
    headline: article.title.slice(0, 110),
    description: article.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(article.image ? { image: [article.image] } : {}),
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: "de-DE",
    articleSection: categoryLabel,
    // Beiträge sind redaktionelle Zusammenfassungen der Originalquelle
    ...(article.link ? { isBasedOn: article.link } : {}),
    author: { "@id": `${baseUrl}/#organization` },
    publisher: organization(),
  };
}

/** BreadcrumbList-Schema, z.B. Home > Telematik > Artikel. */
export function breadcrumbJsonLd(
  items: Array<{ name: string; path?: string }>
) {
  const baseUrl = getBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      // Das letzte Element (aktuelle Seite) braucht keine URL
      ...(item.path ? { item: `${baseUrl}${item.path}` } : {}),
    })),
  };
}

/** CollectionPage + ItemList für Kategorieseiten. */
export function categoryJsonLd(
  categoryLabel: string,
  categorySlug: string,
  articles: StoredArticle[]
) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/kategorie/${categorySlug}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    name: `${categoryLabel} – News aus IT & Gesundheitswesen`,
    url,
    inLanguage: "de-DE",
    isPartOf: { "@id": `${baseUrl}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.slice(0, 20).map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${baseUrl}/kategorie/${article.category}/${article.id}`,
        name: article.title,
      })),
    },
  };
}
