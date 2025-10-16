#!/bin/bash

###############################################################################
# Database Backup Script with GPG Encryption
#
# Purpose: Create encrypted backups of the SQLite database
# Schedule: Run daily via cron (recommended: 3:00 AM)
# Storage: /var/www/html/storage/backups/
#
# Usage:
#   docker exec platformapakiety-laravel.test-1 bash /var/www/html/scripts/backup-database.sh
#
# Environment Variables Required:
#   BACKUP_PASSWORD - GPG encryption password (set in .env or docker-compose)
###############################################################################

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="/var/www/html"
DB_FILE="$PROJECT_ROOT/database/database.sqlite"
BACKUP_DIR="$PROJECT_ROOT/storage/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sqlite"
ENCRYPTED_FILE="$BACKUP_FILE.gpg"
RETENTION_DAYS=30

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if GPG is installed
if ! command -v gpg &> /dev/null; then
    error "GPG is not installed. Install with: apt-get install gnupg"
    exit 1
fi

# Check if backup password is set
if [ -z "$BACKUP_PASSWORD" ]; then
    error "BACKUP_PASSWORD environment variable is not set!"
    error "Set it in docker-compose.yml environment section"
    exit 1
fi

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Check if database file exists
if [ ! -f "$DB_FILE" ]; then
    error "Database file not found: $DB_FILE"
    exit 1
fi

log "Starting database backup..."
log "Database: $DB_FILE"
log "Backup destination: $ENCRYPTED_FILE"

# Step 1: Copy database file
log "Copying database..."
if cp "$DB_FILE" "$BACKUP_FILE"; then
    log "Database copied successfully"
else
    error "Failed to copy database"
    exit 1
fi

# Step 2: Encrypt with GPG (AES-256 symmetric encryption)
log "Encrypting backup with GPG (AES-256)..."
if gpg --symmetric \
       --cipher-algo AES256 \
       --batch \
       --passphrase "$BACKUP_PASSWORD" \
       --output "$ENCRYPTED_FILE" \
       "$BACKUP_FILE"; then
    log "Backup encrypted successfully"
else
    error "Failed to encrypt backup"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Step 3: Remove unencrypted copy
log "Removing unencrypted backup..."
rm -f "$BACKUP_FILE"

# Step 4: Verify encrypted file
if [ -f "$ENCRYPTED_FILE" ]; then
    ENCRYPTED_SIZE=$(du -h "$ENCRYPTED_FILE" | cut -f1)
    log "Encrypted backup created: $ENCRYPTED_SIZE"
else
    error "Encrypted file not found after creation"
    exit 1
fi

# Step 5: Cleanup old backups (older than RETENTION_DAYS)
log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
OLD_BACKUPS=$(find "$BACKUP_DIR" -name "db_backup_*.gpg" -type f -mtime +$RETENTION_DAYS)

if [ -n "$OLD_BACKUPS" ]; then
    echo "$OLD_BACKUPS" | while read -r OLD_BACKUP; do
        log "Deleting old backup: $(basename "$OLD_BACKUP")"
        rm -f "$OLD_BACKUP"
    done
else
    log "No old backups to delete"
fi

# Step 6: Summary
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "db_backup_*.gpg" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

log "===== Backup Summary ====="
log "Encrypted file: $(basename "$ENCRYPTED_FILE")"
log "File size: $ENCRYPTED_SIZE"
log "Total backups: $TOTAL_BACKUPS"
log "Total backup size: $TOTAL_SIZE"
log "Retention period: $RETENTION_DAYS days"
log "========================="
log "Backup completed successfully!"

exit 0
