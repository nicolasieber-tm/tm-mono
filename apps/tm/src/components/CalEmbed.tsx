import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { CAL_LINK, CAL_URL } from "@/lib/links";

type CalPrefill = {
  name?: string;
  email?: string;
  /** Freitext-Notiz, erscheint im Buchungsformular & in der Bestätigung */
  notes?: string;
};

type CalEmbedProps = {
  /** zusätzliche Klassen für den Embed-Container (Höhe etc.) */
  className?: string;
  /** Vorausgefüllte Felder (z. B. aus dem Beratungs-Flow) */
  prefill?: CalPrefill;
};

/**
 * Offizieller Cal.com-Embed (@calcom/embed-react).
 *
 * Ersetzt die frühere direkte `<iframe src="...?embed=true">`-Einbindung, die in
 * Browsern mit aktivem Tracking-Schutz (z. B. Edge auf Windows, Standard = an)
 * nur die HTML-Hülle ohne Kalender lud. Das offizielle SDK verwaltet den
 * iframe-Lifecycle, Bootstrapping und Resize browserübergreifend zuverlässig.
 *
 * Fällt der Embed dennoch nicht geladen werden (z. B. komplett blockierte
 * Third-Party-Frames), erscheint nach kurzer Zeit ein direkter Link als Fallback.
 */
export const CalEmbed = ({ className, prefill }: CalEmbedProps) => {
  const [loaded, setLoaded] = useState(false);

  // Notizen/Name/E-Mail als Query an den Fallback-Link hängen, damit auch der
  // "in neuem Tab buchen"-Pfad vorausgefüllt ist.
  const fallbackUrl = (() => {
    const params = new URLSearchParams();
    if (prefill?.name) params.set("name", prefill.name);
    if (prefill?.email) params.set("email", prefill.email);
    if (prefill?.notes) params.set("notes", prefill.notes);
    const qs = params.toString();
    return qs ? `${CAL_URL}?${qs}` : CAL_URL;
  })();

  useEffect(() => {
    let active = true;
    (async () => {
      const cal = await getCalApi();
      cal("ui", { theme: "light", hideEventTypeDetails: false, layout: "month_view" });
      cal("on", {
        action: "linkReady",
        callback: () => {
          if (active) setLoaded(true);
        },
      });
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={`relative ${className ?? ""}`}>
      <Cal
        calLink={CAL_LINK}
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
        config={{
          layout: "month_view",
          theme: "light",
          ...(prefill?.name ? { name: prefill.name } : {}),
          ...(prefill?.email ? { email: prefill.email } : {}),
          ...(prefill?.notes ? { notes: prefill.notes } : {}),
        }}
      />
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white text-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-black/15 border-t-black/50" />
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener"
            className="pointer-events-auto text-sm font-medium text-black/60 underline underline-offset-4 hover:text-black"
          >
            Kalender öffnet nicht? Hier in neuem Tab buchen ↗
          </a>
        </div>
      )}
    </div>
  );
};

export default CalEmbed;
