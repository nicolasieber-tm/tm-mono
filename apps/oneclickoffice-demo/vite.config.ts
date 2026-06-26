import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { createRequire } from "module";

// pdfjs-Worker robust auflösen — auch wenn node_modules im Monorepo gehoistet sind.
const nodeRequire = createRequire(import.meta.url);
const pdfjsDir = path.dirname(nodeRequire.resolve("pdfjs-dist/package.json"));
const pdfWorkerSrc = path.join(pdfjsDir, "build/pdf.worker.min.mjs");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    viteStaticCopy({
      targets: [
        {
          src: pdfWorkerSrc,
          dest: 'assets'
        }
      ]
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
    },
  },
  define: {
    global: "globalThis",
    // Dedizierte Demo-App: Demo-Modus ist immer aktiv (In-Memory-Mock, kein echtes Backend).
    "import.meta.env.VITE_DEMO_MODE": JSON.stringify("true"),
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
}));
