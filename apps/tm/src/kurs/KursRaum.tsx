import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";
import { StrokeIcon } from "@/components/site/blocks";
import EmailAutoCase from "@/components/EmailAutoCase";
import { KURS, LEKTIONEN, PROMPT_OFFERTE, UMSETZUNG, WOCHEN, type KursVideo, type Lektion } from "@/data/kurs";
import { BOOK_HREF, WIDGET_KURS, type BookingPrefill } from "@/lib/booking";
import { kursEvent, type Teilnehmer } from "./api";
import { useNoindex } from "./noindex";
import "@/pages/nische.css";
import "./kurs.css";

/* =================================================================
   Kursseite (nicht öffentlich, ohne Login): /kurs/k/<token>/<lektion>

   Der Token im Link identifiziert den Teilnehmer. Jeder Lektionsaufruf
   wird gemeldet (kurs_events); wer Lektion 4 oder 5 öffnet und nicht
   gebucht hat, löst in der Edge Function einen Telegram-Alert aus.
   Unten steht auf jeder Lektion der Button für den Automations-Check.
   ================================================================= */

/** 13110 → "13'110" */
const chf = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
const vorname = (name?: string) => (name || "").trim().split(/\s+/)[0] || "";

/* ---- Video: Platzhalter, bis es gedreht ist; danach Klick-zum-Laden ---- */
function Video({ video, lektion, onStart }: { video?: KursVideo; lektion: Lektion; onStart: () => void }) {
  const [play, setPlay] = useState(false);
  useEffect(() => setPlay(false), [lektion.nr]);

  if (!video) {
    return (
      <div className="ku-video ku-video-soon">
        <div>
          <span className="ap-feat-ic"><StrokeIcon name="camera" color="url(#tmgrad)" size={26} /></span>
          <b>Das Video zu dieser Lektion folgt in Kürze.</b>
          <span>Die wichtigsten Inhalte finden Sie schon jetzt unten als Text.</span>
        </div>
      </div>
    );
  }
  const src =
    video.provider === "youtube"
      ? `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`
      : `https://player.vimeo.com/video/${video.id}?autoplay=1&dnt=1`;
  return (
    <div className="ku-video">
      {play ? (
        <iframe src={src} title={lektion.titel} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      ) : (
        <button type="button" className="ku-play" onClick={() => { setPlay(true); onStart(); }}>
          <span className="ku-play-ic" aria-hidden>▶</span>
          <span className="ku-play-t">Lektion {lektion.nr} abspielen · {lektion.dauer}</span>
          <span className="ku-play-n">Beim Abspielen wird das Video von {video.provider === "youtube" ? "YouTube" : "Vimeo"} geladen.</span>
        </button>
      )}
    </div>
  );
}

/* ---- Lektion 1: die drei Aufgaben ---- */
function Aufgaben({ werte, onSave }: { werte: string[]; onSave: (a: string[]) => Promise<void> }) {
  const [a, setA] = useState<string[]>(() => [0, 1, 2].map((i) => werte[i] ?? ""));
  const [status, setStatus] = useState<"" | "speichert" | "ok" | "fehler">("");
  useEffect(() => { setA([0, 1, 2].map((i) => werte[i] ?? "")); }, [werte]);

  return (
    <form
      className="ku-box ku-aufgaben"
      onSubmit={async (e) => {
        e.preventDefault();
        setStatus("speichert");
        try { await onSave(a.map((x) => x.trim()).filter(Boolean)); setStatus("ok"); }
        catch { setStatus("fehler"); }
      }}
    >
      <div className="ku-box-k">Ihre Hausaufgabe</div>
      <h3>Die drei nervigsten wiederkehrenden Aufgaben</h3>
      <p>Wir merken sie uns für Sie. Sie tauchen im Rechner in Lektion 4 und beim Check wieder auf.</p>
      {a.map((v, i) => (
        <label key={i}>
          <span>{i + 1}.</span>
          <input
            value={v}
            maxLength={300}
            placeholder={["z. B. Wochenrapporte nachtragen", "z. B. Offerten schreiben und nachfassen", "z. B. Mails sortieren und beantworten"][i]}
            onChange={(e) => { const n = [...a]; n[i] = e.target.value; setA(n); setStatus(""); }}
          />
        </label>
      ))}
      <div className="ku-box-acts">
        <button className="ku-btn" type="submit" disabled={status === "speichert"}>{status === "speichert" ? "Speichert …" : "Aufgaben speichern"}</button>
        {status === "ok" && <span className="ku-ok"><StrokeIcon name="check" size={16} /> Gespeichert</span>}
        {status === "fehler" && <span className="cb-err">Speichern hat nicht geklappt. Bitte nochmals versuchen.</span>}
      </div>
    </form>
  );
}

/* ---- Lektion 2: Prompt zum Kopieren ---- */
function PromptBox() {
  const [kopiert, setKopiert] = useState(false);
  return (
    <div className="ku-box ku-prompt">
      <div className="ku-box-k">Prompt zum Kopieren</div>
      <pre>{PROMPT_OFFERTE}</pre>
      <div className="ku-box-acts">
        <button
          type="button"
          className="ku-btn"
          onClick={async () => {
            try { await navigator.clipboard.writeText(PROMPT_OFFERTE); setKopiert(true); setTimeout(() => setKopiert(false), 2500); } catch { /* egal */ }
          }}
        >
          {kopiert ? "Kopiert ✓" : "Prompt kopieren"}
        </button>
        <a className="ku-link" href="https://chatgpt.com" target="_blank" rel="noopener">ChatGPT öffnen ›</a>
      </div>
    </div>
  );
}

/* ---- Lektion 4: Rechner ---- */
function Rechner({ aufgaben, onUse }: { aufgaben: string[]; onUse: (v: Record<string, number>) => void }) {
  const namen = [0, 1, 2].map((i) => aufgaben[i] || `Aufgabe ${i + 1}`);
  const [std, setStd] = useState([2, 1.5, 1]);
  const [ansatz, setAnsatz] = useState(95);
  const proWoche = std.reduce((s, x) => s + x, 0);
  const franken = proWoche * ansatz * WOCHEN;

  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current) return;
    const t = setTimeout(() => onUse({ stunden: proWoche, ansatz, franken: Math.round(franken) }), 1500);
    return () => clearTimeout(t);
  }, [proWoche, ansatz, franken, onUse]);

  return (
    <div className="ni-calc ku-calc">
      <div className="ni-calc-in">
        {namen.map((n, i) => (
          <label className="ni-field" key={i}>
            <span className="lbl">{n}<small> · Stunden pro Woche</small></span>
            <span className="val">{std[i].toString().replace(".", ",")} Std.</span>
            <input
              type="range" min={0} max={10} step={0.5} value={std[i]}
              onChange={(e) => { touched.current = true; const s = [...std]; s[i] = Number(e.target.value); setStd(s); }}
            />
          </label>
        ))}
        <label className="ni-field">
          <span className="lbl">Ihr Stundenansatz</span>
          <span className="val">CHF {ansatz}</span>
          <input type="range" min={60} max={180} step={5} value={ansatz}
            onChange={(e) => { touched.current = true; setAnsatz(Number(e.target.value)); }} />
        </label>
      </div>
      <div className="ni-calc-out" aria-live="polite">
        <span className="k">Wert dieser Zeit pro Jahr</span>
        <b>CHF {chf(franken)}</b>
        <span className="h">{proWoche.toString().replace(".", ",")} Std. pro Woche · {chf(proWoche * WOCHEN)} Std. pro Jahr</span>
        <p>So viel Arbeitszeit steckt jedes Jahr in diesen drei Aufgaben. Nicht alles lässt sich automatisieren, aber oft ein grosser Teil davon.</p>
        <small>{proWoche.toString().replace(".", ",")} Std. × CHF {ansatz} × {WOCHEN} Wochen. Eine Schätzung, keine Garantie.</small>
      </div>
    </div>
  );
}

/* ---- Lektion 5: was zur Umsetzung gehört ---- */
function Umsetzung() {
  return (
    <div className="ku-umsetzung">
      {UMSETZUNG.map((u, i) => (
        <div className="ap-card" key={u.t}>
          <div className="ni-step">
            <span className="ap-feat-ic"><StrokeIcon name={u.ic} color="url(#tmgrad)" size={22} /></span>
            <span className="no">{String(i + 1).padStart(2, "0")}</span>
          </div>
          <h3>{u.t}</h3>
          <p>{u.d}</p>
        </div>
      ))}
    </div>
  );
}

/* ---- immer unten: Automations-Check ---- */
function CheckCta({ aufgaben, onClick }: { aufgaben: string[]; onClick: () => void }) {
  const [kopiert, setKopiert] = useState(false);
  const text = aufgaben.map((a, i) => `${i + 1}. ${a}`).join("\n");
  return (
    <div className="ku-check" id="check">
      <div>
        <div className="ku-box-k">Kostenlos · 20 Minuten · per Video-Call</div>
        <h2>Lohnt sich eine Automation bei Ihnen?</h2>
        <p>
          Im Automations-Check schauen wir uns Ihre drei Aufgaben gemeinsam an. Sie erfahren, welche sich automatisieren lässt,
          was sie bringt und was die Umsetzung bedeutet. Wenn sich nichts lohnt, sage ich Ihnen das ehrlich.
        </p>
        {aufgaben.length > 0 && (
          <div className="ku-check-tasks">
            <b>Ihre Aufgaben für das Buchungsformular</b>
            <ol>{aufgaben.map((a) => <li key={a}>{a}</li>)}</ol>
            <button
              type="button"
              className="ku-link"
              onClick={async () => { try { await navigator.clipboard.writeText(text); setKopiert(true); } catch { /* egal */ } }}
            >
              {kopiert ? "Kopiert ✓" : "In die Zwischenablage kopieren"}
            </button>
          </div>
        )}
      </div>
      <div className="ku-check-act">
        <a className="cb-submit" href={BOOK_HREF} onClick={onClick}>20-Minuten-Check buchen →</a>
        <span>Keine Verpflichtung, keine Folgekosten.</span>
      </div>
    </div>
  );
}

export default function KursRaum() {
  const { token = "", nr } = useParams();
  const n = Math.min(5, Math.max(1, Number(nr) || 1));
  const lektion = LEKTIONEN[n - 1];
  const [tn, setTn] = useState<Teilnehmer | null>(null);
  const [fehler, setFehler] = useState(false);
  const [gesehen, setGesehen] = useState<number[]>([]);
  useNoindex();

  // Lektion öffnen = Ereignis melden; die Antwort liefert die Teilnehmerdaten
  useEffect(() => {
    let alive = true;
    kursEvent(token, "lektion", n, { via: new URLSearchParams(window.location.search).get("m") ? "mail" : "web" })
      .then((r) => {
        if (!alive) return;
        if (!r.ok) { setFehler(true); return; }
        setTn((alt) => alt ?? r);
        setGesehen((g) => Array.from(new Set([...(r.lektionen ?? []), ...g, n])));
      })
      .catch((e) => {
        if (!alive) return;
        // 404 = unbekannter Token; sonst (Netzwerk o. Ä.) den Kurs trotzdem zeigen
        if ((e as { status?: number }).status === 404) setFehler(true);
        else setTn((alt) => alt ?? { ok: true });
      });
    return () => { alive = false; };
  }, [token, n]);

  // Mobile: aktive Lektion in der horizontal scrollbaren Tab-Leiste sichtbar machen
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".ku-tabs");
    const on = nav?.querySelector<HTMLElement>("a.on");
    if (nav && on && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = on.offsetLeft - 24;
  }, [n]);

  // Link aus der Mail mit #book-widget: SiteLayout öffnet die Buchung, wir zählen den Klick
  useEffect(() => {
    if (window.location.hash === "#book-widget") kursEvent(token, "check_klick", n, { via: "mail" }).catch(() => {});
  }, [token, n]);

  const aufgaben = tn?.aufgaben ?? [];
  const speichern = async (a: string[]) => {
    const r = await kursEvent(token, "aufgaben", 1, { aufgaben: a });
    setTn((t) => ({ ...(t ?? { ok: true }), aufgaben: r.aufgaben ?? a }));
  };
  const onRechner = useCallback((v: Record<string, number>) => { kursEvent(token, "rechner", 4, v).catch(() => {}); }, [token]);
  const onCheck = () => { kursEvent(token, "check_klick", n).catch(() => {}); };

  if (!/^[0-9a-f]{32}$/.test(token)) return <Navigate to="/kurs" replace />;
  if (nr && String(n) !== nr) return <Navigate to={`/kurs/k/${token}/${n}`} replace />;

  if (fehler) {
    return (
      <SiteLayout title="Minikurs · Trending Media" widgetId={WIDGET_KURS} slimNav={{ links: [] }}>
        <section className="ap-hero ap-hero-sub">
          <div className="wrap">
            <div className="kick">Minikurs</div>
            <h1>Dieser Kurslink ist <span className="g">nicht gültig.</span></h1>
            <p className="sub">Vielleicht wurde er beim Kopieren abgeschnitten. Melden Sie sich einfach nochmals an, wir schicken Ihnen den Link erneut.</p>
            <div className="acts"><Link className="p" to="/kurs">Zur Anmeldung</Link></div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  const vn = vorname(tn?.name);
  // Buchungs-Widget: Name, E-Mail, Firma und die drei Aufgaben sind schon bekannt
  const prefill: BookingPrefill | undefined = tn?.name
    ? {
        name: tn.name,
        email: tn.email,
        antworten: {
          firma: tn.firma ?? "",
          aufgabe: aufgaben.map((a, i) => `${i + 1}. ${a}`).join("\n"),
        },
      }
    : undefined;

  return (
    <SiteLayout
      title={`Lektion ${n}: ${lektion.titel} · Minikurs`}
      widgetId={WIDGET_KURS}
      bookingPrefill={prefill}
      slimNav={{ links: [], cta: { label: "Check buchen", href: BOOK_HREF } }}
    >
      <section className="ku-room">
        <div className="wrap">
          <div className="ku-room-head">
            <div className="kick">{vn ? `Hallo ${vn} · ` : ""}Ihr Minikurs</div>
            <nav className="ku-tabs" aria-label="Lektionen">
              {LEKTIONEN.map((l) => (
                <Link
                  key={l.nr}
                  to={`/kurs/k/${token}/${l.nr}`}
                  className={`${l.nr === n ? "on" : ""}${gesehen.includes(l.nr) ? " seen" : ""}`}
                  aria-current={l.nr === n ? "page" : undefined}
                >
                  <span className="d">{gesehen.includes(l.nr) && l.nr !== n ? <StrokeIcon name="check" size={14} /> : l.nr}</span>
                  <span className="t">{l.titel}</span>
                </Link>
              ))}
            </nav>
          </div>

          <article className="ku-lesson" key={n}>
            <Video video={lektion.video} lektion={lektion} onStart={() => kursEvent(token, "video_start", n).catch(() => {})} />
            <div className="ku-lesson-body">
              <div className="meta">Lektion {n} von 5 · {lektion.dauer}</div>
              <h1>{lektion.titel}</h1>
              {lektion.text.map((t) => <p key={t}>{t}</p>)}
            </div>

            {lektion.extra === "aufgaben" && <Aufgaben werte={aufgaben} onSave={speichern} />}
            {lektion.extra === "prompt" && <PromptBox />}
            {lektion.extra === "demo" && (
              <div className="ku-demo">
                <EmailAutoCase compact />
                <p className="ku-demo-link"><Link to="/kundenstimmen/kohler-elektro">Ganze Fallstudie Kohler Elektro lesen ›</Link></p>
              </div>
            )}
            {lektion.extra === "rechner" && <Rechner aufgaben={aufgaben} onUse={onRechner} />}
            {lektion.extra === "umsetzung" && <Umsetzung />}

            {lektion.aufgabe && (
              <div className="ku-next-task">
                <StrokeIcon name="file" color="url(#tmgrad)" size={22} />
                <p><b>Bis zur nächsten Lektion:</b> {lektion.aufgabe}</p>
              </div>
            )}

            <div className="ku-pager">
              {n > 1 ? <Link to={`/kurs/k/${token}/${n - 1}`}>‹ Lektion {n - 1}</Link> : <span />}
              {n < 5 && <Link className="nx" to={`/kurs/k/${token}/${n + 1}`}>Weiter zu Lektion {n + 1} ›</Link>}
            </div>
          </article>

          <CheckCta aufgaben={aufgaben} onClick={onCheck} />

          <p className="ku-foot-note">
            Fragen zum Kurs? Antworten Sie einfach auf eine der Kurs-Mails oder schreiben Sie an{" "}
            <a href={`mailto:${KURS.person.mail}`}>{KURS.person.mail}</a>.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
