import type { Config } from "tailwindcss";
import preset from "@tm/tokens";

export default {
  presets: [preset as Config],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
} satisfies Config;
