# OneClick Office — Kampagnen-Landingpage

Ziel-Domain: **start.oneclick-office.ch**
Zweck: Landingpage für die Meta-Ads-Kampagne. Einziges Ziel ist der Lead —
Name, E-Mail, Telefonnummer. Das Video liegt hinter dem Eintrag.

Diese App ersetzt `demo.oneclick-office.ch` als Ad-Ziel. Die Demo-App bleibt
unverändert bestehen; in den Anzeigen wird lediglich die URL ausgetauscht.

## Aufbau

| Route | Inhalt |
|-------|--------|
| `/` | Opt-in: Headline, Startbild des Videos, Formular. Kein Video, keine Navigation. |
| `/video` | Video, Ist-/Wunschsituation, Ablauf, Referenz, Terminbuchung. |
| `/impressum`, `/datenschutz` | Rechtliche Pflichtseiten (aus der Demo-App übernommen). |

Ablauf: Anzeige → `/` → Formular → Lead landet in Supabase → Weiterleitung auf
`/video`. Der Link auf `/video` soll zusätzlich per E-Mail verschickt werden;
die Seite ist deshalb bewusst **ohne Zugangsschutz** erreichbar.

## Texte ändern

Alles liegt in **`src/lib/content.ts`** — Headline, Subheadline, Formularlabels,
Ablauf, Referenz. Der inhaltliche Angle steckt praktisch komplett in
`optin.headline` und `optin.subheadline`.

## Video

Liegt unter `public/video/oneclick-office.mp4` — 16 MB, 1920×920, 6:33 Minuten.
Aus dem 384 MB grossen Original erzeugt, schwarze Balken entfernt, für Web
komprimiert. Der genaue Befehl und das Vorgehen bei einem neuen Schnitt stehen
in `public/video/README.md`.

Weil die Balken weggeschnitten sind, ist das Format **nicht** 16:9. Player und
Startbild richten sich nach `VIDEO_ASPECT_RATIO` in `src/lib/content.ts`.

Das Startbild (`public/video-poster.webp`) ist ein Standbild aus Sekunde 262
(„Rechnung mit einem Klick"). Ein anderes wählen:

```bash
./scripts/poster.sh 130     # Startbild aus Sekunde 130
```

Der Zeitpunkt will mit Bedacht gewählt sein: Der Play-Button sitzt in der Mitte
des Bildes und verdeckt dort liegenden Text. Szenen mit Text oben und Screenshot
in der Mitte funktionieren am besten.

## Telefonnummer optional schalten

In `src/components/OptinForm.tsx` steht ganz oben:

```ts
const TELEFON_REQUIRED = true;
```

Auf `false` stellen, falls viel Traffic kommt, aber kaum jemand absendet. Das
Feld bleibt sichtbar, wird als „optional" ausgewiesen und nicht mehr erzwungen.

## Leads

Gehen per PostgREST-Insert in die Tabelle `leads` des Supabase-Projekts
`uzsyjoicirquqjejmutf` — dieselbe Tabelle wie bei der Demo-Seite, unterscheidbar
über `source`:

| `source` | Herkunft |
|----------|----------|
| `landingpage-demo` | Desktop-Wizard der Demo-Seite |
| `landingpage-demo-mobile` | Mobile-Optin der Demo-Seite (löst die Demo-Mail aus) |
| `lp-start` | **diese Seite** |

Bewusst ohne `@supabase/supabase-js`: die Lib kostet rund 40 KB gzip, gebraucht
wird ein einziger INSERT.

## Tracking

Gleiche IDs wie die Demo-Seite — GTM `GTM-52V9SJ6J`, Meta-Pixel
`1040498465323715`, Consent Mode v2 (siehe `index.html`). Die beiden Seiten
lassen sich im GTM über den Hostname trennen.

Ereignisse: `optin_view`, `cta_click`, `lead_start`, `lead_submit` (+ Meta
`Lead`), `video_page_view`, `video_play`, `video_progress`, `video_complete`.

## Entwickeln

```bash
bun run dev:oneclickoffice-start     # http://localhost:8081
bun run build:oneclickoffice-start
```

## Deploy

Eigener Railway-Service, Root Directory `/`, Dockerfile Path
`apps/oneclickoffice-start/Dockerfile`. Danach die Domain
`start.oneclick-office.ch` auf den Service zeigen lassen.
