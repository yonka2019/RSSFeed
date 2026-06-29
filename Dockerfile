# syntax=docker/dockerfile:1

# RSSFeed — Next.js 15 + MongoDB.
# The mongodb driver is pure JavaScript, so no native build toolchain is needed.

# ---------------------------------------------------------------------------
# 1. Production dependencies
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------------------------------------------------------------------------
# 2. Build the Next.js app (needs dev dependencies)
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS builder
WORKDIR /app
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
# MongoDB connection is supplied at runtime, e.g.:
#   docker run -e MONGODB_URI=mongodb://host:27017 -e MONGODB_DB=rssfeed ...

COPY --from=deps    /app/node_modules   ./node_modules
COPY --from=builder /app/.next          ./.next
COPY --from=builder /app/package.json   ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "run", "start"]
