# ============================================
# Catering Śląski — Medusa Backend Dockerfile
# Simplified — copy whole apps/backend, run via tsx (works regardless
# of whether medusa build produced .medusa/ or dist/)
# ============================================
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/storefront/package.json apps/storefront/
RUN pnpm install --no-frozen-lockfile --prod=false

# ---- Build (best-effort: produces .medusa or dist depending on Medusa internals) ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY pnpm-workspace.yaml package.json ./
COPY apps/backend ./apps/backend
RUN pnpm --filter @cs/backend build

# ---- Production runtime ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV MEDUSA_WORKER_MODE=shared
ENV DISABLE_MEDUSA_ADMIN=false

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 medusa

# Copy everything from builder — source, deps, optional build artifacts
COPY --from=builder --chown=medusa:nodejs /app /app

RUN mkdir -p /app/static && chown medusa:nodejs /app/static
USER medusa
EXPOSE 9000

WORKDIR /app/apps/backend
CMD ["sh", "-c", "pnpm db:migrate 2>&1 | tail -10 || true; pnpm start"]
