# 🔐 Security Overview - PlatformaPakiety

**Ostatnia aktualizacja:** 2025-10-16

## 📊 Status zabezpieczeń: ✅ SECURED

### Zaimplementowane zabezpieczenia

| # | Zabezpieczenie | Status | Poziom ochrony |
|---|----------------|--------|----------------|
| 1 | Rate Limiting (60 req/min) | ✅ | Średni |
| 2 | Audit Logging + IP tracking | ✅ | Wysoki |
| 3 | HTTPS wymuszony (production) | ✅ | Wysoki |
| 4 | Session Encryption (AES-256) | ✅ | Wysoki |
| 5 | Encrypted Backups (GPG) | ✅ | **Bardzo wysoki** |

**Ogólna ocena bezpieczeństwa:** 🟢 **BARDZO DOBRA**

---

## ⚡ Quick Start

### 1. Konfiguracja .env (KRYTYCZNE!)

```env
# Production settings
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Session encryption
SESSION_ENCRYPT=true

# Backup encryption (ZMIEŃ TO HASŁO!)
BACKUP_PASSWORD=YourVerySecurePassword123!@#$%
```

### 2. Uruchom pierwszy backup

```bash
docker exec platformapakiety-laravel.test-1 bash /var/www/html/scripts/backup-database.sh
```

### 3. Sprawdź czy działa

```bash
docker exec platformapakiety-laravel.test-1 ls -lh /var/www/html/storage/backups/
```

---

## 📋 Checklist przed production

- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `SESSION_ENCRYPT=true`
- [ ] Silne `BACKUP_PASSWORD` (16+ znaków)
- [ ] Skonfiguruj cron dla backupów
- [ ] Przetestuj restore z backupu
- [ ] Zainstaluj certyfikat SSL (HTTPS)
- [ ] Sprawdź czy rate limiting działa
- [ ] Przejrzyj logi: `package_logs` tabela

---

## 🛡️ Co chronimy

### Dane wrażliwe:
- ❌ **custom_id** (imię i nazwisko klientów) - **NIE ZASZYFROWANE** (opcja do rozważenia)
- ✅ **Sesje użytkowników** - zaszyfrowane (AES-256)
- ✅ **Backupy bazy** - zaszyfrowane (GPG AES-256)
- ✅ **Komunikacja** - HTTPS w production

### Audytowane akcje:
- ✅ Tworzenie pakietów (`package_created`)
- ✅ Zaznaczanie usług (`service_marked`)
- ✅ Generowanie PDF (`pdf_generated`)
- ✅ Edycja danych (`owner_updated`, `notes_updated`)

---

## 🚨 Najczęstsze zagrożenia

| Zagrożenie | Ochrona | Status |
|------------|---------|--------|
| Scraping bazy klientów | Rate limiting (60/min) | ✅ |
| Nieautoryzowany dostęp | Auth middleware | ✅ |
| Man-in-the-middle | HTTPS forced | ✅ |
| Utrata danych | Encrypted backups (30 dni) | ✅ |
| Wyciek sesji | Session encryption | ✅ |
| Brak audytu | IP logging + timestamps | ✅ |

---

## 📖 Dokumentacja

- **Pełna dokumentacja:** [CLAUDE.md - Sekcja Bezpieczeństwo](CLAUDE.md#🔐-bezpieczeństwo)
- **Skrypty backupu:** [scripts/README.md](scripts/README.md)
- **Monitoring SQL:** [CLAUDE.md - Monitorowanie](CLAUDE.md#monitorowanie-bezpieczeństwa)

---

## 🔍 Szybkie polecenia

### Sprawdź ostatnie dostępy:
```bash
docker exec platformapakiety-laravel.test-1 php artisan tinker
>>> DB::table('package_logs')->orderBy('created_at', 'desc')->limit(10)->get()
```

### Uruchom backup:
```bash
docker exec platformapakiety-laravel.test-1 bash /var/www/html/scripts/backup-database.sh
```

### Restore z backupu:
```bash
docker exec -it platformapakiety-laravel.test-1 bash /var/www/html/scripts/restore-database.sh
```

### Sprawdź podejrzane IP:
```sql
SELECT ip_address, COUNT(*) as hits
FROM package_logs
WHERE created_at > datetime('now', '-1 hour')
GROUP BY ip_address
HAVING hits > 50;
```

---

## 🆘 W razie incydentu

### 1. Podejrzany dostęp
```sql
-- Sprawdź logi
SELECT * FROM package_logs WHERE ip_address = 'X.X.X.X';

-- Zablokuj użytkownika
UPDATE users SET is_active = 0 WHERE id = X;
```

### 2. Utrata danych
```bash
# Restore z ostatniego backupu
docker exec -it platformapakiety-laravel.test-1 bash /var/www/html/scripts/restore-database.sh
```

### 3. Wyciek hasła backupu
```bash
# Zmień hasło natychmiast w .env
BACKUP_PASSWORD=NewSecurePassword456!

# Usuń stare backupy
rm storage/backups/*.gpg

# Stwórz nowy backup z nowym hasłem
docker exec platformapakiety-laravel.test-1 bash /var/www/html/scripts/backup-database.sh
```

---

## ⚠️ Ograniczenia obecnego zabezpieczenia

| Co NIE jest chronione | Dlaczego | Rozwiązanie (opcjonalne) |
|----------------------|----------|--------------------------|
| `custom_id` w bazie | Performance vs Security trade-off | Szyfrowanie pola (Opcja A w CLAUDE.md) |
| Plik `database.sqlite` | SQLite nie wspiera native encryption | SQLCipher (Opcja B) lub polegać na backupach |
| Wyszukiwanie fuzzy | Brak hash index dla zaszyfrowanych pól | N/A (nie dotyczy - dane niezaszyfrowane) |

---

## 📞 Kontakt

W przypadku pytań o bezpieczeństwo:
- Przeczytaj [CLAUDE.md](CLAUDE.md#🔐-bezpieczeństwo)
- Sprawdź [scripts/README.md](scripts/README.md)
- Przetestuj backup/restore lokalnie

