import { Link } from "react-router-dom";
import {
  TESTIMONIALS,
  CLIENT_LOGOS,
  PRODUCT_LABEL,
  type ClientLogo,
  type Testimonial,
  type TestimonialProduct,
} from "@tm/testimonials";
import { publishedCases } from "@/data/cases";

/** Kundenstimmen mit veröffentlichter Fallstudie verlinken auf /kundenstimmen/<slug> */
const CASE_SLUGS = new Set(publishedCases().map((c) => c.slug));

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

export function LogoBand() {
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

  const caseLink = t.slug && CASE_SLUGS.has(t.slug) ? `/kundenstimmen/${t.slug}` : null;
  const foot = (
    <div className="t-foot">
      {avatar}
      <div className="t-who">
        <span className="name">{t.name}</span>
        <span className="role">{t.role || ""}</span>
      </div>
      {caseLink && <Link className="t-case" to={caseLink}>Fallstudie →</Link>}
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
 * - ohne `product`: Startseite → Logo-Band aller Kunden, dann die
 *   `highlight`-Stimmen und der Link auf /kundenstimmen (alle Fallstudien)
 * - mit `product`: nur die Stimmen dieses Produkts, alle sofort sichtbar
 */
export default function Testimonials({
  product,
  kick = "Kundenstimmen",
  title = "Was unsere Kunden erzählen.",
  alt = false,
}: {
  product?: TestimonialProduct;
  kick?: string;
  title?: string;
  alt?: boolean;
}) {
  const list = product ? TESTIMONIALS.filter((t) => t.product === product) : TESTIMONIALS;
  if (list.length === 0) return null;

  // Startseite: nur Highlights (ohne Markierung die ersten DEFAULT_VISIBLE)
  let visible = list;
  if (!product) {
    const anyHighlight = list.some((t) => t.highlight);
    visible = anyHighlight ? list.filter((t) => t.highlight) : list.slice(0, DEFAULT_VISIBLE);
  }

  return (
    <section className={`ap-sec${alt ? " alt" : ""}`} id="stimmen">
      <div className="wide">
        <div className="ap-shead reveal">
          <div className="kick">{kick}</div>
          <h2>{title}</h2>
          {!product && (
            <p className="intro">
              Keine Floskeln, sondern echte Vorher → Heute-Geschichten aus dem Alltag von
              Schweizer KMU.
            </p>
          )}
        </div>

        {!product && <LogoBand />}

        <div className="t-grid reveal">
          {visible.map((t) => (
            <Card key={t.name} t={t} />
          ))}
        </div>

        <div className="t-more">
          <Link to="/kundenstimmen">Alle Kundenstimmen &amp; Fallstudien →</Link>
        </div>
      </div>
    </section>
  );
}
