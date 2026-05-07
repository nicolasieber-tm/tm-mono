import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SmoothScroll, HashScrollHandler } from "@tm/motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Imprint from "./pages/Imprint.tsx";
import NotFound from "./pages/NotFound.tsx";
import Privacy from "./pages/Privacy.tsx";
import Selbstcheck from "./pages/Selbstcheck.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SmoothScroll>
        <BrowserRouter>
          <HashScrollHandler />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/impressum" element={<Imprint />} />
            <Route path="/datenschutz" element={<Privacy />} />
            <Route path="/selbstcheck" element={<Selbstcheck />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SmoothScroll>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
