import { Link, useParams } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";
import { StrokeIcon } from "@/components/site/blocks";
import { BOOK_HREF } from "@/lib/booking";
import { findCase, publishedCases, type CaseVisual } from "@/data/cases";
import { CaseCard } from "./Kundenstimmen";
import BeforeAfter from "@/landingpages/BeforeAfter";
import BookingCase from "@/landingpages/BookingCase";
import BookingCaseB2B from "@/components/BookingCaseB2B";
import EmailAutoCase from "@/components/EmailAutoCase";
import NotFound from "./NotFound";

function Visual({ v }: { v: CaseVisual }) {
  switch (v.kind) {
    case "beforeafter": return <BeforeAfter withQuote={false} />;
    case "booking": return <BookingCase />;
    case "emailauto": return <EmailAutoCase />;
    case "b2b": return <BookingCaseB2B />;
    case "placeholder": return <div className="ap-shot-ph reveal">{v.text}</div>;
  }
}

/* Weiterführende Links pro Kategorie */
const NEXT: Record<string, { to: string; label: string }> = {
  web: { to: "/landingpages", label: "Landingpages & Websites ansehen" },
  auto: { to: "/automationen", label: "Automationen & Software ansehen" },
  oco: { to: "/oneclick-office", label: "OneClick Office ansehen" },
};

export default function Kundenstimme() {
  const { slug = "" } = useParams();
  const c = findCase(slug);
  if (!c) return <NotFound />;
  const t = c.t;
  const others = publishedCases().filter((o) => o.slug !== c.slug).slice(0, 2);

  return (
    <SiteLayout
      title={`${t?.company ?? c.slug}: ${c.title} · Trending Media`}
      description={c.sub}
    >
      <section className="cs-hero ap-hero reveal" id="top">
        <div className="wrap">
          <Link className="cs-back" to="/kundenstimmen">← Alle Kundenstimmen</Link>
          <div className="cs-brand">
            {t?.logo && <img src={t.logo} alt={t.company} />}
            <span className="ks-tag">{c.label}</span>
          </div>
          <h1>{c.title}</h1>
          <p className="sub">{c.sub}</p>
          <div className="cs-facts">
            <div><span className="k">Kunde</span>{t?.website
              ? <a className="v" href={t.website} target="_blank" rel="noopener">{t.company} ↗</a>
              : <span className="v">{t?.company}</span>}</div>
            <div><span className="k">Branche</span><span className="v">{c.industry}</span></div>
            <div><span className="k">Leistung</span><span className="v">{c.service}</span></div>
            <div>
              <span className="k">{c.metric ? "Resultat" : "Status"}</span>
              <span className="v">{c.metric ? `${c.metric.value} ${c.metric.label}` : c.status ?? "Live"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ap-sec" style={{ paddingTop: 70 }}>
        <div className="wrap">
          <div className="cs-story">
            <div className="cs-block reveal">
              <span className="k">Ausgangslage</span>
              <h2>{c.challenge.title}</h2>
              {c.challenge.text.map((p) => <p key={p}>{p}</p>)}
            </div>
            <div className="cs-block reveal">
              <span className="k">Lösung</span>
              <h2>{c.solution.title}</h2>
              {c.solution.text.map((p) => <p key={p}>{p}</p>)}
              {c.solution.points && (
                <ul>
                  {c.solution.points.map((p) => (
                    <li key={p}><StrokeIcon name="check" color="url(#tmgrad)" size={18} />{p}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="cs-block reveal">
              <span className="k">Resultat</span>
              <h2>{c.result.title}</h2>
              {c.result.text.map((p) => <p key={p}>{p}</p>)}
            </div>
          </div>
          {c.result.stats && (
            <div className="cs-result reveal" style={{ marginTop: 44 }}>
              {c.result.stats.map((s) => (
                <div className="r" key={s.label}><b>{s.value}</b><span>{s.label}</span></div>
              ))}
            </div>
          )}
        </div>
      </section>

      {t && (
        <section className="ap-sec alt">
          <div className="wrap">
            <figure className="cs-quote reveal">
              <span className="qm" aria-hidden>&ldquo;</span>
              <blockquote dangerouslySetInnerHTML={{ __html: t.quote }} />
              <figcaption>
                {t.photo && <img src={t.photo} alt={t.name} />}
                <span><b>{t.name}</b><span>{t.role}</span></span>
              </figcaption>
              {(t.before || t.after) && (
                <div className="cs-ba">
                  <div className="col"><span className="k">Vorher</span><span className="v">{t.before}</span></div>
                  <span className="arrow">→</span>
                  <div className="col"><span className="k">Heute</span><span className="v">{t.after}</span></div>
                </div>
              )}
            </figure>
          </div>
        </section>
      )}

      {c.visual && (
        <section className="ap-sec">
          <div className="wide">
            <div className="ap-shead reveal" style={{ marginBottom: 44 }}>
              <div className="kick">So sieht es aus</div>
              <h2>Die Lösung im Detail.</h2>
            </div>
            <Visual v={c.visual} />
          </div>
        </section>
      )}

      <section className="ap-sec alt">
        <div className="wide">
          <div className="ap-band reveal">
            <h2>Ähnliche Situation in Ihrem Betrieb?</h2>
            <p>In 30 Minuten schauen wir gemeinsam, wo bei Ihnen der grösste Hebel liegt. Kostenlos und unverbindlich.</p>
            <div className="acts">
              <a className="w" href={BOOK_HREF}>Erstgespräch buchen</a>
              <Link className="g" to={NEXT[c.category].to}>{NEXT[c.category].label}</Link>
            </div>
          </div>
          {c.note && <p className="cs-note" style={{ marginTop: 28 }}>{c.note}</p>}
        </div>
      </section>

      {others.length > 0 && (
        <section className="ap-sec">
          <div className="wide">
            <div className="ap-shead reveal" style={{ marginBottom: 40 }}>
              <div className="kick">Weitere Kundenstimmen</div>
              <h2>Mehr aus der Praxis.</h2>
            </div>
            <div className="ks-grid">
              {others.map((o) => <CaseCard key={o.slug} c={o} />)}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
