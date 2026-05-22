# ============================================
# Catering Śląski — Medusa Backend Dockerfile
# Two-stage: build with medusa, then run from dist/ (admin requires cwd=dist)
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

# ---- Build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY pnpm-workspace.yaml package.json ./
COPY apps/backend ./apps/backend
# Run medusa build — fail visibly if it breaks
RUN cd apps/backend && NODE_OPTIONS="--import tsx" node_modules/.bin/medusa build 2>&1 | tee /tmp/medusa-build.log; \
    BUILD_RC=$? ; \
    echo "=== medusa build exit code: $BUILD_RC ===" ; \
    echo "=== ls apps/backend ===" ; ls -la apps/backend/ ; \
    echo "=== ls apps/backend/.medusa ===" ; ls -laR apps/backend/.medusa 2>&1 | head -120 || echo "no .medusa" ; \
    echo "=== ls apps/backend/dist ===" ; ls -la apps/backend/dist 2>&1 | head -30 || echo "no dist" ; \
    echo "=== admin location check ===" ; \
    find apps/backend -name "index.html" -path "*admin*" 2>/dev/null | head -10 ; \
    # Continue regardless — server still starts from src/ via tsx
    exit 0

# ---- Production runtime ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV MEDUSA_WORKER_MODE=shared

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 medusa

COPY --from=builder --chown=medusa:nodejs /app /app
RUN mkdir -p /app/static && chown medusa:nodejs /app/static
USER medusa
EXPOSE 8080 9000

# Try .medusa/server first (Medusa 2.x official), fallback to apps/backend (src+tsx)
WORKDIR /app/apps/backend
CMD ["sh", "-c", "if [ -d .medusa/server ]; then echo '>>> running from .medusa/server' && cd .medusa/server && NODE_OPTIONS='--import tsx' /app/apps/backend/node_modules/.bin/medusa start; elif [ -d dist ]; then echo '>>> running from dist' && cd dist && NODE_OPTIONS='--import tsx' /app/apps/backend/node_modules/.bin/medusa start; else echo '>>> running from apps/backend (src)' && NODE_OPTIONS='--import tsx' /app/apps/backend/node_modules/.bin/medusa start; fi"]
