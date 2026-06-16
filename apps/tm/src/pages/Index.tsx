import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./apple-home.css";
import { CalEmbed } from "@/components/CalEmbed";

const MAIL = "info@trendingmedia.ch";

/* ---- inline stroke icons ---- */
const IC: Record<string, string> = {
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  cal: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/>',
  server: '<rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
  trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
};

function StrokeIcon({ name, color = "currentColor", size = 24 }: { name: string; color?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: IC[name] }}
    />
  );
}

/* ---- generated animated card illustrations ---- */
const wrap = (i: string) => `<svg viewBox="0 0 120 80">${i}</svg>`;
const ILLO: Record<string, () => string> = {
  excel() { let r = ""; for (let i = 0; i < 16; i++) { const c = i % 4, rw = Math.floor(i / 4), x = c * 27 + 6, y = rw * 16 + 8, d = ((i * 0.41) % 4).toFixed(2); r += `<rect x="${x}" y="${y}" width="23" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.5"><animate attributeName="opacity" values="0.2;1;0.2" dur="3.2s" begin="${d}s" repeatCount="indefinite"/></rect>`; } return wrap(r); },
  doubleEntry() { let r = ""; [6, 44, 82].forEach(x => { r += `<rect x="${x}" y="14" width="32" height="52" rx="2" fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.5"/>`;[22, 28, 34, 40].forEach((y, k) => { r += `<line x1="${x + 4}" y1="${y}" x2="${x + [22, 26, 18, 24][k]}" y2="${y}" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>`; }); }); r += `<circle r="3" fill="currentColor"><animateMotion dur="3.4s" repeatCount="indefinite" path="M 22 40 L 60 40 L 98 40 L 22 40"/></circle>`; return wrap(r); },
  silo() { let r = ""; [[16, 18], [104, 18], [16, 62], [104, 62]].forEach(([x, y]) => { r += `<line x1="60" y1="40" x2="${x}" y2="${y}" stroke="currentColor" stroke-width="0.6" stroke-dasharray="2 3" opacity="0.4"/><circle cx="${x}" cy="${y}" r="3" fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.5"/>`; }); r += `<circle cx="60" cy="40" r="14" fill="none" stroke="currentColor" stroke-width="0.6"><animate attributeName="r" values="8;18;8" dur="3.2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0;0.6" dur="3.2s" repeatCount="indefinite"/></circle><circle cx="60" cy="40" r="6" fill="currentColor"/>`; return wrap(r); },
  fizzle() { let r = ""; [[30, 22, 0], [55, 16, .6], [80, 24, 1.2], [45, 32, 1.8], [70, 36, .3]].forEach(([x, y, d]) => { r += `<g transform="translate(${x} ${y})"><path d="M 0 -5 L 1.2 -1.2 L 5 0 L 1.2 1.2 L 0 5 L -1.2 1.2 L -5 0 L -1.2 -1.2 Z" fill="currentColor"><animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="${d}s" repeatCount="indefinite"/></path></g>`; }); r += `<rect x="20" y="58" width="80" height="3" rx="1.5" fill="currentColor" opacity="0.15"/><rect x="20" y="58" height="3" rx="1.5" fill="currentColor"><animate attributeName="width" values="0;55;55;0" keyTimes="0;0.55;0.7;1" dur="3.5s" repeatCount="indefinite"/></rect>`; return wrap(r); },
  workflow() { const n = [[16, 20], [60, 20], [60, 60], [104, 60]]; let r = `<path d="M 22 20 L 54 20 M 60 26 L 60 54 M 66 60 L 98 60" stroke="currentColor" stroke-width="0.8" fill="none" stroke-dasharray="2 1.5" opacity="0.5"/>`; n.forEach(([x, y]) => { r += `<rect x="${x - 6}" y="${y - 4}" width="12" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.6"/>`; }); r += `<circle r="2.4" fill="currentColor"><animateMotion dur="3.8s" repeatCount="indefinite" path="M 16 20 L 60 20 L 60 60 L 104 60"/></circle>`; return wrap(r); },
  brain() { const l1 = [18, 40, 62], l2 = [14, 30, 50, 66], l3 = [32, 48]; let r = ""; l1.forEach(a => l2.forEach(b => { r += `<line x1="18" y1="${a}" x2="60" y2="${b}" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>`; })); l2.forEach(a => l3.forEach(b => { r += `<line x1="60" y1="${a}" x2="102" y2="${b}" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>`; })); [0, .7, 1.4, 2.1].forEach((d, i) => { r += `<circle r="1.6" fill="currentColor"><animateMotion dur="2.6s" begin="${d}s" repeatCount="indefinite" path="M 18 ${l1[i % 3]} L 60 ${l2[i % 4]} L 102 ${l3[i % 2]}"/></circle>`; }); [...l1.map(y => [18, y]), ...l2.map(y => [60, y]), ...l3.map(y => [102, y])].forEach(([x, y]) => { r += `<circle cx="${x}" cy="${y}" r="2.4" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.7"/>`; }); return wrap(r); },
  code() { const b = [[18, 18, 56, 4.6], [30, 30, 48, 5.2], [14, 42, 68, 4.2], [26, 54, 52, 4.8]]; let r = ""; b.forEach(([x, y, w, d]) => { r += `<rect x="${x}" y="${y}" width="${w}" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="0.6" opacity="0.5"><animate attributeName="x" values="${x};${x + 6};${x}" dur="${d}s" repeatCount="indefinite"/></rect>`; }); return wrap(r); },
  web() { let r = `<rect x="10" y="12" width="100" height="56" rx="2.5" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.5"/><line x1="10" y1="24" x2="110" y2="24" stroke="currentColor" stroke-width="0.6" opacity="0.4"/>`;[[30, 70, 0], [40, 55, .4], [50, 65, .8]].forEach(([y, m, d]) => { r += `<rect x="18" y="${y}" height="4" rx="1" fill="currentColor" opacity="0.7"><animate attributeName="width" values="0;${m};${m};0" keyTimes="0;0.4;0.85;1" dur="4s" begin="${d}s" repeatCount="indefinite"/></rect>`; }); r += `<rect x="18" y="58" width="22" height="5" rx="2.5" fill="currentColor"/>`; return wrap(r); },
};

function Illo({ name }: { name: string }) {
  const inner = ILLO[name]().split("currentColor").join("url(#tmgrad)");
  return <div className="illo" dangerouslySetInnerHTML={{ __html: inner }} />;
}

/* ---- content ---- */
const PAINS = [
  { illo: "excel", tag: "Daten-Chaos", title: "Excel-Listen, die niemand mehr durchblickt", desc: "Daten leben in fünf Tabellen, drei Mailboxen und einem Ordner-Chaos. Jede Auswertung ist Handarbeit.", v: "~14h", l: "pro Woche verloren" },
  { illo: "doubleEntry", tag: "Medienbruch", title: "Doppelte Erfassung in jedem System", desc: "Die gleichen Informationen werden täglich mehrfach getippt: im CRM, in der Buchhaltung, im Projekt-Tool.", v: "3-5×", l: "gleiche Eingabe" },
  { illo: "silo", tag: "Wissens-Silo", title: "Wissen, das nur in einem Kopf existiert", desc: "Wenn diese eine Person Ferien hat, steht der halbe Betrieb. Prozesse sind nirgendwo dokumentiert.", v: "1", l: "Single Point of Failure" },
  { illo: "fizzle", tag: "Tool-Friedhof", title: "KI-Versprechen, die im Alltag nichts bringen", desc: "Tools wurden eingeführt, aber niemand nutzt sie. Der Aufwand ist gleich geblieben, die Lizenzkosten nicht.", v: "0", l: "ROI trotz Lizenzen" },
];
const SERVICES = [
  { illo: "workflow", tag: "Operations", title: "Prozesse digitalisieren", desc: "Wir machen sichtbar, wo in Ihrem Alltag Aufwand entsteht. Zettel, Excel-Listen und Medienbrüche ersetzen wir durch saubere digitale Abläufe.", chips: ["Prozess-Audit", "Integration", "Change Management"] },
  { illo: "brain", tag: "Intelligence", title: "KI & Automatisierung mit Substanz", desc: "Wir integrieren KI dort, wo sie konkret Mehrwert schafft: vom internen Assistenten bis zur automatisierten Verarbeitung wiederkehrender Aufgaben.", chips: ["KI-Assistent", "RAG", "Agents"] },
  { illo: "code", tag: "Engineering", title: "Massgeschneiderte Software", desc: "Wenn Standard-Software nicht passt, bauen wir genau das Werkzeug, das in Ihrem Betrieb fehlt, stabil, wartbar und zum Mitwachsen gemacht.", chips: ["Web-Apps", "Datenbanken", "APIs"] },
  { illo: "web", tag: "Reach", title: "Web & Landingpages", desc: "Performante Webauftritte, die Sichtbarkeit in Anfragen verwandeln, mit klarer Conversion-Logik statt Pixel-Spielerei.", chips: ["Landingpages", "SEO", "Terminbuchung"] },
];
const PROCESS = [
  { t: "Zuhören", d: "Wir sprechen mit Geschäftsführung, Mitarbeitenden und wo es Sinn macht auch mit Ihren Kunden. Ziel: ein ehrliches Bild davon, wo im Alltag wirklich Aufwand entsteht." },
  { t: "Analysieren", d: "Wir identifizieren Medienbrüche, manuelle Doppelarbeit und Reibungsverluste. Statt Buzzwords liefern wir eine konkrete Liste der grössten Hebel." },
  { t: "Entwickeln", d: "Wir entscheiden gemeinsam, was Standard-Software löst, was eigene Software braucht und wo KI tatsächlich Mehrwert schafft, nicht weil es im Trend liegt." },
  { t: "Umsetzen", d: "Wir bauen, integrieren und rollen aus. Danach bleiben wir Ansprechpartner, damit aus dem Projekt ein dauerhaft funktionierender Prozess wird." },
];
const PILLARS = [
  { r: "I", t: "Wir starten beim Alltag, nicht bei der Technologie.", d: "Bevor wir über Software sprechen, verstehen wir, wo im Tagesgeschäft Zeit verloren geht: im Büro, vor Ort, im Kundenkontakt." },
  { r: "II", t: "Wir denken wie Unternehmer.", d: "Wir betreiben selbst Produkte am Markt. Deshalb wissen wir, was operativ funktioniert und was nur in Slides gut aussieht." },
  { r: "III", t: "Wir setzen auch um.", d: "Konzepte ohne Umsetzung helfen niemandem. Wir liefern Strategie, Software und Rollout aus einer Hand." },
];
const REASONS = [
  { t: "KI dort, wo sie wirklich wirkt", d: "Wir setzen KI nicht als Buzzword ein, sondern dort, wo sie messbar Zeit spart oder bessere Entscheidungen ermöglicht." },
  { t: "Strategie + Umsetzung in einer Hand", d: "Kein Ping-Pong zwischen Beratung, Agentur und IT. Wir analysieren, entwickeln und rollen aus, als ein Team." },
  { t: "Eigene Produkte im täglichen Einsatz", d: "Wir kennen die Realität von SaaS, Support und Skalierung, weil wir selbst Produkte am Markt betreiben." },
  { t: "Praxis vor Theorie", d: "Jede Lösung wird daran gemessen, was sie im Alltag bewirkt: weniger Aufwand, weniger Fehler, mehr Umsatz, nicht hübschere Slides." },
];
const GUARANTEES = [
  { ic: "cal", t: "Termin direkt im Kalender wählen" },
  { ic: "check", t: "Konkrete Einschätzung statt Sales-Pitch" },
  { ic: "chat", t: "Persönliche Antwort, kein Auto-Reply" },
];
const PRODUCTS = [
  { name: "AURON", logo: "/Auron_logo.png", color: "#ff7a3c", grad: "linear-gradient(135deg,#ff9a3c,#ff5e2c)", tag: "Handwerker und Bauunternehmen", domain: "auron.trendingmedia.ch", href: "https://auron.trendingmedia.ch", desc: "Intelligente Zeiterfassung für Handwerks- und Servicebetriebe. Entstanden aus dutzenden Gesprächen mit Betrieben, die ihre Stunden bisher auf Zetteln und in Excel verloren haben." },
  { name: "OneClick Office", logo: "/oneclick-office_logo.png", color: "#2b9fd6", grad: "linear-gradient(135deg,#3bb0e6,#1f7fc0)", tag: "Coaches & Berater", domain: "oneclick-office.ch", href: "https://landingpage.oneclick-office.ch", desc: "Rechnungen, Spesen und Admin-Kram radikal vereinfacht, damit Coaches, Berater und kleine Unternehmen wieder die Arbeit machen, für die sie bezahlt werden." },
  { name: "Landingpages", logo: "/Webseiten_logo.png", color: "#8b5cf6", grad: "linear-gradient(135deg,#9d6bff,#7b3fe4)", tag: "KMU & Dienstleister", domain: "sichtbarkeit.trendingmedia.ch", href: "https://sichtbarkeit.trendingmedia.ch", desc: "Hochkonvertierende Landingpages für KMU und lokale Dienstleister. Klarer Fokus: Sichtbarkeit, qualifizierte Anfragen und messbare Resultate." },
];
const TEAM = [
  { name: "Nicola Sieber", role: "Strategy & Operations", img: "/team/nicola.png", desc: "Treibt Digitalisierungsprojekte mit klarem Fokus auf Effizienz voran. Übersetzt komplexe Abläufe in Prozesse, die im Alltag wirklich Zeit sparen." },
  { name: "Timo Sieber", role: "Engineering & AI", img: "/team/timo.png", desc: "Entwickler und zertifizierter KI-Architekt. Verantwortet die Softwarearchitektur hinter unseren Lösungen, von der ersten Skizze bis zum produktiven System." },
  { name: "Mika Sieber", role: "Customer Success", img: "/team/mika.png", desc: "Sorgt dafür, dass aus Kunden langfristige Partner werden. Erste Ansprechperson für Betreuung, Onboarding und laufende Zusammenarbeit." },
];
const FAQS = [
  { q: "Wie läuft das Erstgespräch ab?", a: "30 Minuten per Video-Call. Wir hören zu, ordnen Ihre Situation ein und sagen offen, ob und wo wir der richtige Partner sind. Kein Sales-Pitch, keine Folgekosten, keine Verpflichtung." },
  { q: "Was kostet ein typisches Projekt?", a: "Das hängt stark vom Umfang ab. Eine Prozessautomatisierung beginnt im niedrigen vierstelligen Bereich, individuelle Software bewegt sich je nach Tiefe im fünfstelligen Bereich. Nach dem Erstgespräch erhalten Sie einen konkreten, fixen Rahmen." },
  { q: "Wie lange dauert die Umsetzung?", a: "Erste produktive Resultate sind oft in 2 bis 6 Wochen sichtbar. Grössere Lösungen werden in klar definierten Etappen ausgerollt, damit Nutzen früh entsteht." },
  { q: "Für welche Branchen arbeiten Sie?", a: "Schwerpunkt sind Schweizer KMU im Dienstleistungs-, Handwerks- und Servicebereich. Unser Vorgehen funktioniert überall dort, wo manuelle Abläufe digitalisiert werden sollen." },
  { q: "Wo werden meine Daten gespeichert?", a: "Standardmässig in der Schweiz oder in der EU. Spezifische Anforderungen (CH-Hosting, on-premise, FINMA) berücksichtigen wir im Architektur-Entscheid." },
  { q: "Was, wenn Standard-Software bereits reicht?", a: "Dann sagen wir das. Wir empfehlen das, was im Alltag am besten passt, auch wenn das eine bestehende Lösung wie Bexio, HubSpot oder Microsoft 365 ist." },
  { q: "Begleiten Sie uns auch nach dem Go-Live?", a: "Ja. Wir bleiben Ansprechpartner für Wartung, Weiterentwicklung und Support. Aus einem Projekt soll ein dauerhaft funktionierender Prozess werden." },
];

const n2 = (i: number) => String(i + 1).padStart(2, "0");

function Shead({ k, h, intro }: { k: string; h: string; intro?: string }) {
  return (
    <div className="ap-shead reveal">
      <div className="kick">{k}</div>
      <h2>{h}</h2>
      {intro && <p className="intro">{intro}</p>}
    </div>
  );
}

function FaqItem({ f, open, onToggle }: { f: { q: string; a: string }; open: boolean; onToggle: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.style.maxHeight = open ? `${el.scrollHeight}px` : "0";
  }, [open]);
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button className="faq-q" onClick={onToggle}>
        <span>{f.q}</span>
        <span className="qx">+</span>
      </button>
      <div className="faq-a" ref={ref}>
        <div className="faq-a-in">{f.a}</div>
      </div>
    </div>
  );
}

const Index = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // light body background on this route only (other routes use the dark cosmic theme)
  useEffect(() => {
    document.body.classList.add("ap-light");
    return () => document.body.classList.remove("ap-light");
  }, []);

  // reveal-on-scroll
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.08 }
    );
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // nav pill shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="ap ap-vivid" ref={rootRef}>
      {/* shared gradient definition for icons + illustrations */}
      <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="tmgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff8a3c" />
            <stop offset="0.5" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#2f9fd6" />
          </linearGradient>
        </defs>
      </svg>

      <nav className="ap-nav">
        <div className={`ap-pill${scrolled ? " scrolled" : ""}`}>
          <a className="b" href="#top"><img className="brandmark" src="/logo-schwarz.png" alt="" />Trending Media</a>
          <div className="links">
            <a href="#leistungen">Leistungen</a>
            <a href="#vorgehen">Vorgehen</a>
            <a href="#produkte">Produkte</a>
            <a href="#faq">FAQ</a>
          </div>
          <a className="cta" href="#kontakt">Erstgespräch</a>
          <button className="ap-burger" aria-label="Menü öffnen" onClick={() => setMobileOpen((o) => !o)}>≡</button>
        </div>
      </nav>
      <div className={`ap-mobile${mobileOpen ? " open" : ""}`}>
        <a href="#leistungen" onClick={() => setMobileOpen(false)}>Leistungen</a>
        <a href="#vorgehen" onClick={() => setMobileOpen(false)}>Vorgehen</a>
        <a href="#produkte" onClick={() => setMobileOpen(false)}>Produkte</a>
        <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
        <a href="#kontakt" onClick={() => setMobileOpen(false)}>Erstgespräch</a>
      </div>

      <section className="ap-hero reveal" id="top">
        <div className="wrap">
          <div className="kick">Digitalisierung für Schweizer KMU</div>
          <h1>Ihr Unternehmen, <span className="g">digital weitergedacht</span>.</h1>
          <p className="sub">Mit individuellen digitalen Lösungen reduzieren wir manuellen Aufwand, verbinden Systeme und schaffen effizientere Abläufe.</p>
          <div className="acts">
            <a className="p" href="#kontakt">Erstgespräch buchen</a>
            <a className="s" href="#leistungen">Mehr erfahren ›</a>
          </div>
          <div className="ap-reassure">100% kostenlos &amp; unverbindlich</div>

          <div className="ap-trust">
            <div className="t-item">
              <img className="t-logo" src="/anthropic-icon-logo.png" alt="Anthropic" width={22} height={22} />
              <div className="t-txt"><b>Anthropic</b><span>Claude Certified Architect</span></div>
            </div>
            <div className="t-item">
              <StrokeIcon name="server" size={22} />
              <div className="t-txt"><b>EU-Datenstandort</b><span>revDSG-konform</span></div>
            </div>
            <div className="t-item">
              <StrokeIcon name="trend" size={22} />
              <div className="t-txt"><b>Ø 14 h/Woche</b><span>weniger Aufwand</span></div>
            </div>
            <div className="t-item">
              <StrokeIcon name="users" size={22} />
              <div className="t-txt"><b>Persönlich &amp; lokal</b><span>Umsetzung im eigenen Team</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="ap-sec alt">
        <div className="wide">
          <Shead k="Diagnose" h="Kommt Ihnen das bekannt vor?" intro="Punkte, die wir in fast jedem Erstgespräch hören, kein Zeichen schlechter Organisation, sondern von Werkzeugen, die nicht mitgewachsen sind." />
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
          <Shead k="Leistungen" h="Strategie, Software, Umsetzung. Ein Team." intro="Vier Bereiche, ein Anspruch: spürbar weniger Aufwand, mehr Qualität, mehr Zeit für das Eigentliche." />
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
          <Shead k="Vorgehen" h="Vom echten Problem zur Lösung." />
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
            <a href="#kontakt">Erstgespräch buchen</a>
          </div>
        </div>
      </section>

      <section className="ap-sec">
        <div className="wide">
          <Shead k="Manifest" h="Kein Beratungshaus. Keine klassische Agentur." intro="Wir begleiten Unternehmen langfristig durch ihre Digitalisierung, mit echtem Verständnis für operative Abläufe." />
          <div className="ap-grid c3 reveal" style={{ marginBottom: 20 }}>
            {PILLARS.map((p) => (
              <div className="ap-card" key={p.r}>
                <div className="ap-num">{p.r}.</div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
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

      <section className="ap-sec alt" id="produkte">
        <div className="wide">
          <Shead k="Eigene Produkte" h="Wir bauen nicht nur. Wir betreiben selbst." intro="Drei Lösungen, täglich produktiv im Einsatz." />
          <div className="ap-prod reveal">
            {PRODUCTS.map((p, i) =>
              i === 0 ? (
                <a key={p.name} href={p.href} target="_blank" rel="noopener">
                  <img className="ic" src={p.logo} alt={p.name} />
                  <div className="tag">{p.tag}</div>
                  <h3>{p.name}</h3>
                  <p>{p.desc}</p>
                  <span className="go">{p.domain} ›</span>
                </a>
              ) : (
                <a key={p.name} href={p.href} target="_blank" rel="noopener" style={{ background: p.grad, borderColor: "transparent", color: "#fff" }}>
                  <img className="ic" src={p.logo} alt={p.name} />
                  <div className="tag" style={{ color: "rgba(255,255,255,.88)" }}>{p.tag}</div>
                  <h3>{p.name}</h3>
                  <p style={{ color: "#fff", opacity: 0.78 }}>{p.desc}</p>
                  <span className="go" style={{ color: "rgba(255,255,255,.88)" }}>{p.domain} ›</span>
                </a>
              )
            )}
          </div>
        </div>
      </section>

      <section className="ap-sec" id="team">
        <div className="wrap">
          <Shead k="Über uns" h="Die Gesichter hinter Trending Media." />
          <div className="ap-team reveal">
            {TEAM.map((m) => (
              <figure key={m.name}>
                <img src={m.img} alt={m.name} />
                <h3>{m.name}</h3>
                <div className="role">{m.role}</div>
                <p>{m.desc}</p>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="ap-sec alt" id="kontakt">
        <div className="wide">
          <div className="ap-contact reveal">
            <div>
              <div className="ck">Kontakt · 30 Min unverbindlich</div>
              <h2>Lassen Sie uns über Ihre Reibungsverluste sprechen.</h2>
              <p className="lead-txt">30 Minuten, ehrlich und unverbindlich. Wir analysieren Ihre Situation und sagen offen, ob und wo wir der richtige Partner sind.</p>
              <ul className="ap-guar">
                {GUARANTEES.map((g) => (
                  <li key={g.t}><span className="gi"><StrokeIcon name={g.ic} color="url(#tmgrad)" size={22} /></span>{g.t}</li>
                ))}
              </ul>
            </div>
            <div className="ap-cal">
              <div className="bar"><i /><i /><i /><span>cal.com / Erstgespräch</span></div>
              <CalEmbed className="ap-cal-host" />
            </div>
          </div>
        </div>
      </section>

      <section className="ap-sec" id="faq">
        <div className="wrap">
          <Shead k="FAQ" h="Häufige Fragen." />
          <div className="ap-faq reveal">
            {FAQS.map((f, i) => (
              <FaqItem key={f.q} f={f} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      <footer className="ap-foot">
        <div className="wide">
          <div className="grid">
            <div>
              <h4>Trending Media</h4>
              <p style={{ maxWidth: "30ch", lineHeight: 1.6 }}>Digitalisierungspartner für Schweizer KMU. Strategie, Software und Umsetzung. Aus Praxis, für Praxis.</p>
            </div>
            <div>
              <h4>Produkte</h4>
              <a className="fl" href="https://auron.trendingmedia.ch">AURON</a>
              <a className="fl" href="https://landingpage.oneclick-office.ch">OneClick Office</a>
              <a className="fl" href="https://sichtbarkeit.trendingmedia.ch">Landingpages</a>
            </div>
            <div>
              <h4>Unternehmen</h4>
              <a className="fl" href="#leistungen">Leistungen</a>
              <a className="fl" href="#vorgehen">Vorgehen</a>
              <a className="fl" href="#team">Team</a>
            </div>
            <div>
              <h4>Kontakt</h4>
              <a className="fl" href="#kontakt">Erstgespräch</a>
              <a className="fl" href={`mailto:${MAIL}`}>{MAIL}</a>
              <a className="fl" href="#kontakt">Solothurn · CH</a>
            </div>
          </div>
          <div className="copy">
            <span>© 2026 Trending Media · Made with care in Switzerland</span>
            <span className="sep">·</span>
            <Link to="/impressum">Impressum</Link>
            <span className="sep">·</span>
            <Link to="/datenschutz">Datenschutz</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
