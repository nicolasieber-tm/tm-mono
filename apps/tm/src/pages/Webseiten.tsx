import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./apple-home.css";
import "./webseiten.css";
import { CalEmbed } from "@/components/CalEmbed";

const MAIL = "info@trendingmedia.ch";

/* ---- inline stroke icons ---- */
const IC: Record<string, string> = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  cal: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
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

/* ---- generated animated card illustrations (web-specific) ---- */
const wrap = (i: string) => `<svg viewBox="0 0 120 80">${i}</svg>`;
const ILLO: Record<string, () => string> = {
  // pretty but pointless — sparkles fizzle, the progress bar keeps resetting to nothing
  fizzle() {
    let r = "";
    ([[30, 22, 0], [55, 16, .6], [80, 24, 1.2], [45, 32, 1.8], [70, 36, .3]] as const).forEach(([x, y, d]) => {
      r += `<g transform="translate(${x} ${y})"><path d="M 0 -5 L 1.2 -1.2 L 5 0 L 1.2 1.2 L 0 5 L -1.2 1.2 L -5 0 L -1.2 -1.2 Z" fill="currentColor"><animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="${d}s" repeatCount="indefinite"/></path></g>`;
    });
    r += `<rect x="20" y="58" width="80" height="3" rx="1.5" fill="currentColor" opacity="0.15"/>`;
    r += `<rect x="20" y="58" height="3" rx="1.5" fill="currentColor"><animate attributeName="width" values="0;55;55;0" keyTimes="0;0.55;0.7;1" dur="3.5s" repeatCount="indefinite"/></rect>`;
    return wrap(r);
  },
  // nobody finds you — a magnifier scanning, results scroll into view
  find() {
    let r = `<circle cx="50" cy="34" r="15" fill="none" stroke="currentColor" stroke-width="1" opacity="0.55"/>`;
    r += `<line x1="61" y1="45" x2="74" y2="58" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.65"/>`;
    [28, 34, 40].forEach((y, i) => {
      const w = [20, 13, 17][i];
      r += `<rect x="40" y="${y}" height="3" rx="1.5" fill="currentColor" opacity="0.7"><animate attributeName="width" values="0;${w};${w};0" keyTimes="0;0.35;0.8;1" dur="3.4s" begin="${(i * 0.3).toFixed(1)}s" repeatCount="indefinite"/></rect>`;
    });
    return wrap(r);
  },
  // too slow — spinner crawls, load bar barely fills
  slow() {
    let r = `<circle cx="60" cy="30" r="13" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.18"/>`;
    r += `<path d="M 60 17 A 13 13 0 0 1 73 30" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 60 30" to="360 60 30" dur="2.6s" repeatCount="indefinite"/></path>`;
    r += `<rect x="26" y="58" width="68" height="3" rx="1.5" fill="currentColor" opacity="0.15"/>`;
    r += `<rect x="26" y="58" height="3" rx="1.5" fill="currentColor" opacity="0.6"><animate attributeName="width" values="0;18;28;40" keyTimes="0;0.4;0.7;1" dur="4s" repeatCount="indefinite"/></rect>`;
    return wrap(r);
  },
  // outdated — calendar with dots quietly fading away
  stale() {
    let r = `<rect x="34" y="18" width="52" height="46" rx="3" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>`;
    r += `<line x1="34" y1="29" x2="86" y2="29" stroke="currentColor" stroke-width="0.7" opacity="0.45"/>`;
    r += `<line x1="46" y1="13" x2="46" y2="22" stroke="currentColor" stroke-width="1" opacity="0.5"/><line x1="74" y1="13" x2="74" y2="22" stroke="currentColor" stroke-width="1" opacity="0.5"/>`;
    for (let i = 0; i < 9; i++) {
      const c = i % 3, rw = Math.floor(i / 3);
      r += `<circle cx="${47 + c * 13}" cy="${39 + rw * 9}" r="1.7" fill="currentColor"><animate attributeName="opacity" values="0.5;0.08;0.5" dur="4s" begin="${(i * 0.25).toFixed(2)}s" repeatCount="indefinite"/></circle>`;
    }
    return wrap(r);
  },
  // landingpage — browser frame, headline + bars build, a button lands
  web() {
    let r = `<rect x="10" y="12" width="100" height="56" rx="2.5" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.5"/><line x1="10" y1="24" x2="110" y2="24" stroke="currentColor" stroke-width="0.6" opacity="0.4"/>`;
    ([[30, 70, 0], [40, 55, .4], [50, 65, .8]] as const).forEach(([y, m, d]) => {
      r += `<rect x="18" y="${y}" height="4" rx="1" fill="currentColor" opacity="0.7"><animate attributeName="width" values="0;${m};${m};0" keyTimes="0;0.4;0.85;1" dur="4s" begin="${d}s" repeatCount="indefinite"/></rect>`;
    });
    r += `<rect x="18" y="58" width="22" height="5" rx="2.5" fill="currentColor"/>`;
    return wrap(r);
  },
  // multi-page / responsive — desktop + phone frames reflow together
  device() {
    let r = `<rect x="12" y="18" width="58" height="42" rx="2.5" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>`;
    r += `<rect x="74" y="24" width="24" height="36" rx="3.5" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.6"/>`;
    r += `<line x1="12" y1="26" x2="70" y2="26" stroke="currentColor" stroke-width="0.6" opacity="0.4"/>`;
    ([[18, 32, 40], [18, 40, 32], [18, 48, 44]] as const).forEach(([x, y, w], i) => {
      r += `<rect x="${x}" y="${y}" height="3" rx="1.5" fill="currentColor" opacity="0.55"><animate attributeName="width" values="${w};${w - 10};${w}" dur="3s" begin="${(i * 0.4).toFixed(1)}s" repeatCount="indefinite"/></rect>`;
    });
    ([[80, 32, 12], [80, 39, 16], [80, 46, 10]] as const).forEach(([x, y, w]) => {
      r += `<rect x="${x}" y="${y}" width="${w}" height="2.4" rx="1.2" fill="currentColor" opacity="0.55"/>`;
    });
    return wrap(r);
  },
  // SEO — bars climb, a trend line rises with an arrow head
  rank() {
    let r = "";
    [24, 42, 60, 78].forEach((x, i) => {
      const h = [14, 22, 30, 40][i], y = 60 - h, b = (i * 0.2).toFixed(1);
      r += `<rect x="${x}" y="${y}" width="12" height="${h}" rx="1.5" fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.45"><animate attributeName="height" values="4;${h};${h}" keyTimes="0;0.6;1" dur="3.4s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="y" values="56;${y};${y}" keyTimes="0;0.6;1" dur="3.4s" begin="${b}s" repeatCount="indefinite"/></rect>`;
    });
    r += `<path d="M 26 50 L 48 40 L 66 30 L 86 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>`;
    r += `<path d="M 78 16 L 86 16 L 86 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>`;
    return wrap(r);
  },
  // conversion — visitors drop through a funnel and convert
  funnel() {
    let r = `<path d="M 30 20 L 90 20 L 68 44 L 68 60 L 52 60 L 52 44 Z" fill="none" stroke="currentColor" stroke-width="0.9" opacity="0.5"/>`;
    [0, 0.6, 1.2, 1.8].forEach((d) => {
      r += `<circle r="2.6" fill="currentColor"><animateMotion dur="2.6s" begin="${d}s" repeatCount="indefinite" path="M 60 15 L 60 64"/><animate attributeName="opacity" values="0.2;1;1;0.2" keyTimes="0;0.3;0.7;1" dur="2.6s" begin="${d}s" repeatCount="indefinite"/></circle>`;
    });
    return wrap(r);
  },
};

function Illo({ name }: { name: string }) {
  const inner = ILLO[name]().split("currentColor").join("url(#webgrad)");
  return <div className="illo" dangerouslySetInnerHTML={{ __html: inner }} />;
}

/* ---- content ---- */
const STATS = [
  { v: "≤ 100", l: "PageSpeed-Ziel auf Mobile" },
  { v: "2 Wo.", l: "von Kickoff bis Live" },
  { v: "100%", l: "responsiv & barrierearm" },
  { v: "CH/EU", l: "Hosting & Datenschutz" },
];
const PAINS = [
  { illo: "fizzle", tag: "Hübsch, wirkungslos", title: "Schön gemacht — aber es kommt nichts rein", desc: "Die Seite sieht gut aus, doch das Telefon bleibt still. Ohne klare Conversion-Logik ist Design nur Dekoration.", v: "0", l: "Anfragen pro Woche" },
  { illo: "find", tag: "Unsichtbar", title: "Bei Google nicht zu finden", desc: "Wer Sie nicht kennt, findet Sie nicht. Ohne SEO-Grundlagen landet die Seite auf Seite drei — also nirgendwo.", v: "Seite 3", l: "im Suchergebnis" },
  { illo: "slow", tag: "Zu langsam", title: "Lädt zu lange, Besucher springen ab", desc: "Jede zusätzliche Sekunde Ladezeit kostet Besucher. Auf dem Handy entscheidet sich das in Millisekunden.", v: "53%", l: "Absprung bei >3s" },
  { illo: "stale", tag: "Veraltet", title: "Seit Jahren nicht angefasst, keiner pflegt sie", desc: "Die Seite ist eingefroren, weil niemand sie aktualisieren kann. Jede Änderung wird zum Projekt.", v: "Jahre", l: "ohne Update" },
];
const SERVICES = [
  { illo: "web", tag: "Landingpages", title: "Landingpages mit einem klaren Ziel", desc: "Eine Seite, eine Botschaft, eine Handlung. Gebaut für eine konkrete Dienstleistung oder Kampagne — und darauf optimiert, Anfragen auszulösen.", chips: ["Conversion-Logik", "Eine klare Aktion", "A/B-bereit"] },
  { illo: "device", tag: "Websites", title: "Mehrseitige Webauftritte", desc: "Der vollständige Auftritt für Ihr Unternehmen — sauber strukturiert, mehrsprachig wenn nötig, und so gebaut, dass Sie Inhalte selbst pflegen können.", chips: ["Responsive", "Selbst pflegbar", "Mehrsprachig"] },
  { illo: "rank", tag: "Sichtbarkeit", title: "Gefunden werden (SEO)", desc: "Technisch sauberes Fundament, lokale Sichtbarkeit und echte Performance. Damit Sie dort auftauchen, wo Ihre Kunden suchen.", chips: ["Technisches SEO", "Local SEO", "Core Web Vitals"] },
  { illo: "funnel", tag: "Conversion", title: "Anfragen automatisieren", desc: "Vom Klick zum Termin: Terminbuchung, smarte Formulare und Anbindung an Ihre Tools. Aus Besuchern werden qualifizierte Leads — ohne manuellen Aufwand.", chips: ["Terminbuchung", "Formulare", "CRM-Anbindung"] },
];
const PROCESS = [
  { t: "Verstehen", d: "Wir klären, wen Sie erreichen wollen und welche Handlung zählt — Anruf, Anfrage oder Termin. Ohne Ziel kein Design." },
  { t: "Konzipieren", d: "Struktur, Botschaft und Aufbau vor der Optik. Wir entwerfen den Weg, den ein Besucher bis zur Anfrage geht." },
  { t: "Bauen", d: "Schnell, responsiv und sauber umgesetzt — mit SEO-Grundlagen und Conversion-Elementen von Anfang an eingebaut." },
  { t: "Launchen & Optimieren", d: "Live gehen ist der Anfang. Wir messen, was funktioniert, und schärfen nach — damit aus Besuchern dauerhaft Anfragen werden." },
];
const REASONS = [
  { t: "Auf Conversion getrimmt, nicht auf Effekte", d: "Jedes Element hat einen Job: den Besucher näher an die Anfrage bringen. Schön ist Pflicht, Wirkung ist das Ziel." },
  { t: "Mobile-first & blitzschnell", d: "Über die Hälfte Ihrer Besucher kommt vom Handy. Wir bauen zuerst für mobil — und für Ladezeiten unter zwei Sekunden." },
  { t: "Selbst pflegbar", d: "Sie sollen Texte und Bilder selbst ändern können, ohne uns für jede Kleinigkeit zu brauchen. Unabhängigkeit ist Teil der Lieferung." },
  { t: "SEO ab Tag 1", d: "Saubere Technik, sinnvolle Struktur und schnelle Ladezeiten — die Grundlage, um überhaupt gefunden zu werden, ist eingebaut." },
  { t: "Schweiz-konform & DSGVO", d: "Datenschutz, Impressum und Hosting in der Schweiz oder EU. Rechtssicher, ohne dass Sie sich darum kümmern müssen." },
  { t: "Hosting & Wartung aus einer Hand", d: "Domain, Hosting, Updates und Ansprechpartner an einem Ort. Kein Ping-Pong zwischen drei Anbietern." },
];
const PACKAGES = [
  {
    name: "Landingpage", tag: "Eine Seite, ein Ziel", pop: false,
    feat: ["Eine fokussierte Seite", "Conversion-optimierter Aufbau", "Terminbuchung oder Formular", "Mobile-first & schnell", "SEO-Grundlagen", "Schweizer Hosting"],
  },
  {
    name: "Website", tag: "Ihr kompletter Auftritt", pop: true, badge: "Beliebt",
    feat: ["Mehrere Seiten (z. B. Leistungen, Über uns)", "Eigenes Design auf Ihre Marke", "Selbst pflegbares CMS", "On-Page-SEO inklusive", "Terminbuchung & Formulare", "Hosting & Wartung"],
  },
  {
    name: "Website + Wachstum", tag: "Auftritt, der mitarbeitet", pop: false,
    feat: ["Alles aus «Website»", "Laufende SEO-Betreuung", "Performance-Monitoring", "A/B-Tests & Optimierung", "Inhalts-Updates auf Wunsch", "Fester Ansprechpartner"],
  },
];
const FAQS = [
  { q: "Was kostet eine Website bei Ihnen?", a: "Das hängt vom Umfang ab. Eine fokussierte Landingpage ist deutlich günstiger als ein mehrsprachiger Webauftritt mit laufender Betreuung. Im kostenlosen Erstgespräch geben wir Ihnen einen konkreten, fixen Richtpreis — ohne Überraschungen." },
  { q: "Wie lange dauert es, bis meine Seite live ist?", a: "Eine Landingpage ist oft in ein bis zwei Wochen live. Ein grösserer Webauftritt dauert je nach Umfang und Inhalten drei bis sechs Wochen. Den Zeitplan legen wir direkt nach dem Erstgespräch gemeinsam fest." },
  { q: "Kann ich die Seite später selbst bearbeiten?", a: "Ja. Wir bauen so, dass Sie Texte, Bilder und Inhalte selbst aktualisieren können. Auf Wunsch zeigen wir Ihnen das in einem kurzen Onboarding — oder übernehmen die Pflege für Sie." },
  { q: "Kümmern Sie sich auch um Hosting und Domain?", a: "Ja, auf Wunsch komplett. Domain, Hosting in der Schweiz oder EU, technische Updates und Backups — alles aus einer Hand, mit einem festen Ansprechpartner." },
  { q: "Sorgt die Seite dafür, dass ich bei Google gefunden werde?", a: "Die technischen SEO-Grundlagen — saubere Struktur, schnelle Ladezeiten, mobile Optimierung — sind immer dabei. Für aktive Sichtbarkeit (Rankings für bestimmte Suchbegriffe) gibt es das Paket «Website + Wachstum» mit laufender Betreuung." },
  { q: "Ich habe schon eine Website. Lohnt sich ein Neubau?", a: "Nicht immer — manchmal reicht ein gezielter Relaunch oder eine zusätzliche Landingpage. Im Erstgespräch schauen wir uns Ihre aktuelle Seite ehrlich an und sagen Ihnen, was sich wirklich lohnt." },
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

const Webseiten = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.body.classList.add("ap-light");
    return () => document.body.classList.remove("ap-light");
  }, []);

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="ap ap-vivid ap-web" ref={rootRef}>
      {/* purple gradient definition for icons + illustrations */}
      <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="webgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#a87bff" />
            <stop offset="0.55" stopColor="#7b3fe4" />
            <stop offset="1" stopColor="#5b8def" />
          </linearGradient>
        </defs>
      </svg>

      <nav className="ap-nav">
        <div className={`ap-pill${scrolled ? " scrolled" : ""}`}>
          <a className="b" href="#top"><img className="brandmark" src="/Webseiten_logo.png" alt="" />Webseiten</a>
          <div className="links">
            <a href="#problem">Diagnose</a>
            <a href="#leistungen">Leistungen</a>
            <a href="#vorgehen">Vorgehen</a>
            <a href="#pakete">Pakete</a>
            <a href="#faq">FAQ</a>
          </div>
          <a className="cta" href="#kontakt">Erstgespräch</a>
          <button className="ap-burger" aria-label="Menü öffnen" onClick={() => setMobileOpen((o) => !o)}>≡</button>
        </div>
      </nav>
      <div className={`ap-mobile${mobileOpen ? " open" : ""}`}>
        <a href="#problem" onClick={() => setMobileOpen(false)}>Diagnose</a>
        <a href="#leistungen" onClick={() => setMobileOpen(false)}>Leistungen</a>
        <a href="#vorgehen" onClick={() => setMobileOpen(false)}>Vorgehen</a>
        <a href="#pakete" onClick={() => setMobileOpen(false)}>Pakete</a>
        <a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
        <a href="#kontakt" onClick={() => setMobileOpen(false)}>Erstgespräch</a>
      </div>

      <section className="ap-hero reveal" id="top">
        <div className="wrap">
          <div className="kick">Webseiten &amp; Landingpages für Schweizer KMU</div>
          <h1>Eine Website, die <span className="g">Anfragen bringt</span>.</h1>
          <p className="sub">Schön ist das Minimum. Wir bauen Auftritte, die aus Besuchern Kunden machen.</p>
          <div className="acts">
            <a className="p" href="#kontakt">Erstgespräch buchen</a>
            <a className="s" href="#vorgehen">So gehen wir vor ›</a>
          </div>
        </div>
      </section>

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
          <Shead k="Diagnose" h="Warum Ihre Website keine Anfragen bringt" intro="Eine Website ist kein digitaler Flyer. Diese vier Punkte hören wir immer wieder — und genau da setzen wir an." />
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
          <Shead k="Leistungen" h="Vom ersten Klick zur Anfrage." intro="Wir bauen nicht nur Seiten, die gut aussehen — sondern den ganzen Weg vom Besucher zum Kunden." />
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
            <a href="#kontakt">Erstgespräch buchen</a>
          </div>
        </div>
      </section>

      <section className="ap-sec">
        <div className="wide">
          <Shead k="Was immer dabei ist" h="Kein Schnickschnack. Nur, was wirkt." intro="Jede Seite, die wir bauen, bringt diese Grundlagen mit — ohne Aufpreis, ohne Diskussion." />
          <div className="ap-grid c2 reveal">
            {REASONS.map((r) => (
              <div className="ap-reason" key={r.t}>
                <span className="rc"><StrokeIcon name="check" color="url(#webgrad)" size={20} /></span>
                <div>
                  <h4>{r.t}</h4>
                  <p>{r.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ap-sec alt" id="pakete">
        <div className="wide">
          <Shead k="Pakete" h="Drei Wege, online sichtbar zu werden." intro="Vom fokussierten Einstieg bis zum Auftritt, der laufend für Sie arbeitet. Den fixen Richtpreis erhalten Sie im Erstgespräch." />
          <div className="ap-grid c3 reveal">
            {PACKAGES.map((p) => (
              <div className={`ap-card pkg${p.pop ? " pop" : ""}`} key={p.name}>
                {p.badge && <span className="badge">{p.badge}</span>}
                <div className="tag">{p.tag}</div>
                <h3>{p.name}</h3>
                <ul className="feat">
                  {p.feat.map((f) => (
                    <li key={f}><StrokeIcon name="check" color="url(#webgrad)" size={17} />{f}</li>
                  ))}
                </ul>
                <div className="pkg-foot">
                  <div className="pr">Fixer Richtpreis im Erstgespräch</div>
                  <a href="#kontakt">Paket besprechen ›</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ap-sec" id="kontakt">
        <div className="wide">
          <div className="ap-contact reveal">
            <div>
              <div className="ck">Kontakt · 30 Min unverbindlich</div>
              <h2>Reden wir über Ihre neue Website.</h2>
              <p className="lead-txt">30 Minuten, ehrlich und unverbindlich. Wir schauen uns Ihre Situation an und sagen offen, welche Lösung wirklich zu Ihnen passt — auch wenn das weniger ist, als Sie erwarten.</p>
              <ul className="ap-guar">
                <li><span className="gi"><StrokeIcon name="cal" color="url(#webgrad)" size={22} /></span>Termin direkt im Kalender wählen</li>
                <li><span className="gi"><StrokeIcon name="zap" color="url(#webgrad)" size={22} /></span>Konkreter Richtpreis statt Sales-Pitch</li>
                <li><span className="gi"><StrokeIcon name="chat" color="url(#webgrad)" size={22} /></span>Persönliche Antwort, kein Auto-Reply</li>
              </ul>
            </div>
            <div className="ap-cal">
              <div className="bar"><i /><i /><i /><span>cal.com / Erstgespräch</span></div>
              <CalEmbed className="ap-cal-host" />
            </div>
          </div>
        </div>
      </section>

      <section className="ap-sec alt" id="faq">
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
              <p style={{ maxWidth: "30ch", lineHeight: 1.6 }}>Webseiten und Landingpages für Schweizer KMU — gebaut, um Sichtbarkeit in Anfragen zu verwandeln.</p>
            </div>
            <div>
              <h4>Leistungen</h4>
              <a className="fl" href="#leistungen">Landingpages</a>
              <a className="fl" href="#leistungen">Websites</a>
              <a className="fl" href="#leistungen">SEO &amp; Sichtbarkeit</a>
            </div>
            <div>
              <h4>Mehr</h4>
              <a className="fl" href="#pakete">Pakete</a>
              <a className="fl" href="#faq">FAQ</a>
              <Link className="fl" to="/">Trending Media</Link>
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

export default Webseiten;
