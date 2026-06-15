# Designsprache — „Apple-like" (Trending Media)

Diese Datei beschreibt die Designsprache der TM-Seiten, damit **neue Seiten ohne
Raten direkt passen**. Referenz-Implementierung: `src/pages/apple-home.css`
(Homepage) plus die abgeleiteten `legal.css` und `webseiten.css`.

> Faustregel: Eine neue Seite **erbt** das System, sie erfindet es nicht neu.
> Du schreibst HTML mit den vorhandenen Klassen und überschreibst höchstens ein
> paar **Skin-Variablen** für den Akzent.

---

## 1. Grundprinzipien

- **Ruhig, hell, viel Weissraum.** Heller Hintergrund (`#fdfbf8`), feine Borders
  (`rgba(0,0,0,.07)`), weiche statt harte Schatten. Nichts schreit.
- **Inhalt zentriert, schmale Spalten.** Lesbarkeit vor Breite
  (`max-width: ~1040px`, Fliesstext oft `30–62ch`).
- **Akzent sparsam, als Gradient.** Farbe kommt fast nur über `--grad` (Text-Clip
  auf Kicks/Zahlen/Icons) und einen einzelnen `--accent`. Flächen bleiben neutral.
- **Bewegung dezent.** Sanftes „reveal" beim Scrollen, Hover hebt Cards minimal an.
  Alles respektiert `prefers-reduced-motion`.
- **Rund.** Grosse Radien (Cards `22–24px`, Buttons/Pills `980px` = voll rund).
- **System-Font.** `Inter`, mit negativem Letter-Spacing (`-.01em` bis `-.035em`)
  für den „Apple"-Look. Headlines fett (700), eng, gross via `clamp()`.

---

## 2. Architektur: Wrapper + Skin

Das ganze System ist unter **einem Wrapper `.ap`** gescoped, damit es nicht mit
globalem CSS / shadcn-Tokens kollidiert. Die Farbgebung steckt komplett in
CSS-Custom-Properties, die ein **Skin** setzt:

```html
<div class="ap ap-vivid">     <!-- Homepage: Orange→Blau Tri-Color -->
<div class="ap ap-vivid ap-web"><!-- Webseiten: zusätzlich Purple-Akzent -->
```

| Skin | Klasse | Akzent | Einsatz |
|------|--------|--------|---------|
| Vivid (Standard) | `.ap-vivid` | `#2b9fd6` Blau, Gradient Orange→Violett→Blau | Homepage, Legal |
| Web (Produkt) | `.ap-vivid.ap-web` | `#8b5cf6` Violett | Landingpage „Webseiten" |

**Eine neue Variante/Seite re-skinnt nur Variablen** (siehe `webseiten.css`):

```css
.ap-newpage {
  --accent: #8b5cf6; --accent-fg: #fff;
  --grad: linear-gradient(105deg,#b18bff,#8b5cf6 36%,#7b3fe4 62%,#5b8def 100%);
  --illoBg: linear-gradient(150deg,#f1ecff,#efe7ff 55%,#e9f0fd);
  --illoColor: #8b5cf6; --icBg: rgba(139,92,246,.12);
  --prodHero: linear-gradient(135deg,#9d6bff,#7b3fe4);
}
```

Wichtig: page-spezifisches CSS **nach** `apple-home.css` importieren, damit die
Variablen-Overrides bei gleicher Spezifität gewinnen.

---

## 3. Design-Tokens (Vivid-Skin)

```
/* Flächen & Text */
--bg:        #fdfbf8     Seitenhintergrund (warm-weiss)
--bg-alt:    #fff        alternierende Sektion
--fg:        #1b1a1e     Text primär
--muted:     rgba(27,26,30,.6)   Fliesstext / sekundär
--muted2:    rgba(27,26,30,.45)  Labels / tertiär
--border:    rgba(0,0,0,.07)     Linien, Card-Rahmen

/* Akzent */
--accent:    #2b9fd6     einzelne Akzentfarbe (Buttons-Fläche, Bullets, Links)
--accent-fg: #fff        Text auf Akzentfläche
--grad:      linear-gradient(105deg,#ff9a3c,#ff6a2c 24%,#8b5cf6 58%,#2f9fd6 88%,#6cc6f5)

/* Cards & Tiefe */
--card:      #fff
--cardAlt:   #fdfbf8     Card auf .alt-Sektion
--shadow:    0 1px 2px rgba(60,40,20,.05), 0 20px 44px -24px rgba(120,80,40,.2)
--shadowH:   0 30px 64px -28px rgba(120,80,40,.32)   (Hover)
--radius:    Cards 22–24px · Pills/Buttons 980px

/* Dekor */
--illoBg, --illoColor, --chipBg, --chipFg, --icBg
--prodHero, --prodHeroFg, --prodHeroTag   (Produkt-Hero-Kachel)
--footBg:    #f6efe8
```

Globale shadcn/Tailwind-Tokens (`--primary`, `--background` …) liegen in
`packages/tokens/index.css` und gelten **ausserhalb** von `.ap`. Nicht mischen.

---

## 4. Typografie

| Element | Klasse | Grösse | Gewicht | Tracking |
|---------|--------|--------|---------|----------|
| Hero-H1 | `.ap-hero h1` | `clamp(2.8rem,7.5vw,5.6rem)` | 700 | `-.035em` |
| Section-H2 | `.ap-shead h2` | `clamp(2rem,4.6vw,3.4rem)` | 700 | `-.03em` |
| Card-H3 | `.ap-card h3` | `1.35rem` | 600 | `-.02em` |
| Kicker/Label | `.kick`, `.tag`, `.ck` | `.8–1.1rem` | 600 | — (Gradient-Text) |
| Fliesstext | `.sub`, `p` | `.92–1.2rem`, `line-height 1.5–1.7` | 400 | — |

- **Headlines** immer eng + fett + `clamp()` für fluide Skalierung.
- **Kicker** (Mini-Label über Headlines) bekommen Gradient-Text (siehe §6).
- Zeilenlängen begrenzen: Hero-Sub `~30ch`, Lead `~46–62ch`.

---

## 5. Layout-Bausteine

```html
<!-- Container -->
<div class="wrap">  <!-- max 1040px, padding 0 24px -->
<div class="wide">  <!-- max 1120px (Footer) -->

<!-- Sektion (100px vertikal, scroll-margin für Anker-Nav) -->
<section class="ap-sec" id="leistungen"> … </section>
<section class="ap-sec alt"> … </section>   <!-- alternierender bg -->

<!-- Section-Head -->
<div class="ap-shead">
  <div class="kick">Leistungen</div>
  <h2>Headline</h2>
  <p class="intro">Optionaler Einleitungssatz.</p>
</div>

<!-- Grids -->
<div class="ap-grid c2">…</div>   <!-- 2 Spalten → 1 unter 640px -->
<div class="ap-grid c4">…</div>   <!-- 4 → 2 (900px) → 1 (640px) -->
```

Breakpoints im System: **900px**, **880px**, **820px**, **720px**, **640px**.
Mobile-First ist es nicht — Desktop-Layout + gezielte `max-width`-Overrides.

---

## 6. Wiederkehrende Patterns (Copy-Paste-fähig)

### Gradient-Text (Kicker, Zahlen, Icons)
```css
background: var(--grad);
-webkit-background-clip: text; background-clip: text;
-webkit-text-fill-color: transparent; color: transparent;
```

### Gradient-Border (Pill, Outline-Button, „popular" Card)
Trick: 1.5–2px Padding-Box mit Gradient + Mask-Composite-XOR.
```css
position: relative;
/* … */
&::before {
  content:""; position:absolute; inset:0; border-radius:inherit; padding:1.5px;
  background: var(--grad);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude; pointer-events:none;
}
```

### Card mit Hover-Lift
```css
.ap-card { background:var(--card); border:1px solid var(--border);
  border-radius:22px; padding:30px; box-shadow:var(--shadow);
  transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s; }
.ap-card:hover { transform: translateY(-4px); box-shadow: var(--shadowH); }
```

### Reveal beim Scrollen
HTML-Element bekommt `class="reveal"`; ein IntersectionObserver setzt `.in`.
```css
.ap .reveal { opacity:0; transform:translateY(24px);
  transition: opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1); }
.ap .reveal.in { opacity:1; transform:none; }
```
Easing-Standard im ganzen System: **`cubic-bezier(.22,1,.36,1)`**.

### Hero-Glow
Diffuse radiale Gradients hinter dem Hero (`::before`, `filter: blur(36px)`),
plus weicher Verlauf nach unten (`::after`) in `--bg-alt`. Skin-spezifisch.

### Buttons / CTA
- **Primär (Fläche):** `background: var(--accent)`, `color: var(--accent-fg)`,
  `border-radius: 980px`, Hover `filter: brightness(1.08)`.
- **Vivid-Primär (Outline):** transparent + Gradient-Border + leichter Schatten,
  Hover `translateY(-1px)` (siehe `.ap-vivid .ap-hero .acts a.p`).
- **Sekundär:** reiner Text-Link in `--accent`, Hover unterstrichen.

---

## 7. Feste Seitenrahmen (Nav & Footer)

Jede Seite trägt **dieselbe Pill-Navigation** und **denselben Footer**. Bei
React-Seiten ist beides in `LegalPageLayout.tsx` gekapselt — für Content-Seiten
einfach diese Komponente verwenden:

```tsx
<LegalPageLayout title="Impressum" intro="…">
  <LegalSection title="…"> … </LegalSection>
</LegalPageLayout>
```

- **Nav:** fixe, zentrierte Pill (`.ap-nav` / `.ap-pill`), Glas-Effekt
  (`backdrop-blur(22px)`), Gradient-Border, `scrolled`-State ab `scrollY > 8`.
  Unter **820px** Links/CTA aus → Burger (`.ap-burger`) + `.ap-mobile`-Panel.
- **Footer:** `.ap-foot`, 4-Spalten-Grid → 2 Spalten unter 720px, Copy-Zeile mit
  `·`-Separatoren, Links zu Impressum/Datenschutz.
- Body-Klasse `ap-light` setzen (heller Seitenhintergrund) solange die Seite lebt.

---

## 8. Content-/Legal-Seiten

Für reine Textseiten (Impressum, Datenschutz, AGB …) gibt es `legal.css`:

- `.ap-legal-wrap` (Top-Padding für die fixe Nav: 132px / mobil 104px)
- `.ap-legal` (max 760px, zentriert) mit `← Zurück`-Link (`.back`)
- `.ap-legal-body section` mit `border-top` als Trenner, H2 `1.45rem`/600
- Listen ohne Bullets → eigener Punkt in `--accent`
- Links unterstrichen in `--accent`, `text-underline-offset: 3px`

Neue Textseite = `LegalPageLayout` + `LegalSection` füllen. Fertig.

---

## 9. Mobile & Performance (nicht vergessen)

`packages/tokens/index.css` schaltet auf kleinen Screens bewusst Effekte ab:

- **`backdrop-filter` aus** unter 767px (Glas → solides `bg/.95`), spart GPU.
- **Blur-Radien reduziert** (`blur-3xl` etc.) — teure Filter kosten auf Mobile.
- **`scroll-behavior: auto`** unter 767px (kein smooth-scroll-Ruckeln).
- Auf Desktop sorgt **Lenis** für smooth scrolling.

---

## 10. Accessibility

- **`prefers-reduced-motion`** wird global respektiert: Reveal-/Fade-/Transition-
  Dauer → quasi 0, Reveal-Elemente sofort sichtbar. Bei neuen Animationen immer
  mitdenken.
- Akzent-Blau/Violett auf Weiss als Linkfarbe — bei kleinem/dünnem Text auf
  ausreichenden Kontrast achten (Fliesstext bleibt `--fg`, nicht `--accent`).
- Buttons/Burger mit `aria-label`, echte `<button>`/`<a>` statt Divs.

---

## 11. Checkliste „neue Seite"

1. Wrapper `<div class="ap ap-vivid">` (+ ggf. eigener Skin-Modifier).
2. Pill-Nav + Footer übernehmen (React: `LegalPageLayout`; statisch: aus
   bestehender Seite kopieren).
3. Inhalt in `.ap-sec` > `.wrap`, je Sektion `.ap-shead` + Grid/Cards.
4. Akzentfarbe nur über `--accent` / `--grad`; Flächen neutral lassen.
5. Headlines `clamp()` + eng + 700, Fliesstext `--muted`, Zeilen begrenzen.
6. Interaktive Elemente: Reveal-Klasse, Hover-Lift, `cubic-bezier(.22,1,.36,1)`.
7. Mobile testen: < 820px Nav-Burger, < 767px keine Blur-Lags.
8. `prefers-reduced-motion` nicht brechen.
