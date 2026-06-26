import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, Plus } from "lucide-react";
import { useKunden, useCreateKunde } from "@/hooks/useKunden";
import { Separator } from "@/components/ui/separator";
import { Database } from "@/integrations/supabase/types";

type KundeInsert = Database["public"]["Tables"]["kunden"]["Insert"];

const OneClickOffice = () => {
  const { data: companies, isLoading } = useKunden();
  const createCompany = useCreateKunde();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    zip: "",
    city: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    await createCompany.mutateAsync({
      name: formData.name,
      address: formData.address || null,
      zip: formData.zip || null,
      city: formData.city || null,
    } satisfies KundeInsert);
    setFormData({ name: "", address: "", zip: "", city: "" });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">OneClick-Office</h1>
          <p className="text-sm text-muted-foreground">Unternehmen ansehen und neue anlegen</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Neues Unternehmen</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="company-name">Firmenname *</Label>
              <Input
                id="company-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Blickwinkel GmbH"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Strasse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Musterstrasse 12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">PLZ</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  placeholder="4500"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="city">Ort</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Solothurn"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={createCompany.isPending}>
              {createCompany.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Unternehmen anlegen
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bestehende Unternehmen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : companies && companies.length > 0 ? (
            companies.map((company) => (
              <div key={company.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{company.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {company.address || ""} {company.zip || ""} {company.city || ""}
                    </p>
                  </div>
                </div>
                <Separator />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Noch keine Unternehmen erfasst.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OneClickOffice;
