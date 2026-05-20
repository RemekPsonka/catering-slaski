#!/usr/bin/env bash
# ===========================================
# Catering Śląski — Production Deploy Script
# Run on the VPS or via CI
# ===========================================
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/catering-slaski}"
BRANCH="${BRANCH:-production}"
COMPOSE_FILES="-f infra/docker-compose.yml -f infra/docker-compose.prod.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[deploy]${NC} $1"; }
err()  { echo -e "${RED}[deploy]${NC} $1" >&2; }

# ------------------------------------------
# init — first-time setup on a fresh VPS
# ------------------------------------------
cmd_init() {
  log "Initial setup for new VPS"

  # Prereq check
  command -v docker >/dev/null 2>&1 || { err "docker not installed"; exit 1; }
  command -v docker-compose >/dev/null 2>&1 || command -v "docker compose" >/dev/null 2>&1 || { err "docker compose not available"; exit 1; }
  command -v git >/dev/null 2>&1 || { err "git not installed"; exit 1; }

  # Clone repo
  if [[ ! -d "$REPO_DIR" ]]; then
    log "Cloning repo to $REPO_DIR"
    sudo mkdir -p "$REPO_DIR"
    sudo chown $USER:$USER "$REPO_DIR"
    git clone --branch "$BRANCH" https://github.com/cateringslaski/platform.git "$REPO_DIR"
  fi

  cd "$REPO_DIR"

  # .env from template
  if [[ ! -f .env ]]; then
    warn ".env not found — copying from .env.example"
    cp .env.example .env
    err "FILL IN .env BEFORE PROCEEDING. Especially:"
    err "  - DATABASE_URL passwords"
    err "  - STRIPE_API_KEY"
    err "  - All webhook secrets"
    err "Then re-run: ./infra/scripts/deploy.sh up"
    exit 1
  fi

  # Initial SSL via certbot (standalone mode for first run)
  log "Setting up SSL certificates (first run)"
  sudo docker run --rm -v "$REPO_DIR/certbot_certs:/etc/letsencrypt" \
    -v "$REPO_DIR/certbot_www:/var/www/certbot" \
    -p 80:80 -p 443:443 \
    certbot/certbot certonly --standalone \
    -d cateringslaski.pl \
    -d www.cateringslaski.pl \
    -d api.cateringslaski.pl \
    -d admin.cateringslaski.pl \
    --email admin@cateringslaski.pl \
    --agree-tos --non-interactive || warn "Certbot failed — check DNS, retry manually"

  log "Building images"
  docker compose $COMPOSE_FILES build

  log "Starting stack"
  docker compose $COMPOSE_FILES --profile full up -d

  log "Waiting for postgres to be ready"
  sleep 10

  log "Running Medusa migrations"
  docker compose $COMPOSE_FILES exec backend pnpm db:migrate || warn "Migrations may have failed — check logs"

  log "Seeding initial data"
  docker compose $COMPOSE_FILES exec backend pnpm db:seed || warn "Seed may have failed"

  log "✓ Initial deployment complete"
  log "Storefront: https://cateringslaski.pl"
  log "Admin: https://admin.cateringslaski.pl"
  log "API: https://api.cateringslaski.pl"
}

# ------------------------------------------
# up — standard deploy (pull + build + up)
# ------------------------------------------
cmd_up() {
  log "Standard deploy"
  cd "$REPO_DIR"

  log "Pulling latest from $BRANCH"
  git fetch origin "$BRANCH"
  git checkout "$BRANCH"
  git pull origin "$BRANCH"

  log "Building images"
  docker compose $COMPOSE_FILES build --pull

  log "Running migrations"
  docker compose $COMPOSE_FILES run --rm backend pnpm db:migrate

  log "Restarting services"
  docker compose $COMPOSE_FILES --profile full up -d

  log "Pruning old images"
  docker image prune -f

  log "✓ Deploy complete"
}

# ------------------------------------------
# down — stop stack
# ------------------------------------------
cmd_down() {
  log "Stopping stack"
  cd "$REPO_DIR"
  docker compose $COMPOSE_FILES down
}

# ------------------------------------------
# logs — tail logs
# ------------------------------------------
cmd_logs() {
  cd "$REPO_DIR"
  docker compose $COMPOSE_FILES logs -f "${2:-}"
}

# ------------------------------------------
# rollback — to previous commit
# ------------------------------------------
cmd_rollback() {
  log "Rolling back to previous commit"
  cd "$REPO_DIR"
  CURRENT=$(git rev-parse HEAD)
  PREV=$(git rev-parse HEAD~1)
  warn "Rolling from $CURRENT to $PREV"
  read -p "Continue? [y/N] " -n 1 -r
  echo
  [[ ! $REPLY =~ ^[Yy]$ ]] && exit 0

  git checkout "$PREV"
  cmd_up
}

# ------------------------------------------
# status
# ------------------------------------------
cmd_status() {
  cd "$REPO_DIR"
  docker compose $COMPOSE_FILES ps
  echo ""
  log "Git status"
  git log --oneline -5
}

# ------------------------------------------
# Main dispatch
# ------------------------------------------
case "${1:-help}" in
  init)     cmd_init ;;
  up)       cmd_up ;;
  down)     cmd_down ;;
  logs)     cmd_logs "$@" ;;
  rollback) cmd_rollback ;;
  status)   cmd_status ;;
  *)
    echo "Catering Śląski — deploy script"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  init       First-time setup on fresh VPS"
    echo "  up         Standard deploy (pull + build + restart)"
    echo "  down       Stop all services"
    echo "  logs [s]   Tail logs (optional service name)"
    echo "  rollback   Roll back to previous commit"
    echo "  status     Show status"
    echo ""
    echo "Env vars:"
    echo "  REPO_DIR   default: /opt/catering-slaski"
    echo "  BRANCH     default: production"
    ;;
esac
