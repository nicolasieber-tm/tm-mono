# Build context: monorepo root (set in Railway: Root Directory = /)
# Railway service config: Dockerfile Path = apps/auron/Dockerfile
FROM oven/bun:1 AS build
WORKDIR /app

# Copy workspace manifests first for better caching
COPY package.json bun.lock bunfig.toml ./
COPY apps/auron/package.json ./apps/auron/
COPY apps/tm/package.json ./apps/tm/
COPY apps/sichtbarkeit/package.json ./apps/sichtbarkeit/
COPY apps/oneclickoffice/package.json ./apps/oneclickoffice/
COPY apps/oneclickoffice-demo/package.json ./apps/oneclickoffice-demo/
COPY packages/tokens/package.json ./packages/tokens/
COPY packages/motion/package.json ./packages/motion/

RUN bun install --frozen-lockfile

# Copy source and build
COPY . .
RUN bun run build:auron

# Runtime stage: serve static dist
FROM oven/bun:1-slim
WORKDIR /app
COPY --from=build /app/apps/auron/dist ./dist
EXPOSE 8080
ENV PORT=8080
CMD ["sh", "-c", "bunx --bun serve dist -l tcp://0.0.0.0:$PORT --single"]
