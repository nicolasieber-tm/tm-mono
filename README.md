# tm-mono

Trending Media Monorepo. Three landing pages sharing a single design system.

## Structure

```
apps/
  auron/        — auron.trendingmedia.ch (design reference)
  tm/           — trendingmedia.ch (parent brand)
  webseite/     — third landing page
packages/
  ui/           — shadcn/Radix components (canonical)
  tokens/       — Tailwind config, CSS variables, animations
  motion/       — Lenis smooth scroll, Reveal, framer-motion helpers
```

## Brand colors

Each app overrides `--brand` in its own `index.css`. All other tokens come from `@tm/tokens`.

| App | HSL | Notes |
|-----|-----|-------|
| auron | `221 83% 53%` / `#2362EA` | Tech blue (reference) |
| tm | `230 70% 35%` / `#1A2F97` | Indigo (parent brand) |
| sichtbarkeit | `38 90% 55%` / `#F3A724` | Amber (KMU lead landing) |

## Develop

```bash
bun install
bun run dev:auron      # or dev:tm, dev:webseite
```

## Deploy

Each app deploys as a separate Railway service. Root directory in Railway points to `apps/<name>`.
