import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Intelligent base path resolution for GitHub Pages & custom domains
function getBasePath(): string {
  // 1. Explicit override via environment variable (e.g. VITE_BASE_PATH=/my-repo/)
  if (process.env.VITE_BASE_PATH) {
    let p = process.env.VITE_BASE_PATH;
    if (!p.startsWith('/') && !p.startsWith('.')) p = `/${p}`;
    if (!p.endsWith('/')) p = `${p}/`;
    return p;
  }
  // 2. Automatically detected from GitHub Actions GITHUB_REPOSITORY (owner/repo-name)
  if (process.env.GITHUB_REPOSITORY) {
    const parts = process.env.GITHUB_REPOSITORY.split('/');
    const repoName = parts[1];
    // If it's a user/organization site (<user>.github.io), base is '/'
    if (repoName && repoName.toLowerCase().endsWith('.github.io')) {
      return '/';
    }
    // For project sites (https://<user>.github.io/<repo-name>/), base is '/<repo-name>/'
    if (repoName) {
      return `/${repoName}/`;
    }
  }
  // 3. Fallback to relative './' so assets resolve correctly in any folder or domain
  return './';
}

// Vite plugin to ensure 404.html is automatically created from index.html for GitHub Pages SPA support
function githubPagesSpaFallback() {
  return {
    name: 'github-pages-spa-fallback',
    closeBundle() {
      try {
        const distDir = path.resolve(__dirname, 'dist');
        const indexPath = path.join(distDir, 'index.html');
        const fallbackPath = path.join(distDir, '404.html');
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, fallbackPath);
        }
      } catch (err) {
        console.warn('Could not copy 404.html fallback:', err);
      }
    },
  };
}

export default defineConfig(() => {
  return {
    base: getBasePath(),
    plugins: [react(), tailwindcss(), githubPagesSpaFallback()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

