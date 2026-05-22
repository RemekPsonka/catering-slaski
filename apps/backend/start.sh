#!/bin/sh
# Production startup: migracje DB + start serwera.
# Idempotentne — Mikro ORM checkpointuje co już uruchomione w mikro_orm_migrations.
set -e

echo "[startup] Running pending DB migrations..."
NODE_OPTIONS="--import tsx" /app/node_modules/.bin/medusa db:migrate || {
  echo "[startup] WARNING: migrations failed — continuing anyway (existing DB may be ahead)"
}

echo "[startup] Starting Medusa server..."
exec node --import tsx /app/node_modules/.bin/medusa start
