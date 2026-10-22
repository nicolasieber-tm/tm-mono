import Testimonials from "@/components/sections/Testimonials";
import SiteLayout from "@/components/site/SiteLayout";
import { ContactSection, FaqSection, Illo, LinkCard, Shead, StrokeIcon } from "@/components/site/blocks";
import { BOOK_HREF } from "@/lib/booking";

/* Startseite = Übersicht: Hero, Diagnose, Leistungen und Produkte als Kacheln
   zu den Unterseiten, Kundenstimmen, Erstgespräch, FAQ. Details (Vorgehen,
   Praxisfälle, Team) liegen auf /automationen, /landingpages und /ueber-uns. */

const PAINS = [
  { illo: "excel", tag: "Daten-Chaos", title: "Excel-Listen, die niemand mehr durchblickt", desc: "Daten leben in fünf Tabellen, drei Mailboxen und einem Ordner-Chaos. Jede Auswertung ist Handarbeit.", v: "~14h", l: "pro Woche verloren" },
  { illo: "doubleEntry", tag: "Medienbruch", title: "Doppelte Erfassung in jedem System", desc: "Die gleichen Informationen werden täglich mehrfach getippt: im CRM, in der Buchhaltung, im Projekt-Tool.", v: "3-5×", l: "gleiche Eingabe" },
  { illo: "silo", tag: "Wissens-Silo", title: "Wissen, das nur in einem Kopf existiert", desc: "Wenn diese eine Person Ferien hat, steht der halbe Betrieb. Prozesse sind nirgendwo dokumentiert.", v: "1", l: "Single Point of Failure" },
  { illo: "fizzle", tag: "Tool-Friedhof", title: "KI-Versprechen, die im Alltag nichts bringen", desc: "Tools wurden eingeführt, aber niemand nutzt sie. Der Aufwand ist gleich geblieben, die Lizenzkosten nicht.", v: "0", l: "ROI trotz Lizenzen" },
];

const FAQS = [
  { q: "Wie läuft das Erstgespräch ab?", a: "30 Minuten per Video-Call. Wir hören zu, ordnen Ihre Situation ein und sagen offen, ob und wo wir der richtige Partner sind. Kein Sales-Pitch, keine Folgekosten, keine Verpflichtung." },
  { q: "Was kostet ein typisches Projekt?", a: "Das hängt vom Umfang Ihrer Idee ab. Genau deshalb starten wir mit einem kostenlosen Erstgespräch: Erst wenn klar ist, was Sie brauchen, erhalten Sie ein konkretes, fixes Angebot." },
  { q: "Für welche Branchen arbeiten Sie?", a: "Schwerpunkt sind Schweizer KMU im Dienstleistungs-, Handwerks- und Servicebereich. Unser Vorgehen funktioniert überall dort, wo manuelle Abläufe digitalisiert werden sollen." },
  { q: "Wo werden meine Daten gespeichert?", a: "Standardmässig in der Schweiz oder in der EU. Spezifische Anforderungen (CH-Hosting, on-premise, FINMA) berücksichtigen wir im Architektur-Entscheid." },
  { q: "Begleiten Sie uns auch nach dem Go-Live?", a: "Ja. Wir bleiben Ansprechpartner für Wartung, Weiterentwicklung und Support. Aus einem Projekt soll ein dauerhaft funktionierender Prozess werden." },
];

const Index = () => (
  <SiteLayout
    title="Trending Media: Digitalisierungspartner für Schweizer KMU"
    description="Weniger Admin, klarere Abläufe, mehr Zeit fürs Kerngeschäft. Trending Media digitalisiert Schweizer KMU mit Automationen, Software, Webseiten und eigenen Produkten."
  >
    <section className="ap-hero reveal" id="top">
      <div className="wrap">
        <div className="kick">Digitalisierung für Schweizer KMU</div>
        <h1><span className="ln1">Ihr Unternehmen,</span> <span className="g">digital weitergedacht</span>.</h1>
        <p className="sub">Mit individuellen digitalen Lösungen reduzieren wir manuellen Aufwand, verbinden Systeme und schaffen effizientere Abläufe.</p>
        <div className="acts">
          <a className="p" href={BOOK_HREF}>Erstgespräch buchen</a>
          <a className="s" href="#leistungen">Mehr erfahren ›</a>
        </div>
        <div className="ap-reassure">100% kostenlos &amp; unverbindlich</div>

        <div className="ap-trust">
          <div className="t-item">
            <img className="t-logo" src="/anthropic-icon-logo.png" alt="Anthropic" width={22} height={22} />
            <div className="t-txt"><b>Anthropic</b><span>Claude Certified Architect</span></div>
          </div>
          <div className="t-item">
            <StrokeIcon name="server" size={22} />
            <div className="t-txt"><b>EU-Datenstandort</b><span>revDSG-konform</span></div>
          </div>
          <div className="t-item">
            <StrokeIcon name="trend" size={22} />
            <div className="t-txt"><b>Ø 14 h/Woche</b><span>weniger Aufwand</span></div>
          </div>
          <div className="t-item">
            <StrokeIcon name="users" size={22} />
            <div className="t-txt"><b>Persönlich &amp; lokal</b><span>Umsetzung im eigenen Team</span></div>
          </div>
        </div>
      </div>
    </section>

    <section className="ap-sec">
      <div className="wide">
        <Shead k="Diagnose" h="Kommt Ihnen das bekannt vor?" intro="Punkte, die wir in fast jedem Erstgespräch hören, kein Zeichen schlechter Organisation, sondern von Werkzeugen, die nicht mitgewachsen sind." />
        <div className="ap-grid c4 reveal">
          {PAINS.map((p) => (
            <div className="ap-card" key={p.title}>
              <Illo name={p.illo} />
              <div className="tag">{p.tag}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div className="m"><b>{p.v}</b><span>{p.l}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="ap-sec alt" id="leistungen">
      <div className="wide">
        <Shead k="Leistungen" h="Strategie, Software, Umsetzung. Ein Team." intro="Zwei Schwerpunkte, ein Anspruch: spürbar weniger Aufwand, mehr Qualität, mehr Zeit für das Eigentliche." />
        <div className="ap-grid c2 reveal">
          <LinkCard
            to="/automationen"
            illo="workflow"
            tag="Operations · Intelligence · Engineering"
            title="Automationen & Software"
            desc="Wir machen sichtbar, wo im Alltag Aufwand entsteht, und ersetzen Excel-Listen, Doppelerfassung und Medienbrüche durch saubere Abläufe: mit Automationen, KI dort, wo sie wirkt, und massgeschneiderter Software."
            chips={["Prozesse", "KI & Automation", "Individuelle Software", "Integrationen"]}
            go="Automationen ansehen"
          />
          <LinkCard
            to="/landingpages"
            illo="web"
            tag="Reach"
            title="Landingpages & Websites"
            desc="Performante Webauftritte, die Sichtbarkeit in Anfragen verwandeln: mit klarer Conversion-Logik, SEO-Grundlagen und integrierter Terminbuchung statt Pixel-Spielerei."
            chips={["Landingpages", "Websites", "SEO", "Buchungstool"]}
            go="Landingpages ansehen"
          />
        </div>
      </div>
    </section>

    <Testimonials />

    <section className="ap-sec alt" id="produkte">
      <div className="wide">
        <Shead k="Eigene Produkte" h="Wir bauen nicht nur. Wir betreiben selbst." intro="Aus Kundenprojekten entstanden, heute als eigene Produkte im Einsatz." />
        <div className="ap-grid c2 reveal">
          <LinkCard
            to="/oneclick-office"
            logo="/oneclick-office_logo.png"
            tag="Für Coaches, Berater & Praxen"
            title="OneClick Office"
            desc="Zeiterfassung, Spesen und Rechnungen an einem Ort. Aus dem monatlichen Abrechnungstag wird eine Rechnung auf einen Klick."
            go="Zum Produkt"
          />
          <LinkCard
            to="/auron"
            logo="/Auron_logo.png"
            tag="Für Handwerk & Bau"
            title="AURON"
            desc="Zeiterfassung, die im Hintergrund läuft: Einsatzorte werden automatisch erkannt, Rapporte liegen am Abend sauber vor."
            go="Zum Produkt"
          />
        </div>
      </div>
    </section>

    <ContactSection />
    <FaqSection faqs={FAQS} />
  </SiteLayout>
);

export default Index;
