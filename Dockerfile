# syntax=docker/dockerfile:1

# RSSFeed — Next.js 15 + better-sqlite3.
# Node 20 is used because better-sqlite3 ships prebuilt binaries for it
# (and the build stages can compile it if a prebuilt isn't available).

# ---------------------------------------------------------------------------
# 1. Production dependencies (compiles/fetches better-sqlite3 for Linux)
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------------------------------------------------------------------------
# 2. Build the Next.js app (needs dev dependencies)
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS builder
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------------------------------------------------------------------------
# 3. Runtime image
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# SQLite database location — mount a volume here to persist posts.
ENV DATABASE=/data/news.db

# Persisted data directory, owned by the unprivileged runtime user.
RUN mkdir -p /data && chown node:node /data

COPY --from=deps    /app/node_modules   ./node_modules
COPY --from=builder /app/.next          ./.next
COPY --from=builder /app/package.json   ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

USER node
EXPOSE 3000
VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "run", "start"]
