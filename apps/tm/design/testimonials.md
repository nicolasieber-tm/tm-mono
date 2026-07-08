# Testimonials / Kundenstimmen — Design-Werkstatt & Einbau-Plan

> **Status:** 🟡 In Vorbereitung — **noch nicht live.** Wird erst eingebaut, wenn
> genug echte, freigegebene Testimonials vorliegen (Stand jetzt: 1 echtes für
> Webseiten, ein zweites in Aussicht).

Diese Datei ist der rote Faden, damit in einer späteren Session ohne Kontextverlust
weitergearbeitet werden kann. Sie gehört zu **`testimonials.html`** (Design-Werkstatt).

**Vorschau im localhost** (damit Logo-Pfade wie `/referenz_…png` = Vite public-Root
funktionieren): Server-Root muss `apps/tm/public` sein, die HTML wird über einen
Symlink dort eingehängt:

```bash
cd apps/tm/public
ln -sf ../design/testimonials.html ./_testimonials-preview.html
python3 -m http.server 8777 --bind 127.0.0.1
# → http://127.0.0.1:8777/_testimonials-preview.html
```

> ⚠️ `apps/tm/public/_testimonials-preview.html` ist nur ein **Vorschau-Symlink**
> (mit `_` als „nicht committen"-Marker). Vor einem echten Build/Commit entfernen:
> `rm apps/tm/public/_testimonials-preview.html`. Per Doppelklick (file://) öffnen
> geht auch, dann fehlt nur das Logo.

---

## 1. Ziel

Eine Testimonial-/Kundenstimmen-Section, die als **Vorher → Heute-Story** funktioniert
(nicht als Floskel-Lob). Verteilung:

| Seite | App | Zeigt |
|-------|-----|-------|
| Hauptseite | `apps/tm` (`Index.tsx`) | **alle** Testimonials, mit Produkt-Filter |
| Webseiten/Landingpages | `apps/sichtbarkeit` (`Index.tsx`) | nur `product:"web"` |
| Auron | `apps/auron` (`Index.tsx`) | nur `product:"auron"` |
| OneClickOffice | `apps/oneclickoffice` (`Index.tsx`) | nur `product:"oco"` |

Automatisierungs-Testimonials (`product:"auto"`) erscheinen nur auf der TM-Hauptseite,
solange es dafür keine eigene Produkt-Unterseite gibt.

---

## 2. Designentscheidungen (warum es so aussieht)

Alles folgt der bestehenden Apple-Designsprache (`apps/tm/DESIGN.md`):

- **Vivid-Skin** geerbt (warm-weiss, feine Borders, Gradient-Akzent sparsam).
- **Produkt-Farbcode** pro Karte über einen feinen Gradient-Faden oben + Tag-Farbe:
  - Webseiten → Violett `#8b5cf6`
  - Auron → Orange `#ff7a3c`
  - Automatisierung → Cyan-Blau `#2b9fd6`
  - OneClickOffice → Indigo-Blau `#2f62e6` (bewusst kräftiger/dunkler als das Automatisierungs-Blau, damit die zwei Blau-Kategorien unterscheidbar bleiben; entspricht der OneClickOffice-App-Marke `hsl(224 76% 53%)`)

  > **Hinweis:** Die anfangs angelegte eigene Kategorie „Buchungstool" (`buchung`, Smaragd) wurde
  > wieder **entfernt**. Entscheid: Buchung ist nie ein eigenes Produkt, sondern entweder ein
  > Web-Feature (Sandro → `web`) oder eine individuelle Entwicklung/Automation (Moodpix/André → `auto`).
  - (deckt sich mit den Produktfarben aus `Index.tsx` / den Apps)
- **Vorher → Heute** als zwei kleine Boxen mit Pfeil = die Kern-Story, kompakt.
- **Metrik** (z.B. „~5 h weniger Büro/Woche") optional als Gradient-Zahl — die
  stärkste Form von Social Proof. Wenn vorhanden, immer nutzen.
- **Featured-Karte** (breit, `featured:true`) für das stärkste Zitat. Max. 1.
- **Avatar**: Foto wenn vorhanden, sonst Initialen auf Produkt-Gradient.
- **Filter-Pills** nur auf der TM-Hauptseite. Unterseiten liefern vorgefiltert aus
  (kein Filter-UI nötig).
- **Reduced-Motion**: beim React-Einbau `.reveal`-Klasse + IntersectionObserver
  wie im Rest der Seite verwenden (siehe `Index.tsx`).

---

## 3. Datenmodell

Ein Eintrag (in der HTML als JS-Objekt, beim Einbau identisch als TS-Typ):

```ts
type Testimonial = {
  product: "web" | "auron" | "auto";   // Farbe + Filter
  quote: string;                        // Zitat; <span class="hl">…</span> hebt eine Phrase hervor
  before?: string;                      // Vorher-Box (kurz! ~4-6 Wörter)
  after?: string;                       // Heute-Box  (kurz!)
  metric?: { value: string; label: string }; // z.B. { value: "12 h", label: "gespart pro Woche" }
  name: string;                         // "Vorname Nachname"
  role?: string;                        // "Funktion, Firma"
  company?: string;                     // für Logo-alt / optional
  logo?: string;                        // Pfad zu Firmenlogo (sonst Initialen-Avatar)
  featured?: boolean;                   // breite Karte, max. 1
  real: boolean;                        // true = echt & freigegeben · false = DEMO (Badge, vor Go-Live raus)
};
```

**`real: false`** = Platzhalter. In der Werkstatt tragen diese ein „Demo"-Badge und
lassen sich per Schalter ausblenden. **Vor dem Go-Live müssen alle `real:false`-Einträge
gelöscht sein.**

---

## 4. Stand der echten Inhalte

Kunden werden per Nachricht um 2–3 Sätze gebeten (Vorher/Nachher-Story). Fragenkataloge
pro Produkt liegen vor (Web: Anfragen vorher/nachher + Zahl; Auto: welcher Ablauf nervte +
heute + Zeitersparnis; Auron: Erfassung vorher + Pannen + heute + Umsatz). Pro Testimonial
außerdem **Freigabe für Name + Firma + Logo** einholen.

| # | Produkt | Kunde | Zitat da? | Freigabe? | Notiz |
|---|---------|-------|-----------|-----------|-------|
| 1 | web | Mehmet, Verkehrsschule Mittelland | ✅ | ✅ Name + Logo | eingebaut (normale Karte). Foto `photo:"/referenz_mehmet_bild.jpeg"`, Logo `logo:"/referenz_verkehrsschule-mittelland_logo.png"` (public-Root, produktionskonform). Keine Zahl genannt → ohne Metrik. ✅ **Foto komprimiert: 9,8 MB → 55 KB** (666×1000, JPEG q78). Original-Backup im Session-Scratchpad + in git-Historie. Logo wurde getrimmt (transparenter Rand entfernt: 4000×1218 → 2622×579), damit es bündig mit dem Avatar sitzt. |
| 2 | auto | Beat Gerber, Kohler Elektro Bern AG | ✅ | ⏳ Name/Firma bestätigen | eingebaut (normale Karte, `real:true`). **Zitat fürs Card gekürzt** (Original 4 Absätze), vollständiger Originalwortlaut als Kommentar direkt darüber in `testimonials.html`. Metrik-Block **entfernt** (war `CHF 2–3k` — steht bereits wörtlich im Zitat, doppelt gemoppelt). Foto `photo:"/beatgerber_kundenstimme.jpg"` (1240px, 137 KB, OK). Logo `referenz_kohler-elektro-bern_logo.png` (500×200, transparent) ✅ ergänzt (für einheitliche Logo+Name-Optik über alle Karten). Website-URL fehlt noch → Logo noch nicht klickbar. **⚠️ Freigabe Name/Firma/Logo vor Go-Live bestätigen.** `auto` erscheint nur auf der tm-Hauptseite (keine eigene Produkt-Unterseite). |
| 3 | web | Sandro Dubach, Sandro Dubach Fotografie | ⏳ Platzhalter | ⏳ zugesagt | Buchungstool in Website integriert. Card gebaut (`real:true`). Foto `referenz_sandro-dubach_bild.webp` (1000×1250, 98 KB) ✅, Logo `referenz_sandro-dubach_fotografie_logo.webp` ✅, Website `https://www.sandrodubach.ch/` ✅. **Nur noch Zitat offen** (`[Testimonialtext folgt]`). Erscheint auf TM-Haupt + Sichtbarkeit (web) + später Buchungstool-Unterseite (Modul 3, web-Case). |
| 4 | oco | Luca Vogel, Praxis Vogel GmbH | ⏳ Platzhalter | ⏳ zugesagt | **OneClickOffice** (neue Kategorie `oco`, Indigo-Blau). Card gebaut (`real:true`). Foto `referenz_luca-vogel_bild.jpg` (1,4 MB → 131 KB, 666×1000) ✅, Logo `referenz_praxis-vogel_logo.png` ✅ — **Original war weiss-auf-transparent (auf hellem Card unsichtbar) → automatisch in Schwarz umgewandelt** (PIL RGB-Invert, Alpha erhalten); weisses Original als Backup im Session-Scratchpad. Logo zeigt „Praxis Luca Vogel — Psychosoziale Beratung und Begleitung". Firmenname im Card = „Praxis Vogel GmbH" (vom User bestätigt). ✅ **Zitat gesetzt** — aus Lucas Frage-Antwort-Katalog verdichtet (Entwurf, vor Go-Live von Luca final freigeben). Zeitersparnis steht in den **Vorher/Heute-Boxen** („1 bis 1.5 Tage Adminaufwand" → „2 Stunden", ohne Kommas, Punkt-Dezimal auf Userwunsch); separater Metrik-Block **entfernt** (wäre doppelt). Website fehlt. Falls offizielles farbiges/dunkles Logo kommt → einfach ersetzen. Erscheint auf TM-Haupt + OneClickOffice-Seite. |
| 5 | **auto** | André Scheidegger, Moodpix GmbH | ⏳ Platzhalter | ⏳ zugesagt | **B2B-Buchungslink = individuelle Entwicklung/Automation → `product:"auto"`** (nicht mehr eigene Kategorie). Fotograf gibt Kunden einen Link, hunderte/tausende Mitarbeitende buchen selbst Porträt-Slots. Card `real:true`. Foto `referenz_andre-scheidegger_bild.jpg` (Querformat → gesichtszentriert quadratisch zugeschnitten, 500×500, 34 KB) ✅. **Zitat noch Platzhalter**. **Logo folgt** → `logoPending:true` zeigt solange „Moodpix GmbH" als Text oben rechts. Website fehlt. Erscheint auf TM-Haupt (Automation-Kontext) + Modul 3 Fotograf-Case (auf TM). Damit hat `auto` 2 echte Stimmen (Beat + André). |
| … | | | | | |

> Beim Eintreffen einer Antwort: Rohtext in der HTML-`TESTIMONIALS`-Liste als neuen
> Eintrag mit `real:true` ergänzen, Tabelle oben aktualisieren.

**Go-Live-Schwelle (Vorschlag):** mind. **2 pro gezeigtem Produkt**, sonst wirkt die
Section dünn. Lieber Produkt-Section später schalten als mit nur einer Stimme.

---

## 5. Einbau in die React-Apps (wenn genug Material da ist)

Da die Apps separate Projekte sind, wurde als Datenquelle ein **geteiltes Paket**
gewählt (Entscheidung des Users). Schritte:

1. **Geteilte Daten anlegen** — z.B. `packages/testimonials/index.ts`
   (analog zu `packages/tokens`). Exportiert die `Testimonial[]`-Liste + den Typ.
   Prüfen, wie `packages/` im Monorepo eingebunden ist (Workspaces / tsconfig-Paths),
   und gleiches Muster nutzen.
2. **React-Komponente** `Testimonials.tsx` bauen — die Card-Logik aus der HTML
   1:1 nach JSX übertragen. Props: `product?: "web"|"auron"|"auto"` (weglassen = alle
   + Filter-Pills einblenden).
3. **CSS** aus der HTML in `apple-home.css` (TM) bzw. die App-CSS übernehmen
   (`.t-grid`, `.t-card`, `.t-ba`, `.t-metric`, `.t-foot`, `.t-filter` …). Tokens sind
   schon vorhanden — nur die produktspezifischen `--c-*`/`--g-*` ergänzen.
4. **Einsetzen:**
   - TM `Index.tsx`: neue `<section class="ap-sec alt">` z.B. zwischen „Manifest" und
     „Produkte" (oder vor „FAQ"). `<Testimonials />` ohne `product` → alle + Filter.
   - sichtbarkeit / auron `Index.tsx`: `<Testimonials product="web" />` bzw.
     `product="auron"`, sinnvoll vor dem Kontakt-/CTA-Block.
5. **Reveal/Animation** wie umliegende Sections (`.reveal` + Observer).
6. **Logos** unter `public/` der jeweiligen App ablegen, Pfade in den Daten setzen.
7. Alle `real:false`-Einträge entfernen. Mobile (<760px → 1 Spalte) testen.

---

## 5b. Modul 2 — Vorher → Nachher (nur Sichtbarkeit-Seite)

Eigenes Modul, **getrennt** von den Testimonials: ein interaktiver Slider, der zwei
Website-Screenshots („alt" vs. „neu") überblendet. Datei: **`vorher-nachher.html`**.

- **Wo:** nur die **Sichtbarkeit-Seite** (`apps/sichtbarkeit`), nicht auf der TM-Hauptseite
  und nicht bei Auron/Automatisierung (dort gibt es keine sinnvollen Vorher/Nachher-Bilder).
- **Warum getrennt von den Stimmen:** Screenshots in Testimonial-Karten machen diese
  wuchtig und inkonsistent (nur Web hätte Bilder). Als eigener Block ist der visuelle
  Beweis am stärksten.
- **Skin:** violetter Web-Akzent (`#8b5cf6`), Browser-Frame-Optik.
- **Konzept:** **3 Sektionen als Tabs** — Startseite / Angebote / Über uns. Pro Sektion
  ein 16:9-Vergleich (kein Scroll nötig). Trennlinie ziehen (Maus/Finger), Regler
  unten für Tastatur. Tab wechselt das Bildpaar, Slider-Position bleibt.
- **Echte Screenshots** liegen in `apps/sichtbarkeit/public/` (= finaler Ort), bereits
  **komprimiert** (2400 px Breite, JPEG q88, ~310-805 KB/Bild; gesamt ~2,7 MB):
  - `referenz_verkehrsschule_hero_{vorher,nachher}.jpg`
  - `referenz_verkehrsschule_angebote_{vorher,nachher}.jpg`
  - `referenz_verkehrsschule_ueberuns_{vorher,nachher}.jpg`
  - (Pfade im JS-Array `SECTIONS`.)
- ✅ **hero_nachher komprimiert:** 805 KB → **470 KB** (aus PNG-Original neu encodiert,
  1920×1080 / q78). Weiter runter wurde bewusst nicht gemacht (wäre matschig). Original
  `hero_nachher_q88_805k.jpg` als Backup im Session-Scratchpad. Die anderen 5 Bilder
  unverändert (300–470 KB, 2400 px).
- ✅ **4 UX-/Perf-Optimierungen in `vorher-nachher.html` umgesetzt:**
  1. **Auto-Sweep-Drag-Hinweis** — Trennlinie fährt beim ersten Sichtbarwerden einmal
     sanft hin & zurück (IntersectionObserver, einmalig, respektiert `prefers-reduced-motion`,
     bricht bei erster Interaktion ab). CSS-Klasse `.ba-anim` + JS `autoSweep()`.
  2. **Bilder vorladen** — alle 6 Screenshots werden im Hintergrund geladen → Tab-Wechsel
     ohne Flackern.
  3. **Dynamische Bildunterschrift** — `.ba-cap` (`#ba-cap`) wechselt pro Sektion
     (`cap`-Feld in `SECTIONS`), z.B. „Startseite: vom in die Jahre gekommenen Auftritt zu modern und klar".
  4. **Fact-Karten unter dem Slider** („Was der Relaunch bringt") — 6 Karten mit Icon +
     positivem Nutzen, **3×2-Raster** (`.facts`, Media-Queries für 2/1 Spalten):
     Moderner Auftritt & klarer Aufbau · Nutzerführung optimiert (conversion) · Individuelle
     Terminbuchung · SEO-Grundlagen eingebaut · Ladezeit optimiert · Mobile-first. Bewusst
     **ohne** negative „vorher"-Behauptungen (die alte Seite war nicht unbrauchbar).
  5. **Kundenstimme Mehmet** (`.ba-quote`) als Sektions-Abschluss unter den Facts — er ist der
     Inhaber genau dieser Seite. Zentriertes Zitat (Highlight „viel professioneller und moderner")
     + Foto + Name/Rolle + klickbares Verkehrsschul-Logo. **Assets nach `apps/sichtbarkeit/public`
     kopiert:** `referenz_mehmet_bild.jpeg` (55 KB) + `referenz_verkehrsschule-mittelland_logo.png`
     (liegen jetzt in tm/public UND sichtbarkeit/public — Mehmet erscheint als `web`-Stimme ohnehin
     auch auf der Sichtbarkeit-Seite).
  6. **CTA-Band mit echtem Terminbuchungs-Widget** (`.ba-cta`) als Abschluss — CTA-Muster von der
     `/demo`-Seite übernommen (gleiches `booking-embed.js`, `data-no-fab`, Button
     `.cta-btn[data-book-widget]` öffnet das Overlay), aber **eigene WEBSEITE-Widget-ID
     `333c239f-7b64-433b-9f5e-d6526c46891a`** (nicht das Buchungstool-Widget `794c5466-…` von /demo).
     **Botschaft bewusst auf WEBSEITE gedreht** (nicht Buchungstool): „Auch so ein Auftritt … wir
     bauen Ihre Website modern, schnell und auf Anfragen ausgelegt". `data-no-fab` behalten (nur
     Button-Trigger, kein schwebender FAB). Script lädt extern von `timetracking.trendingmedia.ch`.
- **⚠️ Original-PNGs** (3840×2160, ~18 MB gesamt) liegen noch im Ordner als
  Re-Komprimierungs-Quelle. **Vor Build/Commit entfernen** — sie dürfen nicht ins Repo:
  `rm apps/sichtbarkeit/public/referenz_verkehrsschule_*.png`
- **Vorschau:** Symlink `apps/sichtbarkeit/public/_vorher-nachher-preview.html` →
  Server-Root `apps/sichtbarkeit/public` (Port 8778):
  `http://127.0.0.1:8778/_vorher-nachher-preview.html`.
  Vor Build/Commit entfernen: `rm apps/sichtbarkeit/public/_vorher-nachher-preview.html`.
- **Einbau:** als React-Komponente `BeforeAfter.tsx` in `apps/sichtbarkeit` (Tabs +
  Slider-Logik + CSS aus der HTML übernehmen), sinnvoll oberhalb der Testimonials.

---

## 5c. Modul 3 — Buchungstool: Pingpong → ein Link

Prozess-Story (kein Bild-Slider, da das „Vorher" ein Kommunikations-Chaos ist, kein
Screenshot). Datei: **`buchungstool.html`**.

- **Aufbau:** Split-Card. Links „Vorher" = animiertes E-Mail/Telefon-Pingpong (Chat-
  Blasen, gestaffelt eingeblendet) + Schmerz-Metrik. Rechts „Nachher" = 3 Schritte +
  Screenshot der **Buchungsansicht** (Kalender, NICHT Dashboard) + Erfolgs-Metrik.
- **Zwei Cases (Tabs)** — bewusst auf verschiedene Seiten verteilt:
  - `web` (Buchungstool in Webseite integriert) → **Sichtbarkeit-Seite**
  - `fotograf` (ein Link, hunderte Mitarbeitende buchen selbst) → **TM-Hauptseite** (Automation)
  - Texte/Metriken pro Case im JS-Objekt `CASES`.
- **Tool-Screenshot:** `CASES`-Eintrag mit `tool:"/..."` → echtes Bild, sonst
  Platzhalter-SVG (Kalender). Zeigt die **Buchungs-/Slot-Ansicht** (Self-Service-Moment;
  Dashboard wäre zu abstrakt). Ablegen je nach Case: web → `apps/sichtbarkeit/public`,
  fotograf → `apps/tm/public`.
  - **web:** ✅ **echter Screenshot aktiv.** Aus `buchungstool_vorschau.png` (3840×2160) das
    weisse Buchungs-Overlay sauber zugeschnitten (grauer Test-Rahmen weg) → `referenz_buchung_web.png`
    (900×966, 59 KB) in `apps/sichtbarkeit/public`. Im Web-Case `tool:"/referenz_buchung_web.png"`.
    Hochformat-Screenshots werden über `.bk-tool.shot img` (max-height 440px, zentriert) kompakt
    gehalten. Alte `buchungstool_web.jpg` + Original-PNG können vor Go-Live raus.
  - **Modul 3 bleibt bewusst generisch** (Adressen `ihre-webseite.ch` / `buchung.fotograf.ch/…`,
    keine Kundennamen) — es zeigt die Fähigkeit für *jeden* Kunden; die namentliche Zuordnung
    (Sandro/Moodpix) läuft ausschliesslich über die Testimonials (Modul 1).
  - **fotograf:** ✅ **2 echte B2B-Screenshots als Slider.** `referenz_buchung_b2b_1.jpg`
    (Zeitplan-Übersicht) + `referenz_buchung_b2b_2.jpg` („Slot wählen" mit echten Verfügbarkeiten,
    vergebene Slots durchgestrichen — ersetzte die schwächere „Wann passt's dir?"-Ansicht, Backup
    im Scratchpad), je 1400px/q90 in `apps/tm/public`.
  - **Vorschau-Hinweis:** Modul 3 hat beide Cases in *einem* File, aber die Bilder liegen live in
    *verschiedenen* App-Ordnern (Web-Overlay → sichtbarkeit/public, B2B → tm/public). Damit die
    Werkstatt-Vorschau auf **beiden** Ports (8777/8778) vollständig läuft, sind alle drei Bilder
    **in beide** Public-Ordner kopiert. Live wird pro Seite nur der jeweilige Case gebaut → dort
    reicht der eigene Ordner; die Kopie im anderen kann vor Go-Live weg. Im Case `tools:[...]` → `load()` baut einen Crossfade-Slider
    (`.bk-slider`, `initSlider()`: Auto-Advance 3,8s, Dots, Hover-Pause, reduced-motion-safe;
    dunkler Frame-Hintergrund `#0b0b0c`, `object-fit:contain`). ⚠️ Screenshot 1 enthält im
    Hinweis-Feld „André Scheidegger · Moodpix" — für komplett namenlose Variante neu aufnehmen.
- **Vorschau:** Symlinks in beiden public-Ordnern (`_buchungstool-preview.html`):
  - web-Case: `http://127.0.0.1:8778/_buchungstool-preview.html`
  - fotograf-Case: `http://127.0.0.1:8777/_buchungstool-preview.html`
- **Fact-Karten pro Case** ✅ (wie Modul 2, wechseln beim Tab-Wechsel): je 4 Karten mit Icon +
  kurzer Beschreibung. Web (5): „Rund um die Uhr buchbar / Kein Termin-Pingpong / In die Website
  integriert / Automatische Bestätigung / Direkte Kalenderintegration (nur tatsächlich freie Termine)". Fotograf: „Ein Link für alle / Self-Service / Keine
  Excel-Listen / Echtzeit-Verfügbarkeit". Daten in `CASES[].facts` + `factsHead`, gerendert in
  `load()`, Icons in `ICONS`-Map (`svgIcon()`). CSS `.bk-facts` (4→2→1 Spalten).
- **Einbau:** der `web`-Case als Komponente in `apps/sichtbarkeit`, der `fotograf`-Case
  in `apps/tm` (Index). Pro Seite nur der jeweilige Case (kein Tab-UI live nötig).

---

## 5d. Modul 4 — Live-Demo-Unterseite (nur Sichtbarkeit)

Eigene Unterseite (`/demo` o.ä.), auf der das **laufende Buchungstool live eingebettet**
wird — der Besucher klickt sich durchs echte Tool. Datei: **`demo-seite.html`**.
Strategie = „Stufe 2": echtes Produkt zeigen, kein Nachbau.

- **Aufbau:** Intro + Demo-Daten-Hinweis · Perspektiven-Toggle (Kunde/Admin) · großer
  Browser-Frame mit dem Tool · 4 Feature-Cards · CTA-Band.
- **Admin-Ansicht = echtes Tool, live eingebettet** ✅ Das Tool-Repo
  (`github.com/nicolasieber-tm/buchungstoolvorschau`) liegt als statische Vorschau in
  `apps/sichtbarkeit/public/buchungstool-demo/` (index.html + server.js + package.json,
  ohne .git). Eingebettet via `<iframe src="/buchungstool-demo/index.html">` →
  **same-origin, kein X-Frame-/CSP-Problem**, lazy geladen beim Umschalten auf „Admin".
- **Kunden-Ansicht = funktionierender Demo-Nachbau** ✅ Datei
  `apps/sichtbarkeit/public/buchungstool-demo/kunde.html`, eingebettet via iframe.
  5-Schritt-Flow (Angebot → Datum → Zeit → Kontakt → Bestätigung), klickbar, nichts wird
  gespeichert. Look angelehnt an das echte Overlay (beiger Rahmen `#E4CFCC`, roter Akzent
  `#F23636`, Fortschrittsbalken).
  - Das **echte** Frontend liegt unter `…railway.app/book` (Next.js, Titel „Termin buchen ·
    Sandro Dubach Fotografie"), als iframe-Widget gebaut, **kein** X-Frame-/CSP-Block →
    grundsätzlich einbettbar. **Aber:** lieferte beim Test **HTTP 500** (Beta-Instanz
    instabil). Daher Nachbau als stabile, neutrale Demo. Bei Bedarf später auf echtes
    `/book` umstellen (sobald stabil) — Pfad in `VIEWS.kunde.iframe`.
- **Feature-Cards:** 5 Stück (Angebote individuell anpassbar · Echtzeit-Slots ·
  Drag-&-Drop-Umplanung · Auto-Bestätigung · Kalender-Sync), Grid auf `auto-fit`.
- **Cross-iframe-Demo-Buchung** ✅ Eine im Kunden-Frontend abgeschlossene Buchung wird in
  `sessionStorage` (`btdemo_termine`) abgelegt. Da beide iframes dieselbe Origin im selben
  Tab haben, teilen sie die `sessionStorage`-Area; das Admin-Tool liest sie beim Laden in
  `BOOKINGS` ein → der Termin erscheint unter „Termine" (Status „neu"), im Dashboard und
  der „Termine"-Tab-Badge zählt hoch. Greift, weil `demo-seite.html` das iframe beim
  Tab-Wechsel neu lädt.
- **Lebensdauer (Option B):** `sessionStorage` → Buchungen bleiben während der Sitzung
  (auch bei Reload im selben Tab), verschwinden beim **Schließen des Tabs/Browsers**.
  Jeder Besucher sieht nur seine eigenen (lokal im Browser, nichts serverseitig); andere
  Besucher sind nicht betroffen. Die 3 fixen Beispiel-Termine sieht jeder (im Code).
- **Angebote/Preise live (Admin → Frontend)** ✅ Im Admin-Tab „Angebote & Preise" ein
  Angebot bearbeiten → „Speichern" schreibt `OFFERS` in `sessionStorage` (`btdemo_offers`).
  Das Kunden-Frontend baut seine Auswahl beim Laden daraus (sonst Defaults). Preis-Format
  gemappt: 0 → „kostenlos", „pro Stunde" → „CHF x/Std.", sonst „CHF x"; inaktive Angebote
  werden im Frontend ausgeblendet. Default-Preise in beiden Dateien angeglichen
  (a1 kostenlos · a2 CHF 150 · a3 CHF 160/Std. · a4 CHF 900). Speichern löst keinen
  Demo-Alert mehr aus.
- **„Ort"-Spalte** in der Termine-Tabelle entfernt (war Fotografen-spezifisch); im
  Detail-Modal steht „Ort" noch (bewusst belassen).
- **Slot-Belegung** ✅ Jede Buchung speichert `iso` (Datum). Im Buchungs-Frontend werden
  bereits belegte Uhrzeiten für genau diesen Tag gesperrt (statische Demo-Belegung +
  eigene, nicht abgesagte Buchungen). Sonntage gesperrt (Planer zeigt nur Mo–Sa).
- **Planer-Integration** ✅ Demo-Buchungen erscheinen als **read-only** Blöcke in der
  jeweiligen Woche (`demoEventsForWeek`, an `eventsForWeek` angehängt; Drag-Guard
  `if(e.demo)`). Beim Laden springt der Planer zur Woche der neuesten Buchung. Status
  „abgesagt" entfernt sie aus dem Planer. Konsistent über Tab-Wechsel (sessionStorage).
- **Admin-Tool-Anpassungen:** Akzent rot `#F23636` (wie Kunden-Frontend). Status „neu"
  von Orange (`--amber`) auf Blau `#2f6df0` umgestellt (kollidiert nicht mit rot=abgesagt).
  Im Buchungs-Detail-Modal **setzen** „Bestätigen"/„Absagen" den Status (→ „bestätigt"/
  „abgesagt"), aktualisieren Liste, Dashboard und „Termine"-Badge und schließen das
  Fenster — kein Alert. Status-Änderung an Demo-Buchungen (`src:'demo'`) wird in
  `sessionStorage` zurückgeschrieben, bleibt also über Tab-Wechsel konsistent.
- **Weitere Demo-Alerts** (Kalender verbinden, Verfügbarkeit/Angebot speichern, Zeit
  blockieren) sind noch drin, klar mit „Demo:" markiert — bei Bedarf ebenfalls entfernbar.
- **Vorschau:** `http://127.0.0.1:8778/_demo-preview.html`
- **Frame-Höhe:** Kundenansicht 16:10; Admin-Ansicht (`.is-live`) bekommt mehr Höhe
  (`clamp(600px,82vh,880px)`), damit das Backend nicht gequetscht wirkt.
- **Technische Voraussetzungen — Status:**
  1. **iframe erlaubt?** ✅ gelöst durch lokale, statische Einbettung (same-origin).
  2. **Demo-Daten/Reset:** ✅ unkritisch — die Vorschau speichert nichts, Buttons zeigen
     nur Demo-Meldungen (laut README).
  3. **Keine echten E-Mails:** ✅ unkritisch (reine Vorschau, keine echte Anbindung).
  4. **Kein Login:** ✅ Vorschau öffnet direkt.
- **Einbau:** neue Route/Seite in `apps/sichtbarkeit`; von der LP aus als sekundärer CTA
  („Live-Demo ausprobieren →") verlinken, damit die Haupt-LP fokussiert bleibt.

---

## 6. Nächste Schritte (Checkliste)

- [ ] Echte Zitate sammeln (Tabelle §4 füllen) + Freigaben einholen
- [ ] Pro Kunde Logo/Foto besorgen (optional, erhöht Glaubwürdigkeit stark)
- [ ] Echte Einträge in `testimonials.html` ergänzen, Demos rauswerfen
- [ ] Go-Live-Schwelle erreicht? (≥2 pro gezeigtem Produkt)
- [ ] `packages/testimonials` anlegen → `Testimonials.tsx` → in die 3 Seiten einsetzen
- [x] **Modul 2:** echte Screenshots (3 Sektionen, vorher/nachher) in
      `apps/sichtbarkeit/public/` → in `vorher-nachher.html` eingebunden
- [x] **Modul 2:** Screenshots komprimiert (1600 px, JPEG, 18 MB → 1,3 MB)
- [ ] **Modul 2:** als `BeforeAfter.tsx` in `apps/sichtbarkeit` einbauen
- [ ] **Modul 3:** echte Buchungsansicht-Screenshots besorgen (web → sichtbarkeit,
      fotograf → tm) → in `CASES` einsetzen → als Komponenten einbauen
- [x] **Modul 4:** Admin-Tool lokal eingebettet (same-origin iframe, läuft in Vorschau)
- [x] **Modul 4:** Kunden-Buchungs-Frontend als Demo nachgebaut (`kunde.html`, 5 Schritte)
- [ ] **Modul 4:** optional auf echtes `/book` umstellen, sobald Railway-Instanz stabil
      (liefert aktuell 500) → `/demo`-Seite in `apps/sichtbarkeit` bauen, CTA auf der LP
- [ ] **Modul 4:** prüfen, ob `server.js`/`package.json` in `buchungstool-demo/` nötig
      sind (für statische Einbettung reicht `index.html`)
- [ ] Mobile + reduced-motion prüfen, dann committen
- [ ] Vorschau-Symlinks entfernen: `apps/tm/public/_*-preview.html` und
      `apps/sichtbarkeit/public/_*-preview.html`
