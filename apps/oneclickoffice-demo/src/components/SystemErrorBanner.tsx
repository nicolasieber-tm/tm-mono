import { AlertTriangle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUnresolvedCriticalCount } from "@/hooks/useSystemErrors";

/**
 * Red warning banner shown when unresolved critical system errors exist.
 * Intended for placement at the top of the main dashboard.
 * Returns null (renders nothing) when there are no open critical errors.
 */
export default function SystemErrorBanner() {
  const { data: count = 0 } = useUnresolvedCriticalCount();
  const navigate = useNavigate();

  if (count === 0) return null;

  return (
    <div
      className="bg-red-50 border-2 border-red-500 rounded-lg p-4 mb-6 flex items-center justify-between cursor-pointer hover:bg-red-100 transition-colors"
      onClick={() => navigate('/einstellungen/system-status')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate('/einstellungen/system-status');
        }
      }}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
        <div>
          <p className="font-bold text-red-900">
            {count === 1
              ? '1 kritischer System-Fehler benötigt Aufmerksamkeit'
              : `${count} kritische System-Fehler benötigen Aufmerksamkeit`}
          </p>
          <p className="text-sm text-red-700">
            Die automatische Belegerkennung könnte betroffen sein. Klick für Details.
          </p>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 text-red-600 flex-shrink-0" />
    </div>
  );
}
