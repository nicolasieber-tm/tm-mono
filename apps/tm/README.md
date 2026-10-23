# Trending Media Website

Marketing website for Trending Media — Digitalisierungspartner für Schweizer KMU.

## Stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- React Router

## Design

Die Apple-like Designsprache (Tokens, Patterns, Bausteine für neue Seiten) ist in
[`DESIGN.md`](./DESIGN.md) dokumentiert. Vor dem Erstellen neuer Seiten dort starten.

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

`build` macht drei Schritte: Client-Build (`dist/`), SSR-Build von
`src/entry-server.tsx` und `scripts/prerender.mjs`. Letzteres schreibt jede
Seite aus `PRERENDER_PATHS` (`src/routes.tsx`) als statisches HTML nach
`dist/<pfad>.html`, inklusive Titel, Description, Canonical und Open Graph,
dazu `dist/sitemap.xml` und `dist/404.html` (leere App-Shell für unbekannte
Pfade). Suchmaschinen und Link-Vorschauen sehen so den Inhalt ohne JavaScript.

Ausgeliefert wird mit `serve dist` **ohne `--single`**, sonst landet jeder
Pfad wieder bei `index.html` (siehe `Dockerfile`).

Neue Seite: Route in `src/routes.tsx` anlegen und den Pfad in
`PRERENDER_PATHS` eintragen. Code, der beim Rendern läuft, darf nicht auf
`window`/`document` zugreifen (nur in `useEffect`).

## Branchen-Landingpages (/handwerk)

Vorlage: `src/pages/Nische.tsx`, Inhalte: `src/data/nischen/`. Eine weitere
Variante (z. B. `/handwerk/elektro`) ist eine neue Konfigurationsdatei plus
Eintrag in `NISCHEN`; Route, Menü, Footer, Startseiten-Hinweis und
Vorrendern ergeben sich daraus. Die Telefonnummer erscheint, sobald
`contact.person.phone` gesetzt ist.

**Rückruf anfordern** (Dialog in `src/components/site/Callback.tsx`, geöffnet
über jeden Link `href="#rueckruf"`): sendet Name, Betrieb und Telefon an die
Edge Function `rueckruf` (Quelltext unter
`apps/oneclickoffice-start/supabase/functions/rueckruf/`). Diese ruft
`rueckruf_anfordern()` auf, die den Kontakt in der Orbit-Pipeline anlegt
(Status *interessiert*, Quelle *website*, zuständig Nicola, Follow-up heute)
bzw. bei bekannter Nummer den bestehenden Kontakt ergänzt, und meldet die
Anfrage per Telegram. Alle Anfragen zusätzlich in `rueckruf_anfragen`.

Links in Mails mit UTM-Parametern versehen, z. B.:

```
https://trendingmedia.ch/handwerk?utm_source=mail&utm_medium=outreach&utm_campaign=elektro-okt26
```

Messung: anonyme Ereignisse in `lp_events` (Supabase `uzsyjoicirquqjejmutf`,
`source = 'tm-handwerk'`, siehe `src/lib/track.ts`): `page_view`,
`calc_use`/`calc_change` (mit den eingegebenen Werten), `cta_click` mit
`cta_id` `booking_<sektion>`, `callback_<sektion>`, `phone_…`, `mail_kontakt`,
`fallstudie`, sowie `callback_submit`.
Auf localhost wird nichts gesendet.

```sql
select * from v_tm_nischen;  -- Besuche, Rechner, Buchungs-/Telefonklicks je Kampagne
```
