import { FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import ScrollReveal from "./ScrollReveal";
import { cta } from "@/lib/landing-content";
import { submitLead, type LeadPayload } from "@/lib/submitLead";
import { track, trackMeta } from "@/lib/analytics";

const m = cta.mobile;

/**
 * Schlankes Optin NUR für Mobile (≤767px): ersetzt am Handy den 4-Fragen-Wizard.
 * Pflicht sind nur Name + E-Mail, damit möglichst wenig Reibung entsteht. Ziel
 * ist der Demo-Zugang per E-Mail (der Nutzer testet dann in Ruhe am Desktop).
 */
const MobileOptin = ({ leadCta = false }: { leadCta?: boolean }) => {
  const navigate = useNavigate();
  const [contact, setContact] = useState({
    name: "",
    email: "",
    telefon: "",
    aktuelles_system: "",
  });
  const [rueckruf, setRueckruf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Telefon ist normalerweise optional – aber Pflicht, sobald ein Rückruf
  // gewünscht ist (ohne Nummer kann niemand zurückrufen).
  const [phoneError, setPhoneError] = useState(false);
  const started = useRef(false); // Lead-Funnel-Start nur einmal melden

  const update = (key: keyof typeof contact, value: string) => {
    if (!started.current) {
      started.current = true;
      track("lead_start", { lead_variant: "mobile_optin" });
    }
    setContact((c) => ({ ...c, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Rückruf angekreuzt, aber keine Telefonnummer -> nicht absenden, Feld rot markieren.
    if (rueckruf && !contact.telefon.trim()) {
      setPhoneError(true);
      document.getElementById("optin-telefon")?.focus();
      return;
    }

    setSubmitting(true);

    const payload: LeadPayload = {
      name: contact.name,
      email: contact.email,
      telefon: contact.telefon || undefined,
      aktuelles_system: contact.aktuelles_system || undefined,
      rueckruf,
    };

    try {
      await submitLead(payload, "landingpage-demo-mobile");
      track("lead_submit", { lead_variant: "mobile_optin" }); // Conversion (GA4)
      trackMeta("Lead"); // Conversion (Meta-Pixel)
      navigate("/danke?flow=demo");
    } catch {
      toast.error("Senden fehlgeschlagen. Bitte versuche es noch einmal.");
      setSubmitting(false);
    }
  };

  return (
    <section
      id="anfrage"
      className="section-padding py-12 md:py-24"
      style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #EFF6FF 100%)" }}
    >
      <div className="section-container max-w-[640px]">
        {!leadCta && (
          <ScrollReveal>
            <div className="text-center">
              <span className="mb-6 inline-block rounded-full bg-accent-soft px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-deep">
                {m.kicker}
              </span>
              <h2 className="headline-h2 mb-4 text-text-primary">{m.headline}</h2>
              <p className="body-large mx-auto mb-10 max-w-[620px]">{m.subheadline}</p>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal delay={0.1}>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-xl shadow-slate-200/60 md:p-8">
            {leadCta && (
              <div className="mb-7 text-center">
                <h2 className="mb-3 text-2xl font-bold leading-tight text-text-primary">
                  Willst du sehen, wie dieser Ablauf in OneClick Office aussieht?
                </h2>
                <p className="text-[15px] leading-relaxed text-text-secondary">
                  Wir senden dir den Demo-Zugang direkt per E-Mail. Am besten testest du die
                  Demo am Desktop, dort siehst du den gesamten Ablauf vom Erfassen bis zur Rechnung.
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="optin-name">{m.fields.name.label} *</Label>
                  <Input
                    id="optin-name"
                    required
                    value={contact.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder={m.fields.name.placeholder}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="optin-email">{m.fields.email.label} *</Label>
                  <Input
                    id="optin-email"
                    type="email"
                    required
                    value={contact.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder={m.fields.email.placeholder}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="optin-telefon">
                    {m.fields.telefon.label}{" "}
                    {rueckruf ? (
                      <span className="text-red-500">*</span>
                    ) : (
                      <span className="font-normal text-text-muted">(optional)</span>
                    )}
                  </Label>
                  <Input
                    id="optin-telefon"
                    type="tel"
                    value={contact.telefon}
                    onChange={(e) => {
                      update("telefon", e.target.value);
                      if (phoneError) setPhoneError(false); // Eingabe -> Fehler weg
                    }}
                    placeholder={m.fields.telefon.placeholder}
                    aria-invalid={phoneError}
                    className={
                      phoneError ? "border-red-500 focus-visible:ring-red-500" : undefined
                    }
                  />
                  {phoneError && (
                    <p className="text-sm font-medium text-red-500">
                      Bitte Telefonnummer eingeben, damit wir dich zurückrufen können.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="optin-system">
                    {m.fields.system.label}{" "}
                    <span className="font-normal text-text-muted">(optional)</span>
                  </Label>
                  <Input
                    id="optin-system"
                    value={contact.aktuelles_system}
                    onChange={(e) => update("aktuelles_system", e.target.value)}
                    placeholder={m.fields.system.placeholder}
                  />
                </div>

                <label
                  htmlFor="optin-rueckruf"
                  className="flex cursor-pointer items-center gap-3 pt-1 text-[15px] font-medium text-text-secondary"
                >
                  <Checkbox
                    id="optin-rueckruf"
                    checked={rueckruf}
                    onCheckedChange={(v) => {
                      const checked = v === true;
                      setRueckruf(checked);
                      if (!checked) setPhoneError(false); // Rückruf weg -> Telefon wieder optional
                    }}
                  />
                  {m.rueckrufLabel}
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-8 py-4 text-lg font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {m.sendingLabel}
                  </>
                ) : (
                  <>
                    {m.submitLabel}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <p className="mt-4 flex items-start gap-2 text-xs text-text-muted">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {m.hint}
              </p>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default MobileOptin;
