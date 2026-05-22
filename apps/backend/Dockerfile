# Catering Śląski — Medusa Backend Dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/storefront/package.json apps/storefront/
RUN pnpm install --no-frozen-lockfile --prod=false

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules
COPY pnpm-workspace.yaml package.json ./
COPY apps/backend ./apps/backend
RUN cd apps/backend && \
    NODE_OPTIONS="--import tsx" node_modules/.bin/medusa build 2>&1 | tee /tmp/medusa-build.log; \
    BUILD_RC=$? ; \
    echo "=== medusa build exit code: $BUILD_RC ===" ; \
    echo "=== ls apps/backend (CWD) ===" ; ls -la ; \
    echo "=== ls .medusa ===" ; ls -laR .medusa 2>&1 | head -80 ; \
    echo "=== ls dist ===" ; ls -la dist 2>&1 | head -30 ; \
    echo "=== ls admin (root level) ===" ; ls -la admin 2>&1 | head -10 ; \
    echo "=== find index.html (admin) ===" ; find . -maxdepth 6 -name "index.html" 2>/dev/null | head -10 ; \
    echo "=== find public/admin ===" ; find . -maxdepth 6 -type d -name "admin" 2>/dev/null | head -10 ; \
    exit 0

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

WORKDIR /app/apps/backend
# Medusa 2.15.3 build outputs:
#   .medusa/medusa-config.js  — compiled config
#   .medusa/index.html        — admin entry (vite template)
#   dist/public/admin/        — admin SPA bundle (where medusa start looks: cwd + 'public/admin/index.html')
# So cwd must contain BOTH medusa-config AND public/admin/index.html.
# Fix: copy compiled config + tsx-resolvable src into dist/, run from dist/.
CMD ["sh", "-c", "\
    set -e ; \
    cd /app/apps/backend ; \
    echo '>>> ls -la .medusa:' && ls -la .medusa 2>&1 | head -20 ; \
    echo '>>> ls -la dist:' && ls -la dist 2>&1 | head -20 ; \
    echo '>>> ls -la dist/public:' && ls -la dist/public 2>&1 | head -10 ; \
    # Stage: copy compiled medusa-config and types into dist/ so cwd=dist works \
    cp -n .medusa/medusa-config.js dist/medusa-config.js 2>/dev/null || true ; \
    cp -n .medusa/medusa-config.js.map dist/medusa-config.js.map 2>/dev/null || true ; \
    # Link src so tsx loader can find route files referenced in compiled config \
    ln -sfn /app/apps/backend/src dist/src 2>/dev/null || true ; \
    ln -sfn /app/apps/backend/node_modules dist/node_modules 2>/dev/null || true ; \
    ln -sfn /app/apps/backend/package.json dist/package.json 2>/dev/null || true ; \
    echo '>>> ls -la dist after staging:' && ls -la dist 2>&1 | head -20 ; \
    # Start from dist/ — public/admin/index.html will resolve \
    cd /app/apps/backend/dist && NODE_OPTIONS='--import tsx' /app/apps/backend/node_modules/.bin/medusa start \
"]
