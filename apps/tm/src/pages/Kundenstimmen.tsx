import { useState } from "react";
import { Link } from "react-router-dom";
import SiteLayout from "@/components/site/SiteLayout";
import { ContactSection, PageHero } from "@/components/site/blocks";
import { LogoBand } from "@/components/sections/Testimonials";
import { CATEGORY_LABEL, publishedCases, type CaseStudy, type CaseWithQuote } from "@/data/cases";

/** Zitat für die Karte: HTML-Markierungen raus, auf ~1 Satz kürzen */
function teaser(html: string, max = 170) {
  const plain = html.replace(/<[^>]+>/g, "");
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + " …";
}

export function CaseCard({ c }: { c: CaseWithQuote }) {
  return (
    <Link className="ks-card reveal" to={`/kundenstimmen/${c.slug}`}>
      <div className="ks-in">
        <div className="ks-top">
          {c.t?.logo ? <img className="ks-logo" src={c.t.logo} alt={c.t.company} /> : <b>{c.t?.company}</b>}
          <span className="ks-tag">{c.label}</span>
        </div>
        <h3>{c.title}</h3>
        {c.t && <p className="ks-q">«{teaser(c.t.quote)}»</p>}
        {c.metric && (
          <div className="ks-metric"><b>{c.metric.value}</b><span>{c.metric.label}</span></div>
        )}
        <div className="ks-foot">
          {c.t?.photo && <img src={c.t.photo} alt="" />}
          <span className="who"><b>{c.t?.name}</b>{c.t?.role}</span>
          <span className="go">Fallstudie lesen →</span>
        </div>
      </div>
    </Link>
  );
}

type Filter = "all" | CaseStudy["category"];

export default function Kundenstimmen() {
  const cases = publishedCases();
  const [filter, setFilter] = useState<Filter>("all");
  const cats = (Object.keys(CATEGORY_LABEL) as CaseStudy["category"][]).filter((k) => cases.some((c) => c.category === k));
  const list = filter === "all" ? cases : cases.filter((c) => c.category === filter);

  return (
    <SiteLayout
      title="Kundenstimmen & Fallstudien · Trending Media"
      description="Echte Projekte von Schweizer KMU: Automationen, Webseiten und OneClick Office mit Ausgangslage, Lösung und Resultat."
    >
      <PageHero
        kick="Kundenstimmen"
        title={<>Was sich bei unseren Kunden <span className="g">verändert hat</span>.</>}
        sub="Keine Floskeln, sondern echte Projekte: Ausgangslage, Lösung und Resultat, erzählt von den Unternehmen selbst."
        primary={null}
      />

      <section className="ap-sec" style={{ paddingTop: 20 }}>
        <div className="wide">
          <LogoBand />
          {cats.length > 1 && (
            <div className="t-filter reveal">
              <button type="button" className={filter === "all" ? "on" : undefined} onClick={() => setFilter("all")}>
                Alle<span className="n">{cases.length}</span>
              </button>
              {cats.map((k) => (
                <button type="button" key={k} className={filter === k ? "on" : undefined} onClick={() => setFilter(k)}>
                  {CATEGORY_LABEL[k]}<span className="n">{cases.filter((c) => c.category === k).length}</span>
                </button>
              ))}
            </div>
          )}
          <div className="ks-grid">
            {list.map((c) => <CaseCard key={c.slug} c={c} />)}
          </div>
        </div>
      </section>

      <ContactSection alt title="Ihr Projekt als nächste Fallstudie?" lead="30 Minuten, ehrlich und unverbindlich. Wir hören zu, ordnen Ihre Situation ein und sagen offen, wo der grösste Hebel liegt." />
    </SiteLayout>
  );
}
