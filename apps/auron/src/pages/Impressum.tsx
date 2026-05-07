import { Link } from "react-router-dom";
import Footer from "@/components/landing/Footer";

export default function Impressum() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <div className="flex justify-center w-full pt-8 pb-6">
        <Link to="/" className="inline-block">
          <img src="/auron-logo.png" alt="Auron Logo" className="h-12 w-auto" />
        </Link>
      </div>

      <main className="flex-grow w-full max-w-3xl mx-auto px-6 pb-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-10">Impressum</h1>

        <div className="space-y-8 text-slate-700 text-sm leading-relaxed">

          <section>
            <p className="font-semibold text-slate-900">Trending Media KLG</p>
            <p>Hasenmattweg 35</p>
            <p>4515 Oberdorf</p>
            <p>Schweiz</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">Vertretungsberechtigte Person(en)</h2>
            <p>Nicola Sieber, Co-Founder</p>
            <p>Timo Brian Sieber, Co-Founder</p>
            <p>Mika Sieber, Co-Founder</p>
          </section>

          <section>
            <p>E-Mail: <a href="mailto:info@trendingmedia.ch" className="text-primary hover:underline">info@trendingmedia.ch</a></p>
            <p>Telefon: Auf Anfrage</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">Handelsregister-Eintrag</h2>
            <p>Eingetragener Firmenname: Trending Media KLG</p>
            <p>Unternehmens-Nr (UID): CHE-330.867.620</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">Haftungsausschluss</h2>
            <p className="mb-3">
              Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen.
            </p>
            <p className="mb-3">
              Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen, durch Missbrauch der Verbindung oder durch technische Störungen entstanden sind, werden ausgeschlossen.
            </p>
            <p>
              Alle Angebote sind unverbindlich. Der Autor behält es sich ausdrücklich vor, Teile der Seiten oder das gesamte Angebot ohne besondere Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder endgültig einzustellen.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">Haftungsausschluss für Links</h2>
            <p>
              Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres Verantwortungsbereichs. Es wird jegliche Verantwortung für solche Webseiten abgelehnt. Der Zugriff und die Nutzung solcher Webseiten erfolgen auf eigene Gefahr des jeweiligen Nutzers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">Urheberrechte</h2>
            <p>
              Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf dieser Website, gehören ausschliesslich der Firma Trending Media KLG oder den speziell genannten Rechteinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung des Urheberrechtsträgers im Voraus einzuholen.
            </p>
          </section>

          <p className="text-xs text-slate-400 pt-4 border-t border-slate-200">Quelle: SwissAnwalt</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
