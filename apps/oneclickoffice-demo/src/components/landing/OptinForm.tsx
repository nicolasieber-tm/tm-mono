import { FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ScrollReveal from "./ScrollReveal";
import { cta } from "@/lib/landing-content";
import { submitLead, type LeadPayload } from "@/lib/submitLead";
import { track, trackMeta } from "@/lib/analytics";

/**
 * Mehrstufiger Lead-Wizard: pro Schritt eine Qualifizierungsfrage, nach Auswahl
 * geht es automatisch weiter. Der letzte Schritt erfasst die Kontaktdaten.
 * Statt alle Fragen auf einmal zu zeigen, führt das schrittweise zum Opt-in.
 */
const OptinForm = () => {
  const navigate = useNavigate();
  const questions = cta.questions;
  const totalSteps = questions.length + 1; // Fragen + Kontakt-Schritt

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [contact, setContact] = useState({ name: "", email: "", telefon: "" });
  const [submitting, setSubmitting] = useState(false);
  const advanceTimer = useRef<number | null>(null);
  const started = useRef(false); // Lead-Funnel-Start nur einmal melden

  const isContactStep = step === questions.length;
  const updateContact = (key: keyof typeof contact, value: string) =>
    setContact((c) => ({ ...c, [key]: value }));

  const goBack = () => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setStep((s) => Math.max(0, s - 1));
  };

  // Antwort wählen → kurz das Häkchen zeigen, dann automatisch zum nächsten Schritt.
  const selectAnswer = (key: string, value: string) => {
    if (!started.current) {
      started.current = true;
      track("lead_start", {}); // erste Frage beantwortet → Lead-Funnel begonnen
    }
    track("lead_step", { lead_step: step + 1, lead_question: key, lead_answer: value });
    setAnswers((a) => ({ ...a, [key]: value }));
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      setStep((s) => Math.min(totalSteps - 1, s + 1));
    }, 320);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const unanswered = questions.filter((q) => !answers[q.key]);
    if (unanswered.length > 0) {
      toast.error("Bitte beantworte zuerst alle vier Fragen.");
      setStep(questions.findIndex((q) => !answers[q.key]));
      return;
    }

    setSubmitting(true);
    const payload: LeadPayload = {
      name: contact.name,
      email: contact.email,
      telefon: contact.telefon,
      klienten_pro_monat: answers.klienten_pro_monat,
      rechnungserstellung: answers.rechnungserstellung,
      zeit_monatsabschluss: answers.zeit_monatsabschluss,
      buchhaltungssystem: answers.buchhaltungssystem,
    };

    try {
      await submitLead(payload);
      track("lead_submit", { lead_questions: questions.length }); // Conversion (GA4)
      trackMeta("Lead"); // Conversion (Meta-Pixel)
      navigate("/danke");
    } catch {
      toast.error("Senden fehlgeschlagen. Bitte versuche es noch einmal.");
      setSubmitting(false);
    }
  };

  const currentQuestion = isContactStep ? null : questions[step];

  return (
    <section
      id="anfrage"
      className="section-padding py-16 md:py-24"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #EFF6FF 100%)" }}
    >
      <div className="section-container max-w-[640px]">
        <ScrollReveal>
          <div className="text-center">
            <span className="mb-6 inline-block rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-deep">
              {cta.kicker}
            </span>
            <h2 className="headline-h2 mb-4 text-text-primary">{cta.headline}</h2>
            <p className="body-large mx-auto mb-10 max-w-[620px]">{cta.subheadline}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-xl shadow-slate-200/60 md:p-8">
            {/* Fortschritt */}
            <div className="mb-7">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-text-muted">
                <span>
                  {isContactStep
                    ? "Fast geschafft"
                    : `Frage ${step + 1} von ${questions.length}`}
                </span>
                <span>
                  {step + 1} / {totalSteps}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300 ease-out"
                  style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {currentQuestion ? (
              /* --- Frage-Schritt --- */
              <div
                key={step}
                className="duration-300 animate-in fade-in slide-in-from-right-3"
              >
                <p className="mb-5 text-left text-lg font-semibold text-text-primary">
                  {currentQuestion.label}
                </p>
                <div className="flex flex-col gap-2.5">
                  {currentQuestion.options.map((opt) => {
                    const selected = answers[currentQuestion.key] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => selectAnswer(currentQuestion.key, opt)}
                        className={`inline-flex items-center justify-between rounded-xl border px-5 py-4 text-left text-[15px] font-medium transition-all ${
                          selected
                            ? "border-accent bg-accent text-primary-foreground shadow-sm"
                            : "border-border bg-white text-text-secondary hover:border-accent/60 hover:bg-accent-soft/40 hover:text-text-primary"
                        }`}
                      >
                        {opt}
                        {selected && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {step > 0 && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Zurück
                  </button>
                )}
              </div>
            ) : (
              /* --- Kontakt-Schritt --- */
              <form
                key="contact"
                onSubmit={handleSubmit}
                className="duration-300 animate-in fade-in slide-in-from-right-3"
              >
                <p className="mb-5 text-left text-lg font-semibold text-text-primary">
                  Fast geschafft — wohin dürfen wir uns melden?
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lead-name">Name *</Label>
                    <Input
                      id="lead-name"
                      required
                      value={contact.name}
                      onChange={(e) => updateContact("name", e.target.value)}
                      placeholder="Vor- und Nachname"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="lead-email">E-Mail *</Label>
                      <Input
                        id="lead-email"
                        type="email"
                        required
                        value={contact.email}
                        onChange={(e) => updateContact("email", e.target.value)}
                        placeholder="name@beispiel.ch"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lead-telefon">Telefon *</Label>
                      <Input
                        id="lead-telefon"
                        type="tel"
                        required
                        value={contact.telefon}
                        onChange={(e) => updateContact("telefon", e.target.value)}
                        placeholder="+41 …"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-8 py-4 text-lg font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {cta.sendingLabel}
                    </>
                  ) : (
                    <>
                      {cta.submitLabel}
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Zurück
                  </button>
                  <p className="flex items-center gap-2 text-right text-xs text-text-muted">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
                    {cta.privacyNote}
                  </p>
                </div>
              </form>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default OptinForm;
