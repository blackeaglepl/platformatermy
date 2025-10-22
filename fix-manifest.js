/**
 * Fix Vite 5 manifest location for Laravel
 *
 * Vite 5 creates manifest.json in public/build/.vite/
 * Laravel expects it in public/build/
 *
 * This script copies manifest.json to the correct location after build.
 */

import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const sourceManifest = 'public/build/.vite/manifest.json';
const targetManifest = 'public/build/manifest.json';

try {
    if (existsSync(sourceManifest)) {
        copyFileSync(sourceManifest, targetManifest);
        console.log('✅ Manifest copied from .vite/ to build/');
        console.log(`   ${sourceManifest} → ${targetManifest}`);
    } else {
        console.error('❌ Source manifest not found:', sourceManifest);
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Error copying manifest:', error.message);
    process.exit(1);
}
