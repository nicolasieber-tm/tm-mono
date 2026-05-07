import { Link } from "react-router-dom";
import Footer from "@/components/landing/Footer";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-slate-900 mb-2">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function Datenschutz() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <div className="flex justify-center w-full pt-8 pb-6">
        <Link to="/" className="inline-block">
          <img src="/auron-logo.png" alt="Auron Logo" className="h-12 w-auto" />
        </Link>
      </div>

      <main className="flex-grow w-full max-w-3xl mx-auto px-6 pb-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Datenschutzerklärung</h1>

        <div className="space-y-8 text-slate-700 text-sm leading-relaxed">

          <section>
            <p className="mb-3">
              Verantwortliche Stelle im Sinne der Datenschutzgesetze, insbesondere der EU-Datenschutzgrundverordnung (DSGVO), ist:
            </p>
            <p className="font-semibold text-slate-900">Trending Media KLG</p>
            <p>Hasenmattweg 35</p>
            <p>4515 Oberdorf</p>
            <p>Schweiz</p>
            <p className="mt-2">E-Mail: <a href="mailto:info@trendingmedia.ch" className="text-primary hover:underline">info@trendingmedia.ch</a></p>
            <p>Telefon: Auf Anfrage</p>
          </section>

          <Section title="Allgemeiner Hinweis">
            <p>
              Gestützt auf Artikel 13 der schweizerischen Bundesverfassung und den datenschutzrechtlichen Bestimmungen des Bundes (Datenschutzgesetz, DSG) hat jede Person Anspruch auf Schutz ihrer Privatsphäre sowie auf Schutz vor Missbrauch ihrer persönlichen Daten. Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>
            <p>
              In Zusammenarbeit mit unseren Hosting-Providern bemühen wir uns, die Datenbanken so gut wie möglich vor fremden Zugriffen, Verlusten, Missbrauch oder vor Fälschung zu schützen.
            </p>
            <p>
              Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.
            </p>
            <p>
              Durch die Nutzung dieser Website erklären Sie sich mit der Erhebung, Verarbeitung und Nutzung von Daten gemäss der nachfolgenden Beschreibung einverstanden. Diese Website kann grundsätzlich ohne Registrierung besucht werden. Dabei werden Daten wie beispielsweise aufgerufene Seiten bzw. Namen der abgerufenen Datei, Datum und Uhrzeit zu statistischen Zwecken auf dem Server gespeichert, ohne dass diese Daten unmittelbar auf Ihre Person bezogen werden. Personenbezogene Daten, insbesondere Name, Adresse oder E-Mail-Adresse werden soweit möglich auf freiwilliger Basis erhoben. Ohne Ihre Einwilligung erfolgt keine Weitergabe der Daten an Dritte.
            </p>
          </Section>

          <Section title="Bearbeitung von Personendaten">
            <p>
              Personendaten sind alle Angaben, die sich auf eine bestimmte oder bestimmbare Person beziehen. Eine betroffene Person ist eine Person, über die Personendaten bearbeitet werden. Bearbeiten umfasst jeden Umgang mit Personendaten, unabhängig von den angewandten Mitteln und Verfahren, insbesondere das Aufbewahren, Bekanntgeben, Beschaffen, Löschen, Speichern, Verändern, Vernichten und Verwenden von Personendaten.
            </p>
            <p>
              Wir bearbeiten Personendaten im Einklang mit dem schweizerischen Datenschutzrecht. Im Übrigen bearbeiten wir – soweit und sofern die EU-DSGVO anwendbar ist – Personendaten gemäss folgenden Rechtsgrundlagen im Zusammenhang mit Art. 6 Abs. 1 DSGVO:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Einwilligung (Art. 6 Abs. 1 S. 1 lit. a. DSGVO)</li>
              <li>Vertragserfüllung und vorvertragliche Anfragen (Art. 6 Abs. 1 S. 1 lit. b. DSGVO)</li>
              <li>Rechtliche Verpflichtung (Art. 6 Abs. 1 S. 1 lit. c. DSGVO)</li>
              <li>Schutz lebenswichtiger Interessen (Art. 6 Abs. 1 S. 1 lit. d. DSGVO)</li>
              <li>Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f. DSGVO)</li>
            </ul>
            <p>
              Wir bearbeiten Personendaten für jene Dauer, die für den jeweiligen Zweck oder die jeweiligen Zwecke erforderlich ist. Bei länger dauernden Aufbewahrungspflichten aufgrund von gesetzlichen und sonstigen Pflichten, denen wir unterliegen, schränken wir die Bearbeitung entsprechend ein.
            </p>
          </Section>

          <Section title="Massgebliche Rechtsgrundlagen">
            <p>
              Nach Massgabe des Art. 13 DSGVO teilen wir Ihnen die Rechtsgrundlagen unserer Datenverarbeitungen mit. Sofern die Rechtsgrundlage in der Datenschutzerklärung nicht genannt wird, gilt Folgendes: Die Rechtsgrundlage für die Einholung von Einwilligungen ist Art. 6 Abs. 1 lit. a und Art. 7 DSGVO, die Rechtsgrundlage für die Verarbeitung zur Erfüllung unserer Leistungen und Durchführung vertraglicher Massnahmen sowie Beantwortung von Anfragen ist Art. 6 Abs. 1 lit. b DSGVO, die Rechtsgrundlage für die Verarbeitung zur Erfüllung unserer rechtlichen Verpflichtungen ist Art. 6 Abs. 1 lit. c DSGVO, und die Rechtsgrundlage für die Verarbeitung zur Wahrung unserer berechtigten Interessen ist Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </Section>

          <Section title="Sicherheitsmassnahmen">
            <p>
              Wir treffen nach Massgabe der gesetzlichen Vorgaben unter Berücksichtigung des Stands der Technik, der Implementierungskosten und der Art, des Umfangs, der Umstände und der Zwecke der Verarbeitung sowie der unterschiedlichen Eintrittswahrscheinlichkeiten und des Ausmasses der Bedrohung der Rechte und Freiheiten natürlicher Personen geeignete technische und organisatorische Massnahmen, um ein dem Risiko angemessenes Schutzniveau zu gewährleisten.
            </p>
            <p>
              Zu den Massnahmen gehören insbesondere die Sicherung der Vertraulichkeit, Integrität und Verfügbarkeit von Daten durch Kontrolle des physischen und elektronischen Zugangs zu den Daten als auch des sie betreffenden Zugriffs, der Eingabe, der Weitergabe, der Sicherung der Verfügbarkeit und ihrer Trennung.
            </p>
          </Section>

          <Section title="Übermittlung von personenbezogenen Daten">
            <p>
              Im Rahmen unserer Verarbeitung von personenbezogenen Daten kommt es vor, dass die Daten an andere Stellen, Unternehmen, rechtlich selbstständige Organisationseinheiten oder Personen übermittelt oder sie ihnen gegenüber offengelegt werden. In solchen Fällen beachten wir die gesetzlichen Vorgaben und schliessen insbesondere entsprechende Verträge bzw. Vereinbarungen, die dem Schutz Ihrer Daten dienen, mit den Empfängern Ihrer Daten ab.
            </p>
          </Section>

          <Section title="Datenverarbeitung in Drittländern">
            <p>
              Sofern wir Daten in einem Drittland (d.h., ausserhalb der Europäischen Union (EU), des Europäischen Wirtschaftsraums (EWR)) verarbeiten oder die Verarbeitung im Rahmen der Inanspruchnahme von Diensten Dritter oder der Offenlegung bzw. Übermittlung von Daten an andere Personen, Stellen oder Unternehmen stattfindet, erfolgt dies nur im Einklang mit den gesetzlichen Vorgaben.
            </p>
          </Section>

          <Section title="Datenschutzerklärung für Cookies">
            <p>
              Diese Website verwendet Cookies. Cookies sind Textdateien, die Daten von besuchten Websites oder Domains enthalten und von einem Browser auf dem Computer des Benutzers gespeichert werden. Ein Cookie dient in erster Linie dazu, die Informationen über einen Benutzer während oder nach seinem Besuch innerhalb eines Onlineangebotes zu speichern.
            </p>
            <p>Die folgenden Cookie-Typen und Funktionen werden unterschieden:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Temporäre Cookies (Session-Cookies):</strong> Werden spätestens gelöscht, nachdem ein Nutzer ein Online-Angebot verlassen und seinen Browser geschlossen hat.</li>
              <li><strong>Permanente Cookies:</strong> Bleiben auch nach dem Schliessen des Browsers gespeichert.</li>
              <li><strong>First-Party-Cookies:</strong> Werden von uns selbst gesetzt.</li>
              <li><strong>Third-Party-Cookies:</strong> Werden hauptsächlich von Werbetreibenden verwendet.</li>
              <li><strong>Notwendige Cookies:</strong> Für den Betrieb einer Webseite unbedingt erforderlich.</li>
              <li><strong>Statistik-, Marketing- und Personalisierung-Cookies:</strong> Werden im Rahmen der Reichweitenmessung sowie für Nutzerprofile eingesetzt.</li>
            </ul>
            <p>
              <strong>Speicherdauer:</strong> Sofern wir Ihnen keine expliziten Angaben zur Speicherdauer von permanenten Cookies mitteilen, gehen Sie bitte davon aus, dass die Speicherdauer bis zu zwei Jahre betragen kann.
            </p>
            <p>
              <strong>Widerruf und Widerspruch (Opt-Out):</strong> Sie können Ihren Widerspruch mittels der Einstellungen Ihres Browsers erklären, z.B. indem Sie die Nutzung von Cookies deaktivieren. Ein Widerspruch gegen den Einsatz von Cookies zu Zwecken des Onlinemarketings kann auch unter <a href="https://optout.aboutads.info" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">optout.aboutads.info</a> und <a href="https://www.youronlinechoices.com/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">youronlinechoices.com</a> erklärt werden.
            </p>
          </Section>

          <Section title="Datenschutzerklärung für SSL-/TLS-Verschlüsselung">
            <p>
              Diese Website nutzt aus Gründen der Sicherheit und zum Schutz der Übertragung vertraulicher Inhalte eine SSL-/TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von «http://» auf «https://» wechselt und an dem Schloss-Symbol in Ihrer Browserzeile. Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.
            </p>
          </Section>

          <Section title="Datenschutzerklärung für Server-Log-Files">
            <p>
              Der Provider dieser Website erhebt und speichert automatisch Informationen in so genannten Server-Log-Files, die Ihr Browser automatisch an uns übermittelt. Dies sind: Browsertyp und -version, verwendetes Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage. Diese Daten sind nicht bestimmten Personen zuordenbar. Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
            </p>
          </Section>

          <Section title="Dienste von Dritten">
            <p>
              Diese Website verwendet allenfalls Google Maps für das Einbetten von Karten, Google Invisible reCAPTCHA für den Schutz gegen Bots und Spam sowie YouTube für das Einbetten von Videos. Diese Dienste der amerikanischen Google LLC verwenden unter anderem Cookies und infolgedessen werden Daten an Google in den USA übertragen. Google hat sich verpflichtet, einen angemessenen Datenschutz gemäss dem amerikanisch-europäischen und dem amerikanisch-schweizerischen Privacy Shield zu gewährleisten.
            </p>
          </Section>

          <Section title="Datenschutzerklärung für Kontaktformular">
            <p>
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
            </p>
          </Section>

          <Section title="Rechte betroffener Personen">
            <p>Sie haben folgende Rechte in Bezug auf Ihre personenbezogenen Daten:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Recht auf Bestätigung</strong> – ob betreffende personenbezogene Daten verarbeitet werden.</li>
              <li><strong>Recht auf Auskunft</strong> – über die zu Ihrer Person gespeicherten personenbezogenen Daten.</li>
              <li><strong>Recht auf Berichtigung</strong> – unrichtiger personenbezogener Daten.</li>
              <li><strong>Recht auf Löschung</strong> – (Recht auf Vergessen werden) bei Vorliegen der gesetzlichen Voraussetzungen.</li>
              <li><strong>Recht auf Einschränkung der Verarbeitung</strong> – bei Vorliegen der gesetzlichen Voraussetzungen.</li>
              <li><strong>Recht auf Datenübertragbarkeit</strong> – Erhalt Ihrer Daten in einem strukturierten, gängigen und maschinenlesbaren Format.</li>
              <li><strong>Recht auf Widerspruch</strong> – gegen die Verarbeitung Sie betreffender personenbezogener Daten.</li>
              <li><strong>Recht auf Widerruf</strong> – einer datenschutzrechtlichen Einwilligung jederzeit.</li>
            </ul>
            <p>
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: <a href="mailto:info@trendingmedia.ch" className="text-primary hover:underline">info@trendingmedia.ch</a>
            </p>
          </Section>

          <Section title="Datenschutzerklärung für Google Analytics">
            <p>
              Diese Website benutzt Google Analytics, einen Webanalysedienst der Google Ireland Limited. Über die gewonnenen Statistiken können wir unser Angebot verbessern und für Sie als Nutzer interessanter ausgestalten. Rechtsgrundlage für die Nutzung von Google Analytics ist Art. 6 Abs. 1 S. 1 lit. f DS-GVO. Die im Rahmen von Google Analytics von Ihrem Browser übermittelte IP-Adresse wird nicht mit anderen Daten von Google zusammengeführt. Die IP-Adressen werden anonymisiert (IP-Masking), sodass eine Personenbeziehbarkeit ausgeschlossen werden kann.
            </p>
          </Section>

          <Section title="Hinweis zur Datenweitergabe in die USA">
            <p>
              Auf unserer Website sind unter anderem Tools von Unternehmen mit Sitz in den USA eingebunden. Wenn diese Tools aktiv sind, können Ihre personenbezogenen Daten an die US-Server der jeweiligen Unternehmen weitergegeben werden. Wir weisen darauf hin, dass die USA kein sicherer Drittstaat im Sinne des EU-Datenschutzrechts sind. Wir haben auf diese Verarbeitungstätigkeiten keinen Einfluss.
            </p>
          </Section>

          <Section title="Urheberrechte">
            <p>
              Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf der Website, gehören ausschliesslich dem Betreiber dieser Website oder den speziell genannten Rechteinhabern. Für die Reproduktion von sämtlichen Dateien ist die schriftliche Zustimmung des Urheberrechtsträgers im Voraus einzuholen.
            </p>
          </Section>

          <Section title="Allgemeiner Haftungsausschluss">
            <p>
              Alle Angaben unseres Internetangebotes wurden sorgfältig geprüft. Wir bemühen uns, unser Informationsangebot aktuell, inhaltlich richtig und vollständig anzubieten. Trotzdem kann das Auftreten von Fehlern nicht völlig ausgeschlossen werden, womit wir keine Garantie für Vollständigkeit, Richtigkeit und Aktualität übernehmen können. Haftungsansprüche aus Schäden materieller oder ideeller Art, die durch die Nutzung der angebotenen Informationen verursacht wurden, sind ausgeschlossen, sofern kein nachweislich vorsätzliches oder grob fahrlässiges Verschulden vorliegt.
            </p>
          </Section>

          <Section title="Änderungen">
            <p>
              Wir können diese Datenschutzerklärung jederzeit ohne Vorankündigung anpassen. Es gilt die jeweils aktuelle, auf unserer Website publizierte Fassung. Soweit die Datenschutzerklärung Teil einer Vereinbarung mit Ihnen ist, werden wir Sie im Falle einer Aktualisierung über die Änderung per E-Mail oder auf andere geeignete Weise informieren.
            </p>
          </Section>

          <Section title="Fragen an den Datenschutzbeauftragten">
            <p>
              Wenn Sie Fragen zum Datenschutz haben, schreiben Sie uns bitte eine E-Mail an: <a href="mailto:info@trendingmedia.ch" className="text-primary hover:underline">info@trendingmedia.ch</a>
            </p>
          </Section>

          <p className="text-xs text-slate-400 pt-4 border-t border-slate-200">Quelle: SwissAnwalt</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
