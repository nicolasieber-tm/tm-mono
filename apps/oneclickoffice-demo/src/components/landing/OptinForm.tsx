import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ScrollReveal from "./ScrollReveal";
import { cta } from "@/lib/landing-content";
import { submitLead, type LeadPayload } from "@/lib/submitLead";

const OptinForm = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [contact, setContact] = useState({ name: "", email: "", telefon: "" });
  const [submitting, setSubmitting] = useState(false);

  const setAnswer = (key: string, value: string) =>
    setAnswers((a) => ({ ...a, [key]: value }));
  const updateContact = (key: keyof typeof contact, value: string) =>
    setContact((c) => ({ ...c, [key]: value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const unanswered = cta.questions.filter((q) => !answers[q.key]);
    if (unanswered.length > 0) {
      toast.error("Bitte beantworte zuerst alle vier Fragen.");
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
      navigate("/danke");
    } catch {
      toast.error("Senden fehlgeschlagen. Bitte versuche es noch einmal.");
      setSubmitting(false);
    }
  };

  return (
    <section
      id="anfrage"
      className="section-padding py-16 md:py-24"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #EFF6FF 100%)" }}
    >
      <div className="section-container max-w-[760px]">
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
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-white p-6 shadow-xl shadow-slate-200/60 md:p-8"
          >
            {/* Qualifizierungs-Fragen */}
            <div className="space-y-7">
              {cta.questions.map((q) => (
                <div key={q.key}>
                  <p className="mb-3 text-left text-[15px] font-semibold text-text-primary">
                    {q.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => {
                      const selected = answers[q.key] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswer(q.key, opt)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                            selected
                              ? "border-accent bg-accent text-primary-foreground shadow-sm"
                              : "border-border bg-white text-text-secondary hover:border-accent/60 hover:text-text-primary"
                          }`}
                        >
                          {selected && <Check className="h-3.5 w-3.5" />}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Kontaktdaten */}
            <div className="mt-8 space-y-4 border-t border-border pt-7">
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
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-8 py-4 text-lg font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:bg-accent-deep hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
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

            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-text-muted">
              <ShieldCheck className="h-4 w-4 text-accent" />
              {cta.privacyNote}
            </p>
          </form>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default OptinForm;
