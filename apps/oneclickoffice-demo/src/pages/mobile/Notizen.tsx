import { ClientNotesExplorer } from "@/components/clients/ClientNotesExplorer";
import { useClientHierarchyMode } from "@/hooks/useClientHierarchyMode";
import { Loader2 } from "lucide-react";

const MobileNotizen = () => {
  // ClientNotesExplorer benötigt den Hierarchie-Modus, um die Klienten-Ebene
  // (two_level) bzw. die Kunden→Notizen-Ansicht (single_level) zu rendern.
  // Ohne mode blieb der Bereich nach Klick auf einen Ordner leer.
  const { data: mode } = useClientHierarchyMode();

  return (
    <div data-tour="notes-explorer" className="px-2 py-4 pb-28 space-y-4">
      <div className="px-1">
        <h1 className="text-2xl font-bold text-foreground">Sitzungsnotizen</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Unternehmen → Klient → Verlauf
        </p>
      </div>
      {mode ? (
        <ClientNotesExplorer mode={mode} />
      ) : (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default MobileNotizen;
