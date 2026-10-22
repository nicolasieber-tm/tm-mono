import SiteLayout from "@/components/site/SiteLayout";
import { ContactSection, FaqSection, Illo, PageHero, Shead, StrokeIcon, n2 } from "@/components/site/blocks";
import Testimonials from "@/components/sections/Testimonials";
import { BOOK_HREF, WIDGET_WEB } from "@/lib/booking";
import BeforeAfter from "./BeforeAfter";
import BookingCase from "./BookingCase";

/* Landingpages & Websites — Unterseite im einheitlichen TM-Design (früher eigener
   violetter Skin + eigene Navigation). Eigenes Buchungs-Widget (WIDGET_WEB) mit
   Vorqualifizierungs-Fragen für Website-Projekte. */

/* ---- content ---- */
const STATS = [
  { v: "≤ 100", l: "PageSpeed-Ziel auf Mobile" },
  { v: "2 Wo.", l: "von Kickoff bis Live" },
  { v: "100%", l: "responsiv & barrierearm" },
  { v: "CH/EU", l: "Hosting & Datenschutz" },
];
const PAINS = [
  { illo: "webFizzle", tag: "Hübsch, wirkungslos", title: "Schön gemacht, aber es kommt nichts rein", desc: "Die Seite sieht gut aus, doch das Telefon bleibt still. Ohne klare Conversion-Logik ist Design nur Dekoration.", v: "0", l: "Anfragen pro Woche" },
  { illo: "find", tag: "Unsichtbar", title: "Bei Google nicht zu finden", desc: "Wer Sie nicht kennt, findet Sie nicht. Ohne SEO-Grundlagen landet die Seite auf Seite drei, also nirgendwo.", v: "Seite 3", l: "im Suchergebnis" },
  { illo: "slow", tag: "Zu langsam", title: "Lädt zu lange, Besucher springen ab", desc: "Jede zusätzliche Sekunde Ladezeit kostet Besucher. Auf dem Handy entscheidet sich das in Millisekunden.", v: "53%", l: "Absprung bei >3s" },
  { illo: "stale", tag: "Veraltet", title: "Seit Jahren nicht angefasst, keiner pflegt sie", desc: "Die Seite ist eingefroren, weil niemand sie aktualisieren kann. Jede Änderung wird zum Projekt.", v: "Jahre", l: "ohne Update" },
];
const SERVICES = [
  { illo: "webPage", tag: "Landingpages", title: "Landingpages mit einem klaren Ziel", desc: "Eine Seite, eine Botschaft, eine Handlung. Gebaut für eine konkrete Dienstleistung oder Kampagne und darauf optimiert, Anfragen auszulösen.", chips: ["Conversion-Logik", "Eine klare Aktion", "A/B-bereit"] },
  { illo: "device", tag: "Websites", title: "Mehrseitige Webauftritte", desc: "Der vollständige Auftritt für Ihr Unternehmen, sauber strukturiert, mehrsprachig wenn nötig, und so gebaut, dass Sie Inhalte selbst pflegen können.", chips: ["Responsive", "Selbst pflegbar", "Mehrsprachig"] },
  { illo: "rank", tag: "Sichtbarkeit", title: "Gefunden werden (SEO)", desc: "Technisch sauberes Fundament, lokale Sichtbarkeit und echte Performance. Damit Sie dort auftauchen, wo Ihre Kunden suchen.", chips: ["Technisches SEO", "Local SEO", "Core Web Vitals"] },
  { illo: "funnel", tag: "Conversion", title: "Anfragen automatisieren", desc: "Vom Klick zum Termin: Terminbuchung, smarte Formulare und Anbindung an Ihre Tools. Aus Besuchern werden qualifizierte Leads, ohne manuellen Aufwand.", chips: ["Terminbuchung", "Formulare", "CRM-Anbindung"] },
];
const PROCESS = [
  { t: "Verstehen", d: "Wir klären, wen Sie erreichen wollen und welche Handlung zählt: Anruf, Anfrage oder Termin. Ohne Ziel kein Design." },
  { t: "Konzipieren", d: "Struktur, Botschaft und Aufbau vor der Optik. Wir entwerfen den Weg, den ein Besucher bis zur Anfrage geht." },
  { t: "Bauen", d: "Schnell, responsiv und sauber umgesetzt, mit SEO-Grundlagen und Conversion-Elementen von Anfang an eingebaut." },
  { t: "Launchen & Optimieren", d: "Live gehen ist der Anfang. Wir messen, was funktioniert, und schärfen nach, damit aus Besuchern dauerhaft Anfragen werden." },
];
const REASONS = [
  { t: "Auf Conversion getrimmt, nicht auf Effekte", d: "Jedes Element hat einen Job: den Besucher näher an die Anfrage bringen. Schön ist Pflicht, Wirkung ist das Ziel." },
  { t: "Mobile-first & blitzschnell", d: "Über die Hälfte Ihrer Besucher kommt vom Handy. Wir bauen zuerst für mobil und für Ladezeiten unter zwei Sekunden." },
  { t: "Selbst pflegbar", d: "Sie sollen Texte und Bilder selbst ändern können, ohne uns für jede Kleinigkeit zu brauchen. Unabhängigkeit ist Teil der Lieferung." },
  { t: "SEO ab Tag 1", d: "Saubere Technik, sinnvolle Struktur und schnelle Ladezeiten: die Grundlage, um überhaupt gefunden zu werden, ist eingebaut." },
  { t: "Schweiz-konform & DSGVO", d: "Datenschutz, Impressum und Hosting in der Schweiz oder EU. Rechtssicher, ohne dass Sie sich darum kümmern müssen." },
  { t: "Hosting & Wartung aus einer Hand", d: "Domain, Hosting, Updates und Ansprechpartner an einem Ort. Kein Ping-Pong zwischen drei Anbietern." },
];
const PACKAGES = [
  {
    name: "Landingpage", tag: "Eine Seite, ein Ziel", pop: false,
    feat: ["Eine fokussierte Seite", "Conversion-optimierter Aufbau", "Buchungstool oder Formular", "Mobile-first & schnell", "SEO-Grundlagen", "Schweizer Hosting"],
  },
  {
    name: "Website", tag: "Ihr kompletter Auftritt", pop: true, badge: "Beliebt",
    feat: ["Mehrere Seiten (z. B. Leistungen, Über uns)", "Eigenes Design auf Ihre Marke", "Selbst pflegbares CMS", "On-Page-SEO inklusive", "Buchungstool & Formulare", "Hosting & Wartung"],
  },
  {
    name: "Website + Wachstum", tag: "Auftritt, der mitarbeitet", pop: false,
    feat: ["Alles aus «Website»", "Laufende SEO-Betreuung", "Performance-Monitoring", "A/B-Tests & Optimierung", "Inhalts-Updates auf Wunsch", "Fester Ansprechpartner"],
  },
  {
    name: "Buchungstool", tag: "Für Ihre bestehende Website", pop: false,
    feat: ["Buchungstool in Ihre aktuelle Seite integriert", "Kunden buchen selbst, rund um die Uhr", "Automatische Bestätigung & Kalender-Sync", "Vorqualifizierung mit eigenen Fragen", "Kein Website-Neubau nötig", "Einrichtung & Einbau übernehmen wir"],
  },
];
const FAQS = [
  { q: "Was kostet eine Website bei Ihnen?", a: "Das hängt vom Umfang ab. Eine fokussierte Landingpage ist deutlich günstiger als ein mehrsprachiger Webauftritt mit laufender Betreuung. Im kostenlosen Erstgespräch geben wir Ihnen einen konkreten, fixen Richtpreis, ohne Überraschungen." },
  { q: "Wie lange dauert es, bis meine Seite live ist?", a: "Eine Landingpage ist oft in ein bis zwei Wochen live. Ein grösserer Webauftritt dauert je nach Umfang und Inhalten drei bis sechs Wochen. Den Zeitplan legen wir direkt nach dem Erstgespräch gemeinsam fest." },
  { q: "Kann ich die Seite später selbst bearbeiten?", a: "Ja. Wir bauen so, dass Sie Texte, Bilder und Inhalte selbst aktualisieren können. Auf Wunsch zeigen wir Ihnen das in einem kurzen Onboarding oder übernehmen die Pflege für Sie." },
  { q: "Kümmern Sie sich auch um Hosting und Domain?", a: "Ja, auf Wunsch komplett. Domain, Hosting in der Schweiz oder EU, technische Updates und Backups, alles aus einer Hand, mit einem festen Ansprechpartner." },
  { q: "Sorgt die Seite dafür, dass ich bei Google gefunden werde?", a: "Die technischen SEO-Grundlagen (saubere Struktur, schnelle Ladezeiten, mobile Optimierung) sind immer dabei. Für aktive Sichtbarkeit (Rankings für bestimmte Suchbegriffe) gibt es das Paket «Website + Wachstum» mit laufender Betreuung." },
  { q: "Ich habe schon eine Website. Lohnt sich ein Neubau?", a: "Nicht immer, manchmal reicht ein gezielter Relaunch oder eine zusätzliche Landingpage. Im Erstgespräch schauen wir uns Ihre aktuelle Seite ehrlich an und sagen Ihnen, was sich wirklich lohnt." },
];

const GUARANTEES = [
  { ic: "cal", t: "Termin direkt im Kalender wählen" },
  { ic: "zap", t: "Konkreter Richtpreis statt Sales-Pitch" },
  { ic: "chat", t: "Persönliche Antwort, kein Auto-Reply" },
];

export default function Landingpages() {
  return (
    <SiteLayout
      title="Landingpages & Websites für Schweizer KMU · Trending Media"
      description="Webseiten und Landingpages, die Anfragen bringen: conversion-optimiert, schnell, mit SEO-Grundlagen und integrierter Terminbuchung."
      widgetId={WIDGET_WEB}
    >
      <PageHero
        kick="Landingpages & Websites für Schweizer KMU"
        title={<>Eine Website, die <span className="g">Anfragen bringt</span>.</>}
        sub="Schön ist das Minimum. Wir bauen Auftritte, die aus Besuchern Kunden machen."
        secondary={{ label: "So gehen wir vor", href: "#vorgehen" }}
      />

      <section className="ap-sec" style={{ paddingTop: 0 }}>
        <div className="wide">
          <div className="ap-stats reveal">
            {STATS.map((s) => (
              <div className="st" key={s.l}>
                <b>{s.v}</b>
                <span>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ap-sec alt" id="problem">
        <div className="wide">
          <Shead k="Diagnose" h="Warum Ihre Website keine Anfragen bringt" intro="Eine Website ist kein digitaler Flyer. Diese vier Punkte hören wir immer wieder, und genau da setzen wir an." />
          <div className="ap-grid c4 reveal">
            {PAINS.map((p) => (
              <div className="ap-card" key={p.title}>
                <Illo name={p.illo} />
                <div className="tag">{p.tag}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="m"><b>{p.v}</b><span>{p.l}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ap-sec" id="leistungen">
        <div className="wide">
          <Shead k="Leistungen" h="Vom ersten Klick zur Anfrage." intro="Wir bauen nicht nur Seiten, die gut aussehen, sondern den ganzen Weg vom Besucher zum Kunden." />
          <div className="ap-grid c2 reveal">
            {SERVICES.map((s) => (
              <div className="ap-card" key={s.title}>
                <Illo name={s.illo} />
                <div className="tag">{s.tag}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="chips">{s.chips.map((x) => <span key={x}>{x}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ap-sec alt" id="vorgehen">
        <div className="wide">
          <Shead k="Vorgehen" h="Struktur vor Optik. Wirkung vor Effekt." />
          <div className="ap-grid c4 reveal">
            {PROCESS.map((s, i) => (
              <div className="ap-card" key={s.t}>
                <div className="ap-num">{n2(i)}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
          <div className="ap-cta reveal" style={{ marginTop: 48 }}>
            <a href={BOOK_HREF}>Erstgespräch buchen</a>
          </div>
        </div>
      </section>

      <section className="ap-sec" id="referenz">
        <div className="wide">
          <Shead k="Referenz" h={"Ein echtes Vorher → Nachher."} intro="So sieht der Unterschied aus: Ziehen Sie die Trennlinie und wechseln Sie zwischen den Bereichen einer echten Kundenseite." />
          <BeforeAfter withQuote={false} />
        </div>
      </section>

      <section className="ap-sec alt" id="buchung">
        <div className="wide">
          <Shead k="Und so bucht ein Kunde darauf" h="Vom Termin-Pingpong zum einen Link." intro="Zu jeder Website, die wir bauen, gehört die passende Terminbuchung — direkt integriert. Schluss mit E-Mail- und Telefon-Hin-und-Her: Ihre Kunden buchen selbst, rund um die Uhr." />
          <BookingCase />
        </div>
      </section>

      <Testimonials product="web" kick="Kundenstimmen" title="Was unsere Web-Kunden erzählen." />

      <section className="ap-sec alt">
        <div className="wide">
          <Shead k="Was immer dabei ist" h="Kein Schnickschnack. Nur, was wirkt." intro="Jede Seite, die wir bauen, bringt diese Grundlagen mit, ohne Aufpreis, ohne Diskussion." />
          <div className="ap-grid c2 reveal">
            {REASONS.map((r) => (
              <div className="ap-reason" key={r.t}>
                <span className="rc"><StrokeIcon name="check" color="url(#tmgrad)" size={20} /></span>
                <div>
                  <h4>{r.t}</h4>
                  <p>{r.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ap-sec" id="pakete">
        <div className="wide">
          <Shead k="Pakete" h="Website, Buchungstool oder beides." intro="Vom fokussierten Einstieg über den kompletten Auftritt inklusive Buchungstool — oder nur das Buchungstool für Ihre bestehende Website. Den fixen Richtpreis erhalten Sie im Erstgespräch." />
          <div className="ap-grid c4 reveal">
            {PACKAGES.map((p) => (
              <div className={`ap-card pkg${p.pop ? " pop" : ""}`} key={p.name}>
                {p.badge && <span className="badge">{p.badge}</span>}
                <div className="tag">{p.tag}</div>
                <h3>{p.name}</h3>
                <ul className="feat">
                  {p.feat.map((f) => (
                    <li key={f}><StrokeIcon name="check" color="url(#tmgrad)" size={17} />{f}</li>
                  ))}
                </ul>
                <div className="pkg-foot">
                  <div className="pr">Fixer Richtpreis im Erstgespräch</div>
                  <a href={BOOK_HREF}>Paket besprechen ›</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactSection
        alt
        title="Reden wir über Ihre neue Website."
        lead="30 Minuten, ehrlich und unverbindlich. Wir schauen uns Ihre Situation an und sagen offen, welche Lösung wirklich zu Ihnen passt, auch wenn das weniger ist, als Sie erwarten."
        guarantees={GUARANTEES}
      />
      <FaqSection faqs={FAQS} alt={false} />
    </SiteLayout>
  );
}
