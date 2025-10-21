# 🔐 Skrypty zabezpieczeń bazy danych

## 🎯 Szybki start

### Development (SQLite w Docker)
```bash
# Backup
docker exec platformapakiety-laravel.test-1 bash /var/www/html/scripts/backup-database-universal.sh

# Restore
docker exec -it platformapakiety-laravel.test-1 bash /var/www/html/scripts/restore-database-universal.sh
```

### Production (MySQL na serwerze)
```bash
# Backup
ssh user@server "cd /var/www/html && bash scripts/backup-database-universal.sh"

# Restore
ssh user@server "cd /var/www/html && bash scripts/restore-database-universal.sh"
```

**⭐ Dla production (MySQL) zobacz pełny przewodnik:** [BACKUP_PRODUCTION.md](../BACKUP_PRODUCTION.md)

---

## 📦 Dostępne skrypty

### 🆕 backup-database-universal.sh (ZALECANE)
**Status:** ✅ Wspiera SQLite (dev) + MySQL (production)

Automatyczny backup z auto-detekcją typu bazy danych.

**Użycie - Development:**
```bash
docker exec platformapakiety-laravel.test-1 bash /var/www/html/scripts/backup-database-universal.sh
```

**Użycie - Production:**
```bash
ssh user@server
cd /var/www/html
bash scripts/backup-database-universal.sh
```

**Jak działa:**
1. Czyta `DB_CONNECTION` z `.env` (sqlite/mysql)
2. **Jeśli SQLite:** Kopiuje `database.sqlite` → szyfruje GPG
3. **Jeśli MySQL:** `mysqldump` → szyfruje GPG
4. Zapisuje do `storage/backups/db_backup_YYYYMMDD_HHMMSS.[sqlite|sql].gpg`
5. Czyści backupy starsze niż 30 dni

**Wymagania:**
- Zmienna `BACKUP_PASSWORD` w `.env`
- **Dla MySQL:** `mysqldump` zainstalowane (`apt-get install mysql-client`)

---

### 🆕 restore-database-universal.sh (ZALECANE)
**Status:** ✅ Wspiera SQLite (dev) + MySQL (production)

Restore z auto-detekcją formatu backupu.

**Użycie - Development:**
```bash
docker exec -it platformapakiety-laravel.test-1 bash /var/www/html/scripts/restore-database-universal.sh
```

**Użycie - Production:**
```bash
ssh user@server
cd /var/www/html
bash scripts/restore-database-universal.sh
```

**Jak działa:**
1. Wykrywa typ backupu z rozszerzenia (`.sqlite.gpg` / `.sql.gpg`)
2. Odszyfrowuje GPG
3. **Jeśli SQLite:** Weryfikuje integralność → kopiuje plik
4. **Jeśli MySQL:** Tworzy pre-restore backup → importuje SQL
5. Wymaga potwierdzenia: `yes`

**⚠️ MySQL:** Restore **DROP wszystkich tabel** w bazie!

---

### backup-database.sh (Legacy - tylko SQLite)
**Status:** ⚠️ Deprecated - używaj `backup-database-universal.sh`

Stary skrypt tylko dla SQLite.

**Użycie:**
```bash
docker exec platformapakiety-laravel.test-1 bash /var/www/html/scripts/backup-database.sh
```

---

### restore-database.sh (Legacy - tylko SQLite)
**Status:** ⚠️ Deprecated - używaj `restore-database-universal.sh`

Stary skrypt tylko dla SQLite.

**Użycie:**
```bash
docker exec -it platformapakiety-laravel.test-1 bash /var/www/html/scripts/restore-database.sh
```

---

## ⚙️ Automatyzacja backupów (Cron)

### Konfiguracja cron w kontenerze Docker

**Krok 1: Wejdź do kontenera**
```bash
docker exec -it platformapakiety-laravel.test-1 bash
```

**Krok 2: Zainstaluj cron (jeśli nie ma)**
```bash
apt-get update && apt-get install -y cron
```

**Krok 3: Dodaj zadanie cron**
```bash
crontab -e
```

**Dodaj linię (backup codziennie o 3:00 AM):**
```
0 3 * * * BACKUP_PASSWORD="$BACKUP_PASSWORD" /var/www/html/scripts/backup-database.sh >> /var/www/html/storage/logs/backup.log 2>&1
```

**Krok 4: Uruchom cron**
```bash
service cron start
```

**Sprawdź czy działa:**
```bash
tail -f /var/www/html/storage/logs/backup.log
```

---

## 🔑 Konfiguracja hasła backupu

### Metoda 1: W pliku .env (Development)
```env
BACKUP_PASSWORD=YourSecureBackupPassword123!
```

### Metoda 2: W docker-compose.yml (Production - bezpieczniejsze)
```yaml
environment:
  BACKUP_PASSWORD: '${BACKUP_PASSWORD}'
```

Potem ustaw w systemie:
```bash
export BACKUP_PASSWORD="YourSecurePassword"
docker-compose up -d
```

### Metoda 3: Docker secrets (Production - najbezpieczniejsze)
```bash
echo "YourSecurePassword" | docker secret create backup_password -
```

---

## 📂 Lokalizacja backupów

**Wewnątrz kontenera:**
```
/var/www/html/storage/backups/
```

**Na hoście (Windows):**
```
F:\Windsurf\PlatformaPakiety\storage\backups\
```

**Format pliku:**
```
db_backup_YYYYMMDD_HHMMSS.sqlite.gpg
```

**Przykład:**
```
db_backup_20251016_030000.sqlite.gpg
```

---

## 🧪 Testowanie backupów

### Test 1: Ręczny backup
```bash
docker exec platformapakiety-laravel.test-1 bash /var/www/html/scripts/backup-database.sh
```

**Oczekiwany output:**
```
[2025-10-16 03:00:00] Starting database backup...
[2025-10-16 03:00:01] Database copied successfully
[2025-10-16 03:00:02] Backup encrypted successfully
[2025-10-16 03:00:02] ===== Backup Summary =====
[2025-10-16 03:00:02] Encrypted file: db_backup_20251016_030000.sqlite.gpg
[2025-10-16 03:00:02] File size: 512K
[2025-10-16 03:00:02] Backup completed successfully!
```

### Test 2: Weryfikacja backupu (manual decrypt)
```bash
# Wejdź do kontenera
docker exec -it platformapakiety-laravel.test-1 bash

# Spróbuj odszyfrować
cd /var/www/html/storage/backups
gpg --decrypt --batch --passphrase "$BACKUP_PASSWORD" db_backup_20251016_030000.sqlite.gpg > test.sqlite

# Sprawdź czy to prawidłowa baza SQLite
file test.sqlite
# Output: test.sqlite: SQLite 3.x database

# Otwórz w SQLite
sqlite3 test.sqlite
sqlite> .tables
# Powinny się pokazać tabele: alerts, packages, users, etc.
sqlite> .quit

# Usuń testowy plik
rm test.sqlite
```

### Test 3: Pełny cykl restore
```bash
# Backup obecnej bazy
docker exec platformapakiety-laravel.test-1 bash /var/www/html/scripts/backup-database.sh

# Symuluj utratę danych (usuń 1 pakiet przez UI)

# Restore z backupu
docker exec -it platformapakiety-laravel.test-1 bash /var/www/html/scripts/restore-database.sh

# Sprawdź czy dane wróciły
```

---

## 🚨 Troubleshooting

### Problem: "BACKUP_PASSWORD not set"
**Rozwiązanie:**
```bash
# Sprawdź czy zmienna jest dostępna w kontenerze
docker exec platformapakiety-laravel.test-1 env | grep BACKUP

# Jeśli nie ma, dodaj do docker-compose.yml i restart
docker-compose down && docker-compose up -d
```

### Problem: "GPG is not installed"
**Rozwiązanie:**
```bash
docker exec platformapakiety-laravel.test-1 bash -c "apt-get update && apt-get install -y gnupg"
```

### Problem: "Failed to decrypt backup (wrong password?)"
**Możliwe przyczyny:**
1. Hasło w `.env` zostało zmienione od czasu backupu
2. Plik backupu jest uszkodzony
3. Nieprawidłowy format pliku

**Debug:**
```bash
# Sprawdź czy plik jest zaszyfrowany GPG
file storage/backups/db_backup_*.gpg
# Output powinien zawierać: "GPG symmetrically encrypted data"
```

### Problem: Backup zajmuje zbyt dużo miejsca
**Rozwiązanie - zmniejsz retention:**
```bash
# Edytuj backup-database.sh
# Zmień: RETENTION_DAYS=30
# Na:    RETENTION_DAYS=7

# Lub ręcznie usuń stare backupy
find storage/backups -name "*.gpg" -mtime +7 -delete
```

---

## 📊 Monitoring backupów

### Sprawdź ostatnie backupy
```bash
docker exec platformapakiety-laravel.test-1 ls -lth /var/www/html/storage/backups/
```

### Sprawdź logi backupów
```bash
docker exec platformapakiety-laravel.test-1 tail -50 /var/www/html/storage/logs/backup.log
```

### Statystyki
```bash
docker exec platformapakiety-laravel.test-1 bash -c "
  echo 'Total backups:' \$(ls -1 /var/www/html/storage/backups/*.gpg | wc -l)
  echo 'Total size:' \$(du -sh /var/www/html/storage/backups/)
  echo 'Oldest backup:' \$(ls -t /var/www/html/storage/backups/*.gpg | tail -1)
  echo 'Newest backup:' \$(ls -t /var/www/html/storage/backups/*.gpg | head -1)
"
```

---

## 🔐 Bezpieczeństwo

### ✅ Dobre praktyki
- Używaj **silnego hasła** (min. 16 znaków, wielkie/małe litery, cyfry, symbole)
- **NIGDY** nie commituj `.env` do Git
- Przechowuj hasło backupu w **menedżerze haseł** (LastPass, 1Password)
- **Testuj restore** raz na kwartał
- Przechowuj backupy **poza serwerem** (S3, Google Drive, Dropbox)

### ❌ Czego NIE robić
- Nie używaj prostych haseł (`password123`, `backup`, `admin`)
- Nie przechowuj haseł w plaintext w kodzie
- Nie ignoruj błędów backupu
- Nie zakładaj że backup działa bez testowania restore

---

## 📤 Eksport backupów do chmury (opcjonalne)

### Google Drive (rclone)
```bash
# Instalacja rclone w kontenerze
apt-get install -y rclone

# Konfiguracja
rclone config

# Auto-upload po backupie (dodaj do backup-database.sh przed exit 0)
rclone copy "$ENCRYPTED_FILE" gdrive:PlatformaPakiety/backups/
```

### AWS S3
```bash
# Instalacja AWS CLI
apt-get install -y awscli

# Konfiguracja
aws configure

# Auto-upload (dodaj do backup-database.sh)
aws s3 cp "$ENCRYPTED_FILE" s3://your-bucket/backups/
```

---

## 📞 Support

Jeśli masz problemy z backupami, sprawdź:
1. Logi: `storage/logs/backup.log`
2. Uprawnienia plików: `chmod +x scripts/*.sh`
3. Zmienna środowiskowa: `docker exec ... env | grep BACKUP`

