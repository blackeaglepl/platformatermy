# 🚂 Railway Deployment Guide (Branch: railway-test)

## ⚠️ WAŻNE: To jest branch testowy!

Ten branch (`railway-test`) zawiera konfigurację do testowego deploymentu na Railway.
**Master branch pozostaje czysty** - nie ma tam żadnych plików Railway.

## 📋 Dodane pliki (tylko w tym branchu)

- `Procfile` - Komenda startowa dla Railway
- `railway.json` - Konfiguracja Railway
- `nixpacks.toml` - Build configuration (PHP 8.2, Node.js 22)
- `.env.railway.example` - Przykładowa konfiguracja dla Railway
- `RAILWAY_DEPLOYMENT.md` - Ten plik

## 🚀 Deployment krok po kroku

### 1. Zainstaluj Railway CLI

**Windows (PowerShell/CMD):**
```powershell
npm install -g @railway/cli
```

**Git Bash:**
```bash
npm install -g @railway/cli
```

### 2. Login do Railway

```bash
railway login
```

Otworzy się przeglądarka - zaloguj się przez GitHub/Email.

### 3. Inicjalizacja projektu

**W katalogu projektu (branch railway-test):**
```bash
cd f:\Windsurf\PlatformaPakiety
git checkout railway-test  # upewnij się że jesteś na tym branchu

railway init
```

**Wybierz:**
- Create new project
- Nazwa: `platformapakiety-test`

### 4. Dodaj MySQL

**W dashboard Railway (https://railway.app):**
1. Otwórz projekt `platformapakiety-test`
2. Kliknij "New" → "Database" → "Add MySQL"
3. Poczekaj na provisioning (30-60 sekund)

**Albo przez CLI:**
```bash
railway add
# Wybierz: MySQL
```

### 5. Ustaw zmienne środowiskowe

**W Railway dashboard:**
1. Kliknij na swój service (nie MySQL)
2. Zakładka "Variables"
3. Dodaj:

```env
APP_KEY=base64:WYGENERUJ_PRZEZ_ARTISAN
BACKUP_PASSWORD=jakies-silne-haslo-123
```

**Generowanie APP_KEY lokalnie:**
```bash
docker exec platformapakiety-laravel.test-1 php artisan key:generate --show
```

Skopiuj wynik (z `base64:...`) do Railway.

### 6. Deploy!

```bash
railway up
```

**Albo automatycznie z GitHub:**
1. W Railway dashboard: Settings → Connect GitHub
2. Wybierz: `PlatformaPakiety` repo
3. Branch: `railway-test`
4. Auto-deploy: ON

Każdy `git push` na `railway-test` → automatyczny redeploy!

### 7. Uruchom migracje

**Po pierwszym deploymencie:**
```bash
railway run php artisan migrate --force
```

**Albo przez dashboard:**
1. Service → Settings → Add command
2. Typ: "One-off"
3. Komenda: `php artisan migrate --force`

### 8. Stwórz pierwszego użytkownika

**Przez Tinker:**
```bash
railway run php artisan tinker
```

**W Tinkerze:**
```php
$user = new App\Models\User();
$user->name = 'Admin';
$user->email = 'admin@example.com';
$user->password = bcrypt('password123');
$user->email_verified_at = now();
$user->save();
```

### 9. Otwórz aplikację

```bash
railway open
```

Dostaniesz URL typu: `https://platformapakiety-test-production.up.railway.app`

---

## 🔄 Jak wrócić do master (po testach)

```bash
# Przełącz się z powrotem na master
git checkout master

# railway-test branch dalej istnieje, ale nie wpływa na master
# Master jest CZYSTY bez plików Railway!
```

---

## 🗑️ Usunięcie testowego deploymentu

**Usuń projekt z Railway:**
1. Railway dashboard → Projekt → Settings → Danger → Delete Project

**Usuń branch lokalnie (opcjonalnie):**
```bash
git branch -D railway-test
```

---

## 🐛 Troubleshooting

### Build fails: "php: command not found"
**Rozwiązanie:** Railway auto-wykrywa PHP z `composer.json`. Sprawdź czy plik istnieje.

### Database connection error
**Rozwiązanie:** Upewnij się że MySQL service jest dodany i zmienne `MYSQL*` są automatycznie dostępne.

### 500 error po deploymencie
**Sprawdź logi:**
```bash
railway logs
```

Najczęstsze przyczyny:
- Brak `APP_KEY`
- Nie uruchomione migracje
- Błąd w `.env`

### Vite assets nie działają
**Rozwiązanie:** W `nixpacks.toml` mamy `npm run build` - sprawdź czy działa lokalnie:
```bash
docker exec platformapakiety-laravel.test-1 npm run build
```

---

## 💰 Koszty (darmowy tier)

**Railway Free Plan:**
- $5 kredytu miesięcznie (wystarczy na ~500h)
- Po wyczerpaniu: aplikacja sleep (nie usuwa się)
- MySQL: 1GB storage (wystarczy na testy)

**Estymowane zużycie:**
- Aplikacja Laravel: ~$0.01/godzina
- MySQL: gratis (1GB)
- **Razem:** ~$0.24/dzień (~$7.20/miesiąc)

**Wniosek:** Darmowego tieru **NIE wystarczy** na 24/7, ale **wystarczy na testy** (włącz tylko gdy testujesz).

**Wyłącz gdy nie testujesz:**
```bash
railway down
```

**Włącz ponownie:**
```bash
railway up
```

---

## 📞 Pomoc

**Railway Discord:** https://discord.gg/railway
**Dokumentacja:** https://docs.railway.app

---

**Ostatnia aktualizacja:** 2025-10-21
**Branch:** railway-test
**Master:** CZYSTY (bez Railway plików)
