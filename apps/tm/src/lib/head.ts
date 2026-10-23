import { createContext, useContext, useEffect } from "react";

/* Seitentitel und Meta-Description.
   Im Browser setzt usePageMeta sie nach dem Rendern ins <head>.
   Beim Vorrendern (entry-server.tsx) gibt es keinen document; dort sammelt
   ein HeadContext die Werte, damit sie direkt ins statische HTML kommen. */

export type Head = { title?: string; description?: string };
export const HeadContext = createContext<Head | null>(null);

export function usePageMeta(title: string, description?: string) {
  const ssr = useContext(HeadContext);
  if (ssr) {
    ssr.title = title;
    if (description) ssr.description = description;
  }
  useEffect(() => {
    document.title = title;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    }
  }, [title, description]);
}
