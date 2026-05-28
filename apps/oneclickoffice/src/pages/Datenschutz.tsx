import { Link } from "react-router-dom";

const Datenschutz = () => (
  <div className="min-h-screen bg-background text-foreground section-padding">
    <div className="section-container max-w-[760px]">
      <Link to="/" className="text-primary text-sm mb-8 inline-block hover:underline">
        ← Zurück zur Startseite
      </Link>
      <h1 className="headline-h2 mb-8">Datenschutzerklärung</h1>
      <div className="text-text-secondary space-y-6">
        <section>
          <p className="mb-4">Verantwortliche Stelle im Sinne der Datenschutzgesetze, insbesondere der EU-Datenschutzgrundverordnung (DSGVO), ist:</p>
          <p>
            Trending Media KLG<br />
            Hasenmattweg 35<br />
            4515 Oberdorf<br />
            Schweiz
          </p>
          <p className="mt-4"><strong>E-Mail:</strong> info@trendingmedia.ch</p>
          <p><strong>Telefon:</strong> Auf Anfrage</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Allgemeiner Hinweis</h2>
          <p className="mb-4">Gestützt auf Artikel 13 der schweizerischen Bundesverfassung und den datenschutzrechtlichen Bestimmungen des Bundes (Datenschutzgesetz, DSG) hat jede Person Anspruch auf Schutz ihrer Privatsphäre sowie auf Schutz vor Missbrauch ihrer persönlichen Daten. Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>
          <p className="mb-4">In Zusammenarbeit mit unseren Hosting-Providern bemühen wir uns, die Datenbanken so gut wie möglich vor fremden Zugriffen, Verlusten, Missbrauch oder vor Fälschung zu schützen.</p>
          <p className="mb-4">Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch Dritte ist nicht möglich.</p>
          <p>Durch die Nutzung dieser Website erklären Sie sich mit der Erhebung, Verarbeitung und Nutzung von Daten gemäss der nachfolgenden Beschreibung einverstanden. Diese Website kann grundsätzlich ohne Registrierung besucht werden. Dabei werden Daten wie beispielsweise aufgerufene Seiten bzw. Namen der abgerufenen Datei, Datum und Uhrzeit zu statistischen Zwecken auf dem Server gespeichert, ohne dass diese Daten unmittelbar auf Ihre Person bezogen werden. Personenbezogene Daten, insbesondere Name, Adresse oder E-Mail-Adresse werden soweit möglich auf freiwilliger Basis erhoben. Ohne Ihre Einwilligung erfolgt keine Weitergabe der Daten an Dritte.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Bearbeitung von Personendaten</h2>
          <p className="mb-4">Personendaten sind alle Angaben, die sich auf eine bestimmte oder bestimmbare Person beziehen. Eine betroffene Person ist eine Person, über die Personendaten bearbeitet werden. Bearbeiten umfasst jeden Umgang mit Personendaten, unabhängig von den angewandten Mitteln und Verfahren, insbesondere das Aufbewahren, Bekanntgeben, Beschaffen, Löschen, Speichern, Verändern, Vernichten und Verwenden von Personendaten.</p>
          <p className="mb-4">Wir bearbeiten Personendaten im Einklang mit dem schweizerischen Datenschutzrecht. Im Übrigen bearbeiten wir – soweit und sofern die EU-DSGVO anwendbar ist – Personendaten gemäss folgenden Rechtsgrundlagen im Zusammenhang mit Art. 6 Abs. 1 DSGVO:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><strong>Einwilligung (Art. 6 Abs. 1 S. 1 lit. a. DSGVO)</strong> - Die betroffene Person hat ihre Einwilligung in die Verarbeitung der sie betreffenden personenbezogenen Daten für einen spezifischen Zweck oder mehrere bestimmte Zwecke gegeben.</li>
            <li><strong>Vertragserfüllung und vorvertragliche Anfragen (Art. 6 Abs. 1 S. 1 lit. b. DSGVO)</strong> - Die Verarbeitung ist für die Erfüllung eines Vertrags, dessen Vertragspartei die betroffene Person ist, oder zur Durchführung vorvertraglicher Massnahmen erforderlich, die auf Anfrage der betroffenen Person erfolgen.</li>
            <li><strong>Rechtliche Verpflichtung (Art. 6 Abs. 1 S. 1 lit. c. DSGVO)</strong> - Die Verarbeitung ist zur Erfüllung einer rechtlichen Verpflichtung erforderlich, der der Verantwortliche unterliegt.</li>
            <li><strong>Schutz lebenswichtiger Interessen (Art. 6 Abs. 1 S. 1 lit. d. DSGVO)</strong> - Die Verarbeitung ist erforderlich, um lebenswichtige Interessen der betroffenen Person oder einer anderen natürlichen Person zu schützen.</li>
            <li><strong>Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f. DSGVO)</strong> - Die Verarbeitung ist zur Wahrung der berechtigten Interessen des Verantwortlichen oder eines Dritten erforderlich, sofern nicht die Interessen oder Grundrechte und Grundfreiheiten der betroffenen Person, die den Schutz personenbezogener Daten erfordern, überwiegen.</li>
          </ul>
          <p>Wir bearbeiten Personendaten für jene Dauer, die für den jeweiligen Zweck oder die jeweiligen Zwecke erforderlich ist. Bei länger dauernden Aufbewahrungspflichten aufgrund von gesetzlichen und sonstigen Pflichten, denen wir unterliegen, schränken wir die Bearbeitung entsprechend ein.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Massgebliche Rechtsgrundlagen</h2>
          <p>Nach Massgabe des Art. 13 DSGVO teilen wir Ihnen die Rechtsgrundlagen unserer Datenverarbeitungen mit. Sofern die Rechtsgrundlage in der Datenschutzerklärung nicht genannt wird, gilt Folgendes: Die Rechtsgrundlage für die Einholung von Einwilligungen ist Art. 6 Abs. 1 lit. a und Art. 7 DSGVO, die Rechtsgrundlage für die Verarbeitung zur Erfüllung unserer Leistungen und Durchführung vertraglicher Massnahmen sowie Beantwortung von Anfragen ist Art. 6 Abs. 1 lit. b DSGVO, die Rechtsgrundlage für die Verarbeitung zur Erfüllung unserer rechtlichen Verpflichtungen ist Art. 6 Abs. 1 lit. c DSGVO, und die Rechtsgrundlage für die Verarbeitung zur Wahrung unserer berechtigten Interessen ist Art. 6 Abs. 1 lit. f DSGVO.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Sicherheitsmassnahmen</h2>
          <p className="mb-4">Wir treffen nach Massgabe der gesetzlichen Vorgaben unter Berücksichtigung des Stands der Technik, der Implementierungskosten und der Art, des Umfangs, der Umstände und der Zwecke der Verarbeitung sowie der unterschiedlichen Eintrittswahrscheinlichkeiten und des Ausmasses der Bedrohung der Rechte und Freiheiten natürlicher Personen geeignete technische und organisatorische Massnahmen, um ein dem Risiko angemessenes Schutzniveau zu gewährleisten.</p>
          <p>Zu den Massnahmen gehören insbesondere die Sicherung der Vertraulichkeit, Integrität und Verfügbarkeit von Daten durch Kontrolle des physischen und elektronischen Zugangs zu den Daten als auch des sie betreffenden Zugriffs, der Eingabe, der Weitergabe, der Sicherung der Verfügbarkeit und ihrer Trennung. Des Weiteren haben wir Verfahren eingerichtet, die eine Wahrnehmung von Betroffenenrechten, die Löschung von Daten und Reaktionen auf die Gefährdung der Daten gewährleisten.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold mb-2">Übermittlung von personenbezogenen Daten</h2>
          <p>Im Rahmen unserer Verarbeitung von personenbezogenen Daten kommt es vor, dass die Daten an andere Stellen, Unternehmen, rechtlich selbstständige Organisationseinheiten oder Personen übermittelt oder sie ihnen gegenüber offengelegt werden. Zu den Empfängern dieser Daten können z.B. mit IT-Aufgaben beauftragte Dienstleister oder Anbieter von Diensten und Inhalten, die in eine Webseite eingebunden werden, gehören. In solchen Fall beachten wir die gesetzlichen Vorgaben und schliessen insbesondere entsprechende Verträge bzw. Vereinbarungen, die dem Schutz Ihrer Daten dienen, mit den Empfängern Ihrer Daten ab.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Datenverarbeitung in Drittländern</h2>
          <p className="mb-4">Sofern wir Daten in einem Drittland (d.h., ausserhalb der Europäischen Union (EU), des Europäischen Wirtschaftsraums (EWR)) verarbeiten oder die Verarbeitung im Rahmen der Inanspruchnahme von Diensten Dritter oder der Offenlegung bzw. Übermittlung von Daten an andere Personen, Stellen oder Unternehmen stattfindet, erfolgt dies nur im Einklang mit den gesetzlichen Vorgaben.</p>
          <p>Vorbehaltlich ausdrücklicher Einwilligung oder vertraglich oder gesetzlich erforderlicher Übermittlung, verarbeiten wir die Daten nur in Drittländern mit einem anerkannten Datenschutzniveau, vertraglicher Verpflichtung durch sogenannte Standardschutzklauseln der EU-Kommission, beim Vorliegen von Zertifizierungen oder verbindlichen internen Datenschutzvorschriften (Art. 44 bis 49 DSGVO, Informationsseite der EU-Kommission: https://ec.europa.eu/info/law/law-topic/data-protection/international-dimension-data-protection_de).</p>
        </section>

        <section>
           <h2 className="text-xl font-bold mb-2">Datenschutzerklärung für Cookies</h2>
           <p className="mb-4">Diese Website verwendet Cookies. Cookies sind Textdateien, die Daten von besuchten Websites oder Domains enthalten und von einem Browser auf dem Computer des Benutzers gespeichert werden. Ein Cookie dient in erster Linie dazu, die Informationen über einen Benutzer während oder nach seinem Besuch innerhalb eines Onlineangebotes zu speichern.</p>
           <p className="mb-4">Die folgenden Cookie-Typen und Funktionen werden unterschieden:</p>
           <ul className="list-disc pl-5 space-y-2 mb-4">
            <li><strong>Temporäre Cookies (auch: Session- oder Sitzungs-Cookies):</strong> Temporäre Cookies werden spätestens gelöscht, nachdem ein Nutzer ein Online-Angebot verlassen und seinen Browser geschlossen hat.</li>
            <li><strong>Permanente Cookies:</strong> Permanente Cookies bleiben auch nach dem Schliessen des Browsers gespeichert.</li>
            <li><strong>First-Party-Cookies:</strong> First-Party-Cookies werden von uns selbst gesetzt.</li>
            <li><strong>Third-Party-Cookies (auch: Drittanbieter-Cookies):</strong> Drittanbieter-Cookies werden hauptsächlich von Werbetreibenden (sog. Dritten) verwendet, um Benutzerinformationen zu verarbeiten.</li>
            <li><strong>Notwendige (auch: essenzielle oder unbedingt erforderliche) Cookies:</strong> Cookies können zum einen für den Betrieb einer Webseite unbedingt erforderlich sein.</li>
            <li><strong>Statistik-, Marketing- und Personalisierung-Cookies:</strong> Ferner werden Cookies im Regelfall auch im Rahmen der Reichweitenmessung eingesetzt sowie dann, wenn die Interessen eines Nutzers oder sein Verhalten auf einzelnen Webseiten in einem Nutzerprofil gespeichert werden.</li>
           </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Datenschutzerklärung für SSL-/TLS-Verschlüsselung</h2>
          <p className="mb-4">Diese Website nutzt aus Gründen der Sicherheit und zum Schutz der Übertragung vertraulicher Inhalte, wie zum Beispiel der Anfragen, die Sie an uns als Seitenbetreiber senden, eine SSL-/TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.</p>
          <p>Wenn die SSL bzw. TLS Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Datenübertragungssicherheit (ohne SSL)</h2>
          <p className="mb-4">Bitte beachten Sie, dass Daten, die über ein offenes Netz wie das Internet oder einen E-Mail-Dienst ohne SSL-Verschlüsselung übermittelt werden, für jedermann einsehbar sind. Eine unverschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers "http://" anzeigt und kein Schloss-Symbol in Ihrer Browserzeile angezeigt wird.</p>
          <p>Wenn Sie über ein offenes Netz oder Netze von Drittanbietern personenbezogene Informationen bekannt geben, sollten Sie sich der Tatsache bewusst sein, dass Ihre Daten verloren gehen oder Dritte potenziell auf diese Informationen zugreifen und folglich die Daten ohne Ihre Zustimmung sammeln und nutzen können.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Datenschutzerklärung für Server-Log-Files</h2>
          <p className="mb-4">Der Provider dieser Website erhebt und speichert automatisch Informationen in so genannten Server-Log Files, die Ihr Browser automatisch an uns übermittelt. Dies sind:</p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Browsertyp und Browserversion</li>
            <li>verwendetes Betriebssystem</li>
            <li>Referrer URL</li>
            <li>Hostname des zugreifenden Rechners</li>
            <li>Uhrzeit der Serveranfrage</li>
          </ul>
          <p>Diese Daten sind nicht bestimmten Personen zuordenbar. Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Datenschutzerklärung für Kontaktformular</h2>
          <p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Rechte betroffener Personen</h2>
          <p className="mb-4"><strong>Recht auf Bestätigung:</strong> Jede betroffene Person hat das Recht, vom Betreiber der Website eine Bestätigung darüber zu verlangen, ob betroffene Personen betreffende, personenbezogene Daten verarbeitet werden.</p>
          <p className="mb-4"><strong>Recht auf Auskunft:</strong> Jede von der Verarbeitung betroffene Person mit personenbezogenen Daten hat das Recht, jederzeit vom Betreiber dieser Website unentgeltliche Auskunft über die zu seiner Person gespeicherten personenbezogenen Daten und eine Kopie dieser Auskunft zu erhalten.</p>
          <p className="mb-4"><strong>Recht auf Berichtigung:</strong> Jede von der Verarbeitung personenbezogener Daten betroffene Person hat das Recht, die unverzügliche Berichtigung sie betreffender unrichtiger personenbezogener Daten zu verlangen.</p>
          <p className="mb-4"><strong>Recht auf Löschung (Recht auf Vergessen werden):</strong> Jede von der Verarbeitung personenbezogener Daten betroffene Person hat das Recht, von dem Verantwortlichen dieser Website zu verlangen, dass die sie betreffenden personenbezogenen Daten unverzüglich gelöscht werden.</p>
          <p className="mb-4"><strong>Recht auf Einschränkung der Verarbeitung:</strong> Jede von der Verarbeitung personenbezogener Daten betroffene Person hat das Recht, von dem Verantwortlichen dieser Website die Einschränkung der Verarbeitung zu verlangen.</p>
          <p className="mb-4"><strong>Recht auf Datenübertragbarkeit:</strong> Jede von der Verarbeitung personenbezogener Daten betroffene Person hat das Recht, die sie betreffenden personenbezogenen Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten.</p>
          <p className="mb-4"><strong>Recht auf Widerspruch:</strong> Jede von der Verarbeitung personenbezogener Daten betroffene Person hat das Recht, aus Gründen, die sich aus ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung sie betreffender personenbezogener Daten, Widerspruch einzulegen.</p>
          <p><strong>Recht auf Widerruf einer datenschutzrechtlichen Einwilligung:</strong> Jede von der Verarbeitung personenbezogener Daten betroffene Person hat das Recht, eine abgegebene Einwilligung zur Verarbeitung personenbezogener Daten jederzeit zu widerrufen.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Verwendung von Google Analytics</h2>
          <p className="mb-4">Diese Website benutzt Google Analytics, einen Webanalysedienst der Google Ireland Limited. Wenn der Verantwortliche für die Datenverarbeitung auf dieser Website ausserhalb des Europäischen Wirtschaftsraumes oder der Schweiz sitzt, dann erfolgt die Google Analytics Datenverarbeitung durch Google LLC. Google LLC und Google Ireland Limited werden nachfolgend «Google» genannt.</p>
          <p>Über die gewonnenen Statistiken können wir unser Angebot verbessern und für Sie als Nutzer interessanter ausgestalten.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Änderungen</h2>
          <p>Wir können diese Datenschutzerklärung jederzeit ohne Vorankündigung anpassen. Es gilt die jeweils aktuelle, auf unserer Website publizierte Fassung. Soweit die Datenschutzerklärung Teil einer Vereinbarung mit Ihnen ist, werden wir Sie im Falle einer Aktualisierung über die Änderung per E-Mail oder auf andere geeignete Weise informieren.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Fragen an den Datenschutzbeauftragten</h2>
          <p>Wenn Sie Fragen zum Datenschutz haben, schreiben Sie uns bitte eine E-Mail oder wenden Sie sich direkt an die für den Datenschutz zu Beginn der Datenschutzerklärung aufgeführten, verantwortlichen Person in unserer Organisation.</p>
        </section>

        <p className="text-sm text-text-muted mt-12">Quelle: SwissAnwalt</p>
      </div>
    </div>
  </div>
);

export default Datenschutz;
