#!/bin/bash
# ============================================================================
#  Modaralist — Postgres backup script
# ============================================================================
#
#  Calistirma: VPS'de daily cron (sabah 04:00 onerilir, dusuk trafik)
#    0 4 * * * /opt/scripts/backup-postgres.sh >> /var/log/modaralist-backup.log 2>&1
#
#  Yaptiklari:
#  1. Docker postgres container'indan pg_dump alir
#  2. gzip ile sikistirir
#  3. /var/backups/modaralist/ altina yyyy-mm-dd-HHMM.sql.gz olarak kaydeder
#  4. 30 gunden eski backup'lari siler (disk dolmasin)
#  5. (Opsiyonel) S3/B2'ye upload — ENV var BACKUP_S3_BUCKET set ise
#
#  Restore: gunzip -c FILE.sql.gz | docker exec -i POSTGRES_CONTAINER \
#             psql -U USER -d DB
#
# ============================================================================

set -euo pipefail

# --- KONFIG (VPS'de duzenle) ---
DB_USER="${DB_USER:-modaralist}"
DB_NAME="${DB_NAME:-modaralist}"
DOCKER_CONTAINER="${DOCKER_CONTAINER:-modaralist-postgres}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/modaralist}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# --- HAZIRLIK ---
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y-%m-%d-%H%M)
OUTFILE="$BACKUP_DIR/$TIMESTAMP.sql.gz"

echo "[$(date)] Backup basliyor: $OUTFILE"

# --- DUMP ---
docker exec -t "$DOCKER_CONTAINER" pg_dump \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  | gzip > "$OUTFILE"

SIZE=$(du -h "$OUTFILE" | cut -f1)
echo "[$(date)] Backup tamam: $OUTFILE ($SIZE)"

# --- ESKILERI SIL ---
DELETED=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
  echo "[$(date)] $DELETED eski backup silindi (>$RETENTION_DAYS gun)"
fi

# --- (OPSIYONEL) S3/B2 UPLOAD ---
if [ -n "${BACKUP_S3_BUCKET:-}" ]; then
  if command -v aws &> /dev/null; then
    aws s3 cp "$OUTFILE" "s3://$BACKUP_S3_BUCKET/postgres/$TIMESTAMP.sql.gz" \
      --storage-class STANDARD_IA
    echo "[$(date)] S3'e upload: s3://$BACKUP_S3_BUCKET/postgres/$TIMESTAMP.sql.gz"
  else
    echo "[$(date)] UYARI: aws cli yok, S3 upload atlandi"
  fi
fi

echo "[$(date)] BITTI"
