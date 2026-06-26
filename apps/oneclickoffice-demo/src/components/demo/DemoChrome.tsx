import { ReactNode } from "react";
import { Eye, Info } from "lucide-react";
import { isDemoMode } from "@/hooks/useDemoMode";

// Globaler Hinweis-Balken (oben im MainLayout) — nur im Demo sichtbar.
export function DemoModeBar() {
  if (!isDemoMode) return null;
  return (
    <div className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground sm:text-sm">
      <Eye className="h-4 w-4 shrink-0" />
      <span>
        Demo-Modus — alle Daten sind Beispiele und werden <strong>nicht gespeichert</strong>. Beim Neuladen
        startet die Demo frisch.
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
