# Dokumentacja Projektu - Platforma Pakiety (TermyGórce Admin)

## 📋 Spis treści
1. [Przegląd projektu](#przegląd-projektu)
2. [Stack technologiczny](#stack-technologiczny)
3. [⚠️ WAŻNE - Konfiguracja dla Windows + Docker](#-ważne---konfiguracja-dla-windows--docker)
4. [Aktualna architektura](#aktualna-architektura)
5. [Obecne funkcjonalności](#obecne-funkcjonalności)
6. [API i komunikacja ze stroną Astro](#api-i-komunikacja-ze-stroną-astro)
7. [Nowe funkcjonalności - System zarządzania pakietami](#nowe-funkcjonalności---system-zarządzania-pakietami)

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
- **MCP Integration:** Laravel MCP 0.1.1 (Model Context Protocol)

### Deployment
- **Środowisko:** Docker Desktop
- **Orchestracja:** docker-compose
- **Node.js:** v22.x (dla Vite i build procesu)

---

## ⚠️ WAŻNE - Konfiguracja dla Windows + Docker

### Problem Windows ↔ Linux Compatibility
Projekt jest rozwijany na **Windows**, ale uruchamiany w **Linux Docker containers**. To tworzy specyficzne wyzwania.

### Rozwiązanie #1: Named Volume dla node_modules
**Problem:** Binarne pakiety npm (rollup, esbuild) są kompilowane dla różnych systemów operacyjnych.

**Rozwiązanie:** W `docker-compose.yml` używamy **named volume** dla `node_modules`:
```yaml
volumes:
    - '.:/var/www/html'
    - 'sail-node-modules:/var/www/html/node_modules'  # KRYTYCZNE!
```

**Efekt:**
- Kod źródłowy jest synchronizowany z Windows
- `node_modules` żyje TYLKO w kontenerze Linux
- Brak konfliktów binarnych

### Rozwiązanie #2: Vite Configuration
**Problem:** Vite musi działać w kontenerze, ale być dostępny z przeglądarki Windows.

**Rozwiązanie:** W `vite.config.js`:
```javascript
server: {
    host: '0.0.0.0',           // Listen na wszystkich interfejsach (Docker)
    port: 5173,
    strictPort: true,
    hmr: {
        host: 'localhost',      // HMR dla przeglądarki Windows
    },
    watch: {
        usePolling: true,       // Lepsze wykrywanie zmian z Windows
    },
}
```

### Rozwiązanie #3: Vite MUSI być uruchomiony W kontenerze
❌ **NIE DZIAŁA:**
```bash
npm run dev  # Uruchomione bezpośrednio na Windows
```

✅ **DZIAŁA:**
```bash
docker exec platformapakiety-laravel.test-1 npm run dev  # W kontenerze
```

### Rozwiązanie #4: Używaj `docker compose` zamiast `sail`
**Problem:** Laravel Sail nie działa w Git Bash (tylko w PowerShell/CMD/WSL2)

**Rozwiązanie:** `start.bat` używa bezpośrednio `docker compose`:
```batch
docker compose up -d                                          # Zamiast: vendor\bin\sail up -d
docker exec platformapakiety-laravel.test-1 npm install      # Zamiast: sail npm install
docker exec platformapakiety-laravel.test-1 npm run dev      # Zamiast: sail npm run dev
```

### Quick Reference: Co gdzie?
| Element | Lokalizacja | System |
|---------|-------------|--------|
| Kod źródłowy (.tsx, .php) | `F:\Windsurf\PlatformaPakiety\` | Windows (sync do kontenera) |
| node_modules | Docker volume `sail-node-modules` | Linux (TYLKO w kontenerze) |
| database.sqlite | `F:\Windsurf\PlatformaPakiety\database\` | Windows (sync do kontenera) |
| vendor/ (Composer) | `F:\Windsurf\PlatformaPakiety\vendor\` | Windows (sync do kontenera) |
| Vite dev server | Działa w kontenerze | Linux (port 5173 zmapowany) |
| Laravel | Działa w kontenerze | Linux (port 80 zmapowany) |

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
- **Automatyczne przypisanie usług:** Na podstawie typu pakietu


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
    package_id VARCHAR(255) UNIQUE NOT NULL,  -- automatycznie generowane (YYYYMMDD-XX)
    owner_name VARCHAR(255) NOT NULL,         -- imię i nazwisko (np. "Jan Kowalski")
    package_type INTEGER NOT NULL,            -- 1-6
    created_by INTEGER,                       -- user_id
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    notes TEXT,                               -- opcjonalne uwagi
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

**⚠️ WAŻNA ZMIANA (2025-10-16):**
- `owner_name` **NIE MA** constraint UNIQUE - ta sama osoba może mieć wiele pakietów
- `package_id` jest unikalny i wystarcza do identyfikacji
- Brak brzydkich suffixów (`_2`, `_3`) w PDF i UI

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

### Modele 

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

### Komponenty React 

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

## 🤖 Laravel MCP Integration

### ⚠️ WYSOKI PRIORYTET - MCP Setup

**Status:** ✅ Skonfigurowany i gotowy do użycia

**Laravel MCP** umożliwia bezpośrednią interakcję z aplikacją Laravel przez Model Context Protocol, co znacznie przyspiesza development.

### Konfiguracja MCP

#### Zainstalowane komponenty:
- **Pakiet:** `laravel/mcp ^0.1.1`
- **Serwer MCP:** `PlatformaPakietyServer` w `app/Mcp/Servers/`
- **Narzędzia:** `GetAlertsTool` (pobieranie alertów z bazy)
- **Routing:** Zarejestrowany w `routes/ai.php` jako handle `pakiety`

#### Claude Code Integration:
```bash
# Automatycznie skonfigurowane w Claude Code
claude mcp add pakiety stdio -- docker exec platformapakiety-laravel.test-1 php artisan mcp:start pakiety
```

### Dostępne narzędzia MCP

#### 1. GetAlertsTool
- **Opis:** Pobiera wszystkie alerty z bazy danych
- **Parametry:** Brak (automatycznie pobiera wszystkie)
- **Response:** JSON z alertami (id, enabled, text, type, order, timestamps)
- **Użycie:** Szybkie sprawdzenie stanu alertów bez przeglądarki

### Korzyści dla development

#### Natychmiastowe korzyści:
- ✅ **Szybkie testowanie modeli** - Alert, Traffic, Package bez UI
- ✅ **API debugging** - testowanie `/api/traffic` i `/api/alerts`
- ✅ **Baza danych** - bezpośrednie zapytania do SQLite
- ✅ **Eloquent testing** - weryfikacja relacji między modelami

#### Dla systemu pakietów:
- ✅ **Package management** - testowanie logiki pakietów
- ✅ **Service usage** - debugowanie wykorzystania usług
- ✅ **Validation testing** - sprawdzanie walidacji formularzy

### Rozszerzenia MCP (planned)

#### Dodatkowe narzędzia do utworzenia:
```php
// Przyszłe narzędzia MCP
GetPackagesTool::class,      // Lista pakietów z % wykorzystania
GetTrafficTool::class,       // Aktualny traffic
CreatePackageTool::class,    // Tworzenie pakietu przez MCP
ToggleServiceTool::class,    // Zaznaczanie usług jako wykorzystane
```

#### Resources (opcjonalne):
```php
// Zasoby dokumentacyjne przez MCP
PackageTypesResource::class, // Dokumentacja typów pakietów
APIDocsResource::class,      // Dokumentacja API endpoints
```

### ⚠️ WAŻNE - Restart Claude Code

Po każdej zmianie w MCP konfiguracji:
1. Restart Claude Code aby załadować nowe MCP tools
2. MCP server działa automatycznie w kontenerze Docker
3. Brak potrzeby manualnego uruchamiania

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

### ⚠️ Ważne ustalenia dotyczące nazewnictwa pól
**KRYTYCZNE:** W bazie danych pole zawierające imię i nazwisko posiadacza nazywa się **`owner_name`**!

```
packages table:
- package_id (VARCHAR) - automatycznie generowane ID (YYYYMMDD-XX)
- owner_name (VARCHAR) - imię i nazwisko posiadacza (np. "Jan Kowalski")
- package_type (INT)   - typ pakietu (1-6)
```

W kodzie backend zawsze używaj `owner_name` do pracy z nazwiskiem klienta!

---

## 📄 System generowania PDF pakietów

**Status:** ✅ Zaimplementowany dla Pakietu 1 (Naturalna Harmonia)
**Data implementacji:** 2025-10-15

### Przegląd funkcjonalności

System umożliwia automatyczne generowanie spersonalizowanych PDF dla pakietów usługowych. PDF zawiera:
- **Stronę 1:** Graficzny wzór z dynamicznie wstawianymi danymi (ID, data, imię i nazwisko)
- **Stronę 2:** Statyczną listę usług wchodzących w skład pakietu

### Stack technologiczny PDF

- **Biblioteka:** TCPDF 6.10 (`tecnickcom/tcpdf`)
- **Format:** DL poziomy (210mm x 99mm)
- **Czcionka:** DejaVu Sans (wbudowana w TCPDF, wspiera polskie znaki)
- **Źródło tła:** Pliki JPG w `public/pdf-templates/`

### Struktura plików

```
public/pdf-templates/
├── pakiet-1-page1.jpg    # Strona 1 dla Pakietu 1 (Naturalna Harmonia)
└── pakiet-1-page2.jpg    # Strona 2 dla Pakietu 1 (lista usług)

app/Services/
└── PackagePdfService.php # Serwis generowania PDF

app/Http/Controllers/
└── PackageController.php # Endpoint generatePdf()

routes/
└── web.php              # Route: GET /packages/{id}/pdf
```

### Jak działa generowanie PDF

#### 1. Przycisk w UI (Show.tsx)
```tsx
<a
    href={route('packages.pdf', pkg.id)}
    target="_blank"
    className="..."
>
    📄 Pobierz PDF
</a>
```

#### 2. Endpoint w PackageController
```php
public function generatePdf(Package $package)
{
    $pdfService = new PackagePdfService();
    return $pdfService->downloadPdf($package);
}
```

#### 3. PackagePdfService - główna logika

**Inicjalizacja:**
```php
$this->pdf = new TCPDF('L', 'mm', [99, 210], true, 'UTF-8', false);
$this->pdf->setPrintHeader(false);
$this->pdf->setPrintFooter(false);
$this->pdf->SetMargins(0, 0, 0);
$this->pdf->SetAutoPageBreak(false, 0);
```

**Strona 1 - nakładanie danych:**
```php
// Ustaw tło JPG
$backgroundPath = public_path('pdf-templates/pakiet-1-page1.jpg');
$this->pdf->Image($backgroundPath, 0, 0, 210, 99, 'JPG', '', '', false, 300);

// Dodaj ID pakietu (fioletowe pole)
$this->pdf->SetFont('dejavusans', '', 10);
$this->pdf->SetXY(25, 52);
$this->pdf->Cell(50, 5, $package->package_id, 0, 0, 'C', false);

// Dodaj datę (niebieskie pole)
$this->pdf->SetXY(25, 60);
$dateText = $package->created_at->format('d.m.Y');
$this->pdf->Cell(50, 5, $dateText, 0, 0, 'C', false);

// Dodaj imię i nazwisko (różowe pole)
$this->pdf->SetFont('dejavusans', 'B', 13);
$this->pdf->SetXY(100, 56);
$this->pdf->Cell(100, 6, mb_strtoupper($package->owner_name, 'UTF-8'), 0, 0, 'C', false);
```

**Strona 2 - statyczne tło:**
```php
$this->pdf->AddPage();
$backgroundPath = public_path('pdf-templates/pakiet-1-page2.jpg');
$this->pdf->Image($backgroundPath, 0, 0, 210, 99, 'JPG', '', '', false, 300);
```

### Pozycjonowanie tekstu na PDF

**Układ współrzędnych TCPDF:**
- **X** - odległość od lewej krawędzi (mm)
- **Y** - odległość od górnej krawędzi (mm)
- **0,0** = lewy górny róg

**Aktualne pozycje dla Pakietu 1:**

| Element | X (mm) | Y (mm) | Rozmiar | Wyrównanie | Lokalizacja na wzorze |
|---------|--------|--------|---------|------------|----------------------|
| ID pakietu | 25 | 52 | 10pt | Centered | Fioletowe pole |
| Data utworzenia | 25 | 60 | 10pt | Centered | Niebieskie pole |
| Imię i nazwisko | 100 | 56 | 13pt Bold | Centered | Różowe pole |

**Jak dostosować pozycjonowanie:**

Edytuj `app/Services/PackagePdfService.php`, metoda `createPage1()`:

```php
// ID - zwiększ X żeby przesunąć w prawo, zwiększ Y żeby przesunąć w dół
$this->pdf->SetXY(25, 52);  // X=25mm, Y=52mm

// DATA
$this->pdf->SetXY(25, 60);  // X=25mm, Y=60mm

// IMIĘ I NAZWISKO
$this->pdf->SetXY(100, 56); // X=100mm, Y=56mm
```

### Dodawanie kolejnych pakietów (2-6)

**Krok 1:** Dodaj wzory JPG do `public/pdf-templates/`:
```
pakiet-2-page1.jpg
pakiet-2-page2.jpg
pakiet-3-page1.jpg
pakiet-3-page2.jpg
... itd.
```

**Krok 2:** Rozszerz `PackagePdfService.php`:

```php
public function generatePackagePdf(Package $package): string
{
    // Dynamicznie wybierz template na podstawie package_type
    $this->createPage1($package);
    $this->createPage2($package);

    return $this->pdf->Output('', 'S');
}

protected function createPage1(Package $package): void
{
    $this->pdf->AddPage();

    // Wybierz tło na podstawie typu pakietu
    $templateNumber = $package->package_type;
    $backgroundPath = public_path("pdf-templates/pakiet-{$templateNumber}-page1.jpg");

    $this->pdf->Image($backgroundPath, 0, 0, 210, 99, 'JPG', '', '', false, 300);

    // WAŻNE: Pozycje mogą się różnić dla każdego pakietu!
    // Dodaj switch/if dla różnych typów:

    switch ($package->package_type) {
        case 1:
            $this->addTextForPackage1($package);
            break;
        case 2:
            $this->addTextForPackage2($package);
            break;
        // ... itd.
    }
}

private function addTextForPackage1(Package $package)
{
    // Pozycje dla Pakietu 1 (jak jest teraz)
    $this->pdf->SetXY(25, 52);
    $this->pdf->Cell(50, 5, $package->package_id, 0, 0, 'C');
    // ... itd.
}

private function addTextForPackage2(Package $package)
{
    // Pozycje dla Pakietu 2 (do ustalenia)
    $this->pdf->SetXY(30, 55);  // Inne pozycje!
    $this->pdf->Cell(50, 5, $package->package_id, 0, 0, 'C');
    // ... itd.
}
```

**Krok 3:** Dla każdego nowego pakietu:
1. Otrzymaj wzory graficzne (JPG) dla strony 1 i 2
2. Stwórz zdjęcie wzoru z zaznaczonymi polami (jak dla Pakietu 1)
3. Określ dokładne współrzędne XY dla każdego pola
4. Dodaj metodę `addTextForPackageX()`
5. Przetestuj generowanie PDF

### Testowanie PDF lokalnie

**Metoda 1: Przez przeglądarkę**
```
1. Otwórz http://localhost/packages
2. Wybierz pakiet
3. Kliknij "📄 Pobierz PDF"
```

**Metoda 2: Przez kod testowy**
```php
// test-pdf.php
$package = Package::first();
$pdfService = new PackagePdfService();
$pdfContent = $pdfService->generatePackagePdf($package);
file_put_contents('test.pdf', $pdfContent);
```

**Metoda 3: Przez Tinker**
```bash
docker exec platformapakiety-laravel.test-1 php artisan tinker

$package = App\Models\Package::first();
$service = new App\Services\PackagePdfService();
$pdf = $service->generatePackagePdf($package);
file_put_contents('test.pdf', $pdf);
```

### Możliwe rozszerzenia

1. **Kod QR na PDF** - dodaj pakiet `bacon/bacon-qr-code`
2. **Watermark** - dodaj logo TermyGórce jako watermark
3. **Dynamiczna lista usług** - renderuj usługi z bazy zamiast statycznego JPG
4. **Email z PDF** - wysyłaj PDF automatycznie po utworzeniu pakietu
5. **Zapis w storage** - archiwizuj wygenerowane PDF w `storage/app/packages/`

### Troubleshooting

**Problem:** PDF się nie generuje
```bash
# Sprawdź logi
docker exec platformapakiety-laravel.test-1 tail -50 /var/www/html/storage/logs/laravel.log

# Sprawdź czy pliki JPG istnieją
ls -la public/pdf-templates/
```

**Problem:** Polskie znaki się nie wyświetlają
```php
// Upewnij się że używasz mb_strtoupper z UTF-8
mb_strtoupper($text, 'UTF-8')

// I że TCPDF ma ustawiony UTF-8
new TCPDF('L', 'mm', [99, 210], true, 'UTF-8', false);
```

**Problem:** Tekst jest w złym miejscu
```php
// Zmień współrzędne XY w createPage1()
$this->pdf->SetXY(X_MM, Y_MM);  // Zwiększ X=prawo, Y=dół
```

---

## 🔐 Bezpieczeństwo

**Status:** ✅ Zaimplementowane zabezpieczenia wielowarstwowe
**Data implementacji:** 2025-10-16

### Przegląd zabezpieczeń

System został zabezpieczony na **5 poziomach**:
1. ✅ **Rate Limiting** - ochrona przed automatycznym scrapowaniem
2. ✅ **Audit Logging** - pełny audyt dostępu do danych
3. ✅ **HTTPS wymuszony** - szyfrowanie komunikacji w production
4. ✅ **Session Encryption** - zaszyfrowane sesje użytkowników
5. ✅ **Encrypted Backups** - automatyczne backupy z szyfrowaniem GPG

---

### 1. Rate Limiting (Throttling)

**Cel:** Zapobieganie automatycznemu pobieraniu danych przez boty/skrypty

**Implementacja:** [routes/web.php:40](routes/web.php)
```php
Route::middleware(['auth', 'verified', 'throttle:60,1'])->group(function () {
    // Wszystkie endpointy pakietów
});
```

**Limity:**
- **60 requestów na minutę** na użytkownika
- Po przekroczeniu: HTTP 429 (Too Many Requests)
- Licznik resetuje się co minutę

**Co to chroni:**
- ❌ Masowe pobieranie danych klientów
- ❌ Scraping bazy pakietów
- ❌ Brute-force na formularzach

---

### 2. Audit Logging z IP Address

**Cel:** Śledzenie kto, kiedy i skąd dostępował wrażliwe dane

**Implementacja:** [app/Models/PackageLog.php](app/Models/PackageLog.php)

**Co jest logowane:**
```php
PackageLog {
    package_id: int,
    user_id: int,
    action_type: string,  // 'package_viewed', 'service_marked', etc.
    details: json,
    ip_address: string,   // 🆕 IPv4/IPv6
    created_at: timestamp
}
```

**Przykładowy log:**
```json
{
  "id": 123,
  "package_id": 45,
  "user_id": 2,
  "action_type": "package_viewed",
  "ip_address": "192.168.1.100",
  "created_at": "2025-10-16 14:30:22"
}
```

**Dostęp do logów:**
- W interfejsie: Szczegóły pakietu → zakładka "Historia"
- Przez bazę: `SELECT * FROM package_logs WHERE package_id = X`
- Przez Tinker: `PackageLog::where('action_type', 'package_viewed')->get()`

**Automatycznie logowane akcje:**
| Akcja | Trigger | Lokalizacja kodu |
|-------|---------|------------------|
| `package_created` | Utworzenie pakietu | PackageController@store:158 |
| `package_viewed` | Wyświetlenie szczegółów | PackageController@show:185 |
| `service_marked` | Zaznaczenie usługi | PackageServiceUsageController@toggle |
| `service_unmarked` | Odznaczenie usługi | PackageServiceUsageController@toggle |
| `pdf_generated` | Pobranie PDF | PackageController@generatePdf:332 |
| `owner_updated` | Zmiana posiadacza | PackageController@updateOwner:264 |
| `notes_updated` | Edycja uwag | PackageController@updateNotes:294 |

---

### 3. HTTPS wymuszony (Production)

**Cel:** Szyfrowanie komunikacji między przeglądarką a serwerem

**Implementacja:** [app/Providers/AppServiceProvider.php:27](app/Providers/AppServiceProvider.php)
```php
if ($this->app->environment('production')) {
    URL::forceScheme('https');
}
```

**Efekt:**
- Wszystkie URLe automatycznie `https://`
- Przekierowania używają HTTPS
- Cookies ustawione jako `secure`

**Konfiguracja dla production:**
```env
APP_ENV=production
APP_URL=https://yourdomain.com
```

---

### 4. Session Encryption

**Cel:** Ochrona danych sesji przed odczytem z bazy

**Konfiguracja:** [.env.example:33](.env.example)
```env
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true  # 🔐 Włączone szyfrowanie
```

**Co jest szyfrowane:**
- Dane sesji w tabeli `sessions`
- Flash messages
- Dane formularzy (old input)
- CSRF tokens

**Algorytm:** AES-256-CBC (Laravel Encryption)

---

### 5. Automatyczne Backupy z Szyfrowaniem

**Cel:** Ochrona backupów przed nieautoryzowanym dostępem

#### ⚠️ WAŻNE: Uniwersalny system (SQLite + MySQL)

**Status:** ✅ Wspiera oba środowiska (development + production)

**Skrypty:**
- [scripts/backup-database-universal.sh](scripts/backup-database-universal.sh) - **ZALECANY** dla dev i production
- [scripts/backup-database.sh](scripts/backup-database.sh) - Legacy (tylko SQLite)

#### Jak działa uniwersalny backup

**Auto-detekcja typu bazy z `.env`:**
```bash
DB_CONNECTION=sqlite  → Backup SQLite (cp + gpg)
DB_CONNECTION=mysql   → Backup MySQL (mysqldump + gpg)
```

**Development (SQLite):**
1. Kopiuje `database/database.sqlite`
2. Szyfruje GPG → `db_backup_YYYYMMDD_HHMMSS.sqlite.gpg`

**Production (MySQL):**
1. Eksportuje bazę → `mysqldump platformapakiety > backup.sql`
2. Szyfruje GPG → `db_backup_YYYYMMDD_HHMMSS.sql.gpg`

**Wspólne kroki:**
3. Usuwa niezaszyfrowaną kopię
4. Czyści backupy starsze niż 30 dni

#### Ręczne uruchomienie

**Development:**
```bash
docker exec platformapakiety-laravel.test-1 bash /var/www/html/scripts/backup-database-universal.sh
```

**Production:**
```bash
ssh user@your-server
cd /var/www/html
bash scripts/backup-database-universal.sh
```

**Automatyzacja (cron):**

**Development (Docker):**
```bash
docker exec -it platformapakiety-laravel.test-1 bash
crontab -e
# Dodaj:
0 3 * * * BACKUP_PASSWORD="$BACKUP_PASSWORD" /var/www/html/scripts/backup-database-universal.sh >> /var/www/html/storage/logs/backup.log 2>&1
```

**Production (serwer):**
```bash
ssh user@your-server
crontab -e
# Dodaj:
0 3 * * * cd /var/www/html && BACKUP_PASSWORD="YourPassword" bash scripts/backup-database-universal.sh >> storage/logs/backup.log 2>&1
```

#### Restore z backupu

**Skrypty:**
- [scripts/restore-database-universal.sh](scripts/restore-database-universal.sh) - **ZALECANY** (SQLite + MySQL)
- [scripts/restore-database.sh](scripts/restore-database.sh) - Legacy (tylko SQLite)

**Development:**
```bash
# Interaktywny (wybierz z listy)
docker exec -it platformapakiety-laravel.test-1 bash /var/www/html/scripts/restore-database-universal.sh

# Konkretny backup
docker exec -it platformapakiety-laravel.test-1 bash /var/www/html/scripts/restore-database-universal.sh db_backup_20251016_030000.sqlite.gpg
```

**Production:**
```bash
ssh user@your-server
cd /var/www/html

# Interaktywny
bash scripts/restore-database-universal.sh

# Konkretny backup (MySQL)
bash scripts/restore-database-universal.sh db_backup_20251021_030000.sql.gpg
```

**⚠️ Wymagane potwierdzenie:** Musisz wpisać `yes`

**⚠️ MySQL:** Restore **zastępuje całą bazę** (wszystkie tabele DROP+CREATE)

#### Konfiguracja hasła backupu

**W .env:**
```env
BACKUP_PASSWORD=YourSecureBackupPassword123!
```

**W docker-compose.yml:**
```yaml
environment:
  BACKUP_PASSWORD: '${BACKUP_PASSWORD:-ChangeThisPassword123!}'
```

**WAŻNE:**
- Użyj **silnego hasła** (min. 16 znaków)
- **NIE commituj** `.env` do Git
- Zapisz hasło w menedżerze haseł (LastPass, 1Password)

#### Dokumentacja skryptów

**Pełne przewodniki:**
- [scripts/README.md](scripts/README.md) - Dokumentacja wszystkich skryptów
- [BACKUP_PRODUCTION.md](BACKUP_PRODUCTION.md) - **⭐ Przewodnik MySQL dla production**

**BACKUP_PRODUCTION.md zawiera:**
- ✅ Porównanie SQLite vs MySQL
- ✅ Szczegółowa konfiguracja production
- ✅ Instalacja wymaganych narzędzi (mysqldump, gpg)
- ✅ Troubleshooting dla MySQL
- ✅ Eksport do chmury (S3, Google Drive)
- ✅ Checklist przed wdrożeniem

---

### Autentykacja

- **Wszystkie endpointy pakietów** wymagają autentykacji (`auth` middleware)
- **Publiczne pozostają tylko:** `/api/traffic` i `/api/alerts` (dla strony Astro)
- **Framework:** Laravel Breeze + Sanctum
- **Hasła:** Bcrypt (12 rounds - domyślnie z Laravel)

### Autoryzacja

**Każdy zalogowany pracownik może:**
- ✅ Dodawać pakiety
- ✅ Przeglądać wszystkie pakiety
- ✅ Zaznaczać wykorzystanie usług
- ✅ Generować PDF
- ✅ Edytować posiadaczy pakietów

**Admin może (do implementacji):**
- ⚠️ Usuwać pakiety
- ⚠️ Modyfikować typy pakietów
- ⚠️ Zarządzać użytkownikami

---

### Opcjonalne rozszerzenia (do przyszłej implementacji)

#### Opcja A: Szyfrowanie wrażliwych danych (owner_name)

**Kiedy wdrożyć:** Jeśli wymagane przez RODO/audyt

**Implementacja:**
```php
// app/Models/Package.php
protected $casts = [
    'owner_name' => 'encrypted',  // Automatyczne AES-256 encryption
];
```

**Plusy:**
- ✅ Ktoś kto ukradnie bazę zobaczy tylko gibberish
- ✅ Zero zmian w kodzie aplikacji
- ✅ Używa APP_KEY z .env

**Minusy:**
- ❌ Wyszukiwanie po zaszyfrowanych polach wymaga dodatkowego hash index
- ❌ Jeśli ktoś ukradnie .env + bazę = ma wszystko

---

#### Opcja B: Database File Encryption (SQLCipher)

**Kiedy wdrożyć:** Dla maksymalnego bezpieczeństwa

**Implementacja:** Wymaga custom PDO drivera (skomplikowane)

**Plusy:**
- ✅ Cała baza zaszyfrowana na poziomie pliku (AES-256)
- ✅ Nawet root nie odczyta bez hasła

**Minusy:**
- ❌ Wymaga kompilacji PHP extension
- ❌ Trudniejsze w maintenance

**Status:** Odłożone (backup encryption wystarcza)

---

#### Opcja C: Dual Database Approach

**Kiedy wdrożyć:** Dla compliance z RODO

**Implementacja:**
```php
// Dane operacyjne w database.sqlite
'sqlite' => [ /* normalne dane */ ],

// Dane osobowe w oddzielnej bazie
'sqlite_sensitive' => [
    'database' => database_path('sensitive.sqlite'),
    'password' => env('DB_SENSITIVE_PASSWORD'),
],
```

**Plusy:**
- ✅ Wyciek głównej bazy ≠ wyciek danych osobowych
- ✅ Łatwiejsze RODO compliance (oddzielne backupy/usuwanie)

**Minusy:**
- ❌ Wymaga refaktoryzacji modeli
- ❌ Joins między bazami są trudniejsze

---

### Checklist zabezpieczeń dla Production

#### Przed uruchomieniem:
- [ ] Ustaw `APP_ENV=production` w `.env`
- [ ] Wygeneruj nowy `APP_KEY`: `php artisan key:generate`
- [ ] Ustaw silne `BACKUP_PASSWORD` (min. 16 znaków)
- [ ] Włącz `SESSION_ENCRYPT=true`
- [ ] Skonfiguruj HTTPS (certyfikat SSL)
- [ ] Ustaw `APP_DEBUG=false`
- [ ] Skonfiguruj cron dla automatycznych backupów
- [ ] Przetestuj restore z backupu

#### Po uruchomieniu:
- [ ] Monitoruj logi: `storage/logs/laravel.log`
- [ ] Sprawdzaj logi backupów: `storage/logs/backup.log`
- [ ] Regularnie przeglądaj `package_logs` (audyt dostępu)
- [ ] Testuj restore z backupu raz na kwartał
- [ ] Eksportuj backupy do chmury (S3/Google Drive)

#### Regularne przeglądy (co miesiąc):
- [ ] Sprawdź czy backupy działają: `ls storage/backups/`
- [ ] Przejrzyj podejrzane logi IP: `SELECT * FROM package_logs WHERE ...`
- [ ] Zmień `BACKUP_PASSWORD` co 90 dni
- [ ] Usuń stare backupy ręcznie jeśli za dużo miejsca

---

### Monitorowanie bezpieczeństwa

#### Sprawdź ostatnie dostępy do pakietów:
```sql
SELECT
    pl.created_at,
    u.name as user,
    pl.ip_address,
    p.owner_name as package_owner,
    pl.action_type
FROM package_logs pl
JOIN users u ON pl.user_id = u.id
JOIN packages p ON pl.package_id = p.id
WHERE pl.action_type = 'package_viewed'
ORDER BY pl.created_at DESC
LIMIT 50;
```

#### Sprawdź podejrzane IP (wiele requestów):
```sql
SELECT
    ip_address,
    COUNT(*) as request_count,
    MIN(created_at) as first_seen,
    MAX(created_at) as last_seen
FROM package_logs
GROUP BY ip_address
HAVING request_count > 100
ORDER BY request_count DESC;
```

#### Sprawdź backupy:
```bash
docker exec platformapakiety-laravel.test-1 bash -c "
  echo 'Total backups:' \$(ls -1 /var/www/html/storage/backups/*.gpg 2>/dev/null | wc -l)
  echo 'Total size:' \$(du -sh /var/www/html/storage/backups/ 2>/dev/null)
  echo 'Latest backup:' \$(ls -t /var/www/html/storage/backups/*.gpg 2>/dev/null | head -1)
"
```

---

### Kontakt w razie incydentu

**Podejrzany dostęp:**
1. Sprawdź logi: `package_logs` tabela
2. Zidentyfikuj IP: `SELECT * FROM package_logs WHERE ip_address = 'X.X.X.X'`
3. Zablokuj użytkownika jeśli potrzeba
4. Zmień `APP_KEY` i `BACKUP_PASSWORD`

**Utrata danych:**
1. Natychmiast uruchom restore: `./scripts/restore-database.sh`
2. Sprawdź integralność: `sqlite3 database.sqlite "PRAGMA integrity_check;"`
3. Powiadom zespół

**Wyciek backupu:**
1. Dane są zaszyfrowane GPG (AES-256)
2. Bez `BACKUP_PASSWORD` są bezużyteczne
3. Zmień hasło backupu natychmiast
4. Usuń skompromitowane backupy

---

## 📚 Dodatkowe zasoby

### Dokumentacja projektu
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Pełny przewodnik deployment (WinSCP, SSH, production setup)
- **[SECURITY.md](SECURITY.md)** - Polityka bezpieczeństwa i raportowanie błędów
- **[scripts/README.md](scripts/README.md)** - Dokumentacja skryptów backup/restore

### Dokumentacja zewnętrzna
- [Laravel 11 Documentation](https://laravel.com/docs/11.x)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Inertia.js Documentation](https://inertiajs.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Ostatnia aktualizacja:** 2025-10-13
**Autor:** Zespół deweloperski TermyGorce Kamil + Michał (jeśli to czytasz to pozdrawiam)
