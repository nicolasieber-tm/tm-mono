import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, X, Folder } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useKunden } from "@/hooks/useKunden";
import { useClientNoteStats } from "@/hooks/useClientNoteStats";
import { NotesFolderCard } from "./NotesFolderCard";
import { NotesBreadcrumb } from "./NotesBreadcrumb";
import { ClientNotesTab } from "./ClientNotesTab";
import { CompanyNotesTab } from "./CompanyNotesTab";
import type { ClientHierarchyMode } from "@/hooks/useClientHierarchyMode";

const daysAgo = (iso: string): number => {
  const now = Date.now();
  const then = new Date(iso).getTime();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
};

const relativeDateLabel = (iso: string | null): string | null => {
  if (!iso) return null;
  const d = daysAgo(iso);
  if (d < 1) return "Zuletzt heute";
  if (d === 1) return "Zuletzt gestern";
  if (d < 7) return `Zuletzt vor ${d} Tagen`;
  if (d < 14) return "Zuletzt vor 1 Woche";
  if (d < 30) return `Zuletzt vor ${Math.floor(d / 7)} Wochen`;
  if (d < 60) return "Zuletzt vor 1 Monat";
  if (d < 365) return `Zuletzt vor ${Math.floor(d / 30)} Monaten`;
  return "Zuletzt > 1 Jahr";
};

interface Props {
  mode: ClientHierarchyMode;
}

export const ClientNotesExplorer = ({ mode }: Props) => {
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: companies, isLoading: companiesLoading } = useKunden();
  const { data: stats } = useClientNoteStats();

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [companyQuery, setCompanyQuery] = useState("");
  const [clientQuery, setClientQuery] = useState("");

  // ── two_level: root → clients → notes
  // ── single_level: root → notes (company-scoped)
  const level: "root" | "clients" | "notes" =
    mode === "single_level"
      ? selectedCompany
        ? "notes"
        : "root"
      : selectedClient
      ? "notes"
      : selectedCompany
      ? "clients"
      : "root";

  const currentCompany = useMemo(
    () => companies?.find((c) => c.id === selectedCompany) ?? null,
    [companies, selectedCompany]
  );
  const currentClient = useMemo(
    () => clients?.find((c) => c.id === selectedClient) ?? null,
    [clients, selectedClient]
  );

  const clientCountByCompany = useMemo(() => {
    const map: Record<string, number> = {};
    clients?.forEach((c) => {
      map[c.company_id] = (map[c.company_id] ?? 0) + 1;
    });
    return map;
  }, [clients]);

  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    const q = companyQuery.trim().toLowerCase();
    const list = q
      ? companies.filter((c) => c.name.toLowerCase().includes(q))
      : companies;
    return [...list].sort((a, b) => a.name.localeCompare(b.name, "de"));
  }, [companies, companyQuery]);

  const filteredClients = useMemo(() => {
    if (!clients || !selectedCompany) return [];
    const companyClients = clients.filter((c) => c.company_id === selectedCompany);
    const q = clientQuery.trim().toLowerCase();
    const list = q
      ? companyClients.filter((c) =>
          `${c.first_name} ${c.last_name}`.toLowerCase().includes(q)
        )
      : companyClients;
    return [...list].sort((a, b) =>
      `${a.last_name} ${a.first_name}`.localeCompare(
        `${b.last_name} ${b.first_name}`,
        "de"
      )
    );
  }, [clients, selectedCompany, clientQuery]);

  // ── Breadcrumb: adapts to mode ──────────────────────────────────────────────
  const crumbs =
    mode === "single_level"
      ? [
          {
            label: "Alle Kunden",
            icon: <Folder className="h-3.5 w-3.5" />,
            onClick: () => {
              setSelectedCompany(null);
              setCompanyQuery("");
            },
            active: level === "root",
          },
          ...(currentCompany
            ? [
                {
                  label: currentCompany.name,
                  active: true,
                },
              ]
            : []),
        ]
      : [
          {
            label: "Alle Unternehmen",
            icon: <Folder className="h-3.5 w-3.5" />,
            onClick: () => {
              setSelectedCompany(null);
              setSelectedClient(null);
              setClientQuery("");
            },
            active: level === "root",
          },
          ...(currentCompany
            ? [
                {
                  label: currentCompany.name,
                  onClick: () => setSelectedClient(null),
                  active: level === "clients",
                },
              ]
            : []),
          ...(currentClient
            ? [
                {
                  label: `${currentClient.first_name} ${currentClient.last_name}`,
                  active: true,
                },
              ]
            : []),
        ];

  // ── Search placeholder / value ──────────────────────────────────────────────
  const searchValue = level === "root" ? companyQuery : clientQuery;
  const searchPlaceholder =
    level === "root"
      ? mode === "single_level"
        ? "Kunden suchen …"
        : "Unternehmen suchen …"
      : "Klient suchen …";

  const handleSearchChange = (val: string) => {
    if (level === "root") setCompanyQuery(val);
    else setClientQuery(val);
  };
  const handleSearchClear = () => {
    if (level === "root") setCompanyQuery("");
    else setClientQuery("");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header: Breadcrumb + Search */}
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/50 px-3 py-3 sm:px-5 sm:py-4 sm:flex-row sm:items-center sm:justify-between">
        <NotesBreadcrumb crumbs={crumbs} />
        {level !== "notes" && (
          <div className="relative w-full sm:w-[280px] shrink-0">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-8 pr-9 h-9 bg-white"
              aria-label={searchPlaceholder}
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Suche zurücksetzen"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5">

        {/* ── Level: root → Kunden/Unternehmen-Grid ────────────────────────── */}
        {level === "root" && (
          <>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3.5">
              {mode === "single_level"
                ? "Nach Kunden · Alphabetisch →"
                : "Nach Unternehmen · Alphabetisch →"}
            </div>

            {companiesLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 bg-white p-[18px] h-[140px] animate-pulse"
                  />
                ))}
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
                {companyQuery
                  ? mode === "single_level"
                    ? "Kein Kunde gefunden"
                    : "Kein Unternehmen gefunden"
                  : mode === "single_level"
                  ? "Keine Kunden vorhanden"
                  : "Keine Unternehmen vorhanden"}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredCompanies.map((company) => {
                  if (mode === "single_level") {
                    // In single_level mode, show notes count per company (if available via stats)
                    return (
                      <NotesFolderCard
                        key={company.id}
                        variant="company"
                        title={company.name}
                        count={0}
                        countLabel="Notizen"
                        onClick={() => setSelectedCompany(company.id)}
                      />
                    );
                  }
                  // two_level: show client count
                  const count = clientCountByCompany[company.id] ?? 0;
                  return (
                    <NotesFolderCard
                      key={company.id}
                      variant="company"
                      title={company.name}
                      count={count}
                      countLabel={count === 1 ? "Klient" : "Klienten"}
                      onClick={() => setSelectedCompany(company.id)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Level: clients → Klient-Grid (two_level only) ─────────────────── */}
        {level === "clients" && currentCompany && mode === "two_level" && (
          <>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3.5">
              Klienten · {currentCompany.name}
            </div>

            {clientsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 bg-white p-[18px] h-[140px] animate-pulse"
                  />
                ))}
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-500">
                {clientQuery ? "Kein Klient gefunden" : "Keine Klienten in diesem Unternehmen"}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredClients.map((client) => {
                  const s = stats?.[client.id];
                  const count = s?.count ?? 0;
                  const recency = relativeDateLabel(s?.lastCreatedAt ?? null);
                  const isCurrent =
                    s?.lastCreatedAt != null && daysAgo(s.lastCreatedAt) < 14;
                  return (
                    <NotesFolderCard
                      key={client.id}
                      variant="client"
                      title={`${client.first_name} ${client.last_name}`}
                      subtitle={recency ?? undefined}
                      count={count}
                      countLabel={
                        count === 0 ? "Notizen" : count === 1 ? "Notiz" : "Notizen"
                      }
                      isCurrent={isCurrent}
                      onClick={() => setSelectedClient(client.id)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Level: notes (two_level) → client-scoped timeline ─────────────── */}
        {level === "notes" && mode === "two_level" && currentClient && (
          <ClientNotesTab clientId={currentClient.id} />
        )}
        {level === "notes" && mode === "two_level" && !currentClient && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-slate-500">
              Klient nicht mehr verfügbar.
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedClient(null)}
                >
                  Zurück zur Klientenliste
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Level: notes (single_level) → company-scoped timeline ─────────── */}
        {level === "notes" && mode === "single_level" && selectedCompany && (
          <CompanyNotesTab companyId={selectedCompany} />
        )}
        {level === "notes" && mode === "single_level" && !selectedCompany && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-slate-500">
              Kunde nicht mehr verfügbar.
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCompany(null)}
                >
                  Zurück zur Kundenliste
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
