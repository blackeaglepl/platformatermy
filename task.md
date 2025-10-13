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
