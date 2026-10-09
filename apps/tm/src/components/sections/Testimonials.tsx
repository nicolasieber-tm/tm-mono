import { useState } from "react";
import {
  TESTIMONIALS,
  CLIENT_LOGOS,
  PRODUCT_LABEL,
  type ClientLogo,
  type Testimonial,
  type TestimonialProduct,
} from "@tm/testimonials";

/** Startseite ohne markierte Highlights: so viele Karten sofort zeigen */
const DEFAULT_VISIBLE = 6;

/** Alle Kundenlogos: aus den Stimmen + reine Logo-Kunden, je Firma einmal */
function allLogos(): ClientLogo[] {
  const seen = new Set<string>();
  const out: ClientLogo[] = [];
  const fromQuotes = TESTIMONIALS.filter((t) => t.logo).map((t) => ({
    company: t.company || t.name,
    logo: t.logo!,
    website: t.website,
  }));
  for (const c of [...fromQuotes, ...CLIENT_LOGOS]) {
    if (seen.has(c.company)) continue;
    seen.add(c.company);
    out.push(c);
  }
  return out;
}

function LogoBand() {
  const logos = allLogos();
  if (logos.length === 0) return null;
  return (
    <div className="t-logos reveal">
      <p className="t-logos-k">Unternehmen, die mit uns arbeiten</p>
      <ul>
        {logos.map((c) => (
          <li key={c.company}>
            {c.website ? (
              <a href={c.website} target="_blank" rel="noopener" aria-label={c.company}>
                <img src={c.logo} alt={c.company} loading="lazy" style={c.height ? { height: c.height } : undefined} />
              </a>
            ) : (
              <img src={c.logo} alt={c.company} loading="lazy" style={c.height ? { height: c.height } : undefined} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function Card({ t }: { t: Testimonial }) {
  const avatar = t.photo ? (
    <img className="t-avatar" src={t.photo} alt={t.name} />
  ) : (
    <div className="t-avatar">{initials(t.name)}</div>
  );

  const logoImg = t.logo ? (
    <img className="t-logo" src={t.logo} alt={t.company || t.name} />
  ) : null;

  const brand = t.logo ? (
    <div className="t-brand">
      {t.website ? (
        <a href={t.website} target="_blank" rel="noopener" aria-label={t.company || t.name}>
          {logoImg}
        </a>
      ) : (
        logoImg
      )}
    </div>
  ) : t.logoPending ? (
    <div className="t-brand t-brand-ph" title="Logo folgt">
      {t.company || t.name}
    </div>
  ) : null;

  const body = (
    <>
      <div className="t-head">
        <span className="t-quotemark">&ldquo;</span>
        <span className="t-tag">{t.tag || PRODUCT_LABEL[t.product] || ""}</span>
        {brand}
      </div>
      <p className="t-quote" dangerouslySetInnerHTML={{ __html: t.quote }} />
      {(t.before || t.after) && (
        <div className="t-ba">
          <div className="col before">
            <span className="k">Vorher</span>
            <span className="v">{t.before || ""}</span>
          </div>
          <span className="arrow">→</span>
          <div className="col after">
            <span className="k">Heute</span>
            <span className="v">{t.after || ""}</span>
          </div>
        </div>
      )}
      {t.metric && (
        <div className="t-metric">
          <b>{t.metric.value}</b>
          <span>{t.metric.label}</span>
        </div>
      )}
    </>
  );

  const foot = (
    <div className="t-foot">
      {avatar}
      <div className="t-who">
        <span className="name">{t.name}</span>
        <span className="role">{t.role || ""}</span>
      </div>
    </div>
  );

  return (
    <article className={`t-card${t.featured ? " featured" : ""}`} data-product={t.product}>
      {t.featured ? (
        <>
          <div className="t-body">{body}</div>
          <div>{foot}</div>
        </>
      ) : (
        <>
          {body}
          {foot}
        </>
      )}
    </article>
  );
}

/**
 * Kundenstimmen-Section.
 * - ohne `product`: TM-Hauptseite → Logo-Band aller Kunden, dann die
 *   `highlight`-Stimmen; der Rest klappt über „Mehr anzeigen" auf
 * - mit `product`: nur die Stimmen dieses Produkts, alle sofort sichtbar
 *
 * Hinweis: Die Produkt-Filter-Pills sind bewusst (noch) nicht aktiv — bei nur
 * 1–2 Stimmen pro Kategorie bringen sie keinen Mehrwert. Sobald pro Produkt
 * ~4–5 echte Stimmen vorliegen, können sie zurückkommen (Vorlage: `t-filter`
 * in apps/tm/design/testimonials.html).
 */
export default function Testimonials({ product }: { product?: TestimonialProduct }) {
  const [expanded, setExpanded] = useState(false);
  const list = product ? TESTIMONIALS.filter((t) => t.product === product) : TESTIMONIALS;

  // Startseite: Highlights zuerst; ohne Markierung die ersten DEFAULT_VISIBLE
  let visible = list;
  let hidden: Testimonial[] = [];
  if (!product) {
    const anyHighlight = list.some((t) => t.highlight);
    const top = anyHighlight ? list.filter((t) => t.highlight) : list.slice(0, DEFAULT_VISIBLE);
    hidden = list.filter((t) => !top.includes(t));
    visible = expanded ? [...top, ...hidden] : top;
  }

  return (
    <section className="ap-sec" id="stimmen">
      <div className="wide">
        <div className="ap-shead reveal">
          <div className="kick">Kundenstimmen</div>
          <h2>Was unsere Kunden erzählen.</h2>
          <p className="intro">
            Keine Floskeln, sondern echte Vorher → Heute-Geschichten aus dem Alltag von
            Schweizer KMU.
          </p>
        </div>

        {!product && <LogoBand />}

        <div className="t-grid reveal">
          {visible.map((t) => (
            <Card key={t.name} t={t} />
          ))}
        </div>

        {hidden.length > 0 && (
          <div className="t-more">
            <button type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
              {expanded ? "Weniger anzeigen" : `Alle ${list.length} Kundenstimmen anzeigen`}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
