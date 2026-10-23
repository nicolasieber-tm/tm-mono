import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";
import { ContactSection, FaqSection, Illo, PageHero, Shead, StrokeIcon, n2 } from "@/components/site/blocks";
import EmailAutoCase from "@/components/EmailAutoCase";
import { CALLBACK_HREF, CallbackDialog } from "@/components/site/Callback";
import { BOOK_HREF } from "@/lib/booking";
import { track } from "@/lib/track";
import { findCase } from "@/data/cases";
import type { Nische } from "@/data/nischen";
import "./nische.css";

/* =================================================================
   Vorlage für Branchen-Landingpages (/handwerk, später z. B.
   /handwerk/elektro). Inhalte kommen komplett aus src/data/nischen/.

   Reihenfolge laut Briefing: Hero → Probleme → Referenz → Lösung →
   Rechner → Vorgehen → FAQ → Kontakt. Die Seite ist in erster Linie
   Vertrauensbeweis (wird nach Cold Mail / Telefonat verschickt), erst
   in zweiter Linie Buchungsinstrument.
   ================================================================= */

/** 55000 → "55'000" (Schweizer Schreibweise) */
const chf = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");

function Calculator({ n, onUse }: { n: Nische; onUse: (v: Record<string, number>) => void }) {
  const c = n.calc;
  const [people, setPeople] = useState(c.defaults.people);
  const [minutes, setMinutes] = useState(c.defaults.minutes);
  const [rate, setRate] = useState(c.defaults.rate);
  const hours = (people * minutes * c.days) / 60;
  const cost = hours * rate;

  // Nutzung melden: einmal kurz nach der letzten Änderung, nicht bei jedem Schritt
  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current) return;
    const t = setTimeout(() => onUse({ people, minutes, rate, cost: Math.round(cost) }), 1500);
    return () => clearTimeout(t);
  }, [people, minutes, rate, cost, onUse]);

  const fields = [
    { id: "people", label: c.peopleLabel, v: people, set: setPeople, min: 1, max: 60, step: 1, unit: "" },
    { id: "minutes", label: "Minuten pro Tag und Person für Rapporte, Nachtragen, Suchen", v: minutes, set: setMinutes, min: 0, max: 60, step: 5, unit: " Min." },
    { id: "rate", label: "Stundenansatz", v: rate, set: setRate, min: 60, max: 180, step: 5, unit: "", pre: "CHF " },
  ];

  return (
    <div className="ni-calc reveal">
      <div className="ni-calc-in">
        {fields.map((f) => (
          <label className="ni-field" key={f.id}>
            <span className="lbl">{f.label}</span>
            <span className="val">{f.pre}{f.v}{f.unit}</span>
            <input
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={f.v}
              onChange={(e) => { touched.current = true; f.set(Number(e.target.value)); }}
            />
          </label>
        ))}
      </div>
      <div className="ni-calc-out" aria-live="polite">
        <span className="k">Admin-Kosten pro Jahr</span>
        <b>CHF {chf(cost)}</b>
        <span className="h">{chf(hours)} Stunden pro Jahr</span>
        <p>{c.resultText}</p>
        <div className="ni-calc-acts">
          <a className="ni-btn" href={BOOK_HREF}>Erstgespräch buchen</a>
          <a className="ni-alt" href={CALLBACK_HREF}>oder Rückruf anfordern</a>
        </div>
        <small>
          {people} × {minutes} Min. × {c.days} Tage = {chf(hours)} Stunden × CHF {rate}. Die Berechnung ist eine Schätzung und keine Garantie.
        </small>
      </div>
    </div>
  );
}

export default function NischePage({ n }: { n: Nische }) {
  const source = `tm-${n.slug}`;
  const kase = findCase(n.proof.caseSlug);
  const t = kase?.t;
  const phone = n.contact.person.phone;

  // Seitenaufruf + Klicks auf Buchung, Telefon, Mail und Fallstudie
  useEffect(() => {
    track(source, "page_view");
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.("a");
      if (!el) return;
      const section = el.closest("section")?.id || "seite";
      const href = el.getAttribute("href") || "";
      if (el.dataset.cta) track(source, "cta_click", { cta_id: el.dataset.cta });
      else if (href === BOOK_HREF) track(source, "cta_click", { cta_id: `booking_${section}` });
      else if (href.startsWith("tel:")) track(source, "cta_click", { cta_id: `phone_${section}` });
      else if (href === CALLBACK_HREF) track(source, "cta_click", { cta_id: `callback_${section}` });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [source]);

  const used = useRef(false);
  const onCalcUse = useRef((v: Record<string, number>) => {
    track(source, used.current ? "calc_change" : "calc_use", v);
    used.current = true;
  }).current;

  return (
    <SiteLayout
      title={n.meta.title}
      description={n.meta.description}
      slimNav={{ links: [{ to: "/kundenstimmen", label: "Kundenstimmen" }], phone }}
    >
      <PageHero
        kick={n.hero.kick}
        title={<>{n.hero.title} <span className="g">{n.hero.titleAccent}</span></>}
        sub={n.hero.sub}
        secondary={{ label: "Rückruf anfordern", href: CALLBACK_HREF }}
      >
        <p className="ni-calc-link"><a href="#rechner">Was kostet mich der Admin heute? ›</a></p>
        {phone && (
          <p className="ni-phone">
            Lieber direkt anrufen? <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
          </p>
        )}
        <div className="ap-trust ni-trust">
          {n.hero.trust.map((x) => (
            <div className="t-item" key={x.t}>
              <StrokeIcon name={x.ic} size={22} />
              <div className="t-txt"><b>{x.t}</b><span>{x.d}</span></div>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="ap-sec" id="probleme">
        <div className="wide">
          <Shead k={n.pains.kick} h={n.pains.h} intro={n.pains.intro} />
          <div className="ap-grid c4 reveal">
            {n.pains.items.map((p) => (
              <div className="ap-card" key={p.title}>
                <Illo name={p.illo} />
                <div className="tag">{p.tag}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {kase && (
        <section className="ap-sec alt" id="referenz">
          <div className="wide">
            <Shead k={n.proof.kick} h={n.proof.h} />
            <div className="ni-proof reveal">
              <div className="ni-proof-num">
                {t?.logo && <img className="logo" src={t.logo} alt={t.company} />}
                <b>{n.proof.metric}</b>
                <span className="lbl">{n.proof.metricLabel}</span>
                <span className="yr">{n.proof.yearly}</span>
              </div>
              {t && (
                <figure className="ni-proof-quote">
                  <span className="qm" aria-hidden>“</span>
                  <blockquote dangerouslySetInnerHTML={{ __html: t.quote }} />
                  <figcaption>
                    {t.photo && <img src={t.photo} alt={t.name} width={56} height={56} loading="lazy" />}
                    <div><b>{t.name}</b><span>{t.role}</span></div>
                  </figcaption>
                </figure>
              )}
            </div>
            {t?.before && t.after && (
              <div className="cs-ba reveal">
                <div className="col"><span className="k">Vorher</span><span className="v">{t.before}</span></div>
                <span className="arrow" aria-hidden>→</span>
                <div className="col"><span className="k">Heute</span><span className="v">{t.after}</span></div>
              </div>
            )}
            <p className="ni-flow-cap reveal">So funktioniert die Automation</p>
            <div className="ni-proof-flow">
              <EmailAutoCase compact />
            </div>
            <div className="ap-cta reveal" style={{ marginTop: 0 }}>
              <Link to={`/kundenstimmen/${kase.slug}`} data-cta="fallstudie">Ganze Fallstudie lesen →</Link>
            </div>
          </div>
        </section>
      )}

      <section className="ap-sec" id="loesung">
        <div className="wide">
          <Shead k={n.modules.kick} h={n.modules.h} intro={n.modules.intro} />
          <ol className="ni-flow reveal">
            {n.modules.items.map((m, i) => (
              <li className="ap-card" key={m.title}>
                <div className="ni-step">
                  <span className="ap-feat-ic"><StrokeIcon name={m.ic} color="url(#tmgrad)" size={24} /></span>
                  <span className="no">{n2(i)} · {m.step}</span>
                </div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
                <div className="ni-result">
                  <StrokeIcon name="check" color="url(#tmgrad)" size={18} />
                  <span>{m.result}</span>
                </div>
                {m.proven && <span className="ni-proven">{m.proven}</span>}
              </li>
            ))}
          </ol>
          <div className="ni-integration reveal">
            <b>{n.modules.integration}</b>
            {n.modules.integrationSub && <p>{n.modules.integrationSub}</p>}
          </div>
        </div>
      </section>

      <section className="ap-sec alt" id="rechner">
        <div className="wide">
          <Shead k={n.calc.kick} h={n.calc.h} intro={n.calc.intro} />
          <Calculator n={n} onUse={onCalcUse} />
        </div>
      </section>

      <section className="ap-sec" id="vorgehen">
        <div className="wide">
          <Shead k={n.process.kick} h={n.process.h} />
          <div className="ap-grid c4 reveal">
            {n.process.items.map((s, i) => (
              <div className="ap-card" key={s.t}>
                <div className="ap-num">{n2(i)}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection faqs={n.faqs} />

      <ContactSection
        title={n.contact.title}
        lead={n.contact.lead}
        person={n.contact.person}
        callback
        guarantees={[
          { ic: "cal", t: "Termin direkt im Kalender wählen" },
          { ic: "check", t: "Ehrliche Einschätzung, ob sich eine Automation lohnt" },
          { ic: "chat", t: "Persönlich, ohne Verkaufsdruck" },
        ]}
      />
      <CallbackDialog onSubmitted={() => track(source, "callback_submit")} />
    </SiteLayout>
  );
}
