import { Link } from "react-router-dom";
import Testimonials from "@/components/sections/Testimonials";
import SiteLayout from "@/components/site/SiteLayout";
import { PageHero, Shead, StrokeIcon } from "@/components/site/blocks";
import { BOOK_HREF } from "@/lib/booking";

/* Produktseite OneClick Office im TM-Design. Der eigentliche Einstieg für
   Interessenten (Video-Fallstudie, Meta-Ads-Funnel) bleibt auf
   start.oneclick-office.ch — alle Haupt-Buttons führen dorthin. */
const OCO_URL = "https://start.oneclick-office.ch";

const FEATURES = [
  { ic: "phone", t: "Zeiterfassung unterwegs", d: "Leistungen direkt nach dem Termin am Handy erfassen, statt sie am Monatsende zu rekonstruieren." },
  { ic: "camera", t: "Spesen per Foto", d: "Belege abfotografieren und hinterlegen, egal wo Sie gerade sind." },
  { ic: "receipt", t: "Rechnung auf einen Klick", d: "Aus den erfassten Leistungen und Spesen entsteht automatisch eine professionelle Rechnung." },
  { ic: "check", t: "Alles an einem Ort", d: "Kein Hin und Her mehr zwischen Word, Excel und Kalender." },
];

export default function OneClickOffice() {
  return (
    <SiteLayout
      title="OneClick Office · Ein Produkt von Trending Media"
      description="Zeiterfassung, Spesen und Rechnungen an einem Ort: OneClick Office reduziert den Adminaufwand für selbstständige Coaches, Berater und Praxen in der Schweiz."
    >
      <PageHero
        logo="/oneclick-office_logo.png"
        kick="Ein Produkt von Trending Media"
        title={<>Abrechnungstag? <span className="g">1 Klick. Fertig.</span></>}
        sub="OneClick Office bringt Zeiterfassung, Spesen und Rechnungen an einen Ort — für selbstständige Coaches, Berater und Praxen in der Schweiz."
        primary={{ label: "Video-Fallstudie ansehen", href: OCO_URL, external: true }}
        secondary={{ label: "Funktionen", href: "#funktionen" }}
      >
        <p className="hero-note">Kostenlos · Sie sehen die Fallstudie direkt nach dem Eintrag</p>
      </PageHero>

      <section className="ap-sec alt">
        <div className="wide">
          <div className="ap-split reveal">
            <div>
              <div className="kick">Die Ausgangslage</div>
              <h2>Ein bis anderthalb Arbeitstage pro Monat für Administration.</h2>
              <p>Termine im Kalender, Stunden in Excel, Rechnungen in Word: Wer selbstständig berät oder eine Praxis führt, verliert jeden Monat viel Zeit mit Abrechnung — Zeit, die bei den Klientinnen und Klienten fehlt.</p>
              <p>OneClick Office ist aus genau dieser Situation entstanden: als individuelle Lösung für eine Praxis, heute als Produkt für alle mit dem gleichen Problem.</p>
            </div>
            <div className="cs-result" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="r"><b>1–1.5 Tage</b><span>Adminaufwand pro Monat vorher</span></div>
              <div className="r"><b>1.5 Std.</b><span>Adminaufwand pro Monat heute</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="ap-sec" id="funktionen">
        <div className="wide">
          <Shead k="Funktionen" h="Erfassen, wenn es passiert. Abrechnen mit einem Klick." />
          <div className="ap-grid c4 reveal">
            {FEATURES.map((f) => (
              <div className="ap-card" key={f.t}>
                <div className="ap-feat-ic"><StrokeIcon name={f.ic} color="url(#tmgrad)" size={26} /></div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
          {/* ⏳ Screenshots von OneClick Office folgen — dann hier als .ap-shot einsetzen */}
        </div>
      </section>

      <Testimonials product="oco" kick="Aus der Praxis" title="Luca Vogel, Praxis Vogel GmbH." alt />

      <section className="ap-sec">
        <div className="wide">
          <div className="ap-band reveal">
            <h2>Passt OneClick Office zu Ihnen?</h2>
            <p>In der kostenlosen Video-Fallstudie sehen Sie, wie Luca seinen Adminaufwand von Tagen auf Stunden reduziert hat.</p>
            <div className="acts">
              <a className="w" href={OCO_URL} target="_blank" rel="noopener">Video-Fallstudie ansehen</a>
              <Link className="g" to="/kundenstimmen/praxis-vogel">Fallstudie lesen</Link>
            </div>
          </div>
          <p className="cs-note" style={{ marginTop: 28 }}>
            Sie brauchen keine Standardlösung, sondern etwas für Ihren eigenen Ablauf?{" "}
            <a href={BOOK_HREF} style={{ textDecoration: "underline" }}>Erstgespräch mit Trending Media buchen</a>.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
