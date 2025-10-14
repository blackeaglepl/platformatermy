# Platforma Pakiety - TermyGorce Admin Panel

Panel administracyjny do zarządzania komunikatami, informacją o ruchu oraz pakietami usług dla strony TermyGorce.

## 🚀 Szybki start

### Wymagania
- **Docker Desktop** (uruchomiony)
- **Node.js** v22.x
- **Git**

### Pierwsze uruchomienie

#### Opcja 1: Użyj skryptu setup (ZALECANE)
Kliknij dwukrotnie plik `setup.bat` lub uruchom w terminalu:
```bash
setup.bat
```

#### Opcja 2: Ręczna instalacja
```bash
# 1. Skopiuj .env
copy .env.example .env

# 2. Zainstaluj Composer dependencies
docker run --rm -v "%cd%:/var/www/html" -w /var/www/html laravelsail/php83-composer:latest composer install --ignore-platform-reqs

# 3. Uruchom Laravel Sail
vendor\bin\sail up -d

# 4. Wygeneruj klucz aplikacji
vendor\bin\sail artisan key:generate

# 5. Wykonaj migracje
vendor\bin\sail artisan migrate

# 6. Zainstaluj NPM dependencies
npm install
```

---

## 🎮 Komendy start projektu

### Windows - Pliki .bat 

| Komenda | Opis |
|---------|------|
| `start.bat` | Uruchamia Laravel Sail + Vite dev server |
| `stop.bat` | Zatrzymuje wszystkie kontenery |
| `logs.bat` | Wyświetla logi z kontenerów |
| `setup.bat` | Pierwsza instalacja projektu |

### NPM Scripts

```bash
# Uruchom wszystko jedną komendą (Sail + Vite)
npm start

# Tylko Vite dev server (jeśli Sail już działa)
npm run dev

# Build produkcyjny
npm run build

# Zarządzanie Laravel Sail
npm run sail:up      # Uruchom kontenery w tle
npm run sail:down    # Zatrzymaj kontenery
npm run sail:logs    # Wyświetl logi
```

### Bezpośrednie komendy Laravel Sail

```bash
# Uruchom kontenery
vendor\bin\sail up -d

# Zatrzymaj kontenery
vendor\bin\sail down

# Logi
vendor\bin\sail logs -f

# Artisan commands
vendor\bin\sail artisan [command]

# Dostęp do kontenera
vendor\bin\sail shell
```

---

## 🌐 Dostęp do aplikacji

Po uruchomieniu `start.bat` lub `npm start`:

- **Laravel App:** http://localhost
- **Vite Dev Server:** http://localhost:5173
- **MySQL:** localhost:3306
- **Redis:** localhost:6379

---

## 📂 Struktura projektu

```
PlatformaPakiety/
├── app/                    # Laravel backend
│   ├── Http/Controllers/   # Kontrolery
│   ├── Models/            # Modele Eloquent
│   └── Enums/             # Enumy (AlertType, etc.)
├── database/
│   ├── migrations/        # Migracje bazy danych
│   └── seeders/           # Seedery
├── resources/
│   └── js/                # React/TypeScript frontend
│       ├── Pages/         # Komponenty stron (Inertia)
│       ├── Layouts/       # Layouty
│       └── types/         # TypeScript types
├── routes/
│   ├── web.php            # Routing Inertia
│   └── api.php            # API dla strony Astro
├── *.bat                  # Skrypty Windows
└── task.md                # Zarządzanie zadaniami
```

---

## 📝 Dokumentacja

- **[SETUP.md](SETUP.md)** - 🚀 **INSTRUKCJA URUCHAMIANIA** (START TUTAJ!)
- **[CLAUDE.md](CLAUDE.md)** - Pełna dokumentacja projektu
- **[task.md](task.md)** - Zarządzanie zadaniami i progress tracking

---

## 🛠️ Development Workflow

### Codzienne uruchamianie
1. Upewnij się że **Docker Desktop** jest uruchomiony
2. Kliknij dwukrotnie `start.bat` lub uruchom `npm start`
3. Otwórz http://localhost w przeglądarce

### Po zakończeniu pracy
- Uruchom `stop.bat` lub `npm run sail:down`
- Lub zostaw kontenery włączone (nie zużywają dużo zasobów)

### Hot reload
- Vite automatycznie przeładowuje zmiany w plikach `.tsx`, `.ts`, `.css`
- Nie musisz restartować serwera po zmianie kodu frontend

### Migracje bazy danych
```bash
# Nowa migracja
vendor\bin\sail artisan make:migration create_table_name

# Wykonaj migracje
vendor\bin\sail artisan migrate

# Rollback
vendor\bin\sail artisan migrate:rollback
```

---

## 🧪 Testing

```bash
# Uruchom testy (Pest PHP)
vendor\bin\sail test

# Konkretny test
vendor\bin\sail test --filter=PackageTest

# Code formatting (Laravel Pint)
vendor\bin\sail pint
```

---

## 🔒 Bezpieczeństwo

### ⚠️ NIE ZMIENIAĆ
- Endpointy `/api/traffic` i `/api/alerts` (używane przez stronę Astro)
- Modele: `Alert`, `Traffic`
- Istniejące migracje w `database/migrations/`

---

## 🐛 Troubleshooting

**Zobacz szczegółowe rozwiązania w [SETUP.md](SETUP.md#-rozwiązywanie-problemów)**

### Najczęstsze problemy:
- ❌ "ERR_CONNECTION_REFUSED" → Docker nie działa lub Vite nie uruchomiony
- ❌ "Port 5173 already in use" → Zabij proces na porcie 5173
- ❌ "Docker Desktop is not running" → Uruchom Docker Desktop
- ❌ Błędy node_modules → Uruchom `docker exec platformapakiety-laravel.test-1 npm install`

**Uniwersalne rozwiązanie:**
```bash
stop.bat
start.bat
```

---

## 👥 Team

**Zespół deweloperski TermyGórce**

**Stack:**
- Laravel 11.34 + PHP 8.2
- React 18.2 + TypeScript 5.0
- Vite 5.0 + Tailwind CSS 3
- Docker + MySQL + Redis

---

**Ostatnia aktualizacja:** 2025-10-13
