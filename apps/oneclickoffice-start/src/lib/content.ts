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
 * ------------------------------------------------------------------ */
export const video = {
  kicker: "Dein Video ist freigeschaltet",
  headline: "So reduzierst du deinen Adminaufwand auf wenige Stunden.",
  subheadline:
    "Nimm dir die paar Minuten in Ruhe. Darunter steht das Wichtigste nochmals zum Nachlesen — und die Möglichkeit, direkt ein kostenloses Gespräch zu buchen.",

  /* Video-Quelle. Die MP4 liegt in public/video/ (Details: dortiges README). */
  source: {
    src: "/video/oneclick-office.mp4",
    /* Optional: WebM zusätzlich hinterlegen (kleiner), wird bevorzugt geladen. */
    webm: "",
    poster: "/video-poster.webp",
    /* Untertitel-Datei (WebVTT), falls vorhanden — viele schauen ohne Ton. */
    captions: "",
  },

  /* Ist-Situation vs. Wunschsituation — die Kernaussage des Videos in Kurzform. */
  summary: {
    kicker: "Worum es geht",
    headline: "Der Unterschied in deinem Monat.",
    beforeTitle: "Wie es heute läuft",
    afterTitle: "Wie es laufen könnte",
    rows: [
      {
        before: "Am Monatsende Stunden aus Kalender und Notizen zusammensuchen",
        after: "Erfasst, solange du es noch im Kopf hast — direkt nach dem Termin",
      },
      {
        before: "Belege sammeln sich im Auto, im Portemonnaie, im Mailpostfach",
        after: "Beleg einmal erfasst und sofort dort abgelegt, wo er hingehört",
      },
      {
        before: "Dieselben Daten mehrfach abtippen, von einem Programm ins nächste",
        after: "Einmal erfasst, überall verfügbar — kein Übertragen mehr",
      },
      {
        before: "Ganze Arbeitstage Administration pro Monat",
        after: "Wenige Stunden — der Rest ist Zeit für Klienten",
      },
    ],
  },

  /* Der Ablauf in drei Schritten. */
  steps: {
    kicker: "Das Prinzip",
    headline: "Drei Grundsätze, mehr steckt nicht dahinter.",
    items: [
      {
        title: "Erfassen, wo es entsteht",
        text: "Was direkt nach dem Termin festgehalten wird, muss am Monatsende nicht rekonstruiert werden. Das spart nicht Minuten, sondern den halben Aufwand.",
      },
      {
        title: "Nur einmal erfassen",
        text: "Jede Information wird ein einziges Mal aufgeschrieben und ist danach überall dort, wo sie gebraucht wird. Das Übertragen von Hand fällt komplett weg.",
      },
      {
        title: "Abrechnen statt aufbereiten",
        text: "Wenn alles laufend zusammenläuft, ist der Abschluss am Monatsende kein Projekt mehr, sondern ein Vorgang von wenigen Minuten.",
      },
    ],
  },

  /* Terminbuchung am Seitenende. */
  booking: {
    kicker: "Kostenloses Erstgespräch",
    headline: "Wir schauen uns deinen Adminaufwand gemeinsam an.",
    subheadline:
      "In rund 20 Minuten gehen wir durch, wie dein Monat heute abläuft und wo bei dir konkret Zeit liegen bleibt. Ob eine Software dabei überhaupt das Richtige ist, ergibt sich aus dem Gespräch — unverbindlich und kostenlos.",
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
