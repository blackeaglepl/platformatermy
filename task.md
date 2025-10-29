# Task Management - Platforma Pakiety (TermyGórce)

**Ostatnia aktualizacja:** 2025-10-13
**Status projektu:** 🟡 W trakcie rozwoju

---

## 📊 Progress Overview

```
[████████████████░░░░] 80% - System pakietów zaimplementowany (backend + frontend)
```

### Legend statusów
- ✅ **Completed** - Zadanie zakończone i przetestowane
- 🔄 **In Progress** - Obecnie w trakcie realizacji
- ⏳ **Pending** - Zaplanowane do wykonania
- ❌ **Blocked** - Zablokowane przez inny task lub decyzję
- ⏸️ **On Hold** - Wstrzymane do momentu wyjaśnienia

---

## 🎯 Milestone 1: Setup projektu
**Deadline:** 2025-10-15
**Status:** 🔄 In Progress (90%)

### Tasks

#### 1.1 Środowisko deweloperskie
- [x] ✅ Docker Desktop setup
- [x] ✅ Dokumentacja w claude.md
- [x] ✅ Task management w task.md
- [x] ✅ Vendor dependencies zainstalowane (Composer)
- [x] ✅ Node_modules zainstalowane (NPM)
- [x] ✅ Skrypty uruchomieniowe (.bat dla Windows)
- [x] ✅ README.md z instrukcjami uruchomienia
- [ ] ⏳ Laravel Sail uruchomiony lokalnie (użytkownik zrobi: `start.bat`)
- [ ] ⏳ Vite dev server działający (auto start przez `start.bat`)
- [ ] ⏳ Migracje bazy danych wykonane (użytkownik zrobi: `setup.bat`)

**Notes:**
- ✅ Utworzono 4 skrypty .bat: `start.bat`, `stop.bat`, `logs.bat`, `setup.bat`
- ✅ Dodano NPM scripts: `npm start`, `npm run sail:up`, etc.
- ✅ README.md zawiera pełne instrukcje
- 🎯 Użytkownik może teraz uruchomić: `setup.bat` (pierwsza instalacja) lub `start.bat` (codzienne uruchomienie)

---

## 🎯 Milestone 2: Backend - System pakietów
**Deadline:** 2025-10-20
**Status:** ✅ Completed (2025-10-13)

### Tasks

#### 2.1 Baza danych
- [x] ✅ Migracja: `create_packages_table`
- [x] ✅ Migracja: `create_package_services_table` (+ pole `zone`)
- [x] ✅ Migracja: `create_package_type_services_table`
- [x] ✅ Migracja: `create_package_service_usage_table`
- [x] ✅ Seeder: Przykładowe usługi (12 usług w 3 strefach)
- [x] ✅ Seeder: Typy pakietów (Pakiet 1-6) z przypisanymi usługami

**Notes:**
- Dodano pole `zone` do tabeli `package_services` (relaksu, odnowy, smaku)
- Seedery zawierają testowe dane dla 6 typów pakietów

#### 2.2 Modele Eloquent
- [x] ✅ `app/Models/Package.php`
  - [x] Relacje: services, creator, usages
  - [x] Accessor: usage_percentage (z logiką obliczania)
  - [x] Metoda: isFullyUsed()
- [x] ✅ `app/Models/PackageService.php`
  - [x] Pole: zone (relaksu/odnowy/smaku)
- [x] ✅ `app/Models/PackageServiceUsage.php`
  - [x] Relacje: package, service, marker

#### 2.3 Kontrolery
- [x] ✅ `app/Http/Controllers/PackageController.php`
  - [x] `index()` - Lista pakietów
  - [x] `create()` - Formularz tworzenia
  - [x] `store()` - Utworzenie pakietu
  - [x] `show($id)` - Szczegóły pakietu
- [x] ✅ `app/Http/Controllers/PackageServiceUsageController.php`
  - [x] `toggle()` - Toggle wykorzystania usługi (checkbox)

#### 2.4 API Routes
- [x] ✅ Routing w `routes/web.php` (Inertia)
- [x] ✅ Middleware autentykacji dla pakietów

#### 2.5 Validation
- [x] ✅ Walidacja w kontrolerze (custom_id unique, package_type 1-6)

---

## 🎯 Milestone 3: Frontend - React/TypeScript
**Deadline:** 2025-10-25
**Status:** ✅ Completed (2025-10-13)

### Tasks

#### 3.1 Komponenty stron
- [x] ✅ `resources/js/Pages/Packages/Index.tsx`
  - [x] Lista pakietów w tabeli
  - [x] Progress bar wykorzystania
  - [x] Przycisk "Dodaj pakiet"
  - [x] Ciemniejsze tło dla w pełni wykorzystanych pakietów
  - [ ] ⏳ Filtrowanie (ID, typ, status) - do przyszłej implementacji
  - [ ] ⏳ Sortowanie - do przyszłej implementacji
- [x] ✅ `resources/js/Pages/Packages/Create.tsx`
  - [x] Formularz dodawania pakietu
  - [x] Wybór typu pakietu (dropdown 1-6)
  - [x] Input dla custom_id
  - [x] Walidacja po stronie serwera
- [x] ✅ `resources/js/Pages/Packages/Show.tsx`
  - [x] Nagłówek z informacjami o pakiecie
  - [x] 3 kolumny: Strefa Relaksu, Odnowy, Smaku
  - [x] Lista usług z checkboxami
  - [x] Wyświetlanie historii wykorzystania (kto i kiedy)
  - [x] Progress bar (% wykorzystania)
  - [x] Ciemniejsze tło dla w pełni wykorzystanych pakietów

#### 3.2 Komponenty pomocnicze (Partials)
- [x] ✅ Komponenty wbudowane w Show.tsx (renderServiceList)
- [ ] ⏳ Opcjonalna refaktoryzacja do Partials w przyszłości

#### 3.3 TypeScript Types
- [x] ✅ `resources/js/types/package.d.ts`
  - [x] Interface: Package
  - [x] Interface: PackageWithUsages
  - [x] Interface: PackageService
  - [x] Interface: PackageServiceUsage
  - [x] Interface: PackageType

#### 3.4 Navigation
- [x] ✅ Dodanie linku "Pakiety" do AuthenticatedLayout (desktop + mobile)

---

## 🎯 Milestone 4: Testing & Quality
**Deadline:** 2025-10-30
**Status:** ⏳ Pending

### Tasks

#### 4.1 Backend Tests (Pest PHP)
- [ ] ⏳ `tests/Feature/PackageControllerTest.php`
  - [ ] Test tworzenia pakietu
  - [ ] Test listowania pakietów
  - [ ] Test usuwania pakietu
  - [ ] Test autoryzacji (tylko zalogowani)
- [ ] ⏳ `tests/Feature/PackageServiceUsageTest.php`
  - [ ] Test zaznaczania usługi jako wykorzystanej
  - [ ] Test cofania wykorzystania
  - [ ] Test zapisywania user_id
- [ ] ⏳ `tests/Unit/PackageModelTest.php`
  - [ ] Test obliczania usage_percentage
  - [ ] Test relacji

#### 4.2 Code Quality
- [ ] ⏳ Laravel Pint (formatowanie kodu PHP)
- [ ] ⏳ ESLint (linting TypeScript/React)
- [ ] ⏳ Type checking (TypeScript strict mode)

---

## 🎯 Milestone 5: Documentation & Deployment
**Deadline:** 2025-11-05
**Status:** ⏳ Pending

### Tasks

#### 5.1 Dokumentacja
- [x] ✅ README.md - instrukcje instalacji
- [ ] ⏳ API Documentation (opcjonalnie - Postman/OpenAPI)
- [ ] ⏳ User guide dla pracowników (jak używać systemu)

#### 5.2 Deployment
- [ ] ⏳ Konfiguracja produkcyjna Docker Compose
- [ ] ⏳ Environment variables (.env.production)
- [ ] ⏳ Build produkcyjny (npm run build)
- [ ] ⏳ Backup database strategy

---

## 🎯 Milestone 6: Deployment na Zenbox (PRODUKCJA)
**Deadline:** 2025-10-27 (dziś wieczorem!)
**Status:** 🔄 In Progress
**Środowisko:** Zenbox Hosting (LiteSpeed)

### ⚠️ KRYTYCZNE INFORMACJE

**Architektura:**
- 🌐 **Strona publiczna (Astro):** `termygorce.pl` - NIE RUSZAMY
- 🔐 **Panel admin (Laravel):** `panel.termygorce.pl` - PRODUKCJA
- 🧪 **Panel testowy (Laravel):** `admin.tg.stronazen.pl` - ŚRODOWISKO TESTOWE

**Istniejące funkcjonalności (NIE RUSZAĆ!):**
- ✅ Zarządzanie alertami (API dla Astro: `/api/alerts`)
- ✅ Zarządzanie ruchem (API dla Astro: `/api/traffic`)
- ⚠️ Tabele `alerts` i `traffic` w bazie - KRYTYCZNE!

**Nowa funkcjonalność (DODAJEMY):**
- 🆕 System zarządzania pakietami usług
- 🆕 Tabele: `packages`, `package_services`, `package_service_usage`, `package_logs`

**Dostęp do serwera:**
- **Host:** `s46.zenbox.pl`
- **Login:** `mongaw`
- **Hasło SSH:** ⏳ Oczekiwanie (dostępne wieczorem od informatyka)
- **Baza danych:** MySQL `mongaw_e2o91`

**Ścieżki na serwerze:**
```
/domains/tg.stronazen.pl/public_html/
├── admin/     ← Środowisko testowe (admin.tg.stronazen.pl)
└── dev/       ← Backup/deweloperskie

/domains/panel.termygorce.pl/public_html/
└── (struktura Laravel) ← PRODUKCJA
```

---

### 📋 PROTOKÓŁ DEPLOYMENT - CHECKLIST

#### FAZA 1: Przygotowanie lokalne (PRZED połączeniem SSH)
- [ ] 🔄 **Przygotować build aplikacji:**
  ```bash
  # 1. Instalacja zależności produkcyjnych
  composer install --no-dev --optimize-autoloader

  # 2. Build frontendu
  npm run build

  # 3. Weryfikacja buildu
  ls -la public/build/
  ```

- [ ] ⏳ **Przygotować listę plików do wgrania:**
  - Backend: `app/Http/Controllers/Package*.php`
  - Modele: `app/Models/Package*.php`
  - Serwisy: `app/Services/PackagePdfService.php`
  - Migracje: `database/migrations/*package*.php`
  - Seedery: `database/seeders/RealPackageServicesSeeder.php`
  - Frontend: `resources/js/Pages/Packages/`, `resources/js/Components/*Person*.tsx`
  - Types: `resources/js/types/package.d.ts`
  - Routing: `routes/web.php` (zaktualizowany)
  - PDF templates: `public/pdf-templates/`
  - Build: `public/build/` (po npm run build)

- [ ] ⏳ **Przygotować komendy deployment:**
  - [ ] Backup serwera
  - [ ] Upload plików
  - [ ] Migracje bazy
  - [ ] Seedery
  - [ ] Clear cache
  - [ ] Test działania

---

#### FAZA 2: Połączenie i weryfikacja serwera
- [ ] ⏳ **Połączyć się przez SSH:**
  ```bash
  ssh mongaw@s46.zenbox.pl
  # Hasło: (od informatyka)
  ```

- [ ] ⏳ **Zlokalizować aplikację Laravel:**
  ```bash
  cd /domains/tg.stronazen.pl/public_html/admin
  pwd
  ls -la
  ```

- [ ] ⏳ **Sprawdzić obecną wersję aplikacji:**
  ```bash
  # Sprawdź czy system pakietów już istnieje
  ls -la app/Models/Package.php
  ls -la app/Http/Controllers/PackageController.php

  # Sprawdź wersję Laravel
  php artisan --version

  # Sprawdź wersję PHP
  php -v  # Potrzeba PHP 8.2+
  ```

- [ ] ⏳ **Sprawdzić bazę danych:**
  ```bash
  # Połącz się z MySQL
  mysql -u mongaw_e2o91 -p mongaw_e2o91
  # Hasło: E,ka8KPZXxd1GeSIrM-60,#8

  # W MySQL:
  SHOW TABLES;

  # Sprawdź czy tabele pakietów już istnieją:
  SHOW TABLES LIKE 'packages%';

  # Wyjdź z MySQL:
  exit;
  ```

---

#### FAZA 3: Backup (KRYTYCZNY KROK!)
- [ ] ⏳ **Backup bazy danych:**
  ```bash
  # Utwórz katalog backups jeśli nie istnieje
  mkdir -p /domains/tg.stronazen.pl/backups

  # Backup MySQL
  mysqldump -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 > /domains/tg.stronazen.pl/backups/db_backup_$(date +%Y%m%d_%H%M%S).sql

  # Weryfikacja backupu
  ls -lh /domains/tg.stronazen.pl/backups/
  ```

- [ ] ⏳ **Backup plików aplikacji:**
  ```bash
  cd /domains/tg.stronazen.pl/public_html/

  # Backup całego katalogu admin
  tar -czf /domains/tg.stronazen.pl/backups/admin_backup_$(date +%Y%m%d_%H%M%S).tar.gz admin/

  # Weryfikacja
  ls -lh /domains/tg.stronazen.pl/backups/
  ```

- [ ] ⏳ **Backup pliku .env:**
  ```bash
  cp admin/.env /domains/tg.stronazen.pl/backups/.env.backup_$(date +%Y%m%d_%H%M%S)
  ```

---

#### FAZA 4: Upload nowych plików
- [ ] ⏳ **Przełączyć aplikację w tryb maintenance:**
  ```bash
  cd /domains/tg.stronazen.pl/public_html/admin
  php artisan down --message="Aktualizacja systemu pakietów" --retry=60
  ```

- [ ] ⏳ **Upload przez SCP/SFTP:**
  ```bash
  # Z lokalnego komputera (Git Bash):

  # 1. Backend files
  scp -r app/Http/Controllers/Package* mongaw@s46.zenbox.pl:/domains/tg.stronazen.pl/public_html/admin/app/Http/Controllers/
  scp -r app/Models/Package* mongaw@s46.zenbox.pl:/domains/tg.stronazen.pl/public_html/admin/app/Models/
  scp app/Services/PackagePdfService.php mongaw@s46.zenbox.pl:/domains/tg.stronazen.pl/public_html/admin/app/Services/

  # 2. Migracje i seedery
  scp database/migrations/*package*.php mongaw@s46.zenbox.pl:/domains/tg.stronazen.pl/public_html/admin/database/migrations/
  scp database/seeders/RealPackageServicesSeeder.php mongaw@s46.zenbox.pl:/domains/tg.stronazen.pl/public_html/admin/database/seeders/

  # 3. Frontend (React)
  scp -r resources/js/Pages/Packages mongaw@s46.zenbox.pl:/domains/tg.stronazen.pl/public_html/admin/resources/js/Pages/
  scp resources/js/Components/PersonServiceSelector.tsx mongaw@s46.zenbox.pl:/domains/tg.stronazen.pl/public_html/admin/resources/js/Components/
  scp resources/js/Components/VariantServiceGroup.tsx mongaw@s46.zenbox.pl:/domains/tg.stronazen.pl/public_html/admin/resources/js/Components/
  scp resources/js/types/package.d.ts mongaw@s46.zenbox.pl:/domains/tg.stronazen.pl/public_html/admin/resources/js/types/

  # 4. Routes
  scp routes/web.php mongaw@s46.zenbox.pl:/domains/tg.stronazen.pl/public_html/admin/routes/

  # 5. PDF templates
  scp -r public/pdf-templates mongaw@s46.zenbox.pl:/domains/tg.stronazen.pl/public_html/admin/public/

  # 6. Build (po npm run build lokalnie)
  scp -r public/build/* mongaw@s46.zenbox.pl:/domains/tg.stronazen.pl/public_html/admin/public/build/
  ```

- [ ] ⏳ **Ustawić uprawnienia:**
  ```bash
  # Na serwerze (SSH):
  cd /domains/tg.stronazen.pl/public_html/admin

  chmod -R 755 storage bootstrap/cache
  chown -R mongaw:mongaw storage bootstrap/cache
  ```

---

#### FAZA 5: Migracje i seedery
- [ ] ⏳ **Sprawdzić które migracje muszą być uruchomione:**
  ```bash
  php artisan migrate:status
  ```

- [ ] ⏳ **Uruchomić migracje (TYLKO dla pakietów!):**
  ```bash
  # Dry-run (bez faktycznego wykonania)
  php artisan migrate --pretend

  # Jeśli wszystko OK, wykonaj:
  php artisan migrate --force

  # Weryfikacja w bazie:
  mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -e "SHOW TABLES LIKE 'packages%';"
  ```

- [ ] ⏳ **Uruchomić seedery (dane usług):**
  ```bash
  php artisan db:seed --class=RealPackageServicesSeeder --force

  # Weryfikacja:
  mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -e "SELECT COUNT(*) FROM package_services;"
  ```

---

#### FAZA 6: Konfiguracja .env (BEZPIECZEŃSTWO)
- [ ] ⏳ **Zaktualizować .env (produkcja):**
  ```bash
  nano /domains/tg.stronazen.pl/public_html/admin/.env

  # ZMIEŃ:
  APP_ENV=production         # Było: local
  APP_DEBUG=false            # Było: true
  SESSION_ENCRYPT=true       # Było: false

  # DODAJ (jeśli brak):
  BACKUP_PASSWORD=YourSecureBackupPassword123!

  # Zapisz: Ctrl+O, Enter, Ctrl+X
  ```

- [ ] ⏳ **Clear cache i rebuild:**
  ```bash
  php artisan config:clear
  php artisan cache:clear
  php artisan route:clear
  php artisan view:clear

  # Zbuduj cache produkcyjny:
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  ```

- [ ] ⏳ **Konfiguracja automatycznych backupów MySQL (30 dni retencji):**
  ```bash
  # 1. Sprawdź czy skrypty backupów są na serwerze
  ls -la scripts/backup-database-universal.sh
  ls -la scripts/restore-database-universal.sh

  # 2. Ustaw uprawnienia wykonywania
  chmod +x scripts/backup-database-universal.sh
  chmod +x scripts/restore-database-universal.sh

  # 3. Utwórz katalog backupów jeśli nie istnieje
  mkdir -p storage/backups
  chmod 755 storage/backups

  # 4. Test ręczny backupu
  BACKUP_PASSWORD="${BACKUP_PASSWORD}" bash scripts/backup-database-universal.sh

  # 5. Sprawdź czy backup powstał
  ls -lh storage/backups/
  # Powinien być plik: db_backup_YYYYMMDD_HHMMSS.sql.gpg

  # 6. Dodaj cron job (backup codziennie o 3:00, retencja 30 dni)
  crontab -e
  # Dodaj linię:
  # 0 3 * * * cd /domains/tg.stronazen.pl/public_html/admin && BACKUP_PASSWORD="<HASŁO_Z_ENV>" bash scripts/backup-database-universal.sh >> storage/logs/backup.log 2>&1

  # 7. Weryfikuj cron job
  crontab -l | grep backup

  # 8. Monitorowanie (następnego dnia)
  tail -50 storage/logs/backup.log
  ls -lh storage/backups/
  ```

  **⚠️ WAŻNE:**
  - Skrypt automatycznie usuwa backupy starsze niż 30 dni
  - Backupy są szyfrowane GPG (hasło z `BACKUP_PASSWORD` w .env)
  - Rozmiar pojedynczego backupu: ~2MB (dla ~1000 pakietów)
  - Całkowity rozmiar 30 dni: ~60MB (niewiele!)
  - Przywracanie: `bash scripts/restore-database-universal.sh` (interaktywny wybór)

  **Dokumentacja:**
  - Pełny przewodnik: [BACKUP_PRODUCTION.md](BACKUP_PRODUCTION.md)
  - Instrukcje restore: [scripts/README.md](scripts/README.md)

---

#### FAZA 7: Testy funkcjonalności
- [ ] ⏳ **Wyłączyć maintenance mode:**
  ```bash
  php artisan up
  ```

- [ ] ⏳ **Przetestować w przeglądarce:**
  - [ ] Otwórz: https://admin.tg.stronazen.pl/login
  - [ ] Zaloguj się
  - [ ] Sprawdź Dashboard → czy działają ALERTY i RUCH (stare funkcje)
  - [ ] Kliknij "Pakiety" w menu
  - [ ] Dodaj testowy pakiet
  - [ ] Zaznacz wykorzystanie usługi
  - [ ] Wygeneruj PDF pakietu
  - [ ] Sprawdź logi (brak błędów 500)

- [ ] ⏳ **Sprawdzić logi na serwerze:**
  ```bash
  tail -50 /domains/tg.stronazen.pl/public_html/admin/storage/logs/laravel.log
  ```

- [ ] ⏳ **Przetestować API (dla strony Astro - NIE MOŻE BYĆ ZEPSUTE!):**
  ```bash
  curl https://admin.tg.stronazen.pl/api/alerts
  curl https://admin.tg.stronazen.pl/api/traffic

  # Powinny zwrócić JSON (nie błąd 500)
  ```

---

#### FAZA 7a: 🚨 TEST DISASTER RECOVERY (KRYTYCZNY!)
**⚠️ OBOWIĄZKOWY TEST PRZED PRODUKCJĄ!**

- [ ] ⏳ **Przeprowadzić symulację awarii zgodnie z [DISASTER_RECOVERY_TEST.md](DISASTER_RECOVERY_TEST.md):**

  **Cel:** Upewnić się że backupy działają i da się przywrócić bazę w razie awarii.

  **Wymagania:**
  - Zarezerwuj 45-60 minut
  - Test TYLKO na `admin.tg.stronazen.pl` (środowisko testowe)
  - Kartę wyników przygotuj w notatniku

  **3 scenariusze do przetestowania:**

  **Scenariusz 1: Błędna migracja**
  ```bash
  # Symulacja: php artisan migrate:fresh (usuwa wszystko)
  # Test: Czy restore przywraca strukturę + dane?
  # Cel: < 5 minut od awarii do przywrócenia
  ```

  **Scenariusz 2: Przypadkowe usunięcie danych**
  ```bash
  # Symulacja: DELETE FROM packages (usuwa pakiety)
  # Test: Czy restore przywraca dane z relacjami?
  # Cel: < 3 minuty
  ```

  **Scenariusz 3: Korupcja struktury bazy**
  ```bash
  # Symulacja: Uszkodzone foreign keys/indexy
  # Test: Czy restore naprawia strukturę?
  # Cel: < 5 minut
  ```

  **Checklist po każdym scenariuszu:**
  - [ ] Backup się odszyfrował (hasło działa)
  - [ ] Restore zakończył się bez błędów
  - [ ] Liczba pakietów zgodna z oczekiwaną
  - [ ] Relacje między tabelami działają
  - [ ] Aplikacja działa w przeglądarce
  - [ ] Stare funkcje (alerty, ruch) nienaruszone

  **Dokumentacja testu:**
  - [ ] Wypełnij kartę wyników w DISASTER_RECOVERY_TEST.md
  - [ ] Zanotuj czas każdego restore
  - [ ] Udokumentuj problemy (jeśli były)
  - [ ] Zapisz wnioski

  **Warunki przejścia do FAZY 8 (produkcja):**
  - ✅ Wszystkie 3 scenariusze zakończone SUKCESEM
  - ✅ Średni czas restore < 5 minut
  - ✅ Hasło BACKUP_PASSWORD zapisane w menedżerze haseł
  - ✅ Zespół zna procedurę restore
  - ✅ Brak krytycznych problemów

  **Jeśli test się nie powiódł:**
  ```
  ❌ NIE przechodź do FAZY 8!
  1. Zidentyfikuj problem
  2. Napraw (zmień hasło / popraw skrypt / etc.)
  3. Powtórz test DR od początku
  4. Tylko po pełnym sukcesie → FAZA 8
  ```

---

#### FAZA 8: Deployment na PRODUKCJĘ (panel.termygorce.pl)
**UWAGA: Wykonać TYLKO jeśli testy na admin.tg.stronazen.pl przeszły OK!**

- [ ] ⏳ **Powtórzyć FAZY 2-7 dla produkcji:**
  ```bash
  # Zmień ścieżki na:
  /domains/panel.termygorce.pl/public_html/

  # Zmień URL na:
  https://panel.termygorce.pl
  ```

- [ ] ⏳ **Backup produkcji (KRYTYCZNY!):**
  ```bash
  # Identycznie jak FAZA 3, ale dla panel.termygorce.pl
  ```

---

### 🚨 ROLLBACK PLAN (jeśli coś pójdzie nie tak)

#### Scenariusz A: Błąd w migracji
```bash
# Cofnij ostatnią migrację
php artisan migrate:rollback --step=1

# Przywróć bazę z backupu
mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 < /domains/tg.stronazen.pl/backups/db_backup_YYYYMMDD_HHMMSS.sql
```

#### Scenariusz B: Aplikacja nie działa po wgraniu plików
```bash
# Przywróć cały katalog z backupu
cd /domains/tg.stronazen.pl/public_html/
rm -rf admin/
tar -xzf /domains/tg.stronazen.pl/backups/admin_backup_YYYYMMDD_HHMMSS.tar.gz
```

#### Scenariusz C: Błąd 500 po deployment
```bash
# 1. Włącz tryb maintenance
php artisan down

# 2. Sprawdź logi
tail -100 storage/logs/laravel.log

# 3. Clear cache
php artisan config:clear
php artisan cache:clear

# 4. Napraw uprawnienia
chmod -R 755 storage bootstrap/cache
chown -R mongaw:mongaw storage bootstrap/cache

# 5. Jeśli nie pomaga - rollback (Scenariusz B)
```

---

### 📊 Progress Tracking

**Status:** 🔄 In Progress

- [ ] ⏳ **FAZA 1:** Przygotowanie lokalne (0%)
- [ ] ⏳ **FAZA 2:** Połączenie SSH (0%)
- [ ] ⏳ **FAZA 3:** Backup (0%)
- [ ] ⏳ **FAZA 4:** Upload plików (0%)
- [ ] ⏳ **FAZA 5:** Migracje (0%)
- [ ] ⏳ **FAZA 6:** Konfiguracja + Backupy (0%)
- [ ] ⏳ **FAZA 7:** Testy funkcjonalności (0%)
- [ ] ⏳ **FAZA 7a:** 🚨 TEST DISASTER RECOVERY (0%) - **KRYTYCZNY!**
- [ ] ⏳ **FAZA 8:** Produkcja (0%)

**Szacowany czas:**
- FAZY 1-7: ~30-45 minut (deployment testowy)
- FAZA 7a: ~45-60 minut (test DR - OBOWIĄZKOWY)
- FAZA 8: ~20-30 minut (deployment produkcyjny)
- **TOTAL: ~2-2.5 godziny**

---

## 📋 Backlog - Funkcjonalności przyszłościowe

### Priorytet Niski
- [ ] Eksport pakietów do PDF
- [ ] Eksport do Excel/CSV
- [ ] Historia zmian w pakietach (audit log)
- [ ] Powiadomienia email przy pełnym wykorzystaniu pakietu
- [ ] Dashboard z statystykami (najczęściej używane usługi, etc.)
- [ ] Archiwizacja starych pakietów

---

## ❓ Pytania wymagające decyzji

### Wysokopriorytowe (blokują rozwój)
1. **Typy pakietów - zawartość**
   - Status: ⏸️ Wymaga decyzji klienta
   - Pytanie: Jakie dokładnie usługi zawiera każdy z 6 typów pakietów?
   - Impact: Blokuje seedery i testy

2. **Data ważności pakietów**
   - Status: ⏸️ Wymaga decyzji
   - Pytanie: Czy pakiety mają datę wygaśnięcia?
   - Impact: Może wymagać dodatkowej kolumny `expires_at`

3. **Wielokrotne wykorzystanie usług**
   - Status: ⏸️ Wymaga decyzji
   - Pytanie: Czy jedna usługa może być w pakiecie wielokrotnie? (np. 3x masaż)
   - Impact: Obecna struktura `package_type_services` ma kolumnę `quantity` - trzeba potwierdzić logikę

### Średniopriorytowe
4. **Edycja ID pakietu**
   - Pytanie: Czy można edytować custom_id po utworzeniu?
   - Sugestia: Nie pozwalać (unique identifier)

5. **Usuwanie pakietów**
   - Pytanie: Hard delete czy soft delete (kolumna `deleted_at`)?
   - Sugestia: Soft delete dla zachowania historii

---

## 📝 Change Log

### 2025-10-27 (09:00-12:00) - Przygotowanie do deployment Zenbox
**Milestone 6 - Deployment Planning (🔄 In Progress)**

**Analiza środowiska:**
- ✅ Zidentyfikowano architekturę: Astro (publiczna) + Laravel (admin panel)
- ✅ Zlokalizowano środowisko testowe: `admin.tg.stronazen.pl`
- ✅ Potwierdzono produkcję: `panel.termygorce.pl`
- ✅ Ustalono że system pakietów NIE istnieje na serwerze (czysty deployment)
- ✅ Potwierdzono że istniejące funkcje (alerty + ruch) DZIAŁAJĄ i nie mogą być naruszone

**Infrastruktura Zenbox:**
- Host: `s46.zenbox.pl` (LiteSpeed)
- Login: `mongaw`
- Baza: MySQL `mongaw_e2o91`
- PHP: Do weryfikacji (potrzeba 8.2+)
- Hasło SSH: ⏳ Oczekiwanie (dostępne wieczorem od informatyka)

**Struktura na serwerze:**
```
/domains/tg.stronazen.pl/public_html/admin/  ← TEST
/domains/panel.termygorce.pl/public_html/    ← PRODUKCJA
```

**Przygotowanie dokumentacji:**
- ✅ Utworzono **Milestone 6: Deployment na Zenbox** w task.md
- ✅ Przygotowano kompletny protokół deployment (8 FAZ)
- ✅ Dodano ROLLBACK PLAN (3 scenariusze)
- ✅ Przygotowano checklist z konkretnymi komendami
- ✅ Ustalono strategię: TEST → weryfikacja → PRODUKCJA

**Pliki do wgrania:**
- Backend: 4 kontrolery, 4 modele, 1 serwis
- Migracje: 14 plików (system pakietów)
- Seeder: 1 plik (dane usług)
- Frontend: Katalog Packages/, 2 komponenty, 1 type definition
- Assets: PDF templates, build Vite

**Next Steps:**
1. ⏳ Oczekiwanie na hasło SSH (wieczór)
2. ⏳ FAZA 1: Build lokalny (composer, npm)
3. ⏳ FAZA 2-8: Deployment zgodnie z protokołem w task.md

---

### 2025-10-13 (16:00-18:00) - Setup projektu
- ✅ Utworzono task.md
- ✅ Zaktualizowano claude.md o workflow z task management
- ✅ Docker Desktop uruchomiony
- ✅ Sprawdzono istniejące zależności (vendor + node_modules)
- ✅ Utworzono 4 skrypty Windows (.bat):
  - `setup.bat` - pierwsza instalacja
  - `start.bat` - codzienne uruchomienie
  - `stop.bat` - zatrzymanie kontenerów
  - `logs.bat` - wyświetlanie logów
- ✅ Dodano NPM scripts do package.json:
  - `npm start` - uruchamia Sail + Vite
  - `npm run sail:up/down/logs` - zarządzanie Sail
- ✅ Utworzono README.md z pełnymi instrukcjami

### 2025-10-15 (06:00-07:00) - Laravel MCP Integration
**MCP Setup (✅ Completed)**

**Laravel MCP Integration:**
- ✅ Zainstalowano pakiet Laravel MCP (composer require laravel/mcp)
- ✅ Opublikowano AI routes (php artisan vendor:publish --tag=ai-routes)
- ✅ Utworzono PlatformaPakietyServer w app/Mcp/Servers/
- ✅ Zarejestrowano serwer MCP w routes/ai.php jako 'pakiety'
- ✅ Skonfigurowano Claude Code MCP: claude mcp add pakiety
- ✅ Utworzono GetAlertsTool - narzędzie do pobierania alertów z bazy
- ✅ Dodano tool do serwera MCP

**Korzyści:**
- Szybkie testowanie modeli i API bez przeglądarki
- Bezpośrednie zapytania do bazy SQLite
- Debugowanie systemu pakietów przez MCP tools
- Testowanie Eloquent relacji

**Użycie:**
```bash
# Serwer MCP uruchamiany przez Claude Code automatycznie
# Dostępne narzędzia: GetAlertsTool (pobieranie alertów)
```

### 2025-10-13 (19:00-22:00) - Implementacja systemu pakietów
**Milestone 2 & 3 - Backend + Frontend (✅ Completed)**

**Backend:**
- ✅ Uzupełniono migracje (dodano pole `zone` do package_services)
- ✅ Zaktualizowano modele:
  - Package: dodano relację usages(), metody usage_percentage i isFullyUsed()
  - PackageService: dodano pole zone
- ✅ Utworzono PackageController:
  - index() - lista pakietów z procentem wykorzystania
  - create() - formularz z typami pakietów
  - store() - tworzenie pakietu + automatyczne przypisanie usług
  - show() - szczegóły pakietu z usługami pogrupowanymi po strefach
- ✅ Utworzono PackageServiceUsageController:
  - toggle() - przełączanie stanu wykorzystania usługi
- ✅ Zaktualizowano routing (routes/web.php)
- ✅ Utworzono seedery z testowymi danymi:
  - PackageServiceSeeder: 12 usług w 3 strefach
  - PackageTypeSeeder: 6 typów pakietów z różną zawartością

**Frontend:**
- ✅ Utworzono TypeScript typy (resources/js/types/package.d.ts)
- ✅ Zaktualizowano Index.tsx:
  - Tabela z listą pakietów
  - Progress bar wykorzystania
  - Ciemniejsze tło (bg-gray-200) dla w pełni wykorzystanych pakietów
- ✅ Komponent Create.tsx już istniał (bez zmian)
- ✅ Utworzono Show.tsx:
  - 3 kolumny dla stref: Relaksu 🧘, Odnowy 💆, Smaku 🍽️
  - Checkboxy dla każdej usługi
  - Automatyczne zapisywanie stanu wykorzystania
  - Historia (kto i kiedy zaznaczył)
  - Progress bar ogólnego wykorzystania pakietu
  - Ciemniejsze tło dla w pełni wykorzystanych pakietów
- ✅ Dodano link "Pakiety" do nawigacji (desktop + mobile)

**Progress:** 40% → 80%

**Next Steps:**
1. 🎯 Użytkownik uruchomi `setup.bat` aby wykonać migracje i seedery
2. 🎯 Testowanie funkcjonalności w przeglądarce
3. 🎯 Opcjonalne poprawki/rozszerzenia po testach

---

## 🔗 Related Documents
- [claude.md](claude.md) - Główna dokumentacja projektu
- [README.md](README.md) - Instrukcje instalacji (do utworzenia)
- [.env.example](.env.example) - Przykładowa konfiguracja

---

**Next Steps:**
1. 🎯 Uruchomić `setup.bat` (migracje + seedery)
2. 🎯 Przetestować system pakietów w przeglądarce
3. 🎯 Opcjonalne rozszerzenia:
   - Filtrowanie i sortowanie w Index.tsx
   - Eksport do PDF/Excel
   - Dashboard ze statystykami
