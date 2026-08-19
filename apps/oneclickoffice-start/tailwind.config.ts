import type { Config } from "tailwindcss";

// Schlanke Variante der Demo-Config: nur die Tokens, die eine Marketing-Seite
// wirklich braucht (die App-/Sidebar-/Chart-Tokens der Demo entfallen hier).
// Die Farbwerte sind bewusst identisch zur bestehenden Landing, damit beide
// Seiten optisch als dieselbe Marke gelesen werden.
export default {
  content: ["./src/**/*.{ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: "hsl(var(--destructive))",
        success: "hsl(var(--success))",
        "bg-elevated": "hsl(var(--bg-elevated))",
        "bg-surface": "hsl(var(--bg-surface))",
        "text-primary": "hsl(var(--text-primary))",
        "text-secondary": "hsl(var(--text-secondary))",
        "text-muted": "hsl(var(--text-muted))",
        "accent-deep": "hsl(var(--accent-deep))",
        "accent-soft": "hsl(var(--accent-soft))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "70%": { transform: "scale(1.35)", opacity: "0" },
          "100%": { transform: "scale(1.35)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
