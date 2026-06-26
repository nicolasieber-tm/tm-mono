import { ReactNode } from "react";
import DesktopSidebar from "./DesktopSidebar";
import MobileNavigation from "./MobileNavigation";
import { useLayoutChrome } from "@/contexts/LayoutChromeContext";
import { DemoModeBar } from "@/components/demo/DemoChrome";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * MainLayout
 * ----------
 * Keeps a single stable JSX tree across chromeHidden transitions so that
 * `{children}` never changes position. An earlier version branched the
 * return into two different trees which caused React to remount the child
 * page (AdvancedTemplateEditor), wiping its `isEditing` state and creating
 * an infinite toggle loop when trying to open the template editor.
 *
 * DesktopSidebar and MobileNavigation read `chromeHidden` themselves and
 * return null when hidden — their JSX slots stay reserved so `main` always
 * lives at the same position.
 */
const MainLayout = ({ children }: MainLayoutProps) => {
  const { chromeHidden } = useLayoutChrome();

  return (
    <div
      className={
        chromeHidden
          ? "flex h-[100dvh] w-screen overflow-hidden bg-background"
          : "flex min-h-screen bg-background"
      }
    >
      <DesktopSidebar />
      <main
        className={
          chromeHidden
            ? "flex-1 min-w-0 h-full overflow-hidden"
            : "flex-1 min-w-0 pb-24 md:pb-0"
        }
      >
        <DemoModeBar />
        {children}
      </main>
      <MobileNavigation />
    </div>
  );
};

export default MainLayout;
