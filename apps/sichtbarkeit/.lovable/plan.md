
# Landingpage: Moderne Webauftritte für KMU

Eine conversion-starke, minimalistische Landingpage auf Deutsch (DACH/Schweiz) mit Fokus auf Nutzen statt Technik. Ziel: Besucher fordern eine kostenlose Website-Analyse an.

## Design-System
- **Stil:** Clean, viel Weissraum, mobile-first, seriös
- **Farben:** Helles, neutrales Off-White als Basis (`#FAFAF7`), tiefes Anthrazit für Text (`#0F1115`), ein dezenter Akzent in gedämpftem Blau-Grün/Petrol für CTAs und Highlights — vermittelt Vertrauen ohne aufdringlich zu sein
- **Typografie:** Inter (Body) + grosszügige, enge Headlines mit klarer Hierarchie
- **Komponenten:** Abgerundete Cards (rounded-2xl), subtile Borders statt harter Schatten, dezente Lucide-Icons, generöse Section-Paddings
- **Mockups:** Stilisierte Browser-/Mobile-Frames per CSS/SVG (keine generischen Stock-Fotos)

## Sections (in Reihenfolge)

**1. Sticky Navigation**
Logo links, Anker-Links (Leistungen, Ablauf, FAQ, Kontakt), CTA-Button „Kostenlose Analyse"

**2. Hero**
- Headline: *„Ihre Website ist der erste Eindruck. Machen Sie ihn unvergesslich."*
- Subheadline: *„Veraltete oder fehlende Webauftritte kosten Sie täglich Sichtbarkeit, Vertrauen und Anfragen. Wir verwandeln Ihren Online-Auftritt in einen echten Verkaufskanal."*
- Primärer CTA: „Kostenlose Analyse sichern"
- Sekundärer CTA: „So funktioniert's"
- Visual: Stilisiertes Browser-Mockup einer modernen Business-Website (rechts/unten)
- Trust-Zeile darunter: „Für KMU, lokale Dienstleister und kleine Unternehmen im DACH-Raum"

**3. Problem-Section**
Überschrift: *„Wenn Ihre Website nicht mehr überzeugt, entscheiden Kunden in Sekunden — gegen Sie."*
4 Pain-Point-Karten mit dezenten Icons:
- Veralteter Look schreckt Neukunden ab
- Auf dem Smartphone kaum nutzbar
- Bei Google praktisch unsichtbar
- Keine klaren Wege zur Kontaktaufnahme

**4. Lösung**
Überschrift: *„Modern auftreten. Besser gefunden werden. Mehr Anfragen erhalten."*
Zweispaltiges Layout: links erklärender Text, rechts Vorher/Nachher-Visualisierung (zwei stilisierte Mockups nebeneinander, „Vorher" verblasst).

**5. Nutzen / Benefit-Karten** (6 Karten, 3×2 Grid)
- Überzeugender erster Eindruck
- Stark auf allen Geräten
- Bei Google leichter gefunden
- Mehr qualifizierte Anfragen
- Klarer, moderner Markenauftritt
- Schnelle Ladezeiten, die halten

**6. Für wen geeignet**
Überschrift: *„Gemacht für Unternehmen, die online endlich richtig wirken wollen."*
Check-Liste mit 6 Zielgruppen (KMU, lokale Dienstleister, Handwerk & Gewerbe, Praxen & Kanzleien, Betriebe mit alter Website, Unternehmen ganz ohne Website).

**7. Trust-Section (Platzhalter)**
Dezente Logo-Reihe („Hier könnten Ihre Kunden stehen") + 2–3 neutrale Testimonial-Karten mit Platzhalter-Inhalten, klar als Beispiel gekennzeichnet — austauschbar.

**8. Ablauf / 3-Schritte-Prozess**
Horizontale Stepper-Darstellung mit nummerierten Kreisen:
1. **Kostenlose Analyse** — Wir prüfen Ihren aktuellen Auftritt ehrlich und konkret
2. **Klares Konzept** — Sie erhalten verständliche Empfehlungen, keine Fachsprache
3. **Moderner Auftritt** — Wir setzen um, was Vertrauen und Anfragen bringt

**9. CTA-Section (mid-page)**
Volle Breite, akzentuierter Hintergrund.
*„In 10 Minuten wissen Sie, wo Ihre Website Anfragen verliert."*
Button: „Kostenlose Einschätzung anfragen" + Hinweis: „Unverbindlich · Ohne Verkaufsgespräch · Innerhalb von 48 Stunden"

**10. Kontaktformular**
Zweispaltig: links kurze Ansprache („Schreiben Sie uns — wir melden uns innerhalb eines Werktags"), rechts kompaktes Formular:
- Name *
- Firma *
- E-Mail *
- Website (optional)
- Kurze Nachricht
- Button: „Analyse anfordern"
Toast-Bestätigung nach Absenden (clientseitig, kein Backend in V1).

**11. FAQ**
Accordion mit 5 Fragen:
- Für wen ist das Angebot geeignet?
- Was, wenn wir noch gar keine Website haben?
- Unsere Website ist nur veraltet — lohnt sich das trotzdem?
- Wie läuft eine kostenlose Einschätzung ab?
- Ist die Analyse wirklich unverbindlich?

**12. Footer**
Schlicht: Logo, kurze Positionierung, Anker-Navigation, Impressum/Datenschutz-Platzhalter, Copyright.

## Technische Umsetzung
- React + Tailwind, Komponenten-Aufbau pro Section unter `src/components/landing/`
- `Index.tsx` als Composition aller Sections
- Lucide-React-Icons, shadcn Accordion, Button, Input, Textarea, Card
- Smooth-Scroll zu Anker-Links
- Vollständig responsive (mobile-first), saubere semantische HTML-Struktur für SEO
- Meta-Tags (Title, Description, OG) in `index.html` auf das Angebot zugeschnitten
- Keine echten Backend-Calls — Formular zeigt Erfolgs-Toast (Hinweis im Code für späteren Anschluss an Lovable Cloud / E-Mail-Service)
