#!/usr/bin/env bash
# Daily database backup
# Cron: 0 3 * * * /opt/catering-slaski/infra/scripts/backup-db.sh
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/catering-slaski}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="${S3_BUCKET:-}"  # optional offsite

mkdir -p "$BACKUP_DIR"

cd /opt/catering-slaski

# Dump
docker compose -f infra/docker-compose.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" --format=custom --no-owner --no-acl \
  | gzip > "$BACKUP_DIR/catering_slaski_$TIMESTAMP.sql.gz"

echo "[backup] DB dumped to $BACKUP_DIR/catering_slaski_$TIMESTAMP.sql.gz"

# Optional: ship to S3/Wasabi
if [[ -n "$S3_BUCKET" ]]; then
  aws s3 cp "$BACKUP_DIR/catering_slaski_$TIMESTAMP.sql.gz" "s3://$S3_BUCKET/db/"
  echo "[backup] Uploaded to S3"
fi

# Retention
find "$BACKUP_DIR" -name "catering_slaski_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[backup] Cleaned backups older than $RETENTION_DAYS days"
