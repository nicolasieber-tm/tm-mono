import { ClientNotesExplorer } from "@/components/clients/ClientNotesExplorer";
import { useClientHierarchyMode } from "@/hooks/useClientHierarchyMode";

const MobileNotizen = () => {
  const { data: mode = "two_level" } = useClientHierarchyMode();
  return (
    <div data-tour="notes-explorer" className="px-2 py-4 pb-28 space-y-4">
      <div className="px-1">
        <h1 className="text-2xl font-bold text-foreground">Sitzungsnotizen</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Unternehmen → Klient → Verlauf
        </p>
      </div>
      <ClientNotesExplorer mode={mode} />
    </div>
  );
};

export default MobileNotizen;
