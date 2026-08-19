import { Link } from "react-router-dom";

// Rechtliche Pflichtseite (Route /impressum). Inhalt für Trending Media KLG,
// Anbieter von OneClick Office.
const Impressum = () => (
  <div className="min-h-screen bg-background text-foreground section-padding">
    <div className="section-container max-w-[760px]">
      <Link to="/" className="mb-8 inline-block text-sm text-accent-deep hover:underline">
        ← Zurück zur Startseite
      </Link>
      <h1 className="headline-h2 mb-8 text-text-primary">Impressum</h1>
      <div className="space-y-6 text-text-secondary">
        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">Kontaktadresse</h2>
          <p>
            Trending Media KLG<br />
            Hasenmattweg 35<br />
            4515 Oberdorf<br />
            Schweiz
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">
            Vertretungsberechtigte Person(en)
          </h2>
          <p>Nicola Sieber, Co-Founder</p>
          <p>Timo Brian Sieber, Co-Founder</p>
          <p>Mika Sieber, Co-Founder</p>
        </section>

        <section>
          <p>
            <strong>E-Mail:</strong> info@trendingmedia.ch
          </p>
          <p>
            <strong>Telefon:</strong> Auf Anfrage
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">Handelsregister-Eintrag</h2>
          <p>
            <strong>Eingetragener Firmenname:</strong> Trending Media KLG
          </p>
          <p>
            <strong>Unternehmens-Nr (UID):</strong> CHE-330.867.620
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">Haftungsausschluss</h2>
          <p className="mb-2">
            Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit,
            Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen.
          </p>
          <p className="mb-2">
            Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art,
            welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten
            Informationen, durch Missbrauch der Verbindung oder durch technische Störungen
            entstanden sind, werden ausgeschlossen.
          </p>
          <p>
            Alle Angebote sind unverbindlich. Der Autor behält es sich ausdrücklich vor, Teile
            der Seiten oder das gesamte Angebot ohne besondere Ankündigung zu verändern, zu
            ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">Haftungsausschluss für Links</h2>
          <p>
            Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres
            Verantwortungsbereichs. Es wird jegliche Verantwortung für solche Webseiten abgelehnt.
            Der Zugriff und die Nutzung solcher Webseiten erfolgen auf eigene Gefahr des jeweiligen
            Nutzers.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">Urheberrechte</h2>
          <p>
            Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien
            auf dieser Website gehören ausschliesslich der Trending Media KLG oder den speziell
            genannten Rechteinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche
            Zustimmung des Urheberrechtsträgers im Voraus einzuholen.
          </p>
        </section>

        <p className="mt-8 text-sm text-text-muted">Quelle: SwissAnwalt</p>
      </div>
    </div>
  </div>
);

export default Impressum;
