import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConsent, setConsent, OPEN_CONSENT_EVENT } from "@/lib/analytics";

/**
 * Cookie-Banner (Opt-out für Analytics). Zeigt sich nur, solange noch keine
 * Wahl getroffen wurde; über den Footer-Link lässt es sich erneut öffnen.
 * GTM und die Consent-Defaults stecken bereits in index.html.
 */
const ConsentBanner = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  if (!open) return null;

  const decide = (state: "granted" | "denied") => {
    setConsent(state);
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[10000] p-4"
      role="dialog"
      aria-label="Cookie-Einwilligung"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-2xl sm:flex-row sm:items-center">
        <p className="flex-1 text-sm leading-relaxed text-text-secondary">
          Wir verwenden Cookies und Google Tag Manager, um anonym zu verstehen,
          wie diese Seite genutzt wird. Details in der{" "}
          <Link to="/datenschutz" className="font-medium text-accent-deep hover:underline">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decide("denied")}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated"
          >
            Ablehnen
          </button>
          <button
            type="button"
            onClick={() => decide("granted")}
            className="rounded-full bg-accent-deep px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
