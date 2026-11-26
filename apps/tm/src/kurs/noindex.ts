import { useEffect } from "react";

/** Private Kursseiten nicht indexieren (zusätzlich zu robots.txt) */
export function useNoindex() {
  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => m.remove();
  }, []);
}
