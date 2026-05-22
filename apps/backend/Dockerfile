# ============================================
# Catering Śląski — Medusa Backend Dockerfile
# Production runtime serves from .medusa/server (per Medusa 2.x docs)
# but uses our source package.json which has start + predeploy scripts.
# https://docs.medusajs.com/learn/deployment/general
# ============================================
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# ---- Dependencies (monorepo-aware) ----
FROM base AS deps
WORKDIR /workspace
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/backend/package.json apps/backend/
COPY apps/storefront/package.json apps/storefront/
RUN pnpm install --no-frozen-lockfile --prod=false

# ---- Build → apps/backend/.medusa/server ----
FROM base AS builder
WORKDIR /workspace
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/apps/backend/node_modules ./apps/backend/node_modules
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
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

# Copy the built .medusa/server output
COPY --from=builder --chown=medusa:nodejs /workspace/apps/backend/.medusa/server ./
# Override generated package.json with source (preserves predeploy + start scripts + all deps)
COPY --from=builder --chown=medusa:nodejs /workspace/apps/backend/package.json ./package.json
COPY --from=builder --chown=medusa:nodejs /workspace/pnpm-workspace.yaml ./pnpm-workspace.yaml
# Copy source as fallback (Medusa scanner uses cwd/src for API routes)
COPY --from=builder --chown=medusa:nodejs /workspace/apps/backend/src ./src
COPY --from=builder --chown=medusa:nodejs /workspace/apps/backend/medusa-config.ts ./medusa-config.ts

# Install production deps in this dir
USER root
RUN pnpm install --prod --no-frozen-lockfile --ignore-workspace && chown -R medusa:nodejs /app
USER medusa

RUN mkdir -p /app/static 2>/dev/null || true

EXPOSE 9000

# Per Medusa docs: predeploy (db:migrate + sync links) then start
CMD ["sh", "-c", "pnpm run predeploy && pnpm run start"]
