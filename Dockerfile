# Railway Dockerfile - Laravel 11 + Inertia + React
FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /app

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy package files
COPY package.json package-lock.json ./

# Install Node.js 22 (Railway requires specific version)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

# Install npm dependencies
RUN npm ci

# Copy application files
COPY . .

# Build frontend
RUN npm run build

# Create storage directories
RUN mkdir -p storage/framework/views \
    storage/framework/cache \
    storage/framework/sessions \
    bootstrap/cache

# Set permissions
RUN chmod -R 775 storage bootstrap/cache

# Note: We don't cache config during build because Railway sets PORT at runtime
# Config cache will be done on first request or manually after deployment

# Expose port
EXPOSE 8080

# Start server - use PHP built-in server directly to avoid ServeCommand port type issue
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8080} -t public"]
