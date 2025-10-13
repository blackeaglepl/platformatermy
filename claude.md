# Dokumentacja Projektu - Platforma Pakiety (TermyGórce Admin)

## 📋 Spis treści
1. [Przegląd projektu](#przegląd-projektu)
2. [Stack technologiczny](#stack-technologiczny)
3. [Aktualna architektura](#aktualna-architektura)
4. [Obecne funkcjonalności](#obecne-funkcjonalności)
5. [API i komunikacja ze stroną Astro](#api-i-komunikacja-ze-stroną-astro)
6. [Nowe funkcjonalności - System zarządzania pakietami](#nowe-funkcjonalności---system-zarządzania-pakietami)

---

## 🎯 Przegląd projektu

**Nazwa:** Platforma Pakiety / TermyGorce Admin Panel
**Wersja:** 1.0
**Ostatnia aktualizacja:** Październik 2025

### Cel projektu
Panel administracyjny do zarządzania komunikatami i informacją o ruchu dla strony internetowej TermyGórce (zbudowanej w Astro). Panel umożliwia pracownikom:
- Zarządzanie alertami wyświetlanymi na stronie głównej
- Aktualizację informacji o natężeniu ruchu
- **[NOWE]** Zarządzanie pakietami usług i ich wykorzystaniem

---

## 💻 Stack technologiczny

### Backend
- **Framework:** Laravel 11.34
- **PHP:** 8.2+
- **Baza danych:** SQLite (development) / MySQL (production via Docker)
- **Autentykacja:** Laravel Breeze + Sanctum
- **API:** RESTful API (JSON)

### Frontend
- **Framework:** React 18.2
- **Język:** TypeScript 5.0
- **Build tool:** Vite 5.0
- **CSS Framework:** Tailwind CSS 3
- **UI Components:** Headless UI 2.0
- **Routing:** Inertia.js 1.0 (SPA-like experience bez API routingu)

### Narzędzia deweloperskie
- **Docker:** Laravel Sail (kontenery dla PHP, MySQL, Redis)
- **Testing:** Pest PHP 3.6
- **Code quality:** Laravel Pint 1.13
- **Linting:** ESLint (TypeScript)

### Deployment
- **Środowisko:** Docker Desktop
- **Orchestracja:** docker-compose
- **Node.js:** v22.x (dla Vite i build procesu)

---

## 🏗️ Aktualna architektura

### Struktura katalogów
```
PlatformaPakiety/
├── app/
│   ├── Enums/
│   │   └── AlertType.php          # WARNING, PROMO, INFO
│   ├── Http/
│   │   └── Controllers/
│   │       ├── AlertController.php (pusty - do refaktoryzacji)
│   │       └── ProfileController.php
│   └── Models/
│       ├── Alert.php               # Model alertów
│       ├── Traffic.php             # Model natężenia ruchu
│       └── User.php                # Model użytkowników
├── database/
│   └── migrations/
│       ├── 2024_12_22_203832_create_alerts_table.php
│       └── 2024_12_22_211130_create_traffic_table.php
├── resources/
│   └── js/
│       ├── Pages/
│       │   ├── Dashboard.tsx       # Główny panel
│       │   └── Home/Partials/
│       │       ├── UpdateAlertForm.tsx
│       │       └── UpdateTrafficForm.tsx
│       └── Layouts/
│           └── AuthenticatedLayout.tsx
└── routes/
    ├── web.php                     # Routing dla Inertia
    ├── api.php                     # **KLUCZOWE** - API dla strony Astro
    └── auth.php                    # Routing autentykacji
```

---

## ✅ Obecne funkcjonalności

### 1. System autentykacji
- Logowanie/Rejestracja użytkowników (Laravel Breeze)
- Weryfikacja email
- Reset hasła
- Zarządzanie profilem

### 2. Dashboard - Zarządzanie alertami
**Lokalizacja:** `resources/js/Pages/Dashboard.tsx`

**Funkcjonalność:**
- Tworzenie/edycja alertów wyświetlanych na stronie Astro
- Pola alertu:
  - `enabled` (boolean) - czy alert jest aktywny
  - `text` (string) - treść komunikatu
  - `type` (enum) - typ: WARNING | PROMO | INFO
  - `order` (integer) - kolejność wyświetlania

**Endpoint wewnętrzny:**
- `PATCH /dashboard` - aktualizacja alertu

### 3. Dashboard - Zarządzanie ruchem
**Lokalizacja:** `resources/js/Pages/Home/Partials/UpdateTrafficForm.tsx`

**Funkcjonalność:**
- Ustawienie aktualnego natężenia ruchu
- Wartość liczbowa reprezentująca intensywność

**Endpoint wewnętrzny:**
- `PATCH /dashboard` - aktualizacja wartości ruchu

---

## 🔗 API i komunikacja ze stroną Astro

### ⚠️ KRYTYCZNE - NIE ZMIENIAĆ

**Strona Astro konsumuje publiczne API Laravel do wyświetlania danych w czasie rzeczywistym.**

### Endpointy API (routes/api.php)

#### 1. GET /api/traffic
**Odpowiedzialny za:** Pobieranie aktualnego natężenia ruchu

**Request:**
```http
GET /api/traffic HTTP/1.1
Host: localhost
```

**Response:**
```json
75
```
(zwraca bezpośrednio wartość integer)

**Implementacja:**
```php
Route::get('/traffic', function (Request $request) {
    return Traffic::latest()->get()->value('value');
});
```

---

#### 2. GET /api/alerts
**Odpowiedzialny za:** Pobieranie aktywnych alertów

**Request:**
```http
GET /api/alerts HTTP/1.1
Host: localhost
```

**Response (alert włączony):**
```json
[
  {
    "type": "WARNING",
    "text": "Dzisiaj zwiększony ruch - prosimy o cierpliwość",
    "enabled": true
  }
]
```

**Response (alert wyłączony):**
```json
[]
```

**Implementacja:**
```php
Route::get('/alerts', function (Request $request) {
    $alert = Alert::first(); // zakładamy jeden globalny alert
    if ($alert && $alert->enabled == 1) {
        return [$alert]; // zwracamy jako array
    }
    return [];
});
```

### Struktura bazy danych

#### Tabela: `alerts`
```sql
CREATE TABLE alerts (
    id INTEGER PRIMARY KEY,
    enabled BOOLEAN DEFAULT 0,
    text VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,  -- WARNING | PROMO | INFO
    order INTEGER NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### Tabela: `traffic`
```sql
CREATE TABLE traffic (
    id INTEGER PRIMARY KEY,
    value INTEGER NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### CORS i Security
- API jest publicznie dostępne (bez autentykacji)
- CORS skonfigurowany w `config/cors.php`
- Strona Astro może pobierać dane bez tokenu

---

## 🆕 Nowe funkcjonalności - System zarządzania pakietami

### Cel
Umożliwienie personelowi śledzenia wykorzstania sprzedanych pakietów usług dla klientów.

### User Flow

#### 1. Dodawanie nowego pakietu (Pracownik)
**Ekran:** Dashboard → "Dodaj pakiet"

**Formularz:**
- **Typ pakietu:** Wybór z listy (1-6)
- **ID pakietu:** Ręczne wpisanie (np. "Kowalski_Styczen_2025")
- **Automatyczne przypisanie usług:** Na podstawie typu pakietu

**Typy pakietów (do uzgodnienia):**
```
Pakiet 1: [Lista usług]
Pakiet 2: [Lista usług]
Pakiet 3: [Lista usług]
Pakiet 4: [Lista usług]
Pakiet 5: [Lista usług]
Pakiet 6: [Lista usług]
```

#### 2. Przeglądanie pakietów (Wszyscy pracownicy)
**Ekran:** Dashboard → "Lista pakietów"

**Funkcjonalności:**
- Lista wszystkich pakietów
- Filtrowanie po:
  - ID pakietu
  - Typ pakietu
  - Status wykorzystania (%)
- Sortowanie po dacie dodania

#### 3. Zarządzanie wykorzystaniem usług (Wszyscy pracownicy)
**Ekran:** Dashboard → "Szczegóły pakietu" → [ID pakietu]

**Widok:**
```
Pakiet: Kowalski_Styczen_2025
Typ: Pakiet 3
Data utworzenia: 2025-01-15
Status: 60% wykorzystane

Usługi:
☑ Masaż relaksacyjny (60 min) - użyto 2025-01-16 przez Jan Kowalski
☑ Basen termalny (2h) - użyto 2025-01-17 przez Anna Nowak
☐ Sauna fińska (30 min) - niewykorzystane
☐ Grota solna (45 min) - niewykorzystane
☑ Jacuzzi (30 min) - użyto 2025-01-18 przez Jan Kowalski
```

**Akcje:**
- Kliknięcie checkboxa → oznacza usługę jako wykorzystaną
- Automatyczne zapisanie:
  - Data wykorzystania
  - Kto zaznaczył (user_id)
  - Timestamp

### Struktura bazy danych (propozycja)

#### Tabela: `packages`
```sql
CREATE TABLE packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    custom_id VARCHAR(255) UNIQUE NOT NULL,  -- np. "Kowalski_Styczen_2025"
    package_type INTEGER NOT NULL,           -- 1-6
    created_by INTEGER,                      -- user_id
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Tabela: `package_services`
```sql
CREATE TABLE package_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,              -- nazwa usługi
    description TEXT,
    duration INTEGER,                        -- czas trwania w minutach
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### Tabela: `package_type_services` (relacja wiele-do-wielu)
```sql
CREATE TABLE package_type_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_type INTEGER NOT NULL,           -- 1-6
    service_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,              -- ile razy usługa w pakiecie
    FOREIGN KEY (service_id) REFERENCES package_services(id)
);
```

#### Tabela: `package_service_usage`
```sql
CREATE TABLE package_service_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    used_at TIMESTAMP,
    marked_by INTEGER,                       -- user_id który zaznaczył
    notes TEXT,                              -- opcjonalne notatki
    FOREIGN KEY (package_id) REFERENCES packages(id),
    FOREIGN KEY (service_id) REFERENCES package_services(id),
    FOREIGN KEY (marked_by) REFERENCES users(id)
);
```

### Endpointy API (propozycja)

#### Zarządzanie pakietami
```
POST   /api/packages              - Utworzenie nowego pakietu
GET    /api/packages              - Lista wszystkich pakietów
GET    /api/packages/{id}         - Szczegóły pakietu
PUT    /api/packages/{id}         - Aktualizacja pakietu
DELETE /api/packages/{id}         - Usunięcie pakietu
```

#### Zarządzanie wykorzystaniem usług
```
POST   /api/packages/{id}/services/{service_id}/mark-used
       - Oznacz usługę jako wykorzystaną

DELETE /api/packages/{id}/services/{service_id}/unmark
       - Cofnij wykorzystanie usługi

GET    /api/packages/{id}/usage-stats
       - Statystyki wykorzystania pakietu
```

#### Konfiguracja typów pakietów
```
GET    /api/package-types         - Lista typów pakietów z usługami
POST   /api/package-types/{type}/services
       - Dodaj usługę do typu pakietu (admin)
```

### Modele (propozycja)

```php
// app/Models/Package.php
class Package extends Model
{
    public function services()
    {
        return $this->belongsToMany(PackageService::class, 'package_service_usage')
            ->withPivot('used_at', 'marked_by', 'notes')
            ->withTimestamps();
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getUsagePercentageAttribute()
    {
        // Oblicz % wykorzystania
    }
}

// app/Models/PackageService.php
class PackageService extends Model
{
    // ...
}

// app/Models/PackageServiceUsage.php
class PackageServiceUsage extends Model
{
    // ...
}
```

### Komponenty React (propozycja)

```
resources/js/Pages/
├── Packages/
│   ├── Index.tsx                 # Lista pakietów
│   ├── Create.tsx                # Formularz dodawania
│   ├── Show.tsx                  # Szczegóły pakietu
│   └── Partials/
│       ├── PackageList.tsx
│       ├── ServiceCheckbox.tsx
│       └── UsageStats.tsx
```

---

## 📝 Sposób pracy z projektem

### Workflow z Claude Code
1. **Przed rozpoczęciem pracy:**
   - Przeczytaj [task.md](task.md) aby sprawdzić co zostało już zrobione
   - Zaktualizuj statusy zadań w [task.md](task.md)

2. **Podczas pracy:**
   - Używaj TodoWrite tool do zarządzania bieżącymi zadaniami
   - Po zakończeniu każdego zadania aktualizuj [task.md](task.md)
   - Zapisuj ważne decyzje i zmiany w [task.md](task.md)

3. **Po zakończeniu sesji:**
   - Upewnij się że wszystkie zmiany są zapisane w [task.md](task.md)
   - Zacommituj zmiany do Git z opisowymi wiadomościami

### Dokumentacja zadań
Szczegółowe zarządzanie zadaniami i postępami znajduje się w **[task.md](task.md)**

---

## 📝 Notatki deweloperskie

### ⚠️ Rzeczy do NIE ZMIENIAĆ (KRYTYCZNE)
- ❌ Endpointy `/api/traffic` i `/api/alerts`
- ❌ Struktura response JSON dla Astro
- ❌ Modele `Alert` i `Traffic`
- ❌ Tabele `alerts` i `traffic` w bazie danych
- ❌ Istniejące migracje w `database/migrations/`

### Pytania do rozważenia
- Czy pakiety mają datę ważności?
- Czy można edytować ID pakietu po utworzeniu?
- Czy usługi mogą być używane wielokrotnie? (np. 3x masaż w pakiecie)
- Czy potrzebujemy historii zmian?
- Czy potrzebujemy eksportu do PDF/Excel?

---

## 🔐 Bezpieczeństwo

### Autentykacja
- Wszystkie endpointy pakietów wymagają autentykacji (`auth:sanctum`)
- Publiczne pozostają tylko `/api/traffic` i `/api/alerts`

### Autoryzacja
- Każdy zalogowany pracownik może:
  - Dodawać pakiety
  - Przeglądać wszystkie pakiety
  - Zaznaczać wykorzystanie usług
- Admin może:
  - Usuwać pakiety
  - Modyfikować typy pakietów

---

## 📚 Dodatkowe zasoby

- [Laravel 11 Documentation](https://laravel.com/docs/11.x)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Inertia.js Documentation](https://inertiajs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Ostatnia aktualizacja:** 2025-10-13
**Autor:** Zespół deweloperski TermyGórce
