/* =================================================================
   Minikurs «KI & Automation im Handwerksbetrieb» (5 Lektionen)

   Inhalte für die Landingpage (/kurs) und die Kursseite (/kurs/k/<token>).
   Die Mail-Texte liegen in der Edge Function (supabase/functions/kurs/mails.ts);
   Lektionstitel dort bitte gleich halten.

   Videos: noch nicht gedreht. Sobald eines da ist, bei der Lektion
   `video` setzen, z. B. { provider: "youtube", id: "dQw4w9WgXcQ" }
   (YouTube «nicht gelistet») oder { provider: "vimeo", id: "123456789" }.
   ================================================================= */

export type KursVideo = { provider: "youtube" | "vimeo"; id: string };

export type Lektion = {
  nr: number;
  /** kurzer Titel (Navigation, Mails) */
  titel: string;
  /** ein Satz für die Landingpage */
  satz: string;
  dauer: string;
  video?: KursVideo;
  /** Text unter dem Video, Absätze */
  text: string[];
  /** Zusatzblock unter dem Text */
  extra?: "aufgaben" | "prompt" | "demo" | "rechner" | "umsetzung";
  /** Hausaufgabe / nächster Schritt am Ende der Lektion */
  aufgabe?: string;
};

export const KURS = {
  meta: {
    title: "Kostenloser Minikurs: KI im Handwerksbetrieb · Trending Media",
    description:
      "5 kurze Videos, zusammen gut eine halbe Stunde: Was KI und Automation in Ihrem Handwerksbetrieb wirklich bringen, mit einem Quick Win zum Selbermachen und einem Rechner in Franken.",
  },
  hero: {
    kick: "Kostenloser Minikurs · 5 Lektionen",
    title: "KI im Handwerksbetrieb.",
    titleAccent: "Was wirklich Zeit spart.",
    sub: "Fünf kurze Videos für Inhaber von Handwerks- und Technikbetrieben. Ohne Hype und ohne Fachchinesisch: wo KI im Büro Stunden spart und was das in Franken bedeutet.",
    bullets: [
      "5 kurze Lektionen, zusammen gut eine halbe Stunde",
      "Am Stück schauen oder eine Lektion pro Tag",
      "Mit Prompt zum Selbermachen und Franken-Rechner",
    ],
  },
  zielgruppe: {
    kick: "Für wen",
    h: "Für Inhaber, die mehr Baustelle und weniger Büro wollen.",
    items: [
      { ic: "users", t: "Inhaber & Geschäftsführer", d: "von Handwerks- und Technikbetrieben mit etwa 5 bis 50 Mitarbeitenden." },
      { ic: "clock", t: "Wenig Zeit, viel Admin", d: "Rapporte, Offerten und Mails fressen Abende und Wochenenden." },
      { ic: "check", t: "Keine Vorkenntnisse nötig", d: "Sie müssen weder programmieren noch ChatGPT schon kennen." },
    ],
  },
  person: {
    name: "Nicola Sieber",
    role: "Trending Media, Solothurn",
    img: "/team/nicola.png",
    mail: "nicola.sieber@trendingmedia.ch",
    text: [
      "Ich bin Nicola Sieber von Trending Media in Solothurn. Wir automatisieren für Handwerksbetriebe Rapporte, Offerten und Anfragen, so dass die Arbeit im Büro weniger wird und jede Stunde verrechnet wird.",
      "Kohler Elektro Bern verrechnet dank einer solchen Automation heute CHF 2'000 bis 3'000 mehr pro Monat, aus derselben Arbeit. In diesem Kurs zeige ich Ihnen ehrlich, was davon auch in Ihrem Betrieb möglich ist und was dahintersteckt.",
    ],
  },
  faqs: [
    { q: "Kostet der Kurs etwas?", a: "Nein. Der Kurs ist kostenlos. Alle Lektionen sind sofort freigeschaltet. Zusätzlich erinnern wir Sie fünf Tage lang per E-Mail an die nächste Lektion, danach kommen noch zwei, drei Nachrichten mit Praxisbeispielen. Abmelden können Sie sich jederzeit mit einem Klick." },
    { q: "Wie viel Zeit brauche ich?", a: "Alle fünf Lektionen zusammen dauern gut eine halbe Stunde, jede einzelne 5 bis 8 Minuten. Sie können alles an einem Abend am Stück schauen oder jeden Tag eine Lektion, ganz wie es Ihnen passt." },
    { q: "Muss ich technisch versiert sein?", a: "Nein. Der Kurs ist für Inhaber gemacht, nicht für IT-Leute. Für den Quick Win in Lektion 2 reicht ein kostenloses ChatGPT-Konto." },
    { q: "Ist der Kurs nur für das Handwerk?", a: "Die Beispiele stammen aus Handwerk und Technik. Die Grundideen funktionieren aber in jedem KMU, in dem Mails, Offerten und Administration viel Zeit kosten." },
    { q: "Was passiert mit meinen Angaben?", a: "Wir nutzen Name, E-Mail und Firma nur für den Kurs und die zugehörigen Nachrichten. Wir messen, welche Lektionen Sie öffnen, damit wir den Kurs verbessern und Ihnen passende Hinweise geben können. Kein Verkauf an Dritte, Details in der Datenschutzerklärung." },
  ],
  branchen: ["Elektro", "Sanitär / Heizung", "Schreinerei", "Maler / Gipser", "Bau / Holzbau", "Metallbau", "Andere Branche"],
};

export const LEKTIONEN: Lektion[] = [
  {
    nr: 1,
    titel: "Wo KI im Betrieb wirklich Zeit spart",
    satz: "Weg vom Hype, hin zu dem, was im Büro jeden Tag Zeit frisst: Mails, Rapporte, Offerten und Administration.",
    dauer: "6 Min.",
    text: [
      "Wenn von KI die Rede ist, denken viele an Roboter oder an Bilder, die sich ein Computer ausdenkt. Für einen Handwerksbetrieb ist das wenig hilfreich. Die echte Zeit liegt woanders: in den Arbeiten, die jede Woche gleich ablaufen und die niemand gerne macht.",
      "Typische Beispiele: Mails lesen und beantworten, Rapporte nachtragen, Offerten schreiben und nachfassen, Anfragen sortieren, Daten von einem Programm ins andere übertragen. Genau dort sind KI und Automation heute stark, weil die Arbeit klare Regeln hat und sich wiederholt.",
      "Faustregel: Je häufiger eine Aufgabe vorkommt und je klarer der Ablauf ist, desto eher lohnt sich eine Automation. Kreative oder heikle Entscheidungen bleiben bei Ihnen.",
    ],
    extra: "aufgaben",
    aufgabe: "Notieren Sie die drei nervigsten Aufgaben, die in Ihrem Betrieb jede Woche wiederkommen. Sie brauchen sie in Lektion 4 und 5.",
  },
  {
    nr: 2,
    titel: "Quick Win: Offertentexte in zwei Minuten",
    satz: "Ein fertiger Prompt zum Kopieren: Aus ein paar Stichworten wird ein sauberer Offertentext. Die einzige Lektion mit Anleitung zum Selbermachen.",
    dauer: "7 Min.",
    text: [
      "Heute machen Sie selbst den ersten Schritt. Mit dem Prompt unten schreibt ChatGPT aus ein paar Stichworten den Begleittext zu einer Offerte: freundlich, klar gegliedert und in Schweizer Rechtschreibung.",
      "So gehen Sie vor: Prompt kopieren, in ChatGPT einfügen, die Stichworte am Schluss durch ein echtes Projekt ersetzen, absenden. Lesen Sie das Resultat immer durch, bevor es zum Kunden geht. Sie bleiben der Fachmann, die KI ist Ihre Schreibhilfe.",
      "Wichtig zum Datenschutz: Geben Sie in Gratis-Tools keine Kundennamen, Adressen oder Telefonnummern ein. Schreiben Sie «Kunde A» oder «EFH Bern» und setzen Sie die echten Angaben erst im fertigen Text ein.",
    ],
    extra: "prompt",
    aufgabe: "Probieren Sie den Prompt mit einer echten Offerte von dieser Woche aus. Wie viel Zeit hätten Sie sonst gebraucht?",
  },
  {
    nr: 3,
    titel: "Von ChatGPT zur Automation",
    satz: "Live-Demo: Wie bei Kohler Elektro aus jeder Projekt-Mail automatisch ein Zeitrapport wird, ohne dass jemand daran denken muss.",
    dauer: "8 Min.",
    text: [
      "ChatGPT hilft, aber Sie müssen immer noch jedes Mal selbst etwas eintippen. Eine Automation geht einen Schritt weiter: Sie läuft im Hintergrund, Tag für Tag, ohne dass jemand daran denken muss.",
      "Das Beispiel aus dem Video stammt von Kohler Elektro Bern. Ein Teil der Projektarbeit passiert per Mail, die Zeit dafür ging oft verloren. Heute liest eine Automation jede relevante Mail, erkennt die Projektnummer und rapportiert die Zeit direkt beim richtigen Projekt in der bestehenden Zeiterfassung.",
      "Das Ergebnis: CHF 2'000 bis 3'000 mehr verrechnet, jeden Monat, aus derselben Arbeit.",
    ],
    extra: "demo",
    aufgabe: "Überlegen Sie: Bei welcher Ihrer drei Aufgaben stehen die nötigen Infos schon irgendwo drin, in einer Mail, einem Formular oder einer Liste?",
  },
  {
    nr: 4,
    titel: "Was das in Franken bedeutet",
    satz: "Ein einfacher Rechner: Stunden pro Woche mal Stundenansatz mal 46 Arbeitswochen. Die meisten Inhaber sind überrascht.",
    dauer: "5 Min.",
    text: [
      "Zeit ist im Betrieb schwer zu greifen. Franken nicht. Deshalb rechnen wir heute nach, was Ihre drei Aufgaben aus Lektion 1 pro Jahr kosten.",
      "Die Rechnung ist bewusst einfach: Stunden pro Woche × Stundenansatz × 46 Arbeitswochen. Schätzen Sie ehrlich, eher tief als hoch. Als Stundenansatz nehmen Sie, was Sie einem Kunden für eine Stunde verrechnen würden. Denn das ist die Zeit, die Ihnen im Büro für die Baustelle fehlt.",
    ],
    extra: "rechner",
    aufgabe: "Notieren Sie sich die Zahl. Sie ist die Grundlage dafür, ob sich eine Automation für Sie lohnt.",
  },
  {
    nr: 5,
    titel: "Wie die Umsetzung in der Praxis aussieht",
    satz: "Schnittstellen, Datenschutz nach DSG, Tests, Schulung und Wartung: was es braucht, damit eine Automation im Alltag zuverlässig läuft.",
    dauer: "7 Min.",
    text: [
      "Ein guter Prompt ist ein Anfang. Eine Automation, auf die sich Ihr Betrieb jeden Tag verlassen kann, ist echte Arbeit. Damit Sie wissen, worauf Sie sich einlassen, hier ehrlich, was dazugehört.",
      "Bei Kohler Elektro dauerte es von der Idee bis zum Einsatz rund drei bis vier Wochen. Den grössten Teil davon haben nicht die Mitarbeitenden gemacht, sondern wir.",
    ],
    extra: "umsetzung",
  },
];

export const UMSETZUNG = [
  { ic: "zap", t: "Schnittstellen", d: "Die Automation muss mit Ihrem Mailprogramm, Ihrer Zeiterfassung, Ihrer Branchensoftware oder Buchhaltung reden. Ihre bestehende Software bleibt, wir verbinden sie." },
  { ic: "shield", t: "Datenschutz nach DSG", d: "Kundendaten bleiben in der Schweiz oder der EU, nur das Nötigste wird verarbeitet, und es ist dokumentiert, wer was sieht." },
  { ic: "check", t: "Tests mit echten Fällen", d: "Bevor etwas live geht, prüfen wir mit Ihren echten Mails und Aufträgen, auch mit den Sonderfällen, die es in jedem Betrieb gibt." },
  { ic: "users", t: "Schulung", d: "Ihr Team weiss, was die Automation macht, wo es nachschauen kann und was zu tun ist, wenn einmal etwas nicht passt." },
  { ic: "server", t: "Wartung", d: "Programme ändern sich, Abläufe auch. Wir überwachen die Automation und passen sie an, damit sie in einem Jahr noch genauso läuft." },
];

/** Prompt aus Lektion 2 */
export const PROMPT_OFFERTE = `Du bist mein Assistent für Offerten in meinem Handwerksbetrieb in der Schweiz.
Schreibe aus meinen Stichworten einen kurzen, freundlichen Begleittext für eine Offerte. Schweizer Rechtschreibung (ss statt ß), Sie-Form.

Aufbau:
1. Dank für die Anfrage und kurzer Bezug auf das Projekt
2. Was wir machen, in 3 bis 5 klaren Punkten
3. Was nicht inbegriffen ist
4. Ausführungszeitraum und Gültigkeit der Offerte (30 Tage)
5. Nächster Schritt für den Kunden

Ton: kompetent, bodenständig, keine Floskeln. Höchstens 180 Wörter.
Erfinde keine Preise, Masse oder Fakten. Wenn etwas fehlt, schreibe [BITTE ERGÄNZEN].

Meine Stichworte:
Kunde A, Einfamilienhaus, Bad komplett erneuern, Dusche bodeneben, neue Leitungen, Start ca. KW 12, Dauer 3 Wochen`;

/** Arbeitswochen pro Jahr für den Rechner in Lektion 4 */
export const WOCHEN = 46;
