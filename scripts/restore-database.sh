#!/bin/bash

###############################################################################
# Database Restore Script from GPG Encrypted Backup
#
# Purpose: Restore database from encrypted backup
# Usage:
#   docker exec platformapakiety-laravel.test-1 bash /var/www/html/scripts/restore-database.sh [backup_file]
#
# Examples:
#   # Restore from specific backup
#   ./restore-database.sh db_backup_20251016_030000.sqlite.gpg
#
#   # Restore from latest backup (no argument)
#   ./restore-database.sh
#
# Environment Variables Required:
#   BACKUP_PASSWORD - GPG decryption password (same as backup)
###############################################################################

# Configuration
PROJECT_ROOT="/var/www/html"
DB_FILE="$PROJECT_ROOT/database/database.sqlite"
BACKUP_DIR="$PROJECT_ROOT/storage/backups"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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
    error "GPG is not installed"
    exit 1
fi

# Check if backup password is set
if [ -z "$BACKUP_PASSWORD" ]; then
    error "BACKUP_PASSWORD environment variable is not set!"
    exit 1
fi

# Determine which backup to restore
if [ -n "$1" ]; then
    # User specified a backup file
    BACKUP_FILE="$BACKUP_DIR/$1"
    if [ ! -f "$BACKUP_FILE" ]; then
        error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
else
    # Find latest backup
    BACKUP_FILE=$(find "$BACKUP_DIR" -name "db_backup_*.gpg" -type f | sort -r | head -n1)
    if [ -z "$BACKUP_FILE" ]; then
        error "No backup files found in $BACKUP_DIR"
        exit 1
    fi
    log "No backup specified, using latest: $(basename "$BACKUP_FILE")"
fi

log "===== Database Restore ====="
log "Backup file: $(basename "$BACKUP_FILE")"
log "Target database: $DB_FILE"

# Ask for confirmation
warning "This will REPLACE the current database!"
read -p "Are you sure? (type 'yes' to confirm): " CONFIRMATION

if [ "$CONFIRMATION" != "yes" ]; then
    log "Restore cancelled by user"
    exit 0
fi

# Backup current database before restore
CURRENT_BACKUP="$DB_FILE.before_restore_$(date +%Y%m%d_%H%M%S)"
log "Creating backup of current database: $(basename "$CURRENT_BACKUP")"
cp "$DB_FILE" "$CURRENT_BACKUP"

# Decrypt and restore
TEMP_DECRYPTED="/tmp/restored_database.sqlite"
log "Decrypting backup..."

if gpg --decrypt \
       --batch \
       --passphrase "$BACKUP_PASSWORD" \
       --output "$TEMP_DECRYPTED" \
       "$BACKUP_FILE" 2>/dev/null; then
    log "Backup decrypted successfully"
else
    error "Failed to decrypt backup (wrong password?)"
    rm -f "$TEMP_DECRYPTED"
    exit 1
fi

# Verify decrypted file is a valid SQLite database
if file "$TEMP_DECRYPTED" | grep -q "SQLite"; then
    log "Verified: backup is a valid SQLite database"
else
    error "Decrypted file is not a valid SQLite database"
    rm -f "$TEMP_DECRYPTED"
    exit 1
fi

# Replace current database
log "Replacing database..."
mv "$TEMP_DECRYPTED" "$DB_FILE"

# Set correct permissions
chmod 644 "$DB_FILE"

log "===== Restore Complete ====="
log "Database restored from: $(basename "$BACKUP_FILE")"
log "Previous database saved to: $(basename "$CURRENT_BACKUP")"
log "=========================="

exit 0
