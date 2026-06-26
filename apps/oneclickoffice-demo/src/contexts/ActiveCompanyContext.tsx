import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Database } from "@/integrations/supabase/types";
import { useUnternehmen } from "@/hooks/useUnternehmen";

type IssuerCompany = Database["public"]["Tables"]["unternehmen"]["Row"];

type ActiveCompanyContextType = {
  companies: IssuerCompany[];
  activeCompanyId: string | null;
  activeCompany?: IssuerCompany;
  setActiveCompanyId: (id: string | null) => void;
  isLoading: boolean;
};

const ActiveCompanyContext = createContext<ActiveCompanyContextType | undefined>(undefined);

const STORAGE_KEY = "oneclick-office-active-company-id";

export const ActiveCompanyProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  const { data: companies = [], isLoading } = useUnternehmen();

  useEffect(() => {
    if (companies.length === 0) return;

    if (activeCompanyId && companies.some((c) => c.id === activeCompanyId)) {
      return;
    }

    const nextId = companies[0]?.id ?? null;
    setActiveCompanyId(nextId);
    if (typeof window !== "undefined" && nextId) {
      localStorage.setItem(STORAGE_KEY, nextId);
    }
  }, [companies, activeCompanyId]);

  const handleSetActiveCompany = (id: string | null) => {
    setActiveCompanyId(id);
    if (typeof window !== "undefined") {
      if (id) {
        localStorage.setItem(STORAGE_KEY, id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const activeCompany = useMemo(
    () => companies.find((c) => c.id === activeCompanyId),
    [companies, activeCompanyId]
  );

  return (
    <ActiveCompanyContext.Provider
      value={{
        companies,
        activeCompanyId,
        activeCompany,
        setActiveCompanyId: handleSetActiveCompany,
        isLoading,
      }}
    >
      {children}
    </ActiveCompanyContext.Provider>
  );
};

export const useActiveCompany = () => {
  const context = useContext(ActiveCompanyContext);
  if (!context) {
    throw new Error("useActiveCompany must be used within an ActiveCompanyProvider");
  }
  return context;
};
