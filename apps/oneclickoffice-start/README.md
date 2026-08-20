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

## Was nach dem Absenden passiert

Der INSERT in `leads` löst drei Datenbank-Trigger aus:

| Trigger | Wirkung | Gilt für |
|---|---|---|
| `leads_to_kunden_pipeline` | legt einen Eintrag in `clients` an (Status „interessiert") | alle **ausser** `lp-start` |
| `trg_notify_new_lead` | **Telegram-Nachricht** über die Edge Function `notify-lead` | alle Leads |
| `trg_send_video_email` | **Video-Mail** über die Edge Function `send-video-email` | nur `source = 'lp-start'` |

Leads dieser Seite landen bewusst **nicht** in der Kundenpipeline: Das ist kalter
Ad-Traffic, der ein Video angefordert hat — kein Kunde. Sonst füllt sich die
Pipeline mit Kontakten, die nie ein Gespräch hatten.

Antworten auf die Video-Mail gehen an **info@trendingmedia.ch** (Reply-To); die
Absenderadresse `demo@oneclick-office.ch` ist faktisch ein unbetreutes Postfach.

Die Video-Mail enthält den Link auf `/video` und geht über Resend raus (eigener
OneClick-Office-Account, Domain verifiziert). Sie ist der Grund, warum das
Opt-in-Formular „bekommst den Link zusätzlich per E-Mail" verspricht — und sie
holt die zurück, die das Video nicht zu Ende schauen.

Quelltext: `supabase/functions/send-video-email/`. Änderungen daran müssen
deployt werden, das Repo allein ändert nichts an der laufenden Funktion.

Zum Prüfen ohne Mailversand (Shared-Secret nötig):

```bash
curl -X POST https://uzsyjoicirquqjejmutf.supabase.co/functions/v1/send-video-email \
  -H "Content-Type: application/json" -H "x-webhook-secret: <secret>" \
  -d '{"diag":true}'
```

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

## Funnel-Zahlen (eigenes Tracking)

Die Seite meldet jeden Schritt zusätzlich in die eigene Datenbank (Tabelle
`lp_events` im selben Supabase-Projekt wie die Leads). Anonym: keine IP, kein
Name, keine E-Mail — nur Ereignis, Zeitpunkt, Gerätetyp, UTM-Parameter und eine
Zufallskennung pro Besuch.

Grund: Meta-Pixel und GA4 verlieren durch Adblocker und abgelehnte Cookies je
nach Publikum 20–40 % der Ereignisse und zeigen keine durchgängige
Funnel-Ansicht. Für „von 200 Besuchern wie viele Leads?" braucht es eine Quelle,
die jeden mitzählt.

Auswertung per SQL:

```sql
select * from v_lp_funnel_total;   -- Gesamtbild mit Übergangsquoten
select * from v_lp_funnel_daily;   -- pro Tag und Gerät
```

`v_lp_funnel_total` zeigt die vier Quoten, auf die es ankommt:

| Spalte | Frage |
|---|---|
| `quote_geoeffnet_pct` | Wie viele Besucher öffnen überhaupt das Formular? |
| `quote_begonnen_pct` | Wie viele der Öffner fangen an zu tippen? |
| `quote_abgeschickt_pct` | Wie viele der Anfänger schicken ab? Hier zeigt sich, ob das Formular bremst (z. B. die Telefon-Pflicht). |
| `quote_gesamt_pct` | Besucher zu Lead. |

Gezählt werden **Besuche**, nicht Ereignisse — wer dreimal auf den Button tippt,
zählt einmal.

## Tracking

Gleiche IDs wie die Demo-Seite — GTM `GTM-52V9SJ6J`, Meta-Pixel
`1040498465323715`, Consent Mode v2 (siehe `index.html`). Die beiden Seiten
lassen sich im GTM über den Hostname trennen.

Ereignisse: `optin_view`, `cta_click`, `lead_start`, `lead_submit`,
`video_page_view`, `video_play`, `video_progress`, `video_complete`.

Jedes davon geht über `track()` in `src/lib/analytics.ts` an drei Stellen
gleichzeitig: dataLayer (GTM), eigene Datenbank und — für die Schritte, auf die
sich optimieren lässt — den Meta-Pixel:

| Funnel-Schritt | Meta-Ereignis |
|---|---|
| Seitenaufruf | `PageView` |
| Opt-in geöffnet | `ViewContent` |
| Formular begonnen | `InitiateCheckout` |
| Lead abgeschickt | `Lead` |
| Richtung Terminbuchung | `Schedule` |

Bewusst Meta-Standardereignisse statt eigener Namen: Nur auf die lässt sich im
Werbeanzeigenmanager direkt optimieren. Meta braucht rund 50 Ereignisse pro
Woche und Anzeigengruppe zum Lernen — reichen die Leads dafür nicht, kann
ersatzweise auf `ViewContent` oder `InitiateCheckout` optimiert werden.

## Entwickeln

```bash
bun run dev:oneclickoffice-start     # http://localhost:8081
bun run build:oneclickoffice-start
```

## Deploy

Eigener Railway-Service, Root Directory `/`, Dockerfile Path
`apps/oneclickoffice-start/Dockerfile`. Danach die Domain
`start.oneclick-office.ch` auf den Service zeigen lassen.
