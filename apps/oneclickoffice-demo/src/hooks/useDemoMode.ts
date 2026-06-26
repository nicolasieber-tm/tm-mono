// Zentrales Demo-Modus-Flag. Über Vite-Env gesetzt (VITE_DEMO_MODE=true, siehe .env.demo).
// Steuert UI-Verzweigungen (Vorschau-Sperren, Demo-Hinweise, deaktivierte Exporte).

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

export function useDemoMode(): boolean {
  return isDemoMode;
}
