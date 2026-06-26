import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClient } from "@/hooks/useClients";
import { useIsSingleLevel } from "@/hooks/useClientHierarchyMode";
import { EntityDetailLayout } from "@/components/clients/EntityDetailLayout";
import type { StammdatenField } from "@/components/clients/EntityOverviewTab";
import { formatDateDE } from "@/components/expenses/formatters";

const KlientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const isSingle = useIsSingleLevel();
  const { data: client, isLoading } = useClient(clientId ?? "");

  // Im single_level-Modus gibt es kein Klient-Konzept.
  useEffect(() => {
    if (isSingle) navigate("/unternehmen", { replace: true });
  }, [isSingle, navigate]);
  if (isSingle) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 text-center space-y-3">
        <p className="text-muted-foreground">Klient nicht gefunden.</p>
        <Button variant="outline" onClick={() => navigate("/klienten")}>
          Zurück zu Klienten
        </Button>
      </div>
    );
  }

  const fullName = `${client.first_name ?? ""} ${client.last_name ?? ""}`.trim();
  const subtitleParts = [client.address, [client.zip, client.city].filter(Boolean).join(" ")]
    .filter((p) => p && p.trim() !== "")
    .join(", ");

  const stammdaten: StammdatenField[] = [
    { label: "Anrede", value: client.salutation ?? "" },
    { label: "Vorname", value: client.first_name ?? "" },
    { label: "Nachname", value: client.last_name ?? "" },
    { label: "Adresse", value: client.address ?? "" },
    { label: "PLZ", value: client.zip ?? "" },
    { label: "Ort", value: client.city ?? "" },
    { label: "Geburtsdatum", value: client.birthdate ? formatDateDE(client.birthdate) : "" },
    { label: "Kontaktperson", value: client.contact_person ?? "" },
  ];

  return (
    <EntityDetailLayout
      scope="client"
      id={client.id}
      title={fullName || "Klient"}
      subtitle={subtitleParts || undefined}
      backTo="/klienten"
      backLabel="Zurück zu Klienten"
      stammdaten={stammdaten}
    />
  );
};

export default KlientDetail;
