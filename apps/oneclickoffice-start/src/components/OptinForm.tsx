import { FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { optin } from "@/lib/content";
import { submitLead } from "@/lib/submitLead";
import { track } from "@/lib/analytics";
import { metaContext, neueEventId } from "@/lib/metaContext";

/**
 * Telefonnummer: Pflicht oder freiwillig?
 * ---------------------------------------
 * Startaufstellung ist Pflicht — eine Nummer ist für den Rückruf deutlich mehr
 * wert als eine E-Mail-Adresse allein. Falls sich zeigt, dass viel Traffic
 * kommt, aber kaum jemand absendet, ist die Telefonnummer der erste
 * Verdächtige: dann hier auf false stellen. Das Feld bleibt sichtbar, wird aber
 * als „optional" ausgewiesen und nicht mehr erzwungen.
 */
const TELEFON_REQUIRED = true;

/** Bewusst grosszügig — echte Adressen abweisen ist teurer als ein Tippfehler. */
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** Nur prüfen, ob überhaupt eine plausible Nummer dasteht (Formate variieren stark). */
const isPhone = (value: string) => value.replace(/[^\d]/g, "").length >= 9;

type Errors = Partial<Record<"name" | "email" | "telefon" | "form", string>>;

/** Inhalt des Opt-in-Overlays: die drei Felder plus Absenden. */
const OptinForm = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", telefon: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const started = useRef(false); // „Formular begonnen" nur einmal melden

  /* Hängt bewusst an der ERSTEN Eingabe, nicht am Fokus: Am Desktop setzt das
     Overlay den Cursor automatisch ins erste Feld — über onFocus hätte damit
     jeder Öffner „Formular begonnen" gemeldet, ohne ein Zeichen zu tippen.
     Das verzerrte sowohl die eigene Quote als auch das Meta-Signal
     InitiateCheckout. */
  const handleFirstInput = () => {
    if (started.current) return;
    started.current = true;
    track("lead_start", { lead_form: "optin_video" });
  };

  const update = (key: keyof typeof values, value: string) => {
    handleFirstInput();
    setValues((v) => ({ ...v, [key]: value }));
    // Fehler verschwindet, sobald der Nutzer das Feld anfasst — nicht erst beim
    // nächsten Absenden.
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (values.name.trim().length < 2) next.name = "Bitte trag deinen Namen ein.";
    if (!isEmail(values.email)) next.email = "Bitte prüf deine E-Mail-Adresse.";
    if (TELEFON_REQUIRED && !isPhone(values.telefon)) {
      next.telefon = "Bitte trag deine Telefonnummer ein.";
    } else if (!TELEFON_REQUIRED && values.telefon.trim() && !isPhone(values.telefon)) {
      next.telefon = "Diese Nummer sieht unvollständig aus.";
    }
    return next;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      document.getElementById(`lead-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setSubmitting(true);
    setErrors({});

    // Eine Kennung für BEIDE Meldungen dieser Conversion: Der Browser-Pixel
    // meldet sie gleich mit, der Server holt sie später aus der Datenbank.
    // Ohne diese gemeinsame Kennung würde Meta die Conversion doppelt zählen.
    const metaEventId = neueEventId();

    try {
      await submitLead({
        ...values,
        meta_event_id: metaEventId,
        meta_context: metaContext(),
      });
      // Meldet an dataLayer, eigene Datenbank und Meta-Pixel ("Lead") zugleich.
      track("lead_submit", { lead_form: "optin_video" }, metaEventId);
      // Merkt sich, dass dieser Besucher eingetragen ist — die Video-Seite
      // begrüsst ihn dann mit Namen. Kein Zugangsschutz: der Link aus der
      // E-Mail muss ohne diesen Eintrag funktionieren.
      try {
        sessionStorage.setItem("oco_lead_name", values.name.trim());
        // Für die Bestätigungszeile auf der Video-Seite („… an dich geschickt").
        sessionStorage.setItem("oco_lead_email", values.email.trim().toLowerCase());
        // Signal an den Player: Dieser Besucher hat den Start schon angefordert,
        // das Video soll ohne zweiten Klick loslaufen.
        sessionStorage.setItem("oco_video_autostart", "1");
      } catch {
        /* Privatmodus o. Ä. — dann eben ohne Namen und ohne Autostart */
      }
      navigate("/video");
    } catch (error) {
      console.error("[OptinForm]", error);
      setErrors({ form: optin.form.errorMessage });
      setSubmitting(false);
    }
  };

  const fields = optin.form.fields;

  return (
    <>
      <h2
        id="optin-modal-title"
        className="pr-8 text-xl font-bold tracking-tight text-text-primary"
      >
        {optin.form.title}
      </h2>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-text-secondary">
        {optin.form.subtitle}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label htmlFor="lead-name" className="field-label">
            {fields.name.label} *
          </label>
          <input
            id="lead-name"
            name="name"
            type="text"
            autoComplete="name"
            className="field-input"
            placeholder={fields.name.placeholder}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "err-name" : undefined}
          />
          {errors.name && (
            <p id="err-name" className="mt-1.5 text-sm text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="lead-email" className="field-label">
            {fields.email.label} *
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className="field-input"
            placeholder={fields.email.placeholder}
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "err-email" : undefined}
          />
          {errors.email && (
            <p id="err-email" className="mt-1.5 text-sm text-destructive">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="lead-telefon" className="field-label">
            {fields.telefon.label}{" "}
            {TELEFON_REQUIRED ? (
              "*"
            ) : (
              <span className="font-normal text-text-muted">(optional)</span>
            )}
          </label>
          <input
            id="lead-telefon"
            name="telefon"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="field-input"
            placeholder={fields.telefon.placeholder}
            value={values.telefon}
            onChange={(e) => update("telefon", e.target.value)}
            aria-invalid={Boolean(errors.telefon)}
            aria-describedby={errors.telefon ? "err-telefon" : undefined}
          />
          {errors.telefon && (
            <p id="err-telefon" className="mt-1.5 text-sm text-destructive">
              {errors.telefon}
            </p>
          )}
        </div>

        {errors.form && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {errors.form}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary !mt-6">
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {optin.form.sendingLabel}
            </>
          ) : (
            <>
              {optin.form.submitLabel}
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-text-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          {optin.form.privacyNote}
        </p>
      </form>
    </>
  );
};

export default OptinForm;
