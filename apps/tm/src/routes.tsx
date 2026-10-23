import { Route, Routes } from "react-router-dom";
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
import NischePage from "./pages/Nische.tsx";
import { NISCHEN } from "./data/nischen";
import { publishedCases } from "./data/cases";

/** Alle Routen; gemeinsam genutzt vom Browser (App.tsx) und vom Vorrendern (entry-server.tsx) */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/automationen" element={<Automationen />} />
      <Route path="/landingpages" element={<Landingpages />} />
      <Route path="/kundenstimmen" element={<Kundenstimmen />} />
      <Route path="/kundenstimmen/:slug" element={<Kundenstimme />} />
      <Route path="/oneclick-office" element={<OneClickOffice />} />
      <Route path="/auron" element={<Auron />} />
      <Route path="/ueber-uns" element={<UeberUns />} />
      {NISCHEN.map((n) => (
        <Route key={n.path} path={`/${n.path}`} element={<NischePage n={n} />} />
      ))}
      <Route path="/impressum" element={<Imprint />} />
      <Route path="/datenschutz" element={<Privacy />} />
      <Route path="/selbstcheck" element={<Selbstcheck />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/** Seiten, die beim Build als statisches HTML vorgerendert werden (SEO, Link-Vorschau) */
export const PRERENDER_PATHS = [
  "/",
  "/automationen",
  "/landingpages",
  "/kundenstimmen",
  ...publishedCases().map((c) => `/kundenstimmen/${c.slug}`),
  "/oneclick-office",
  "/auron",
  "/ueber-uns",
  ...NISCHEN.map((n) => `/${n.path}`),
  "/impressum",
  "/datenschutz",
  "/selbstcheck",
];
