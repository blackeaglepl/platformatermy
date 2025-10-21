#!/bin/bash

###############################################################################
# Universal Database Backup Script with GPG Encryption
#
# Purpose: Create encrypted backups for BOTH SQLite (dev) and MySQL (production)
# Auto-detects database type from .env
# Schedule: Run daily via cron (recommended: 3:00 AM)
# Storage: /var/www/html/storage/backups/
#
# Usage:
#   docker exec platformapakiety-laravel.test-1 bash /var/www/html/scripts/backup-database-universal.sh
#
# Environment Variables Required:
#   BACKUP_PASSWORD - GPG encryption password (set in .env or docker-compose)
#   DB_CONNECTION   - Database type (sqlite/mysql)
#   DB_DATABASE     - Database name (for MySQL)
#   DB_USERNAME     - Database user (for MySQL)
#   DB_PASSWORD     - Database password (for MySQL)
#   DB_HOST         - Database host (for MySQL)
###############################################################################

# Configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="/var/www/html"
BACKUP_DIR="$PROJECT_ROOT/storage/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

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

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Detect database type
DB_TYPE="${DB_CONNECTION:-sqlite}"
log "Detected database type: $DB_TYPE"

###############################################################################
# FUNCTION: Backup SQLite
###############################################################################
backup_sqlite() {
    local DB_FILE="$PROJECT_ROOT/database/database.sqlite"
    local BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sqlite"
    local ENCRYPTED_FILE="$BACKUP_FILE.gpg"

    # Check if database file exists
    if [ ! -f "$DB_FILE" ]; then
        error "SQLite database file not found: $DB_FILE"
        return 1
    fi

    log "Starting SQLite backup..."
    log "Database: $DB_FILE"

    # Step 1: Copy database file
    log "Copying database..."
    if cp "$DB_FILE" "$BACKUP_FILE"; then
        log "Database copied successfully"
    else
        error "Failed to copy database"
        return 1
    fi

    # Step 2: Encrypt with GPG
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
        return 1
    fi

    # Step 3: Remove unencrypted copy
    log "Removing unencrypted backup..."
    rm -f "$BACKUP_FILE"

    # Step 4: Verify
    if [ -f "$ENCRYPTED_FILE" ]; then
        ENCRYPTED_SIZE=$(du -h "$ENCRYPTED_FILE" | cut -f1)
        log "Encrypted backup created: $ENCRYPTED_SIZE"
        echo "$ENCRYPTED_FILE"  # Return path
        return 0
    else
        error "Encrypted file not found after creation"
        return 1
    fi
}

###############################################################################
# FUNCTION: Backup MySQL
###############################################################################
backup_mysql() {
    local BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"
    local ENCRYPTED_FILE="$BACKUP_FILE.gpg"

    # Check if mysqldump is installed
    if ! command -v mysqldump &> /dev/null; then
        error "mysqldump is not installed. Install with: apt-get install mysql-client"
        return 1
    fi

    # Validate MySQL credentials
    if [ -z "$DB_DATABASE" ] || [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ]; then
        error "MySQL credentials not set in .env (DB_DATABASE, DB_USERNAME, DB_PASSWORD)"
        return 1
    fi

    local DB_HOST="${DB_HOST:-mysql}"  # Default to 'mysql' (Docker service name)

    log "Starting MySQL backup..."
    log "Database: $DB_DATABASE @ $DB_HOST"

    # Step 1: Create SQL dump
    log "Creating MySQL dump..."
    if mysqldump \
        --host="$DB_HOST" \
        --user="$DB_USERNAME" \
        --password="$DB_PASSWORD" \
        --single-transaction \
        --quick \
        --lock-tables=false \
        --routines \
        --triggers \
        "$DB_DATABASE" > "$BACKUP_FILE" 2>&1; then
        log "MySQL dump created successfully"
    else
        error "Failed to create MySQL dump"
        rm -f "$BACKUP_FILE"
        return 1
    fi

    # Step 2: Verify dump is not empty
    if [ ! -s "$BACKUP_FILE" ]; then
        error "MySQL dump file is empty!"
        rm -f "$BACKUP_FILE"
        return 1
    fi

    local DUMP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    info "SQL dump size: $DUMP_SIZE"

    # Step 3: Encrypt with GPG
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
        return 1
    fi

    # Step 4: Remove unencrypted copy
    log "Removing unencrypted backup..."
    rm -f "$BACKUP_FILE"

    # Step 5: Verify
    if [ -f "$ENCRYPTED_FILE" ]; then
        ENCRYPTED_SIZE=$(du -h "$ENCRYPTED_FILE" | cut -f1)
        log "Encrypted backup created: $ENCRYPTED_SIZE"
        echo "$ENCRYPTED_FILE"  # Return path
        return 0
    else
        error "Encrypted file not found after creation"
        return 1
    fi
}

###############################################################################
# MAIN EXECUTION
###############################################################################

log "===== Universal Database Backup ====="

# Execute appropriate backup based on DB type
if [ "$DB_TYPE" = "sqlite" ]; then
    RESULT_FILE=$(backup_sqlite)
    EXIT_CODE=$?
elif [ "$DB_TYPE" = "mysql" ]; then
    RESULT_FILE=$(backup_mysql)
    EXIT_CODE=$?
else
    error "Unsupported database type: $DB_TYPE (expected sqlite or mysql)"
    exit 1
fi

# Check if backup succeeded
if [ $EXIT_CODE -ne 0 ]; then
    error "Backup failed!"
    exit 1
fi

# Cleanup old backups (works for both .sqlite.gpg and .sql.gpg)
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

# Summary
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "db_backup_*.gpg" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

log "===== Backup Summary ====="
log "Database type: $DB_TYPE"
log "Encrypted file: $(basename "$RESULT_FILE")"
log "Total backups: $TOTAL_BACKUPS"
log "Total backup size: $TOTAL_SIZE"
log "Retention period: $RETENTION_DAYS days"
log "========================="
log "Backup completed successfully!"

exit 0
