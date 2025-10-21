# Naprawa błędu 500 na Railway

## Status aktualny
✅ Baza danych MySQL - działa
✅ Migracje - wykonane poprawnie
✅ Serwer PHP - uruchomiony
✅ Pliki statyczne (favicon) - działają
❌ Trasy Laravel - zwracają 500

## Szybka naprawa - Dodaj brakujące zmienne

### Krok 1: Otwórz Railway Dashboard
1. Wejdź na https://railway.app/dashboard
2. Wybierz projekt `elegant-appreciation`
3. Kliknij serwis `mindful-essence`
4. Przejdź do zakładki **Variables**

### Krok 2: Dodaj następujące zmienne

Kliknij **+ New Variable** i dodaj każdą z poniższych:

```
APP_URL=https://mindful-essence-production.up.railway.app
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

### Krok 3: Redeploy
Po dodaniu zmiennych, Railway automatycznie zrobi redeploy.
Jeśli nie, kliknij **Deploy** → **Redeploy**.

---

## Jeśli nadal 500 - Problem z Vite/Inertia

### Opcja A: Wyłącz config cache podczas startu

Problem: Laravel może cachować config z błędnymi wartościami.

**Rozwiązanie:** Zmodyfikuj `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "nixpacksConfigPath": "nixpacks.toml"
  },
  "deploy": {
    "startCommand": "sh -c 'sleep 5 && php artisan config:clear && php artisan migrate --force && php -S 0.0.0.0:${PORT:-8080} -t public'",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Zmiana:** Przeniesiono `config:clear` PRZED `migrate` (żeby wyczyścić cache przed użyciem bazy).

---

### Opcja B: Sprawdź logi Laravel (jeśli nadal 500)

W Railway Dashboard:
1. Zakładka **Deployments**
2. Kliknij najnowszy deployment
3. Zakładka **View Logs**
4. Szukaj szczegółów błędu 500

**Lub przez CLI:**
```bash
railway logs --service mindful-essence --lines 100
```

---

### Opcja C: Tymczasowo włącz szczegółowe błędy

W Railway Variables zmień:
```
APP_DEBUG=true  # (już ustawione)
LOG_LEVEL=debug # (dodaj jeśli brak)
```

Następnie odwiedź stronę i sprawdź logi - powinny pokazać dokładny błąd.

---

## Najczęstsze przyczyny 500 w Laravel + Inertia na Railway

### 1. Brakujący Vite manifest
**Objaw:** `public/build/manifest.json` nie istnieje
**Fix:** Upewnij się że w `Dockerfile` jest `RUN npm run build`

### 2. Błędne uprawnienia storage
**Objaw:** `Permission denied` w logach
**Fix:** W `Dockerfile` dodaj `RUN chmod -R 777 storage bootstrap/cache`

### 3. Brakujący APP_KEY
**Objaw:** `No application encryption key has been specified`
**Fix:** Sprawdź czy `APP_KEY` w Variables zaczyna się od `base64:`

### 4. Inertia nie znajduje komponentów React
**Objaw:** `Component not found` w logach
**Fix:** Sprawdź czy `npm run build` się wykonał podczas build

---

## Debug krok po kroku

### 1. Sprawdź czy APP_URL jest ustawiony
```bash
railway variables | grep APP_URL
```
Powinno być: `https://mindful-essence-production.up.railway.app`

### 2. Sprawdź logi PHP
```bash
railway logs --service mindful-essence --lines 50 | grep "PHP"
```

### 3. Sprawdź czy migrations się wykonały
```bash
railway run php artisan migrate:status
```

### 4. Wyczyść wszystkie cache
Dodaj do `startCommand`:
```bash
php artisan cache:clear && php artisan config:clear && php artisan route:clear && php artisan view:clear
```

---

## Kontakt jeśli potrzebujesz pomocy

Jeśli nadal masz problem, wyślij mi:
1. Screenshot zakładki Variables w Railway
2. Ostatnie 100 linii logów: `railway logs --service mindful-essence --lines 100`
3. Screenshot błędu 500 w przeglądarce (F12 → Network → Request details)

---

**Ostatnia aktualizacja:** 2025-10-21
