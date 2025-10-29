# 🚀 Przewodnik Deployment na Produkcję - Platforma Pakiety

**Data ostatniej aktualizacji:** 2025-10-28
**Testowa produkcja:** `admin.tg.stronazen.pl` - ✅ SUKCES
**Rzeczywista produkcja:** (do uzupełnienia jutro)

---

## 📋 CHECKLIST PRZED DEPLOYMENT

### 1. Przygotowanie lokalne
- [ ] `npm run build` - zbuduj frontend (sprawdź czy 0 błędów)
- [ ] Upewnij się że `public/build/.vite/manifest.json` istnieje (10-11KB)
- [ ] Sprawdź czy lokalnie wszystko działa w Docker
- [ ] **NIE kopiuj** `public/hot` - to plik development!

### 2. Backup serwera produkcyjnego
- [ ] Backup plików (cały katalog `public_html/admin/`)
- [ ] Backup bazy MySQL (przez phpMyAdmin lub mysqldump)
- [ ] Zapisz backup `.env` (WAŻNE: będzie potrzebny później!)

### 3. Dostęp do serwera
- [ ] WinSCP połączenie działa (SSH key + hasło)
- [ ] Zapamiętaj: Host `s46.zenbox.pl`, Port `22`, User `mongaw`
- [ ] Terminal SSH otwarty i gotowy

---

## 🎯 KROKI DEPLOYMENT (KROK PO KROKU)

### KROK 1: Upload plików przez WinSCP

**Katalog docelowy:**
```
/home/mongaw/domains/tg.stronazen.pl/public_html/admin/
```

**Co wgrywać:**
- ✅ `app/` - wszystkie pliki
- ✅ `public/build/` - zbudowane assety (WAŻNE!)
- ✅ `resources/` - wszystkie pliki
- ✅ `routes/` - wszystkie pliki
- ✅ `database/` - migracje i seedery
- ✅ `composer.json`, `composer.lock`
- ✅ `package.json`, `package-lock.json`

**Czego NIE wgrywać:**
- ❌ `public/hot` - usuń jeśli istnieje!
- ❌ `node_modules/` - będzie zainstalowany w kontenerze
- ❌ `vendor/` - jeśli już istnieje na serwerze
- ❌ `.env` - **ZACHOWAJ STARY PRODUKCYJNY** (zobacz KROK 2!)
- ❌ `storage/logs/` - zachowaj stare logi
- ❌ `database/database.sqlite` - produkcja używa MySQL

---

### KROK 2: ⚠️ KRYTYCZNE - Zarządzanie .env

**❌ NIE TWÓRZ NOWEGO .env!**
**✅ UŻYJ ISTNIEJĄCEGO PRODUKCYJNEGO .env**

#### Dlaczego?
Produkcyjny `.env` zawiera:
- Hasła do bazy MySQL (nie znasz ich!)
- `APP_KEY` (zmiana = utrata sesji użytkowników)
- Konfigurację email/SMS
- Inne ustawienia produkcyjne

#### Co sprawdzić/zmienić w produkcyjnym .env:

```bash
# Przez terminal SSH - sprawdź plik .env
cd /home/mongaw/domains/tg.stronazen.pl/public_html/admin
cat .env
```

**Wymagane ustawienia:**
```env
APP_ENV=production          # MUSI być production!
APP_DEBUG=false             # MUSI być false!
APP_URL=https://admin.tg.stronazen.pl

APP_TIMEZONE=Europe/Warsaw  # Dodaj jeśli nie ma

DB_CONNECTION=mysql         # NIE sqlite!
DB_HOST=localhost
DB_DATABASE=mongaw_e2o91    # Nazwa bazy produkcyjnej
DB_USERNAME=mongaw_e2o91    # User produkcyjny
DB_PASSWORD=***             # Hasło produkcyjne (NIE ZMIENIAJ!)
```

#### Jak edytować .env na serwerze:

**Opcja A: Przez WinSCP (łatwiejsze)**
1. Znajdź `.env` w głównym katalogu (prawy panel)
2. Prawy klik → **Edit**
3. Zmień potrzebne wartości
4. Zapisz (Ctrl+S)

**Opcja B: Przez terminal SSH**
```bash
nano /home/mongaw/domains/tg.stronazen.pl/public_html/admin/.env
# Edytuj, potem: Ctrl+O (save), Ctrl+X (exit)
```

---

### KROK 3: Fix manifest.json (KRYTYCZNE!)

**Problem:** Laravel szuka `public/build/manifest.json`, ale Vite tworzy `public/build/.vite/manifest.json`

**Rozwiązanie:**
```bash
cd /home/mongaw/domains/tg.stronazen.pl/public_html/admin
cp public/build/.vite/manifest.json public/build/manifest.json
echo "✅ manifest.json skopiowany!"
```

**Sprawdź:**
```bash
ls -lh public/build/manifest.json
# Powinien pokazać ~10-11KB, data dzisiejsza
```

---

### KROK 4: ⚠️ KRYTYCZNE - Usuń public/hot

**Problem:** Jeśli `public/hot` istnieje, Laravel myśli że jest development mode i próbuje łączyć się z `localhost:5173`!

**Rozwiązanie:**
```bash
cd /home/mongaw/domains/tg.stronazen.pl/public_html/admin
rm -f public/hot
echo "✅ public/hot usunięty!"
```

**Sprawdź czy usunięty:**
```bash
ls -la public/hot 2>&1 | grep "cannot access" && echo "✅ OK" || echo "❌ BŁĄD - plik nadal istnieje!"
```

---

### KROK 5: PHP 8.3 - Sprawdź wersję

Laravel 11 wymaga PHP 8.2+

**Sprawdź wersję CLI:**
```bash
php -v
# Jeśli pokazuje 8.1.x - użyj pełnej ścieżki:
/opt/alt/php83/usr/bin/php -v
```

**Dla Zenbox:** Ustaw PHP 8.3 w panelu dla domeny (Zenbox → Domeny → admin.tg.stronazen.pl → Ustawienia PHP)

**Używaj pełnej ścieżki w komendach:**
```bash
/opt/alt/php83/usr/bin/php artisan migrate
```

---

### KROK 6: Uruchom migracje bazy danych

```bash
cd /home/mongaw/domains/tg.stronazen.pl/public_html/admin

# Uruchom migracje
/opt/alt/php83/usr/bin/php artisan migrate --force

# Powinieneś zobaczyć:
# ✓ 2024_12_22_203832_create_alerts_table
# ✓ 2024_12_22_211130_create_traffic_table
# ✓ [16 migracji pakietów]
```

**Jeśli błąd "already exists":**
```bash
# To OK - tabela już istnieje, pomiń
```

---

### KROK 7: Wypełnij usługi pakietów (SEEDER)

**WAŻNE:** Bez tego pakiety będą puste!

```bash
cd /home/mongaw/domains/tg.stronazen.pl/public_html/admin

# Uruchom seeder (23 usługi + mapowania)
/opt/alt/php83/usr/bin/php artisan db:seed --class=RealPackageServicesSeeder --force

# Powinieneś zobaczyć:
# ✅ Seeded 23 real package services
# ✅ Seeded package_type_services for all 6 package types
```

**Sprawdź czy zadziałało:**
```bash
mysql -u [USER] -p'[HASŁO]' [BAZA] -e "SELECT COUNT(*) as total FROM package_services;"
# Powinno pokazać: total = 23

mysql -u [USER] -p'[HASŁO]' [BAZA] -e "SELECT COUNT(*) as total FROM package_type_services;"
# Powinno pokazać: total = 35
```

---

### KROK 8: Wyczyść cache Laravel

```bash
cd /home/mongaw/domains/tg.stronazen.pl/public_html/admin

# Wyczyść WSZYSTKIE cache
/opt/alt/php83/usr/bin/php artisan config:clear
/opt/alt/php83/usr/bin/php artisan route:clear
/opt/alt/php83/usr/bin/php artisan view:clear
/opt/alt/php83/usr/bin/php artisan cache:clear

# Usuń fizyczne pliki cache
rm -f bootstrap/cache/*.php
rm -rf storage/framework/views/*

echo "✅ Cache wyczyszczony!"
```

---

### KROK 9: Ustaw polską strefę czasową

```bash
cd /home/mongaw/domains/tg.stronazen.pl/public_html/admin

# Dodaj/zmień APP_TIMEZONE w .env
sed -i 's/APP_TIMEZONE=.*/APP_TIMEZONE=Europe\/Warsaw/' .env || echo "APP_TIMEZONE=Europe/Warsaw" >> .env

# Wyczyść cache
/opt/alt/php83/usr/bin/php artisan config:clear

echo "✅ Strefa czasowa: Europe/Warsaw"
```

---

### KROK 10: Test aplikacji

1. **Otwórz stronę w przeglądarce:**
   ```
   https://admin.tg.stronazen.pl
   ```

2. **Zaloguj się** (użyj istniejącego konta)

3. **Test funkcjonalności:**
   - [ ] Dashboard się ładuje
   - [ ] Zakładka "Pakiety" działa
   - [ ] "Dodaj nowy pakiet" → wybierz typ 1, dodaj
   - [ ] Pakiet ma usługi (NIE jest pusty!)
   - [ ] Zaznacz usługę jako wykorzystaną
   - [ ] Historia pakietu pokazuje akcje (utworzenie, zaznaczenie)
   - [ ] "Pobierz PDF" generuje plik
   - [ ] Godziny w historii są polskie (nie UTC)

4. **Sprawdź logi błędów:**
   ```bash
   tail -50 storage/logs/laravel.log
   # Nie powinno być ERROR związanych z packages
   ```

---

## 🐛 TROUBLESHOOTING - Rozwiązania problemów

### Problem 1: Biały ekran (ERR_CONNECTION_REFUSED localhost:5173)

**Przyczyna:** Plik `public/hot` istnieje
**Objawy:** Konsola przeglądarki pokazuje błędy połączenia z `localhost:5173`

**Rozwiązanie:**
```bash
cd /home/mongaw/domains/tg.stronazen.pl/public_html/admin
rm -f public/hot
# Odśwież przeglądarkę (Ctrl+Shift+R)
```

---

### Problem 2: Błąd 500 - "Vite manifest not found"

**Przyczyna:** Brak `public/build/manifest.json`
**Objawy:** Strona pokazuje błąd 500, logi mówią "ViteManifestNotFoundException"

**Rozwiązanie:**
```bash
cd /home/mongaw/domains/tg.stronazen.pl/public_html/admin
cp public/build/.vite/manifest.json public/build/manifest.json
ls -lh public/build/manifest.json  # Sprawdź czy ~10KB
```

---

### Problem 3: Pakiety bez usług (puste)

**Przyczyna:** Nie uruchomiono seedera
**Objawy:** Dodany pakiet nie ma żadnych usług w środku

**Rozwiązanie:**
```bash
cd /home/mongaw/domains/tg.stronazen.pl/public_html/admin

# Uruchom seeder
/opt/alt/php83/usr/bin/php artisan db:seed --class=RealPackageServicesSeeder --force

# Usuń stary pusty pakiet
mysql -u [USER] -p'[HASŁO]' [BAZA] -e "DELETE FROM packages WHERE id = [ID_PUSTEGO_PAKIETU];"

# Dodaj nowy pakiet przez stronę - teraz będzie miał usługi!
```

---

### Problem 4: Historia pakietów nie zapisuje akcji

**Przyczyna:** Błąd SQL - składnia PostgreSQL w MySQL
**Objawy:** Logi pokazują "Syntax error... details->>'service_name'"

**Rozwiązanie:** ✅ **JUŻ NAPRAWIONE w kodzie!**

Kod używa teraz uniwersalnej składni:
```php
->where('details->service_name', $value)  // Działa z MySQL i SQLite
```

**Jeśli mimo to nie działa:**
```bash
# Sprawdź logi
grep "Failed to log" storage/logs/laravel.log | tail -10

# Jeśli widzisz błędy whereRaw - wymień plik kontrolera:
# Wgraj świeży PackageServiceUsageController.php z F:\Windsurf\PlatformaPakiety\
```

---

### Problem 5: Niepoprawna godzina w historii (UTC zamiast PL)

**Przyczyna:** Brak `APP_TIMEZONE=Europe/Warsaw` w `.env`
**Objawy:** Historia pokazuje czas 2 godziny w tył

**Rozwiązanie:**
```bash
cd /home/mongaw/domains/tg.stronazen.pl/public_html/admin

# Dodaj timezone do .env
echo "APP_TIMEZONE=Europe/Warsaw" >> .env

# Wyczyść cache
/opt/alt/php83/usr/bin/php artisan config:clear
```

---

### Problem 6: Błąd "Composer dependencies require PHP >= 8.2"

**Przyczyna:** Serwer używa PHP 8.1 CLI
**Objawy:** Nie możesz uruchomić `php artisan ...`

**Rozwiązanie:**
```bash
# Zawsze używaj pełnej ścieżki do PHP 8.3:
/opt/alt/php83/usr/bin/php artisan migrate

# Lub ustaw alias w ~/.bashrc (opcjonalne):
alias php83='/opt/alt/php83/usr/bin/php'
# Potem: php83 artisan migrate
```

---

### Problem 7: Błąd "Column 'enabled' cannot be null" (tabela alerts)

**Przyczyna:** Stare dane w tabeli `alerts` niezgodne z nowym schema
**Objawy:** Nie możesz zapisać alertu, błąd 500

**Rozwiązanie:**
```bash
# Wyczyść tabelę alerts
mysql -u [USER] -p'[HASŁO]' [BAZA] -e "TRUNCATE TABLE alerts;"
```

---

## 📁 Pliki które MUSISZ wymienić/sprawdzić

### Kontrolery (zawierają fix dla MySQL)
- ✅ `app/Http/Controllers/PackageServiceUsageController.php` - fix whereRaw
- ✅ `app/Http/Controllers/PackageController.php` - logging

### Assety frontend
- ✅ `public/build/` - cały katalog z buildu
- ✅ `public/build/.vite/manifest.json` - musi istnieć
- ✅ `public/build/manifest.json` - **SKOPIUJ z .vite/**

### Seeder
- ✅ `database/seeders/RealPackageServicesSeeder.php` - 23 usługi + mapowania

### Migracje
- ✅ Wszystkie pliki `database/migrations/2024_*_create_package*.php`

---

## 🔒 .env - Template dla produkcji

**⚠️ UWAGA: Używaj ISTNIEJĄCEGO produkcyjnego .env!**
To tylko szablon do sprawdzenia co powinno być:

```env
# === PODSTAWOWE ===
APP_NAME='Panel :: Termy Gorce'
APP_ENV=production                    # MUSI BYĆ production!
APP_KEY=base64:***                    # NIE ZMIENIAJ istniejącego!
APP_DEBUG=false                       # MUSI BYĆ false!
APP_TIMEZONE=Europe/Warsaw            # Dodaj jeśli nie ma
APP_URL=https://admin.tg.stronazen.pl

# === BAZA DANYCH (NIE ZMIENIAJ!) ===
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=mongaw_e2o91              # Nazwa z panelu
DB_USERNAME=mongaw_e2o91              # User z panelu
DB_PASSWORD=***                       # Hasło z panelu - NIE ZMIENIAJ!

# === SESJE ===
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true

# === POZOSTAŁE (sprawdź czy są) ===
BROADCAST_DRIVER=log
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
```

---

## ✅ CHECKLIST PO DEPLOYMENT

### Funkcjonalność
- [ ] Dashboard ładuje się poprawnie
- [ ] Stare funkcje działają (Alerty, Traffic)
- [ ] Lista pakietów wyświetla się
- [ ] Można dodać nowy pakiet
- [ ] Nowy pakiet ma usługi (nie jest pusty)
- [ ] Można zaznaczać/odznaczać usługi
- [ ] Historia pakietu zapisuje akcje
- [ ] PDF się generuje i pobiera
- [ ] Godziny są polskie (Europe/Warsaw)

### Bezpieczeństwo
- [ ] `APP_ENV=production` w `.env`
- [ ] `APP_DEBUG=false` w `.env`
- [ ] `public/hot` NIE ISTNIEJE
- [ ] Logi nie pokazują wrażliwych danych

### Performance
- [ ] Cache wyczyszczony
- [ ] Strona ładuje się szybko (<2s)
- [ ] Nie ma błędów w konsoli przeglądarki

---

## 📞 Kontakt w razie problemów

**Jeśli coś nie działa:**

1. **Sprawdź logi Laravel:**
   ```bash
   tail -100 storage/logs/laravel.log
   ```

2. **Sprawdź logi przeglądarki:**
   - F12 → Console (szukaj błędów czerwonych)
   - F12 → Network (szukaj 500/404)

3. **Sprawdź .env:**
   ```bash
   cat .env | grep -E "(APP_ENV|APP_DEBUG|DB_)"
   ```

4. **Wyczyść cache ponownie:**
   ```bash
   /opt/alt/php83/usr/bin/php artisan config:clear
   /opt/alt/php83/usr/bin/php artisan cache:clear
   ```

---

## 🎯 QUICK COMMANDS - Kopia-wklej

```bash
# DEPLOYMENT W 10 KOMENDACH (po wgraniu plików przez WinSCP)

cd /home/mongaw/domains/tg.stronazen.pl/public_html/admin

# 1. Usuń public/hot
rm -f public/hot

# 2. Skopiuj manifest.json
cp public/build/.vite/manifest.json public/build/manifest.json

# 3. Sprawdź .env (APP_ENV=production, APP_DEBUG=false)
grep -E "(APP_ENV|APP_DEBUG)" .env

# 4. Dodaj timezone
echo "APP_TIMEZONE=Europe/Warsaw" >> .env

# 5. Migracje
/opt/alt/php83/usr/bin/php artisan migrate --force

# 6. Seeder usług
/opt/alt/php83/usr/bin/php artisan db:seed --class=RealPackageServicesSeeder --force

# 7-10. Wyczyść cache
/opt/alt/php83/usr/bin/php artisan config:clear
/opt/alt/php83/usr/bin/php artisan route:clear
/opt/alt/php83/usr/bin/php artisan view:clear
/opt/alt/php83/usr/bin/php artisan cache:clear

echo "✅ DEPLOYMENT ZAKOŃCZONY - Testuj aplikację!"
```

---

## 📝 Notatki z testowego deployment (2025-10-28)

**Co poszło nie tak (i jak naprawiliśmy):**

1. ❌ `public/hot` skopiowany z development → ✅ usunięty
2. ❌ `manifest.json` w złej lokalizacji → ✅ skopiowany do `public/build/`
3. ❌ PostgreSQL syntax w whereRaw → ✅ zmieniony na `->where('details->service_name')`
4. ❌ Brak usług w pakietach → ✅ uruchomiony RealPackageServicesSeeder
5. ❌ UTC timezone → ✅ ustawiony Europe/Warsaw

**Czas deployment:** ~45 minut (z troubleshootingiem)
**Rezultat:** 100% funkcjonalność działa! 🎉

---

## 💾 BACKUPY BAZY DANYCH - Automatyczna konfiguracja

**Status:** ✅ Przetestowane na `admin.tg.stronazen.pl`
**Data:** 2025-10-29

### Przegląd systemu backupów

Po deployment musimy skonfigurować **automatyczne backupy MySQL**:
- **Częstotliwość:** Codziennie o 3:00 w nocy
- **Typ:** MySQL dump + szyfrowanie GPG (AES-256)
- **Retencja:** 30 dni (stare automatycznie usuwane)
- **Lokalizacja:** `storage/backups/db_backup_YYYYMMDD_HHMMSS.sql.gpg`

---

### KROK 11: Konfiguracja automatycznych backupów (PO DEPLOYMENT)

**⚠️ WAŻNE:** Wykonaj to **TYLKO RAZ** po pierwszym deployment!

#### 1. Dodaj BACKUP_PASSWORD do .env

**Otwórz `.env` przez WinSCP** (Edit) i dodaj na końcu:

```env
BACKUP_PASSWORD=TwojeSilneHasloDoBackupow2025
```

**Przykład dobrego hasła:**
```env
BACKUP_PASSWORD=TermyGorce2025BackupSecure!PL
```

**⚠️ Zapisz to hasło w bezpiecznym miejscu** (LastPass, 1Password) - będzie potrzebne do restore!

---

#### 2. Nadaj uprawnienia wykonywania skryptowi

```bash
cd /home/mongaw/domains/[TWOJA_DOMENA]/public_html/admin
chmod +x scripts/backup-database-universal.sh
chmod +x scripts/restore-database-universal.sh
```

---

#### 3. Test ręczny backup

```bash
cd /home/mongaw/domains/[TWOJA_DOMENA]/public_html/admin
bash scripts/backup-database-universal.sh
```

**Powinno pokazać:**
```
✅ Backup completed successfully!
Encrypted file: db_backup_20251029_XXXXXX.sql.gpg
```

**Sprawdź czy backup powstał:**
```bash
ls -lh storage/backups/*.sql.gpg
```

---

#### 4. Skonfiguruj cron (automatyczne backupy)

**Komenda - Dodaj cron (raz):**
```bash
crontab -r  # Wyczyść stare (jeśli były)
(echo "0 3 * * * cd /home/mongaw/domains/[TWOJA_DOMENA]/public_html/admin && bash scripts/backup-database-universal.sh >> storage/logs/backup.log 2>&1") | crontab -
```

**⚠️ ZAMIEŃ `[TWOJA_DOMENA]` na rzeczywistą domenę!**

Przykład:
```bash
(echo "0 3 * * * cd /home/mongaw/domains/admin.produkcja.pl/public_html/admin && bash scripts/backup-database-universal.sh >> storage/logs/backup.log 2>&1") | crontab -
```

**Sprawdź czy cron został dodany:**
```bash
crontab -l | grep backup
```

Powinno pokazać **TYLKO 1 linię** (nie duplikat):
```
0 3 * * * cd /home/mongaw/domains/.../admin && bash scripts/backup-database-universal.sh >> storage/logs/backup.log 2>&1
```

---

#### 5. Sprawdź logi backupów (następnego dnia)

```bash
tail -50 storage/logs/backup.log
```

Jeśli backup działał poprawnie, zobaczysz:
```
[2025-10-30 03:00:XX] Backup completed successfully!
```

---

### 🔄 Jak przywrócić backup (RESTORE)

**⚠️ UWAGA:** Restore **ZASTĘPUJE CAŁĄ BAZĘ DANYCH** - używaj ostrożnie!

#### Scenariusz 1: Interaktywny restore (wybierz z listy)

```bash
cd /home/mongaw/domains/[TWOJA_DOMENA]/public_html/admin
bash scripts/restore-database-universal.sh
```

Pokaże listę backupów:
```
Available backups:
1) db_backup_20251029_030000.sql.gpg
2) db_backup_20251028_030000.sql.gpg
3) db_backup_20251027_030000.sql.gpg

Enter number of backup to restore (or 'q' to quit):
```

Wpisz **numer** (np. `1`) i potwierdź `yes`.

---

#### Scenariusz 2: Restore konkretnego backupu

```bash
cd /home/mongaw/domains/[TWOJA_DOMENA]/public_html/admin
bash scripts/restore-database-universal.sh storage/backups/db_backup_20251029_030000.sql.gpg
```

Wpisz `yes` aby potwierdzić.

---

### 📋 Checklist backupów (po deployment)

- [ ] BACKUP_PASSWORD dodane do `.env`
- [ ] Skrypty backup/restore mają uprawnienia `chmod +x`
- [ ] Test ręczny backup działa (powstaje plik `.sql.gpg`)
- [ ] Cron skonfigurowany (`crontab -l` pokazuje backup)
- [ ] Test restore działa (na kopii bazy!)
- [ ] Hasło BACKUP_PASSWORD zapisane w menedżerze haseł

---

### 🐛 Troubleshooting backupów

#### Problem: "BACKUP_PASSWORD environment variable is not set"

**Rozwiązanie:**
1. Sprawdź czy `BACKUP_PASSWORD` jest w `.env`:
   ```bash
   grep BACKUP_PASSWORD .env
   ```
2. Jeśli brak - dodaj do `.env` i zapisz

---

#### Problem: "mysqldump: command not found"

**Rozwiązanie:**
```bash
# Sprawdź czy mysqldump jest zainstalowany
which mysqldump

# Jeśli nie - zainstaluj (skontaktuj się z adminem serwera)
```

Na Zenbox hosting mysqldump powinien być dostępny domyślnie.

---

#### Problem: Cron uruchamia backup 2 razy

**Rozwiązanie:**
```bash
# Wyczyść duplikaty
crontab -l | sort -u | crontab -

# Sprawdź czy jest tylko 1 wpis
crontab -l | grep backup
```

---

#### Problem: Backup się tworzy, ale restore nie działa

**Przyczyna:** Złe hasło lub uszkodzony plik

**Rozwiązanie:**
```bash
# Test deszyfrowania (bez restore)
cd storage/backups
gpg --decrypt db_backup_20251029_XXXXXX.sql.gpg > /tmp/test.sql

# Jeśli błąd "Bad session key" - złe hasło!
# Jeśli OK - plik jest poprawny
```

---

### 📁 Co zawiera backup?

**Backup MySQL zawiera:**
- ✅ Wszystkie tabele (packages, users, alerts, traffic, etc.)
- ✅ Wszystkie dane (pakiety, usługi, logi, użytkownicy)
- ✅ Strukturę bazy (CREATE TABLE statements)
- ✅ Triggery i procedury (jeśli są)

**Backup NIE zawiera:**
- ❌ Plików (zdjęcia, PDF) - używaj backup plików osobno
- ❌ Kodu aplikacji - kod jest w Git/FTP
- ❌ Konfiguracji `.env` - backup osobno!

---

### 💡 Best Practices

1. **Test restore co miesiąc** - upewnij się że backupy działają!
2. **Backup .env osobno** - ręcznie skopiuj przez WinSCP
3. **Eksportuj backupy do chmury** - Google Drive, Dropbox (co tydzień)
4. **Monitoruj logi** - sprawdzaj `storage/logs/backup.log`
5. **Zatrzymaj cron przed dużymi zmianami** - `crontab -r` przed migracją

---

### 🔐 Bezpieczeństwo backupów

**Backupy są chronione:**
- 🔒 Szyfrowanie GPG AES-256 (militarny standard)
- 🔒 Hasło wymagane do odczytu
- 🔒 Przechowywane lokalnie na serwerze (brak wysyłania)

**Bez BACKUP_PASSWORD:**
- ❌ Nikt nie może otworzyć backupu
- ❌ Nawet z dostępem do serwera backup jest bezużyteczny

**⚠️ Dlatego:**
- Zapisz BACKUP_PASSWORD w bezpiecznym miejscu!
- Jeśli zgubisz hasło - backupy są nieodwracalnie zaszyfrowane!

---

**POWODZENIA W JUTRZEJSZYM RZECZYWISTYM DEPLOYMENT!** 🚀

Jeśli napotkasz problem którego nie ma w tym dokumencie - sprawdź logi i działaj logicznie:
1. Błąd 500? → Sprawdź `storage/logs/laravel.log`
2. Biały ekran? → Sprawdź konsolę przeglądarki (F12)
3. Nie działa funkcja? → Sprawdź czy plik kontrolera jest świeży
4. Problem z bazą? → Sprawdź `.env` i połączenie MySQL

**Nie panikuj - wszystkie problemy mają rozwiązanie!** 💪
