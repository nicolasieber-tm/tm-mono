import { useEffect, useRef, useState } from "react";
import "./beforeafter.css";

/* Modul 2 — Vorher/Nachher-Slider (Verkehrsschule Mittelland) + Facts + Kundenstimme + CTA.
   Assets liegen in apps/sichtbarkeit/public. Das Buchungs-Widget-Script wird zentral in
   Index.tsx geladen; hier reicht der Button mit [data-book-widget]. */

const SECTIONS = [
  { key: "hero", label: "Startseite", before: "/referenz_verkehrsschule_hero_vorher.jpg", after: "/referenz_verkehrsschule_hero_nachher.jpg", cap: "Startseite: vom in die Jahre gekommenen Auftritt zu modern und klar" },
  { key: "angebote", label: "Angebote", before: "/referenz_verkehrsschule_angebote_vorher.jpg", after: "/referenz_verkehrsschule_angebote_nachher.jpg", cap: "Angebote: heute übersichtlich und direkt zugänglich" },
  { key: "ueberuns", label: "Über uns", before: "/referenz_verkehrsschule_ueberuns_vorher.jpg", after: "/referenz_verkehrsschule_ueberuns_nachher.jpg", cap: "Über uns: persönlicher, vertrauenswürdiger Auftritt" },
];

const FACTS = [
  { ic: "layout", t: "Moderner Auftritt & klarer Aufbau", d: "Aufgeräumtes, zeitgemässes Design mit klarer Struktur." },
  { ic: "funnel", t: "Nutzerführung optimiert", d: "Besucher werden gezielt zur Anfrage geführt, conversion-optimiert." },
  { ic: "cal", t: "Individuelle Terminbuchung", d: "Passendes Buchungs- und Kontaktangebot direkt eingebaut." },
  { ic: "search", t: "SEO-Grundlagen eingebaut", d: "Sauberes technisches Fundament, um gefunden zu werden." },
  { ic: "bolt", t: "Ladezeit optimiert", d: "Schnelle Ladezeiten, damit niemand abspringt." },
  { ic: "phone", t: "Mobile-first", d: "Zuerst fürs Handy gebaut, sauber auf jedem Bildschirm." },
];

const FACT_ICONS: Record<string, string> = {
  layout: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
  funnel: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2.5"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  phone: '<rect x="5" y="2" width="14" height="20" rx="2.5"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
};

export default function BeforeAfter() {
  const [active, setActive] = useState(0);
  const compareRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLDivElement>(null);
  const beforeInnerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);

  /* Slider-Interaktion, Auto-Sweep, Preload — einmalig beim Mount */
  useEffect(() => {
    const compare = compareRef.current;
    const before = beforeRef.current;
    const beforeInner = beforeInnerRef.current;
    const handle = handleRef.current;
    const range = rangeRef.current;
    if (!compare || !before || !beforeInner || !handle || !range) return;

    const setDivider = (p: number) => { before.style.width = p + "%"; handle.style.left = p + "%"; };
    const setPos = (p: number) => {
      p = Math.max(0, Math.min(100, p));
      setDivider(p);
      range.value = String(p);
    };
    const syncWidth = () => { beforeInner.style.width = compare.clientWidth + "px"; };
    const posFromX = (clientX: number) => {
      const r = compare.getBoundingClientRect();
      return ((clientX - r.left) / r.width) * 100;
    };

    let dragging = false;
    let sweepDone = false;
    const sweepTimers: number[] = [];
    const cancelSweep = () => {
      sweepDone = true;
      sweepTimers.forEach((t) => clearTimeout(t));
      sweepTimers.length = 0;
      compare.classList.remove("ba-anim");
    };
    const autoSweep = () => {
      if (sweepDone) return;
      if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) { sweepDone = true; return; }
      compare.classList.add("ba-anim");
      const seq = [66, 34, 50];
      const START = 450, STEP = 1150;
      seq.forEach((p, k) => sweepTimers.push(window.setTimeout(() => setDivider(p), START + k * STEP)));
      sweepTimers.push(window.setTimeout(() => compare.classList.remove("ba-anim"), START + seq.length * STEP));
    };

    const onDown = (e: PointerEvent) => { cancelSweep(); dragging = true; compare.setPointerCapture(e.pointerId); setPos(posFromX(e.clientX)); };
    const onMove = (e: PointerEvent) => { if (dragging) setPos(posFromX(e.clientX)); };
    const onUp = () => { dragging = false; };
    const onRange = () => { cancelSweep(); setPos(Number(range.value)); };

    compare.addEventListener("pointerdown", onDown);
    compare.addEventListener("pointermove", onMove);
    compare.addEventListener("pointerup", onUp);
    range.addEventListener("input", onRange);
    window.addEventListener("resize", syncWidth);
    syncWidth();
    setPos(50);

    /* alle 6 Screenshots vorladen → Tab-Wechsel ohne Flackern */
    SECTIONS.forEach((s) => [s.before, s.after].forEach((src) => { const im = new Image(); im.src = src; }));

    /* Drag-Hinweis beim Sichtbarwerden */
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (es) => es.forEach((e) => { if (e.isIntersecting && !sweepDone) { io?.disconnect(); autoSweep(); } }),
        { threshold: 0.6 }
      );
      io.observe(compare);
    } else {
      window.setTimeout(autoSweep, 500);
    }

    return () => {
      compare.removeEventListener("pointerdown", onDown);
      compare.removeEventListener("pointermove", onMove);
      compare.removeEventListener("pointerup", onUp);
      range.removeEventListener("input", onRange);
      window.removeEventListener("resize", syncWidth);
      sweepTimers.forEach((t) => clearTimeout(t));
      io?.disconnect();
    };
  }, []);

  const sec = SECTIONS[active];

  return (
    <>
      <div className="ba-tabs reveal">
        {SECTIONS.map((s, i) => (
          <button key={s.key} type="button" className={i === active ? "on" : ""} onClick={() => setActive(i)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="ba reveal">
        <div className="ba-card">
          <div className="ba-bar">
            <i /><i /><i />
            <span className="addr">verkehrsschule-mittelland.ch</span>
          </div>
          <div className="ba-compare" ref={compareRef}>
            <img className="ba-after" src={sec.after} alt="Nachher" />
            <div className="ba-before" ref={beforeRef}>
              <div className="ba-before-inner" ref={beforeInnerRef}>
                <img src={sec.before} alt="Vorher" />
              </div>
            </div>
            <span className="ba-label before">Vorher</span>
            <span className="ba-label after">Nachher</span>
            <div className="ba-handle" ref={handleRef}>
              <span className="grip" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 8 12 13 7" />
                  <polyline points="18 17 13 12 18 7" />
                </svg>
              </span>
            </div>
          </div>
          <div className="ba-ctrl">
            <span>← Vorher</span>
            <input className="ba-range" ref={rangeRef} type="range" min={0} max={100} defaultValue={50} aria-label="Vergleich Vorher/Nachher" />
            <span>Nachher →</span>
          </div>
        </div>
        <p className="ba-cap"><b>Verkehrsschule Mittelland</b> — {sec.cap}</p>
        <p className="ba-hint">Trennlinie ziehen · oben Bereich wechseln · Regler unten für Tastatur</p>
      </div>

      <p className="ba-facts-head reveal">Was der Relaunch bringt</p>
      <div className="ba-facts reveal">
        {FACTS.map((f) => (
          <div className="ba-fact" key={f.t}>
            <div className="ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: FACT_ICONS[f.ic] }} />
            </div>
            <h4>{f.t}</h4>
            <p>{f.d}</p>
          </div>
        ))}
      </div>

      <figure className="ba-quote reveal">
        <div className="qmark" aria-hidden="true">&ldquo;</div>
        <blockquote>
          Die Seite wirkt heute <span className="hl">viel professioneller und moderner</span> als vorher und das Feedback von Kunden ist durchwegs positiv. Sie wirkt vertrauenswürdiger und hat einen positiven Einfluss auf meine Sichtbarkeit und die Anfragen. Wer Wert auf eine unkomplizierte Zusammenarbeit legt, ist hier in guten Händen.
        </blockquote>
        <figcaption>
          <img className="q-avatar" src="/referenz_mehmet_bild.jpeg" alt="Mehmet" />
          <span className="q-who">
            <span className="q-name">Mehmet</span>
            <span className="q-role">Inhaber, Verkehrsschule Mittelland</span>
          </span>
          <a href="https://www.verkehrsschule-mittelland.ch/" target="_blank" rel="noopener" aria-label="Verkehrsschule Mittelland">
            <img className="q-logo" src="/referenz_verkehrsschule-mittelland_logo.png" alt="Verkehrsschule Mittelland" />
          </a>
        </figcaption>
      </figure>
    </>
  );
}
