import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKunde } from "@/hooks/useKunden";
import { useIsSingleLevel } from "@/hooks/useClientHierarchyMode";
import { EntityDetailLayout } from "@/components/clients/EntityDetailLayout";
import type { StammdatenField } from "@/components/clients/EntityOverviewTab";

const KundeDetail = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const isSingle = useIsSingleLevel();
  const { data: kunde, isLoading } = useKunde(companyId ?? "");

  const listLabel = isSingle ? "Kunden" : "Unternehmen";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!kunde) {
    return (
      <div className="p-6 text-center space-y-3">
        <p className="text-muted-foreground">
          {isSingle ? "Kunde" : "Unternehmen"} nicht gefunden.
        </p>
        <Button variant="outline" onClick={() => navigate("/unternehmen")}>
          Zurück zu {listLabel}
        </Button>
      </div>
    );
  }

  const addressLine = [kunde.address, kunde.building_number].filter(Boolean).join(" ");
  const subtitleParts = [addressLine, [kunde.zip, kunde.city].filter(Boolean).join(" ")]
    .filter((p) => p && p.trim() !== "")
    .join(", ");

  const stammdaten: StammdatenField[] = [
    { label: "Adresse", value: addressLine },
    { label: "PLZ", value: kunde.zip ?? "" },
    { label: "Ort", value: kunde.city ?? "" },
    { label: "Kontaktperson", value: kunde.contact_person ?? "" },
    { label: "Telefon", value: kunde.phone ?? "" },
    { label: "E-Mail", value: kunde.email ?? "" },
    { label: "IBAN", value: kunde.iban ?? "" },
    { label: "MwSt-Nr.", value: kunde.vat_number ?? "" },
  ];

  return (
    <EntityDetailLayout
      scope="company"
      id={kunde.id}
      title={kunde.name}
      subtitle={subtitleParts || undefined}
      backTo="/unternehmen"
      backLabel={`Zurück zu ${listLabel}`}
      stammdaten={stammdaten}
    />
  );
};

export default KundeDetail;
