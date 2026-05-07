import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";

const Impressum = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-16 md:py-24">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Zurück zur Startseite
        </Link>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">Impressum</h1>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-foreground/90">
          <section>
            <p className="font-semibold">Trending Media KLG</p>
            <p>Hasenmattweg 35</p>
            <p>4515 Oberdorf</p>
            <p>Schweiz</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Vertretungsberechtigte Personen</h2>
            <ul className="mt-3 space-y-1">
              <li>Nicola Sieber, Co-Founder</li>
              <li>Timo Brian Sieber, Co-Founder</li>
              <li>Mika Sieber, Co-Founder</li>
            </ul>
            <p className="mt-3">E-Mail: info@trendingmedia.ch</p>
            <p>Telefon: Auf Anfrage</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Handelsregister-Eintrag</h2>
            <p className="mt-3">Eingetragener Firmenname: Trending Media KLG</p>
            <p>Unternehmens-Nr (UID): CHE-330.867.620</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Haftungsausschluss</h2>
            <p className="mt-3">
              Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit,
              Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen.
            </p>
            <p className="mt-3">
              Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art,
              welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten
              Informationen, durch Missbrauch der Verbindung oder durch technische Störungen
              entstanden sind, werden ausgeschlossen.
            </p>
            <p className="mt-3">
              Alle Angebote sind unverbindlich. Der Autor behält es sich ausdrücklich vor, Teile
              der Seiten oder das gesamte Angebot ohne besondere Ankündigung zu verändern, zu
              ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Haftungsausschluss für Links</h2>
            <p className="mt-3">
              Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres
              Verantwortungsbereichs. Es wird jegliche Verantwortung für solche Webseiten
              abgelehnt. Der Zugriff und die Nutzung solcher Webseiten erfolgen auf eigene Gefahr
              des jeweiligen Nutzers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Urheberrechte</h2>
            <p className="mt-3">
              Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen
              Dateien auf dieser Website, gehören ausschliesslich der Firma Trending Media KLG
              oder den speziell genannten Rechteinhabern. Für die Reproduktion jeglicher Elemente
              ist die schriftliche Zustimmung des Urheberrechtsträgers im Voraus einzuholen.
            </p>
          </section>

          <p className="text-sm text-muted-foreground">Quelle: SwissAnwalt</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Impressum;
