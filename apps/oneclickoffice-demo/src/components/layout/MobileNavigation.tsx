import { NavLink } from "react-router-dom";
import { Clock, Receipt, NotebookPen, User } from "lucide-react";
import { useLayoutChrome } from "@/contexts/LayoutChromeContext";

const MobileNavigation = () => {
  const { chromeHidden } = useLayoutChrome();

  const navItems = [
    { to: "/mobile/zeit", icon: Clock, label: "Zeit" },
    { to: "/mobile/spesen", icon: Receipt, label: "Spesen" },
    { to: "/mobile/notizen", icon: NotebookPen, label: "Notizen" },
    { to: "/mobile/profil", icon: User, label: "Profil" },
  ];

  // Hide when a fullscreen page is active so the editor can use the full
  // viewport. Early return (rather than MainLayout branching) keeps the
  // tree structure stable — see MainLayout for the rationale.
  if (chromeHidden) return null;

  return (
    <nav data-tour="mobile-nav" className="md:hidden fixed bottom-0 left-0 right-0 bg-mobile-nav-background border-t-2 border-border z-50 backdrop-blur-xl bg-opacity-95 shadow-lg">
      <div className="flex justify-around items-center h-24 px-1 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 min-h-[68px] transition-all duration-200 rounded-2xl px-2 py-3 ${
                isActive
                  ? "text-mobile-nav-active bg-primary/10"
                  : "text-mobile-nav-foreground/70 hover:text-mobile-nav-active hover:bg-muted/50 active:scale-95"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-8 w-8 mb-1.5 transition-all ${isActive ? "scale-110" : ""}`} />
                <span className="text-xs font-semibold">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;
