import {
  TESTIMONIALS,
  PRODUCT_LABEL,
  type Testimonial,
  type TestimonialProduct,
} from "@tm/testimonials";

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
 * - ohne `product`: alle Stimmen (TM-Hauptseite)
 * - mit `product`: nur die Stimmen dieses Produkts (Produkt-Unterseiten)
 *
 * Hinweis: Die Produkt-Filter-Pills sind bewusst (noch) nicht aktiv — bei nur
 * 1–2 Stimmen pro Kategorie bringen sie keinen Mehrwert. Sobald pro Produkt
 * ~4–5 echte Stimmen vorliegen, können sie zurückkommen (Vorlage: `t-filter`
 * in apps/tm/design/testimonials.html).
 */
export default function Testimonials({ product }: { product?: TestimonialProduct }) {
  const list = product ? TESTIMONIALS.filter((t) => t.product === product) : TESTIMONIALS;

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

        <div className="t-grid reveal">
          {list.map((t) => (
            <Card key={t.name} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
