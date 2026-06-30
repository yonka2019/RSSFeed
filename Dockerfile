# syntax=docker/dockerfile:1

# RSSFeed — Next.js 15 + MongoDB.
# Uses Next.js standalone output: the runtime image carries only a minimal
# traced server plus the node_modules it actually needs — not the full install
# (which would drag in ~140MB of build-only SWC binaries and the whole `next`
# package). The mongodb driver is pure JavaScript, so no native toolchain.

# ---------------------------------------------------------------------------
# 1. Build the Next.js app (needs dev dependencies)
# ---------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------------------------------------------------------------------------
# 2. Runtime image — just the standalone server + static assets
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# MongoDB connection is supplied at runtime, e.g.:
#   docker run -e MONGODB_URI=mongodb://host:27017 -e MONGODB_DB=rssfeed ...

# Standalone bundles the server (server.js) + traced node_modules; the static
# chunks/fonts under .next/static are not traced, so copy them separately.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
