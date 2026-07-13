import { Navigate } from "react-router-dom";
import { useIsMobileViewport } from "@/hooks/useIsMobileViewport";

/**
 * Direkter Demo-Einstieg unter /live — Ziel des Buttons in der Opt-in-Mail.
 *
 * Statt zurück auf die Marketing-/Opt-in-Landing (das war der Funnel-Bruch:
 * wer sich einträgt, bekam einen Link auf genau dieselbe Seite) leitet /live
 * SOFORT in die echte Demo-App. Geräteabhängig wie in der eingebetteten Demo:
 * am Handy in die Erfassen-Ansicht, am Desktop ins Dashboard. Der Demo-Modus
 * authentifiziert automatisch — kein Login, kein erneutes Formular.
 */
const LiveDemo = () => {
  const isMobile = useIsMobileViewport();
  return <Navigate to={isMobile ? "/mobile/zeit" : "/dashboard"} replace />;
};

export default LiveDemo;
