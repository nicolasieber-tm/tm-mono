import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { ClientNotesTab } from "./ClientNotesTab";
import { CompanyNotesTab } from "./CompanyNotesTab";
import { EntityOverviewTab, type StammdatenField } from "./EntityOverviewTab";
import { EntityFinanceTab } from "./EntityFinanceTab";
import type { FinanceScope } from "@/hooks/useEntityFinances";

interface Props {
  scope: FinanceScope;
  id: string;
  title: string;
  subtitle?: string;
  backTo: string;
  backLabel: string;
  stammdaten: StammdatenField[];
}

export const EntityDetailLayout = ({
  scope,
  id,
  title,
  subtitle,
  backTo,
  backLabel,
  stammdaten,
}: Props) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("uebersicht");

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="px-2"
          onClick={() => navigate(backTo)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {backLabel}
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="uebersicht">Übersicht</TabsTrigger>
          <TabsTrigger value="notizen">Sitzungsnotizen</TabsTrigger>
          <TabsTrigger value="finanzen">Finanzen</TabsTrigger>
        </TabsList>

        <TabsContent value="uebersicht" className="mt-4">
          <EntityOverviewTab
            scope={scope}
            id={id}
            stammdaten={stammdaten}
          />
        </TabsContent>

        <TabsContent value="notizen" className="mt-4">
          {scope === "client" ? (
            <ClientNotesTab clientId={id} />
          ) : (
            <CompanyNotesTab companyId={id} />
          )}
        </TabsContent>

        <TabsContent value="finanzen" className="mt-4">
          <EntityFinanceTab scope={scope} id={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
