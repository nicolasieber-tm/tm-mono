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

## Meta Conversions API

Der Browser-Pixel wird bei 20–40 % der Besucher blockiert. Deshalb meldet
zusätzlich der Server jede Conversion an Meta — daran kommt kein Blocker vorbei.

Ablauf: Lead landet in `leads` → Trigger `trg_meta_capi` → Edge Function
`meta-capi` → Meta Graph API.

**Deduplizierung:** Die Seite erzeugt beim Absenden eine Kennung
(`meta_event_id`), gibt sie dem Pixel als `eventID` mit und speichert sie am
Lead. Der Server meldet mit derselben Kennung. Meta führt beide zu einem
Ereignis zusammen. Fehlt sie, zählt Meta jede Conversion doppelt.

**Datenschutz:** E-Mail, Telefon und Name verlassen das System ausschliesslich
als SHA-256-Hash. Die Datenschutzerklärung führt das unter „Conversions API" auf.

### Was serverseitig gemeldet wird

| Funnel-Schritt | Meta-Ereignis | Quelle |
|---|---|---|
| Opt-in geöffnet | `ViewContent` | `lp_events` |
| Formular begonnen | `InitiateCheckout` | `lp_events` |
| **Lead** | `Lead` | `leads` (mit gehashten Kontaktdaten) |
| Termin-CTA geklickt | `BookingIntent` | `lp_events` |
| **Termin gebucht** | `Schedule` | Webhook des Buchungssystems |
| Video gestartet / halb / ganz | `VideoStart` / `VideoHalf` / `VideoComplete` | `lp_events` |

Zwei Trigger: `trg_meta_capi` auf `leads`, `trg_meta_capi_event` auf `lp_events`.
Der zweite ist bewusst eng gefiltert — `lp_events` sammelt jeden Seitenaufruf
und vier Fortschrittsmeldungen pro Video; ohne Filter entstünden tausende
nutzlose HTTP-Aufrufe.

`lead_submit` meldet der lp_events-Trigger **nicht**: Den Lead meldet bereits der
Trigger auf `leads`, und von dort mit gehashten Kontaktdaten — was Meta eine viel
sicherere Zuordnung erlaubt.

**`Schedule` heisst der gebuchte Termin, nicht der Klick.** Vorher meldete schon
der Klick auf den Buchungs-Button `Schedule` — Meta optimierte damit auf Klicks,
und ob je ein Termin daraus wurde, wusste niemand. Der Klick heisst jetzt
`BookingIntent`; `Schedule` ist der tatsächlichen Buchung vorbehalten.

Damit das Ereignis ankommt, muss das Buchungssystem nach erfolgreicher Buchung
einmal hier anklopfen:

```bash
curl -X POST https://uzsyjoicirquqjejmutf.supabase.co/functions/v1/meta-capi \
  -H "Content-Type: application/json" -H "x-webhook-secret: <secret>" \
  -d '{"booking":{"email":"kunde@example.ch","name":"Vorname Nachname",
       "telefon":"+41 79 …","event_id":"<Buchungsnummer>","created_at":"2026-08-20T10:00:00Z"}}'
```

`event_id` sollte die Buchungsnummer des Systems sein — dann zählt ein
wiederholter Aufruf desselben Termins bei Meta nicht doppelt. **Bis dieser
Webhook eingerichtet ist, kommt kein `Schedule` mehr an.** Wer heute im
Anzeigenmanager auf `Schedule` optimiert, muss vorher auf `BookingIntent`
umstellen oder den Webhook zuerst einrichten.

**Warum das für die Kampagnensteuerung zählt:** Meta braucht rund 50 Ereignisse
pro Woche und Anzeigengruppe zum Lernen. Diese Zahl erreichen Leads bei kleinem
Budget nicht. Deshalb wird auf `ViewContent` (Opt-in geöffnet) optimiert — und
genau deshalb darf ausgerechnet dieses Ereignis nicht vom Browser abhängen.

### Benötigte Secrets (Supabase → Project Settings → Edge Functions)

| Secret | Zweck |
|---|---|
| `META_CAPI_ACCESS_TOKEN` | Zugriffsschlüssel aus dem Events Manager. **Pflicht.** |
| `META_TEST_EVENT_CODE` | Nur zum Prüfen: Meldungen erscheinen dann unter „Testereignisse". **Für den Echtbetrieb wieder entfernen**, sonst zählt Meta sie nicht als echte Conversions. |
| `META_PIXEL_ID` | Optional, Standard ist `1040498465323715`. |

Prüfen ohne Versand:

```bash
curl -X POST https://uzsyjoicirquqjejmutf.supabase.co/functions/v1/meta-capi \
  -H "Content-Type: application/json" -H "x-webhook-secret: <secret>" \
  -d '{"diag":true}'
```

## Follow-up-Strecke

Nach der Video-Mail folgen bis zu drei weitere Mails, je nachdem, wie weit
jemand gekommen ist. Vorher endete der Funnel nach einer einzigen Mail — wer das
Video nie öffnete oder es zu Ende sah und trotzdem nicht buchte, wurde nie
wieder angesprochen.

| Stufe | Frühestens | Bedingung | Betreff |
|---|---|---|---|
| 1 | nach 24 h | Video nie gestartet | „Dein Video wartet noch" |
| 2 | nach 3 Tagen | begonnen, nicht beendet | „Der Teil, der meistens überrascht" |
| 3 | nach 5 Tagen | zu Ende gesehen, kein Buchungs-Klick | „Was ein Erstgespräch bei uns nicht ist" |

Ein Lead bekommt pro Lauf höchstens eine Mail, und jede Stufe höchstens einmal.
Dafür sorgt der Unique-Index auf `lead_followups (lead_id, stufe)` — nicht die
Programmlogik. Eingetragen wird **vor** dem Versand: Eine ausgefallene Mail ist
verkraftbar, eine doppelte nicht.

**Woher der Fortschritt kommt:** aus `lp_events`, verbunden über
`meta_event_id`. Der Link in der Video-Mail trägt diese Kennung als `?fu=…` mit,
damit auch eine spätere Rückkehr aus der Mail dem Lead zugeordnet wird —
sonst bekäme jemand „du hast das Video noch nicht angesehen", obwohl er es
aus der Mail heraus zu Ende gesehen hat.

**Abmeldung:** Jede Folgemail trägt einen Abmeldelink und den
`List-Unsubscribe`-Kopf (seit den Gmail-/Yahoo-Anforderungen 2024 relevant für
die Zustellung). Eine Abmeldung setzt `leads.followup_abgemeldet_am`; die
Video-Mail selbst geht weiterhin raus — sie ist die angeforderte Auslieferung,
keine Werbung.

### In Betrieb nehmen

1. ~~Schema anlegen~~ — **erledigt** (Migration `followup_strecke_lp_start`,
   20.08.2026): Spalte `leads.followup_abgemeldet_am` und Tabelle
   `lead_followups` stehen auf dem Projekt.
2. Funktion deployen: `supabase functions deploy send-followup --no-verify-jwt`
   (der Abmeldelink wird ohne JWT aus der Mail heraus aufgerufen).
   Ebenfalls neu zu deployen, weil geändert: `send-video-email` und `meta-capi`.
3. Shared-Secret in den Vault legen und den stündlichen Job einplanen — beide
   SQL-Schnipsel stehen am Ende von
   `supabase/migrations/20260820_followup_strecke.sql`. Der Job wird bewusst
   erst nach dem Deploy eingeplant, sonst läuft er stündlich in einen 404.
4. Prüfen, ohne zu senden:

```bash
curl -X POST "https://uzsyjoicirquqjejmutf.supabase.co/functions/v1/send-followup?diag=1" \
  -H "Content-Type: application/json" -H "x-webhook-secret: <secret>"
```

Benötigte Secrets: dieselben wie `send-video-email`, zusätzlich
`TELEGRAM_BOT_TOKEN` und `TELEGRAM_CHAT_ID` für Störungsmeldungen sowie
optional `BOOKING_URL` (Standard ist das Buchungs-Widget dieser Kampagne).

**Vor dem Scharfschalten** einen Testlead anlegen und die drei Mails an die
eigene Adresse durchspielen — die Texte sprechen den Empfänger auf seinen
Fortschritt an, und eine falsch zugeordnete Stufe fällt sofort unangenehm auf.

## Entwickeln

```bash
bun run dev:oneclickoffice-start     # http://localhost:8081
bun run build:oneclickoffice-start
```

## Deploy

Eigener Railway-Service, Root Directory `/`, Dockerfile Path
`apps/oneclickoffice-start/Dockerfile`. Danach die Domain
`start.oneclick-office.ch` auf den Service zeigen lassen.
