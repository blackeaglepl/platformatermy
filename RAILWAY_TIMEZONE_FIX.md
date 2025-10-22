# Fix Railway Timezone - Warszawa (Poland)

## Problem
Timestamps pokazują czas o 2 godziny wcześniej (UTC zamiast Europe/Warsaw).

## Szybka naprawa (1 minuta)

### Krok 1: Otwórz Railway Dashboard
https://railway.app/project/afd15b28-70f9-4d6f-8acb-ca4ca251d067

### Krok 2: Variables
1. Kliknij serwis **mindful-essence**
2. Zakładka **Variables**
3. Kliknij **+ New Variable**

### Krok 3: Dodaj timezone
```
Nazwa: APP_TIMEZONE
Wartość: Europe/Warsaw
```

### Krok 4: Poczekaj na restart
Railway automatycznie zrestartuje aplikację (~30 sekund).

---

## Weryfikacja

Po restarcie:
1. Zaznacz usługę w pakiecie
2. Sprawdź timestamp w sekcji "Akcje"
3. Powinien pokazywać **aktualny czas warszawski**

---

## Technicznie co się dzieje:

Laravel używa ustawienia z `config/app.php`:
```php
'timezone' => env('APP_TIMEZONE', 'UTC'),
```

Bez zmiennej `APP_TIMEZONE` = domyślnie UTC
Z `APP_TIMEZONE=Europe/Warsaw` = czas warszawski

---

## Inne timezone dla Polski

Jeśli wolisz:
- `Europe/Warsaw` - **ZALECANE** (automatyczna zmiana CET/CEST)
- `UTC` - czas uniwersalny (zawsze -1h zimą, -2h latem)
- `+01:00` - statyczny offset (bez automatycznej zmiany letniej)

---

**Ostatnia aktualizacja:** 2025-10-22
