/**
 * ALLE Texte der Kampagnen-Landingpage an einem Ort.
 * ---------------------------------------------------
 * Die Startseite ist bewusst karg: Kicker, Headline, Subheadline, Video,
 * ein Button, ein Kundenzitat. Mehr nicht. Jedes zusätzliche Element auf einer
 * Opt-in-Seite ist ein Grund, nicht einzutragen.
 *
 * Der Angle steckt praktisch komplett in `optin.headline` + `optin.subheadline`.
 *
 * WICHTIG für alle Texte hier: Das Thema ist der Adminaufwand, nicht das
 * Produkt. OneClick Office kommt im Video als Beispiel einer Lösung vor — die
 * Seite verkauft aber die Frage „wie wird der Aufwand kleiner", nicht die
 * Software. Formulierungen, die nach Bedienungsanleitung klingen („Klient
 * wählen, Button drücken"), gehören deshalb nicht hierher; das Prinzip schon.
 */

/**
 * Seitenverhältnis des Videos, als CSS-Wert.
 * Die Originaldatei hatte oben und unten schwarze Balken; die sind beim
 * Komprimieren weggeschnitten worden, übrig bleiben 1920 × 920. Startbild und
 * Player richten sich danach — sonst entstünden im 16:9-Rahmen neue Balken.
 * Bei einem neuen Videoschnitt hier den Wert anpassen.
 */
export const VIDEO_ASPECT_RATIO = "1920 / 920";

/* ------------------------------------------------------------------ *
 * Seite 1 — Opt-in (Route "/")
 * ------------------------------------------------------------------ */
export const optin = {
  kicker: "Für Coaches, Berater & Dienstleister:",

  /* `underline` hebt ein Wort mit einem Strich hervor — sparsam einsetzen,
     sonst verliert es die Wirkung. Leer lassen, um darauf zu verzichten. */
  headline: {
    before: "Schau dir an, wie du deinen monatlichen Adminaufwand von ganzen Arbeitstagen auf",
    underline: "wenige Stunden",
    after: "reduzieren kannst",
  },

  /* Kurz halten — eine Zeile, maximal zwei. Trägt hier den Beleg. */
  subheadline:
    "… genau wie Luca, bei dem wir den monatlichen Adminaufwand von rund 1.5 Tagen auf wenige Stunden reduzieren konnten.",

  /* Startbild des Videos. Ein Klick spielt nichts ab, sondern öffnet das
     Formular — das Video kommt erst nach dem Eintrag. */
  poster: {
    /* Eigens gestaltetes Startbild (nicht aus dem Video gegriffen): Aussage
       links, Sprecher rechts freigestellt. Die Bildmitte bleibt frei — dort
       sitzt der Play-Button. Format 1920 x 920, identisch zum Video. */
    src: "/video-poster.webp",
    alt: "Aus 1.5 Tagen Administration pro Monat werden wenige Stunden",
  },

  /* Der eine Button. Zweizeilig wie in der Vorlage: Handlung oben, Einwand
     entkräftet unten. */
  cta: {
    label: "Jetzt Video kostenlos freischalten",
    sub: "100 % kostenfrei",
  },

  /* Eine Zeile unter dem Button. Kein Countdown, keine künstliche Knappheit —
     das passt nicht zu einer Schweizer Software für Selbstständige. */
  note: "Kein Abo, keine Kreditkarte. Du siehst das Video sofort nach dem Eintrag.",

  /* Inhalt des Formular-Overlays. */
  form: {
    title: "Wohin dürfen wir das Video schicken?",
    subtitle: "Du siehst es direkt im Anschluss und bekommst den Link zusätzlich per E-Mail.",
    fields: {
      name: { label: "Name", placeholder: "Vor- und Nachname" },
      email: { label: "E-Mail", placeholder: "name@beispiel.ch" },
      telefon: { label: "Telefon", placeholder: "+41 79 123 45 67" },
    },
    submitLabel: "Video jetzt ansehen",
    sendingLabel: "Einen Moment …",
    errorMessage: "Senden hat nicht geklappt. Bitte versuch es noch einmal.",
    privacyNote:
      "Deine Angaben behandeln wir vertraulich (revDSG / DSGVO) und nutzen sie nur, um dir das Video zu schicken und uns bei dir zu melden.",
  },
} as const;

/* ------------------------------------------------------------------ *
 * Seite 2 — Video (Route "/video")
 * ------------------------------------------------------------------ *
 * Die Abschnitte unter dem Video fassen zusammen, was im Video gesagt wird —
 * fuer alle, die nicht bis zum Ende schauen. Reihenfolge und Argumente folgen
 * dem Script: woher der Aufwand kommt, wie wir vorgehen, was dabei
 * herauskommen kann, das Beispiel Luca, der Ablauf.
 *
 * Der wichtigste Punkt daran: Verkauft wird KEINE Software, sondern eine
 * Analyse. OneClick Office ist Lucas Loesung, nicht das Angebot. Texte, die
 * das verwischen, gehoeren hier nicht hin.
 */
export const video = {
  kicker: "Dein Video ist freigeschaltet",
  headline: "So reduzierst du deinen Adminaufwand auf wenige Stunden.",
  subheadline:
    "Nimm dir die paar Minuten in Ruhe. Darunter steht das Wichtigste nochmals zum Nachlesen, dazu die Möglichkeit, direkt ein kostenloses Gespräch zu buchen.",

  /* Video-Quelle. Die MP4 liegt in public/video/ (Details: dortiges README). */
  source: {
    src: "/video/oneclick-office.mp4",
    /* Optional: WebM zusätzlich hinterlegen (kleiner), wird bevorzugt geladen. */
    webm: "",
    poster: "/video-poster.webp",
    /* Untertitel-Datei (WebVTT), falls vorhanden — viele schauen ohne Ton. */
    captions: "",
  },

  /* Direkt unter dem Video: wer jetzt schon überzeugt ist, soll nicht erst
     durch die ganze Zusammenfassung scrollen müssen. Öffnet dasselbe
     Buchungs-Overlay wie der CTA am Seitenende. */
  ctaUnderVideo: {
    label: "Kostenloses Erstgespräch buchen",
    note: "Unverbindlich · wir schauen uns deinen Ablauf gemeinsam an",
  },

  /* ---------- 1. Woher der Aufwand kommt ---------- */
  problem: {
    kicker: "Woher der Aufwand kommt",
    headline: "Nicht ein grosses Problem. Viele kleine.",
    intro:
      "Rechnungen schreiben, Excel-Tabellen pflegen, Kundendaten verwalten, Spesen erfassen, Dokumente erstellen, Informationen von einem Programm ins nächste übertragen. Jede Aufgabe für sich wirkt harmlos: hier zehn Minuten, dort zwanzig.",
    /* Der Kern-Einwand aus dem Video: die Abläufe sind nicht schlecht, sie sind gewachsen. */
    quote:
      "Das Problem ist meistens nicht, dass die Abläufe schlecht funktionieren. Das Problem ist, dass sie über die Jahre gewachsen sind.",
    growth:
      "Erst eine Excel-Tabelle, später eine zweite, für einen anderen Bereich eine zusätzliche Software. Heute liegen Kundendaten an einem Ort, Rechnungen entstehen woanders, und im Hintergrund entsteht immer mehr doppelte Arbeit.",
    /* Was der Aufwand tatsächlich kostet — nicht nur Zeit. */
    costs: [
      { title: "Zeit", text: "Zusammengerechnet gehen jeden Monat mehrere Stunden bis ganze Arbeitstage verloren." },
      { title: "Fehler", text: "Was von Hand übertragen wird, wird irgendwann falsch übertragen." },
      { title: "Verlorene Daten", text: "Informationen liegen verstreut und sind dann nicht da, wenn du sie brauchst." },
    ],
  },

  /* ---------- 2. Wie wir vorgehen ---------- */
  approach: {
    kicker: "Wie wir vorgehen",
    headline: "Wir starten nicht mit einer Lösung. Wir starten mit deinem Ablauf.",
    intro:
      "Zuerst schauen wir uns an, wie deine Administration heute tatsächlich funktioniert. Vier Fragen führen dabei fast immer zum Kern:",
    questions: [
      "Welche Aufgaben wiederholen sich immer wieder?",
      "Wo müssen Daten von Hand eingetragen oder übertragen werden?",
      "Welche Schritte kosten jeden Monat besonders viel Zeit?",
      "Und welche davon lassen sich vereinfachen oder automatisieren?",
    ],
    /* Der wichtigste Satz der ganzen Seite — er nimmt den Verdacht weg,
       hier solle etwas verkauft werden. */
    noSalesTitle: "Es geht nicht darum, dir neue Software zu verkaufen.",
    noSalesText:
      "Wenn du mit einem Programm arbeitest, das sich über Jahre bewährt hat und mit dem du zufrieden bist, bleibt es. Oft ist es ohnehin sinnvoller, bestehende Systeme miteinander zu verbinden, als etwas zu ersetzen.",
  },

  /* ---------- 3. Was dabei herauskommen kann ---------- */
  solutions: {
    kicker: "Was dabei herauskommt",
    headline: "Manchmal reicht ein kleiner Workflow.",
    items: [
      {
        title: "Ein einzelner Workflow",
        text: "Daten wandern automatisch von einem Programm ins andere, statt von Hand kopiert zu werden.",
      },
      {
        title: "Bestehende Systeme verbinden",
        text: "Was du schon nutzt, bleibt und spricht künftig nur miteinander. Informationen werden einmal erfasst und landen dort, wo sie hingehören.",
      },
      {
        title: "Ein zentraler Prozess",
        text: "Wenn vieles zusammenläuft, lohnt sich ein Ablauf, über den alles geht, statt fünf Insellösungen.",
      },
      {
        title: "Eine individuelle Lösung",
        text: "Und manchmal ist es sinnvoll, etwas zu bauen, das genau auf deinen Betrieb zugeschnitten ist.",
      },
    ],
    closing:
      "Entscheidend ist nicht, wie gross oder technisch die Lösung ist. Entscheidend ist, wie viel unnötige Arbeit dadurch aus deinem Alltag verschwindet.",
  },

  /* ---------- 4. Das Beispiel aus dem Video ---------- */
  example: {
    kicker: "Ein konkretes Beispiel",
    headline: "Bei Luca hiess die Lösung OneClick Office.",
    intro:
      "Vorher brauchte er für seine wiederkehrende Administration und den Monatsabschluss rund eineinhalb Tage pro Monat. Heute sind es wenige Stunden.",
    /* Was sich konkret geändert hat — aus dem Video. */
    points: [
      "Kundendaten, Leistungen, Notizen, Spesen und Rechnungen laufen über einen Weg statt über verschiedene Orte",
      "Informationen werden laufend erfasst und stehen später dort bereit, wo sie gebraucht werden",
      "Am Monatsende muss nichts mehr zusammengesucht werden",
      "Rechnungen entstehen mit einem Klick, Spesen scannt er unterwegs mit dem Handy",
    ],
    /* Ohne diese Einschränkung wirkt der Abschnitt wie ein Produktpitch. */
    disclaimerTitle: "Deine Lösung muss nicht so aussehen.",
    disclaimerText:
      "Vielleicht liegt dein grösster Zeitfresser darin, dass Daten zwischen zwei bestehenden Programmen hin und her wandern. Dann automatisieren wir genau diesen Schritt. Und vielleicht passt es tatsächlich fast so, wie wir es für Luca gebaut haben.",
  },

  /* ---------- 5. Ablauf ---------- */
  process: {
    kicker: "Wie es weitergeht",
    headline: "Drei Schritte, unverbindlich.",
    items: [
      {
        title: "Kostenloses Erstgespräch",
        text: "Wir schauen uns gemeinsam an, wie deine Administration heute läuft und wo besonders viel Zeit verloren geht.",
      },
      {
        title: "Wir prüfen die Umsetzung",
        text: "Anschliessend klären wir, welche Lösung für deinen Fall wirklich sinnvoll ist, vom kleinen Workflow bis zur individuellen Lösung.",
      },
      {
        title: "Konkreter Vorschlag mit Kosten",
        text: "Du bekommst einen Lösungsvorschlag inklusive transparenter Kosten. Wir nennen bewusst keinen Pauschalpreis, bevor klar ist, was bei dir überhaupt Sinn ergibt.",
      },
    ],
  },

  /* ---------- 6. Terminbuchung ---------- */
  booking: {
    kicker: "Kostenloses Erstgespräch",
    headline: "Schauen wir uns deinen Ablauf gemeinsam an.",
    subheadline:
      "Wir analysieren, welche Aufgaben heute unnötig Zeit kosten, was sich sinnvoll automatisieren lässt und wie eine passende Lösung für deinen Betrieb aussehen könnte. Unverbindlich und kostenlos.",
    cta: "Kostenloses Erstgespräch buchen",
    note: "Unverbindlich · in wenigen Minuten gebucht",
  },
} as const;

/* ------------------------------------------------------------------ *
 * Gemeinsam genutzt
 * ------------------------------------------------------------------ */
export const testimonial = {
  kicker: "Aus der Praxis",
  quote:
    "Weniger manuelle Adminarbeit. Mehr Zeit für die Klienten, die mich wirklich brauchen.",
  name: "Luca Vogel",
  role: "Sozialpädagogische Familienbegleitung",
  image: "/luca.webp",
  /* Einzeiler für die Startseite. */
  highlight: "Von rund 1.5 Arbeitstagen Adminaufwand im Monat auf wenige Stunden.",
} as const;

export const footer = {
  tagline: "Weniger Administration. Mehr Freiheit.",
  copyright: "© 2026 OneClick Office. Alle Rechte vorbehalten.",
} as const;
