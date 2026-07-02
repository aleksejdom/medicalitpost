# News-Sync-System – Dokumentation

## Übersicht

Das Portal sammelt automatisch aktuelle Nachrichten an der Schnittstelle
**IT × Gesundheitswesen** (Telematik, TI-Gateway, Medizintechnik, Regelungen,
Software/KI, Digitalisierung) aus kostenlosen Quellen, filtert sie per
Keyword-Analyse, kategorisiert sie und archiviert sie als Markdown-Dateien
unter `public/articles/<kategorie>/`. **Publiziert werden nur
deutschsprachige Beiträge**; Dubletten werden über Original-Link und Titel
verhindert.

Dazu gibt es ein **Admin-Backend** (`/admin`) mit Abonnenten-, Werbe- und
Quellen-Verwaltung sowie einen **DSGVO-konformen Newsletter**
(Double-Opt-in, One-Click-Abmeldung).

## News-Quellen

Die Quellen liegen in `data/sources.json` und werden im Admin-Backend
verwaltet (hinzufügen mit Feed-Test, pausieren, entfernen). Beim ersten
Start wird die Datei mit den Standard-Quellen aus `lib/sources.ts` befüllt:

| Quelle | Typ | Filterung |
|---|---|---|
| heise online | Atom | nur Artikel mit Gesundheitsbezug |
| heise Security | Atom | nur Artikel mit Gesundheitsbezug |
| Golem.de | RSS | nur Artikel mit Gesundheitsbezug |
| it-daily.net | RSS | nur Artikel mit Gesundheitsbezug |
| Bundesgesundheitsministerium (Meldungen) | RSS | nur Artikel mit IT/Digital-Bezug |
| mednic | RSS | ungefiltert (Health-IT-Fachportal) |
| Healthcare Computing | RSS | ungefiltert (Health-IT-Fachportal) |
| netzpolitik.org | RSS | nur Artikel mit Gesundheitsbezug |
| ZEIT Digital | RSS | nur Artikel mit Gesundheitsbezug |
| ZEIT Gesundheit | RSS | nur Artikel mit IT-Bezug |
| SPIEGEL Netzwelt | RSS | nur Artikel mit Gesundheitsbezug |
| SPIEGEL Gesundheit | RSS | nur Artikel mit IT-Bezug |
| t3n | RSS | nur Artikel mit Gesundheitsbezug |
| eGovernment.de | RSS | nur Artikel mit Gesundheitsbezug |
| newsdata.io API | JSON | Gesundheits- UND IT-Bezug (Key in `.env`) |

Geprüft, aber nicht nutzbar (kein RSS-Feed oder blockiert): aerzteblatt.de,
gematik.de, kma-online.de, Healthcare IT News, mobihealthnews, E-HEALTH-COM,
apotheke-adhoc.de, Ärzte Zeitung, Tagesspiegel Background.

## Komponenten

**News-Pipeline**
- `lib/sources.ts` – Standard-Quellen (Seed), `lib/sourceStore.ts` – verwaltbare Quellen (`data/sources.json`)
- `lib/categorize.ts` – Relevanz-Prüfung + Kategorisierung (Keyword-Matching mit Wortgrenzen)
- `lib/newsService.ts` – Feed-Abruf (RSS 2.0 + Atom), newsdata.io, Werbe-Blocklist, Altersfilter (max. 45 Tage), nur Deutsch
- `lib/articleStore.ts` – Speichern/Lesen der `.md`-Dateien, Dedupe über Link **und** Titel (beim Speichern und beim Lesen)
- `lib/sync.ts` – `syncNews()` + `ensureFreshArticles()` (automatischer Sync, max. 1×/Stunde)
- `app/api/articles/sync/route.ts` – Sync-Endpoint für Cron-Jobs

**Seiten**
- `app/page.tsx` – Startseite (24 neueste Artikel + Newsletter-Anmeldung)
- `app/kategorie/[kategorie]/page.tsx` – Kategorie-Archiv
- `app/kategorie/[kategorie]/[id]/page.tsx` – Beitragsseite (ausführliche Zusammenfassung, ein Original-Link, verwandte Artikel)
- `app/archiv/page.tsx` – Gesamtarchiv nach Monat
- `app/datenschutz/page.tsx` – Datenschutzerklärung (Vorlage – Kontaktdaten ergänzen!)
- `app/newsletter/page.tsx` – Statusseite für Bestätigung/Abmeldung

**Newsletter (DSGVO-konform)**
- `lib/subscriberStore.ts` – Abonnenten in `data/subscribers.json` (nicht öffentlich, nicht im Git): Double-Opt-in-Status, Einwilligungszeitpunkte + -wortlaut
- `lib/newsletter.ts` – Newsletter-HTML (News 1 → **Werbe-Section** → News 2), Bestätigungs-Mail, Versand mit Sende-Log (keine doppelt verschickten News)
- `lib/adStore.ts` – Werbe-Section (`data/newsletter-ad.json`): Titel, Text, Bildmotiv, Link, Button
- `lib/mailer.ts` – SMTP-Versand; ohne SMTP-Konfiguration werden Mails samt Links in die Konsole geloggt (lokales Testen)
- API: `POST /api/newsletter/subscribe`, `GET /api/newsletter/confirm`, `GET /api/newsletter/unsubscribe`, `POST /api/newsletter/send`

**Admin-Backend (`/admin`)**
- Login über `ADMIN_PASSWORD` (.env), httpOnly-Session-Cookie (8 h)
- Tab „Abonnenten“: Liste mit Status/Zeitpunkten, Abmelden/Aktivieren, vollständiges Löschen (Art. 17 DSGVO)
- Tab „Newsletter & Werbung“: Werbe-Section gestalten (Text, Bildmotiv, Link, Button), HTML-Vorschau, manueller Versand
- Tab „News-Quellen“: RSS-Quellen hinzufügen (mit Feed-Test), pausieren, entfernen

## Kategorien

`telematik`, `it-sicherheit`, `software`, `medizintechnik`, `regelungen`,
`digitalisierung` – definiert in `lib/categorize.ts` (`CATEGORIES`).

## Aktualität & Cron

1. **Artikel:** Jeder Aufruf der Startseite synct automatisch, wenn der
   letzte Sync älter als 60 Minuten ist. Für Produktion zusätzlich:

```bash
curl https://deine-domain.de/api/articles/sync
```

2. **Newsletter (täglich 1–2 News):** täglichen Cron-Job einrichten, z.B. 07:00:

```bash
curl -X POST -H "Authorization: Bearer $SYNC_API_KEY" https://deine-domain.de/api/newsletter/send
```

GitHub-Actions-Beispiel:

```yaml
name: Daily
on:
  schedule:
    - cron: '0 5 * * *'   # 07:00 MESZ
jobs:
  newsletter:
    runs-on: ubuntu-latest
    steps:
      - run: curl -fsS https://deine-domain.de/api/articles/sync
      - run: |
          curl -fsS -X POST \
            -H "Authorization: Bearer ${{ secrets.SYNC_API_KEY }}" \
            https://deine-domain.de/api/newsletter/send
```

## Umgebungsvariablen (`.env`)

- `NEWSDATA_API_KEY` – Key für newsdata.io (kostenloser Plan)
- `ADMIN_PASSWORD` – Passwort für das Admin-Backend (**unbedingt ändern!**)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` – Mail-Versand
- `BASE_URL` – öffentliche URL (für Links in E-Mails)
- `SYNC_API_KEY` – optional; sichert Sync- und Newsletter-Endpoint für Cron-Jobs ab

## DSGVO-Checkliste Newsletter

- ✅ Double-Opt-in mit dokumentiertem Einwilligungswortlaut und Zeitpunkten
- ✅ Abmeldelink in jeder E-Mail (One-Click, tokenbasiert)
- ✅ Vollständige Datenlöschung im Admin-Backend
- ✅ Einwilligungs-Checkbox mit Datenschutz-Link im Anmeldeformular
- ✅ Daten lokal in `data/` (per .gitignore vom Repository ausgeschlossen)
- ⚠️ `app/datenschutz/page.tsx`: Anschrift/Kontakt ergänzen und juristisch prüfen lassen

## Hinweis zum Hosting

Artikel, Abonnenten und Quellen werden ins Dateisystem geschrieben
(`public/articles/`, `data/`). Das funktioniert lokal und auf jedem
Server/VPS mit persistentem Dateisystem. Auf **Vercel/Netlify (Serverless)**
ist das Dateisystem flüchtig – dort müsste die Speicherung auf eine
Datenbank (z.B. Supabase) umgestellt werden.
