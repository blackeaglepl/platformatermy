import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        // CRITICAL: Configuration for Laravel Sail
        host: '0.0.0.0', // Listen on all interfaces for Docker
        port: 5173,
        strictPort: true,
        hmr: {
            host: 'localhost', // HMR host for browser connection (Windows + Sail)
        },
        watch: {
            usePolling: true, // Better file watching on Windows
        },
    },
    build: {
        // Production build config (used with 'npm run build')
        outDir: 'public/build',
        manifest: true,
        rollupOptions: {
            input: 'resources/js/app.tsx',
        },
    },
    // Fix for Vite 5: ensure manifest.json is in public/build/ not public/build/.vite/
    experimental: {
        renderBuiltUrl(filename) {
            return '/' + filename;
        },
    },
});
