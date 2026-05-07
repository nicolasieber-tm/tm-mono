import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

const Imprint = () => {
  return (
    <LegalPageLayout
      title="Impressum"
      intro="Angaben gemaess den schweizerischen Informationspflichten fuer das Angebot von Trending Media KLG."
    >
      <LegalSection title="Trending Media KLG">
        <p>
          Hasenmattweg 35
          <br />
          4515 Oberdorf
          <br />
          Schweiz
        </p>
      </LegalSection>

      <LegalSection title="Vertretungsberechtigte Person(en)">
        <p>
          Nicola Sieber, Co-Founder
          <br />
          Timo Brian Sieber, Co-Founder
          <br />
          Mika Sieber, Co-Founder
        </p>
      </LegalSection>

      <LegalSection title="Kontakt">
        <p>
          E-Mail:{" "}
          <a className="text-foreground underline underline-offset-4" href="mailto:info@trendingmedia.ch">
            info@trendingmedia.ch
          </a>
          <br />
          Telefon: Auf Anfrage
        </p>
      </LegalSection>

      <LegalSection title="Handelsregister-Eintrag">
        <p>
          Eingetragener Firmenname: Trending Media KLG
          <br />
          Unternehmens-Nr (UID): CHE-330.867.620
        </p>
      </LegalSection>

      <LegalSection title="Haftungsausschluss">
        <p>
          Der Autor uebernimmt keinerlei Gewaehr hinsichtlich der inhaltlichen
          Richtigkeit, Genauigkeit, Aktualitaet, Zuverlaessigkeit und
          Vollstaendigkeit der Informationen.
        </p>
        <p>
          Haftungsansprueche gegen den Autor wegen Schaeden materieller oder
          immaterieller Art, welche aus dem Zugriff oder der Nutzung bzw.
          Nichtnutzung der veroeffentlichten Informationen, durch Missbrauch
          der Verbindung oder durch technische Stoerungen entstanden sind,
          werden ausgeschlossen.
        </p>
        <p>
          Alle Angebote sind unverbindlich. Der Autor behaelt es sich
          ausdruecklich vor, Teile der Seiten oder das gesamte Angebot ohne
          besondere Ankuendigung zu veraendern, zu ergaenzen, zu loeschen oder
          die Veroeffentlichung zeitweise oder endgueltig einzustellen.
        </p>
      </LegalSection>

      <LegalSection title="Haftungsausschluss fuer Links">
        <p>
          Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres
          Verantwortungsbereichs. Es wird jegliche Verantwortung fuer solche
          Webseiten abgelehnt. Der Zugriff und die Nutzung solcher Webseiten
          erfolgen auf eigene Gefahr des jeweiligen Nutzers.
        </p>
      </LegalSection>

      <LegalSection title="Urheberrechte">
        <p>
          Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder
          anderen Dateien auf dieser Website gehoeren ausschliesslich der Firma
          Trending Media KLG oder den speziell genannten Rechteinhabern. Fuer
          die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung
          des Urheberrechtstraegers im Voraus einzuholen.
        </p>
        <p>Quelle: SwissAnwalt</p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default Imprint;
