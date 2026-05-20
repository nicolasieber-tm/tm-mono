import { Mail, Clock, ShieldCheck, CalendarCheck, ArrowRight } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Reveal } from "@/components/ui/reveal";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { useSectionMode, modeToClass } from "@/lib/theme";

const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLScD7ZpEgO2n1XvpUsiUYKL4usLU84LBid3Y7kzYuDH9bKdQFw/formResponse";

const FIELD_IDS = {
  name: "entry.1505561126",
  firma: "entry.275091510",
  email: "entry.974722826",
  website: "entry.5008050",
  nachricht: "entry.1366752365",
} as const;

const inputClass =
  "w-full rounded-xl border c-border-soft bg-transparent c-fill-2 px-4 py-3 text-sm c-text placeholder:c-text-35 outline-none transition-all focus:c-border-stronger focus:ring-2 focus:ring-[#a78bfa]/40";

const labelClass = "block font-mono text-[10px] uppercase tracking-[0.22em] c-text-55 mb-2";

export const ContactForm = () => {
  const mode = useSectionMode("contact");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = new FormData();
    payload.append(FIELD_IDS.name, String(data.get("name") ?? ""));
    payload.append(FIELD_IDS.firma, String(data.get("firma") ?? ""));
    payload.append(FIELD_IDS.email, String(data.get("email") ?? ""));
    payload.append(FIELD_IDS.website, String(data.get("website") ?? ""));
    payload.append(FIELD_IDS.nachricht, String(data.get("nachricht") ?? ""));

    try {
      await fetch(GOOGLE_FORM_ACTION, {
        method: "POST",
        mode: "no-cors",
        body: payload,
      });
      toast.success("Vielen Dank. Wir melden uns innerhalb eines Werktags.");
      form.reset();
    } catch {
      toast.error("Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt per E-Mail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="kontakt"
      className={`cosmic ${modeToClass(mode)} relative overflow-hidden py-24 md:py-32`}
    >
      <SectionBackdrop seed={9} />
      <div className="relative container-tight">
        {/* Shared section headline */}
        <Reveal>
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.32em] c-text-55">
              · Zwei Wege zum Gespräch ·
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light c-text leading-[1.05]">
              Eine ehrliche Einschätzung.
              <span className="block font-display italic font-normal c-text-95 mt-2">
                Ihres Online-Auftritts.
              </span>
            </h2>
            <p className="mt-6 c-text-70 leading-relaxed">
              Ob direkt im Gespräch oder schriftlich — Sie erhalten eine ehrliche Einschätzung
              und konkrete Empfehlungen. Unverbindlich, ohne Verkaufsgespräch.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="c-card-ring c-surface rounded-2xl overflow-hidden relative">
            {/* Center divider with "oder" */}
            <div className="hidden lg:flex absolute left-1/2 top-0 bottom-0 -translate-x-1/2 flex-col items-center pointer-events-none z-10">
              <div className="flex-1 w-px c-border-soft border-l" />
              <span
                className="font-mono text-[10px] uppercase tracking-[0.28em] c-text-55 my-3 px-2 rounded-full"
                style={{ backgroundColor: "hsl(var(--c-surface))" }}
              >
                oder
              </span>
              <div className="flex-1 w-px c-border-soft border-l" />
            </div>

            <div className="grid lg:grid-cols-2">
              {/* Left: Booking path */}
              <div className="p-6 sm:p-8 lg:p-10 flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: "hsla(265, 80%, 75%, 0.15)" }}
                  >
                    <CalendarCheck className="h-5 w-5" style={{ color: "#a78bfa" }} />
                  </span>
                  <h3 className="text-xl font-medium c-text">Direkt Termin buchen</h3>
                </div>
                <p className="c-text-70 leading-relaxed mb-6">
                  Drei kurze Fragen, dann sofort einen Slot auswählen. Sie sprechen
                  innerhalb weniger Tage mit uns.
                </p>
                <ul className="space-y-3 text-sm mb-8">
                  <li className="flex items-center gap-3 c-text-70">
                    <Clock className="h-4 w-4 shrink-0" style={{ color: "#a78bfa" }} /> 30 Minuten · per Video oder Telefon
                  </li>
                  <li className="flex items-center gap-3 c-text-70">
                    <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: "#a78bfa" }} /> Unverbindlich · ohne Verkaufsgespräch
                  </li>
                  <li className="flex items-center gap-3 c-text-70">
                    <CalendarCheck className="h-4 w-4 shrink-0" style={{ color: "#a78bfa" }} /> Termine Mo–Fr verfügbar
                  </li>
                </ul>
                <div className="mt-auto">
                  <Link
                    to="/beratung"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition-transform hover:scale-[1.01]"
                    style={{ backgroundColor: "rgb(var(--c-fg))", color: "hsl(var(--c-bg))" }}
                  >
                    Beratung buchen
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Horizontal divider with "oder" for mobile */}
              <div className="lg:hidden relative flex items-center justify-center py-2">
                <div className="absolute left-6 right-6 h-px c-border-soft border-t" />
                <span
                  className="relative font-mono text-[10px] uppercase tracking-[0.28em] c-text-55 px-3"
                  style={{ backgroundColor: "hsl(var(--c-surface))" }}
                >
                  oder
                </span>
              </div>

              {/* Right: Form path */}
              <form
                onSubmit={handleSubmit}
                className="p-6 sm:p-8 lg:p-10 lg:border-l c-border-soft"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: "hsla(265, 80%, 75%, 0.15)" }}
                  >
                    <Mail className="h-5 w-5" style={{ color: "#a78bfa" }} />
                  </span>
                  <h3 className="text-xl font-medium c-text">Per Formular schreiben</h3>
                </div>
                <p className="c-text-70 leading-relaxed mb-6">
                  Ein paar Sätze genügen. Antwort per E-Mail innerhalb eines Werktags.
                </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={labelClass}>Name *</label>
                  <input id="name" name="name" required placeholder="Vor- und Nachname" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="firma" className={labelClass}>Firma *</label>
                  <input id="firma" name="firma" required placeholder="Unternehmen" className={inputClass} />
                </div>
              </div>
              <div className="mt-5">
                <label htmlFor="email" className={labelClass}>E-Mail *</label>
                <input id="email" name="email" type="email" required placeholder="name@unternehmen.ch" className={inputClass} />
              </div>
              <div className="mt-5">
                <label htmlFor="website" className={labelClass}>Website (optional)</label>
                <input id="website" name="website" placeholder="https://" className={inputClass} />
              </div>
              <div className="mt-5">
                <label htmlFor="nachricht" className={labelClass}>Kurze Nachricht</label>
                <textarea
                  id="nachricht"
                  name="nachricht"
                  rows={4}
                  placeholder="Was möchten Sie an Ihrem Online-Auftritt verbessern?"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-7 w-full inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
                style={{ backgroundColor: "rgb(var(--c-fg))", color: "hsl(var(--c-bg))" }}
              >
                <span className="absolute inset-[-2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity accent-gradient-anim -z-10" />
                {loading ? "Wird gesendet…" : "Kostenlose Analyse anfordern"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
              <p className="mt-3 text-center text-xs c-text-45">
                Mit dem Absenden stimmen Sie zu, dass wir Ihre Angaben zur Bearbeitung Ihrer Anfrage verwenden.
              </p>
              </form>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
