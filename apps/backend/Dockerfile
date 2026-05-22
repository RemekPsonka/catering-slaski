# ============================================
# Catering Śląski — Medusa Backend Dockerfile
# Per Medusa 2.x docs: medusa build → .medusa/server
# Production runs from .medusa/server, with pnpm install in that dir.
# https://docs.medusajs.com/learn/deployment/general
# ============================================
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# ---- Dependencies for build (monorepo-aware) ----
FROM base AS deps
WORKDIR /workspace
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/
COPY apps/storefront/package.json apps/storefront/
COPY packages ./packages
RUN pnpm install --no-frozen-lockfile --prod=false

# ---- Build: produkuje apps/backend/.medusa/server ----
FROM base AS builder
WORKDIR /workspace
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/apps/backend/node_modules ./apps/backend/node_modules
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend ./apps/backend
COPY packages ./packages
RUN pnpm --filter @cs/backend build

# ---- Production runtime ----
# Per docs: cd .medusa/server && pnpm install && pnpm predeploy && pnpm start
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV MEDUSA_WORKER_MODE=shared
ENV DISABLE_MEDUSA_ADMIN=false

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 medusa

# Copy ONLY the built .medusa/server output. This is what production needs.
COPY --from=builder --chown=medusa:nodejs /workspace/apps/backend/.medusa/server ./
# Install production deps in this directory (per Medusa docs).
USER root
RUN pnpm install --prod --no-frozen-lockfile && chown -R medusa:nodejs /app
USER medusa

RUN mkdir -p /app/static 2>/dev/null || true

EXPOSE 9000

# Per Medusa docs: predeploy (migrations + link sync) then start
CMD ["sh", "-c", "pnpm run predeploy && pnpm run start"]
