import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Ads-Landingpage (start.oneclick-office.ch). Bewusst minimal gehalten: keine
// Demo-App, keine schweren Libs — jede Kilobyte kostet hier Conversion, weil
// der Traffic aus Meta-Ads kommt und mobil ist.
export default defineConfig({
  server: {
    host: "::",
    port: 8081,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
