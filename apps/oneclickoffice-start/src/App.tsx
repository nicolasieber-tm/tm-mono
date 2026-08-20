import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Start from "./pages/Start";
import ConsentBanner from "./components/ConsentBanner";
import ScrollToTop from "./components/ScrollToTop";

// Nur die Opt-in-Seite wird eager geladen — sie ist der Einstieg für den
// Ad-Traffic und muss ohne Umweg erscheinen. Alles andere kommt per
// Code-Splitting nach.
const Video = lazy(() => import("./pages/Video"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const NotFound = lazy(() => import("./pages/NotFound"));

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
  </div>
);

const App = () => (
  <BrowserRouter>
    <ScrollToTop />
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/video" element={<Video />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    <ConsentBanner />
  </BrowserRouter>
);

export default App;
