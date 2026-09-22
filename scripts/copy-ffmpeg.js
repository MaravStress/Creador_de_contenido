// @ts-check
// Cross-platform script to copy FFmpeg WASM core files from node_modules to public/
import { copyFileSync, existsSync, mkdirSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const srcDir = resolve(root, 'node_modules/@ffmpeg/core/dist/esm');
const destDir = resolve(root, 'public/ffmpeg');

const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm'];

if (!existsSync(srcDir)) {
  console.error(`❌ Source directory not found: ${srcDir}`);
  console.error('   Run "npm install" first.');
  process.exit(1);
}

if (!existsSync(destDir)) {
  mkdirSync(destDir, { recursive: true });
}

for (const file of files) {
  const src = resolve(srcDir, file);
  const dest = resolve(destDir, file);
  try {
    copyFileSync(src, dest);
    const sizeMB = (statSync(dest).size / 1024 / 1024).toFixed(2);
    console.log(`✅ Copied ${file} (${sizeMB} MB)`);
  } catch (err) {
    console.error(`❌ Failed to copy ${file}:`, err.message);
    process.exit(1);
  }
}

console.log('✅ FFmpeg core files copied successfully!');