/* Vorrendern nach `vite build`:
   1. dist/index.html ist die Vorlage (Script- und CSS-Tags von Vite)
   2. dist-ssr/entry-server.js rendert jede Seite aus PRERENDER_PATHS
   3. Ergebnis: dist/<pfad>.html (bzw. dist/index.html) mit Inhalt, Titel,
      Description, Canonical und Open-Graph-Tags, dazu sitemap.xml

   `serve` (ohne --single!) liefert /handwerk dank cleanUrls aus
   dist/handwerk.html aus; unbekannte Pfade bekommen dist/404.html. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SITE = "https://trendingmedia.ch";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");

const { render, PRERENDER_PATHS } = await import(pathToFileURL(path.join(ssrDir, "entry-server.js")).href);
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`);
  const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
};

let count = 0;
for (const url of PRERENDER_PATHS) {
  const { html, head } = render(url);
  let page = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  const canonical = SITE + (url === "/" ? "/" : url);
  if (head.title) {
    page = page.replace(/<title>[^<]*<\/title>/, `<title>${esc(head.title)}</title>`);
    page = setMeta(page, "property", "og:title", head.title);
    page = setMeta(page, "name", "twitter:title", head.title);
  }
  if (head.description) {
    page = setMeta(page, "name", "description", head.description);
    page = setMeta(page, "property", "og:description", head.description);
    page = setMeta(page, "name", "twitter:description", head.description);
  }
  page = setMeta(page, "property", "og:url", canonical);
  page = page.replace("</head>", `    <link rel="canonical" href="${canonical}" />\n  </head>`);

  const file = url === "/" ? path.join(dist, "index.html") : path.join(dist, `${url.slice(1)}.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, page);
  count++;
}

// Alles andere (unbekannte Pfade) bekommt die leere App-Vorlage als 404.html:
// `serve` liefert sie mit Status 404 aus, React zeigt dann die NotFound-Seite.
fs.writeFileSync(path.join(dist, "404.html"), template);

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    PRERENDER_PATHS.map((u) => `  <url><loc>${SITE}${u === "/" ? "/" : u}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`
);

fs.rmSync(ssrDir, { recursive: true, force: true });
console.log(`prerender: ${count} Seiten + sitemap.xml`);
