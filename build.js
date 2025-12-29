import esbuild from 'esbuild';
import fs from 'fs-extra';
import path from 'path';

// Paths
const outDir = path.resolve('./dist');

// Clean previous build
fs.removeSync(outDir);
fs.mkdirSync(outDir, { recursive: true });

// Bundle single content script
esbuild.buildSync({
  entryPoints: ['./src/engine/entry.js'], // single entry point
  bundle: true,
  outfile: path.join(outDir, 'content.js'), // single output bundle
  minify: false,
  sourcemap: true,
  target: ['chrome109'],
  format: 'iife', // immediately-invoked for browser
});

// Copy background.js
fs.copySync('./src/background.js', path.join(outDir, 'background.js'));

// Copy UI folder
fs.copySync('./src/ui', path.join(outDir, 'ui'));

// Copy manifest.json
fs.copySync('manifest.json', path.join(outDir, 'manifest.json'));

console.log('Build complete. Files are in /dist.');
