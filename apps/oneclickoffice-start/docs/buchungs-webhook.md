# Buchungs-Webhook: gebuchte Termine an Meta melden

Diese Anleitung richtet sich an das **Buchungssystem** (`timetracking.trendingmedia.ch`),
nicht an die Landingpage. Umzusetzen ist dort ein einziger HTTP-Aufruf nach jeder
erfolgreichen Buchung.

---

## Warum das nötig ist

Der Funnel `start.oneclick-office.ch` meldet Meta bisher nur den **Klick** auf den
Buchungs-Button. Ob daraus je ein Termin wurde, weiss niemand — weder die
Kampagnensteuerung noch die Auswertung.

Das hatte zwei Folgen: Meta optimierte auf Button-Klicks statt auf Termine, und die
Frage „welche Anzeige bringt tatsächlich Gespräche?" war nicht beantwortbar.

Deshalb wurde getrennt:

| Ereignis | Meta-Name | Wer meldet es |
|---|---|---|
| Klick auf den Buchungs-Button | `BookingIntent` | Landingpage (läuft bereits) |
| **Termin tatsächlich gebucht** | `Schedule` | **Buchungssystem — fehlt noch** |

> **Wichtig:** Solange dieser Aufruf fehlt, kommt bei Meta gar kein `Schedule` mehr an.
> Wer im Anzeigenmanager darauf optimiert, muss entweder vorher auf `BookingIntent`
> wechseln oder diesen Webhook zuerst einrichten.

---

## Der Aufruf

**Endpoint**

```
POST https://uzsyjoicirquqjejmutf.supabase.co/functions/v1/meta-capi
```

**Header**

| Header | Wert |
|---|---|
| `Content-Type` | `application/json` |
| `x-webhook-secret` | dasselbe Shared-Secret, das die übrigen lp-start-Funktionen nutzen |

Das Secret liegt im Supabase-Projekt `uzsyjoicirquqjejmutf` im Vault unter dem Namen
`oco_webhook_secret`. Es steht bewusst nicht in dieser Datei.

**Body**

```json
{
  "booking": {
    "email": "kunde@example.ch",
    "name": "Vorname Nachname",
    "telefon": "+41 79 123 45 67",
    "event_id": "BK-2026-0042",
    "created_at": "2026-08-20T14:30:00Z"
  }
}
```

### Felder

| Feld | Pflicht | Bedeutung |
|---|---|---|
| `email` | **ja** | E-Mail des Buchenden. Ohne sie lehnt die Funktion mit 422 ab — Meta braucht mindestens ein Zuordnungsmerkmal. |
| `name` | nein | Voller Name. Wird in Vor- und Nachname zerlegt. Verbessert die Zuordnung spürbar. |
| `telefon` | nein | In beliebigem Format; die Funktion normalisiert auf Schweizer Vorwahl. Verbessert die Zuordnung. |
| `event_id` | empfohlen | Die **Buchungsnummer aus eurem System**. Siehe „Doppelzählung" unten. |
| `created_at` | nein | Zeitpunkt der Buchung als ISO-8601. Fehlt er, wird der Zeitpunkt des Aufrufs verwendet. Meta akzeptiert bis zu 7 Tage rückwirkend. |

**Zu personenbezogenen Daten:** E-Mail, Telefonnummer und Name werden von der Funktion
ausschliesslich als SHA-256-Hash an Meta übertragen. Aus der Übertragung lassen sich die
Klardaten nicht zurückrechnen. Das Buchungssystem schickt sie im Klartext — die
Verbindung ist TLS-verschlüsselt und der Endpunkt durch das Shared-Secret geschützt.

---

## Beispiel

### TypeScript / JavaScript

```ts
async function meldeBuchungAnMeta(buchung: {
  email: string;
  name?: string;
  telefon?: string;
  id: string;
  erstelltAm: Date;
}) {
  try {
    const res = await fetch(
      "https://uzsyjoicirquqjejmutf.supabase.co/functions/v1/meta-capi",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": process.env.OCO_WEBHOOK_SECRET!,
        },
        body: JSON.stringify({
          booking: {
            email: buchung.email,
            name: buchung.name ?? "",
            telefon: buchung.telefon ?? "",
            event_id: buchung.id,
            created_at: buchung.erstelltAm.toISOString(),
          },
        }),
      },
    );
    if (!res.ok) {
      console.error("Meta-Meldung fehlgeschlagen:", res.status, await res.text());
    }
  } catch (e) {
    // Niemals die Buchung selbst scheitern lassen, nur weil die Meldung nicht durchkam.
    console.error("Meta-Meldung nicht zustellbar:", e);
  }
}
```

### curl (zum Ausprobieren)

```bash
curl -X POST https://uzsyjoicirquqjejmutf.supabase.co/functions/v1/meta-capi \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: <SECRET>" \
  -d '{
    "booking": {
      "email": "test@example.ch",
      "name": "Test Person",
      "telefon": "+41 79 000 00 00",
      "event_id": "TEST-1",
      "created_at": "2026-08-20T14:30:00Z"
    }
  }'
```

---

## Wann aufrufen — und wann nicht

**Aufrufen:** genau einmal, wenn eine Buchung erfolgreich abgeschlossen ist und der
Termin steht.

**Nicht aufrufen bei:**

- geöffnetem Buchungsfenster ohne Abschluss — das meldet die Landingpage bereits als `BookingIntent`
- abgebrochenen oder fehlgeschlagenen Buchungsversuchen
- **Terminverschiebungen** — sonst zählt derselbe Termin mehrfach
- Stornierungen — die Conversions API kennt kein Zurücknehmen; eine bereits gemeldete
  Buchung bleibt gemeldet

**Der Aufruf darf die Buchung nie blockieren.** Er gehört hinter den erfolgreichen
Abschluss, in einen `try/catch`, und ein Fehlschlag darf dem Buchenden nichts anhaben.
Lieber eine fehlende Meldung als eine gescheiterte Buchung.

---

## Doppelzählung vermeiden

`event_id` ist der Schlüssel dazu. Meta führt Ereignisse mit derselben `event_id`
zusammen, statt sie doppelt zu zählen. Wird die Buchungsnummer aus eurem System
mitgegeben, ist ein versehentlicher zweiter Aufruf — Retry, doppelt abgesendetes
Formular, erneuter Webhook — folgenlos.

Ohne `event_id` zählt jeder Aufruf als eigene Conversion.

---

## Antworten

| Status | Bedeutung | Zu tun |
|---|---|---|
| `200` | Ereignis angenommen und an Meta weitergereicht | nichts |
| `401` | Shared-Secret fehlt oder stimmt nicht | Header prüfen |
| `422` | keine E-Mail im Payload | `booking.email` mitgeben |
| `500` | `META_CAPI_ACCESS_TOKEN` in Supabase nicht gesetzt | Edge-Function-Settings prüfen |
| `502` | Meta hat abgelehnt; Antworttext steht in `detail` | `detail` lesen, meist ein Formatproblem |

Ein Fehlschlag ist nicht dramatisch: Es fehlt dann ein Datenpunkt für die
Kampagnenoptimierung, der Termin selbst ist davon unberührt.

---

## Prüfen, ob es ankommt

**Vor dem Scharfschalten** lässt sich testen, ohne die echten Zahlen zu verfälschen:

1. Im Events Manager unter **Testereignisse** den dort angezeigten Testcode holen.
2. Ihn im Body mitgeben — dann landet die Meldung nur im Testfenster, nicht in den
   Kampagnenzahlen:

```json
{
  "booking": { "email": "test@example.ch", "event_id": "TEST-1" },
  "test_event_code": "TEST12345"
}
```

3. Im Events Manager unter „Testereignisse" muss binnen Sekunden ein `Schedule`
   erscheinen.

**Erreichbarkeit ohne Versand prüfen:**

```bash
curl -X POST https://uzsyjoicirquqjejmutf.supabase.co/functions/v1/meta-capi \
  -H "Content-Type: application/json" -H "x-webhook-secret: <SECRET>" \
  -d '{"diag":true}'
```

Antwortet mit Pixel-ID und ob der Zugriffsschlüssel gesetzt ist — ohne etwas zu melden.

---

## Danach im Anzeigenmanager

Sobald echte `Schedule`-Ereignisse ankommen, lässt sich die Kampagne darauf optimieren.
Zwei Punkte dazu:

- **Meta braucht rund 50 Ereignisse pro Woche und Anzeigengruppe**, um zuverlässig zu
  lernen. Gebuchte Termine erreichen diese Zahl bei kleinem Budget selten. `Schedule`
  ist deshalb vor allem zum **Messen** wertvoll; optimiert wird sinnvollerweise weiter
  auf `Lead` oder `ViewContent`.
- Der Wert liegt in der Auswertung: Erst mit diesem Ereignis lässt sich beantworten,
  welche Anzeige Gespräche bringt statt nur Klicks.

---

## Zusammengefasst

Ein `POST` nach erfolgreicher Buchung, mit E-Mail und Buchungsnummer, geschützt durch
das Shared-Secret, in einem `try/catch`, der die Buchung nie gefährdet. Mehr ist es
nicht.

Die empfangende Seite ist bereits deployt und einsatzbereit:
`supabase/functions/meta-capi/index.ts` im Repo `tm-mono`, Buchungs-Zweig ab dem
Kommentar „Drei Quellen".
