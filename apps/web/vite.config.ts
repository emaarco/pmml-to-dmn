import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the site works when served from a GitHub Pages sub-path.
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
