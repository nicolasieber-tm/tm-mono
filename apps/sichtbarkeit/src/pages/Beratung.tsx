import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ArrowLeft, ArrowRight, CalendarCheck, Check, Clock, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const CAL_LINK = "nicolasieber/beratungstermin";

const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLScD7ZpEgO2n1XvpUsiUYKL4usLU84LBid3Y7kzYuDH9bKdQFw/formResponse";

const FIELD_IDS = {
  name: "entry.1505561126",
  firma: "entry.275091510",
  email: "entry.974722826",
  website: "entry.5008050",
  nachricht: "entry.1366752365",
} as const;

type FormState = {
  name: string;
  firma: string;
  email: string;
  website: string;
  bestehendeWebsite: string;
  projektart: string;
  texteVorhanden: string;
  zeitrahmen: string;
  nachricht: string;
};

const initialState: FormState = {
  name: "",
  firma: "",
  email: "",
  website: "",
  bestehendeWebsite: "",
  projektart: "",
  texteVorhanden: "",
  zeitrahmen: "",
  nachricht: "",
};

type StepKey =
  | "bestehendeWebsite"
  | "projektart"
  | "texteVorhanden"
  | "zeitrahmen"
  | "kontakt";

type ChoiceStep = {
  key: Exclude<StepKey, "kontakt">;
  question: string;
  helper?: string;
  options: string[];
};

const choiceSteps: ChoiceStep[] = [
  {
    key: "bestehendeWebsite",
    question: "Haben Sie bereits eine bestehende Website?",
    helper: "Damit wir den Ausgangspunkt kennen.",
    options: [
      "Ja, soll überarbeitet werden",
      "Ja, soll komplett neu",
      "Nein, noch keine",
      "Unsicher",
    ],
  },
  {
    key: "projektart",
    question: "Was für eine Website schwebt Ihnen vor?",
    helper: "Eine grobe Richtung genügt.",
    options: [
      "Kleine Visitenkarten-Website (1–3 Seiten)",
      "Klassische Unternehmens-Website (4–10 Seiten)",
      "Umfangreiche Website / Shop",
      "Update der bestehenden Seite",
    ],
  },
  {
    key: "texteVorhanden",
    question: "Sind Texte und Bilder bereits vorhanden?",
    helper: "Falls nicht, unterstützen wir Sie dabei.",
    options: [
      "Ja, vollständig",
      "Teilweise",
      "Nein, brauche Unterstützung",
      "Noch unklar",
    ],
  },
  {
    key: "zeitrahmen",
    question: "Wann möchten Sie umsetzen?",
    options: [
      "So schnell wie möglich",
      "In 1–3 Monaten",
      "In 3–6 Monaten",
      "Erst informieren",
    ],
  },
];

const totalSteps = choiceSteps.length + 1;

const Beratung = () => {
  const [state, setState] = useState<FormState>(initialState);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof FormState, value: string) =>
    setState((s) => ({ ...s, [key]: value }));

  const isLastChoice = stepIndex === choiceSteps.length - 1;
  const isContactStep = stepIndex === choiceSteps.length;

  const calSrc = useMemo(() => {
    const params = new URLSearchParams();
    if (state.name) params.set("name", state.name);
    if (state.email) params.set("email", state.email);
    const notes = [
      state.firma && `Firma: ${state.firma}`,
      state.website && `Website: ${state.website}`,
      state.bestehendeWebsite && `Bestehende Website: ${state.bestehendeWebsite}`,
      state.projektart && `Projektart: ${state.projektart}`,
      state.texteVorhanden && `Texte/Bilder: ${state.texteVorhanden}`,
      state.zeitrahmen && `Zeitrahmen: ${state.zeitrahmen}`,
      state.nachricht && `Nachricht: ${state.nachricht}`,
    ]
      .filter(Boolean)
      .join("\n");
    if (notes) params.set("notes", notes);
    const qs = params.toString();
    return `https://cal.com/${CAL_LINK}${qs ? `?${qs}` : ""}`;
  }, [state]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex, submitted]);

  const selectChoice = (key: ChoiceStep["key"], value: string) => {
    update(key, value);
    if (stepIndex < choiceSteps.length) {
      setStepIndex((i) => i + 1);
    }
  };

  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const nachricht = [
      `Bestehende Website: ${state.bestehendeWebsite || "—"}`,
      `Projektart: ${state.projektart || "—"}`,
      `Texte/Bilder vorhanden: ${state.texteVorhanden || "—"}`,
      `Zeitrahmen: ${state.zeitrahmen || "—"}`,
      state.nachricht ? `\nNachricht:\n${state.nachricht}` : "",
    ].join("\n");

    const payload = new FormData();
    payload.append(FIELD_IDS.name, state.name);
    payload.append(FIELD_IDS.firma, state.firma);
    payload.append(FIELD_IDS.email, state.email);
    payload.append(FIELD_IDS.website, state.website);
    payload.append(FIELD_IDS.nachricht, nachricht);

    try {
      await fetch(GOOGLE_FORM_ACTION, {
        method: "POST",
        mode: "no-cors",
        body: payload,
      });
      toast.success("Vielen Dank! Wählen Sie unten einen Termin aus.");
      setSubmitted(true);
    } catch {
      toast.error("Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setStepIndex(0);
  };

  const currentChoice = !isContactStep ? choiceSteps[stepIndex] : null;
  const progress = submitted
    ? 100
    : Math.round(((stepIndex + (isContactStep ? 1 : 0)) / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <section className="border-b border-border bg-gradient-soft py-16 md:py-20">
          <div className="container-tight max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Kostenlose Beratung · Unverbindlich
            </div>
            <h1 className="text-3xl leading-tight sm:text-4xl lg:text-5xl">
              {submitted
                ? "Wählen Sie einen passenden Termin"
                : "Kostenlose Beratung – in 60 Sekunden zum Termin"}
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              {submitted
                ? "Suchen Sie sich unten einen Slot aus, der Ihnen passt. Wir besprechen kurz Ihre Ausgangslage und Sie erhalten konkrete Empfehlungen."
                : "Beantworten Sie kurz vier Fragen, damit wir uns optimal vorbereiten können. Anschliessend können Sie direkt einen Termin auswählen."}
            </p>

            {!submitted && (
              <ul className="mt-6 grid gap-2 text-sm sm:grid-cols-3">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" /> ca. 20 Minuten
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Ohne Verkaufsdruck
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <CalendarCheck className="h-4 w-4 text-primary" /> Sofort buchbar
                </li>
              </ul>
            )}
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container-tight max-w-2xl">
            {!submitted ? (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card sm:p-10">
                <div className="mb-8">
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>
                      Schritt {Math.min(stepIndex + 1, totalSteps)} von {totalSteps}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {currentChoice && (
                  <div key={currentChoice.key} className="animate-fade-up">
                    <h2 className="text-2xl leading-tight sm:text-3xl">
                      {currentChoice.question}
                    </h2>
                    {currentChoice.helper && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {currentChoice.helper}
                      </p>
                    )}

                    <div className="mt-8 grid gap-3">
                      {currentChoice.options.map((opt) => {
                        const selected = state[currentChoice.key] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => selectChoice(currentChoice.key, opt)}
                            className={`group flex items-center justify-between gap-3 rounded-xl border p-4 text-left text-sm transition-all hover:border-primary hover:bg-primary/5 sm:text-base ${
                              selected
                                ? "border-primary bg-primary/5"
                                : "border-border bg-background"
                            }`}
                          >
                            <span>{opt}</span>
                            <span
                              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors ${
                                selected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border text-transparent group-hover:border-primary"
                              }`}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={goBack}
                        disabled={stepIndex === 0}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                      >
                        <ArrowLeft className="h-4 w-4" /> Zurück
                      </button>
                      {state[currentChoice.key] && (
                        <button
                          type="button"
                          onClick={() => setStepIndex((i) => i + 1)}
                          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                          {isLastChoice ? "Weiter zu Kontaktdaten" : "Weiter"}
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {isContactStep && (
                  <form onSubmit={handleSubmit} className="animate-fade-up">
                    <h2 className="text-2xl leading-tight sm:text-3xl">
                      Ihre Kontaktdaten
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Damit wir den Termin vorbereiten und bestätigen können.
                    </p>

                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          required
                          value={state.name}
                          onChange={(e) => update("name", e.target.value)}
                          placeholder="Vor- und Nachname"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="firma">Firma *</Label>
                        <Input
                          id="firma"
                          required
                          value={state.firma}
                          onChange={(e) => update("firma", e.target.value)}
                          placeholder="Unternehmen"
                        />
                      </div>
                    </div>
                    <div className="mt-5 space-y-2">
                      <Label htmlFor="email">E-Mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={state.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="name@unternehmen.ch"
                      />
                    </div>
                    <div className="mt-5 space-y-2">
                      <Label htmlFor="website">Aktuelle Website (optional)</Label>
                      <Input
                        id="website"
                        value={state.website}
                        onChange={(e) => update("website", e.target.value)}
                        placeholder="https://"
                      />
                    </div>
                    <div className="mt-5 space-y-2">
                      <Label htmlFor="nachricht">Anmerkung (optional)</Label>
                      <Textarea
                        id="nachricht"
                        rows={3}
                        value={state.nachricht}
                        onChange={(e) => update("nachricht", e.target.value)}
                        placeholder="Was sollten wir vorab wissen?"
                      />
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={goBack}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ArrowLeft className="h-4 w-4" /> Zurück
                      </button>
                      <Button type="submit" size="lg" className="h-12 px-6 text-base" disabled={loading}>
                        {loading ? "Wird gesendet…" : "Weiter zum Termin"}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                      Im nächsten Schritt wählen Sie direkt einen Termin aus.
                    </p>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                  <iframe
                    title="Termin buchen"
                    src={calSrc}
                    className="h-[820px] w-full"
                    frameBorder={0}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" /> Antworten ändern
                  </button>
                  <a
                    href={calSrc}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground"
                  >
                    In neuem Tab öffnen
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Beratung;
