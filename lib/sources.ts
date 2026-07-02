/**
 * Kostenlose Quellen für News rund um IT & Gesundheitswesen.
 *
 * mode bestimmt die Relevanz-Filterung:
 *  - "filter-health": allgemeine IT-Quelle -> nur Artikel mit Gesundheitsbezug übernehmen
 *  - "filter-it":     allgemeine Gesundheits-Quelle -> nur Artikel mit IT/Digital-Bezug übernehmen
 *  - "none":          Fachquelle für Health-IT -> alles übernehmen
 */
export interface RssSource {
  name: string;
  url: string;
  language: "de" | "en";
  mode: "filter-health" | "filter-it" | "none";
}

export const RSS_SOURCES: RssSource[] = [
  {
    name: "heise online",
    url: "https://www.heise.de/rss/heise-atom.xml",
    language: "de",
    mode: "filter-health",
  },
  {
    name: "heise Security",
    url: "https://www.heise.de/security/rss/news-atom.xml",
    language: "de",
    mode: "filter-health",
  },
  {
    name: "Golem.de",
    url: "https://rss.golem.de/rss.php?feed=RSS2.0",
    language: "de",
    mode: "filter-health",
  },
  {
    name: "it-daily.net",
    url: "https://www.it-daily.net/feed",
    language: "de",
    mode: "filter-health",
  },
  {
    name: "Bundesgesundheitsministerium",
    url: "https://www.bundesgesundheitsministerium.de/meldungen.xml",
    language: "de",
    mode: "filter-it",
  },
  {
    name: "mednic",
    url: "https://mednic.de/feed",
    language: "de",
    mode: "none",
  },
  {
    name: "Healthcare Computing",
    url: "https://www.healthcare-computing.de/rss/news.xml",
    language: "de",
    mode: "none",
  },
  {
    name: "netzpolitik.org",
    url: "https://netzpolitik.org/feed/",
    language: "de",
    mode: "filter-health",
  },
  {
    name: "ZEIT Digital",
    url: "https://newsfeed.zeit.de/digital/index",
    language: "de",
    mode: "filter-health",
  },
  {
    name: "ZEIT Gesundheit",
    url: "https://newsfeed.zeit.de/gesundheit/index",
    language: "de",
    mode: "filter-it",
  },
  {
    name: "SPIEGEL Netzwelt",
    url: "https://www.spiegel.de/netzwelt/index.rss",
    language: "de",
    mode: "filter-health",
  },
  {
    name: "SPIEGEL Gesundheit",
    url: "https://www.spiegel.de/gesundheit/index.rss",
    language: "de",
    mode: "filter-it",
  },
  {
    name: "t3n",
    url: "https://t3n.de/rss.xml",
    language: "de",
    mode: "filter-health",
  },
  {
    name: "eGovernment.de",
    url: "https://www.egovernment.de/rss/news.xml",
    language: "de",
    mode: "filter-health",
  },
];

// Englischsprachige Fachquellen (MedTech Dive, Digital Health UK,
// HIT Consultant) wurden entfernt: Es werden nur deutschsprachige
// Beiträge publiziert.
