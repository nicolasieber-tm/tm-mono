import { ClientAkteExplorer } from "@/components/clients/ClientAkteExplorer";
import { useClientHierarchyMode } from "@/hooks/useClientHierarchyMode";

const KlientenAkte = () => {
  const { data: mode = "two_level" } = useClientHierarchyMode();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {mode === "single_level" ? "Kunden-Akte" : "Klienten-Akte"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {mode === "single_level"
            ? "Kunde wählen, um Übersicht, Sitzungsnotizen und Finanzen zu öffnen."
            : "Unternehmen → Klient wählen, um Übersicht, Sitzungsnotizen und Finanzen zu öffnen."}
        </p>
      </div>
      <ClientAkteExplorer mode={mode} />
    </div>
  );
};

export default KlientenAkte;
