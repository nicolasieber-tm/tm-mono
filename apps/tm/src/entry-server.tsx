import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HeadContext, type Head } from "@/lib/head";
import { AppRoutes, PRERENDER_PATHS } from "./routes";

/* Einstieg fürs Vorrendern beim Build (scripts/prerender.mjs).
   Erzeugt pro Seite das HTML, das Suchmaschinen und Link-Vorschauen ohne
   JavaScript sehen. Im Browser übernimmt danach main.tsx wie bisher. */

export { PRERENDER_PATHS };

export function render(url: string): { html: string; head: Head } {
  const head: Head = {};
  const html = renderToString(
    <HeadContext.Provider value={head}>
      <QueryClientProvider client={new QueryClient()}>
        <TooltipProvider>
          <StaticRouter location={url}>
            <AppRoutes />
          </StaticRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HeadContext.Provider>
  );
  return { html, head };
}
