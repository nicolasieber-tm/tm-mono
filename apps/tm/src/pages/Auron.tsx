import SiteLayout from "@/components/site/SiteLayout";
import { PageHero, Shead, StrokeIcon } from "@/components/site/blocks";
import { BOOK_HREF } from "@/lib/booking";

/* Produktseite AURON im TM-Design. Anmeldung (Early Access) und alle
   Details bleiben auf auron.trendingmedia.ch. Texte aus apps/auron. */
const AURON_URL = "https://auron.trendingmedia.ch";

const BEFORE = [
  "Mitarbeitende tragen Stunden nach Erinnerung nach",
  "Das Büro rennt fehlenden Rapporten hinterher",
  "Regie-Stunden gehen verloren oder werden geschätzt",
  "Projekt-Kalkulation läuft am Ende auf Bauchgefühl",
  "Rechnungen verzögern sich um Tage bis Wochen",
];
const AFTER = [
  "Zeiten werden automatisch im Hintergrund erfasst",
  "Einsatzorte werden ohne manuelle Eingabe zugeordnet",
  "Jede Stunde ist sauber einem Projekt zugewiesen",
  "Nachkalkulation basiert auf echten Daten",
  "Rechnungsstellung beginnt am Tag nach Projektende",
];

const FEATURES = [
  { ic: "clock", t: "Zeiterfassung auf Knopfdruck", d: "Ein Klick öffnet den Arbeitstag, ein Klick beendet ihn. Pausen funktionieren nach dem gleichen Prinzip. Am Tagesende steht eine Zusammenfassung mit allen erfassten Zeiten bereit." },
  { ic: "pin", t: "Einsatzort-Erkennung", d: "AURON ordnet Einsätze automatisch dem richtigen Ort zu. Liegen zwei Einsatzorte zu nah beieinander, erscheint ein kurzer Dialog zur Bestätigung." },
  { ic: "camera", t: "Spesen per Foto", d: "Quittungen und Belege mit dem Handy abfotografieren: Sie landen direkt im Admin-Hub, wo sie zur Freigabe bereitliegen." },
];

export default function Auron() {
  return (
    <SiteLayout
      title="AURON · Zeiterfassung für Handwerk & Bau · Trending Media"
      description="AURON erfasst Arbeitszeiten im Hintergrund, erkennt Einsatzorte automatisch und liefert saubere Rapporte — für Schweizer Handwerks- und Bauunternehmen."
    >
      <PageHero
        logo="/Auron_logo.png"
        kick="Ein Produkt von Trending Media · Für Handwerk & Bau"
        title={<>Zeiterfassung, die <span className="g">im Hintergrund läuft</span>.</>}
        sub="Zwei Klicks pro Tag ersetzen den Stundenzettel. Einsatzorte werden automatisch erkannt, saubere Rapporte liegen am Abend vor."
        primary={{ label: "Zu AURON", href: AURON_URL, external: true }}
        secondary={{ label: "Funktionen", href: "#funktionen" }}
      >
        <p className="hero-note">Daten auf Schweizer Servern · iOS, Android und Web</p>
      </PageHero>

      <section className="ap-sec alt">
        <div className="wide">
          <Shead k="Vorher → Mit AURON" h="Schluss mit Stundenzetteln und Rückfragen." />
          <div className="ap-grid c2 reveal">
            <div className="ap-card">
              <div className="tag warn">Heute oft</div>
              <ul className="ap-list">
                {BEFORE.map((b) => <li key={b}><span className="x">×</span>{b}</li>)}
              </ul>
            </div>
            <div className="ap-card">
              <div className="tag">Mit AURON</div>
              <ul className="ap-list">
                {AFTER.map((a) => <li key={a}><StrokeIcon name="check" color="url(#tmgrad)" size={18} />{a}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="ap-sec" id="funktionen">
        <div className="wide">
          <div className="ap-split reveal">
            <div>
              <div className="kick">Funktionen</div>
              <h2>Gebaut für den Alltag auf der Baustelle.</h2>
              <ul className="ticks">
                {FEATURES.map((f) => (
                  <li key={f.t}>
                    <StrokeIcon name={f.ic} color="url(#tmgrad)" size={22} />
                    <span><b>{f.t}.</b> {f.d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="ap-shot phone"><img src="/auron_app.jpg" alt="AURON App: laufende Zeiterfassung auf der Baustelle" loading="lazy" /></div>
          </div>
        </div>
      </section>

      <section className="ap-sec alt">
        <div className="wide">
          <Shead k="Admin-Hub" h="Im Büro alles im Blick." intro="Zeiten, Einsatzorte und Spesen laufen zusammen und liegen strukturiert für die weitere Verarbeitung bereit." />
          <div className="ap-shot reveal"><img src="/auron_dashboard.jpg" alt="AURON Admin-Hub mit Übersicht der Mitarbeitenden" loading="lazy" /></div>
        </div>
      </section>

      <section className="ap-sec">
        <div className="wide">
          <div className="ap-band reveal">
            <h2>AURON in Ihrem Betrieb?</h2>
            <p>Sichern Sie sich frühzeitig Zugang und gestalten Sie die Weiterentwicklung mit.</p>
            <div className="acts">
              <a className="w" href={AURON_URL} target="_blank" rel="noopener">Zu AURON</a>
              <a className="g" href={BOOK_HREF}>Erstgespräch buchen</a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
