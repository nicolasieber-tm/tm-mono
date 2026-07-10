import { useEffect, useRef, useState } from "react";
import "./bookingcase.css";

/* E-Mail-Automation-Case (Kohler Elektro Bern / Beat Gerber) — TM-Hauptseite.
   Vorher: Zeiten von Hand den Projekten zugeordnet, oft nur geschätzt →
   verrechenbare Leistungen gingen verloren. Nachher: eine Automation erkennt
   die Projektnummer direkt aus der E-Mail und rapportiert die Zeit automatisch
   dem richtigen Projekt (+CHF 2'000–3'000/Monat, echte Kundenstimme).
   Bewusst generisch (Projektnr./Betreff/Zeit sind Illustration); die namentliche
   Referenz läuft über die Kundenstimmen. Kernzahl ist echt.
   Darstellung: stilisierter animierter Flow (kein echter Screenshot nötig),
   im selben Karten-/Token-Stil wie BookingCaseB2B (bookingcase.css). */

const FACTS = [
  { ic: "scan", t: "Erkennt das Projekt", d: "Die Projektnummer wird direkt aus Betreff und Text jeder E-Mail gelesen." },
  { ic: "clock", t: "Rapportiert automatisch", d: "Die aufgewendete Zeit landet beim richtigen Projekt, ganz ohne Nachtragen." },
  { ic: "shield", t: "Nichts geht verloren", d: "Keine geschätzten Zeiten mehr, keine vergessene verrechenbare Leistung." },
  { ic: "coins", t: "Zahlt sich sofort aus", d: "Rund CHF 2'000–3'000 mehr pro Monat, nach kurzer Zeit amortisiert." },
];

const FACT_ICONS: Record<string, string> = {
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="3" y1="12" x2="21" y2="12"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  shield: '<path d="M12 3l7 3v6c0 4.4-3 7.5-7 9-4-1.5-7-4.6-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
  coins: '<circle cx="8" cy="8" r="5"/><path d="M18.1 6.4a5 5 0 0 1 0 9.2"/><path d="M14.9 17.6a5 5 0 0 1-2.9.9"/>',
};

export default function EmailAutoCase() {
  const [play, setPlay] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Flow-Staffelung erst starten, wenn der Frame wirklich im Blick ist
     (eigener Observer, höherer Threshold als der globale reveal in Index.tsx). */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setPlay(true); return; }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { setPlay(true); io.disconnect(); } }),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div className="ea-wrap reveal">
        <div className="ea-before">
          <span className="ea-before-tag">Vorher</span>
          Zeiten von Hand dem Projekt zugeordnet, oft nur geschätzt — verrechenbare Leistungen gingen verloren.
        </div>

        <div className="ea-tool">
          <div className="bar"><i /><i /><i /><span className="addr">Automation · E-Mail → Projektzeit</span></div>

          <div className={`ea-flow${play ? " play" : ""}`} ref={ref}>
            {/* 1 — E-Mail kommt rein */}
            <div className="ea-step ea-mail" style={{ animationDelay: "0s" }}>
              <div className="ea-mail-head">
                <span className="ea-ic ea-ic-mail" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
                </span>
                <div className="ea-mail-meta"><b>Bauleitung Kunde AG</b><span>Rückfrage Verteiler UG</span></div>
              </div>
              <p className="ea-mail-body">…kurze Rückmeldung zum <mark>Auftrag 2024-087</mark>, wie besprochen. Die Materialliste hänge ich an…</p>
            </div>

            <div className="ea-conn" style={{ animationDelay: ".4s" }}><span>erkennt die Projektnummer</span></div>

            {/* 2 — Projektnummer erkannt */}
            <div className="ea-step ea-badge" style={{ animationDelay: ".8s" }}>
              <span className="ea-ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="3" y1="12" x2="21" y2="12" /></svg>
              </span>
              Projekt <b>#2024-087</b> erkannt
            </div>

            <div className="ea-conn" style={{ animationDelay: "1.2s" }}><span>rapportiert die Zeit</span></div>

            {/* 3 — Zeit automatisch gebucht */}
            <div className="ea-step ea-booked" style={{ animationDelay: "1.6s" }}>
              <span className="ea-ic" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              </span>
              <div className="ea-booked-txt">
                <span><b>0.75 h</b> dem Projekt gebucht</span>
                <span className="ea-ok">✓ automatisch verrechnet</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`ea-metric${play ? " play" : ""}`}>
          <b>+ CHF 2'000–3'000</b>
          <span>pro Monat zusätzlich verrechnet, statt geschätzt</span>
        </div>
      </div>

      <p className="bk-cap reveal"><b>So läuft&apos;s:</b> Jede relevante E-Mail landet als exakte Zeit beim richtigen Projekt — vollautomatisch.</p>

      <p className="bk-facts-head reveal">Was die Automation bringt</p>
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
