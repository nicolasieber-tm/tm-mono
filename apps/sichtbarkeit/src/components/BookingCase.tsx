import { useEffect, useRef, useState } from "react";
import "./bookingcase.css";

/* Modul 3 (web-Case) — Buchungstool auf der Website: vom Termin-Pingpong zum einen Link.
   Vorher (E-Mail-/Telefon-Pingpong als Chat) → Nachher (Self-Service-Buchung, echter
   Screenshot referenz_buchung_web.png) + Fakten. Screenshot liegt in apps/sichtbarkeit/public.
   Bewusst generisch (keine Kundennamen); die namentliche Referenz (Sandro Dubach) läuft über
   die Kundenstimmen/Testimonials. Gegenstück – der fotograf/B2B-Case – lebt in apps/tm. */

const CHAT = [
  { s: "in",  t: "Guten Tag, hätten Sie nächste Woche Zeit für einen Termin?" },
  { s: "out", t: "Gerne! Wie wäre Dienstag 14 Uhr?" },
  { s: "in",  t: "Da kann ich leider nicht. Donnerstag?" },
  { s: "out", t: "Donnerstag bin ich ausgebucht. Freitag früh?" },
  { s: "in",  t: "Können Sie mich kurz anrufen?", meta: "3 Tage später" },
];

const STEPS = [
  "Buchungstool ist in die Website integriert",
  "Kunde wählt selbst einen freien Slot",
  "Bestätigung & Kalendereintrag automatisch",
];

const BEFORE_METRIC = [{ b: "~5 Tage", s: "bis ein Termin steht" }, { b: "10+", s: "Nachrichten pro Termin" }];
const AFTER_METRIC = [{ b: "30 Sek.", s: "bis gebucht" }, { b: "0", s: "manuelle Nachrichten" }];

const FACTS = [
  { ic: "clock", t: "Rund um die Uhr buchbar", d: "Kunden buchen selbst, auch abends und am Wochenende." },
  { ic: "bolt", t: "Kein Termin-Pingpong", d: "Schluss mit E-Mail- und Telefon-Hin-und-Her." },
  { ic: "embed", t: "In die Website integriert", d: "Nahtlos im eigenen Auftritt, keine externe Seite." },
  { ic: "check", t: "Automatische Bestätigung", d: "Kalendereintrag und Erinnerung laufen von selbst." },
  { ic: "sync", t: "Direkte Kalenderintegration", d: "Mit Ihrem Kalender synchronisiert, es werden nur tatsächlich freie Termine angezeigt." },
];

const FACT_ICONS: Record<string, string> = {
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
  bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  embed: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/>',
  sync: '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
};

export default function BookingCase() {
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

  return (
    <>
      <div className="bk-split reveal">
        <div className="bk-side before">
          <div className="bk-tag">Vorher</div>
          <h3>E-Mail- &amp; Telefon-Pingpong</h3>
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
          <h3>Direkt auf der Website buchen</h3>
          <div className="bk-steps">
            {STEPS.map((t, i) => (
              <div className="bk-step" key={t}><span className="n">{i + 1}</span><span>{t}</span></div>
            ))}
          </div>
          <div className="bk-tool">
            <div className="bar"><i /><i /><i /><span className="addr">ihre-webseite.ch</span></div>
            <div className="shot"><img src="/referenz_buchung_web.png" alt="Buchungsansicht: freien Termin wählen" loading="lazy" /></div>
          </div>
          <div className="bk-metric">
            {AFTER_METRIC.map((m) => (
              <div className="m" key={m.s}><b>{m.b}</b><span>{m.s}</span></div>
            ))}
          </div>
        </div>
      </div>

      <p className="bk-cap reveal"><b>So sieht&apos;s aus:</b> Buchungstool, nahtlos in die Website integriert.</p>

      <p className="bk-facts-head reveal">Was das Buchungstool bringt</p>
      <div className="bk-facts cols3 reveal">
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

      <div className="bk-cta reveal">
        <h3>Am besten selbst ausprobieren.</h3>
        <p>Klicken Sie sich durch das echte Tool — einmal als Kunde, der einen Termin bucht, und einmal als Admin, der die Buchungen verwaltet.</p>
        <div className="bk-cta-acts">
          <a className="cta-btn" href="/demo">Live-Demo öffnen →</a>
          <button type="button" className="cta-btn ghost" data-book-widget="">Termin buchen →</button>
        </div>
      </div>
    </>
  );
}
