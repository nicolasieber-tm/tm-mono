import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Mail, Phone, Building2, Users, FileText, User, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useReveal } from "@/hooks/use-reveal";
import { subscribeEarlyAccess } from "@/lib/listmonk";
import { notifyTelegram } from "@/lib/telegram";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Bitte geben Sie Vor- und Nachname an."),
  company: z.string().trim().min(2, "Bitte geben Sie Ihre Firma an."),
  email: z
    .string()
    .trim()
    .min(1, "E-Mail ist erforderlich.")
    .email("Bitte eine gültige E-Mail-Adresse eingeben."),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal("")),
  employees: z
    .string()
    .min(1, "Bitte wählen Sie die Anzahl Mitarbeitende."),
  currentTracking: z.string().trim().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function EarlyAccess() {
  const { reveal } = useReveal();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      employees: "",
      currentTracking: "",
    },
  });

  const benefits = [
    "Frühzeitig Zugang zu Auron erhalten",
    "Einführungsvorteil für frühe Interessenten sichern",
    "Praxisfeedback fliesst direkt in die Weiterentwicklung ein",
  ];

  const onSubmit = async (values: FormValues) => {
    try {
      await subscribeEarlyAccess({
        name: values.name,
        email: values.email,
        company: values.company,
        phone: values.phone,
        employees: values.employees,
        currentTracking: values.currentTracking,
      });

      notifyTelegram({
        name: values.name,
        email: values.email,
        company: values.company,
        phone: values.phone,
        employees: values.employees,
        currentTracking: values.currentTracking,
      }).catch(() => {
        // Telegram-Fehler soll den Nutzer-Flow nicht blockieren
      });

      setSubmitted(true);
      reset();
      toast.success("Fast geschafft – bitte bestätigen Sie Ihre E-Mail.", {
        description: "Wir haben Ihnen einen Bestätigungslink an Ihre E-Mail-Adresse gesendet.",
        duration: 8000,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler.";
      toast.error("Anmeldung fehlgeschlagen", {
        description: message,
      });
    }
  };

  const inputCls =
    "w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all";
  const errorCls = "text-xs text-red-400 mt-1";

  return (
    <section id="early-access" className="min-h-[calc(100svh-80px)] flex items-center py-16 sm:py-24 bg-zinc-950 px-4 sm:px-6 lg:px-8 relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 rounded-full w-full h-full transform scale-150" />

      <div id="early-access-content" className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Column: Text */}
          <motion.div {...reveal(0, 20)}>
            <div className="inline-flex bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(var(--primary),0.1)] mb-6">
              Für Handwerker und Bauunternehmen
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 sm:mb-6">
              Auron Pilotbetrieb werden
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 sm:mb-8">
              Wir führen Auron aktuell mit ausgewählten Handwerks- und Bauunternehmen ein. Melden Sie sich bei Interesse an und wir melden uns persönlich bei Ihnen.
            </p>

            <ul className="space-y-4">
              {benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/50">
                    <Check className="w-3.5 h-3.5 font-bold" />
                  </div>
                  <span className="text-zinc-300 font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div
            {...reveal(0.2, 20)}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 md:p-10 shadow-2xl relative"
          >
            {submitted ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Fast geschafft!
                </h3>
                <p className="text-zinc-300 mb-6">
                  Wir haben Ihnen einen Bestätigungslink an Ihre E-Mail-Adresse gesendet. Bitte klicken Sie ihn an, damit wir uns bei Ihnen melden dürfen.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-sm text-primary hover:underline"
                >
                  Weitere Anmeldung
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
                  <label htmlFor="ea-name" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> Vorname und Nachname
                  </label>
                  <input
                    id="ea-name"
                    type="text"
                    autoComplete="name"
                    className={inputCls}
                    placeholder="Max Mustermann"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                  />
                  {errors.name && <p className={errorCls}>{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="ea-company" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> Firma
                  </label>
                  <input
                    id="ea-company"
                    type="text"
                    autoComplete="organization"
                    className={inputCls}
                    placeholder="Ihre Firma GmbH"
                    aria-invalid={!!errors.company}
                    {...register("company")}
                  />
                  {errors.company && <p className={errorCls}>{errors.company.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="ea-email" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" /> E-Mail
                    </label>
                    <input
                      id="ea-email"
                      type="email"
                      autoComplete="email"
                      className={inputCls}
                      placeholder="mail@firma.ch"
                      aria-invalid={!!errors.email}
                      {...register("email")}
                    />
                    {errors.email && <p className={errorCls}>{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ea-phone" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" /> Telefonnummer
                    </label>
                    <input
                      id="ea-phone"
                      type="tel"
                      autoComplete="tel"
                      className={inputCls}
                      placeholder="+41 79 123 45 67"
                      {...register("phone")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="ea-employees" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" /> Anzahl Mitarbeitende
                  </label>
                  <select
                    id="ea-employees"
                    className={`${inputCls} appearance-none`}
                    aria-invalid={!!errors.employees}
                    defaultValue=""
                    {...register("employees")}
                  >
                    <option value="" disabled>Bitte wählen...</option>
                    <option value="1-5">1-5</option>
                    <option value="6-15">6-15</option>
                    <option value="16-50">16-50</option>
                    <option value="51+">Über 50</option>
                  </select>
                  {errors.employees && <p className={errorCls}>{errors.employees.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="ea-current-tracking" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Optional: Wie erfassen Sie heute Ihre Zeiten?
                  </label>
                  <input
                    id="ea-current-tracking"
                    type="text"
                    className={inputCls}
                    placeholder="Z.B. Papier, Excel, andere Software..."
                    {...register("currentTracking")}
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] inline-flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isSubmitting ? "Wird gesendet..." : "Pilotbetrieb werden"}
                  </button>
                  <div className="text-center mt-3">
                    <p className="text-xs text-zinc-500 font-medium tracking-wide">
                      Aktuell im Einsatz mit 5 Pilotbetrieben.
                    </p>
                  </div>
                </div>
              </form>
            )}

            <p className="text-center text-xs text-zinc-500 mt-6">
              Unverbindlich &amp; kostenlos · Sie erhalten eine Bestätigungs-E-Mail
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
