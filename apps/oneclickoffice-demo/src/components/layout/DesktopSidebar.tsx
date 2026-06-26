import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  Clock,
  Receipt,
  FileText,
  UserCog,
  LogOut,
  FileStack,
  Settings,
  FolderOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLayoutChrome } from "@/contexts/LayoutChromeContext";
import { useIsSingleLevel } from "@/hooks/useClientHierarchyMode";
import { isDemoMode } from "@/hooks/useDemoMode";

const DesktopSidebar = () => {
  const { signOut, user } = useAuth();
  const { chromeHidden } = useLayoutChrome();
  const isSingle = useIsSingleLevel();

  // Fetch employee profile
  const { data: employeeProfile } = useQuery({
    queryKey: ["employee-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });
  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/unternehmen", icon: Building2, label: isSingle ? "Kunden" : "Unternehmen" },
    ...(isSingle
      ? []
      : [{ to: "/klienten", icon: Users, label: "Klienten" }]),
    { to: "/klienten-akte", icon: FolderOpen, label: isSingle ? "Kunden-Akte" : "Klienten-Akte" },
    { to: "/zeiterfassung", icon: Clock, label: "Zeiterfassung" },
    { to: "/spesen", icon: Receipt, label: "Spesen" },
    { to: "/rechnungen", icon: FileText, label: "Rechnungen" },
    { to: "/mitarbeitende", icon: UserCog, label: "Mitarbeitende" },
    { to: "/einstellungen", icon: Settings, label: "Einstellungen" },
    { to: "/rechnungsvorlagen", icon: FileStack, label: "Rechnungsvorlagen" },
  ];

  // Hide the sidebar when a fullscreen page (e.g. template editor) is active.
  // We early-return rather than branching in MainLayout so that the layout's
  // JSX tree — and therefore the `{children}` slot — stays positionally stable
  // across the transition. See MainLayout for the rationale.
  if (chromeHidden) return null;

  return (
    <aside className="hidden md:flex flex-col w-[280px] bg-sidebar-background border-r border-sidebar-border h-screen sticky top-0">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img
            src="/oneclick-office-icon.png"
            alt="OneClick Office"
            className="h-10 w-10 rounded-xl object-cover"
          />
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">OneClick Office</h1>
            <p className="text-xs text-sidebar-foreground/60">Hallo {employeeProfile?.first_name || 'Benutzer'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 space-y-3">
        <Separator className="bg-sidebar-border" />
        <button
          onClick={isDemoMode ? () => window.location.reload() : signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-all duration-200 w-full group"
        >
          <LogOut className="h-5 w-5 text-sidebar-foreground/60 group-hover:text-sidebar-foreground" />
          <span className="font-medium text-sm">{isDemoMode ? "Demo neu starten" : "Abmelden"}</span>
        </button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
