import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Der Hero ist beim Build vorgerendert (scripts/prerender-hero.ts) und liegt in
// #hero-static AUSSERHALB der React-App — React malt ihn also nach dem JS-Laden
// NICHT neu (entscheidend für LCP: das grösste Element bleibt beim frühen
// statischen Paint). Nur wenn #hero-static leer ist (Dev-Server ohne Prerender
// oder Prerender fehlgeschlagen) rendern wir den Hero hier via React nach — per
// Dynamic-Import, damit der Hero-Code im Normalfall NICHT im Entry-Bundle landet.
const heroEl = document.getElementById("hero-static");
if (heroEl && heroEl.childElementCount === 0) {
  import("./components/landing/Hero.tsx").then(({ default: Hero }) => {
    createRoot(heroEl).render(<Hero />);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
