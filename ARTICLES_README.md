# News Sync System - Dokumentation

## Übersicht

Das System fetcht automatisch Artikel von der [newsdata.io](https://newsdata.io) API, kategorisiert sie intelligent und speichert sie als `.md` Dateien.

## Komponenten

### 1. **NewsData Service** (`lib/newsDataService.ts`)
- Fetcht Artikel von newsdata.io API
- Kategorisiert Artikel intelligent basierend auf Keywords
- Konvertiert Artikel zu Markdown-Format

### 2. **Article Storage Service** (`lib/articleStorageService.ts`)
- Speichert Artikel als `.md` Dateien im Verzeichnis `public/articles/`
- Organisiert nach Kategorien in Unterordnern
- Liest und parst Artikel zurück aus den Dateien

### 3. **Sync API Endpoint** (`api/articles/sync/route.ts`)
- REST-Endpoint zum manuellen Triggern der Synchronisation
- Optional mit API-Key-Authentifizierung

### 4. **Kategorieseiten** (`kategorie/[kategorie]/page.tsx`)
- Zeigt alle Artikel einer Kategorie an
- Grid-Layout mit Bildern
- Links zu Detailseiten

### 5. **Artikel-Detailseiten** (`kategorie/[kategorie]/[id]/page.tsx`)
- Vollständige Artikel-Darstellung
- Verwandte Artikel-Vorschläge
- Breadcrumb-Navigation
- Link zum Original-Artikel

## Verwendung

### Manuelle Synchronisation

```bash
# Via cURL
curl http://localhost:3000/api/articles/sync

# Mit API-Key (falls konfiguriert)
curl -H "Authorization: Bearer your-secret-key" http://localhost:3000/api/articles/sync
```

### Automatische Synchronisation

Verwende einen Cron-Service wie [EasyCron](https://www.easycron.com/) oder GitHub Actions:

```yaml
# .github/workflows/sync-articles.yml
name: Sync Articles
on:
  schedule:
    - cron: '0 */6 * * *'  # Alle 6 Stunden

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Sync articles
        run: |
          curl -X GET http://your-domain.com/api/articles/sync \
            -H "Authorization: Bearer ${{ secrets.SYNC_API_KEY }}"
```

## Verzeichnisstruktur

```
public/
└── articles/
    ├── it-sicherheit/
    │   ├── article-1.md
    │   └── article-2.md
    ├── telematik/
    │   └── article-3.md
    ├── software/
    └── ...
```

## Kategorie-Mapping

| URL-Slug | Kategorie |
|----------|-----------|
| `it-sicherheit` | IT-Sicherheit |
| `telematik` | Telematik |
| `software` | Software |
| `digitalisierung` | Digitalisierung |
| `gesundheit` | Gesundheit |
| `digital-healthcare` | Digital Healthcare |

## Umgebungsvariablen

Setze diese in deiner `.env.local`:

```env
# NewsData API Key (optional, nutzt default wenn nicht gesetzt)
NEXT_PUBLIC_NEWSDATA_API_KEY=pub_740d805f1d334f91988ea89a4f637df2

# Sync API Key für sichere Synchronisation
SYNC_API_KEY=your-secret-key
```

## Filterkonfiguration

Die Filterbegriffe sind zentral in `app/config/articleFilters.ts` definiert:

```typescript
export const ARTICLE_FILTERS = {
  categories: ['IT-Sicherheit', 'Telematik', ...],
  keywords: ['it-sicherheit', 'cybersicherheit', ...]
}
```

## Artikel-Format (Markdown)

```markdown
---
id: "article-1234"
title: "Artikel-Titel"
description: "Kurzbeschreibung"
date: "2024-12-12T10:30:00"
source: "Quelle"
category: "IT-Sicherheit"
image: "https://example.com/image.jpg"
link: "https://original-source.com/article"
keywords: ["keyword1", "keyword2"]
---

# Artikel-Titel

**Quelle:** Quelle  
**Datum:** 12. Dezember 2024  
**Kategorie:** IT-Sicherheit

![Artikel-Titel](https://example.com/image.jpg)

## Zusammenfassung

Artikel-Beschreibung...

## Vollständiger Artikel

Artikel-Inhalt...

---

[Zum Originalartikel](https://original-source.com/article)
```

## Kategorisierung

Artikel werden automatisch kategorisiert basierend auf Keywords in Titel, Beschreibung und Inhalt:

- **IT-Sicherheit**: sicherheit, cybersicherheit, cyberangriff, firewall, etc.
- **Telematik**: telematik, ti-dienste, vpn, vzdentity, etc.
- **Software**: software, update, patch, version, api, etc.
- **Digitalisierung**: digital, e-health, vernetzung, interoperabilität, etc.
- **Gesundheit**: erezept, epa, patient, arzt, krankenhaus, etc.
- **Digital Healthcare**: alles andere

## Features

✅ Automatisches Fetchen von News  
✅ Intelligente Kategorisierung  
✅ Persistente Speicherung als Markdown  
✅ Responsive Kategorieseiten  
✅ Detailseiten für jeden Artikel  
✅ Verwandte Artikel-Vorschläge  
✅ SEO-freundlich  
✅ Static Generation mit ISR  

## API-Limits

NewsData.io API:
- **Free Tier**: 200 Requests pro Monat
- **Pro Tier**: 100 Requests pro Tag

Empfohlene Sync-Frequenz: **1-2 mal täglich**

## Troubleshooting

### Keine Artikel werden angezeigt

1. Überprüfe die API-Key in `.env.local`
2. Rufe `/api/articles/sync` auf
3. Prüfe `public/articles/` ob Dateien erstellt wurden

### Artikel werden falsch kategorisiert

- Passe Keywords in `app/config/articleFilters.ts` an
- Rufe erneut `/api/articles/sync` auf

### Alte Artikel anzeigen

- Lösche `public/articles/` um neu zu synchronisieren
- Oder implementiere Update-Logik in `articleStorageService.ts`
