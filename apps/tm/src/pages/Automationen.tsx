import { Link } from "react-router-dom";
import Testimonials from "@/components/sections/Testimonials";
import SiteLayout from "@/components/site/SiteLayout";
import { ContactSection, FaqSection, Illo, PageHero, Shead, n2 } from "@/components/site/blocks";
import BookingCaseB2B from "@/components/BookingCaseB2B";
import EmailAutoCase from "@/components/EmailAutoCase";
import { BOOK_HREF } from "@/lib/booking";
import { AUTO_FAQS, PROCESS, SERVICES } from "@/data/tm";

export default function Automationen() {
  return (
    <SiteLayout
      title="Automationen & individuelle Software · Trending Media"
      description="Prozesse digitalisieren, KI mit Substanz und massgeschneiderte Software für Schweizer KMU. Weniger manuelle Arbeit, weniger Medienbrüche, mehr Zeit fürs Kerngeschäft."
    >
      <PageHero
        kick="Automationen & Software"
        title={<>Weniger Handarbeit. <span className="g">Mehr Wirkung.</span></>}
        sub="Wir finden heraus, wo in Ihrem Alltag Zeit verloren geht, und ersetzen Excel-Listen, Doppelerfassung und Medienbrüche durch Abläufe, die von selbst laufen."
        secondary={{ label: "Beispiele ansehen", href: "#praxis" }}
      />

      <section className="ap-sec alt" id="leistungen">
        <div className="wide">
          <Shead k="Was wir bauen" h="Drei Hebel gegen manuellen Aufwand." />
          <div className="ap-grid c3 reveal">
            {SERVICES.map((s) => (
              <div className="ap-card" key={s.title}>
                <Illo name={s.illo} />
                <div className="tag">{s.tag}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="chips">{s.chips.map((x) => <span key={x}>{x}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ap-sec" id="praxis">
        <div className="wide">
          <Shead k="Beispiele aus der Praxis" h="Automationen, die sich täglich auszahlen." intro="Zwei echte Fälle aus Kundenprojekten: vom Buchungslink für hunderte Mitarbeitende bis zur E-Mail, die sich selbst rapportiert." />
          <div className="ap-case">
            <div className="ap-case-head reveal">
              <span className="ap-case-k">Fall 1 · E-Mail-Automation</span>
              <h3>Aus jeder E-Mail der richtige Zeitrapport</h3>
            </div>
            <EmailAutoCase />
            <div className="ap-cta reveal" style={{ marginTop: 8 }}>
              <Link to="/kundenstimmen/kohler-elektro">Ganze Fallstudie lesen →</Link>
            </div>
          </div>
          <div className="ap-case">
            <div className="ap-case-head reveal">
              <span className="ap-case-k">Fall 2 · Individuelle Buchungslösung</span>
              <h3>Ein Link statt hunderte Termin-Mails</h3>
            </div>
            <BookingCaseB2B />
          </div>
        </div>
      </section>

      <Testimonials product="auto" kick="Kundenstimmen" title="Was Automation im Alltag bringt." alt />

      <section className="ap-sec" id="vorgehen">
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
          <div className="ap-cta reveal" style={{ marginTop: 48 }}>
            <a href={BOOK_HREF}>Erstgespräch buchen</a>
          </div>
        </div>
      </section>

      <ContactSection alt />
      <FaqSection faqs={AUTO_FAQS} alt={false} />
    </SiteLayout>
  );
}
