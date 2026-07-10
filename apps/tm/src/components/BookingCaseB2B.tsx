import { useEffect, useRef, useState } from "react";
import "./bookingcase.css";

/* Buchungstool-Prozess-Story (B2B/fotograf-Case) — TM-Hauptseite.
   Vorher (hunderte Termine einzeln koordiniert, als Chat-Pingpong) → Nachher
   (ein Link, jede:r Mitarbeitende bucht selbst; echte Screenshots als Slider).
   Bewusst generisch gehalten (ein Fotograf mit Grosskunden); die namentliche
   Referenz läuft über die Kundenstimmen. Gegenstück – der web-Case – lebt in
   apps/sichtbarkeit. Screenshots liegen in apps/tm/public. */

const CHAT = [
  { s: "in", t: "Wir bräuchten Foto-Termine für 200 Mitarbeitende." },
  { s: "out", t: "Alles klar, schicken Sie mir die Verfügbarkeiten?" },
  { s: "in", t: "Anbei eine Excel-Liste mit 200 Namen…" },
  { s: "out", t: "Frau Meier kann doch nicht am Dienstag, neuer Vorschlag?" },
  { s: "in", t: "Können wir das per Telefon durchgehen?", meta: "Woche 2" },
];

const STEPS = [
  "Fotograf legt Zeitfenster fest, teilt einen Link",
  "Jede:r Mitarbeitende bucht selbst einen Slot",
  "Keine Excel-Listen, keine Rückfragen mehr",
];

const BEFORE_METRIC = [{ b: "Wochen", s: "Koordination pro Grosskunde" }, { b: "200+", s: "Mails & Anrufe" }];
const AFTER_METRIC = [{ b: "1 Link", s: "für den ganzen Betrieb" }, { b: "100%", s: "Self-Service" }];

const TOOLS = ["/referenz_buchung_b2b_1.jpg", "/referenz_buchung_b2b_2.jpg"];

const FACTS = [
  { ic: "link", t: "Ein Link für alle", d: "Der Kunde teilt einen Link an den ganzen Betrieb." },
  { ic: "users", t: "Self-Service", d: "Jede:r Mitarbeitende bucht selbst einen freien Slot." },
  { ic: "table", t: "Keine Excel-Listen", d: "Keine manuelle Koordination hunderter Termine." },
  { ic: "calcheck", t: "Echtzeit-Verfügbarkeit", d: "Belegte Zeiten sind gesperrt, keine Doppelbuchung." },
];

const FACT_ICONS: Record<string, string> = {
  link: '<path d="M9 15l6-6"/><path d="M11 6l1-1a4 4 0 0 1 6 6l-2 2"/><path d="M13 18l-1 1a4 4 0 0 1-6-6l2-2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="8" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="10" x2="9" y2="20"/>',
  calcheck: '<rect x="3" y="4" width="18" height="18" rx="2.5"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><path d="M9 15l2 2 4-4"/>',
};

export default function BookingCaseB2B() {
  const [chatIn, setChatIn] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  /* Chat-Staffelung erst starten, wenn er wirklich im Blick ist (eigener Observer,
     höherer Threshold als der globale reveal-Observer in Index.tsx). */
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setChatIn(true); return; }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { setChatIn(true); io.disconnect(); } }),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Tool-Slider: Auto-Advance (3.8s), Pause bei Hover, respektiert reduced-motion. */
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (i: number) => setSlide((i + TOOLS.length) % TOOLS.length);

  useEffect(() => {
    if (paused) return;
    const reduce = typeof window !== "undefined" && window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = window.setInterval(() => setSlide((s) => (s + 1) % TOOLS.length), 3800);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <>
      <div className="bk-split reveal">
        <div className="bk-side before">
          <div className="bk-tag">Vorher</div>
          <h3>Hunderte Termine, einzeln koordiniert</h3>
          <div className={`bk-chat${chatIn ? " play" : ""}`} ref={chatRef}>
            {CHAT.map((m, i) => (
              <div className={`bk-msg ${m.s}`} key={i} style={{ animationDelay: `${i * 0.5}s` }}>
                {m.t}
                {m.meta && <span className="meta">{m.meta}</span>}
              </div>
            ))}
          </div>
          <div className="bk-metric">
            {BEFORE_METRIC.map((m) => (
              <div className="m" key={m.s}><b>{m.b}</b><span>{m.s}</span></div>
            ))}
          </div>
        </div>

        <div className="bk-side after">
          <div className="bk-tag">Nachher</div>
          <h3>Ein Link an die Firma</h3>
          <div className="bk-steps">
            {STEPS.map((t, i) => (
              <div className="bk-step" key={t}><span className="n">{i + 1}</span><span>{t}</span></div>
            ))}
          </div>
          <div className="bk-tool">
            <div className="bar"><i /><i /><i /><span className="addr">buchung.fotograf.ch/grosskunde-ag</span></div>
            <div className="bk-slider" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
              {TOOLS.map((src, i) => (
                <img className={`bk-slide${i === slide ? " on" : ""}`} src={src} alt={`Buchungsansicht ${i + 1}`} loading="lazy" key={src} />
              ))}
              <button type="button" className="bk-nav prev" aria-label="Vorherige Ansicht" onClick={() => go(slide - 1)}>‹</button>
              <button type="button" className="bk-nav next" aria-label="Nächste Ansicht" onClick={() => go(slide + 1)}>›</button>
              <div className="bk-dots">
                {TOOLS.map((_, i) => (
                  <button type="button" className={`bk-dot${i === slide ? " on" : ""}`} aria-label={`Ansicht ${i + 1}`} onClick={() => go(i)} key={i} />
                ))}
              </div>
            </div>
          </div>
          <div className="bk-metric">
            {AFTER_METRIC.map((m) => (
              <div className="m" key={m.s}><b>{m.b}</b><span>{m.s}</span></div>
            ))}
          </div>
        </div>
      </div>

      <p className="bk-cap reveal"><b>So sieht&apos;s aus:</b> Ein Link, den hunderte Mitarbeitende selbst nutzen.</p>

      <p className="bk-facts-head reveal">Was der eine Link bringt</p>
      <div className="bk-facts reveal">
        {FACTS.map((f) => (
          <div className="bk-fact" key={f.t}>
            <div className="ic" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: FACT_ICONS[f.ic] }} />
            </div>
            <h4>{f.t}</h4>
            <p>{f.d}</p>
          </div>
        ))}
      </div>
    </>
  );
}
