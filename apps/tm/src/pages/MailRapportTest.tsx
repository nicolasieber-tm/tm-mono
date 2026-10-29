import { Link } from "react-router-dom";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";

const MAIL = "nicola.sieber@trendingmedia.ch";

/** Kurze Erklärseite zum Mail-Rapport-Test (u. a. für die Google-App-Prüfung) */
const MailRapportTest = () => {
  return (
    <LegalPageLayout
      title="Mail-Rapport-Test"
      intro="Wie viel Zeit steckt in Ihren Projektmails?"
    >
      <LegalSection title="Worum es geht">
        <p>
          Offerten, Terminabsprachen, Rückfragen zur Baustelle: Ein grosser Teil
          der Arbeit im Handwerk passiert per E-Mail. Diese Zeit taucht selten
          im Rapport auf und wird deshalb kaum verrechnet.
        </p>
        <p>
          Mit dem Mail-Rapport-Test zeigen wir Ihnen in 14 Tagen, wie viele
          Ihrer Mails zu Kundenprojekten gehören und wie viel Arbeitszeit das
          entspricht, aufgeteilt nach Projekt und Kunde.
        </p>
      </LegalSection>

      <LegalSection title="So funktioniert der Test">
        <ol>
          <li>
            <strong>Einrichtung:</strong> Gemeinsam legen wir fest, wie viele
            Minuten Sie im Schnitt pro eingehender und ausgehender Mail
            aufwenden, und mit welchem Stundenansatz Sie rechnen.
          </li>
          <li>
            <strong>Postfach verbinden:</strong> Sie erhalten von uns einen
            persönlichen Link. Damit verbinden Sie Ihr Postfach mit wenigen
            Klicks über die offizielle Anmeldung von Microsoft 365 / Outlook
            oder Google Workspace / Gmail. Weitere Postfächer, etwa von
            Projektleitern, verbinden Sie über denselben Link.
          </li>
          <li>
            <strong>Automatische Auswertung:</strong> Während des Tests sortiert
            unser System Werbung, Newsletter, Systemmeldungen und interne Mails
            aus. Die übrigen Mails prüft es auf Projektbezug und ordnet sie
            Kunden und Projekten zu, z. B. anhand von Adresse, Projektnummer
            oder Mailverlauf.
          </li>
          <li>
            <strong>Ergebnis im Gespräch:</strong> Nach dem Test besprechen wir
            die Auswertung gemeinsam mit Ihnen: Anzahl Projektmails, Zeit und
            Betrag pro Projekt und eine Hochrechnung aufs Jahr.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="Was wir tun und was nicht">
        <h3>Wir tun:</h3>
        <ul>
          <li>Posteingang und gesendete Mails des Testzeitraums lesen</li>
          <li>Mails zählen, einordnen und Projekten zuordnen</li>
          <li>Ihnen die Auswertung im Termin vorstellen</li>
        </ul>
        <h3>Wir tun nicht:</h3>
        <ul>
          <li>Mails senden, löschen, verschieben oder markieren</li>
          <li>Vollständige Mail-Texte oder Anhänge speichern</li>
          <li>Daten für Werbung verwenden oder an Dritte verkaufen</li>
          <li>Etwas in Ihre Software oder Ihr ERP buchen</li>
        </ul>
      </LegalSection>

      <LegalSection title="Datenschutz">
        <ul>
          <li>
            <strong>Nur Lesezugriff:</strong> Bei Microsoft «Mail.Read», bei
            Google «gmail.readonly».
          </li>
          <li>
            <strong>Datenminimierung:</strong> Der Text einer Mail wird nur kurz
            für die automatische Auswertung verarbeitet und danach verworfen.
            Gespeichert werden Absender, Empfänger, Datum, Betreff, ein kurzer
            verschlüsselter Ausschnitt und das Ergebnis der Auswertung.
          </li>
          <li>
            <strong>Speicherort:</strong> Datenbank in Zürich, Anwendung in der
            EU, KI-Auswertung bei Infomaniak in der Schweiz.
          </li>
          <li>
            <strong>Befristet:</strong> Der Zugriff endet automatisch mit dem
            Testende. Alle Daten werden spätestens 30 Tage danach gelöscht. Sie
            können den Test jederzeit beenden und die sofortige Löschung
            verlangen.
          </li>
          <li>
            <strong>Jederzeit widerrufbar:</strong> Die Freigabe können Sie auch
            selbst in Ihrem Microsoft- oder Google-Konto entziehen.
          </li>
        </ul>
        <p>
          Alle Details finden Sie in unserer{" "}
          <Link to="/datenschutz#mail-rapport-test">Datenschutzerklärung</Link>,
          Abschnitt «Mail-Rapport-Test».
        </p>
      </LegalSection>

      <LegalSection title="Interessiert?">
        <p>
          Der Test ist für Sie kostenlos und unverbindlich. Melden Sie sich bei
          uns, dann richten wir ihn gemeinsam ein.
        </p>
        <p>
          Kontakt: <a href={`mailto:${MAIL}`}>{MAIL}</a>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default MailRapportTest;
