import { Link } from "react-router-dom";

// Rechtliche Pflichtseite (Route /datenschutz). Schweizer DSG / EU-DSGVO-konform.
const Datenschutz = () => (
  <div className="min-h-screen bg-background text-foreground section-padding">
    <div className="section-container max-w-[760px]">
      <Link to="/" className="mb-8 inline-block text-sm text-accent-deep hover:underline">
        ← Zurück zur Startseite
      </Link>
      <h1 className="headline-h2 mb-8 text-text-primary">Datenschutzerklärung</h1>
      <div className="space-y-6 text-text-secondary">
        <section>
          <p className="mb-4">
            Verantwortliche Stelle im Sinne der Datenschutzgesetze, insbesondere der
            EU-Datenschutzgrundverordnung (DSGVO), ist:
          </p>
          <p>
            Trending Media KLG<br />
            Hasenmattweg 35<br />
            4515 Oberdorf<br />
            Schweiz
          </p>
          <p className="mt-4">
            <strong>E-Mail:</strong> info@trendingmedia.ch
          </p>
          <p>
            <strong>Telefon:</strong> Auf Anfrage
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">Allgemeiner Hinweis</h2>
          <p className="mb-4">
            Gestützt auf Artikel 13 der schweizerischen Bundesverfassung und den
            datenschutzrechtlichen Bestimmungen des Bundes (Datenschutzgesetz, DSG) hat jede Person
            Anspruch auf Schutz ihrer Privatsphäre sowie auf Schutz vor Missbrauch ihrer
            persönlichen Daten. Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen
            Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und
            entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser
            Datenschutzerklärung.
          </p>
          <p className="mb-4">
            In Zusammenarbeit mit unseren Hosting-Providern bemühen wir uns, die Datenbanken so gut
            wie möglich vor fremden Zugriffen, Verlusten, Missbrauch oder vor Fälschung zu schützen.
          </p>
          <p className="mb-4">
            Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation
            per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem
            Zugriff durch Dritte ist nicht möglich.
          </p>
          <p>
            Durch die Nutzung dieser Website erklären Sie sich mit der Erhebung, Verarbeitung und
            Nutzung von Daten gemäss der nachfolgenden Beschreibung einverstanden. Diese Website
            kann grundsätzlich ohne Registrierung besucht werden. Dabei werden Daten wie
            beispielsweise aufgerufene Seiten bzw. Namen der abgerufenen Datei, Datum und Uhrzeit zu
            statistischen Zwecken auf dem Server gespeichert, ohne dass diese Daten unmittelbar auf
            Ihre Person bezogen werden. Personenbezogene Daten, insbesondere Name, Adresse oder
            E-Mail-Adresse werden soweit möglich auf freiwilliger Basis erhoben. Ohne Ihre
            Einwilligung erfolgt keine Weitergabe der Daten an Dritte.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">Bearbeitung von Personendaten</h2>
          <p className="mb-4">
            Personendaten sind alle Angaben, die sich auf eine bestimmte oder bestimmbare Person
            beziehen. Eine betroffene Person ist eine Person, über die Personendaten bearbeitet
            werden. Bearbeiten umfasst jeden Umgang mit Personendaten, unabhängig von den
            angewandten Mitteln und Verfahren, insbesondere das Aufbewahren, Bekanntgeben,
            Beschaffen, Löschen, Speichern, Verändern, Vernichten und Verwenden von Personendaten.
          </p>
          <p className="mb-4">
            Wir bearbeiten Personendaten im Einklang mit dem schweizerischen Datenschutzrecht. Im
            Übrigen bearbeiten wir, soweit und sofern die EU-DSGVO anwendbar ist, Personendaten
            gemäss folgenden Rechtsgrundlagen im Zusammenhang mit Art. 6 Abs. 1 DSGVO:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-5">
            <li>
              <strong>Einwilligung (Art. 6 Abs. 1 S. 1 lit. a. DSGVO)</strong> - Die betroffene
              Person hat ihre Einwilligung in die Verarbeitung der sie betreffenden
              personenbezogenen Daten für einen spezifischen Zweck oder mehrere bestimmte Zwecke
              gegeben.
            </li>
            <li>
              <strong>Vertragserfüllung und vorvertragliche Anfragen (Art. 6 Abs. 1 S. 1 lit. b.
              DSGVO)</strong> - Die Verarbeitung ist für die Erfüllung eines Vertrags, dessen
              Vertragspartei die betroffene Person ist, oder zur Durchführung vorvertraglicher
              Massnahmen erforderlich, die auf Anfrage der betroffenen Person erfolgen.
            </li>
            <li>
              <strong>Rechtliche Verpflichtung (Art. 6 Abs. 1 S. 1 lit. c. DSGVO)</strong> - Die
              Verarbeitung ist zur Erfüllung einer rechtlichen Verpflichtung erforderlich, der der
              Verantwortliche unterliegt.
            </li>
            <li>
              <strong>Berechtigte Interessen (Art. 6 Abs. 1 S. 1 lit. f. DSGVO)</strong> - Die
              Verarbeitung ist zur Wahrung der berechtigten Interessen des Verantwortlichen oder
              eines Dritten erforderlich, sofern nicht die Interessen oder Grundrechte und
              Grundfreiheiten der betroffenen Person überwiegen.
            </li>
          </ul>
          <p>
            Wir bearbeiten Personendaten für jene Dauer, die für den jeweiligen Zweck oder die
            jeweiligen Zwecke erforderlich ist. Bei länger dauernden Aufbewahrungspflichten aufgrund
            von gesetzlichen und sonstigen Pflichten, denen wir unterliegen, schränken wir die
            Bearbeitung entsprechend ein.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">Sicherheitsmassnahmen</h2>
          <p className="mb-4">
            Wir treffen nach Massgabe der gesetzlichen Vorgaben unter Berücksichtigung des Stands
            der Technik, der Implementierungskosten und der Art, des Umfangs, der Umstände und der
            Zwecke der Verarbeitung geeignete technische und organisatorische Massnahmen, um ein dem
            Risiko angemessenes Schutzniveau zu gewährleisten.
          </p>
          <p>
            Zu den Massnahmen gehören insbesondere die Sicherung der Vertraulichkeit, Integrität und
            Verfügbarkeit von Daten durch Kontrolle des physischen und elektronischen Zugangs zu den
            Daten als auch des sie betreffenden Zugriffs, der Eingabe, der Weitergabe, der Sicherung
            der Verfügbarkeit und ihrer Trennung. Des Weiteren haben wir Verfahren eingerichtet, die
            eine Wahrnehmung von Betroffenenrechten, die Löschung von Daten und Reaktionen auf die
            Gefährdung der Daten gewährleisten.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">SSL-/TLS-Verschlüsselung</h2>
          <p>
            Diese Website nutzt aus Gründen der Sicherheit und zum Schutz der Übertragung
            vertraulicher Inhalte, wie zum Beispiel der Anfragen, die Sie an uns als Seitenbetreiber
            senden, eine SSL-/TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie
            daran, dass die Adresszeile des Browsers von „http://" auf „https://" wechselt und an
            dem Schloss-Symbol in Ihrer Browserzeile.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">Server-Log-Files</h2>
          <p className="mb-4">
            Der Provider dieser Website erhebt und speichert automatisch Informationen in so
            genannten Server-Log Files, die Ihr Browser automatisch an uns übermittelt. Dies sind:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-5">
            <li>Browsertyp und Browserversion</li>
            <li>verwendetes Betriebssystem</li>
            <li>Referrer URL</li>
            <li>Hostname des zugreifenden Rechners</li>
            <li>Uhrzeit der Serveranfrage</li>
          </ul>
          <p>
            Diese Daten sind nicht bestimmten Personen zuordenbar. Eine Zusammenführung dieser Daten
            mit anderen Datenquellen wird nicht vorgenommen.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">Kontakt- und Anfrageformular</h2>
          <p>
            Wenn Sie uns über das Formular auf dieser Seite eine Anfrage zukommen lassen, werden
            Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen
            Kontaktdaten (Name, E-Mail, Telefon) sowie Ihre Antworten zur Vorqualifizierung zwecks
            Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese
            Daten geben wir nicht ohne Ihre Einwilligung weiter und nutzen sie ausschliesslich, um
            Sie zu kontaktieren.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">Datenverarbeitung in Drittländern</h2>
          <p>
            Sofern wir Daten in einem Drittland (d.h. ausserhalb der Europäischen Union (EU) oder
            des Europäischen Wirtschaftsraums (EWR)) verarbeiten oder die Verarbeitung im Rahmen der
            Inanspruchnahme von Diensten Dritter oder der Offenlegung bzw. Übermittlung von Daten an
            andere Personen, Stellen oder Unternehmen stattfindet, erfolgt dies nur im Einklang mit
            den gesetzlichen Vorgaben (Art. 44 bis 49 DSGVO), insbesondere auf Basis geeigneter
            Garantien wie den Standardvertragsklauseln der EU-Kommission.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">
            Cookies, Google Tag Manager, Google Analytics und Meta-Pixel
          </h2>
          <p className="mb-4">
            Diese Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Gerät
            gespeichert werden, um die Website funktionsfähig zu halten sowie deren Nutzung
            statistisch auszuwerten. Wir unterscheiden technisch notwendige Cookies, die für den
            Betrieb erforderlich sind, sowie Statistik-Cookies, die der anonymen Reichweitenmessung
            dienen. Diese setzen wir auf Grundlage unseres berechtigten Interesses an einer
            bedarfsgerechten Gestaltung unserer Website; Sie können der Reichweitenmessung jederzeit
            mit Wirkung für die Zukunft widersprechen (siehe Abschnitt „Einwilligung, Widerspruch
            und Consent Mode").
          </p>

          <h3 className="mb-2 mt-6 font-bold text-text-primary">Google Tag Manager</h3>
          <p className="mb-4">
            Wir nutzen den Google Tag Manager (Container-ID GTM-52V9SJ6J), einen Dienst der Google
            Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Der Google Tag Manager
            ist ein organisatorisches Werkzeug, mit dem wir Mess- und Analyse-Tags verwalten und
            ausspielen. Der Tag Manager selbst setzt keine Analyse-Cookies und speichert keine
            personenbezogenen Daten; er sorgt lediglich für das Laden und Steuern der nachfolgend
            beschriebenen Dienste – und zwar gemäss Ihren Datenschutz-Einstellungen (siehe Consent
            Mode weiter unten).
          </p>

          <h3 className="mb-2 mt-6 font-bold text-text-primary">Google Analytics 4</h3>
          <p className="mb-4">
            Zur Reichweitenmessung setzen wir Google Analytics 4 (GA4) ein, einen Dienst der Google
            Ireland Limited. Zur anonymen Reichweitenmessung werden dabei Cookies gesetzt und unter
            anderem folgende Daten verarbeitet:
          </p>
          <ul className="mb-4 list-disc space-y-2 pl-5">
            <li>Seitenaufrufe und Verweildauer</li>
            <li>verwendetes Gerät, Browser und Betriebssystem</li>
            <li>ungefähre, anonymisierte Herkunft (Land/Region) sowie Herkunftsquelle (Referrer)</li>
            <li>
              Interaktionen mit dem auf dieser Website bereitgestellten Video (z.&nbsp;B. Start,
              Fortschritt und Abschluss der Wiedergabe) sowie mit unseren Schaltflächen und dem
              Anmeldeformular (z.&nbsp;B. Klick auf einen Aufruf zur Handlung, Beginn und Absenden
              der Eingabe)
            </li>
          </ul>
          <p className="mb-4">
            Diese Daten nutzen wir ausschliesslich in aggregierter Form, um zu verstehen, wie unsere
            Website genutzt wird, und um sie zu verbessern. Eine Identifizierung Ihrer Person ist
            dabei nicht beabsichtigt.
          </p>

          <h3 className="mb-2 mt-6 font-bold text-text-primary">
            Einwilligung, Widerspruch und Google Consent Mode v2
          </h3>
          <p className="mb-4">Wir unterscheiden zwei Kategorien der Datenverarbeitung:</p>
          <p className="mb-4">
            <strong>Reichweitenmessung (Google Analytics 4):</strong> Diese erfolgt auf Grundlage
            unseres berechtigten Interesses (Art. 6 Abs. 1 lit. f DSGVO bzw. der entsprechenden
            Bestimmungen des Schweizer DSG) und ist standardmässig aktiv. Sie können ihr jederzeit
            widersprechen – über die Schaltfläche „Ablehnen" im Cookie-Hinweis oder jederzeit
            nachträglich über den Link „Cookie-Einstellungen" am Seitenende. Nach einem Widerspruch
            werden keine Analyse-Cookies mehr gesetzt.
          </p>
          <p className="mb-4">
            <strong>
              Werbebezogene Verarbeitung (z.&nbsp;B. Google-Signale, Remarketing):
            </strong>{" "}
            Diese aktivieren wir ausschliesslich mit Ihrer ausdrücklichen Einwilligung über die
            Schaltfläche „Akzeptieren". Ohne Einwilligung bleiben die entsprechenden Signale
            (ad_storage, ad_user_data, ad_personalization) deaktiviert.
          </p>
          <p className="mb-4">
            Technisch setzen wir den Google Consent Mode v2 ein: Ohne Ihre Einwilligung werden keine
            werbebezogenen Cookies gesetzt; an Google werden dann höchstens anonyme, cookielose
            Signale übermittelt. Wählen Sie „Ablehnen", deaktivieren wir zusätzlich die
            Reichweitenmessung vollständig.
          </p>

          <h3 className="mb-2 mt-6 font-bold text-text-primary">Datenübermittlung in die USA</h3>
          <p>
            Anbieter ist die Google Ireland Limited. Im Rahmen der Verarbeitung können Daten an die
            Google LLC in den USA übermittelt werden. Diese Übermittlung erfolgt auf Grundlage
            geeigneter Garantien, insbesondere der Standardvertragsklauseln der EU-Kommission sowie
            – soweit anwendbar – des EU-US Data Privacy Framework. Weitere Informationen zur
            Datenverarbeitung durch Google finden Sie in der{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-deep hover:underline"
            >
              Datenschutzerklärung von Google
            </a>
            .
          </p>

          <h3 className="mb-2 mt-6 font-bold text-text-primary">Meta-Pixel (Facebook &amp; Instagram)</h3>
          <p className="mb-4">
            Diese Website verwendet den „Meta-Pixel", ein Angebot der Meta Platforms Ireland
            Limited, 4 Grand Canal Square, Dublin 2, Irland. Mit dem Pixel messen wir die Wirksamkeit
            unserer Werbeanzeigen auf Facebook und Instagram, indem das Verhalten von Besucherinnen
            und Besuchern statistisch erfasst wird, nachdem diese auf eine Werbeanzeige geklickt
            haben. So können wir unsere Werbemassnahmen auswerten und für die Zukunft verbessern.
          </p>
          <p className="mb-4">
            Der Pixel registriert insbesondere den Aufruf unserer Seiten. Dabei kann das Cookie
            „_fbp" gesetzt sowie Ihre IP-Adresse und technische Angaben zu Browser und Gerät an Meta
            übermittelt werden. Eine direkte Identifizierung Ihrer Person ist dabei nicht
            beabsichtigt.
          </p>
          <h3 className="mb-2 mt-6 font-bold text-text-primary">
            Conversions API (serverseitige Übermittlung)
          </h3>
          <p className="mb-4">
            Ergänzend zum Meta-Pixel übermitteln wir den Abschluss einer Anmeldung über unser
            Formular über die sogenannte Conversions API direkt von unserem Server an Meta. Der
            Grund dafür ist technischer Natur: Browser-Erweiterungen und Schutzmechanismen
            verhindern häufig die Übermittlung durch den Pixel, sodass wir die Wirksamkeit unserer
            Werbeanzeigen sonst nur lückenhaft messen könnten.
          </p>
          <p className="mb-4">
            Dabei werden die von Ihnen angegebenen Kontaktdaten (E-Mail-Adresse, Telefonnummer,
            Vor- und Nachname) <strong>ausschliesslich in verschlüsselter Form</strong> übertragen:
            als sogenannte SHA-256-Hashwerte, aus denen sich die ursprünglichen Angaben nicht
            zurückrechnen lassen. Meta gleicht diese Werte mit den ebenfalls verschlüsselten
            Angaben vorhandener Nutzerkonten ab, um die Anmeldung der auslösenden Werbeanzeige
            zuzuordnen. Zusätzlich übermitteln wir technische Angaben zu Browser und Gerät sowie,
            sofern vorhanden, die Kennung des Anzeigenklicks.
          </p>
          <p className="mb-4">
            Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO bzw. die
            entsprechenden Bestimmungen des Schweizer DSG), die Sie über die Schaltfläche
            „Akzeptieren" im Cookie-Hinweis erteilen und über den Link „Cookie-Einstellungen" am
            Seitenende jederzeit für die Zukunft widerrufen können.
          </p>
          <p>
            Anbieter ist die Meta Platforms Ireland Limited; dabei können Daten an die Meta
            Platforms, Inc. in den USA übermittelt werden. Diese Übermittlung erfolgt auf Grundlage
            geeigneter Garantien, insbesondere der Standardvertragsklauseln der EU-Kommission sowie –
            soweit anwendbar – des EU-US Data Privacy Framework. Weitere Informationen finden Sie in
            der{" "}
            <a
              href="https://www.facebook.com/privacy/policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-deep hover:underline"
            >
              Datenschutzrichtlinie von Meta
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">Rechte betroffener Personen</h2>
          <p className="mb-4">
            Im Rahmen der gesetzlichen Bestimmungen haben Sie das Recht auf Bestätigung, ob Sie
            betreffende Daten bearbeitet werden, auf Auskunft über die bearbeiteten Daten, auf
            Berichtigung unrichtiger Daten, auf Löschung («Recht auf Vergessenwerden»), auf
            Einschränkung der Bearbeitung, auf Datenübertragbarkeit, auf Widerspruch gegen die
            Bearbeitung sowie auf Widerruf einer erteilten Einwilligung.
          </p>
          <p>
            Zur Ausübung dieser Rechte genügt eine formlose Mitteilung an die zu Beginn dieser
            Erklärung genannte verantwortliche Stelle.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xl font-bold text-text-primary">Änderungen</h2>
          <p>
            Wir können diese Datenschutzerklärung jederzeit ohne Vorankündigung anpassen. Es gilt
            die jeweils aktuelle, auf unserer Website publizierte Fassung.
          </p>
        </section>

        <p className="mt-12 text-sm text-text-muted">Quelle: SwissAnwalt (angepasst)</p>
      </div>
    </div>
  </div>
);

export default Datenschutz;
