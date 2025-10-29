# 🚨 Test Disaster Recovery - Symulacja Awarii

**Projekt:** Platforma Pakiety (TermyGórce)
**Cel:** Przetestować procedury przywracania bazy danych przed uruchomieniem produkcji
**Czas trwania:** ~30-45 minut
**Środowisko testowe:** `admin.tg.stronazen.pl`

---

## 📋 Spis treści
1. [Przygotowanie do testu](#przygotowanie-do-testu)
2. [Scenariusz 1: Błędna migracja](#scenariusz-1-błędna-migracja)
3. [Scenariusz 2: Przypadkowe usunięcie danych](#scenariusz-2-przypadkowe-usunięcie-danych)
4. [Scenariusz 3: Korupcja bazy danych](#scenariusz-3-korupcja-bazy-danych)
5. [Podsumowanie i wnioski](#podsumowanie-i-wnioski)

---

## ⚠️ WAŻNE - Przed rozpoczęciem testu

### Kiedy przeprowadzić test?
- **PO deployment** na środowisko testowe (`admin.tg.stronazen.pl`)
- **PRZED deployment** na produkcję (`panel.termygorce.pl`)
- W godzinach pracy (nie w nocy) - gdyby coś poszło nie tak, masz wsparcie
- Zarezerwuj 1 godzinę na testy

### Wymagania:
- [x] Aplikacja wdrożona na `admin.tg.stronazen.pl`
- [x] Backupy automatyczne skonfigurowane (cron job)
- [x] Hasło `BACKUP_PASSWORD` zapisane w menedżerze haseł
- [x] Dostęp SSH do serwera (`mongaw@s46.zenbox.pl`)
- [x] Dostęp WinSCP lub terminal
- [x] Testowe dane w bazie (minimum 5 pakietów)

### Protokół bezpieczeństwa:
```
✅ Test TYLKO na admin.tg.stronazen.pl (środowisko testowe)
❌ NIE testuj na panel.termygorce.pl (produkcja)
✅ Poinformuj zespół że robisz test
❌ NIE testuj gdy użytkownicy korzystają z systemu
```

---

## 🔧 Przygotowanie do testu

### Krok 1: Połącz się z serwerem testowym

**Przez WinSCP:**
```
Host: s46.zenbox.pl
User: mongaw
Password: <hasło SSH>
Katalog: /domains/tg.stronazen.pl/public_html/admin/
```

**Otwórz terminal:** `Ctrl + T`

### Krok 2: Utwórz dane testowe

```bash
# Przejdź do katalogu aplikacji
cd /domains/tg.stronazen.pl/public_html/admin

# Utwórz testowe pakiety
php artisan tinker

# W Tinkerze:
>>> use App\Models\Package;
>>> Package::factory()->count(5)->create(['owner_name' => 'TEST - Jan Kowalski']);
>>> Package::count();
// Output: 5 (lub więcej jeśli były już dane)
>>> exit;
```

### Krok 3: Zapisz stan początkowy

```bash
# Policz pakiety przed testem
PACKAGES_BEFORE=$(mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -se "SELECT COUNT(*) FROM packages;")
echo "Pakietów przed testem: $PACKAGES_BEFORE"

# Zapisz do pliku
echo "$PACKAGES_BEFORE" > /tmp/test_baseline.txt
```

### Krok 4: Wykonaj backup ręczny (baseline)

```bash
# Wykonaj backup przed rozpoczęciem testów
BACKUP_PASSWORD="<hasło z .env>" bash scripts/backup-database-universal.sh

# Sprawdź czy powstał
ls -lh storage/backups/
# Zapisz nazwę najnowszego backupu
BASELINE_BACKUP=$(ls -t storage/backups/*.gpg | head -1)
echo "Backup bazowy: $BASELINE_BACKUP"
```

### Krok 5: Przygotuj kartę wyników

Skopiuj tę tabelę do notatnika - będziesz wypełniać podczas testów:

```
┌──────────────────────────────────────────────────────────────┐
│              KARTA WYNIKÓW - DISASTER RECOVERY TEST          │
├──────────────────────────────────────────────────────────────┤
│ Data testu: ___________  Tester: ___________                │
│ Środowisko: admin.tg.stronazen.pl                           │
├──────────────────────────────────────────────────────────────┤
│ SCENARIUSZ 1: Błędna migracja                               │
│ - Czas rozpoczęcia: _____                                    │
│ - Czas zakończenia restore: _____                           │
│ - Całkowity czas: _____ minut                               │
│ - Status: ☐ Sukces  ☐ Częściowy sukces  ☐ Niepowodzenie    │
│ - Notatki: ____________________________________________      │
├──────────────────────────────────────────────────────────────┤
│ SCENARIUSZ 2: Przypadkowe usunięcie                         │
│ - Czas rozpoczęcia: _____                                    │
│ - Czas zakończenia restore: _____                           │
│ - Całkowity czas: _____ minut                               │
│ - Status: ☐ Sukces  ☐ Częściowy sukces  ☐ Niepowodzenie    │
│ - Notatki: ____________________________________________      │
├──────────────────────────────────────────────────────────────┤
│ SCENARIUSZ 3: Korupcja bazy                                 │
│ - Czas rozpoczęcia: _____                                    │
│ - Czas zakończenia restore: _____                           │
│ - Całkowity czas: _____ minut                               │
│ - Status: ☐ Sukces  ☐ Częściowy sukces  ☐ Niepowodzenie    │
│ - Notatki: ____________________________________________      │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔥 SCENARIUSZ 1: Błędna migracja

### Cel:
Symulacja sytuacji gdy programista wykonuje błędną migrację która usuwa/modyfikuje dane.

### Opis awarii:
Wykonujesz `php artisan migrate:fresh` myśląc że jesteś na środowisku lokalnym, ale jesteś na testowym! Wszystkie dane zostały usunięte.

---

### Faza 1: Symulacja awarii

**⏱️ Zanotuj czas rozpoczęcia:** ___________

```bash
# UWAGA: To faktycznie usunie wszystkie dane!
# Upewnij się że jesteś na TESTOWYM środowisku

# 1. Sprawdź aktualne środowisko
php artisan env
# Powinna być wartość: testing lub local (NIE production!)

# 2. Wykonaj błędną migrację (usuwa wszystkie dane + struktura)
php artisan migrate:fresh --force

# 3. Weryfikuj awarię
mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -e "SELECT COUNT(*) FROM packages;"
# Błąd: Table 'packages' doesn't exist  😱
```

**Status:** 💀 Baza całkowicie pusta (struktura + dane usunięte)

---

### Faza 2: Reakcja na awarię

```bash
# 1. PANIKA! Ale spokojnie... mamy backupy 😊

# 2. Włącz tryb maintenance (żeby użytkownicy nie widzieli błędów)
php artisan down --message="Przywracanie bazy danych. Wracamy za chwilę."

# 3. Sprawdź logi (opcjonalnie - zrozum co się stało)
tail -50 storage/logs/laravel.log
```

---

### Faza 3: Restore backupu

```bash
# 1. Zobacz dostępne backupy
ls -lh storage/backups/

# 2. Uruchom interaktywny restore
bash scripts/restore-database-universal.sh

# Terminal pokaże:
# === Database Restore Tool (Universal) ===
#
# Available backups:
# 1) db_backup_20251027_150000.sql.gpg (2025-10-27 15:00) ← BASELINE
# 2) db_backup_20251027_030000.sql.gpg (2025-10-27 03:00)
# 3) db_backup_20251026_030000.sql.gpg (2025-10-26 03:00)
#
# Select backup number: 1  ← Wybierz baseline

# 3. Wpisz hasło
# Enter decryption password: ****  ← BACKUP_PASSWORD z menedżera haseł

# 4. Potwierdź
# Type 'yes' to confirm: yes

# 5. Czekaj na komunikat:
# [SUCCESS] Database restored successfully!
```

**⏱️ Zanotuj czas zakończenia:** ___________

---

### Faza 4: Weryfikacja

```bash
# 1. Sprawdź czy tabele wróciły
mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -e "SHOW TABLES;"

# Powinny być:
# alerts
# cache
# migrations
# package_logs
# package_service_usage
# package_services
# package_type_services
# packages
# sessions
# traffic
# users

# 2. Sprawdź liczbę pakietów
mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -e "SELECT COUNT(*) FROM packages;"

# Porównaj z zapisaną wartością:
cat /tmp/test_baseline.txt

# 3. Sprawdź przez Laravel
php artisan tinker --execute="echo 'Pakietów: ' . App\Models\Package::count();"

# 4. Test integralności bazy
mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -e "CHECK TABLE packages, package_services, package_service_usage;"

# Wszystko powinno pokazać: status OK

# 5. Wyłącz maintenance
php artisan up
```

---

### Faza 5: Test funkcjonalności

**W przeglądarce:**
1. Otwórz: `https://admin.tg.stronazen.pl/login`
2. Zaloguj się
3. Przejdź do "Pakiety"
4. ✅ Sprawdź czy wszystkie pakiety są widoczne
5. ✅ Kliknij na pakiet - czy szczegóły działają?
6. ✅ Zaznacz usługę jako wykorzystaną - czy zapisuje?
7. ✅ Wygeneruj PDF - czy działa?

**Checklist weryfikacji:**
- [ ] Wszystkie pakiety widoczne
- [ ] Szczegóły pakietu działają
- [ ] Zaznaczanie usług działa
- [ ] Historia wykorzystania zachowana
- [ ] PDF generuje się poprawnie
- [ ] Alerty działają (stara funkcjonalność)
- [ ] Ruch działa (stara funkcjonalność)

---

### Wyniki Scenariusza 1:

**Wypełnij w karcie wyników:**
- Całkowity czas restore: ______ minut
- Status: ☐ Sukces ☐ Częściowy sukces ☐ Niepowodzenie
- Problemy napotkane: ___________________________
- Wnioski: ________________________________________

---

## 🗑️ SCENARIUSZ 2: Przypadkowe usunięcie danych

### Cel:
Symulacja przypadkowego usunięcia pakietów przez użytkownika lub błąd w kodzie.

### Opis awarii:
Programista wykonuje `Package::truncate()` w Tinkerze lub ktoś klika "Usuń wszystkie" w interfejsie.

---

### Faza 1: Symulacja awarii

**⏱️ Zanotuj czas rozpoczęcia:** ___________

```bash
# 1. Sprawdź aktualny stan
PACKAGES_BEFORE=$(mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -se "SELECT COUNT(*) FROM packages;")
echo "Pakietów przed awarią: $PACKAGES_BEFORE"

# 2. Symuluj przypadkowe usunięcie WSZYSTKICH pakietów
mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -e "DELETE FROM packages;"

# 3. Weryfikuj awarię
mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -e "SELECT COUNT(*) FROM packages;"
# Output: 0  😱
```

**Status:** 💀 Wszystkie pakiety usunięte (struktura tabeli zachowana)

---

### Faza 2: Reakcja + Restore

```bash
# 1. Maintenance mode
php artisan down --message="Przywracanie danych"

# 2. Restore (identycznie jak Scenariusz 1)
bash scripts/restore-database-universal.sh
# Wybierz najnowszy backup
# Wpisz hasło
# Potwierdź: yes

# 3. Weryfikacja
PACKAGES_AFTER=$(mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -se "SELECT COUNT(*) FROM packages;")
echo "Pakietów po restore: $PACKAGES_AFTER"

# Porównaj z $PACKAGES_BEFORE

# 4. Maintenance OFF
php artisan up
```

**⏱️ Zanotuj czas zakończenia:** ___________

---

### Faza 3: Weryfikacja szczegółowa

```bash
# 1. Sprawdź czy wykorzystanie usług też wróciło
mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -e "
SELECT
    p.package_id,
    COUNT(psu.id) as used_services
FROM packages p
LEFT JOIN package_service_usage psu ON p.id = psu.package_id
GROUP BY p.id
LIMIT 10;
"

# 2. Sprawdź logi dostępu (czy historia zachowana)
mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -e "
SELECT COUNT(*) FROM package_logs;
"

# 3. Test w przeglądarce (jak w Scenariuszu 1)
```

**Checklist weryfikacji:**
- [ ] Liczba pakietów zgodna z baseline
- [ ] Wykorzystanie usług zachowane
- [ ] Historia logów zachowana
- [ ] Dane użytkowników (users) nienaruszone
- [ ] Alerty i ruch działają

---

### Wyniki Scenariusza 2:

**Wypełnij w karcie wyników:**
- Całkowity czas restore: ______ minut
- Status: ☐ Sukces ☐ Częściowy sukces ☐ Niepowodzenie
- Różnica vs Scenariusz 1: _______________________
- Wnioski: ________________________________________

---

## 💥 SCENARIUSZ 3: Korupcja bazy danych

### Cel:
Symulacja uszkodzenia struktury bazy (np. po nieudanej migracji, crash serwera).

### Opis awarii:
Tabela `package_service_usage` ma uszkodzony index lub constraint.

---

### Faza 1: Symulacja awarii

**⏱️ Zanotuj czas rozpoczęcia:** ___________

```bash
# 1. Symuluj uszkodzenie indexu
mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 <<EOF
USE mongaw_e2o91;
-- Usuń foreign key (symulacja korupcji)
ALTER TABLE package_service_usage DROP FOREIGN KEY package_service_usage_package_id_foreign;
ALTER TABLE package_service_usage DROP FOREIGN KEY package_service_usage_service_id_foreign;
-- Usuń index
DROP INDEX package_service_usage_package_id_index ON package_service_usage;
EOF

# 2. Weryfikuj awarię
mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -e "
SHOW CREATE TABLE package_service_usage\G
" | grep -i "FOREIGN KEY"
# Brak foreign keys - baza uszkodzona! 😱
```

**Status:** 💀 Struktura bazy uszkodzona (brak constraints, aplikacja może nie działać)

---

### Faza 2: Diagnoza

```bash
# 1. Sprawdź integrity
mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -e "
CHECK TABLE package_service_usage;
"
# Może pokazać Warning

# 2. Sprawdź czy aplikacja działa
php artisan tinker --execute="
    \$usage = App\Models\PackageServiceUsage::with('package')->first();
    echo \$usage ? 'OK' : 'ERROR';
"
# Może rzucić błąd relacji
```

---

### Faza 3: Restore + Weryfikacja struktury

```bash
# 1. Maintenance
php artisan down

# 2. Restore (przywraca strukturę + dane)
bash scripts/restore-database-universal.sh
# Wybierz baseline backup
# Hasło + yes

# 3. Weryfikacja struktury
mysql -u mongaw_e2o91 -p'E,ka8KPZXxd1GeSIrM-60,#8' mongaw_e2o91 -e "
SHOW CREATE TABLE package_service_usage\G
" | grep -i "FOREIGN KEY"

# Powinny być:
# CONSTRAINT `package_service_usage_package_id_foreign` FOREIGN KEY ...
# CONSTRAINT `package_service_usage_service_id_foreign` FOREIGN KEY ...

# 4. Test relacji w Laravel
php artisan tinker --execute="
    \$usage = App\Models\PackageServiceUsage::with(['package', 'service', 'marker'])->first();
    echo 'Package: ' . \$usage->package->package_id;
    echo 'Service: ' . \$usage->service->name;
"
# Powinno działać bez błędów ✅

# 5. Maintenance OFF
php artisan up
```

**⏱️ Zanotuj czas zakończenia:** ___________

---

### Wyniki Scenariusza 3:

**Wypełnij w karcie wyników:**
- Całkowity czas restore: ______ minut
- Status: ☐ Sukces ☐ Częściowy sukces ☐ Niepowodzenie
- Czy restore naprawił strukturę: ☐ Tak ☐ Nie
- Wnioski: ________________________________________

---

## 📊 Podsumowanie i wnioski

### Statystyki testu:

```
┌────────────────────────────────────────────────────────────┐
│                  PODSUMOWANIE TESTU DR                     │
├────────────────────────────────────────────────────────────┤
│ Scenariusz 1 (Błędna migracja):                           │
│   - Czas restore: _____ min                               │
│   - Sukces: ☐ TAK  ☐ NIE                                  │
│                                                            │
│ Scenariusz 2 (Usunięcie danych):                          │
│   - Czas restore: _____ min                               │
│   - Sukces: ☐ TAK  ☐ NIE                                  │
│                                                            │
│ Scenariusz 3 (Korupcja struktury):                        │
│   - Czas restore: _____ min                               │
│   - Sukces: ☐ TAK  ☐ NIE                                  │
│                                                            │
│ Średni czas restore: _____ min                            │
│ Wskaźnik sukcesu: ___/3 (___%)                            │
└────────────────────────────────────────────────────────────┘
```

---

### Checklist - Gotowość do produkcji

**Po zakończeniu wszystkich scenariuszy, sprawdź:**

#### Techniczne:
- [ ] Wszystkie 3 scenariusze zakończone sukcesem
- [ ] Średni czas restore < 5 minut
- [ ] Hasło `BACKUP_PASSWORD` działa
- [ ] Backupy są szyfrowane poprawnie
- [ ] Restore nie pozostawia niezaszyfrowanych plików
- [ ] Struktura bazy została w pełni przywrócona
- [ ] Dane użytkowników nienaruszone
- [ ] Foreign keys przywrócone

#### Funkcjonalne:
- [ ] Wszystkie pakiety widoczne po restore
- [ ] Wykorzystanie usług zachowane
- [ ] Historia logów zachowana
- [ ] PDF generuje się poprawnie
- [ ] Stare funkcjonalności działają (alerty, ruch)

#### Proceduralne:
- [ ] Zespół zna procedurę restore
- [ ] Hasło BACKUP_PASSWORD jest w menedżerze haseł
- [ ] Dokumentacja BACKUP_PRODUCTION.md jest aktualna
- [ ] Logi backupów są monitorowane
- [ ] Kontakt do osoby odpowiedzialnej za restore (Ty!)

---

### Problemy napotkane podczas testu:

```
Problem 1: _______________________________________________
Rozwiązanie: ______________________________________________

Problem 2: _______________________________________________
Rozwiązanie: ______________________________________________

Problem 3: _______________________________________________
Rozwiązanie: ______________________________________________
```

---

### Wnioski i rekomendacje:

**Co działało dobrze:**
- ___________________________________________________________
- ___________________________________________________________
- ___________________________________________________________

**Co wymaga poprawy:**
- ___________________________________________________________
- ___________________________________________________________
- ___________________________________________________________

**Rekomendacje przed produkcją:**
- [ ] _______________________________________________________
- [ ] _______________________________________________________
- [ ] _______________________________________________________

---

## 🎯 Decyzja: Gotowość do produkcji

**Po zakończeniu testu wypełnij:**

```
☐ System GOTOWY do wdrożenia na produkcję
  - Wszystkie scenariusze zakończone sukcesem
  - Czas restore akceptowalny (< 5 min)
  - Zespół przeszkolony
  - Dokumentacja aktualna

☐ System WYMAGA poprawek przed produkcją
  - Problemy: _______________________________________________
  - Termin następnego testu: ________________________________

☐ System NIE GOTOWY do produkcji
  - Krytyczne problemy: _____________________________________
  - Wymagane działania: _____________________________________
```

**Podpis testera:** _______________  **Data:** ___________

---

## 📚 Dodatkowe zasoby

- [BACKUP_PRODUCTION.md](BACKUP_PRODUCTION.md) - Pełna dokumentacja backupów
- [scripts/README.md](scripts/README.md) - Instrukcje skryptów backup/restore
- [task.md](task.md) - ROLLBACK PLAN w sekcji deployment

---

## 🆘 W razie problemów podczas testu

**Jeśli restore nie działa:**

1. **Sprawdź logi:**
   ```bash
   tail -100 storage/logs/laravel.log
   tail -50 storage/logs/backup.log
   ```

2. **Sprawdź hasło:**
   ```bash
   php artisan tinker --execute="echo env('BACKUP_PASSWORD');"
   ```

3. **Sprawdź backup (czy nie jest uszkodzony):**
   ```bash
   gpg --list-packets storage/backups/db_backup_*.gpg
   # Jeśli błąd - backup uszkodzony
   ```

4. **Ostatnia deska ratunku - restore z starszego backupu:**
   ```bash
   bash scripts/restore-database-universal.sh
   # Wybierz backup z wczoraj zamiast dzisiaj
   ```

5. **HELP - kontakt:**
   - Sprawdź dokumentację: `BACKUP_PRODUCTION.md`
   - GitHub Issues: (jeśli publiczny projekt)
   - Zespół deweloperski

---

**Powodzenia w teście! 🚀**

**Pamiętaj:** Lepiej wykryć problemy TERAZ (na środowisku testowym) niż na produkcji z prawdziwymi użytkownikami! 😊
