/**
 * Build-Schritt: Hero statisch vorrendern (läuft nach `vite build`, via bun).
 *
 * Warum: Die App ist eine Client-SPA mit leerem <div id="root">. Ohne diesen
 * Schritt erscheinen Headline, Subheadline und CTA erst, wenn das JS-Bundle
 * geladen UND ausgeführt ist — für Ad-Traffic (v. a. langsames Mobile) ein
 * Conversion-Killer. Hier rendern wir die echte Hero-Komponente
 * (renderToStaticMarkup) zu HTML und setzen es in dist/index.html ins #root.
 *
 * Ergebnis:
 *   • Hero steht sofort im HTML, sichtbar OHNE JavaScript (CSS-Breakpoint wählt
 *     Mobile/Desktop, CSS-Animation blendet ein — siehe Hero.tsx / index.css).
 *   • Beim Mount ersetzt React (createRoot) das identische Markup — kein Flash,
 *     keine Hydration-Fallstricke.
 *   • Single Source of Truth: derselbe Hero-Code fürs statische HTML und die App.
 *
 * Fehlertoleranz: Schlägt der Schritt fehl, bleibt index.html unverändert
 * (leeres #root = bisheriges Verhalten) und der Build läuft weiter (exit 0) —
 * ein Randfall darf niemals das Deploy dieses Services blockieren.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import Hero from "../src/components/landing/Hero";

const here = dirname(fileURLToPath(import.meta.url));
const indexPath = resolve(here, "../dist/index.html");
const ROOT_TAG = '<div id="root"></div>';

// Guard: serve läuft mit `--single`, liefert also für JEDE Route (auch die
// eingebettete Demo /dashboard, /mobile/zeit) dasselbe index.html. Damit der
// vorgerenderte Hero NICHT in der Demo-iframe oder auf Unterseiten aufblitzt,
// entfernen wir ihn dort vor dem ersten Paint wieder.
const GUARD_SCRIPT =
  '<script>(function(){try{if(window.self!==window.top||location.pathname!=="/"){var r=document.getElementById("root");if(r)r.innerHTML="";}}catch(e){}})();</script>';

try {
  if (!existsSync(indexPath)) {
    console.warn("[prerender-hero] dist/index.html nicht gefunden – übersprungen.");
    process.exit(0);
  }

  let html = readFileSync(indexPath, "utf8");
  if (!html.includes(ROOT_TAG)) {
    console.warn(`[prerender-hero] "${ROOT_TAG}" nicht gefunden – übersprungen.`);
    process.exit(0);
  }

  const heroHtml = renderToStaticMarkup(createElement(Hero));
  html = html.replace(ROOT_TAG, `<div id="root">${heroHtml}</div>${GUARD_SCRIPT}`);
  writeFileSync(indexPath, html);
  console.log(
    `[prerender-hero] Hero in dist/index.html eingesetzt (${heroHtml.length} Zeichen HTML).`,
  );
} catch (err) {
  console.warn("[prerender-hero] fehlgeschlagen – index.html unverändert:", err);
  process.exit(0);
}
