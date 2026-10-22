import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SmoothScroll, HashScrollHandler } from "@tm/motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import Index from "./pages/Index.tsx";
import Imprint from "./pages/Imprint.tsx";
import NotFound from "./pages/NotFound.tsx";
import Privacy from "./pages/Privacy.tsx";
import Selbstcheck from "./pages/Selbstcheck.tsx";
import Landingpages from "./landingpages/Landingpages.tsx";
import Automationen from "./pages/Automationen.tsx";
import Kundenstimmen from "./pages/Kundenstimmen.tsx";
import Kundenstimme from "./pages/Kundenstimme.tsx";
import OneClickOffice from "./pages/OneClickOffice.tsx";
import Auron from "./pages/Auron.tsx";
import UeberUns from "./pages/UeberUns.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SmoothScroll>
          <BrowserRouter>
            <HashScrollHandler />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/automationen" element={<Automationen />} />
              <Route path="/landingpages" element={<Landingpages />} />
              <Route path="/kundenstimmen" element={<Kundenstimmen />} />
              <Route path="/kundenstimmen/:slug" element={<Kundenstimme />} />
              <Route path="/oneclick-office" element={<OneClickOffice />} />
              <Route path="/auron" element={<Auron />} />
              <Route path="/ueber-uns" element={<UeberUns />} />
              <Route path="/impressum" element={<Imprint />} />
              <Route path="/datenschutz" element={<Privacy />} />
              <Route path="/selbstcheck" element={<Selbstcheck />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SmoothScroll>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
