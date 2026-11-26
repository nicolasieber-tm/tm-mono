import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";
import { FaqSection, Shead, StrokeIcon, n2 } from "@/components/site/blocks";
import { KURS, LEKTIONEN } from "@/data/kurs";
import { WIDGET_KURS } from "@/lib/booking";
import { track } from "@/lib/track";
import { anmelden } from "./api";
import "./kurs.css";

/* =================================================================
   Landingpage des Minikurses (trendingmedia.ch/kurs).

   Reihenfolge laut Briefing: Headline mit Nutzen → Zielgruppe → die fünf
   Lektionen in je einem Satz → kurzes Wer-bin-ich mit Foto → Formular
   (Name, E-Mail, Firma, optional Branche). Das Formular steht zusätzlich
   gleich im Hero, damit niemand scrollen muss.
   ================================================================= */

const SOURCE = "tm-kurs";

type State = "form" | "sending" | "done" | "error";

function Anmeldung({ id, onDone }: { id: string; onDone?: () => void }) {
  const [state, setState] = useState<State>("form");
  const [err, setErr] = useState("");
  const [token, setToken] = useState<string | undefined>();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) {
      setErr("Bitte eine gültige E-Mail-Adresse angeben.");
      return;
    }
    setErr("");
    setState("sending");
    try {
      const res = await anmelden({
        name: String(f.get("name") || ""),
        email,
        firma: String(f.get("firma") || ""),
        branche: String(f.get("branche") || "") || undefined,
        website: String(f.get("website") || ""),
      });
      setToken(res.token);
      setState("done");
      track(SOURCE, "signup", { form: id });
      onDone?.();
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status === 400) setErr("Bitte prüfen Sie Ihre Angaben: Name, E-Mail und Firma sind nötig.");
      setState(status === 400 ? "form" : "error");
    }
  }

  if (state === "done") {
    return (
      <div className="ku-form ku-done" aria-live="polite">
        <span className="ap-feat-ic"><StrokeIcon name="mail" color="url(#tmgrad)" size={26} /></span>
        <h3>Geschafft, Lektion 1 ist unterwegs.</h3>
        <p>Schauen Sie in Ihr Postfach. Falls nichts ankommt, lohnt sich ein Blick in den Spam-Ordner.</p>
        {token && (
          <Link className="ku-btn" to={`/kurs/k/${token}/1`}>Direkt mit Lektion 1 starten →</Link>
        )}
      </div>
    );
  }

  return (
    <form className="ku-form" onSubmit={submit} id={id}>
      <div className="ku-form-k">Kostenlos · 5 Lektionen · sofort freigeschaltet</div>
      <h3>Jetzt Kurs starten</h3>
      <label>
        <span>Vor- und Nachname</span>
        <input name="name" autoComplete="name" required minLength={2} maxLength={120} />
      </label>
      <label>
        <span>E-Mail</span>
        <input name="email" type="email" inputMode="email" autoComplete="email" required maxLength={200} />
      </label>
      <label>
        <span>Firma</span>
        <input name="firma" autoComplete="organization" required minLength={2} maxLength={160} />
      </label>
      <label>
        <span>Branche <em>(optional)</em></span>
        <select name="branche" defaultValue="">
          <option value="">Bitte wählen</option>
          {KURS.branchen.map((b) => <option key={b}>{b}</option>)}
        </select>
      </label>
      {/* Honeypot: für Menschen unsichtbar */}
      <input className="cb-hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {err && <p className="cb-err">{err}</p>}
      {state === "error" && (
        <p className="cb-err">Das hat leider nicht geklappt. Bitte versuchen Sie es nochmals oder schreiben Sie an {KURS.person.mail}.</p>
      )}
      <button className="cb-submit" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Wird gesendet …" : "Kostenlos anmelden"}
      </button>
      <small>
        Kein Spam, Abmeldung mit einem Klick. Details in der <Link to="/datenschutz#minikurs">Datenschutzerklärung</Link>.
      </small>
    </form>
  );
}

export default function KursLanding() {
  useEffect(() => { track(SOURCE, "page_view"); }, []);

  return (
    <SiteLayout
      title={KURS.meta.title}
      description={KURS.meta.description}
      widgetId={WIDGET_KURS}
      slimNav={{ links: [{ to: "/kundenstimmen", label: "Kundenstimmen" }], cta: { label: "Kurs starten", href: "#anmelden" } }}
    >
      <section className="ap-hero ku-hero" id="top">
        <div className="wide">
          <div className="ku-hero-grid">
            <div className="ku-hero-txt reveal">
              <div className="kick">{KURS.hero.kick}</div>
              <h1>{KURS.hero.title} <span className="g">{KURS.hero.titleAccent}</span></h1>
              <p className="sub">{KURS.hero.sub}</p>
              <ul className="ku-bullets">
                {KURS.hero.bullets.map((b) => (
                  <li key={b}><StrokeIcon name="check" color="url(#tmgrad)" size={20} />{b}</li>
                ))}
              </ul>
              <div className="ku-mini-person">
                <img src={KURS.person.img} alt={KURS.person.name} width={44} height={44} />
                <span>Mit <b>{KURS.person.name}</b>, {KURS.person.role}</span>
              </div>
            </div>
            <div className="ku-hero-form reveal" id="anmelden">
              <Anmeldung id="hero" />
            </div>
          </div>
        </div>
      </section>

      <section className="ap-sec alt" id="fuer-wen">
        <div className="wide">
          <Shead k={KURS.zielgruppe.kick} h={KURS.zielgruppe.h} />
          <div className="ku-grid3 reveal">
            {KURS.zielgruppe.items.map((z) => (
              <div className="ap-card" key={z.t}>
                <span className="ap-feat-ic"><StrokeIcon name={z.ic} color="url(#tmgrad)" size={24} /></span>
                <h3>{z.t}</h3>
                <p>{z.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ap-sec" id="lektionen">
        <div className="wrap">
          <Shead k="Die 5 Lektionen" h="Fünf Lektionen. Gut eine halbe Stunde." intro="Alle Lektionen sind sofort freigeschaltet. Schauen Sie alles an einem Abend oder lassen Sie sich jeden Tag per E-Mail an die nächste Lektion erinnern." />
          <ol className="ku-lessons reveal">
            {LEKTIONEN.map((l, i) => (
              <li key={l.nr}>
                <span className="no">{n2(i)}</span>
                <div>
                  <div className="meta">{l.dauer} Video</div>
                  <h3>{l.titel}</h3>
                  <p>{l.satz}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="ap-sec alt" id="ueber-mich">
        <div className="wrap">
          <div className="ku-person reveal">
            <img src={KURS.person.img} alt={KURS.person.name} width={180} height={180} loading="lazy" />
            <div>
              <div className="kick">Wer den Kurs macht</div>
              <h2>{KURS.person.name}</h2>
              {KURS.person.text.map((t) => <p key={t}>{t}</p>)}
              <div className="ku-proof">
                <b>+ CHF 2'000 bis 3'000</b>
                <span>pro Monat zusätzlich verrechnet bei Kohler Elektro Bern AG. <Link to="/kundenstimmen/kohler-elektro">Fallstudie lesen ›</Link></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FaqSection faqs={KURS.faqs} alt={false} />

      <section className="ap-sec alt" id="start">
        <div className="wrap">
          <Shead k="Kostenlos starten" h="In einer halben Stunde wissen Sie, was KI in Ihrem Betrieb bringt." />
          <div className="ku-end-form reveal">
            <Anmeldung id="ende" />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
