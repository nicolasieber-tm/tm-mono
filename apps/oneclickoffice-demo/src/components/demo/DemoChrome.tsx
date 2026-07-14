import { ReactNode } from "react";
import { Eye, Info, ArrowLeft } from "lucide-react";
import { isDemoMode } from "@/hooks/useDemoMode";

// Globaler Hinweis-Balken (oben im MainLayout) — nur im Demo sichtbar.
export function DemoModeBar() {
  if (!isDemoMode) return null;
  // Ausstieg zurück zur Landingpage NUR im eigenständigen Demo-Fenster anbieten
  // (nicht im eingebetteten Desktop-iframe, wo die Demo ohnehin auf der Seite
  // sitzt). Ohne diesen Ausstieg „sitzt" der mobile Besucher in der Demo fest
  // und müsste sich per Browser-Back rauskämpfen → Conversion-Killer.
  const standalone = typeof window !== "undefined" && window.self === window.top;
  return (
    <div className="sticky top-0 z-40 flex items-center gap-2 bg-primary px-3 py-2 text-primary-foreground">
      {standalone && (
        <a
          href="/"
          aria-label="Zurück zur Seite"
          className="flex shrink-0 items-center gap-1 rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-white/25"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Zurück
        </a>
      )}
      <span className="flex flex-1 items-center justify-center gap-1.5 text-center text-[11px] font-medium sm:text-sm">
        <Eye className="h-4 w-4 shrink-0" />
        <span>
          Demo-Modus — Beispieldaten, <strong>nichts wird gespeichert</strong>.
        </span>
      </span>
    </div>
  );
}

// Inline-Hinweis auf Seiten, die in der Demo nur als Vorschau dienen.
export function DemoReadOnlyNotice({ title }: { title?: string }) {
  if (!isDemoMode) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p className="text-foreground">
        <strong>Vorschau{title ? ` · ${title}` : ""}.</strong> Dieser Bereich ist in der Demo nicht
        bearbeitbar.
      </p>
    </div>
  );
}

// Deaktiviert alle enthaltenen Formular-Controls im Demo (natives <fieldset disabled>),
// ohne das Layout zu verändern (display:contents).
export function DemoFieldset({ children }: { children: ReactNode }) {
  if (!isDemoMode) return <>{children}</>;
  return (
    <fieldset disabled className="contents">
      {children}
    </fieldset>
  );
}
