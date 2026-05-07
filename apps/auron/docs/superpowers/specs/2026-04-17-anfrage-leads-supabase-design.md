# Anfrage-Leads → TIM-Supabase

**Datum:** 2026-04-17
**Projekt:** AURON_WEBSEITE
**Status:** Approved

## Ziel

Beantwortet ein Besucher die sechs Fragen auf `/Anfrage`, landen die Antworten sofort in einer Supabase-Tabelle im internen TIM-Zeiterfassungs-Projekt (`uzsyjoicirquqjejmutf`). Sobald der Besucher anschliessend via Cal.com einen Termin bucht, wird derselbe Datensatz um die Buchungsinfos ergänzt und eine Telegram-Nachricht verschickt.

## Architektur (aus der Vogelperspektive)

```
Browser (Anfrage.tsx)
    │  1) POST submit-lead  { answers }          (x-auron-secret)
    ▼
Edge Function submit-lead ──► Supabase Tabelle `website_leads`
    │  2) returns { lead_id }
    ▼
Browser baut Cal.com-Embed mit config.metadata.lead_id = <uuid>
    │
    │  User bucht Termin
    ▼
Cal.com ──► Edge Function cal-booking-webhook  (Cal-Signatur verifiziert)
    │       UPDATE website_leads SET booking_status='booked', …
    ▼
Telegram-Nachricht an Admin
```

## Datenmodell

Tabelle `public.website_leads`:

| Spalte              | Typ          | Hinweis                                       |
|---------------------|--------------|-----------------------------------------------|
| `id`                | uuid         | PK, default `gen_random_uuid()`               |
| `company_name`      | text         |                                               |
| `employees`         | text         | eine der Anfrage-Choices                      |
| `time_tracking`     | text         |                                               |
| `erp`               | text         |                                               |
| `pain_points`       | text[]       | multi-select                                  |
| `timeline`          | text         |                                               |
| `booking_status`    | text         | `'pending' \| 'booked' \| 'cancelled'`        |
| `booking_email`     | text         | aus Cal.com Webhook                           |
| `booking_name`      | text         |                                               |
| `booking_start_time`| timestamptz  |                                               |
| `booked_at`         | timestamptz  | Zeitpunkt des Webhook-Events                  |
| `created_at`        | timestamptz  | default `now()`                               |
| `updated_at`        | timestamptz  | default `now()`, Trigger on update            |

RLS: aktiviert, **keine** Policies → nur Service-Role (Edge Functions) hat Zugriff.

## Komponenten

### 1. `submit-lead` (Supabase Edge Function)

- Methode: `POST`
- Header: `x-auron-secret: <SUBMIT_LEAD_SECRET>` (shared secret, CORS nur `https://auron.ch` + localhost)
- Body:
  ```json
  {
    "company_name": "string",
    "employees": "string",
    "time_tracking": "string",
    "erp": "string",
    "pain_points": ["string"],
    "timeline": "string"
  }
  ```
- Verhalten: Insert in `website_leads` mit `booking_status='pending'`. Response `{ lead_id: "<uuid>" }`.
- Fehler: 401 bei falschem Secret, 400 bei Payload-Validation, 500 bei DB-Fehler.

### 2. `cal-booking-webhook` (Supabase Edge Function)

- Methode: `POST` (nur Cal.com)
- Verifiziert `X-Cal-Signature-256` (HMAC-SHA256 über Raw-Body mit `CAL_WEBHOOK_SECRET`).
- Liest aus Payload: `triggerEvent`, `payload.metadata.lead_id`, `payload.attendees[0].email/name`, `payload.startTime`.
- Verhalten:
  - Wenn `lead_id` vorhanden → UPDATE der Zeile.
  - Wenn nicht (z. B. User hat direkt-URL genutzt) → INSERT einer neuen Zeile nur mit Booking-Daten.
  - Verschickt anschliessend Telegram-Nachricht mit allen Lead- und Buchungsinfos.
- Fehlerverhalten: liefert 200 auch bei leichten Inkonsistenzen (Cal.com retried sonst ewig). Alles andere → Telegram-Error.

### 3. Website-Änderungen

**`src/lib/leadSubmit.ts`** (neu)
- Nur eine Funktion `submitLead(answers)` → POST zu `VITE_SUBMIT_LEAD_URL` mit Header `x-auron-secret: VITE_SUBMIT_LEAD_SECRET`.
- Liefert `{ lead_id }` oder wirft.

**`src/pages/Anfrage.tsx`**
- Nach Klick auf „Weiter" im letzten Schritt (`company_name`) → `submitLead()` aufrufen, `lead_id` in State speichern, dann `setCurrentStep(questions.length)` (Cal.com-Seite).
- Cal.com-Embed-Config wird erweitert um `config.metadata = { lead_id }`.
- Falls `submitLead` failt: dezente Fehlermeldung (Sonner-Toast), User kann trotzdem weiter zum Kalender — der `cal-booking-webhook` legt dann eine neue Zeile ohne Fragen-Antworten an.

**Env-Variablen** (in `.env` + Vite-Build):
- `VITE_SUBMIT_LEAD_URL` — z. B. `https://uzsyjoicirquqjejmutf.supabase.co/functions/v1/submit-lead`
- `VITE_SUBMIT_LEAD_SECRET` — Shared Secret (muss mit Edge Function Secret matchen)

### 4. Manueller Cal.com-Setup (nicht durch Code)

- Cal.com Dashboard → Webhooks → Add Webhook
  - URL: `https://uzsyjoicirquqjejmutf.supabase.co/functions/v1/cal-booking-webhook`
  - Events: `BOOKING_CREATED`, optional `BOOKING_CANCELLED`
  - Secret: generiert, wird in Supabase als `CAL_WEBHOOK_SECRET` hinterlegt.

## Sicherheit

- Shared Secret zwischen Browser und `submit-lead` schützt nicht gegen motivierte Angreifer (Secret ist im Bundle), aber filtert 99 % der Spam-Bots. Rate-Limiting passiert implizit via Supabase Edge-Function-Limits; für mehr Schutz kann später Cloudflare Turnstile vorgeschaltet werden.
- Cal.com-Webhook ist via HMAC-Signatur geschützt.
- RLS komplett zu → niemand ausser Service-Role liest/schreibt.
- Keine PII wird clientseitig geloggt.

## Offene Punkte / explizit weggeschnitten

- **Kein Captcha / Turnstile** in V1 — kann bei Bedarf nachgerüstet werden.
- **Keine UI für internes Lead-Management** — Admin schaut direkt in Supabase Table Editor oder baut später View ins TM-Tool.
- **Kein Email-Versand** an den Lead — Cal.com macht das bereits.
