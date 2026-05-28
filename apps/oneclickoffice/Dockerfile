# Build context: monorepo root (set in Railway: Root Directory = /)
# Railway service config: Dockerfile Path = apps/oneclickoffice/Dockerfile
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock bunfig.toml ./
COPY apps/auron/package.json ./apps/auron/
COPY apps/tm/package.json ./apps/tm/
COPY apps/sichtbarkeit/package.json ./apps/sichtbarkeit/
COPY apps/oneclickoffice/package.json ./apps/oneclickoffice/
COPY packages/tokens/package.json ./packages/tokens/
COPY packages/motion/package.json ./packages/motion/

RUN bun install --frozen-lockfile

COPY . .
RUN bun run build:oneclickoffice

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=build /app/apps/oneclickoffice/dist ./dist
EXPOSE 8080
ENV PORT=8080
CMD ["sh", "-c", "bunx --bun serve dist -l tcp://0.0.0.0:$PORT --single"]
