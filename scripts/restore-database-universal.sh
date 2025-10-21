#!/bin/bash

###############################################################################
# Universal Database Restore Script (from GPG encrypted backup)
#
# Purpose: Restore database from encrypted backup (BOTH SQLite and MySQL)
# Auto-detects database type and backup format
#
# Usage:
#   # Interactive (choose from list)
#   docker exec -it platformapakiety-laravel.test-1 bash /var/www/html/scripts/restore-database-universal.sh
#
#   # Restore specific backup
#   docker exec -it platformapakiety-laravel.test-1 bash /var/www/html/scripts/restore-database-universal.sh db_backup_20251021_030000.sql.gpg
#
# Environment Variables Required:
#   BACKUP_PASSWORD - GPG decryption password (set in .env or docker-compose)
###############################################################################

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="/var/www/html"
BACKUP_DIR="$PROJECT_ROOT/storage/backups"
SQLITE_DB_FILE="$PROJECT_ROOT/database/database.sqlite"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Load environment variables from .env if not already set
if [ -f "$PROJECT_ROOT/.env" ]; then
    export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

# Check if GPG is installed
if ! command -v gpg &> /dev/null; then
    error "GPG is not installed. Install with: apt-get install gnupg"
    exit 1
fi

# Check if backup password is set
if [ -z "$BACKUP_PASSWORD" ]; then
    error "BACKUP_PASSWORD environment variable is not set!"
    error "Set it in .env or docker-compose.yml environment section"
    exit 1
fi

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    error "Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# Get database type
DB_TYPE="${DB_CONNECTION:-sqlite}"

###############################################################################
# FUNCTION: List available backups
###############################################################################
list_backups() {
    local BACKUPS=$(find "$BACKUP_DIR" -name "db_backup_*.gpg" -type f | sort -r)

    if [ -z "$BACKUPS" ]; then
        error "No backups found in $BACKUP_DIR"
        return 1
    fi

    echo ""
    info "Available backups:"
    echo "$BACKUPS" | nl -w2 -s'. '
    echo ""

    return 0
}

###############################################################################
# FUNCTION: Restore SQLite
###############################################################################
restore_sqlite() {
    local ENCRYPTED_FILE="$1"
    local TEMP_FILE="$BACKUP_DIR/temp_restore_$$.sqlite"

    log "Starting SQLite restore..."

    # Step 1: Decrypt backup
    log "Decrypting backup..."
    if gpg --decrypt \
           --batch \
           --passphrase "$BACKUP_PASSWORD" \
           --output "$TEMP_FILE" \
           "$ENCRYPTED_FILE" 2>&1; then
        log "Backup decrypted successfully"
    else
        error "Failed to decrypt backup (wrong password?)"
        rm -f "$TEMP_FILE"
        return 1
    fi

    # Step 2: Verify SQLite integrity
    log "Verifying database integrity..."
    if sqlite3 "$TEMP_FILE" "PRAGMA integrity_check;" | grep -q "ok"; then
        log "Database integrity check passed"
    else
        error "Database integrity check failed - backup may be corrupted"
        rm -f "$TEMP_FILE"
        return 1
    fi

    # Step 3: Backup current database
    if [ -f "$SQLITE_DB_FILE" ]; then
        local CURRENT_BACKUP="$SQLITE_DB_FILE.backup-$(date +%Y%m%d_%H%M%S)"
        log "Backing up current database to: $(basename "$CURRENT_BACKUP")"
        cp "$SQLITE_DB_FILE" "$CURRENT_BACKUP"
    fi

    # Step 4: Replace database
    log "Replacing database file..."
    if mv "$TEMP_FILE" "$SQLITE_DB_FILE"; then
        log "Database restored successfully"

        # Step 5: Set correct permissions
        chmod 664 "$SQLITE_DB_FILE"

        return 0
    else
        error "Failed to replace database file"
        rm -f "$TEMP_FILE"
        return 1
    fi
}

###############################################################################
# FUNCTION: Restore MySQL
###############################################################################
restore_mysql() {
    local ENCRYPTED_FILE="$1"
    local TEMP_FILE="$BACKUP_DIR/temp_restore_$$.sql"

    log "Starting MySQL restore..."

    # Check if mysql is installed
    if ! command -v mysql &> /dev/null; then
        error "mysql client is not installed. Install with: apt-get install mysql-client"
        return 1
    fi

    # Validate MySQL credentials
    if [ -z "$DB_DATABASE" ] || [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ]; then
        error "MySQL credentials not set in .env (DB_DATABASE, DB_USERNAME, DB_PASSWORD)"
        return 1
    fi

    local DB_HOST="${DB_HOST:-mysql}"

    # Step 1: Decrypt backup
    log "Decrypting backup..."
    if gpg --decrypt \
           --batch \
           --passphrase "$BACKUP_PASSWORD" \
           --output "$TEMP_FILE" \
           "$ENCRYPTED_FILE" 2>&1; then
        log "Backup decrypted successfully"
    else
        error "Failed to decrypt backup (wrong password?)"
        rm -f "$TEMP_FILE"
        return 1
    fi

    # Step 2: Verify SQL file is not empty
    if [ ! -s "$TEMP_FILE" ]; then
        error "Decrypted SQL file is empty!"
        rm -f "$TEMP_FILE"
        return 1
    fi

    local SQL_SIZE=$(du -h "$TEMP_FILE" | cut -f1)
    info "SQL dump size: $SQL_SIZE"

    # Step 3: Create backup of current database (optional but recommended)
    warning "Creating backup of current database before restore..."
    local CURRENT_BACKUP="$BACKUP_DIR/pre_restore_backup_$(date +%Y%m%d_%H%M%S).sql"

    if mysqldump \
        --host="$DB_HOST" \
        --user="$DB_USERNAME" \
        --password="$DB_PASSWORD" \
        --single-transaction \
        "$DB_DATABASE" > "$CURRENT_BACKUP" 2>&1; then
        log "Current database backed up to: $(basename "$CURRENT_BACKUP")"
    else
        warning "Failed to backup current database (continuing anyway...)"
    fi

    # Step 4: Restore database
    log "Restoring MySQL database..."
    log "⚠️  This will DROP all tables in database: $DB_DATABASE"

    if mysql \
        --host="$DB_HOST" \
        --user="$DB_USERNAME" \
        --password="$DB_PASSWORD" \
        "$DB_DATABASE" < "$TEMP_FILE" 2>&1; then
        log "Database restored successfully"
    else
        error "Failed to restore database"
        error "Your database may be in inconsistent state!"
        error "Restore from current backup: $CURRENT_BACKUP"
        rm -f "$TEMP_FILE"
        return 1
    fi

    # Step 5: Cleanup
    log "Removing temporary files..."
    rm -f "$TEMP_FILE"

    return 0
}

###############################################################################
# MAIN EXECUTION
###############################################################################

log "===== Universal Database Restore ====="
log "Database type: $DB_TYPE"

# Determine which backup to restore
if [ -z "$1" ]; then
    # Interactive mode - list backups
    if ! list_backups; then
        exit 1
    fi

    read -p "Enter backup number to restore (or 'latest' for newest): " CHOICE

    if [ "$CHOICE" = "latest" ] || [ -z "$CHOICE" ]; then
        BACKUP_FILE=$(find "$BACKUP_DIR" -name "db_backup_*.gpg" -type f | sort -r | head -1)
    else
        BACKUP_FILE=$(find "$BACKUP_DIR" -name "db_backup_*.gpg" -type f | sort -r | sed -n "${CHOICE}p")
    fi
else
    # Restore specific backup
    if [[ "$1" == /* ]]; then
        BACKUP_FILE="$1"
    else
        BACKUP_FILE="$BACKUP_DIR/$1"
    fi
fi

# Validate backup file
if [ ! -f "$BACKUP_FILE" ]; then
    error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

log "Selected backup: $(basename "$BACKUP_FILE")"
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Backup size: $BACKUP_SIZE"

# Detect backup type from extension
if [[ "$BACKUP_FILE" == *.sqlite.gpg ]]; then
    BACKUP_TYPE="sqlite"
elif [[ "$BACKUP_FILE" == *.sql.gpg ]]; then
    BACKUP_TYPE="mysql"
else
    error "Cannot detect backup type from filename (expected .sqlite.gpg or .sql.gpg)"
    exit 1
fi

# Verify backup type matches current DB type
if [ "$BACKUP_TYPE" != "$DB_TYPE" ]; then
    warning "Backup type ($BACKUP_TYPE) doesn't match current DB type ($DB_TYPE)"
    read -p "Continue anyway? (type 'yes' to proceed): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        log "Restore cancelled by user"
        exit 0
    fi
fi

# Final confirmation
echo ""
warning "⚠️  WARNING: This will REPLACE your current database!"
warning "Database: $DB_TYPE"
warning "Backup: $(basename "$BACKUP_FILE")"
echo ""
read -p "Type 'yes' to confirm restore: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log "Restore cancelled by user"
    exit 0
fi

# Execute restore based on type
if [ "$BACKUP_TYPE" = "sqlite" ]; then
    restore_sqlite "$BACKUP_FILE"
    EXIT_CODE=$?
elif [ "$BACKUP_TYPE" = "mysql" ]; then
    restore_mysql "$BACKUP_FILE"
    EXIT_CODE=$?
fi

# Check result
if [ $EXIT_CODE -eq 0 ]; then
    log "===== Restore Summary ====="
    log "Database type: $DB_TYPE"
    log "Restored from: $(basename "$BACKUP_FILE")"
    log "Status: SUCCESS ✓"
    log "========================="
    log ""
    info "Please verify your application is working correctly!"

    if [ "$DB_TYPE" = "mysql" ]; then
        info "Run migrations if needed: php artisan migrate"
    fi

    exit 0
else
    error "Restore failed!"
    exit 1
fi
