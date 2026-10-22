/* Texte der TM-Hauptseite (aus der früheren Startseite übernommen), geteilt von
   /automationen und /ueber-uns. */

export const SERVICES = [
  { illo: "workflow", tag: "Operations", title: "Prozesse digitalisieren", desc: "Wir machen sichtbar, wo in Ihrem Alltag Aufwand entsteht. Zettel, Excel-Listen und Medienbrüche ersetzen wir durch saubere digitale Abläufe.", chips: ["Prozess-Audit", "Integration", "Change Management"] },
  { illo: "brain", tag: "Intelligence", title: "KI & Automatisierung mit Substanz", desc: "Wir integrieren KI dort, wo sie konkret Mehrwert schafft: vom internen Assistenten bis zur automatisierten Verarbeitung wiederkehrender Aufgaben.", chips: ["KI-Assistent", "RAG", "Agents"] },
  { illo: "code", tag: "Engineering", title: "Massgeschneiderte Software", desc: "Wenn Standard-Software nicht passt, bauen wir genau das Werkzeug, das in Ihrem Betrieb fehlt, stabil, wartbar und zum Mitwachsen gemacht.", chips: ["Web-Apps", "Datenbanken", "APIs"] },
];
export const PROCESS = [
  { t: "Zuhören", d: "Wir sprechen mit Geschäftsführung, Mitarbeitenden und wo es Sinn macht auch mit Ihren Kunden. Ziel: ein ehrliches Bild davon, wo im Alltag wirklich Aufwand entsteht." },
  { t: "Analysieren", d: "Wir identifizieren Medienbrüche, manuelle Doppelarbeit und Reibungsverluste. Statt Buzzwords liefern wir eine konkrete Liste der grössten Hebel." },
  { t: "Entwickeln", d: "Wir entscheiden gemeinsam, was Standard-Software löst, was eigene Software braucht und wo KI tatsächlich Mehrwert schafft, nicht weil es im Trend liegt." },
  { t: "Umsetzen", d: "Wir bauen, integrieren und rollen aus. Danach bleiben wir Ansprechpartner, damit aus dem Projekt ein dauerhaft funktionierender Prozess wird." },
];
export const REASONS = [
  { t: "KI dort, wo sie wirklich wirkt", d: "Wir setzen KI nicht als Buzzword ein, sondern dort, wo sie messbar Zeit spart oder bessere Entscheidungen ermöglicht." },
  { t: "Strategie + Umsetzung in einer Hand", d: "Kein Ping-Pong zwischen Beratung, Agentur und IT. Wir analysieren, entwickeln und rollen aus, als ein Team." },
  { t: "Eigene Produkte im täglichen Einsatz", d: "Wir kennen die Realität von SaaS, Support und Skalierung, weil wir selbst Produkte am Markt betreiben." },
  { t: "Praxis vor Theorie", d: "Jede Lösung wird daran gemessen, was sie im Alltag bewirkt: weniger Aufwand, weniger Fehler, mehr Umsatz, nicht hübschere Slides." },
];
export const TEAM = [
  { name: "Nicola Sieber", role: "Strategy & Operations", img: "/team/nicola.png", desc: "Treibt Digitalisierungsprojekte mit klarem Fokus auf Effizienz voran. Übersetzt komplexe Abläufe in Prozesse, die im Alltag wirklich Zeit sparen." },
  { name: "Timo Sieber", role: "Engineering & AI", img: "/team/timo.png", desc: "Entwickler und zertifizierter KI-Architekt. Verantwortet die Softwarearchitektur hinter unseren Lösungen, von der ersten Skizze bis zum produktiven System." },
  { name: "Mika Sieber", role: "Customer Success", img: "/team/mika.png", desc: "Sorgt dafür, dass aus Kunden langfristige Partner werden. Erste Ansprechperson für Betreuung, Onboarding und laufende Zusammenarbeit." },
];

/** FAQ für /automationen */
export const AUTO_FAQS = [
  { q: "Wie lange dauert die Umsetzung?", a: "Erste produktive Resultate sind oft in 2 bis 6 Wochen sichtbar. Grössere Lösungen werden in klar definierten Etappen ausgerollt, damit Nutzen früh entsteht." },
  { q: "Wo werden meine Daten gespeichert?", a: "Standardmässig in der Schweiz oder in der EU. Spezifische Anforderungen (CH-Hosting, on-premise, FINMA) berücksichtigen wir im Architektur-Entscheid." },
  { q: "Was, wenn Standard-Software bereits reicht?", a: "Dann sagen wir das. Wir empfehlen das, was im Alltag am besten passt, auch wenn das eine bestehende Lösung wie Bexio, HubSpot oder Microsoft 365 ist." },
  { q: "Begleiten Sie uns auch nach dem Go-Live?", a: "Ja. Wir bleiben Ansprechpartner für Wartung, Weiterentwicklung und Support. Aus einem Projekt soll ein dauerhaft funktionierender Prozess werden." },
];
