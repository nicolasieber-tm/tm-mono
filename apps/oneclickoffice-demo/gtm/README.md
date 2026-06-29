# GTM-Setup – OneClick Office Demo (Funnel)

Importierbare Container-Konfiguration für **GTM-52V9SJ6J** mit dem kompletten
Demo-Funnel. Die Consent-Mode-v2-Defaults und der GTM-Loader stecken bereits
im Code (`index.html` + `src/lib/analytics.ts`), hier geht es nur um die
GTM-/GA4-Konfiguration.

## Datei
- `GTM-52V9SJ6J-funnel.json` – Tags, Trigger und Variablen zum Importieren.

## Was drin ist
- **GA4 – Konfiguration (Pageview)**: feuert auf *Initialization – All Pages*, sendet `page_view` für die **gesamte Seite** (nicht nur die Demo).
- **Demo-Funnel**: `demo_start`, `demo_step`, `demo_complete`, `demo_abandon`.
- **CTA**: `cta_click` (Hero-Buttons „Live-Demo" / „Anfrage"; Parameter `cta_id`, `cta_label`).
- **Lead-Funnel** (Frage-Wizard im Anfrage-Formular): `lead_start`, `lead_step` (`lead_question`, `lead_answer`), `lead_submit` (Conversion).
- Pro Event ein **Custom-Event-Trigger** (CE – …) + GA4-Event-Tag.
- **Data-Layer-Variablen** (DLV – …) für alle Event-Parameter.
- **Const – GA4 Measurement ID**: zentrale Konstante mit Platzhalter `G-XXXXXXXXXX`.

### Funnel-Übersicht
`page_view` → `cta_click` → `demo_start` → `demo_step`/`demo_complete`/`demo_abandon` → `lead_start` → `lead_step` → `lead_submit`

## Import (ca. 5 Minuten)
1. In GTM den Container **GTM-52V9SJ6J** öffnen.
2. **Admin → Container importieren** → Datei `GTM-52V9SJ6J-funnel.json` wählen.
3. Arbeitsbereich: **Bestehend** (z. B. Default Workspace).
4. Option **„Zusammenführen"** (Merge) wählen, *nicht* „Überschreiben", damit
   nichts anderes verloren geht. Bei Konflikten „umbenennen" ist okay.
5. **Vorschau der Änderungen** prüfen → **Bestätigen**.

## Danach unbedingt erledigen
1. **Measurement-ID eintragen:** Variablen → **Const – GA4 Measurement ID** →
   Platzhalter `G-XXXXXXXXXX` durch deine echte GA4-ID ersetzen. (Damit ziehen
   alle fünf Tags automatisch die richtige ID.)
   *Alternativ* vor dem Import in der JSON per Suchen/Ersetzen `G-XXXXXXXXXX`
   durch die echte ID ersetzen.
2. **Veröffentlichen** (Submit → Version veröffentlichen).

## GA4-Seite (einmalig, in GA4 – nicht in GTM)
1. GA4-Property anlegen, Web-Datenstream erstellen → daraus stammt die `G-XXXX`-ID.
2. **Custom Dimensions** anlegen (Verwalten → Benutzerdefinierte Definitionen),
   damit die Event-Parameter auswertbar sind:
   `demo_variant`, `demo_step`, `demo_step_title`, `demo_total_steps`,
   `cta_id`, `cta_label`, `lead_step`, `lead_question`, `lead_answer`.
3. **`lead_submit` als Schlüsselereignis (Conversion)** markieren
   (Verwalten → Ereignisse → Als Schlüsselereignis markieren).
4. **Funnel-Exploration** (Explorationen → Trichter), z. B.:
   `page_view` → `cta_click` → `demo_start` → `lead_start` → `lead_submit`.
   Mit `demo_step` bzw. `lead_step` als Aufschlüsselung siehst du, wo Leute aussteigen.

> Hinweis: Die App ist eine SPA. `page_view` feuert beim ersten Laden. Der
> Wechsel auf `/danke` nach dem Absenden löst KEINEN automatischen zweiten
> Pageview aus – die Conversion misst du daher über `lead_submit` (zuverlässiger).

## Consent Mode v2
- Standard ist **alles „denied"** (gesetzt in `index.html`, vor dem GTM-Load).
- Bis zur Einwilligung sendet GA4 nur **cookielose, modellierte Pings**
  (Traffic bleibt sichtbar, ohne Cookies).
- „Akzeptieren" im Banner ruft `consent: update → granted` auf (siehe
  `src/lib/analytics.ts → setConsent`), „Ablehnen" bleibt auf „denied".
- Die GA4-Tags haben die eingebauten Consent-Prüfungen (`analytics_storage`)
  automatisch – es sind keine zusätzlichen Consent-Einstellungen nötig.

## Funktioniert ein Tag-Import mal nicht?
Variablen und Trigger importieren immer zuverlässig. Sollte GTM bei einem
GA4-Tag wegen Versionsunterschieden meckern, einfach das Tag manuell anlegen:
Typ **GA4-Event**, Measurement-ID = `{{Const – GA4 Measurement ID}}`,
Event-Name = `demo_start` (bzw. `_step`/`_complete`/`_abandon`), Event-Parameter
= die `{{DLV – …}}`-Variablen, Trigger = der passende `CE – …`.
