# PlatformaPakiety - Project Overview

## Purpose
Laravel + React admin panel for managing alerts and traffic information for TermyGórce website (built in Astro). The panel allows staff to:
- Manage alerts displayed on the main website
- Update traffic intensity information  
- **[NEW]** Manage service packages and their usage

## Tech Stack

### Backend
- **Framework:** Laravel 11.31
- **PHP:** 8.2+
- **Database:** SQLite (development) / MySQL (production via Docker)
- **Authentication:** Laravel Breeze + Sanctum
- **API:** RESTful API (JSON)

### Frontend  
- **Framework:** React 18.2
- **Language:** TypeScript 5.0
- **Build tool:** Vite 5.0
- **CSS Framework:** Tailwind CSS 3
- **UI Components:** Headless UI 2.0
- **Routing:** Inertia.js 1.0 (SPA-like experience without API routing)

### Development Tools
- **Docker:** Laravel Sail (containers for PHP, MySQL, Redis)
- **Testing:** Pest PHP 3.6
- **Code quality:** Laravel Pint 1.13
- **Linting:** ESLint (TypeScript)

### Environment
- **Platform:** Windows + Docker Desktop
- **Node.js:** v22.x (for Vite and build process)

## Key Features
1. Authentication system (Laravel Breeze)
2. Dashboard for managing alerts
3. Traffic intensity management
4. Package management system (new feature)
5. Public API consumed by Astro website

## Critical API Endpoints (DO NOT CHANGE)
- `GET /api/traffic` - Returns traffic intensity for Astro site
- `GET /api/alerts` - Returns active alerts for Astro site