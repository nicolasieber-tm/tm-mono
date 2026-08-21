# Funnel-Zahlen in Orbit anzeigen

Diese Anleitung richtet sich an **Orbit** (das Zeiterfassungs- und Verwaltungstool),
nicht an die Landingpage. Sie beschreibt, wie dort eine Ansicht entsteht, die zeigt,
wo Besucher der Kampagnen-Landingpage `start.oneclick-office.ch` abspringen.

---

## Die gute Nachricht zuerst

**Es braucht keine Schnittstelle.** Orbit läuft bereits auf derselben
Supabase-Datenbank wie die Landingpage (`uzsyjoicirquqjejmutf`). Die Zahlen liegen in
zwei fertigen Views und lassen sich mit dem normalen Supabase-Client abfragen, so wie
jede andere Tabelle in Orbit auch.

Kein API-Key, kein Webhook, kein zusätzlicher Dienst.

---

## Warum es diese Zahlen überhaupt gibt

Meta-Pixel und GA4 verlieren durch Werbeblocker und abgelehnte Cookies je nach
Publikum 20 bis 40 Prozent der Ereignisse. Für die Frage „von 200 Besuchern wie viele
Leads?" braucht es eine Quelle, die jeden mitzählt. Genau dafür schreibt die
Landingpage jeden Schritt zusätzlich in die eigene Tabelle `lp_events`.

Dort stehen **keine Kontaktdaten**: kein Name, keine E-Mail, keine IP. Nur Ereignis,
Zeitpunkt, Gerätetyp, Kampagnenparameter und eine Zufallskennung je Besuch.

---

## Voraussetzung (bereits erledigt)

`lp_events` hatte ursprünglich nur eine Schreibberechtigung für anonyme Besucher und
kein Leserecht. Die Views geben die Zugriffsrechte des Aufrufers weiter
(`security_invoker = true`), eine Abfrage aus Orbit hätte deshalb **stillschweigend
null Zeilen** geliefert statt einer Fehlermeldung.

Am 21.08.2026 wurde deshalb eine Lese-Policy ergänzt:

```sql
create policy "angemeldete koennen events lesen"
  on public.lp_events for select to authenticated using (true);
```

Bewusst nur für `authenticated`, nicht für `anon`: Der anonyme Schlüssel steht in
jedem ausgelieferten Frontend-Bundle. Wäre er leseberechtigt, könnte jeder die
Kampagnenzahlen abrufen. Angemeldet ist hier nur das eigene Team.

**Folge für Orbit:** Die Abfragen funktionieren für eingeloggte Nutzer sofort. Läuft
etwas über den Service-Role-Schlüssel, ohnehin.

---

## Die beiden Views

### `v_lp_funnel_total` — das Gesamtbild

Eine Zeile je Kampagne (`source`). Für diesen Funnel ist `source = 'lp-start'`.

| Spalte | Bedeutung |
|---|---|
| `source` | Kennzeichnet den Funnel. Immer auf `'lp-start'` filtern. |
| `besucher` | Besuche mit Seitenaufruf der Startseite |
| `optin_geoeffnet` | davon: haben das Formular geöffnet |
| `formular_begonnen` | davon: haben angefangen zu tippen |
| `leads` | davon: haben abgeschickt |
| `quote_geoeffnet_pct` | Öffner ÷ Besucher |
| `quote_begonnen_pct` | Tipper ÷ Öffner |
| `quote_abgeschickt_pct` | Absender ÷ Tipper |
| `quote_gesamt_pct` | Besucher zu Lead |

```sql
select * from v_lp_funnel_total where source = 'lp-start';
```

Beispielergebnis:

```
besucher 17 | optin_geoeffnet 9 | formular_begonnen 8 | leads 6
quote_geoeffnet 52.9 % | quote_begonnen 88.9 % | quote_abgeschickt 75.0 % | gesamt 35.3 %
```

### `v_lp_funnel_daily` — Verlauf pro Tag und Gerät

| Spalte | Bedeutung |
|---|---|
| `tag` | Datum |
| `source` | Funnel-Kennung |
| `device` | `mobile` oder `desktop` |
| `besucher`, `optin_geoeffnet`, `formular_begonnen`, `leads` | wie oben |
| `video_gestartet` | Wiedergabe hat tatsächlich begonnen |
| `video_zu_ende` | Video vollständig gesehen |
| `termin_geklickt` | Buchungs-Button angeklickt |

```sql
select * from v_lp_funnel_daily
where source = 'lp-start' and tag >= current_date - 30
order by tag desc, device;
```

**Wichtig:** Gezählt werden **Besuche**, nicht Ereignisse. Wer dreimal auf den Button
tippt, zählt einmal. Das ist Absicht, sonst verzerren Mehrfachklicks die Quoten.

---

## Was die Ansicht zeigen sollte

Der Zweck ist eine einzige Frage: **Wo springen Leute ab?** Eine Balkenkette mit den
vier Stufen und den Übergangsquoten dazwischen beantwortet das auf einen Blick.

```
Besucher            17  ████████████████████
Formular geöffnet    9  ██████████            52.9 %
Angefangen           8  █████████             88.9 %
Abgeschickt          6  ███████               75.0 %
```

Worauf beim Lesen zu achten ist:

- **`quote_geoeffnet_pct` niedrig** → das Problem liegt vor dem Formular: Anzeige,
  Headline oder Startbild überzeugen nicht.
- **`quote_abgeschickt_pct` niedrig** → das Formular bremst. Erster Verdächtiger ist
  die Telefonnummer, die aktuell Pflichtfeld ist.
- **Mobile gegen Desktop** über `v_lp_funnel_daily` vergleichen. Die beiden Geräte
  verhalten sich in diesem Funnel unterschiedlich, unter anderem weil das Video auf
  dem iPhone stumm startet.

Der Verlauf pro Tag ist erst ab echtem Anzeigen-Traffic aussagekräftig. Bei
einstelligen Zahlen springen Prozentwerte stark.

---

## Abfrage aus Orbit (TypeScript)

Mit dem vorhandenen Supabase-Client, ohne Zusatzkonfiguration:

```ts
const { data: gesamt, error } = await supabase
  .from("v_lp_funnel_total")
  .select("*")
  .eq("source", "lp-start")
  .maybeSingle();

const { data: verlauf } = await supabase
  .from("v_lp_funnel_daily")
  .select("*")
  .eq("source", "lp-start")
  .gte("tag", new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10))
  .order("tag", { ascending: false });
```

Kommt `null` oder ein leeres Ergebnis zurück, obwohl Daten vorhanden sind, ist der
Aufrufer nicht angemeldet — dann greift die RLS und liefert stumm nichts.

---

## Wenn eigene Auswertungen nötig werden

Die Views decken den Standardfall ab. Für Sonderfragen lässt sich `lp_events` direkt
abfragen. Die wichtigsten Ereignisnamen:

| `event` | Bedeutung |
|---|---|
| `optin_view` | Startseite aufgerufen |
| `cta_click` | Button geklickt; welcher, steht in `meta->>'cta_id'` |
| `lead_start` | erste Eingabe im Formular |
| `lead_submit` | Formular abgeschickt |
| `video_page_view` | Videoseite aufgerufen |
| `video_play` | Wiedergabe hat tatsächlich begonnen |
| `video_progress` | Fortschritt; Marke in `meta->>'video_percent'` (25/50/75/95) |
| `video_complete` | Video zu Ende |
| `video_ton_an` | auf Mobile den Ton dazugeholt |

Werte für `meta->>'cta_id'`: `video_poster`, `hero_button` (beide öffnen das Formular),
`booking`, `booking_under_video` (beide führen zur Terminbuchung).

Nützlich für die Frage, wo im Video abgesprungen wird:

```sql
select meta->>'video_percent' as marke, count(distinct session_id) as besuche
from lp_events
where source = 'lp-start' and event = 'video_progress'
group by 1 order by 1::int;
```

---

## Was hier bewusst nicht steht

`lp_events` enthält keine Kontaktdaten und lässt sich deshalb **nicht** mit einzelnen
Leads verbinden — jedenfalls nicht aus dieser Tabelle heraus. Die Brücke ist
`meta_event_id`, die sowohl am Lead als auch am `lead_submit`-Ereignis hängt. Das ist
für eine Übersichtsansicht aber weder nötig noch wünschenswert: Die Auswertung soll
Quoten zeigen, keine Personen.

Wer wirklich einzelne Leads sehen will, findet sie in `public.leads` mit
`source = 'lp-start'`.
