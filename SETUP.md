# Instrukcja uruchamiania projektu TermyGórce Admin

## 🚀 Szybki start

### Wymagania wstępne
- **Docker Desktop** - musi być uruchomiony przed startem projektu
- **Windows 10/11** - projekt skonfigurowany dla Windows

### Uruchamianie projektu

#### Opcja 1: Automatyczne uruchomienie (Zalecane)
Kliknij dwukrotnie na plik:
```
start.bat
```

Skrypt automatycznie:
1. Sprawdzi czy Docker Desktop jest uruchomiony
2. Uruchomi kontenery Docker (Laravel + Vite)
3. Zainstaluje/zaktualizuje zależności npm w kontenerze
4. Uruchomi serwer Vite dla Hot Module Replacement (HMR)

#### Opcja 2: Manualne uruchomienie
```bash
# 1. Uruchom kontenery
docker compose up -d

# 2. Zainstaluj zależności (tylko przy pierwszym uruchomieniu lub po zmianach w package.json)
docker exec platformapakiety-laravel.test-1 npm install

# 3. Uruchom Vite dev server
docker exec platformapakiety-laravel.test-1 npm run dev
```

### Dostęp do aplikacji
Po uruchomieniu otwórz przeglądarkę:
- **Aplikacja:** http://localhost
- **Login/Dashboard:** http://localhost/login

### Zatrzymywanie projektu

#### Opcja 1: Automatyczne zatrzymanie (Zalecane)
Kliknij dwukrotnie na plik:
```
stop.bat
```

#### Opcja 2: Manualne zatrzymanie
```bash
# Naciśnij Ctrl+C w oknie z Vite (jeśli jest uruchomione)
# Następnie zatrzymaj kontenery:
docker compose down
```

---

## 🔧 Rozwiązywanie problemów

### Problem: "Port 5173 is already in use"
**Rozwiązanie:**
```powershell
# W PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

### Problem: "Docker Desktop is not running"
**Rozwiązanie:**
1. Uruchom Docker Desktop z menu Start
2. Poczekaj aż ikona w tray przestanie się obracać (30-60s)
3. Uruchom ponownie `start.bat`

### Problem: **BIAŁY EKRAN** w przeglądarce (NAJCZĘSTSZY!)
**Objawy:**
- Strona ładuje się, ale widzisz tylko biały ekran
- W konsoli przeglądarki (F12) widzisz błędy typu "Failed to fetch" lub "net::ERR_CONNECTION_REFUSED" dla `http://localhost:5173`

**Przyczyna:**
Vite dev server nie jest uruchomiony. Laravel generuje HTML poprawnie, ale przeglądarka nie może pobrać plików JavaScript z Vite.

**Rozwiązanie:**
```bash
# Uruchom Vite dev server w kontenerze
docker exec -d platformapakiety-laravel.test-1 npm run dev

# Poczekaj 5 sekund i odśwież stronę (F5) w przeglądarce
```

**Jak tego uniknąć w przyszłości:**
Zawsze używaj `start.bat` - automatycznie uruchamia Vite w osobnym oknie.

---

### Problem: "ERR_CONNECTION_REFUSED" w przeglądarce
**Możliwe przyczyny:**
1. Kontenery nie są uruchomione
   ```bash
   docker ps  # Sprawdź czy kontener działa
   ```
2. Vite nie jest uruchomiony (patrz sekcja "BIAŁY EKRAN" powyżej)

**Rozwiązanie:**
```bash
# Zatrzymaj wszystko i uruchom od nowa
stop.bat
start.bat
```

### Problem: Błędy związane z node_modules
**Rozwiązanie:**
```bash
# Usuń volume z node_modules i zainstaluj ponownie
docker compose down -v
docker compose up -d
docker exec platformapakiety-laravel.test-1 npm install
docker exec platformapakiety-laravel.test-1 npm run dev
```

---

## 📚 Komendy pomocnicze

### Przydatne komendy Docker

```bash
# Zobacz uruchomione kontenery
docker ps

# Zobacz logi kontenera Laravel
docker logs platformapakiety-laravel.test-1

# Zobacz logi w czasie rzeczywistym
docker logs -f platformapakiety-laravel.test-1

# Wejdź do kontenera (bash)
docker exec -it platformapakiety-laravel.test-1 bash

# Uruchom komendy Artisan
docker exec platformapakiety-laravel.test-1 php artisan migrate
docker exec platformapakiety-laravel.test-1 php artisan tinker

# Restart kontenera
docker restart platformapakiety-laravel.test-1

# Usuń wszystko włącznie z volumes
docker compose down -v
```

### Przydatne komendy npm (w kontenerze)

```bash
# Instalacja zależności
docker exec platformapakiety-laravel.test-1 npm install

# Update zależności
docker exec platformapakiety-laravel.test-1 npm update

# Build produkcyjny
docker exec platformapakiety-laravel.test-1 npm run build

# Uruchom dev server
docker exec platformapakiety-laravel.test-1 npm run dev
```

---

## 🏗️ Architektura projektu

### Struktura kontenerów
- **Laravel Container** (`platformapakiety-laravel.test-1`)
  - PHP 8.4
  - Laravel 11.34
  - Node.js v22 (dla Vite)
  - Port: 80 → http://localhost
  - Port: 5173 → Vite HMR

### Volumes
- **Kod aplikacji:** `./` → `/var/www/html` (bind mount)
- **Node modules:** `sail-node-modules` → `/var/www/html/node_modules` (named volume)
  - **WAŻNE:** node_modules jest w osobnym volume dla kompatybilności Windows ↔ Linux

### Baza danych
- **Typ:** SQLite
- **Lokalizacja:** `database/database.sqlite`
- **Konfiguracja:** `.env` → `DB_CONNECTION=sqlite`

---

## 🔑 Kluczowe różnice vs standardowe Laravel

### 1. Vite musi być uruchomiony W KONTENERZE
❌ **NIE DZIAŁA:**
```bash
npm run dev  # Uruchomione na Windowsie
```

✅ **DZIAŁA:**
```bash
docker exec platformapakiety-laravel.test-1 npm run dev  # W kontenerze
```

**Powód:** Vite w kontenerze nasłuchuje na `0.0.0.0:5173` z HMR skonfigurowanym na `localhost` - dzięki temu Hot Module Replacement działa z przeglądarki na Windows.

### 2. Konfiguracja Vite (vite.config.js)
```javascript
server: {
    host: '0.0.0.0',    // Listen na wszystkich interfejsach (Docker)
    port: 5173,
    strictPort: true,
    hmr: {
        host: 'localhost',  // HMR dla przeglądarki Windows
    },
    watch: {
        usePolling: true,   // Lepsze wykrywanie zmian na Windows
    },
}
```

### 3. Named volume dla node_modules
W `docker-compose.yml`:
```yaml
volumes:
    - '.:/var/www/html'
    - 'sail-node-modules:/var/www/html/node_modules'  # KRYTYCZNE
```

**Powód:** Rozwiązuje problemy z kompatybilnością binarnych pakietów npm między Windows a Linux (rollup, esbuild, etc.)

---

## 📝 Workflow deweloperski

### Typowy dzień pracy

```bash
# 1. Rano - uruchom projekt
start.bat

# 2. Pracuj normalnie - HMR działa automatycznie
# Edytuj pliki w VSCode/Windsurf, zmiany widoczne od razu w przeglądarce

# 3. Jeśli dodajesz nową zależność npm
docker exec platformapakiety-laravel.test-1 npm install nazwa-pakietu

# 4. Jeśli zmieniasz strukturę bazy danych
docker exec platformapakiety-laravel.test-1 php artisan migrate

# 5. Wieczorem - zatrzymaj projekt
stop.bat
# LUB po prostu zamknij okno z Vite (kontenery będą dalej działać)
```

### Edytowanie kodu
- Używaj normalnego edytora na Windows (VSCode, Windsurf)
- Pliki są synchronizowane na żywo do kontenera
- HMR (Hot Module Replacement) działa automatycznie
- Nie ma potrzeby restartu - wszystko działa w locie

---

## 🌐 Publiczne API (dla strony Astro)

⚠️ **NIE ZMIENIAĆ** - te endpointy są używane przez stronę główną Astro

### GET /api/traffic
Zwraca aktualne natężenie ruchu (integer)

### GET /api/alerts
Zwraca aktywne alerty (JSON array)

---

## 📞 Wsparcie

Jeśli masz problemy:
1. Sprawdź sekcję "Rozwiązywanie problemów" powyżej
2. Sprawdź logi: `docker logs platformapakiety-laravel.test-1`
3. Zobacz czy Docker Desktop jest uruchomiony
4. Spróbuj restart: `stop.bat` → `start.bat`

---

**Ostatnia aktualizacja:** 2025-10-14
**Przygotował:** Claude Code AI Assistant
