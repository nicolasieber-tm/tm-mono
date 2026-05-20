import type { ReactNode } from "react";

export type Mode = "softdark";

export const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <>{children}</>
);

export const useDepth = () => "off" as const;

export function useSectionMode(_section: string): Mode {
  return "softdark";
}

export function modeToClass(_mode: Mode): string {
  return "cosmic-softdark";
}
