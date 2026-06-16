import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CalendarCheck,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { CalEmbed } from "@/components/CalEmbed";
import "./apple-home.css";
import "./beratung.css";

/* ---------------------------------------------------------------------
   Google-Form-Sink (Teil-Leads erfassen, auch ohne Buchung).
   So füllst du das aus:
   1. Google Form anlegen mit Feldern: Name, Firma, E-Mail, Telefon, Details.
   2. Vorschau → "Vorausgefüllten Link abrufen", Felder testweise befüllen,
      Link generieren. In der URL findest du je Feld "entry.XXXXXXX=test".
   3. Trage die entry-IDs unten ein und ersetze FORM_ID in der Action-URL
      (Form → Senden → Link, oder aus der bearbeiten-URL /d/<FORM_ID>/edit).
   Solange GOOGLE_FORM_ACTION leer ist, wird das Speichern übersprungen und
   der Flow springt trotzdem sauber zum Termin (Cal-Prefill funktioniert).
--------------------------------------------------------------------- */
const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSfcif488ldDg23zy1vem2LvotguMd5UC68j45G7FRDHX0w7TQ/formResponse";
const FIELD_IDS = {
  name: "entry.67346083",
  firma: "entry.107026594",
  email: "entry.1010276767",
  telefon: "entry.2064035513",
  // Die drei Multiple-Choice-Fragen als eigene Felder (zum Auswerten/Filtern).
  // Die Optionstexte im Google Form müssen EXAKT den Strings in choiceSteps
  // unten entsprechen, sonst verwirft Google die Antwort.
  anliegen: "entry.25266318",
  groesse: "entry.607213196",
  zeitrahmen: "entry.1024525460",
  nachricht: "entry.1533253865",
} as const;

type FormState = {
  anliegen: string;
  groesse: string;
  zeitrahmen: string;
  name: string;
  firma: string;
  email: string;
  telefon: string;
  nachricht: string;
};

const initialState: FormState = {
  anliegen: "",
  groesse: "",
  zeitrahmen: "",
  name: "",
  firma: "",
  email: "",
  telefon: "",
  nachricht: "",
};

type ChoiceKey = "anliegen" | "groesse" | "zeitrahmen";

type ChoiceStep = {
  key: ChoiceKey;
  question: string;
  helper?: string;
  options: string[];
};

const choiceSteps: ChoiceStep[] = [
  {
    key: "anliegen",
    question: "Worum geht es bei Ihnen?",
    helper: "Eine grobe Richtung genügt – wir vertiefen das im Gespräch.",
    options: [
      "Manuelle Prozesse automatisieren",
      "Individuelle Software / App",
      "Systeme verbinden (Schnittstellen)",
      "Website / Online-Sichtbarkeit",
      "Noch unklar – beraten lassen",
    ],
  },
  {
    key: "groesse",
    question: "Wie gross ist Ihr Unternehmen?",
    helper: "Damit wir den passenden Rahmen einschätzen.",
    options: ["1–5 Mitarbeitende", "6–20", "21–50", "über 50"],
  },
  {
    key: "zeitrahmen",
    question: "Wann möchten Sie starten?",
    options: [
      "So schnell wie möglich",
      "In 1–3 Monaten",
      "In 3–6 Monaten",
      "Erst einmal informieren",
    ],
  },
];

const totalSteps = choiceSteps.length + 1; // + Kontaktschritt

const Beratung = () => {
  const [state, setState] = useState<FormState>(initialState);
  const [stepIndex, setStepIndex] = useState(0);
  const [booking, setBooking] = useState(false); // Termin-Schritt aktiv?
  const [loading, setLoading] = useState(false);

  // Helle „Apple"-Hintergrundfarbe für diese Route (andere nutzen Cosmic-Dark)
  useEffect(() => {
    document.body.classList.add("ap-light");
    return () => document.body.classList.remove("ap-light");
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex, booking]);

  const update = (key: keyof FormState, value: string) =>
    setState((s) => ({ ...s, [key]: value }));

  const isContactStep = stepIndex === choiceSteps.length;
  const isLastChoice = stepIndex === choiceSteps.length - 1;
  const currentChoice = !isContactStep ? choiceSteps[stepIndex] : null;

  const progress = booking
    ? 100
    : Math.round(((stepIndex + (isContactStep ? 1 : 0)) / totalSteps) * 100);

  // Zusammenfassung der Antworten – wandert als Notiz in die Cal-Buchung
  const notes = useMemo(() => {
    return [
      `Anliegen: ${state.anliegen || "—"}`,
      `Unternehmensgrösse: ${state.groesse || "—"}`,
      `Zeitrahmen: ${state.zeitrahmen || "—"}`,
      state.firma && `Firma: ${state.firma}`,
      state.telefon && `Telefon: ${state.telefon}`,
      state.nachricht && `\nAnmerkung: ${state.nachricht}`,
    ]
      .filter(Boolean)
      .join("\n");
  }, [state]);

  const selectChoice = (key: ChoiceKey, value: string) => {
    update(key, value);
    setStepIndex((i) => Math.min(choiceSteps.length, i + 1));
  };

  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));
  const goNext = () => setStepIndex((i) => Math.min(choiceSteps.length, i + 1));

  // Lead an Google Form schicken (best effort) und zum Termin wechseln
  const submitContact = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (GOOGLE_FORM_ACTION && FIELD_IDS.name) {
      const payload = new FormData();
      payload.append(FIELD_IDS.name, state.name);
      payload.append(FIELD_IDS.firma, state.firma);
      payload.append(FIELD_IDS.email, state.email);
      if (FIELD_IDS.telefon && state.telefon)
        payload.append(FIELD_IDS.telefon, state.telefon);
      if (FIELD_IDS.anliegen) payload.append(FIELD_IDS.anliegen, state.anliegen);
      if (FIELD_IDS.groesse) payload.append(FIELD_IDS.groesse, state.groesse);
      if (FIELD_IDS.zeitrahmen)
        payload.append(FIELD_IDS.zeitrahmen, state.zeitrahmen);
      if (FIELD_IDS.nachricht && state.nachricht)
        payload.append(FIELD_IDS.nachricht, state.nachricht);

      try {
        await fetch(GOOGLE_FORM_ACTION, {
          method: "POST",
          mode: "no-cors",
          body: payload,
        });
      } catch {
        /* Best effort – der Termin bleibt der wichtige Schritt. */
      }
    }

    setLoading(false);
    setBooking(true);
  };

  // Skip: direkt zum Termin, ohne (alle) Fragen
  const skipToBooking = () => setBooking(true);

  const reset = () => {
    setBooking(false);
    setStepIndex(choiceSteps.length);
  };

  return (
    <div className="ap ap-vivid">
      {/* Minimaler Kopf mit Zurück-Link zur Startseite */}
      <nav className="ap-nav">
        <div className="ap-pill">
          <Link className="b" to="/">
            <img className="brandmark" src="/logo-schwarz.png" alt="" />
            Trending Media
          </Link>
          <Link className="cta" to="/">
            Zur Startseite
          </Link>
        </div>
      </nav>

      <header className="bf-head">
        <div className="wrap">
          <div className="kick">Kostenloses Erstgespräch</div>
          <h1>
            {booking
              ? "Wählen Sie einen passenden Termin"
              : "In 30 Sekunden zum vorbereiteten Gespräch"}
          </h1>
          <p className="sub">
            {booking
              ? "Suchen Sie sich einen Slot aus. Ihre Angaben liegen uns bereits vor – wir starten nicht bei null."
              : "Drei kurze Fragen, damit wir uns auf Ihre Situation vorbereiten. Danach wählen Sie direkt einen Termin."}
          </p>
          {!booking && (
            <div className="bf-reassure">
              <span>
                <Clock className="h-4 w-4" style={{ color: "var(--accent)" }} /> ca. 30 Minuten
              </span>
              <span>
                <ShieldCheck className="h-4 w-4" style={{ color: "var(--accent)" }} /> Ohne Verkaufsdruck
              </span>
              <span>
                <CalendarCheck className="h-4 w-4" style={{ color: "var(--accent)" }} /> Sofort buchbar
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="bf-shell">
        {!booking ? (
          <div className="bf-card">
            <div className="bf-progress">
              <span>
                Schritt {Math.min(stepIndex + 1, totalSteps)} von {totalSteps}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="bf-track">
              <div className="bf-fill" style={{ width: `${progress}%` }} />
            </div>

            {currentChoice && (
              <div key={currentChoice.key} className="bf-step bf-fade">
                <h2 className="bf-q">{currentChoice.question}</h2>
                {currentChoice.helper && (
                  <p className="bf-helper">{currentChoice.helper}</p>
                )}

                <div className="bf-opts">
                  {currentChoice.options.map((opt) => {
                    const sel = state[currentChoice.key] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={`bf-opt${sel ? " sel" : ""}`}
                        onClick={() => selectChoice(currentChoice.key, opt)}
                      >
                        <span>{opt}</span>
                        <span className="bf-tick">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="bf-nav">
                  <button
                    type="button"
                    className="bf-back"
                    onClick={goBack}
                    disabled={stepIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4" /> Zurück
                  </button>
                  {state[currentChoice.key] && (
                    <button type="button" className="bf-next" onClick={goNext}>
                      {isLastChoice ? "Weiter zu Kontaktdaten" : "Weiter"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {isContactStep && (
              <form className="bf-step bf-fade" onSubmit={submitContact}>
                <h2 className="bf-q">Ihre Kontaktdaten</h2>
                <p className="bf-helper">
                  Damit wir den Termin vorbereiten und bestätigen können.
                </p>

                <div className="bf-form">
                  <div className="bf-row two">
                    <div className="bf-field">
                      <label htmlFor="name">Name *</label>
                      <input
                        id="name"
                        required
                        value={state.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="Vor- und Nachname"
                      />
                    </div>
                    <div className="bf-field">
                      <label htmlFor="firma">Firma *</label>
                      <input
                        id="firma"
                        required
                        value={state.firma}
                        onChange={(e) => update("firma", e.target.value)}
                        placeholder="Unternehmen"
                      />
                    </div>
                  </div>
                  <div className="bf-row two">
                    <div className="bf-field">
                      <label htmlFor="email">E-Mail *</label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={state.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="name@unternehmen.ch"
                      />
                    </div>
                    <div className="bf-field">
                      <label htmlFor="telefon">Telefon (optional)</label>
                      <input
                        id="telefon"
                        value={state.telefon}
                        onChange={(e) => update("telefon", e.target.value)}
                        placeholder="+41 …"
                      />
                    </div>
                  </div>
                  <div className="bf-field">
                    <label htmlFor="nachricht">Anmerkung (optional)</label>
                    <textarea
                      id="nachricht"
                      value={state.nachricht}
                      onChange={(e) => update("nachricht", e.target.value)}
                      placeholder="Was sollten wir vorab wissen?"
                    />
                  </div>
                </div>

                <div className="bf-nav">
                  <button type="button" className="bf-back" onClick={goBack}>
                    <ArrowLeft className="h-4 w-4" /> Zurück
                  </button>
                  <button type="submit" className="bf-next" disabled={loading}>
                    {loading ? "Einen Moment …" : "Weiter zum Termin"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                <p className="bf-fineprint">
                  Im nächsten Schritt wählen Sie direkt einen Termin – Ihre
                  Angaben sind dann bereits hinterlegt.
                </p>
              </form>
            )}

            {!isContactStep && (
              <div className="bf-skip">
                Lieber sofort buchen?{" "}
                <button type="button" onClick={skipToBooking}>
                  Direkt zum Termin
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bf-card bf-fade">
            <div className="ap-cal bf-cal">
              <div className="bar">
                <i />
                <i />
                <i />
                <span>cal.com / Erstgespräch</span>
              </div>
              <CalEmbed
                className="ap-cal-host"
                prefill={{
                  name: state.name || undefined,
                  email: state.email || undefined,
                  notes,
                }}
              />
            </div>
            <div className="bf-cal-foot">
              <button type="button" onClick={reset}>
                <ArrowLeft className="h-4 w-4" /> Angaben ändern
              </button>
              <Link to="/">Zur Startseite</Link>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
};

export default Beratung;
