import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * LayoutChromeContext
 * -------------------
 * Lets nested pages temporarily hide the main app chrome (DesktopSidebar,
 * MobileNavigation, main padding) so fullscreen tools like the invoice
 * template editor can use the entire viewport.
 *
 * Currently there's a single consumer (AdvancedTemplateEditor in edit mode),
 * so this is intentionally a plain boolean setter — no ref counting, no
 * stack semantics. Extend only when a second consumer actually needs it.
 */

interface LayoutChromeContextValue {
  chromeHidden: boolean;
  setChromeHidden: (hidden: boolean) => void;
}

const LayoutChromeContext = createContext<LayoutChromeContextValue | null>(null);

export const LayoutChromeProvider = ({ children }: { children: ReactNode }) => {
  const [chromeHidden, setChromeHidden] = useState(false);
  return (
    <LayoutChromeContext.Provider value={{ chromeHidden, setChromeHidden }}>
      {children}
    </LayoutChromeContext.Provider>
  );
};

export const useLayoutChrome = (): LayoutChromeContextValue => {
  const ctx = useContext(LayoutChromeContext);
  if (!ctx) {
    throw new Error("useLayoutChrome must be used within LayoutChromeProvider");
  }
  return ctx;
};

/**
 * Opt-in hook: hides the app chrome while `active` is true and restores it
 * when the component unmounts or `active` flips back to false.
 */
export const useSetLayoutChromeHidden = (active: boolean): void => {
  const { setChromeHidden } = useLayoutChrome();
  useEffect(() => {
    setChromeHidden(active);
    return () => setChromeHidden(false);
  }, [active, setChromeHidden]);
};
