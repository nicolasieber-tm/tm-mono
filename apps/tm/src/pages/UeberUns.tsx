import SiteLayout from "@/components/site/SiteLayout";
import { ContactSection, PageHero, Shead, StrokeIcon, n2 } from "@/components/site/blocks";
import { PROCESS, REASONS, TEAM } from "@/data/tm";

export default function UeberUns() {
  return (
    <SiteLayout
      title="Über uns · Trending Media"
      description="Kein Beratungshaus, keine klassische Agentur: Trending Media begleitet Schweizer KMU durch ihre Digitalisierung, von der Analyse bis zum Rollout."
    >
      <PageHero
        kick="Über uns"
        title={<>Kein Beratungshaus. <span className="g">Keine klassische Agentur.</span></>}
        sub="Wir begleiten Unternehmen langfristig durch ihre Digitalisierung, mit echtem Verständnis für den Alltag und dem Anspruch, Lösungen auch umzusetzen."
        secondary={{ label: "Das Team", href: "#team" }}
      />

      <section className="ap-sec alt" id="team">
        <div className="wrap">
          <Shead k="Team" h="Die Gesichter hinter Trending Media." />
          <div className="ap-team reveal">
            {TEAM.map((m) => (
              <figure key={m.name}>
                <img src={m.img} alt={m.name} />
                <h3>{m.name}</h3>
                <div className="role">{m.role}</div>
                <p>{m.desc}</p>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="ap-sec" id="manifest">
        <div className="wide">
          <Shead k="Manifest" h="Wie wir arbeiten." />
          <div className="ap-grid c2 reveal">
            {REASONS.map((r) => (
              <div className="ap-reason" key={r.t}>
                <span className="rc"><StrokeIcon name="check" color="url(#tmgrad)" size={20} /></span>
                <div>
                  <h4>{r.t}</h4>
                  <p>{r.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ap-sec alt" id="vorgehen">
        <div className="wide">
          <Shead k="Vorgehen" h="Vom echten Problem zur Lösung." />
          <div className="ap-grid c4 reveal">
            {PROCESS.map((s, i) => (
              <div className="ap-card" key={s.t}>
                <div className="ap-num">{n2(i)}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
    </SiteLayout>
  );
}
