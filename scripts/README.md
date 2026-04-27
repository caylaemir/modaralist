# scripts/

VPS uzerinde calistirilacak operations script'leri.

## backup-postgres.sh

Daily Postgres backup. VPS'e kurulum:

```bash
# 1. Script'i kopyala
sudo mkdir -p /opt/scripts
sudo cp scripts/backup-postgres.sh /opt/scripts/
sudo chmod +x /opt/scripts/backup-postgres.sh

# 2. Backup dizinini olustur
sudo mkdir -p /var/backups/modaralist
sudo chown root:root /var/backups/modaralist

# 3. (Opsiyonel) S3 upload icin aws cli kur + IAM key
# echo "BACKUP_S3_BUCKET=modaralist-backups" >> /etc/environment

# 4. Cron'a ekle (her gun 04:00'te)
sudo crontab -e
# Sunu ekle:
# 0 4 * * * /opt/scripts/backup-postgres.sh >> /var/log/modaralist-backup.log 2>&1

# 5. Test et
sudo /opt/scripts/backup-postgres.sh
ls -la /var/backups/modaralist/
```

### Konfigurasyon (varsayilanlari override et)

```bash
sudo nano /etc/environment
# Ekle:
DB_USER=modaralist
DB_NAME=modaralist
DOCKER_CONTAINER=modaralist-postgres
BACKUP_DIR=/var/backups/modaralist
RETENTION_DAYS=30
BACKUP_S3_BUCKET=modaralist-backups  # opsiyonel
```

### Restore

```bash
gunzip -c /var/backups/modaralist/2026-04-27-0400.sql.gz \
  | docker exec -i modaralist-postgres psql -U modaralist -d modaralist
```

## Cron — diger script'ler

Email + abandoned cart cron'lari (Batch C'den):

```bash
# Daily review request emails (sabah 10:00)
0 10 * * * curl -fsSL -H "Authorization: Bearer $CRON_SECRET" \
  https://modaralist.shop/api/cron/review-requests \
  >> /var/log/modaralist-review-cron.log 2>&1

# Hourly abandoned cart emails
0 * * * * curl -fsSL -H "Authorization: Bearer $CRON_SECRET" \
  https://modaralist.shop/api/cron/abandoned-cart \
  >> /var/log/modaralist-cart-cron.log 2>&1
```

`CRON_SECRET`'i `/etc/environment`'a koymadiysan, `~/.bashrc` veya direkt
crontab icine inline yazabilirsin (cron PATH minimaldir, environment
variable yuklenmez varsayilan).
