# 🔐 System Backupów - Production (MySQL) vs Development (SQLite)

## 📊 Porównanie środowisk

| Aspekt | Development (Windows+Docker) | Production (Linux Server) |
|--------|------------------------------|---------------------------|
| **Baza danych** | SQLite (plik) | MySQL (serwer) |
| **Backup metoda** | `cp database.sqlite` | `mysqldump` |
| **Backup format** | `.sqlite.gpg` | `.sql.gpg` |
| **Szyfrowanie** | GPG AES-256 | GPG AES-256 |
| **Skrypt** | `backup-database-universal.sh` | `backup-database-universal.sh` |
| **Automatyzacja** | Cron w kontenerze | Cron na serwerze |

---

## 🚀 Quick Start

### Development (SQLite)

```bash
# Backup TERAZ
docker exec platformapakiety-laravel.test-1 bash /var/www/html/scripts/backup-database-universal.sh

# Lista backupów
docker exec platformapakiety-laravel.test-1 ls -lh /var/www/html/storage/backups/

# Restore
docker exec -it platformapakiety-laravel.test-1 bash /var/www/html/scripts/restore-database-universal.sh
```

### Production (MySQL)

```bash
# Backup TERAZ (SSH do serwera)
ssh user@your-server
cd /var/www/html
bash scripts/backup-database-universal.sh

# Lista backupów
ls -lh storage/backups/

# Restore
bash scripts/restore-database-universal.sh
```

---

## 🔧 Konfiguracja Production

### Krok 1: Ustaw credentials MySQL w `.env`

```env
# Production .env
DB_CONNECTION=mysql          # ← WAŻNE: zmień z sqlite na mysql
DB_HOST=mysql                # Lub IP serwera MySQL
DB_PORT=3306
DB_DATABASE=platformapakiety
DB_USERNAME=laravel_user
DB_PASSWORD=StrongPassword123!

# Hasło backupu (WAŻNE!)
BACKUP_PASSWORD=YourSecureBackupPassword456!
```

### Krok 2: Zainstaluj wymagane narzędzia na serwerze

```bash
# MySQL client (dla mysqldump i mysql)
apt-get update
apt-get install -y mysql-client

# GPG (dla szyfrowania)
apt-get install -y gnupg

# Sprawdź instalację
which mysqldump  # Powinno zwrócić: /usr/bin/mysqldump
which gpg        # Powinno zwrócić: /usr/bin/gpg
```

### Krok 3: Sprawdź połączenie z MySQL

```bash
# Test połączenia
mysql --host=mysql \
      --user=laravel_user \
      --password=StrongPassword123! \
      --execute="SHOW DATABASES;"

# Powinno pokazać listę baz danych w tym platformapakiety
```

### Krok 4: Testowy backup

```bash
# Uruchom ręcznie
cd /var/www/html
bash scripts/backup-database-universal.sh

# Sprawdź czy plik powstał
ls -lh storage/backups/
# Powinien być plik: db_backup_YYYYMMDD_HHMMSS.sql.gpg
```

### Krok 5: Ustaw automatyczne backupy (cron)

```bash
# Edytuj crontab
crontab -e

# Dodaj linię (backup codziennie o 3:00 AM)
0 3 * * * cd /var/www/html && BACKUP_PASSWORD="YourSecureBackupPassword456!" bash scripts/backup-database-universal.sh >> storage/logs/backup.log 2>&1

# Zapisz i wyjdź (Ctrl+X, Y, Enter)

# Sprawdź czy cron działa
crontab -l
```

---

## 🔍 Jak działa skrypt uniwersalny

### Auto-detekcja typu bazy

Skrypt **automatycznie wykrywa** typ bazy z `.env`:

```bash
DB_CONNECTION=sqlite  → backup_sqlite()
DB_CONNECTION=mysql   → backup_mysql()
```

### SQLite Backup (Development)

```bash
# 1. Kopiuje plik
cp database/database.sqlite → db_backup_20251021.sqlite

# 2. Szyfruje
gpg --symmetric --cipher-algo AES256 --passphrase "$BACKUP_PASSWORD"
→ db_backup_20251021.sqlite.gpg

# 3. Usuwa niezaszyfrowany
rm db_backup_20251021.sqlite
```

### MySQL Backup (Production)

```bash
# 1. Eksportuje do SQL
mysqldump --host=mysql \
          --user=laravel_user \
          --password=xxx \
          platformapakiety > db_backup_20251021.sql

# 2. Szyfruje
gpg --symmetric --cipher-algo AES256 --passphrase "$BACKUP_PASSWORD"
→ db_backup_20251021.sql.gpg

# 3. Usuwa niezaszyfrowany
rm db_backup_20251021.sql
```

**Opcje mysqldump:**
- `--single-transaction` - backup bez blokowania tabel (InnoDB)
- `--quick` - nie ładuje całej tabeli do pamięci
- `--lock-tables=false` - nie blokuje tabel podczas backup
- `--routines` - eksportuj stored procedures
- `--triggers` - eksportuj triggery

---

## 🔄 Restore na Production

### Automatyczny restore (ZALECANE)

```bash
ssh user@your-server
cd /var/www/html

# Interaktywny (wybierz z listy)
bash scripts/restore-database-universal.sh

# Zostaniesz zapytany:
# 1. Który backup? (wpisz numer lub 'latest')
# 2. Potwierdzenie: wpisz 'yes'
```

### Restore konkretnego backupu

```bash
# Najpierw zobacz listę
ls -lh storage/backups/

# Restore konkretnego pliku
bash scripts/restore-database-universal.sh db_backup_20251021_030000.sql.gpg
```

### Co się dzieje przy MySQL restore:

1. **Odszyfrowuje** `.sql.gpg` → `.sql` (temp)
2. **Backup obecnej bazy** do `pre_restore_backup_TIMESTAMP.sql`
3. **Importuje** SQL do MySQL:
   ```bash
   mysql --host=mysql \
         --user=laravel_user \
         --password=xxx \
         platformapakiety < db_backup_20251021.sql
   ```
4. **Usuwa** temp pliki

**⚠️ WAŻNE:** Restore **zastępuje całą bazę** - wszystkie tabele będą DROP+CREATE!

---

## 🚨 Troubleshooting Production

### Problem 1: "mysqldump: command not found"

```bash
# Zainstaluj MySQL client
apt-get update && apt-get install -y mysql-client

# Sprawdź instalację
which mysqldump
```

### Problem 2: "Access denied for user"

```bash
# Sprawdź credentials w .env
cat .env | grep DB_

# Test połączenia
mysql --host=$DB_HOST \
      --user=$DB_USERNAME \
      --password=$DB_PASSWORD \
      --execute="SHOW DATABASES;"
```

### Problem 3: "Can't connect to MySQL server"

```bash
# Sprawdź czy MySQL działa
docker ps | grep mysql
# LUB (jeśli natywny MySQL)
systemctl status mysql

# Sprawdź host w .env (jeśli Docker)
DB_HOST=mysql  # ← nazwa serwisu z docker-compose.yml
```

### Problem 4: Backup jest pusty (0 bytes)

```bash
# Sprawdź czy baza ma dane
mysql --host=mysql \
      --user=laravel_user \
      --password=xxx \
      --execute="USE platformapakiety; SHOW TABLES;"

# Sprawdź logi backupu
tail -50 storage/logs/backup.log
```

### Problem 5: "gpg: decryption failed: Bad session key"

```bash
# Złe hasło w BACKUP_PASSWORD
# Sprawdź hasło
grep BACKUP_PASSWORD .env

# Upewnij się że używasz tego samego hasła co przy backup
```

---

## 📦 Eksport backupów do chmury (opcjonalnie)

### Do Amazon S3

```bash
# Zainstaluj AWS CLI
apt-get install -y awscli

# Konfiguruj credentials
aws configure

# Dodaj do crontab (po backupie)
0 4 * * * aws s3 sync /var/www/html/storage/backups/ s3://your-bucket/platformapakiety-backups/ >> /var/www/html/storage/logs/s3-sync.log 2>&1
```

### Do Google Drive (rclone)

```bash
# Zainstaluj rclone
curl https://rclone.org/install.sh | sudo bash

# Konfiguruj Google Drive
rclone config

# Dodaj do crontab
0 4 * * * rclone sync /var/www/html/storage/backups/ gdrive:PlatformaPakiety-Backups >> /var/www/html/storage/logs/rclone.log 2>&1
```

---

## 📋 Checklist przed wdrożeniem na Production

### Przed pierwszym backup na serwerze:
- [ ] Zmieniono `DB_CONNECTION=mysql` w `.env`
- [ ] Ustawiono credentials MySQL (DB_USERNAME, DB_PASSWORD, DB_DATABASE)
- [ ] Ustawiono silne `BACKUP_PASSWORD` (min. 16 znaków)
- [ ] Zainstalowano `mysql-client` i `gnupg`
- [ ] Przetestowano połączenie z MySQL: `mysql --host=... --execute="SHOW DATABASES;"`
- [ ] Ręczny backup zadziałał: `bash scripts/backup-database-universal.sh`
- [ ] Plik `.sql.gpg` powstał w `storage/backups/`

### Po pierwszym backupie:
- [ ] Przetestowano restore na testowej bazie
- [ ] Skonfigurowano cron dla automatycznych backupów
- [ ] Sprawdzono logi: `tail storage/logs/backup.log`
- [ ] Opcjonalnie: skonfigurowano eksport do chmury (S3/GDrive)

### Co miesiąc:
- [ ] Sprawdź czy backupy powstają: `ls -lh storage/backups/`
- [ ] Sprawdź rozmiar: `du -sh storage/backups/`
- [ ] Przetestuj restore na testowej bazie (raz na kwartał)
- [ ] Zmień `BACKUP_PASSWORD` (raz na 90 dni)

---

## 🆚 Różnice SQLite vs MySQL w backupach

| Aspekt | SQLite | MySQL |
|--------|--------|-------|
| **Backup command** | `cp database.sqlite` | `mysqldump platformapakiety` |
| **Restore command** | `mv backup.sqlite database.sqlite` | `mysql platformapakiety < backup.sql` |
| **Rozmiar backupu** | ~5-10 MB | ~10-20 MB (większy bo SQL) |
| **Czas backupu** | <1s | 5-30s (zależy od wielkości) |
| **Czas restore** | <1s | 10-60s (zależy od wielkości) |
| **Blokowanie tabel** | Plik locked podczas backup | Brak blokad (`--single-transaction`) |
| **Integrity check** | `PRAGMA integrity_check` | SQL import validation |

---

## 🔐 Bezpieczeństwo backupów

### Co jest zabezpieczone:
✅ **Szyfrowanie:** AES-256 (GPG)
✅ **Hasło:** `BACKUP_PASSWORD` (16+ znaków)
✅ **Retencja:** Stare backupy automatycznie usuwane (30 dni)
✅ **Permissions:** Tylko root/owner może czytać pliki

### Czego NIE commitować do Git:
❌ `.env` (zawiera `BACKUP_PASSWORD`)
❌ `storage/backups/*.gpg` (dodane do `.gitignore`)
❌ `database/database.sqlite` (dodane do `.gitignore`)

### Gdzie przechowywać hasło:
✅ Menedżer haseł (LastPass, 1Password, Bitwarden)
✅ Zaszyfrowany plik na serwerze (tylko dla root)
✅ AWS Secrets Manager / HashiCorp Vault (enterprise)

---

## 📞 Kontakt w razie problemów

**Backup nie działa:**
1. Sprawdź logi: `tail -50 storage/logs/backup.log`
2. Sprawdź typ bazy: `grep DB_CONNECTION .env`
3. Test ręczny: `bash scripts/backup-database-universal.sh`

**Restore nie działa:**
1. Sprawdź hasło: `grep BACKUP_PASSWORD .env`
2. Sprawdź plik istnieje: `ls -lh storage/backups/`
3. Test deszyfrowania: `gpg --decrypt backup.sql.gpg > test.sql`

**Pytania:**
- Zobacz [scripts/README.md](scripts/README.md) dla szczegółów
- Zobacz [CLAUDE.md](CLAUDE.md) sekcja "Bezpieczeństwo"

---

**Ostatnia aktualizacja:** 2025-10-21
**Wersja skryptów:** Universal v1.0 (SQLite + MySQL)
