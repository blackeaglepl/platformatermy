# 💾 Przewodnik Ręcznych Backupów - Platforma Pakiety

**Projekt:** TermyGórce Admin Panel
**Cel:** Wykonanie ręcznego backupu bazy danych przed ważnymi operacjami
**Czas wykonania:** ~10 sekund
**Poziom trudności:** ⭐ Łatwy

---

## 📋 Kiedy robić ręczny backup?

### ✅ ZAWSZE przed:
- 🔧 **Migracją nowej funkcjonalności** (Vouchery, nowe tabele)
- 🗑️ **Usunięciem danych** (czyszczenie starych pakietów)
- 🔄 **Aktualizacją Laravel** (`composer update`)
- 📝 **Masową edycją danych** (update wielu rekordów naraz)
- 🚨 **Każdym deployment na produkcję**

### Złota zasada:
> Jeśli myślisz "hmm, to może być ryzykowne" → **ZRÓB BACKUP!** 🛡️

---

## 🚀 Sposób 1: SSH Terminal (najszybszy)

### Krok 1: Połącz się z serwerem

```bash
ssh mongaw@s46.zenbox.pl
```

**Wpisz hasło SSH** (dostępne w menedżerze haseł)

### Krok 2: Przejdź do katalogu aplikacji

**Środowisko testowe:**
```bash
cd /domains/tg.stronazen.pl/public_html/admin
```

**Produkcja:**
```bash
cd /domains/panel.termygorce.pl/public_html
```

### Krok 3: Wywołaj backup

```bash
BACKUP_PASSWORD="${BACKUP_PASSWORD}" bash scripts/backup-database-universal.sh
```

### Krok 4: Sprawdź rezultat

```bash
ls -lh storage/backups/ | tail -3
```

**Oczekiwany output:**
```
-rw-r--r-- 1 mongaw mongaw 1.8M Oct 27 03:00 db_backup_20251027_030000.sql.gpg
-rw-r--r-- 1 mongaw mongaw 1.8M Oct 27 14:35 db_backup_20251027_143500.sql.gpg ← NOWY!
```

**✅ Backup gotowy!** Możesz kontynuować deployment/migrację.

---

## 🖥️ Sposób 2: WinSCP (GUI + Terminal)

### Krok 1: Połącz się przez WinSCP

```
Host: s46.zenbox.pl
User: mongaw
Password: <hasło SSH z menedżera haseł>
```

**Kliknij "Login"**

### Krok 2: Nawiguj do katalogu aplikacji

**Prawy panel (serwer) → przejdź do:**
- Testowe: `/domains/tg.stronazen.pl/public_html/admin`
- Produkcja: `/domains/panel.termygorce.pl/public_html`

### Krok 3: Otwórz terminal

**Menu:** `Commands → Open Terminal`
**Lub skrót:** `Ctrl + T`

### Krok 4: Wykonaj backup

**W terminalu WinSCP wpisz:**
```bash
BACKUP_PASSWORD="${BACKUP_PASSWORD}" bash scripts/backup-database-universal.sh
```

**Naciśnij Enter**

### Krok 5: Weryfikacja w GUI

**W prawym panelu WinSCP:**
1. Przejdź do folderu: `storage/backups/`
2. Sortuj po dacie (najnowszy na górze)
3. Sprawdź czy jest nowy plik: `db_backup_YYYYMMDD_HHMMSS.sql.gpg`

**✅ Backup widoczny w GUI!**

---

## 🐳 Sposób 3: Development lokalny (Docker)

### Dla lokalnej bazy SQLite:

**Otwórz Git Bash w katalogu projektu:**

```bash
cd /f/Windsurf/PlatformaPakiety

# Wywołaj backup w kontenerze
docker exec platformapakiety-laravel.test-1 bash -c "
  cd /var/www/html &&
  BACKUP_PASSWORD=\${BACKUP_PASSWORD} bash scripts/backup-database-universal.sh
"
```

**Sprawdź rezultat:**
```bash
ls -lh storage/backups/
```

**✅ Backup lokalny gotowy!**

---

## ⚡ One-liner (szybki backup przed migracją)

### Produkcja (wszystko w jednej linii):

```bash
cd /domains/panel.termygorce.pl/public_html && BACKUP_PASSWORD="${BACKUP_PASSWORD}" bash scripts/backup-database-universal.sh && ls -lh storage/backups/ | tail -1 && echo "✅ Backup gotowy!"
```

**Copy-paste i Enter** - gotowe! 🎯

---

## 📊 Output backupu - co zobaczysz?

### Sukces:
```
=== Database Backup Tool (Universal) ===

Database type detected: mysql
Backup directory: /domains/panel.termygorce.pl/public_html/storage/backups

[INFO] Creating MySQL backup...
[INFO] Encrypting backup...
[INFO] Cleaning up old backups (older than 30 days)...
[SUCCESS] Backup completed successfully!

Backup file: storage/backups/db_backup_20251027_143500.sql.gpg
Size: 1.8 MB
Encrypted: Yes (AES-256)
```

### Błąd (brak hasła):
```
[ERROR] BACKUP_PASSWORD environment variable is not set!
Please set BACKUP_PASSWORD in your .env file.
```

**Rozwiązanie:** Sprawdź czy `BACKUP_PASSWORD` jest w `.env`:
```bash
grep BACKUP_PASSWORD .env
php artisan tinker --execute="echo env('BACKUP_PASSWORD');"
```

---

## 🔍 Jak sprawdzić czy backup jest OK?

### Metoda 1: Sprawdź rozmiar pliku

```bash
ls -lh storage/backups/db_backup_*.gpg | tail -1
```

**Oczekiwany rozmiar:**
- Pusta baza: ~20 KB
- 100 pakietów: ~200 KB
- 1000 pakietów: ~2 MB

**Jeśli rozmiar = 0 KB → backup się nie powiódł!** ❌

### Metoda 2: Test integralności GPG

```bash
gpg --list-packets storage/backups/db_backup_20251027_143500.sql.gpg
```

**Sukces (pokaże pakiety GPG):**
```
:pubkey enc packet: version 3, algo 1, keyid ...
:encrypted data packet:
```

**Błąd (plik uszkodzony):**
```
gpg: invalid packet (ctb=00)
```

### Metoda 3: Sprawdź logi

```bash
tail -20 storage/logs/backup.log
```

**Szukaj linii:**
```
[2025-10-27 14:35:08] Backup successful: db_backup_20251027_143500.sql.gpg
```

---

## 📝 Workflow przed migracją (kompletny przykład)

### Scenariusz: Dodajesz funkcjonalność Vouchery

**1. Połącz się z serwerem (produkcja):**
```bash
ssh mongaw@s46.zenbox.pl
cd /domains/panel.termygorce.pl/public_html
```

**2. ⚠️ BACKUP (KRYTYCZNY KROK!):**
```bash
BACKUP_PASSWORD="${BACKUP_PASSWORD}" bash scripts/backup-database-universal.sh
```

**3. Zapisz nazwę backupu:**
```bash
BACKUP_FILE=$(ls -t storage/backups/*.gpg | head -1)
echo "Backup przed Vouchery: $BACKUP_FILE" >> deployment_history.txt
echo "Backup: $BACKUP_FILE"
```

Output: `Backup: storage/backups/db_backup_20251027_143500.sql.gpg`

**4. Maintenance mode:**
```bash
php artisan down --message="Dodawanie funkcjonalności Vouchery"
```

**5. Dry-run migracji:**
```bash
php artisan migrate --pretend
```

**6. Sprawdź output, jeśli OK → wykonaj:**
```bash
php artisan migrate --force
```

**7. Weryfikacja:**
```bash
# Sprawdź nowe tabele
mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -e "SHOW TABLES LIKE 'voucher%';"

# Sprawdź czy stare dane OK
php artisan tinker --execute="echo 'Pakiety: ' . App\Models\Package::count();"
```

**8. Wyłącz maintenance:**
```bash
php artisan up
```

**9. Test w przeglądarce:**
- Otwórz: `https://panel.termygorce.pl/packages`
- Sprawdź czy wszystko działa

**✅ Gotowe! Masz backup z dokładnie sprzed migracji.**

---

## ⏰ Backup automatyczny vs ręczny

| Typ | Częstotliwość | Cel | Retencja |
|-----|---------------|-----|----------|
| **Automatyczny** | Co noc o 3:00 | Codzienna ochrona | 30 dni |
| **Ręczny** | Przed migracją | Precyzyjny punkt przywracania | 30 dni* |

**\* Ręczny backup też podlega 30-dniowej retencji** (chyba że zmienisz nazwę pliku)

### Czy ręczny backup wpływa na automatyczny?

**NIE!** ✅ Oba działają niezależnie:

```
storage/backups/
├─ db_backup_20251027_030000.sql.gpg  ← Automatyczny (3:00)
├─ db_backup_20251027_143500.sql.gpg  ← Ręczny #1 (14:35)
├─ db_backup_20251027_203015.sql.gpg  ← Ręczny #2 (20:30)
└─ db_backup_20251028_030000.sql.gpg  ← Automatyczny (kolejny dzień)
```

**Wszystkie backupy współistnieją!** 🎉

---

## 💡 Jak zachować backup na dłużej niż 30 dni?

### Metoda 1: Zmień nazwę pliku

```bash
cd storage/backups

# Backup z opisową nazwą (nie zostanie auto-usunięty)
cp db_backup_20251027_143500.sql.gpg BEFORE_VOUCHERS_MIGRATION_20251027.sql.gpg

# Teraz masz:
# - db_backup_20251027_143500.sql.gpg (usunięty po 30 dniach)
# - BEFORE_VOUCHERS_MIGRATION_20251027.sql.gpg (zostanie na zawsze)
```

### Metoda 2: Pobierz na lokalny komputer

**Przez WinSCP:**
1. Prawy panel → `storage/backups/`
2. Prawy klik na plik → **Download**
3. Zapisz na dysku: `F:\Backups\TermyGorce\`

**Przez SCP (terminal):**
```bash
# Z lokalnego komputera (Git Bash)
scp mongaw@s46.zenbox.pl:/domains/panel.termygorce.pl/public_html/storage/backups/db_backup_20251027_143500.sql.gpg F:/Backups/
```

**⚠️ Przechowuj lokalnie w bezpiecznym miejscu!** (zaszyfrowany dysk, cloud backup)

---

## ❓ FAQ - Najczęstsze pytania

**Q: Ile czasu trwa backup?**
A: ~5-10 sekund (MySQL dump + szyfrowanie GPG).

**Q: Czy backup blokuje aplikację?**
A: NIE! `mysqldump` robi snapshot bez lockowania. Użytkownicy mogą normalnie korzystać.

**Q: Ile miejsca zajmuje backup?**
A: ~2 MB dla ~1000 pakietów (zaszyfrowany i skompresowany).

**Q: Czy mogę wywołać backup wiele razy dziennie?**
A: TAK! Nie ma limitu. Każdy backup to osobny plik.

**Q: Co jeśli zapomniałem zrobić backup przed migracją?**
A: Masz automatyczny backup z ostatniej nocy (max 24h utraty danych). Lepiej późno niż wcale!

**Q: Jak przywrócić backup?**
A: Uruchom: `bash scripts/restore-database-universal.sh` (interaktywny wybór backupu). Szczegóły w [DISASTER_RECOVERY_TEST.md](DISASTER_RECOVERY_TEST.md).

**Q: Czy mogę testować backup lokalnie?**
A: TAK! Użyj Sposobu 3 (Docker) - backup lokalnej bazy SQLite.

**Q: Co jeśli backup pokazuje błąd "BACKUP_PASSWORD not set"?**
A: Sprawdź `.env`: `grep BACKUP_PASSWORD .env`. Jeśli brak → dodaj: `BACKUP_PASSWORD=TwojeHaslo`.

---

## 🚨 Troubleshooting

### Problem 1: Backup się nie wykonuje

**Symptom:**
```
bash: scripts/backup-database-universal.sh: No such file or directory
```

**Rozwiązanie:**
```bash
# Sprawdź czy jesteś we właściwym katalogu
pwd
# Powinno być: /domains/panel.termygorce.pl/public_html

# Sprawdź czy skrypt istnieje
ls -la scripts/backup-database-universal.sh

# Jeśli brak - upload skrypt przez WinSCP
```

---

### Problem 2: Brak uprawnień do wykonania

**Symptom:**
```
Permission denied
```

**Rozwiązanie:**
```bash
chmod +x scripts/backup-database-universal.sh
chmod +x scripts/restore-database-universal.sh
```

---

### Problem 3: Backup ma rozmiar 0 KB

**Symptom:**
```bash
ls -lh storage/backups/db_backup_*.gpg
-rw-r--r-- 1 mongaw mongaw 0 Oct 27 14:35 db_backup_20251027_143500.sql.gpg
```

**Rozwiązanie:**
```bash
# Sprawdź logi
tail -50 storage/logs/backup.log

# Sprawdź czy MySQL credentials są poprawne w .env
grep DB_ .env

# Sprawdź czy mysqldump jest dostępny
which mysqldump
```

---

### Problem 4: GPG nie działa

**Symptom:**
```
gpg: command not found
```

**Rozwiązanie:**
```bash
# Zainstaluj GPG (na serwerze)
# Dla Ubuntu/Debian:
sudo apt-get install gnupg

# Dla CentOS/RHEL:
sudo yum install gnupg2
```

---

## 📚 Powiązane dokumenty

- **[BACKUP_PRODUCTION.md](BACKUP_PRODUCTION.md)** - Pełny przewodnik backupów MySQL
- **[DISASTER_RECOVERY_TEST.md](DISASTER_RECOVERY_TEST.md)** - Test restore backupu
- **[scripts/README.md](scripts/README.md)** - Dokumentacja wszystkich skryptów
- **[task.md](task.md)** - Deployment checklist (FAZA 6 - backupy)

---

## ✅ Checklist - Ręczny backup przed deployment

```
PRZED migracją na produkcji:

- [ ] Połączyłem się z serwerem (SSH/WinSCP)
- [ ] Jestem w katalogu aplikacji (pwd)
- [ ] Wykonałem backup ręczny (BACKUP_PASSWORD="..." bash scripts/...)
- [ ] Sprawdziłem że backup powstał (ls -lh storage/backups/)
- [ ] Rozmiar backupu > 0 KB
- [ ] Zapisałem nazwę backupu (deployment_history.txt)
- [ ] Hasło BACKUP_PASSWORD jest w menedżerze haseł
- [ ] Gotowy do migracji! ✅
```

---

## 🎯 Quick Reference Card

### 📋 Copy-Paste Commands

**Produkcja - pełny workflow:**
```bash
ssh mongaw@s46.zenbox.pl
cd /domains/panel.termygorce.pl/public_html
BACKUP_PASSWORD="${BACKUP_PASSWORD}" bash scripts/backup-database-universal.sh
ls -lh storage/backups/ | tail -1
```

**Testowe - pełny workflow:**
```bash
ssh mongaw@s46.zenbox.pl
cd /domains/tg.stronazen.pl/public_html/admin
BACKUP_PASSWORD="${BACKUP_PASSWORD}" bash scripts/backup-database-universal.sh
ls -lh storage/backups/ | tail -1
```

**Lokalnie (Docker):**
```bash
docker exec platformapakiety-laravel.test-1 bash -c "cd /var/www/html && BACKUP_PASSWORD=\${BACKUP_PASSWORD} bash scripts/backup-database-universal.sh"
```

---

**Ostatnia aktualizacja:** 2025-10-27
**Wersja:** 1.0
**Autor:** Zespół deweloperski TermyGórce

**Pamiętaj:** Backup to 10 sekund, odzyskanie danych bez backupu to czasem niemożliwe. Zawsze rób backup przed ważnymi zmianami! 🛡️
