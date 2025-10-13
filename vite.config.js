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
        // Development server config (only used with 'npm run dev')
        host: 'localhost', // Use localhost for Windows compatibility
        port: 5173,
        strictPort: true,
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
});
