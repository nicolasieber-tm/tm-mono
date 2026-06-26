import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Search, X, Folder } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useKunden } from "@/hooks/useKunden";
import { NotesFolderCard } from "./NotesFolderCard";
import { NotesBreadcrumb } from "./NotesBreadcrumb";
import type { ClientHierarchyMode } from "@/hooks/useClientHierarchyMode";

interface Props {
  mode: ClientHierarchyMode;
}

/**
 * Karten-Explorer als direkter Zugang zur Klient-/Kunden-Detailansicht.
 * - two_level: Unternehmen → Klienten; Klick auf einen Klienten öffnet `/klienten/:id`.
 * - single_level: Kunden; Klick auf einen Kunden öffnet `/unternehmen/:id`.
 * (Die Detailansicht enthält die Tabs Übersicht, Sitzungsnotizen und Finanzen.)
 */
export const ClientAkteExplorer = ({ mode }: Props) => {
  const navigate = useNavigate();
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: companies, isLoading: companiesLoading } = useKunden();

  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyQuery, setCompanyQuery] = useState("");
  const [clientQuery, setClientQuery] = useState("");

  // single_level: nur Kunden-Ebene. two_level: Unternehmen → Klienten.
  const level: "root" | "clients" =
    mode === "two_level" && selectedCompany ? "clients" : "root";

  const currentCompany = useMemo(
    () => companies?.find((c) => c.id === selectedCompany) ?? null,
    [companies, selectedCompany]
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

  // ── Breadcrumb ──────────────────────────────────────────────────────────────
  const crumbs =
    mode === "single_level"
      ? [
          {
            label: "Alle Kunden",
            icon: <Folder className="h-3.5 w-3.5" />,
            active: true,
          },
        ]
      : [
          {
            label: "Alle Unternehmen",
            icon: <Folder className="h-3.5 w-3.5" />,
            onClick: () => {
              setSelectedCompany(null);
              setClientQuery("");
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
        ];

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
      {/* Header: Breadcrumb + Suche */}
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/50 px-3 py-3 sm:px-5 sm:py-4 sm:flex-row sm:items-center sm:justify-between">
        <NotesBreadcrumb crumbs={crumbs} />
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
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5">
        {/* ── Level: root ──────────────────────────────────────────────────── */}
        {level === "root" && (
          <>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3.5">
              {mode === "single_level"
                ? "Kunde wählen · Alphabetisch →"
                : "Unternehmen wählen · Alphabetisch →"}
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
                    // Kunde-Karte → direkt zur Kunde-Detailansicht
                    return (
                      <NotesFolderCard
                        key={company.id}
                        variant="company"
                        title={company.name}
                        onClick={() => navigate(`/unternehmen/${company.id}`)}
                      />
                    );
                  }
                  // two_level: Unternehmen → Klienten-Ebene
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

        {/* ── Level: clients (two_level) ───────────────────────────────────── */}
        {level === "clients" && currentCompany && mode === "two_level" && (
          <>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3.5">
              Klient wählen · {currentCompany.name}
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
                {filteredClients.map((client) => (
                  <NotesFolderCard
                    key={client.id}
                    variant="client"
                    title={`${client.first_name} ${client.last_name}`}
                    subtitle="Akte öffnen"
                    onClick={() => navigate(`/klienten/${client.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
