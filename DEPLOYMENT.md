# 🚀 Deployment Guide - Platforma Pakiety

**Data utworzenia:** 2025-10-16
**Wersja:** 1.0
**Typ deployment:** Manual (WinSCP + SSH)

---

## 📋 Spis treści

1. [Przegląd deployment](#przegląd-deployment)
2. [Wymagania serwera produkcyjnego](#wymagania-serwera-produkcyjnego)
3. [Pierwszy deployment (initial setup)](#pierwszy-deployment-initial-setup)
4. [Aktualizacja aplikacji (updates)](#aktualizacja-aplikacji-updates)
5. [Backup i restore](#backup-i-restore)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Przegląd deployment

### Laravel vs Astro - Kluczowe różnice

| Aspekt | Astro | Laravel |
|--------|-------|---------|
| **Build** | Zawsze lokalnie → `dist/` | Frontend lokalnie, backend na serwerze |
| **Co przesyłasz** | Tylko `dist/` folder | Cały kod źródłowy (poza node_modules/vendor) |
| **Serwer** | Statyczny (nginx) | PHP interpreter (Apache/nginx + PHP-FPM) |
| **Baza danych** | Brak | MySQL/SQLite na serwerze |
| **Secrets** | Build-time | Runtime (.env na serwerze) |

### Proces deployment - 3 kroki

```
1. LOKALNIE (Windows)
   ├── Build frontend (npm run build)
   ├── Prepare dependencies (composer install)
   └── Test locally

2. TRANSFER (WinSCP)
   ├── Upload source code
   ├── Upload built assets (public/build/)
   └── Upload .env.example (NOT .env!)

3. NA SERWERZE (SSH)
   ├── Install PHP dependencies (composer install)
   ├── Configure .env
   ├── Run migrations
   ├── Clear & optimize cache
   └── Set permissions
```

---

## 💻 Wymagania serwera produkcyjnego

### Specyfikacja minimalna:

- **System:** Linux (Ubuntu 22.04 / Debian 11 / CentOS 8+)
- **PHP:** 8.2 lub wyższy
- **Serwer web:** Apache 2.4+ lub Nginx 1.18+
- **Baza danych:** MySQL 8.0+ lub SQLite 3.35+
- **RAM:** Minimum 512MB (zalecane 1GB+)
- **Dysk:** 500MB wolnego miejsca

### Wymagane PHP extensions:

```bash
# Sprawdź zainstalowane extensiony:
php -m

# Wymagane:
- BCMath
- Ctype
- DOM
- Fileinfo
- JSON
- Mbstring
- OpenSSL
- PDO
- PDO_MySQL (jeśli MySQL) lub PDO_SQLite (jeśli SQLite)
- Tokenizer
- XML
```

### Wymagane narzędzia:

```bash
# Composer
composer --version  # >= 2.0

# Node.js (opcjonalnie - jeśli buildujesz na serwerze)
node --version      # >= 18.x

# Git (opcjonalnie)
git --version       # >= 2.x
```

---

## 🆕 Pierwszy deployment (initial setup)

### Krok 1: Przygotowanie lokalne (Windows)

#### 1.1. Upewnij się że kod działa lokalnie

```bash
# W Git Bash w katalogu projektu (F:\Windsurf\PlatformaPakiety)

# 1. Sprawdź czy kontenery działają
docker ps | grep platformapakiety

# 2. Test aplikacji
curl http://localhost
# Powinieneś zobaczyć stronę logowania

# 3. Sprawdź logi
docker exec platformapakiety-laravel.test-1 tail -20 /var/www/html/storage/logs/laravel.log
```

#### 1.2. Build production assets

```bash
# W katalogu projektu

# 1. Install Composer dependencies (production mode)
docker exec platformapakiety-laravel.test-1 composer install --optimize-autoloader --no-dev

# 2. Build frontend assets (React/Vite)
docker exec platformapakiety-laravel.test-1 npm run build

# 3. Verify build succeeded
ls public/build/
# Powinieneś zobaczyć:
# manifest.json
# assets/Dashboard-xxxxx.js
# assets/app-xxxxx.css
```

**⚠️ WAŻNE:** Jeśli widzisz błędy w `npm run build`, **NIE deployuj** - najpierw napraw lokalnie!

#### 1.3. Przygotuj dokumentację .env

```bash
# Stwórz template dla produkcji (opcjonalne)
cp .env.example .env.production

# Edytuj .env.production i dodaj komentarze:
nano .env.production
```

**Przykładowy `.env.production`:**

```env
# ===================================
# PRODUCTION ENVIRONMENT VARIABLES
# ===================================

APP_NAME="TermyGorce Admin Panel"
APP_ENV=production
APP_KEY=                          # ← Wygeneruj na serwerze: php artisan key:generate
APP_DEBUG=false                   # ← WAŻNE: false w produkcji!
APP_TIMEZONE=Europe/Warsaw        # ← WAŻNE: Polska strefa czasowa!
APP_URL=https://yourdomain.com    # ← Zmień na właściwy URL

LOG_CHANNEL=daily                 # ← Rotacja logów codziennie
LOG_LEVEL=error                   # ← Loguj tylko errory

# Database (MySQL example)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=platformapakiety_db   # ← Zmień
DB_USERNAME=platformapakiety_user # ← Zmień
DB_PASSWORD=                      # ← Ustaw silne hasło na serwerze!

# Database (SQLite alternative - prostsze dla małych projektów)
# DB_CONNECTION=sqlite
# DB_DATABASE=/var/www/html/database/database.sqlite

# Session (database recommended for production)
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=true              # ← WAŻNE: szyfrowanie sesji!

# Security
BACKUP_PASSWORD=                  # ← Ustaw silne hasło dla backupów!

# Mail (jeśli będziesz wysyłać email)
# MAIL_MAILER=smtp
# MAIL_HOST=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USERNAME=your-email@gmail.com
# MAIL_PASSWORD=your-app-password
```

---

### Krok 2: Upload przez WinSCP

#### 2.1. Połącz się z serwerem

```
WinSCP → New Site
  Protocol: SFTP
  Host: yourserver.com
  Port: 22
  Username: your_user
  Password: ****

→ Login
```

#### 2.2. Przejdź do katalogu aplikacji

Typowo:
- `/var/www/html/` (Apache)
- `/usr/share/nginx/html/` (Nginx)
- `/home/user/public_html/` (shared hosting)

#### 2.3. Wybierz pliki do przesłania

**✅ PRZESYŁAJ:**

```
app/                      ← Backend PHP code
bootstrap/
config/
database/
  ├── migrations/         ← WAŻNE - struktura bazy!
  └── seeders/
public/
  ├── build/              ← WAŻNE - zbudowane assets!
  ├── index.php
  └── ...
resources/
  ├── js/                 ← React source code
  ├── css/
  └── views/
routes/
storage/
  ├── app/.gitignore      ← Tylko .gitignore pliki
  ├── framework/.gitignore
  └── logs/.gitignore
artisan
composer.json
composer.lock             ← WAŻNE - lockuje wersje
package.json
vite.config.js
.env.example              ← Template dla .env
.htaccess                 ← Jeśli Apache
```

**❌ NIE PRZESYŁAJ:**

```
.env                      ← Ma lokalne sekrety!
.git/                     ← Git metadata (duże)
node_modules/             ← Za duże - rebuild na serwerze
vendor/                   ← Za duże - composer install na serwerze
storage/logs/*.log        ← Nadpiszesz logi produkcyjne!
database/database.sqlite  ← Nadpiszesz produkcyjną bazę!
.env.backup
.env.production           ← Tylko jeśli używasz jako template
```

#### 2.4. Ustaw filtr w WinSCP (opcjonalne)

```
Preferences → Transfer → Exclude

Dodaj:
.env; .git; node_modules; vendor; storage/logs/*.log; database/database.sqlite
```

#### 2.5. Upload!

```
1. Zaznacz foldery (app, bootstrap, config, ...)
2. Drag & drop → serwer
3. Poczekaj aż się przesyła (może zająć kilka minut)
```

---

### Krok 3: Konfiguracja na serwerze (SSH)

#### 3.1. Połącz się przez SSH

```bash
ssh user@yourserver.com
cd /var/www/html
```

#### 3.2. Install PHP dependencies

```bash
# Sprawdź czy Composer jest zainstalowany
composer --version

# Jeśli nie ma - zainstaluj:
# curl -sS https://getcomposer.org/installer | php
# sudo mv composer.phar /usr/local/bin/composer

# Install dependencies (production mode)
composer install --optimize-autoloader --no-dev

# Sprawdź czy vendor/ powstał:
ls -la vendor/
```

#### 3.3. Konfiguracja .env

```bash
# Skopiuj template
cp .env.example .env

# Edytuj .env
nano .env
```

**Wypełnij te pola:**

```env
APP_ENV=production
APP_DEBUG=false                 # ← KRYTYCZNE!
APP_TIMEZONE=Europe/Warsaw      # ← WAŻNE!
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql             # lub sqlite
DB_DATABASE=your_database
DB_USERNAME=your_user
DB_PASSWORD=your_password       # ← Silne hasło!

SESSION_ENCRYPT=true            # ← WAŻNE dla bezpieczeństwa!
BACKUP_PASSWORD=your_backup_pw  # ← Silne hasło dla backupów!
```

**Zapisz:** `Ctrl+O`, `Enter`, `Ctrl+X`

#### 3.4. Wygeneruj APP_KEY

```bash
php artisan key:generate

# Sprawdź czy APP_KEY się pojawił w .env:
grep "APP_KEY" .env
# Powinno być: APP_KEY=base64:xxxxxxx
```

#### 3.5. Ustaw permissions

```bash
# Ustaw właściciela na web server user
sudo chown -R www-data:www-data storage bootstrap/cache

# Ustaw uprawnienia zapisu
chmod -R 775 storage bootstrap/cache

# Zabezpiecz .env (tylko odczyt dla właściciela)
chmod 600 .env
```

#### 3.6. Konfiguracja bazy danych

**Jeśli MySQL:**

```bash
# Zaloguj się do MySQL
mysql -u root -p

# Stwórz bazę i użytkownika
CREATE DATABASE platformapakiety_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'platformapakiety_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON platformapakiety_db.* TO 'platformapakiety_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Jeśli SQLite:**

```bash
# Stwórz plik bazy
touch database/database.sqlite
chmod 664 database/database.sqlite
sudo chown www-data:www-data database/database.sqlite
```

#### 3.7. Uruchom migracje

```bash
# Sprawdź status migracji
php artisan migrate:status

# Uruchom migracje (--force wymagane w produkcji)
php artisan migrate --force

# Sprawdź czy tabele powstały:
php artisan tinker --execute="
echo 'Tables:' . PHP_EOL;
DB::select('SHOW TABLES');  # MySQL
# LUB
// DB::select('SELECT name FROM sqlite_master WHERE type=\"table\"');  # SQLite
"
```

#### 3.8. Seedowanie danych (opcjonalne)

```bash
# Jeśli masz seedery (np. domyślne typy pakietów):
php artisan db:seed --force

# LUB konkretny seeder:
# php artisan db:seed --class=PackageTypeSeeder --force
```

#### 3.9. Optymalizacja dla produkcji

```bash
# Clear wszystkie cache
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Cache dla performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

#### 3.10. Weryfikacja NTP (synchronizacja czasu)

```bash
# Sprawdź status NTP
timedatectl status

# Szukaj linii:
# System clock synchronized: yes  ← Powinno być YES!
# NTP service: active              ← Powinno być ACTIVE!

# Sprawdź strefę czasową
timedatectl | grep "Time zone"
# Powinno być: Europe/Warsaw

# Jeśli nie - ustaw:
sudo timedatectl set-timezone Europe/Warsaw
sudo timedatectl set-ntp true
```

#### 3.11. Weryfikacja w Laravel

```bash
# Sprawdź czas w aplikacji
php artisan tinker --execute="
echo 'Laravel now(): ' . now() . PHP_EOL;
echo 'Timezone: ' . config('app.timezone') . PHP_EOL;
echo 'Test package_id: ' . App\Models\Package::generatePackageId() . PHP_EOL;
"

# Powinno pokazać aktualny czas w Polsce!
```

---

### Krok 4: Konfiguracja web servera

#### Apache (.htaccess)

**Upewnij się że plik `.htaccess` jest w `public/`:**

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

**Document Root powinien wskazywać na `public/`:**

```apache
# /etc/apache2/sites-available/yourdomain.conf
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/html/public

    <Directory /var/www/html/public>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

**Włącz konfigurację:**

```bash
sudo a2ensite yourdomain.conf
sudo a2enmod rewrite
sudo systemctl restart apache2
```

#### Nginx

```nginx
# /etc/nginx/sites-available/yourdomain
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html/public;

    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

**Włącz konfigurację:**

```bash
sudo ln -s /etc/nginx/sites-available/yourdomain /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Krok 5: SSL Certificate (HTTPS)

```bash
# Używając Certbot (Let's Encrypt - darmowy SSL)
sudo apt install certbot python3-certbot-apache  # Apache
# LUB
sudo apt install certbot python3-certbot-nginx   # Nginx

# Wygeneruj certyfikat
sudo certbot --apache -d yourdomain.com         # Apache
# LUB
sudo certbot --nginx -d yourdomain.com          # Nginx

# Auto-renewal test
sudo certbot renew --dry-run
```

**Po instalacji SSL - zaktualizuj .env:**

```bash
nano .env
# Zmień:
APP_URL=https://yourdomain.com  # http → https
```

```bash
php artisan config:clear
php artisan config:cache
```

---

### Krok 6: Test deployment

```bash
# 1. Test podstawowych endpointów
curl https://yourdomain.com
# Powinno zwrócić HTML strony logowania

# 2. Test API endpointów (dla Astro)
curl https://yourdomain.com/api/traffic
# Powinno zwrócić liczbę

curl https://yourdomain.com/api/alerts
# Powinno zwrócić [] lub JSON z alertami

# 3. Sprawdź logi
tail -f storage/logs/laravel.log
# Nie powinno być błędów!
```

**W przeglądarce:**

1. Otwórz `https://yourdomain.com`
2. Powinieneś zobaczyć stronę logowania
3. Zaloguj się pierwszym użytkownikiem (jeśli jest w bazie)
4. Sprawdź Dashboard → czy wszystko się ładuje

---

### Krok 7: Stwórz pierwszego użytkownika (jeśli baza pusta)

```bash
php artisan tinker

# W tinkerze:
$user = new App\Models\User();
$user->name = 'Admin';
$user->email = 'admin@termygorce.pl';
$user->password = bcrypt('secure_password_123');
$user->email_verified_at = now();
$user->save();

exit
```

---

## 🔄 Aktualizacja aplikacji (updates)

### Gdy masz nowy kod do wdrożenia:

#### Lokalnie (przed upload):

```bash
# 1. Pull latest changes (jeśli używasz Git)
git pull origin master

# 2. Test locally
docker compose up -d
curl http://localhost

# 3. Build production assets
docker exec platformapakiety-laravel.test-1 npm run build

# 4. Check for new migrations
ls database/migrations/
```

#### Na serwerze (backup!):

```bash
# ZAWSZE przed aktualizacją!

# 1. Backup bazy danych
php artisan db:backup  # Jeśli masz skrypt
# LUB manualnie:
cp database/database.sqlite database/backup_$(date +%Y%m%d_%H%M%S).sqlite

# 2. Backup .env
cp .env .env.backup_$(date +%Y%m%d)

# 3. Enable maintenance mode
php artisan down
```

#### WinSCP upload:

```
1. Upload nowe pliki (app/, resources/, public/build/, etc.)
2. NIE nadpisuj .env!
3. Upload nowych migracji (database/migrations/)
```

#### Na serwerze (po upload):

```bash
# 1. Install new Composer dependencies
composer install --optimize-autoloader --no-dev

# 2. Run new migrations
php artisan migrate --force

# 3. Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# 4. Re-cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 5. Disable maintenance mode
php artisan up

# 6. Check logs
tail -f storage/logs/laravel.log
```

---

## 💾 Backup i Restore

### Automatyczny backup (GPG encrypted)

**Setup (jednorazowo):**

```bash
# 1. Ustaw hasło backupu w .env
nano .env
# Dodaj:
BACKUP_PASSWORD=your_very_strong_backup_password_123!

# 2. Test skryptu backupu
bash scripts/backup-database.sh

# 3. Sprawdź czy powstał backup
ls -lh storage/backups/
# Powinien być: db_backup_YYYYMMDD_HHMMSS.sqlite.gpg
```

**Automatyzacja (cron):**

```bash
# Edytuj crontab
crontab -e

# Dodaj linię (backup codziennie o 3:00 AM):
0 3 * * * cd /var/www/html && BACKUP_PASSWORD="your_password" bash scripts/backup-database.sh >> storage/logs/backup.log 2>&1

# Zapisz i wyjdź
```

### Manualny backup

```bash
# SQLite
cp database/database.sqlite backups/manual_backup_$(date +%Y%m%d).sqlite

# MySQL
mysqldump -u username -p database_name > backups/manual_backup_$(date +%Y%m%d).sql
```

### Restore z backupu

```bash
# Używając skryptu restore
bash scripts/restore-database.sh

# LUB z konkretnego pliku
bash scripts/restore-database.sh db_backup_20251016_030000.sqlite.gpg

# Manualnie (SQLite)
cp backups/manual_backup_20251016.sqlite database/database.sqlite
php artisan config:clear
```

---

## 🔧 Troubleshooting

### Problem: Strona pokazuje "500 Internal Server Error"

**Rozwiązanie:**

```bash
# 1. Sprawdź logi Laravel
tail -50 storage/logs/laravel.log

# 2. Sprawdź logi web servera
# Apache:
sudo tail -50 /var/log/apache2/error.log
# Nginx:
sudo tail -50 /var/log/nginx/error.log

# 3. Sprawdź permissions
sudo chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# 4. Sprawdź .env
cat .env | grep APP_KEY
# Jeśli pusty - regeneruj:
php artisan key:generate
```

---

### Problem: "No application encryption key has been specified"

**Rozwiązanie:**

```bash
php artisan key:generate
php artisan config:clear
php artisan config:cache
```

---

### Problem: CSS/JS nie ładuje się (404 errors)

**Rozwiązanie:**

```bash
# 1. Sprawdź czy pliki istnieją
ls -la public/build/

# 2. Jeśli nie ma - rebuild lokalnie i upload ponownie
# LOKALNIE:
docker exec platformapakiety-laravel.test-1 npm run build

# Upload public/build/ przez WinSCP

# 3. Clear cache
php artisan view:clear
php artisan config:clear
```

---

### Problem: "SQLSTATE[HY000] [2002] Connection refused" (MySQL)

**Rozwiązanie:**

```bash
# 1. Sprawdź czy MySQL działa
sudo systemctl status mysql

# Jeśli nie - uruchom:
sudo systemctl start mysql

# 2. Sprawdź credentials w .env
cat .env | grep DB_

# 3. Test połączenia
mysql -u your_user -p your_database
```

---

### Problem: "Class not found" errors

**Rozwiązanie:**

```bash
# Regeneruj autoloader
composer dump-autoload --optimize

# Clear wszystkie cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

---

### Problem: Czas w package_id jest błędny

**Rozwiązanie:**

```bash
# 1. Sprawdź NTP
timedatectl status
# Szukaj: System clock synchronized: yes

# Jeśli NO:
sudo timedatectl set-ntp true

# 2. Sprawdź strefę czasową
timedatectl | grep "Time zone"
# Powinno być: Europe/Warsaw

# Jeśli nie:
sudo timedatectl set-timezone Europe/Warsaw

# 3. Sprawdź w Laravel
php artisan tinker --execute="echo now();"
# Powinno pokazać aktualny czas Polski

# 4. Sprawdź .env
grep "APP_TIMEZONE" .env
# Powinno być: Europe/Warsaw

# Jeśli nie:
nano .env
# Zmień na: APP_TIMEZONE=Europe/Warsaw
php artisan config:clear
php artisan config:cache
```

---

### Problem: Permission denied errors

**Rozwiązanie:**

```bash
# Ustaw właściciela
sudo chown -R www-data:www-data /var/www/html

# Ustaw permissions
sudo chmod -R 755 /var/www/html
sudo chmod -R 775 storage bootstrap/cache

# Dla SQLite database:
sudo chown www-data:www-data database/database.sqlite
chmod 664 database/database.sqlite
```

---

### Problem: Routes nie działają (404 on valid routes)

**Rozwiązanie:**

```bash
# Apache - włącz mod_rewrite
sudo a2enmod rewrite
sudo systemctl restart apache2

# Sprawdź .htaccess w public/
cat public/.htaccess

# Clear route cache
php artisan route:clear
php artisan route:cache
```

---

## 📝 Checklist - Quick Reference

### Pre-deployment:

```
□ git pull origin master
□ docker exec ... npm run build
□ Check public/build/ exists
□ Test locally: http://localhost
```

### Upload (WinSCP):

```
□ Backup produkcyjnej bazy
□ Backup produkcyjnego .env
□ Upload: app/, config/, database/, public/, resources/, routes/
□ Upload: .env.example, composer.json
□ SKIP: .env, node_modules/, vendor/, storage/logs/
```

### Post-deployment (SSH):

```
□ cd /var/www/html
□ composer install --optimize-autoloader --no-dev
□ grep "APP_TIMEZONE" .env  # Should be: Europe/Warsaw
□ php artisan migrate --force
□ php artisan config:clear && php artisan cache:clear
□ php artisan config:cache && php artisan route:cache
□ chmod -R 775 storage bootstrap/cache
□ tail -f storage/logs/laravel.log
□ Test: https://yourdomain.com
```

---

## 🆘 Support

**W razie problemów:**

1. Sprawdź logi: `storage/logs/laravel.log`
2. Sprawdź tę dokumentację (sekcja Troubleshooting)
3. Sprawdź [CLAUDE.md](CLAUDE.md) dla szczegółów technicznych
4. Sprawdź oficjalną dokumentację: https://laravel.com/docs/11.x/deployment

---

**Ostatnia aktualizacja:** 2025-10-16
**Autor:** Zespół deweloperski TermyGórce
