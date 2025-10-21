# 🚀 Backup Quick Guide - Szybki Przewodnik

## 📍 TL;DR - Gdzie są moje backupy?

### Development (Windows + Docker)

```
F:\Windsurf\PlatformaPakiety\storage\backups\
├── db_backup_20251021_030000.sqlite.gpg  ← Backup z 21.10.2025 03:00
├── db_backup_20251020_030000.sqlite.gpg  ← Backup z 20.10.2025 03:00
└── db_backup_20251019_030000.sqlite.gpg  ← Backup z 19.10.2025 03:00
```

### Production (Linux Server)

```
/var/www/html/storage/backups/
├── db_backup_20251021_030000.sql.gpg  ← MySQL backup
├── db_backup_20251020_030000.sql.gpg
└── db_backup_20251019_030000.sql.gpg
```

**Różnica:** `.sqlite.gpg` (dev) vs `.sql.gpg` (production)

---

## ⚡ Najczęstsze komendy

### 1. BACKUP TERAZ

**Development:**
```bash
docker exec platformapakiety-laravel.test-1 bash /var/www/html/scripts/backup-database-universal.sh
```

**Production:**
```bash
ssh user@server "cd /var/www/html && bash scripts/backup-database-universal.sh"
```

---

### 2. POKAŻ WSZYSTKIE BACKUPY

**Development:**
```bash
docker exec platformapakiety-laravel.test-1 ls -lh /var/www/html/storage/backups/
```

**Production:**
```bash
ssh user@server "ls -lh /var/www/html/storage/backups/"
```

---

### 3. ODTWÓRZ NAJNOWSZY BACKUP

**Development:**
```bash
docker exec -it platformapakiety-laravel.test-1 bash /var/www/html/scripts/restore-database-universal.sh
# Wciśnij Enter (wybierze latest)
# Wpisz: yes
```

**Production:**
```bash
ssh -t user@server "cd /var/www/html && bash scripts/restore-database-universal.sh"
# Wciśnij Enter (wybierze latest)
# Wpisz: yes
```

---

### 4. ODTWÓRZ KONKRETNY BACKUP

**Development:**
```bash
# Najpierw zobacz listę
docker exec platformapakiety-laravel.test-1 ls -lh /var/www/html/storage/backups/

# Potem restore konkretnego
docker exec -it platformapakiety-laravel.test-1 bash /var/www/html/scripts/restore-database-universal.sh db_backup_20251020_030000.sqlite.gpg
# Wpisz: yes
```

**Production:**
```bash
# Zobacz listę
ssh user@server "ls -lh /var/www/html/storage/backups/"

# Restore konkretnego
ssh -t user@server "cd /var/www/html && bash scripts/restore-database-universal.sh db_backup_20251020_030000.sql.gpg"
# Wpisz: yes
```

---

## 🔑 Hasło backupu - gdzie je znaleźć?

**Lokalizacja:** Plik `.env` w głównym katalogu projektu

**Development:**
```bash
# Na Windows
cat .env | grep BACKUP_PASSWORD

# Lub otwórz .env w edytorze
code .env  # (szukaj linii BACKUP_PASSWORD=...)
```

**Production:**
```bash
ssh user@server
cd /var/www/html
grep BACKUP_PASSWORD .env
```

**⚠️ WAŻNE:**
- Hasło jest **wymagane** do odtworzenia backupów!
- Zapisz je w menedżerze haseł (LastPass, 1Password)
- **NIE commituj** `.env` do Git

---

## 🆘 Najczęstsze problemy

### ❌ Problem: "BACKUP_PASSWORD not set"

**Rozwiązanie:**
```bash
# Sprawdź .env
grep BACKUP_PASSWORD .env

# Jeśli brak, dodaj:
echo "BACKUP_PASSWORD=YourStrongPassword123!" >> .env

# Zrestartuj kontenery (development)
docker compose restart
```

---

### ❌ Problem: "gpg: decryption failed: Bad session key"

**Przyczyna:** Złe hasło

**Rozwiązanie:**
```bash
# Sprawdź dokładnie hasło w .env
cat .env | grep BACKUP_PASSWORD

# Spróbuj ręcznie odszyfrować (test)
docker exec -it platformapakiety-laravel.test-1 bash -c "
  cd /var/www/html &&
  gpg --decrypt storage/backups/db_backup_20251021_030000.sqlite.gpg > /tmp/test.sqlite
"
# Wpisz hasło z .env
```

---

### ❌ Problem: "mysqldump: command not found" (Production)

**Przyczyna:** Brak MySQL client na serwerze

**Rozwiązanie:**
```bash
ssh user@server
apt-get update
apt-get install -y mysql-client

# Sprawdź instalację
which mysqldump  # Powinno zwrócić: /usr/bin/mysqldump
```

---

### ❌ Problem: "No backups found"

**Przyczyna:** Brak backupów w storage/backups/

**Rozwiązanie:**
```bash
# Utwórz pierwszy backup
docker exec platformapakiety-laravel.test-1 bash /var/www/html/scripts/backup-database-universal.sh

# Sprawdź czy powstał
docker exec platformapakiety-laravel.test-1 ls -lh /var/www/html/storage/backups/
```

---

## 📅 Automatyczne backupy (Cron)

### Jak sprawdzić czy działają?

**Development:**
```bash
docker exec platformapakiety-laravel.test-1 crontab -l
# Powinno pokazać linię z backup-database-universal.sh
```

**Production:**
```bash
ssh user@server
crontab -l
# Powinno pokazać: 0 3 * * * ... backup-database-universal.sh
```

### Jak ustawić automatyczne backupy?

**Development:**
```bash
docker exec -it platformapakiety-laravel.test-1 bash
crontab -e
# Dodaj na końcu pliku:
0 3 * * * BACKUP_PASSWORD="$BACKUP_PASSWORD" /var/www/html/scripts/backup-database-universal.sh >> /var/www/html/storage/logs/backup.log 2>&1
# Zapisz: Ctrl+X, Y, Enter
```

**Production:**
```bash
ssh user@server
crontab -e
# Dodaj na końcu pliku:
0 3 * * * cd /var/www/html && BACKUP_PASSWORD="YourPassword" bash scripts/backup-database-universal.sh >> storage/logs/backup.log 2>&1
# Zapisz: Ctrl+X, Y, Enter
```

**Co to robi:**
- Backup **codziennie o 3:00 AM**
- Zapisuje logi do `storage/logs/backup.log`

---

## 📊 Monitorowanie

### Sprawdź logi backupów

**Development:**
```bash
docker exec platformapakiety-laravel.test-1 tail -50 /var/www/html/storage/logs/backup.log
```

**Production:**
```bash
ssh user@server "tail -50 /var/www/html/storage/logs/backup.log"
```

### Sprawdź rozmiar backupów

**Development:**
```bash
docker exec platformapakiety-laravel.test-1 du -sh /var/www/html/storage/backups/
```

**Production:**
```bash
ssh user@server "du -sh /var/www/html/storage/backups/"
```

### Ile mam backupów?

**Development:**
```bash
docker exec platformapakiety-laravel.test-1 bash -c "ls -1 /var/www/html/storage/backups/*.gpg | wc -l"
```

**Production:**
```bash
ssh user@server "ls -1 /var/www/html/storage/backups/*.gpg | wc -l"
```

---

## 🎓 Pełne przewodniki

- **[BACKUP_PRODUCTION.md](BACKUP_PRODUCTION.md)** - Szczegółowy przewodnik MySQL dla production
- **[scripts/README.md](scripts/README.md)** - Dokumentacja wszystkich skryptów
- **[CLAUDE.md](CLAUDE.md)** - Sekcja "Bezpieczeństwo" → punkt 5

---

## 💡 Wskazówki

### 1. Testuj restore regularnie!

```bash
# Raz na kwartał przetestuj czy restore działa
docker exec -it platformapakiety-laravel.test-1 bash /var/www/html/scripts/restore-database-universal.sh
```

### 2. Eksportuj backupy do chmury

**Do AWS S3:**
```bash
apt-get install awscli
aws s3 sync /var/www/html/storage/backups/ s3://your-bucket/backups/
```

**Do Google Drive (rclone):**
```bash
curl https://rclone.org/install.sh | sudo bash
rclone config  # Skonfiguruj Google Drive
rclone sync /var/www/html/storage/backups/ gdrive:PlatformaPakiety-Backups
```

### 3. Zmień hasło backupu regularnie

```bash
# Raz na 90 dni
# 1. Wygeneruj nowe hasło (np. w LastPass)
# 2. Zmień w .env:
BACKUP_PASSWORD=NewStrongPassword456!
# 3. Zrestartuj (development):
docker compose restart
```

---

**Ostatnia aktualizacja:** 2025-10-21
**Pytania?** Zobacz pełną dokumentację w [BACKUP_PRODUCTION.md](BACKUP_PRODUCTION.md)
