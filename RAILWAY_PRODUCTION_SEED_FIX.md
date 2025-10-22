# Ochrona danych produkcyjnych przed czyszczeniem przy redeployach

## ⚠️ PROBLEM

**Obecna konfiguracja USUWA dane użytkowników przy każdym redeployu!**

### Co się dzieje teraz:

```
1. Railway redeploy → uruchamia: php artisan migrate --force --seed
2. RealPackageServicesSeeder uruchamia się
3. Seeder USUWA wszystkie dane z tabel:
   ❌ package_service_usage (zaznaczenia użytkowników!)
   ❌ package_type_services (definicje pakietów)
   ❌ package_services (lista usług)
4. Seeder dodaje z powrotem usługi i definicje
5. ALE dane użytkowników (zaznaczenia) są STRACONE!
```

**Lokalizacja problemu:**
- **[railway.json:8](railway.json#L8)** - zawiera `--seed` flag
- **[RealPackageServicesSeeder.php:17-19](database/seeders/RealPackageServicesSeeder.php#L17-L19)** - zawiera `DB::table(...)->delete()`

---

## ✅ ROZWIĄZANIA

### Rozwiązanie 1: Usuń `--seed` (ZALECANE dla produkcji)

**Kiedy użyć:** Gdy baza jest już wypełniona usługami i masz rzeczywistych użytkowników

**Kroki:**

#### 1. Edytuj `railway.json`

**ZMIEŃ:**
```json
"startCommand": "sh -c \"php artisan config:clear && php artisan migrate --force --seed && php artisan serve --host 0.0.0.0 --port $PORT\""
```

**NA:**
```json
"startCommand": "sh -c \"php artisan config:clear && php artisan migrate --force && php artisan serve --host 0.0.0.0 --port $PORT\""
```

**Różnica:** Usuń `--seed`

#### 2. Commit i push

```bash
git add railway.json
git commit -m "fix: Remove --seed from Railway startCommand for production

CRITICAL: Prevents data loss on redeployment.

Seeders were deleting all package_service_usage records
(user service checkmarks) on every deploy.

With this change:
- Database persists across deploys
- User data is safe
- Migrations still run automatically
- Seeders only run manually when needed
"
git push origin railway-test
```

#### 3. Poczekaj na redeploy

Railway wykryje zmianę i zrobi redeploy (~2-3 min).

#### 4. Weryfikacja

- Zaznacz usługę w pakiecie
- Redeploy aplikacji (zmień coś w kodzie i push)
- Sprawdź czy zaznaczenie **przetrwało** ✅

---

### Rozwiązanie 2: Inteligentny seeder (ALTERNATYWA)

**Kiedy użyć:** Jeśli chcesz zachować automatyczne seedowanie na nowych środowiskach

**Kroki:**

#### 1. Edytuj `database/seeders/RealPackageServicesSeeder.php`

**DODAJ na początku metody `run()`:**

```php
public function run(): void
{
    // ⚠️ OCHRONA PRODUKCJI: Nie usuwaj danych jeśli już istnieją
    $servicesExist = PackageService::count() > 0;
    $usageExists = DB::table('package_service_usage')->count() > 0;

    if ($servicesExist) {
        $this->command->info('✅ Services already exist in database');

        if ($usageExists) {
            $this->command->warn('⚠️  User data found - SKIPPING seed to prevent data loss!');
            return;
        }

        $this->command->info('ℹ️  No user data yet, will refresh service definitions');
    }

    // USUŃ WSZYSTKIE dummy dane (tylko jeśli nie ma danych użytkowników!)
    if (!$usageExists) {
        DB::table('package_service_usage')->delete();
        DB::table('package_type_services')->delete();
        DB::table('package_services')->delete();
    } else {
        $this->command->error('❌ ABORTING: User data exists, not safe to delete!');
        return;
    }

    // ... reszta seedera (bez zmian)
```

#### 2. Commit i push

```bash
git add database/seeders/RealPackageServicesSeeder.php
git commit -m "feat: Add data protection to RealPackageServicesSeeder

Prevents accidental deletion of user data during redeployment.

Changes:
- Check if services already exist before deleting
- Check if user data (package_service_usage) exists
- Skip seeding if data found to prevent loss
- Safe for production while allowing fresh installs
"
git push origin railway-test
```

**Plusy:**
- ✅ Bezpieczne - nie usuwa istniejących danych użytkowników
- ✅ Automatyczne - nadal działa przy pierwszym deployu
- ✅ Możesz zostawić `--seed` w railway.json

**Minusy:**
- ❌ Jeśli dodasz nową usługę, seeder nie zaktualizuje (trzeba ręcznie)

---

### Rozwiązanie 3: Ręczne seedowanie (NAJBARDZIEJ PROFESJONALNE)

**Kiedy użyć:** Produkcja na dużą skalę

**Kroki:**

#### 1. Usuń `--seed` z railway.json (jak w Rozwiązaniu 1)

#### 2. Uruchom seedery TYLKO raz, ręcznie

**Przez Railway CLI:**
```bash
railway run php artisan db:seed --class=RealPackageServicesSeeder --force
```

**Lub przez Railway Shell:**
```bash
railway shell
php artisan db:seed --class=RealPackageServicesSeeder --force
exit
```

#### 3. Dokumentuj kiedy seedowałeś

W `.env` lub notes dodaj:
```
# Database seeded: 2025-10-22
# Last seed command: php artisan db:seed --class=RealPackageServicesSeeder
```

---

## 📊 Porównanie rozwiązań

| Rozwiązanie | Bezpieczeństwo | Prostota | Auto-setup | Elastyczność |
|-------------|----------------|----------|------------|--------------|
| 1. Usuń --seed | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ | ⭐⭐⭐ |
| 2. Inteligentny seeder | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ | ⭐⭐⭐⭐ |
| 3. Ręczne seedowanie | ⭐⭐⭐⭐⭐ | ⭐⭐ | ❌ | ⭐⭐⭐⭐⭐ |

---

## 🎯 MOJA REKOMENDACJA

### Dla Railway testowego (teraz):
**Zostaw jak jest** - `--seed` aktywny, baza się resetuje, ale to OK podczas testów.

### Przed wdrożeniem produkcyjnym:
**Użyj Rozwiązania 1** (usuń `--seed`)

**Dlaczego:**
- Najprostsze
- Najbezpieczniejsze
- Standard w branży
- Railway MySQL jest persistent (dane przetrwają)

---

## 🧪 Test przed produkcją

**KONIECZNIE przetestuj przed wdrożeniem prawdziwych użytkowników:**

1. **Utwórz testowy pakiet** na Railway
2. **Zaznacz kilka usług**
3. **Zrób redeploy** (zmień coś w kodzie i push)
4. **Sprawdź czy zaznaczenia przetrwały**

Jeśli NIE przetrwały = `--seed` nadal aktywny! ❌

---

## 🔍 Jak sprawdzić czy --seed jest aktywny?

```bash
# Sprawdź railway.json:
cat railway.json | grep startCommand

# Powinno być:
# "startCommand": "... migrate --force && ..." ✅ (BEZ --seed)

# NIE powinno być:
# "startCommand": "... migrate --force --seed && ..." ❌ (Z --seed)
```

---

## 📝 Dodatkowe informacje

### Czy baza MySQL na Railway jest persistent?

**TAK!** ✅

- Kontener aplikacji (`mindful-essence`) = **ephemeral** (resetuje się)
- Kontener MySQL (`MySQL-6GFS`) = **persistent** (dane przetrwają)

**ALE:** Jeśli masz `--seed` w startCommand, seeder **AKTYWNIE USUWA** dane nawet z persistent bazy!

### Które tabele są zagrożone?

```sql
-- USUWANE przez seeder:
package_service_usage     -- ❌ KRYTYCZNE (dane użytkowników!)
package_type_services     -- ⚠️  Definicje pakietów (można odtworzyć)
package_services          -- ⚠️  Lista usług (można odtworzyć)

-- BEZPIECZNE (nie dotknięte przez seeder):
users                     -- ✅ Konta użytkowników
packages                  -- ✅ Utworzone pakiety
package_logs              -- ✅ Historia akcji
alerts                    -- ✅ Alerty
traffic                   -- ✅ Ruch
```

### Co jeśli dodam nową usługę w przyszłości?

**Jeśli usunąłeś `--seed`:**

1. Edytuj `RealPackageServicesSeeder.php` - dodaj nową usługę
2. Uruchom ręcznie na Railway:
   ```bash
   railway run php artisan db:seed --class=RealPackageServicesSeeder --force
   ```

**Lub:** Utwórz dedykowany seeder tylko dla nowej usługi:
```bash
php artisan make:seeder AddNewServiceSeeder
```

---

## 🚨 Checklist przed produkcją

- [ ] Usunąłem `--seed` z `railway.json`
- [ ] Zcommitowałem i zpushowałem zmiany
- [ ] Railway zrobił redeploy
- [ ] Przetestowałem że dane przetrwają redeploy
- [ ] Udokumentowałem kiedy uruchomiłem seedery
- [ ] Wyłączyłem `APP_DEBUG=false` w Railway Variables
- [ ] Ustawiłem `APP_ENV=production`
- [ ] Sprawdziłem że backupy bazy działają
- [ ] Przećwiczyłem restore z backupu

---

## 📞 Pomoc

Jeśli masz pytania lub problem z wdrożeniem, sprawdź:
- [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) - Główny przewodnik Railway
- [SECURITY.md](SECURITY.md) - Polityka bezpieczeństwa
- [BACKUP_PRODUCTION.md](BACKUP_PRODUCTION.md) - Backupy MySQL

---

**Ostatnia aktualizacja:** 2025-10-22
**Status:** Dokumentacja dla przyszłego wdrożenia produkcyjnego
