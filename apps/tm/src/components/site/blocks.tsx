import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { BOOK_HREF } from "@/lib/booking";

/* =================================================================
   Gemeinsame Bausteine aller Seiten (Icons, Illustrationen, Section-Kopf,
   FAQ, Seiten-Hero, Kontakt-Block). Farbe kommt immer über den
   TM-Verlauf (#tmgrad bzw. var(--grad)).
   ================================================================= */

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
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  phone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  call: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin: '<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
};

export function StrokeIcon({ name, color = "currentColor", size = 24 }: { name: string; color?: string; size?: number }) {
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
      aria-hidden
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
  /* — Landingpages — */
  webFizzle() {
    let r = "";
    ([[30, 22, 0], [55, 16, .6], [80, 24, 1.2], [45, 32, 1.8], [70, 36, .3]] as const).forEach(([x, y, d]) => {
      r += `<g transform="translate(${x} ${y})"><path d="M 0 -5 L 1.2 -1.2 L 5 0 L 1.2 1.2 L 0 5 L -1.2 1.2 L -5 0 L -1.2 -1.2 Z" fill="currentColor"><animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="${d}s" repeatCount="indefinite"/></path></g>`;
    });
    r += `<rect x="20" y="58" width="80" height="3" rx="1.5" fill="currentColor" opacity="0.15"/>`;
    r += `<rect x="20" y="58" height="3" rx="1.5" fill="currentColor"><animate attributeName="width" values="0;55;55;0" keyTimes="0;0.55;0.7;1" dur="3.5s" repeatCount="indefinite"/></rect>`;
    return wrap(r);
  },
  find() {
    let r = `<circle cx="50" cy="34" r="15" fill="none" stroke="currentColor" stroke-width="1" opacity="0.55"/>`;
    r += `<line x1="61" y1="45" x2="74" y2="58" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.65"/>`;
    [28, 34, 40].forEach((y, i) => {
      const w = [20, 13, 17][i];
      r += `<rect x="40" y="${y}" height="3" rx="1.5" fill="currentColor" opacity="0.7"><animate attributeName="width" values="0;${w};${w};0" keyTimes="0;0.35;0.8;1" dur="3.4s" begin="${(i * 0.3).toFixed(1)}s" repeatCount="indefinite"/></rect>`;
    });
    return wrap(r);
  },
  slow() {
    let r = `<circle cx="60" cy="30" r="13" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.18"/>`;
    r += `<path d="M 60 17 A 13 13 0 0 1 73 30" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 60 30" to="360 60 30" dur="2.6s" repeatCount="indefinite"/></path>`;
    r += `<rect x="26" y="58" width="68" height="3" rx="1.5" fill="currentColor" opacity="0.15"/>`;
    r += `<rect x="26" y="58" height="3" rx="1.5" fill="currentColor" opacity="0.6"><animate attributeName="width" values="0;18;28;40" keyTimes="0;0.4;0.7;1" dur="4s" repeatCount="indefinite"/></rect>`;
    return wrap(r);
  },
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
  webPage() {
    let r = `<rect x="10" y="12" width="100" height="56" rx="2.5" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.5"/><line x1="10" y1="24" x2="110" y2="24" stroke="currentColor" stroke-width="0.6" opacity="0.4"/>`;
    ([[30, 70, 0], [40, 55, .4], [50, 65, .8]] as const).forEach(([y, m, d]) => {
      r += `<rect x="18" y="${y}" height="4" rx="1" fill="currentColor" opacity="0.7"><animate attributeName="width" values="0;${m};${m};0" keyTimes="0;0.4;0.85;1" dur="4s" begin="${d}s" repeatCount="indefinite"/></rect>`;
    });
    r += `<rect x="18" y="58" width="22" height="5" rx="2.5" fill="currentColor"/>`;
    return wrap(r);
  },
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

export function Illo({ name }: { name: string }) {
  const inner = ILLO[name]().split("currentColor").join("url(#tmgrad)");
  return <div className="illo" dangerouslySetInnerHTML={{ __html: inner }} />;
}

export const n2 = (i: number) => String(i + 1).padStart(2, "0");

/* ---- Section-Kopf ---- */
export function Shead({ k, h, intro }: { k: string; h: string; intro?: string }) {
  return (
    <div className="ap-shead reveal">
      <div className="kick">{k}</div>
      <h2>{h}</h2>
      {intro && <p className="intro">{intro}</p>}
    </div>
  );
}

/* ---- FAQ ---- */
export type Faq = { q: string; a: string };

function FaqItem({ f, open, onToggle }: { f: Faq; open: boolean; onToggle: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.style.maxHeight = open ? `${el.scrollHeight}px` : "0";
  }, [open]);
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button className="faq-q" onClick={onToggle} aria-expanded={open}>
        <span>{f.q}</span>
        <span className="qx">+</span>
      </button>
      <div className="faq-a" ref={ref}>
        <div className="faq-a-in">{f.a}</div>
      </div>
    </div>
  );
}

export function FaqSection({ faqs, alt = true }: { faqs: Faq[]; alt?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className={`ap-sec${alt ? " alt" : ""}`} id="faq">
      <div className="wrap">
        <Shead k="FAQ" h="Häufige Fragen." />
        <div className="ap-faq reveal">
          {faqs.map((f, i) => (
            <FaqItem key={f.q} f={f} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- Hero für Unterseiten (kleiner als der Startseiten-Hero) ---- */
export function PageHero({
  logo,
  kick,
  title,
  sub,
  primary = { label: "Erstgespräch buchen", href: BOOK_HREF },
  secondary,
  children,
}: {
  logo?: string;
  kick: string;
  title: ReactNode;
  sub?: string;
  primary?: { label: string; href: string; external?: boolean } | null;
  secondary?: { label: string; href: string };
  children?: ReactNode;
}) {
  return (
    <section className="ap-hero ap-hero-sub reveal" id="top">
      <div className="wrap">
        {logo && <img className="hero-logo" src={logo} alt="" />}
        <div className="kick">{kick}</div>
        <h1>{title}</h1>
        {sub && <p className="sub">{sub}</p>}
        {(primary || secondary) && (
          <div className="acts">
            {primary && (
              <a className="p" href={primary.href} {...(primary.external ? { target: "_blank", rel: "noopener" } : {})}>{primary.label}</a>
            )}
            {secondary && <a className="s" href={secondary.href}>{secondary.label} ›</a>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

/* ---- Kontakt / Erstgespräch ---- */
const GUARANTEES = [
  { ic: "cal", t: "Termin direkt im Kalender wählen" },
  { ic: "check", t: "Konkrete Einschätzung statt Sales-Pitch" },
  { ic: "chat", t: "Persönliche Antwort, kein Auto-Reply" },
];

export function ContactSection({
  title = "Lassen Sie uns über Ihre Reibungsverluste sprechen.",
  lead = "30 Minuten, ehrlich und unverbindlich. Wir analysieren Ihre Situation und sagen offen, ob und wo wir der richtige Partner sind.",
  guarantees = GUARANTEES,
  person,
  callback = false,
  alt = false,
}: {
  title?: string;
  lead?: string;
  guarantees?: { ic: string; t: string }[];
  /** Ansprechperson mit Foto unter den Garantien (Branchenseiten) */
  person?: { name: string; role: string; img: string; mail: string; phone?: string };
  /** zweiter Weg neben der Buchung: Rückruf anfordern (CallbackDialog muss auf der Seite sein) */
  callback?: boolean;
  alt?: boolean;
}) {
  return (
    <section className={`ap-sec${alt ? " alt" : ""}`} id="kontakt">
      <div className="wide">
        <div className="ap-contact reveal">
          <div>
            <div className="ck">Kontakt · 30 Min unverbindlich</div>
            <h2>{title}</h2>
            <p className="lead-txt">{lead}</p>
            <ul className="ap-guar">
              {guarantees.map((g) => (
                <li key={g.t}><span className="gi"><StrokeIcon name={g.ic} color="url(#tmgrad)" size={22} /></span>{g.t}</li>
              ))}
            </ul>
            {person && (
              <div className="ap-person">
                <img src={person.img} alt={person.name} width={64} height={64} loading="lazy" />
                <div>
                  <b>{person.name}</b>
                  <span className="role">{person.role}</span>
                  <div className="links">
                    {person.phone && (
                      <a href={`tel:${person.phone.replace(/\s/g, "")}`} data-cta="phone_kontakt">
                        <StrokeIcon name="call" size={16} /> {person.phone}
                      </a>
                    )}
                    <a href={`mailto:${person.mail}`} data-cta="mail_kontakt">
                      <StrokeIcon name="mail" size={16} /> {person.mail}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="ap-book">
            <div className="ap-book-ic"><StrokeIcon name="cal" color="url(#tmgrad)" size={28} /></div>
            <h3>Direkt zum Termin.</h3>
            <p className="ap-book-sub">Freien Slot wählen, die Bestätigung kommt sofort in Ihr Postfach.</p>
            <div className="ap-book-facts">
              <span>30 Minuten</span>
              <span>Per Video-Call</span>
              <span>Kostenlos</span>
            </div>
            <a className="ap-book-cta" href={BOOK_HREF}>Erstgespräch buchen →</a>
            <div className="ap-book-note">Keine Verpflichtung, keine Folgekosten.</div>
            {callback && (
              <div className="ap-book-alt">
                <span>Lieber persönlich am Telefon?</span>
                <a href="#rueckruf"><StrokeIcon name="call" size={16} /> Rückruf anfordern</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Verlinkte Kachel (Leistungen, Produkte, Weiterlesen) ---- */
export function LinkCard({
  to,
  external,
  illo,
  logo,
  tag,
  title,
  desc,
  chips,
  go,
}: {
  to: string;
  external?: boolean;
  illo?: string;
  logo?: string;
  tag?: string;
  title: string;
  desc: string;
  chips?: string[];
  go: string;
}) {
  const inner = (
    <>
      {illo && <Illo name={illo} />}
      {logo && <img className="lc-logo" src={logo} alt="" />}
      {tag && <div className="tag">{tag}</div>}
      <h3>{title}</h3>
      <p>{desc}</p>
      {chips && <div className="chips">{chips.map((x) => <span key={x}>{x}</span>)}</div>}
      <span className="lc-go">{go} <StrokeIcon name="arrow" size={16} /></span>
    </>
  );
  return external ? (
    <a className="ap-card ap-linkcard" href={to} target="_blank" rel="noopener">{inner}</a>
  ) : (
    <Link className="ap-card ap-linkcard" to={to}>{inner}</Link>
  );
}

/* ---- Screenshot-Galerie mit Tabs (Produktansichten) ---- */
export type Shot = { label: string; src: string; alt: string };

export function ShotTabs({ shots, addr }: { shots: Shot[]; addr?: string }) {
  const [i, setI] = useState(0);
  return (
    <div className="ap-shots reveal">
      <div className="t-filter">
        {shots.map((s, k) => (
          <button type="button" key={s.src} className={k === i ? "on" : undefined} onClick={() => setI(k)}>{s.label}</button>
        ))}
      </div>
      <div className="ap-shot">
        <div className="ap-shot-bar"><i /><i /><i />{addr && <span>{addr}</span>}</div>
        <img src={shots[i].src} alt={shots[i].alt} loading="lazy" />
      </div>
    </div>
  );
}
