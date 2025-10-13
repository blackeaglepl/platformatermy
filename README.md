# Platforma Pakiety - TermyGórce Admin Panel

Panel administracyjny do zarządzania komunikatami, informacją o ruchu oraz pakietami usług dla strony TermyGórce.

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

## 🎮 Komendy uruchomieniowe

### Windows - Pliki .bat (NAJPROSTSZE)

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

- **[claude.md](claude.md)** - Pełna dokumentacja projektu
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

## 🚀 Production Build

### Deployment (Docker)

Gdy projekt jest gotowy do wdrożenia na produkcję:

```bash
# 1. Zbuduj production assets (Vite)
npm run build

# 2. W środowisku produkcyjnym - użyj docker-compose.yml
# Vite dev server NIE jest potrzebny - używamy zbudowanych plików z /public/build
```

### Różnica Development vs Production

| Środowisko | Vite | Laravel | Opis |
|------------|------|---------|------|
| **Development** | `npm run dev` (port 5173) | Sail (port 80) | Hot reload, debugging |
| **Production** | **Nie działa** | Docker/Nginx | Używa plików z `public/build/` |

**Kluczowe:**
- **Development:** `vite.config.js` → `server: { host: 'localhost' }` - działa TYLKO lokalnie
- **Production:** `npm run build` → generuje statyczne pliki w `public/build/`
- Laravel automatycznie wykrywa czy Vite dev server działa i używa odpowiednich źródeł

### Environment Variables

```bash
# .env (development)
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

# .env.production (production)
APP_ENV=production
APP_DEBUG=false
APP_URL=https://admin.termygorce.pl
```

---

## 🔒 Bezpieczeństwo

### ⚠️ NIE ZMIENIAĆ
- Endpointy `/api/traffic` i `/api/alerts` (używane przez stronę Astro)
- Modele: `Alert`, `Traffic`
- Istniejące migracje w `database/migrations/`

---

## 🐛 Troubleshooting

### "Docker Desktop is not running"
- Uruchom Docker Desktop i poczekaj aż się zainicjalizuje

### "Port 80 already in use"
- Zatrzymaj inne serwery używające portu 80
- Lub zmień port w `docker-compose.yml`

### "npm run dev" nie działa
- Sprawdź czy `node_modules` istnieją: `ls node_modules`
- Jeśli nie, uruchom: `npm install`

### Kontenery nie startują
```bash
# Sprawdź status
vendor\bin\sail ps

# Sprawdź logi
vendor\bin\sail logs

# Restart kontenerów
vendor\bin\sail down
vendor\bin\sail up -d
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
