import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

declare global {
  interface Window {
    Cal?: ((...args: unknown[]) => unknown) & {
      ns?: Record<string, (...args: unknown[]) => unknown>;
    };
  }
}

const CtaSection = () => {
  useEffect(() => {
    const scriptId = "calcom-embed-script";
    const namespace = "auron-beratungstermin";
    const initCal = (retries = 15) => {
      if (!window.Cal) {
        if (retries > 0) {
          window.setTimeout(() => initCal(retries - 1), 200);
        }
        return;
      }
      window.Cal("init", namespace, { origin: "https://app.cal.com" });
      window.Cal.ns?.[namespace]?.("inline", {
        elementOrSelector: "#my-cal-inline-auron-beratungstermin",
        config: { layout: "month_view", useSlotsViewOnSmallScreen: true },
        calLink: "nicolasieber/auron-beratungstermin",
      });
      window.Cal.ns?.[namespace]?.("ui", { hideEventTypeDetails: false, layout: "month_view" });
    };

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://app.cal.com/embed/embed.js";
      script.async = true;
      script.onload = () => initCal();
      document.head.appendChild(script);
    } else {
      initCal();
    }
  }, []);

  return (
    <section id="beratung" className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center bg-primary/5 border border-primary/10 rounded-3xl sm:rounded-[3rem] p-5 sm:p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4 sm:mb-6">
            Bereit, Ihre Zeiterfassung zu automatisieren?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            Starten Sie heute und sparen Sie Ihrem Team täglich wertvolle Zeit.
          </p>

          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-6 text-sm font-medium text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Unverbindlich & kostenlos</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Persönliche Beratung</div>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 rounded-2xl border border-primary/15 bg-background/80 backdrop-blur-sm p-1 sm:p-2">
            <div
              id="my-cal-inline-auron-beratungstermin"
              className="w-full h-[560px] sm:h-[680px] overflow-scroll rounded-xl"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default CtaSection;
